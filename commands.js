/**
 * This is the file where the bot commands are located
 *
 * @license MIT license
 */

var http = require('http');
var sys = require('sys');

exports.commands = {
	// Default commands
	about: function(arg, by, room, con) {
		if (this.hasRank(by, '#~') || room.charAt(0) === ',') {
			var text = '';
		} else {
			var text = '/pm ' + by + ', ';
		}
		text += '**Pokémon Showdown Bot** by: Quinella and TalkTakesTime';
		this.say(con, room, text);
	},
	help: 'guide',
	guide: function(arg, by, room, con) {
		if (this.hasRank(by, '+%@&#~') || room.charAt(0) === ',') {
			var text = '';
		} else {
			var text = '/pm ' + by + ', ';
		}
		text += 'A guide on how to use this bot can be found here: http://pastebin.com/W8abpuSS';
		this.say(con, room, text);
	},
	reload: function(arg, by, room, con) {
		if (!this.hasRank(by, '#~')) return false;
		try {
			this.uncacheTree('./commands.js');
			Commands = require('./commands.js').commands;
			this.say(con, room, 'Commands reloaded.');
		} catch (e) {
			error('failed to reload: ' + sys.inspect(e));
		}
	},
	custom: function(arg, by, room, con) {
		if (!this.hasRank(by, '~')) return false;
		// Custom commands can be executed in an arbitrary room using the syntax
		// ".custom [room] command", e.g., to do !data pikachu in the room lobby,
		// the command would be ".custom [lobby] !data pikachu". However, using
		// "[" and "]" in the custom command to be executed can mess this up, so 
		// be careful with them.
		if (arg.indexOf('[') === 0 && arg.indexOf(']') > -1) {
			var tarRoom = arg.slice(1, arg.indexOf(']'));
			arg = arg.substr(arg.indexOf(']') + 1).trim();
		}
		this.say(con, tarRoom || room, arg);
	},

	// Misc commands
	tell: 'say',
	say: function(arg, by, room, con) {
		if (!this.hasRank(by, '#~')) return false;
		this.say(con, room, stripCommands(arg) + ' (' + by + ' said this)');
	},
	joke: function(arg, by, room, con) {
		if (!this.hasRank(by, '#~')) return false;
		var self = this;

		var reqOpt = {
			hostname: 'api.icndb.com',
			path: '/jokes/random',
			method: 'GET'
		};
		var req = http.request(reqOpt, function(res) {
			res.on('data', function(chunk) {
				try {
					var data = JSON.parse(chunk);
					self.say(con, room, data.value.joke);
				} catch (e) {
					self.say(con, room, 'Sorry, couldn\'t fetch a random joke... :(');
				}
			});
		});
		req.end();
	},
	choose: function(arg, by, room, con) {
		if (arg.indexOf(',') === -1) {
			var choices = arg.split(' ');
		} else {
			var choices = arg.split(',');
		}
		var retort = 'Please do not abuse the bot. I do not know how not to be a hypocrite.';
		var botAbuse = new Boolean(0);
		var capsMatch = arg.replace(/[^A-Za-z]/g, '').match(/[A-Z]/g);
		var stretchMatch = msg.toLowerCase().match(/(.)\1{7,}/g);
		if (arg.match(/snen/g) && arg.match(/snen/g).length > 6) {
			this.say(retort);
			botAbuse++;
		else if (capsMatch && toId(arg).length > 18 && (capsMatch.length >= Math.floor(toId(arg).length * 0.8) {
			this.say(retort);
			botAbuse++;
		}
		else if (steretchMatch) {
			this.say(retort);
			botAbuse++
		}
		choices = choices.filter(function(i) {return (toId(i) !== '')});
		if (choices.length < 2) return this.say(con, room, (room.charAt(0) === ',' ? '': '/pm ' + by + ', ') + '.choose: You must give at least 2 valid choices.');
		var choice = choices[Math.floor(Math.random()*choices.length)];
		if (!botAbuse) this.say(con, room, ((this.hasRank(by, '+%@#~') || room.charAt(0) === ',') ? '':'/pm ' + by + ', ') + stripCommands(choice));
	},
	usage: 'usagestats',
	usagestats: function(arg, by, room, con) {
		if (this.hasRank(by, '+%@&#~') || room.charAt(0) === ',') {
			var text = '';
		} else {
			var text = '/pm ' + by + ', ';
		}
		text += 'http://www.smogon.com/forums/threads/official-smogon-university-simulator-statistics-%E2%80%94-february-2014.3501320/';
		this.say(con, room, text);
	},

	/**
	* The following commands are all used for Jeopardy in the Academics room
	* on the Smogon server. Feel free to remove any/all if you so desire.
	*/

	b: 'buzz',
	buzz: function(arg, by, room, con) {
		var opts = arg.split(',');
		switch(toId(opts[0])) {
			case 'on': case 'enable': case 'off': case 'disable':
				if (!this.hasRank(by, '#~')) return false;
				var tarRoom = (opts[1] ? opts[1].trim() : room);
				if (tarRoom.charAt(0) === ',') {
					this.say(con, room, 'You cannot disable or enable the buzzer for PMs.');
					return;
				}
				config.buzz[toId(tarRoom)] = (toId(opts[0]) === 'on' || toId(opts[0]) === 'enable') ? true : false;
				this.say(con, room, 'The buzzer is now ' + (config.buzz[toId(tarRoom)] ? 'enabled' : 'disabled') + ' in ' + tarRoom + '.');
				break;
			default:
				if (this.buzzed || !config.buzz[room] || room.charAt(0) === ',') return false;
				this.say(con, room, '**' + by.substr(1) + ' has buzzed in!**');
				this.buzzed = by;
				var self = this;
				this.buzzer = setTimeout(function(con, room, buzzMessage) {
					self.say(con, room, buzzMessage);
					self.buzzed = '';
				}, 7000, con, room, by + ', your time to answer is up!');
		}
	},
	reset: function(arg, by, room, con) {
		if (!this.hasRank(by, '%@&#~') || !config.buzz[room]) return false;
		clearTimeout(this.buzzer);
		this.buzzed = '';
		this.say(con, room, 'The buzzer has been reset.');
	},
};
