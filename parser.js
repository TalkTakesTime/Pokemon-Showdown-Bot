/**
 * This is the file where commands get parsed
 *
 * Some parts of this code are taken from the Pokémon Showdown server code, so
 * credits also go to Guangcong Luo and other Pokémon Showdown contributors.
 * https://github.com/Zarel/Pokemon-Showdown
 *
 * @license MIT license
 */

var sys = require('sys');
var https = require('https');
var url = require('url');

exports.parse = {
	actionUrl: url.parse('https://play.pokemonshowdown.com/~~' + config.serverid + '/action.php'),
	room: 'lobby',
	chatData: {},
	ranks: {},

	data: function(data, connection) {
		if (data.substr(0, 1) === 'a') {
			data = JSON.parse(data.substr(1));
			if (data instanceof Array) {
				for (var i = 0; i < data.length; i++) {
					this.message(data[i], connection);
				}
			} else {
				this.message(data, connection);
			}
		}
	},
	message: function(message, connection) {
		if (!message) return;

		if (message.indexOf('\n') > -1) {
			var spl = message.split('\n');
			for (var i = 0; i < spl.length; i++) {
				if (spl[i].split('|')[1] && (spl[i].split('|')[1] === 'init' || spl[i].split('|')[1] === 'tournament')) {
					this.room = '';
					break;
				}
				this.message(spl[i], connection);
			}
			return;
		}

		var spl = message.split('|');
		if (!spl[1]) {
			spl = message.split('>');
			if (!spl[1])
				return;
			this.room = spl[1];
		}

		switch (spl[1]) {
			case 'challstr':
				info('received challstr, logging in...');
				var id = spl[2];
				var str = spl[3];

				var requestOptions = {
					hostname: this.actionUrl.hostname,
					port: this.actionUrl.port,
					path: this.actionUrl.pathname,
					agent: false
				};

				if (!config.pass) {
					requestOptions.method = 'GET';
					requestOptions.path += '?act=getassertion&userid=' + toId(config.nick) + '&challengekeyid=' + id + '&challenge=' + str;
				} else {
					requestOptions.method = 'POST';
					var data = 'act=login&name=' + config.nick + '&pass=' + config.pass + '&challengekeyid=' + id + '&challenge=' + str;
					requestOptions.headers = {
						'Content-Type': 'application/x-www-form-urlencoded',
						'Content-Length': data.length
					};
				}

				var req = https.request(requestOptions, function(res) {
					res.setEncoding('utf8');
					var data = '';
					res.on('data', function(chunk) {
						data += chunk;
					});
					res.on('end', function() {
						if (data === ';') {
							error('failed to log in; nick is registered - invalid or no password given');
							process.exit(-1);
						}
						if (data.length < 50) {
							error('failed to log in: ' + data);
							process.exit(-1);
						}

						if (data.indexOf('heavy load') !== -1) {
							error('the login server is under heavy load; trying again in one minute');
							setTimeout(function() {
								this.message(message);
							}.bind(this), 60000);
							return;
						}

						try {
							data = JSON.parse(data.substr(1));
							if (data.actionsuccess) {
								data = data.assertion;
							} else {
								error('could not log in; action was not successful: ' + JSON.stringify(data));
								process.exit(-1);
							}
						} catch (e) {}
						send(connection, '|/trn ' + config.nick + ',0,' + data);
					}.bind(this));
				}.bind(this));
				
				req.on('error', function(err) {
					error('login error: ' + sys.inspect(err));
				});
				
				if (data) {
					req.write(data);
				}
				req.end();
				break;
			case 'updateuser':
				if (spl[2] !== config.nick) {
					return;
				}

				if (spl[3] !== '1') {
					error('failed to log in, still guest');
					process.exit(-1);
				}

				ok('logged in as ' + spl[2]);

				// Now join the rooms
				var cmds = ['/idle'];
				for (var i in config.rooms) {
					var room = config.rooms[i].toLowerCase();
					if (room === 'lobby' && config.serverid === 'showdown') {
						continue;
					}
					cmds.push('|/join ' + room);
				}

				var self = this;
				if (cmds.length > 6) {
					self.nextJoin = 0;
					self.joinSpacer = setInterval(function(con, cmds) {
						if (cmds.length > self.nextJoin + 5) {
							send(con, cmds.slice(self.nextJoin, self.nextJoin + 5));
							self.nextJoin += 5;
						} else {
							send(con, cmds.slice(self.nextJoin));
							delete self.nextJoin;
							clearInterval(self.joinSpacer);
						}
					}, 8*1000, connection, cmds);
				} else {
					send(connection, cmds);
				}

				this.chatDataTimer = setInterval(
					function() {self.chatData = cleanChatData(self.chatData);},
					30*60*1000
				);
				this.room = '';
				break;
			case 'title':
				ok('joined ' + spl[2]);
				this.room = '';
				break;
			case 'c':
				var by = spl[2];
				spl.splice(0, 3);
				this.chatMessage(spl.join('|'), by, this.room || 'lobby', connection);
				this.processChatData(by, this.room || 'lobby', connection, spl.join('|'));
				this.room = '';
				break;
			case 'pm':
				var by = spl[2];
				if (by.substr(1) === config.nick) return;
				spl.splice(0, 4);
				this.chatMessage(spl.join('|'), by, ',' + by, connection);
				this.room = '';
				break;
			case 'N': case 'J': case 'j':
				var by = spl[2];
				if (by.substr(1) !== config.nick || ' +%@&#~'.indexOf(by.charAt(0)) === -1) return;
				this.ranks[(this.room === ''?'lobby':this.room)] = by.charAt(0);
				this.room = '';
				break;
		}
	},
	chatMessage: function(message, by, room, connection) {
		message = message.trim();
		if (message.substr(0, config.commandcharacter.length) !== config.commandcharacter || toId(by) === toId(config.nick)) {
			return;
		}

		message = message.substr(config.commandcharacter.length);
		var index = message.indexOf(' ');
		var arg = '';
		if (index > -1) {
			var cmd = message.substr(0, index);
			arg = message.substr(index + 1).trim();
		} else {
			var cmd = message;
		}

		if (Commands[cmd]) {
			var failsafe = 0;
			while (typeof Commands[cmd] !== "function" && failsafe++ < 10) {
				cmd = Commands[cmd];
			}
			if (typeof Commands[cmd] === "function") {
				Commands[cmd].call(this, arg, by, room, connection);
			} else {
				error("invalid command type for " + cmd + ": " + (typeof Commands[cmd]));
			}
		}
	},
	say: function(connection, room, text) {
		if (room.substr(0, 1) !== ',') {
			var str = (room !== 'lobby' ? room : '') + '|' + text;
			send(connection, str);
		} else {
			room = room.substr(1);
			var str = '|/pm ' + room + ', ' + text;
			send(connection, str);
		}
	},
	hasRank: function(user, rank) {
		var hasRank = (rank.split('').indexOf(user.charAt(0)) !== -1) || (config.excepts.indexOf(toId(user.substr(1))) !== -1);
		return hasRank;
	},
	processChatData: function(user, room, connection, msg) {
		// NOTE: this is still in early stages
		user = toId(user);
		if (room.charAt(0) === ',' || user === toId(config.nick)) return;
		room = toId(room);
		msg = msg.trim().replace(/ +/g, " ");
		if (!this.chatData[user]) this.chatData[user] = {zeroTol:0};
		if (!this.chatData[user][room]) this.chatData[user][room] = {times:[], points:0, lastAction:0};

		this.chatData[user][room].times.push(Date.now());

		// this deals with punishing rulebreakers, but note that the bot can't think, so it might make mistakes
		if (config.allowmute && this.hasRank(this.ranks[room] || ' ', '%@&#~')) {
			var pointVal = 0;
			var muteMessage = '';

			if (msg.match(/snen/g) && msg.match(/snen/g).length > 6) {
				if (pointVal < 4) {
					muteMessage = ', Automated response: possible "snen" spammer';
					pointVal = (room === 'lobby') ? 5 : 4;
				}
			}
			if (this.chatData[user][room].times.length >= 5 && (Date.now() - this.chatData[user][room].times[this.chatData[user][room].times.length - 5]) < 6*1000) {
				if (pointVal < 1) {
					pointVal = 1;
					muteMessage = ', Automated response: flooding';
				}
			}
			if (this.chatData[user][room].times.length >= 8 && (Date.now() - this.chatData[user][room].times[this.chatData[user][room].times.length - 5]) < 6*1000) {
				if (pointVal < 2) {
					pointVal = 2;
					muteMessage = ', Automated response: flooding';
				}
			}
			var capsMatch = msg.replace(/[^A-Za-z]/g, '').match(/[A-Z]/g);
			if (capsMatch && toId(msg).length > 18 && (capsMatch.length >= Math.floor(toId(msg).length * 0.8))) {
				if (pointVal < 1) {
					pointVal = 1;
					muteMessage = ', Automated response: caps';
				}
			}
			var stretchMatch = msg.toLowerCase().match(/(.)\1{7,}/g); // matches the same character 8 or more times in a row
			if (stretchMatch) {
				if (pointVal < 1) {
					pointVal = 1;
					muteMessage = ', Automated response: stretching';
				}
			}

			if (pointVal > 0 && !(Date.now() - this.chatData[user][room].lastAction < 3*1000)) {
				var cmd = 'mute';
				if (this.chatData[user][room].points >= pointVal && pointVal < 4) {
					this.chatData[user][room].points++;
					cmd = config.punishvals[this.chatData[user][room].points] || cmd;
				} else {
					cmd = config.punishvals[pointVal] || cmd;
					this.chatData[user][room].points = pointVal;
				}
				if (this.chatData[user][room].points >= 4 && !this.hasRank(this.ranks[room] || ' ', '@&#~')) cmd = 'hourmute';
				if (this.chatData[user].zeroTol > 4) {
					muteMessage = ', Automated response: zero tolerance user';
					cmd = this.hasRank(this.ranks[room] || ' ', '@&#~') ? 'roomban' : 'hourmute';
				}
				if (this.chatData[user][room].points >= 2) this.chatData[user].zeroTol++;
				this.chatData[user][room].lastAction = Date.now();
				this.say(connection, room, '/' + cmd + ' ' + user + muteMessage);
			}
		}
	},
	uncacheTree: function(root) {
		var uncache = [require.resolve(root)];
		do {
			var newuncache = [];
			for (var i = 0; i < uncache.length; ++i) {
				if (require.cache[uncache[i]]) {
					newuncache.push.apply(newuncache,
						require.cache[uncache[i]].children.map(function(module) {
							return module.filename;
						})
					);
					delete require.cache[uncache[i]];
				}
			}
			uncache = newuncache;
		} while (uncache.length > 0);
	}
};
