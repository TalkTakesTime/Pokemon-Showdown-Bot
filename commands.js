/**
 * This is the file where the bot commands are located
 *
 * @license MIT license
 */

var http = require('http');
var sys = require('sys');

exports.commands = {
	/**
	 * Help commands
	 *
	 * These commands are here to provide information about the bot.
	 */

	/*about: function(arg, by, room, con) {
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
		if (this.hasRank(by, '#~') || room.charAt(0) === ',') {
			var text = '';
		} else {
			var text = '/pm ' + by + ', ';
		}
		if (config.botguide) {
			text += 'A guide on how to use this bot can be found here: ' + config.botguide;
		} else {
			text += 'There is no guide for this bot. PM the owner with any questions.';
		}
		this.say(con, room, text);
	},*/

	/**
	 * Dev commands
	 *
	 * These commands are here for highly ranked users (or the creator) to use
	 * to perform arbitrary actions that can't be done through any other commands
	 * or to help with upkeep of the bot.
	 */

	reload: function(arg, by, room, con) {
		if (config.excepts.indexOf(toId(by)) === -1) return false;
		try {
			this.uncacheTree('./commands.js');
			Commands = require('./commands.js').commands;
			this.say(con, room, 'Commands reloaded.');
		} catch (e) {
			error('failed to reload: ' + sys.inspect(e));
		}
	},
	reloaddata: function(arg, by, room, con) {
		if (config.excepts.indexOf(toId(by)) === -1) return false;
		this.say(con, room, 'Reloading data files...');
		var https = require('https');
		var datenow = Date.now();
		var formats = fs.createWriteStream("formats.js");
		https.get("https://play.pokemonshowdown.com/data/formats.js?" + datenow, function(res) {
			res.pipe(formats);
		});
		var formatsdata = fs.createWriteStream("formats-data.js");
		https.get("https://play.pokemonshowdown.com/data/formats-data.js?" + datenow, function(res) {
			res.pipe(formatsdata);
		});
		var pokedex = fs.createWriteStream("pokedex.js");
		https.get("https://play.pokemonshowdown.com/data/pokedex.js?" + datenow, function(res) {
			res.pipe(pokedex);
		});
		var moves = fs.createWriteStream("moves.js");
		https.get("https://play.pokemonshowdown.com/data/moves.js?" + datenow, function(res) {
			res.pipe(moves);
		});
		var abilities = fs.createWriteStream("abilities.js");
		https.get("https://play.pokemonshowdown.com/data/abilities.js?" + datenow, function(res) {
			res.pipe(abilities);
		});
		var learnsets = fs.createWriteStream("learnsets-g6.js");
		https.get("https://play.pokemonshowdown.com/data/learnsets-g6.js?" + datenow, function(res) {
			res.pipe(learnsets);
		});
		var aliases = fs.createWriteStream("aliases.js");
		https.get("https://play.pokemonshowdown.com/data/aliases.js?" + datenow, function(res) {
			res.pipe(aliases);
		});
		this.say(con, room, 'Data files reloaded');
	},
	custom: function(arg, by, room, con) {
		if (config.excepts.indexOf(toId(by)) === -1) return false;
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
	/*js: function(arg, by, room, con) {
		if (config.excepts.indexOf(toId(by)) === -1) return false;
		try {
			var result = eval(arg.trim());
			this.say(con, room, JSON.stringify(result));
		} catch (e) {
			this.say(con, room, e.name + ": " + e.message);
		}
	},*/

	/**
	 * Room Owner commands
	 *
	 * These commands allow room owners to personalise settings for moderation and command use.
	 */

	settings: 'set',
	set: function(arg, by, room, con) {
		if (!this.hasRank(by, '~') || room.charAt(0) === ',') return false;

		var settable = {
			randompoke: 1,
			randomteam: 1,
			numberdex: 1,
			tier: 1,
			gen: 1,
			vgc: 1,
			heavyslam: 1,
			weight: 1,
			height: 1,
			priority: 1,
			contact: 1,
			viablemoves: 1,
			trad: 1,
			dexsearch: 1,
			stat: 1,
			informations: 1
		};
		var modOpts = {
			flooding: 1,
			caps: 1,
			stretching: 1,
			bannedwords: 1,
			snen: 1
		};

		var opts = arg.split(',');
		var cmd = toId(opts[0]);
		if (cmd === 'mod' || cmd === 'm' || cmd === 'modding') {
			if (!opts[1] || !toId(opts[1]) || !(toId(opts[1]) in modOpts)) return this.say(con, room, 'Incorrect command: correct syntax is .set mod, [' +
				Object.keys(modOpts).join('/') + '](, [on/off])');

			if (!this.settings['modding']) this.settings['modding'] = {};
			if (!this.settings['modding'][room]) this.settings['modding'][room] = {};
			if (opts[2] && toId(opts[2])) {
				if (!this.hasRank(by, '#~')) return false;
				if (!(toId(opts[2]) in {on: 1, off: 1}))  return this.say(con, room, 'Incorrect command: correct syntax is .set mod, [' +
					Object.keys(modOpts).join('/') + '](, [on/off])');
				if (toId(opts[2]) === 'off') {
					this.settings['modding'][room][toId(opts[1])] = 0;
				} else {
					delete this.settings['modding'][room][toId(opts[1])];
				}
				this.writeSettings();
				this.say(con, room, 'Moderation for ' + toId(opts[1]) + ' in this room is now ' + toId(opts[2]).toUpperCase() + '.');
				return;
			} else {
				this.say(con, room, 'Moderation for ' + toId(opts[1]) + ' in this room is currently ' +
					(this.settings['modding'][room][toId(opts[1])] === 0 ? 'OFF' : 'ON') + '.');
				return;
			}
		} else {
			if (!Commands[cmd]) return this.say(con, room, '.' + opts[0] + ' is not a valid command.');
			var failsafe = 0;
			while (!(cmd in settable)) {
				if (typeof Commands[cmd] === 'string') {
					cmd = Commands[cmd];
				} else if (typeof Commands[cmd] === 'function') {
					if (cmd in settable) {
						break;
					} else {
						this.say(con, room, 'The settings for .' + opts[0] + ' cannot be changed.');
						return;
					}
				} else {
					this.say(con, room, 'Something went wrong. PM TalkTakesTime here or on Smogon with the command you tried.');
					return;
				}
				failsafe++;
				if (failsafe > 5) {
					this.say(con, room, 'The command ".' + opts[0] + '" could not be found.');
					return;
				}
			}

			var settingsLevels = {
				off: false,
				disable: false,
				'+': '+',
				'%': '%',
				'@': '@',
				'&': '&',
				'#': '#',
				'~': '~',
				on: true,
				enable: true
			};
			if (!opts[1] || !opts[1].trim()) {
				var msg = '';
				if (!this.settings[cmd] || (!this.settings[cmd][room] && this.settings[cmd][room] !== false)) {
					msg = '.' + cmd + ' is available for users of rank ' + (cmd === 'autoban' ? '#' : config.defaultrank) + ' and above.';
				} else if (this.settings[cmd][room] in settingsLevels) {
					msg = '.' + cmd + ' is available for users of rank ' + this.settings[cmd][room] + ' and above.';
				} else if (this.settings[cmd][room] === true) {
					msg = '.' + cmd + ' is available for all users in this room.';
				} else if (this.settings[cmd][room] === false) {
					msg = '.' + cmd + ' is not available for use in this room.';
				}
				this.say(con, room, msg);
				return;
			} else {
				if (!this.hasRank(by, '#~')) return false;
				var newRank = opts[1].trim();
				if (!(newRank in settingsLevels)) return this.say(con, room, 'Unknown option: "' + newRank + '". Valid settings are: off/disable, +, %, @, &, #, ~, on/enable.');
				if (!this.settings[cmd]) this.settings[cmd] = {};
				this.settings[cmd][room] = settingsLevels[newRank];
				this.writeSettings();
				this.say(con, room, 'The command .' + cmd + ' is now ' +
					(settingsLevels[newRank] === newRank ? ' available for users of rank ' + newRank + ' and above.' :
					(this.settings[cmd][room] ? 'available for all users in this room.' : 'unavailable for use in this room.')))
			}
		}
	},
	/*blacklist: 'autoban',
	ban: 'autoban',
	ab: 'autoban',
	autoban: function(arg, by, room, con) {
		if (!this.canUse('autoban', room, by) || room.charAt(0) === ',') return false;
		if (!this.hasRank(this.ranks[toId(room)] || ' ', '@&#~')) return this.say(con, room, config.nick + ' requires rank of @ or higher to (un)blacklist.');

		arg = arg.split(',');
		var added = [];
		var illegalNick = [];
		var alreadyAdded = [];
		if (!arg.length || (arg.length === 1 && !arg[0].trim().length)) return this.say(con, room, 'You must specify at least one user to blacklist.');
		for (var i = 0; i < arg.length; i++) {
			var tarUser = toId(arg[i]);
			if (tarUser.length < 1 || tarUser.length > 18) {
				illegalNick.push(tarUser);
				continue;
			}
			if (!this.blacklistUser(tarUser, room)) {
				alreadyAdded.push(tarUser);
				continue;
			}
			this.say(con, room, '/roomban ' + tarUser + ', Blacklisted user');
			added.push(tarUser);
		}

		var text = '';
		if (added.length) {
			text += 'User(s) "' + added.join('", "') + '" added to blacklist successfully. ';
			this.writeSettings();
		}
		if (alreadyAdded.length) text += 'User(s) "' + alreadyAdded.join('", "') + '" already present in blacklist. ';
		if (illegalNick.length) text += 'All ' + (text.length ? 'other ' : '') + 'users had illegal nicks and were not blacklisted.';
		this.say(con, room, text);
	},
	unblacklist: 'unautoban',
	unban: 'unautoban',
	unab: 'unautoban',
	unautoban: function(arg, by, room, con) {
		if (!this.canUse('autoban', room, by) || room.charAt(0) === ',') return false;
		if (!this.hasRank(this.ranks[toId(room)] || ' ', '@&#~')) return this.say(con, room, config.nick + ' requires rank of @ or higher to (un)blacklist.');

		arg = arg.split(',');
		var removed = [];
		var notRemoved = [];
		if (!arg.length || (arg.length === 1 && !arg[0].trim().length)) return this.say(con, room, 'You must specify at least one user to unblacklist.');
		for (var i = 0; i < arg.length; i++) {
			var tarUser = toId(arg[i]);
			if (tarUser.length < 1 || tarUser.length > 18) {
				notRemoved.push(tarUser);
				continue;
			}
			if (!this.unblacklistUser(tarUser, room)) {
				notRemoved.push(tarUser);
				continue;
			}
			this.say(con, room, '/roomunban ' + tarUser);
			removed.push(tarUser);
		}

		var text = '';
		if (removed.length) {
			text += 'User(s) "' + removed.join('", "') + '" removed from blacklist successfully. ';
			this.writeSettings();
		}
		if (notRemoved.length) text += (text.length ? 'No other ' : 'No ') + 'specified users were present in the blacklist.';
		this.say(con, room, text);
	},
	viewbans: 'viewblacklist',
	vab: 'viewblacklist',
	viewautobans: 'viewblacklist',
	viewblacklist: function(arg, by, room, con) {
		if (!this.canUse('bl', room, by) || room.charAt(0) === ',') return false;

		var text = '';
		if (!this.settings.blacklist || !this.settings.blacklist[room]) {
			text = 'No users are blacklisted in this room.';
		} else {
			var nickList = Object.keys(this.settings.blacklist[room]);
			text = 'The following users are blacklisted: ' + nickList.join(', ');
			if (text.length > 300) text = 'Too many users to list.';
			if (!nickList.length) text = 'No users are blacklisted in this room.';
		}
		this.say(con, room, '/pm ' + by + ', ' + text);
	},
	banword: function(arg, by, room, con) {
		if (!this.hasRank(by, '~')) return false;

		if (!this.settings['bannedwords']) this.settings['bannedwords'] = {};
		this.settings['bannedwords'][arg.trim().toLowerCase()] = 1;
		this.writeSettings();
		this.say(con, room, 'Word "' + arg.trim().toLowerCase() + '" banned.');
	},
	unbanword: function(arg, by, room, con) {
		if (!this.hasRank(by, '~')) return false;

		if (!this.settings['bannedwords']) this.settings['bannedwords'] = {};
		delete this.settings['bannedwords'][arg.trim().toLowerCase()];
		this.writeSettings();
		this.say(con, room, 'Word "' + arg.trim().toLowerCase() + '" unbanned.');
	},*/

	/**
	 * General commands
	 *
	 * Add custom commands here.
	 */

	/*tell: 'say',
	say: function(arg, by, room, con) {
		if (!this.canUse('say', room, by)) return false;
		this.say(con, room, stripCommands(arg) + ' (' + by + ' said this)');
	},
	joke: function(arg, by, room, con) {
		if (!this.canUse('joke', room, by)) return false;
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
		choices = choices.filter(function(i) {return (toId(i) !== '')});
		if (choices.length < 2) return this.say(con, room, (room.charAt(0) === ',' ? '': '/pm ' + by + ', ') + '.choose: You must give at least 2 valid choices.');
		var choice = choices[Math.floor(Math.random()*choices.length)];
		this.say(con, room, ((this.canUse('choose', room, by) || room.charAt(0) === ',') ? '':'/pm ' + by + ', ') + stripCommands(choice));
	},
	usage: 'usagestats',
	usagestats: function(arg, by, room, con) {
		if (this.canUse('usagestats', room, by) || room.charAt(0) === ',') {
			var text = '';
		} else {
			var text = '/pm ' + by + ', ';
		}
		text += 'http://sim.smogon.com:8080/Stats/2014-04/';
		this.say(con, room, text);
	},
	seen: function(arg, by, room, con) {
		var text = (room.charAt(0) === ',' ? '' : '/pm ' + by + ', ');
		if (toId(arg) === toId(by)) {
			text += 'Have you looked in the mirror lately?';
		} else if (toId(arg) === toId(config.nick)) {
			text += 'You might be either blind or illiterate. Might want to get that checked out.';
		} else if (!this.chatData[toId(arg)] || !this.chatData[toId(arg)].lastSeen) {
			text += 'The user ' + arg.trim() + ' has never been seen.';
		} else {
			text += arg.trim() + ' was last seen ' + this.getTimeAgo(this.chatData[toId(arg)].seenAt) + ' ago, ' + this.chatData[toId(arg)].lastSeen;
		}
		this.say(con, room, text);
	},
	helix: function(arg, by, room, con) {
		if (this.canUse('helix', room, by) || room.charAt(0) === ',') {
			var text = '';
		} else {
			var text = '/pm ' + by + ', ';
		}

		var rand = Math.floor(20 * Math.random()) + 1;

		switch (rand) {
	 		case 1: text += "Signs point to yes."; break;
	  		case 2: text += "Yes."; break;
			case 3: text += "Reply hazy, try again."; break;
			case 4: text += "Without a doubt."; break;
			case 5: text += "My sources say no."; break;
			case 6: text += "As I see it, yes."; break;
			case 7: text += "You may rely on it."; break;
			case 8: text += "Concentrate and ask again."; break;
			case 9: text += "Outlook not so good."; break;
			case 10: text += "It is decidedly so."; break;
			case 11: text += "Better not tell you now."; break;
			case 12: text += "Very doubtful."; break;
			case 13: text += "Yes - definitely."; break;
			case 14: text += "It is certain."; break;
			case 15: text += "Cannot predict now."; break;
			case 16: text += "Most likely."; break;
			case 17: text += "Ask again later."; break;
			case 18: text += "My reply is no."; break;
			case 19: text += "Outlook good."; break;
			case 20: text += "Don't count on it."; break;
		}
		this.say(con, room, text);
	},*/
	randompike: 'randompoke',
	randompokemon: 'randompoke',
	randompoke: function(arg, by, room, con) {
		if (this.canUse('randompoke', room, by) || room.charAt(0) === ',') {
			var text = '';
		} else {
			return this.say(con, room, '/pm ' + by + ', Scrivimi il comando in PM.');
		}
		try {
			var pokedex = require('./pokedex.js').BattlePokedex;
			var formatsdata = require('./formats-data.js').BattleFormatsData;
		} catch (e) {
			return this.say(con, room, 'Si è verificato un errore: riprova fra qualche secondo.');
		}
		var pokemon = [];
		var extractedmon = '';
		var tiers = ['uber', 'ou', 'uu', 'ru', 'nu', 'lc', ''];
		if (tiers.indexOf(arg) == -1) return this.say(con, room, 'Tier non trovata');
		for (var i in formatsdata) {
			if (formatsdata[i].tier) {
				if (arg != '') {
					if (formatsdata[i].tier.toLowerCase() == arg) {
						pokemon.push(pokedex[i].species);
					}
				}
				else {
					if (formatsdata[i].tier != 'Unreleased' && formatsdata[i].tier != '' && formatsdata[i].tier != 'CAP') {
						pokemon.push(pokedex[i].species);
					}
				}
			}
		}
		extractedmon = pokemon[Math.floor(Math.random()*pokemon.length)];
		text += extractedmon;
		this.say(con, room, text);
	},
	randomteam: function(arg, by, room, con) {
		if (this.canUse('randomteam', room, by) || room.charAt(0) === ',') {
			var text = '';
		} else {
			return this.say(con, room, '/pm ' + by + ', Scrivimi il comando in PM.');
		}
		try {
			var pokedex = require('./pokedex.js').BattlePokedex;
			var formatsdata = require('./formats-data.js').BattleFormatsData;
		} catch (e) {
			return this.say(con, room, 'Si è verificato un errore: riprova fra qualche secondo.');
		}
		var pokemon = [];
		var extractedmon = '';
		var tiers = ['uber', 'ou', 'uu', 'ru', 'nu', 'lc', ''];
		if (tiers.indexOf(arg) == -1) return this.say(con, room, 'Tier non trovata');
		var checkTiers = false;
		for (var i in formatsdata) {
			if (formatsdata[i].tier) {
				if (arg != '') {
					if (arg == 'uber') checkTiers = formatsdata[i].tier.toLowerCase() == 'uber';
					else if (arg == 'ou') checkTiers = formatsdata[i].tier.toLowerCase() == 'ou' || formatsdata[i].tier.toLowerCase() == 'bl';
					else if (arg == 'uu') checkTiers = formatsdata[i].tier.toLowerCase() == 'uu' || formatsdata[i].tier.toLowerCase() == 'bl2';
					else if (arg == 'ru') checkTiers = formatsdata[i].tier.toLowerCase() == 'ru' || formatsdata[i].tier.toLowerCase() == 'bl3';
					else if (arg == 'nu') checkTiers = formatsdata[i].tier.toLowerCase() == 'nu';
					else if (arg == 'lc') checkTiers = formatsdata[i].tier.toLowerCase() == 'lc';
					if (checkTiers) {
						pokemon.push(pokedex[i].species);
					}
				}
				else {
					if (formatsdata[i].tier != 'Unreleased' && formatsdata[i].tier != '' && formatsdata[i].tier != 'CAP') {
						pokemon.push(pokedex[i].species);
					}
				}
			}
		}
		var arrayextracted = new Array();
		for (var i = 1; i <= 6; i++) {
			extractedmon = pokemon[Math.floor(Math.random()*pokemon.length)];
			if (arrayextracted.indexOf(extractedmon) === -1) {
				arrayextracted[i-1] = extractedmon;
				text += extractedmon;
				if (i != 6) text += ', ';
			}
			else {
				i--;
			}
		}
		this.say(con, room, text);
	},
	dexnumber: 'numberdex',
	numberdex: function(arg, by, room, con) {
		if (this.canUse('numberdex', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			return this.say(con, room, '/pm ' + by + ', Scrivimi il comando in PM.');
		}
		try {
			var pokedex = require('./pokedex.js').BattlePokedex;
			var aliases = require('./aliases.js').BattleAliases;
		} catch (e) {
			return this.say(con, room, 'Si è verificato un errore: riprova fra qualche secondo.');
		}
		var pokemon = arg.toLowerCase().replace(/[^a-zA-Z0-9]/g,"");
		if (aliases[pokemon]) pokemon = aliases[pokemon].toLowerCase().replace(/[^a-zA-Z0-9]/g,"");
		for (var i in pokedex) {
			if (pokedex[i].num) {
				if (pokedex[i].num == arg) {
					text += pokedex[i].species;
					break;
				}
			}
		}
		if (text == '') text = 'Pokémon non trovato';
		this.say(con, room, text);
	},
	gen: function(arg, by, room, con) {
		if (this.canUse('gen', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			return this.say(con, room, '/pm ' + by + ', Scrivimi il comando in PM.');
		}
		try {
			var pokedex = require('./pokedex.js').BattlePokedex;
			var aliases = require('./aliases.js').BattleAliases;
		} catch (e) {
			return this.say(con, room, 'Si è verificato un errore: riprova fra qualche secondo.');
		}
		var pokemon = arg.toLowerCase().replace(/[^a-zA-Z0-9]/g,"");
		if (aliases[pokemon]) pokemon = aliases[pokemon].toLowerCase().replace(/[^a-zA-Z0-9]/g,"");
		if (pokedex[pokemon]) {
			if (pokedex[pokemon].num < 0) text += 'CAP';
			else if (pokedex[pokemon].num <= 151) text += 'Gen 1';
			else if (pokedex[pokemon].num <= 251) text += 'Gen 2';
			else if (pokedex[pokemon].num <= 386) text += 'Gen 3';
			else if (pokedex[pokemon].num <= 493) text += 'Gen 4';
			else if (pokedex[pokemon].num <= 649) text += 'Gen 5';
			else text += 'Gen 6';
		}
		else text 
		this.say(con, room, text);
	},
	tier: function(arg, by, room, con) {
		if (this.canUse('tier', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			return this.say(con, room, '/pm ' + by + ', Scrivimi il comando in PM.');
		}
		try {
			var formatsdata = require('./formats-data.js').BattleFormatsData;
			var aliases = require('./aliases.js').BattleAliases;
		} catch (e) {
			return this.say(con, room, 'Si è verificato un errore: riprova fra qualche secondo.');
		}
		var pokemon = arg.toLowerCase().replace(/[^a-zA-Z0-9]/g,"");
		if (aliases[pokemon]) pokemon = aliases[pokemon].toLowerCase().replace(/[^a-zA-Z0-9]/g,"");
		if (formatsdata[pokemon]) {
			text += formatsdata[pokemon].tier;
		}
		else {
			text += "Pokémon non trovato";
		}
		this.say(con, room, text);
	},
	kalosdex: 'vgc',
	vgc: function(arg, by, room, con) {
		if (this.canUse('vgc', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			return this.say(con, room, '/pm ' + by + ', Scrivimi il comando in PM.');
		}
		try {
			var formats = require('./formats.js').BattleFormats;
			var pokedex = require('./pokedex.js').BattlePokedex;
			var aliases = require('./aliases.js').BattleAliases;
		} catch (e) {
			return this.say(con, room, 'Si è verificato un errore: riprova fra qualche secondo.');
		}
		var pokemon = arg.toLowerCase().replace(/[^a-zA-Z0-9]/g,"");
		if (aliases[pokemon]) pokemon = aliases[pokemon].toLowerCase().replace(/[^a-zA-Z0-9]/g,"");
		if (pokedex[pokemon]) {
			pokemon = {species:pokedex[pokemon].species};
			var text = formats.kalospokedex.validateSet(pokemon);
			if (text == undefined) text = pokemon.species + ' è nel Pokédex di Kalos';
			else text = pokemon.species + ' non è nel Pokédex di Kalos';
		}
		else {
			text += "Pokémon non trovato";
		}
		this.say(con, room, text);
	},
	evos: 'evo',
	evo: function(arg, by, room, con) {
		if (this.canUse('evo', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			return this.say(con, room, '/pm ' + by + ', Scrivimi il comando in PM.');
		}
		try {
			var pokedex = require('./pokedex.js').BattlePokedex;
			var aliases = require('./aliases.js').BattleAliases;
		} catch (e) {
			return this.say(con, room, 'Si è verificato un errore: riprova fra qualche secondo.');
		}
		var pokemon = arg.toLowerCase().replace(/[^a-zA-Z0-9]/g,"");
		if (aliases[pokemon]) pokemon = aliases[pokemon].toLowerCase().replace(/[^a-zA-Z0-9]/g,"");
		if (pokedex[pokemon]) {
			if (pokedex[pokemon].evos) {
				for (var i in pokedex[pokemon].evos) {
					text += ', ' + pokedex[pokemon].evos[i];
				}
				text = text.substring(2);
			}
			else text += pokemon + ' non si evolve';
		}
		else text += "Pokémon non trovato";
		this.say(con, room, text);
	},
	preevo: 'prevo',
	prevo: function(arg, by, room, con) {
		if (this.canUse('evo', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			return this.say(con, room, '/pm ' + by + ', Scrivimi il comando in PM.');
		}
		try {
			var pokedex = require('./pokedex.js').BattlePokedex;
			var aliases = require('./aliases.js').BattleAliases;
		} catch (e) {
			return this.say(con, room, 'Si è verificato un errore: riprova fra qualche secondo.');
		}
		var pokemon = arg.toLowerCase().replace(/[^a-zA-Z0-9]/g,"");
		if (aliases[pokemon]) pokemon = aliases[pokemon].toLowerCase().replace(/[^a-zA-Z0-9]/g,"");
		if (pokedex[pokemon]) {
			if (pokedex[pokemon].prevo) {
				text += pokedex[pokemon].prevo;
			}
			else text += pokemon + ' non ha una pre-evoluzione';
		}
		else text += "Pokémon non trovato";
		this.say(con, room, text);
	},
	heatcrash: 'heavyslam',
	heavyslam: function(arg, by, room, con) {
		if (this.canUse('heavyslam', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			return this.say(con, room, '/pm ' + by + ', Scrivimi il comando in PM.');
		}
		try {
			var pokedex = require('./pokedex.js').BattlePokedex;
			var aliases = require('./aliases.js').BattleAliases;
		} catch (e) {
			return this.say(con, room, 'Si è verificato un errore: riprova fra qualche secondo.');
		}
		var pokemon = arg.toLowerCase().replace(/[^a-zA-Z0-9,]/g,"").split(',');
		if (aliases[pokemon[0]]) pokemon[0] = aliases[pokemon[0]].toLowerCase().replace(/[^a-zA-Z0-9]/g,"");
		if (aliases[pokemon[1]]) pokemon[1] = aliases[pokemon[1]].toLowerCase().replace(/[^a-zA-Z0-9]/g,"");
		if (pokedex[pokemon[0]]) var weight0 = pokedex[pokemon[0]].weightkg;
		else return this.say(con, room, "Pokémon attaccante non trovato");
		if (pokedex[pokemon[1]]) var weight1 = pokedex[pokemon[1]].weightkg;
		else return this.say(con, room, "Pokémon difensore non trovato");
		
		text += "Heavy slam/Heat crash base power: ";
		if (weight0 / weight1 <= 2) text += "40";
		else if (weight0 / weight1 <= 3) text += "60";
		else if (weight0 / weight1 <= 4) text += "80";
		else if (weight0 / weight1 <= 5) text += "100";
		else text += "120";
		this.say(con, room, text);
	},
	weight: function(arg, by, room, con) {
		if (this.canUse('weight', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			return this.say(con, room, '/pm ' + by + ', Scrivimi il comando in PM.');
		}
		try {
			var pokedex = require('./pokedex.js').BattlePokedex;
			var aliases = require('./aliases.js').BattleAliases;
		} catch (e) {
			return this.say(con, room, 'Si è verificato un errore: riprova fra qualche secondo.');
		}
		var pokemon = arg.toLowerCase().replace(/[^a-zA-Z0-9]/g,"");
		if (aliases[pokemon]) pokemon = aliases[pokemon].toLowerCase().replace(/[^a-zA-Z0-9]/g,"");
		if (pokedex[pokemon]) {
			text += pokedex[pokemon].weightkg + " kg. Grass knot/Low kick base power: ";
			if (pokedex[pokemon].weightkg <= 10) text += "20";
			else if (pokedex[pokemon].weightkg <= 25) text += "40";
			else if (pokedex[pokemon].weightkg <= 50) text += "60";
			else if (pokedex[pokemon].weightkg <= 100) text += "80";
			else if (pokedex[pokemon].weightkg <= 200) text += "100";
			else text += "120";
		}
		else {
			text += "Pokémon non trovato";
		}
		this.say(con, room, text);
	},
	height: function(arg, by, room, con) {
		if (this.canUse('height', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			return this.say(con, room, '/pm ' + by + ', Scrivimi il comando in PM.');
		}
		try {
			var pokedex = require('./pokedex.js').BattlePokedex;
			var aliases = require('./aliases.js').BattleAliases;
		} catch (e) {
			return this.say(con, room, 'Si è verificato un errore: riprova fra qualche secondo.');
		}
		var pokemon = arg.toLowerCase().replace(/[^a-zA-Z0-9]/g,"");
		if (aliases[pokemon]) pokemon = aliases[pokemon].toLowerCase().replace(/[^a-zA-Z0-9]/g,"");
		if (pokemon.substring(0,4) == "mega") {
			pokemon = pokemon.substring(4).replace(/[^a-zA-Z0-9]/g,"") + "mega";
		}
		if (pokedex[pokemon]) {
			text += pokedex[pokemon].heightm + " m.";
		}
		else {
			text += "Pokémon non trovato";
		}
		this.say(con, room, text);
	},
	priority: function(arg, by, room, con) {
		if (this.canUse('priority', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			return this.say(con, room, '/pm ' + by + ', Scrivimi il comando in PM.');
		}
		try {
			var pokedex = require('./pokedex.js').BattlePokedex;
			var movedex = require('./moves.js').BattleMovedex;
			var learnsets = require('./learnsets-g6.js').BattleLearnsets;
		} catch (e) {
			return this.say(con, room, 'Si è verificato un errore: riprova fra qualche secondo.');
		}
		var arg = arg.toLowerCase().replace(/[^a-zA-Z0-9]/g,"");
		if (movedex[arg]) {
			var priority = movedex[arg].priority;
			if (priority > 0) priority = "+" + priority;
			text += priority;
		}
		else if (pokedex[arg]) {
			var prioritymoves = [];
			var pokemonToCheck = [arg];
			var i = true;
			while (i) {
				if (pokedex[pokemonToCheck[pokemonToCheck.length-1]].prevo) pokemonToCheck.push(pokedex[pokemonToCheck[pokemonToCheck.length-1]].prevo.toLowerCase());
				else i = false;
			}
			for (var j in pokemonToCheck) {
				if (learnsets[pokemonToCheck[j]]) {
					for (var k in learnsets[pokemonToCheck[j]].learnset) {
						if (movedex[k]) {
							if (movedex[k].priority > 0 && movedex[k].basePower > 0) {
								if (prioritymoves.indexOf(movedex[k].name) == -1) {
									prioritymoves.push(movedex[k].name);
								}
							}
						}
					}
				}
			}
			prioritymoves.sort();
			for (var l in prioritymoves) {
				text += prioritymoves[l];
				if (l != prioritymoves.length-1) text += ', ';
			}
		}
		else {
			text += "Non trovato";
		}
		if (text == '') text = 'Nessuna priority move trovata';
		this.say(con, room, text);
	},
	boosting: function(arg, by, room, con) {
		if (this.canUse('contact', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			return this.say(con, room, '/pm ' + by + ', Scrivimi il comando in PM.');
		}
		try {
			var pokedex = require('./pokedex.js').BattlePokedex;
			var movedex = require('./moves.js').BattleMovedex;
			var learnsets = require('./learnsets-g6.js').BattleLearnsets;
		} catch (e) {
			return this.say(con, room, 'Si è verificato un errore: riprova fra qualche secondo.');
		}
		var arg = arg.toLowerCase().replace(/[^a-zA-Z0-9]/g,"");
		if (pokedex[arg]) {
			var boostingmoves = [];
			var pokemonToCheck = [arg];
			var i = true;
			while (i) {
				if (pokedex[pokemonToCheck[pokemonToCheck.length-1]].prevo) pokemonToCheck.push(pokedex[pokemonToCheck[pokemonToCheck.length-1]].prevo);
				else i = false;
			}
			for (var j in pokemonToCheck) {
				if (learnsets[pokemonToCheck[j]]) {
					for (var k in learnsets[pokemonToCheck[j]].learnset) {
						if (movedex[k]) {
							if ((movedex[k].boosts && movedex[k].target == 'self' && k != 'doubleteam' && k != 'minimize') || k == 'bellydrum') {
								if (boostingmoves.indexOf(movedex[k].name) == -1) {
									boostingmoves.push(movedex[k].name);
								}
							}
						}
					}
				}
			}
			boostingmoves.sort();
			for (var l in boostingmoves) {
				text += boostingmoves[l];
				if (l != boostingmoves.length-1) text += ', ';
			}
		}
		else {
			text += "Non trovato";
		}
		if (text == '') text = 'Nessuna boosting move trovata';
		this.say(con, room, text);
	},
	contact: function(arg, by, room, con) {
		if (this.canUse('contact', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			return this.say(con, room, '/pm ' + by + ', Scrivimi il comando in PM.');
		}
		try {
			var movedex = require('./moves.js').BattleMovedex;
		} catch (e) {
			return this.say(con, room, 'Si è verificato un errore: riprova fra qualche secondo.');
		}
		var move = arg.toLowerCase().replace(/[^a-zA-Z0-9]/g,"");
		if (movedex[move]) {
			if (movedex[move].isContact == true) text += "Causa contatto";
			else text += "Non causa contatto";
		}
		else {
			text += "Mossa non trovata";
		}
		this.say(con, room, text);
	},
	moves: 'viablemoves',
	viablemoves: function(arg, by, room, con) {
		if (this.canUse('viablemoves', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			return this.say(con, room, '/pm ' + by + ', Scrivimi il comando in PM.');
		}
		try {
			var aliases = require('./aliases.js').BattleAliases;
			var formatsdata = require('./formats-data.js').BattleFormatsData;
			var movedex = require('./moves.js').BattleMovedex;
		} catch (e) {
			return this.say(con, room, 'Si è verificato un errore: riprova fra qualche secondo.');
		}
		var pokemon = arg.toLowerCase().replace(/[^a-zA-Z0-9]/g,"");
		if (aliases[pokemon]) pokemon = aliases[pokemon].toLowerCase().replace(/[^a-zA-Z0-9]/g,"");
		if (formatsdata[pokemon]) {
			if (formatsdata[pokemon].viableMoves) {
				moves = '';
				for (var i in formatsdata[pokemon].viableMoves) {
					moves += ', ' + movedex[i].name;
				}
				text += moves.substring(2);
			}
			else {
				text += "Pokémon non trovato";
			}
		}
		else {
			text += "Pokémon non trovato";
		}
		this.say(con, room, text);
	},
	trad: function(arg, by, room, con) {
		if (this.canUse('trad', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			return this.say(con, room, '/pm ' + by + ', Scrivimi il comando in PM.');
		}
		try {
			var aliases = require('./aliases.js').BattleAliases;
		} catch (e) {
			return this.say(con, room, 'Si è verificato un errore: riprova fra qualche secondo.');
		}
		
		if (arg == '') return this.say(con, room, 'Cosa devo tradurre?');
		var parola = arg.toLowerCase().replace(/[^a-zA-Z0-9]/g,"");
		if (aliases[parola]) parola = aliases[parola].toLowerCase().replace(/[^a-zA-Z0-9]/g,"");
		var fs  = require("fs");
		var trad_ita = fs.readFileSync('trad_ita').toString();
		var trad_ita_no_space = trad_ita.replace(/[^a-zA-Z0-9,]/g,"").split(',');
		trad_ita = trad_ita.split(',');
		var trad_eng = fs.readFileSync('trad_eng').toString();
		var trad_eng_no_space = trad_eng.replace(/[^a-zA-Z0-9,]/g,"").split(',');
		trad_eng = trad_eng.split(',');
		
		if (trad_ita_no_space.indexOf(parola) != -1) text += trad_eng[trad_ita_no_space.indexOf(parola)];
		else if (trad_eng_no_space.indexOf(parola) != -1) text += trad_ita[trad_eng_no_space.indexOf(parola)];
		else text += "Non trovato";
		this.say(con, room, text);
	},
	ds: 'dexsearch',
	dsearch: 'dexsearch',
	dexsearch: function(arg, by, room, con) {
		if (this.canUse('dexsearch', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			return this.say(con, room, '/pm ' + by + ', Scrivimi il comando in PM.');
		}
		try {
			var pokedex = require('./pokedex.js').BattlePokedex;
			var movedex = require('./moves.js').BattleMovedex;
			var abilities = require('./abilities.js').BattleAbilities;
			var formatsdata = require('./formats-data.js').BattleFormatsData;
			var learnsets = require('./learnsets-g6.js').BattleLearnsets;
		} catch (e) {
			return this.say(con, room, 'Si è verificato un errore: riprova fra qualche secondo.');
		}
		arg = arg.toLowerCase().replace(/[^a-zA-Z0-9,<>]/g,"").split(',');
		var j = 0;
		var k = 0;
		var checkTier = false;
		var checkMove = false;
		var checkAbility = false;
		var checkType1 = false;
		var checkType2 = false;
		var checkBaseSpecies = false;
		var statNumber = false;
		var statWhat = false;
		var checkStat = false;
		var tiers = ['uber', 'ou', 'bl', 'uu', 'bl2', 'ru', 'bl3', 'nu', 'nfe', 'lcuber', 'lc'];
		var tierNumber = 0;
		var tierFirst = true;
		var pokemonToCheck = [];
		var stop = false;
		
		var result = new Array();
		for (var i = 0; i < arg.length; i++) {
			if (movedex[arg[i]]) {
				for (j in learnsets) {
					pokemonToCheck = [j];
					var g = true;
					while (g) {
						if (pokedex[pokemonToCheck[pokemonToCheck.length-1]].prevo) pokemonToCheck.push(pokedex[pokemonToCheck[pokemonToCheck.length-1]].prevo.toLowerCase());
						else g = false;
					}
					for (f in pokemonToCheck) {
						stop = false;
						for (k in learnsets[pokemonToCheck[f]].learnset) {
							checkMove = k == arg[i];
							if (checkMove) {
								result.push(pokedex[j].species);
								stop = true;
							}
						}
						if (stop) break;
					}
				}
				pokemonToCheck = [];
			}
			else if (abilities[arg[i]]) {
				for (j in pokedex) {
					for (k in pokedex[j].abilities) {
						checkAbility = pokedex[j].abilities[k] == abilities[arg[i]].name;
						if (checkAbility) {
							result.push(pokedex[j].species);
						}
					}
				}
			}
			else if (arg[i].substring(arg[i].length - 4) == 'type') {
				for (j in pokedex) {
					checkType1 = pokedex[j].types[0].toLowerCase() == arg[i].substring(0, arg[i].length - 4);
					if (pokedex[j].types[1]) {
						checkType2 = pokedex[j].types[1].toLowerCase() == arg[i].substring(0, arg[i].length - 4);
					}
					else {
						checkType2 = false;
					}
					if ((checkType1 || checkType2)) {
						result.push(pokedex[j].species);
					}
				}
			}
			else if (arg[i].charAt(2) == '>' || arg[i].charAt(3) == '>' || arg[i].charAt(2) == '<' || arg[i].charAt(3) == '<') {
				for (j in pokedex) {
					if (arg[i].indexOf('>') != -1) {
						statNumber = Number(arg[i].substring(arg[i].indexOf('>') + 1));
						statWhat = arg[i].substring(0, arg[i].indexOf('>'));
						checkStat = pokedex[j].baseStats[statWhat] > statNumber;
						console.log(checkStat);
					}
					else {
						statNumber = Number(arg[i].substring(arg[i].indexOf('<') + 1));
						statWhat = arg[i].substring(0, arg[i].indexOf('<'));
						checkStat = pokedex[j].baseStats[statWhat] < statNumber;
					}
					if (checkStat) {
						result.push(pokedex[j].species);
					}
				}
			}
			else if (tiers.indexOf(arg[i]) != -1) {
				for (j in formatsdata) {
					if (formatsdata[j].tier) {
						if (arg[i] == formatsdata[j].tier.toLowerCase().replace(' ','')) {
							result.push(pokedex[j].species);
						}
					}
				}
				if (!tierFirst) tierNumber++;
				else tierFirst = false;
			}
			else return this.say(con, room, "'" + arg[i] + "' could not be found in any of the search categories.");
		}
		result = result.sort();
		var countresult = {};
		result.forEach(function(r) {
			countresult[r] = (countresult[r] || 0) + 1;
		});
		var text = '';
		for (var l in countresult) {
			if (countresult[l] == i - tierNumber) {
				text += ', ' + l;
			}
		}
		text = text.substring(2);
		if (text.length > 200) {
			text = text.substring(0, 200);
			text = text.substring(0, text.lastIndexOf(','));
			text += "....";
		}
		if (text == '') text = "No Pokémon found.";
		this.say(con, room, text);
	},
	stat: function(arg, by, room, con) {
		if (this.canUse('stat', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			return this.say(con, room, '/pm ' + by + ', Scrivimi il comando in PM.');
		}
		try {
			var pokedex = require('./pokedex.js').BattlePokedex;
			var aliases = require('./aliases.js').BattleAliases;
		} catch (e) {
			return this.say(con, room, 'Si è verificato un errore: riprova fra qualche secondo.');
		}
		
		arg = arg.toLowerCase().replace(/[^a-zA-Z0-9,<>+-]/g,"").split(',');
		if (!arg[1]) return this.say(con, room, 'Scrivi il Pokémon e la stat da calcolare (ad esempio .stat pikachu, speed');
		arg[0] = arg[0].replace(/[+-]/g,"");
		arg[1] = arg[1].replace(/[+-]/g,"");
		if (aliases[arg[0]]) arg[0] = aliases[arg[0]].toLowerCase().replace(/[^a-zA-Z0-9]/g,"");
		if (aliases[arg[1]]) arg[1] = aliases[arg[1]].toLowerCase().replace(/[^a-zA-Z0-9]/g,"");
		
		if (pokedex[arg[1]]) {
			var pokemonarg = 1;
			var statarg = 0;
		}
		else if (pokedex[arg[0]]) {
			var pokemonarg = 0;
			var statarg = 1;
		}
		else return this.say(con, room, 'Pokémon non trovato');
		
		if (arg[statarg] == 'attack') arg[statarg] = 'atk';
		else if (arg[statarg] == 'defense') arg[statarg] = 'def';
		else if (arg[statarg] == 'specialattack') arg[statarg] = 'spa';
		else if (arg[statarg] == 'specialdefense') arg[statarg] = 'spd';
		else if (arg[statarg] == 'speed') arg[statarg] = 'spe';
		
		if (pokedex[arg[pokemonarg]].baseStats[arg[statarg]]) base = pokedex[arg[pokemonarg]].baseStats[arg[statarg]];
		else return this.say(con, room, 'Statistica non trovata: scegli tra attack, defense, special attack, special defense e speed; o le rispettive abbreviazioni');
		
		var calculator = require('./calc.js');
		argSend = arg.slice(2);
		argSend = argSend;
		if (arg[statarg] != 'hp') {
			var results = calculator.calcfunc(argSend, 'stat', con, room, this);
			
			var ev = results[0];
			var iv = results[1];
			var itemBoost = results[2];
			var boost = results[3];
			var nature = results[4];
			var abilityBoost = results[5];
			var level = Number(results[6]);
			
			var item = results[7];
			var ability = results[8]
			var statBoost = results[9];
			
			if (ev == -1) ev = 252;
			if (iv == -1) iv = 31;
			if (itemBoost == 0) itemBoost = 1;
			if (boost == 0) boost = 1;
			if (nature == 0) nature = 1;
			if (abilityBoost == 0) abilityBoost = 1;
			if (level == 0) level = 100;
			
			var stat = Math.floor(Math.floor((((iv + 2*base + ev/4) * level/100) + 5) * nature) * boost * itemBoost * abilityBoost);
			if (stat == 0) stat = 1;
		}
		else {
			var results = calculator.calcfunc(argSend, 'stathp', con, room, this);
			
			var ev = results[0];
			var iv = results[1];
			var level = Number(results[6]);
			
			if (ev == -1) ev = 252;
			if (iv == -1) iv = 31;
			if (level == 0) level = 100;
			
			var stat = Math.floor((iv + 2*base + ev/4) * level/100) + 10 + level;
			if (stat == 0) stat = 1;
		}
		
		if (pokedex[arg[pokemonarg]].species) text += pokedex[arg[pokemonarg]].species + ' ';
		else return this.say(con, room, 'Questo errore non si dovrebbe verificare... (errore nome)');
		
		if (statBoost != '' && statBoost != undefined) text += 'a ' + statBoost + ', ';
		
		text += 'con ';
		
		text += ev + 'ev e ';
		
		text += iv + 'iv, ';
		
		if (arg[statarg] == 'hp') text += ' ';
		else if (nature == 0.9) text += 'con la natura sfavorevole, ';
		else if (nature == 1.1) text += 'con la natura favorevole, ';
		else if (nature == 1) text += ' ';
		else return this.say(con, room, 'Questo errore non si dovrebbe verificare... (errore nature)');
		
		
		if (item != '' && statBoost != undefined) text += item + ', ';
		
		if (ability != '' && statBoost != undefined) text += ability + ', ';
		
		if (level != 100) text += 'al livello ' + level + ' ';
		
		text += ' ha ';
		
		if      (arg[statarg] == 'hp') text += 'gli HP';
		else if (arg[statarg] == 'atk') text += 'l\'Attacco';
		else if (arg[statarg] == 'def') text += 'la Difesa';
		else if (arg[statarg] == 'spa') text += 'l\'Attacco Speciale';
		else if (arg[statarg] == 'spd') text += 'la Difesa Speciale';
		else if (arg[statarg] == 'spe') text += 'la Velocità';
		else return this.say(con, room, 'Questo errore non si dovrebbe verificare... (errore statistiche)');
		
		text += ' pari a ' + stat;
		
		this.say(con, room, text);
	},
	rstats: 'randomstats',
	rstat: 'randomstats',
	randomstats: function(arg, by, room, con) {
		if (this.canUse('stat', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			return this.say(con, room, '/pm ' + by + ', Scrivimi il comando in PM.');
		}
		try {
			var pokedex = require('./pokedex.js').BattlePokedex;
			var formatsdata = require('./formats-data.js').BattleFormatsData;
			var aliases = require('./aliases.js').BattleAliases;
		} catch (e) {
			return this.say(con, room, 'Si è verificato un errore: riprova fra qualche secondo.');
		}
		var pokemon = arg.toLowerCase().replace(/[^a-zA-Z0-9]/g,"");
		if (aliases[pokemon]) pokemon = aliases[pokemon].toLowerCase().replace(/[^a-zA-Z0-9]/g,"");
		if (!pokedex[pokemon]) return this.say(con, room, 'Pokémon non trovato');
		var levelScale = {
			LC: 94,
			'LC Uber': 92,
			NFE: 90,
			Limbo: 86,
			NU: 86,
			BL3: 84,
			RU: 82,
			BL2: 80,
			UU: 78,
			BL: 76,
			OU: 74,
			CAP: 74,
			Unreleased: 74,
			Uber: 70
		};
		var customScale = {
			// Really bad Pokemon and jokemons
			Azurill: 99, Burmy: 99, Cascoon: 99, Caterpie: 99, Cleffa: 99, Combee: 99, Feebas: 99, Igglybuff: 99, Happiny: 99, Hoppip: 99,
			Kakuna: 99, Kricketot: 99, Ledyba: 99, Magikarp: 99, Metapod: 99, Pichu: 99, Ralts: 99, Sentret: 99, Shedinja: 99,
			Silcoon: 99, Slakoth: 99, Sunkern: 99, Tynamo: 99, Tyrogue: 99, Unown: 99, Weedle: 99, Wurmple: 99, Zigzagoon: 99,
			Clefairy: 95, Delibird: 95, "Farfetch'd": 95, Jigglypuff: 95, Kirlia: 95, Ledian: 95, Luvdisc: 95, Marill: 95, Skiploom: 95,
			Pachirisu: 90,

			// Eviolite
			Ferroseed: 95, Misdreavus: 95, Munchlax: 95, Murkrow: 95, Natu: 95,
			Gligar: 90, Metang: 90, Monferno: 90, Roselia: 90, Seadra: 90, Togetic: 90, Wartortle: 90, Whirlipede: 90,
			Dusclops: 84, Porygon2: 82, Chansey: 78,

			// Weather or teammate dependent
			Snover: 95, Vulpix: 95, Ninetales: 78, Tentacruel: 78, Toxicroak: 78,

			// Banned mega
			Kangaskhan: 72, Gengar: 72, Blaziken: 72,

			// Holistic judgment
			Carvanha: 90, Lucario: 72, Genesect: 72, Kyurem: 78
		};
		var level = levelScale[formatsdata[pokemon].tier] || 90;
		if (customScale[pokemon]) level = customScale[pokemon];
		
		if (pokedex[pokemon].baseStats['hp']) base = pokedex[pokemon].baseStats['hp'];
		var stat = Math.floor((31 + 2*base + 85/4) * level/100) + 10 + level;
		if (stat == 0) stat = 1;
		text += 'hp: ' + stat;
		
		stats = ['atk', 'def', 'spa', 'spd', 'spe'];
		for (var i in stats) {
			if (pokedex[pokemon].baseStats[stats[i]]) base = pokedex[pokemon].baseStats[stats[i]];
			var stat = Math.floor((((31 + 2*base + 85/4) * level/100) + 5));
			if (stat == 0) stat = 1;
			text += ', ' + stats[i] + ': ' + stat;
		}
		
		
		var alt = false;
		var text1 = false;
		if (pokemon == 'serperior') {
			level = 74;
			text = 'Senza contrary: ' + text;
			text1 = 'Con contrary: ';
			alt = true;
		}
		if (pokemon == 'magikarp') {
			level = 85;
			text+= 'Senza magikarp\'s revenge: ' + text;
			text1 = 'Con magikarp\'s revenge: ';
			alt = true;
		}
		if (pokemon == 'spinda') {
			level = 95;
			text = 'Con contrary: ' + text;
			text1 = 'Senza contrary: ';
			alt = true;
		}
		
		if (alt) {
			if (pokedex[pokemon].baseStats['hp']) base = pokedex[pokemon].baseStats['hp'];
			var stat = Math.floor((31 + 2*base + 85/4) * level/100) + 10 + level;
			if (stat == 0) stat = 1;
			text1 += 'hp: ' + stat;
			
			stats = ['atk', 'def', 'spa', 'spd', 'spe'];
			for (var i in stats) {
				if (pokedex[pokemon].baseStats[stats[i]]) base = pokedex[pokemon].baseStats[stats[i]];
				var stat = Math.floor((((31 + 2*base + 85/4) * level/100) + 5));
				if (stat == 0) stat = 1;
				text1 += ', ' + stats[i] + ': ' + stat;
			}
		}
		
		this.say(con, room, text);
		if (text1) this.say(con, room, text1);
	},

	guida: function(arg, by, room, con) {
		if (this.canUse('informations', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			return this.say(con, room, '/pm ' + by + ', Scrivimi il comando in PM.');
		}
		text += 'Lista dei comandi di cerbottana --> http://is.gd/cerbottana';
		this.say(con, room, text);
	},
	credits: function(arg, by, room, con) {
		if (this.canUse('informations', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			return this.say(con, room, '/pm ' + by + ', Scrivimi il comando in PM.');
		}
		text += 'Ispirato al bot di Quinella e TalkTakesTime, modificato ed aggiornato da Lucafausto96, un ringraziamento speciale a oizys per l\'hosting sul suo server e a test2017 per il debugging';
		this.say(con, room, text);
	},
	hackmons: function(arg, by, room, con) {
		if (this.canUse('informations', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			return this.say(con, room, '/pm ' + by + ', Scrivimi il comando in PM.');
		}
		text += "In Hackmons puoi usare ogni Pokémon con qualsiasi abilità e mossa, inoltre puoi dare 252 ev in ogni stat";
		this.say(con, room, text);
	},
	bh: function(arg, by, room, con) {
		if (this.canUse('informations', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			return this.say(con, room, '/pm ' + by + ', Scrivimi il comando in PM.');
		}
		text += "In Balanced Hackmons sono bannate le OHKO moves, Wonder Guard, Shadow Tag, Arena Trap, Huge Power, Pure Power, Parental Bond, e c'è l'Ability Clause (non puoi usare due Pokémon con la stessa abilità)";
		this.say(con, room, text);
	},
	tour: 'tours',
	tours: function(arg, by, room, con) {
		if (this.canUse('informations', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			return this.say(con, room, '/pm ' + by + ', Scrivimi il comando in PM.');
		}
		text += "Tornei gratis -> play.pokemonshowdown.com/tournaments";
		this.say(con, room, text);
	},
	avatar: function(arg, by, room, con) {
		if (this.canUse('informations', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			return this.say(con, room, '/pm ' + by + ', Scrivimi il comando in PM.');
		}
		text += "Per cambiare il tuo avatar, clicca sul tuo nick, poi clicca sul tuo avatar, e scegli quello nuovo";
		this.say(con, room, text);
	},
	chart: 'typechart',
	typechart: function(arg, by, room, con) {
		if (this.canUse('informations', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			return this.say(con, room, '/pm ' + by + ', Scrivimi il comando in PM.');
		}
		text += 'Type chart: http://is.gd/typechart';
		this.say(con, room, text);
	},
	

	/**
	 * Room specific commands
	 *
	 * These commands are used in specific rooms on the Smogon server.
	 */
	/*guia: function(arg, by, room, con) {
		// this command is a guide for the Spanish room
		if (!(toId(room) === 'espaol' && config.serverid === 'showdown')) return false;
		var text = '';
		if (!this.canUse('guia', room, by)) {
			text += '/pm ' + by + ', ';
		}
		text += 'Si sos nuevo en el sitio, revisa nuestra **Guía Introductoria** (http://goo.gl/Db1wPf) compilada por ``1 + Tan²x = Sec²x``!';
		this.say(con, room, text);
	},
	wifi: function(arg, by, room, con) {
		// links to the 
		if (!(toId(room) === 'wifi' && config.serverid === 'showdown')) return false;
		var text = '';
		if (!this.canUse('wifi', room, by)) {
			text += '/pm ' + by + ', ';
		}
		var messages = {
			rules: 'The rules for the Wi-Fi room can be found here: http://pstradingroom.weebly.com/rules.html',
			faq: 'Wi-Fi room FAQs: http://pstradingroom.weebly.com/faqs.html',
			faqs: 'Wi-Fi room FAQs: http://pstradingroom.weebly.com/faqs.html',
			scammers: 'List of known scammers: http://tinyurl.com/psscammers',
			cloners: 'List of approved cloners: http://goo.gl/WO8Mf4',
			tips: 'Scamming prevention tips: http://pstradingroom.weebly.com/scamming-prevention-tips.html',
			breeders: 'List of breeders: http://tinyurl.com/WiFIBReedingBrigade',
			signup: 'Breeders Sign Up: http://tinyurl.com/GetBreeding',
			bans: 'Ban appeals: http://pstradingroom.weebly.com/ban-appeals.html',
			banappeals: 'Ban appeals: http://pstradingroom.weebly.com/ban-appeals.html',
			lists: 'Major and minor list compilation: http://tinyurl.com/WifiSheets'
		};
		text += (toId(arg) ? (messages[toId(arg)] || 'Unknown option. General links can be found here: http://pstradingroom.weebly.com/links.html') : 'Links can be found here: http://pstradingroom.weebly.com/links.html');
		this.say(con, room, text);
	},
	mono: 'monotype',
	monotype: function(arg, by, room, con) {
		// links and info for the monotype room
		if (!(toId(room) === 'monotype' && config.serverid === 'showdown')) return false;
		var text = '';
		if (!this.canUse('monotype', room, by)) {
			text += '/pm ' + by + ', ';
		}
		var messages = {
			forums: 'The monotype room\'s forums can be found here: http://psmonotypeforum.createaforum.com/index.php',
			plug: 'The monotype room\'s plug can be found here: http://plug.dj/monotype-3-am-club/',
			rules: 'The monotype room\'s rules can be found here: http://psmonotype.wix.com/psmono#!rules/cnnz',
			site: 'The monotype room\'s site can be found here: http://www.psmonotype.wix.com/psmono',
			league: 'Information on the Monotype League can be found here: http://themonotypeleague.weebly.com/'
		};
		text += (toId(arg) ? (messages[toId(arg)] || 'Unknown option. General information can be found here: http://www.psmonotype.wix.com/psmono') : 'Welcome to the monotype room! Please visit our site to find more information. The site can be found here: http://www.psmonotype.wix.com/psmono');
		this.say(con, room, text);
	},
	survivor: function(arg, by, room, con) {
		// contains links and info for survivor in the Survivor room
		if (!(toId(room) === 'survivor' && config.serverid === 'showdown')) return false;
		var text = '';
		if (!this.canUse('survivor', room, by)) {
			text += '/pm ' + by + ', ';
		}
		var gameTypes = {
			hg: "http://survivor-ps.weebly.com/hunger-games.html",
			hungergames: "http://survivor-ps.weebly.com/hunger-games.html",
			classic: "http://survivor-ps.weebly.com/classic.html"
		};
		arg = toId(arg);
		if (arg) {
			if (!(arg in gameTypes)) return this.say(con, room, "Invalid game type. The game types can be found here: http://survivor-ps.weebly.com/themes.html");
			text += "The rules for this game type can be found here: " + gameTypes[arg];
		} else {
			text += "The list of game types can be found here: http://survivor-ps.weebly.com/themes.html";
		}
		this.say(con, room, text);
	},
	games: function(arg, by, room, con) {
		// lists the games for the games room
		if (!(toId(room) === 'gamecorner' && config.serverid === 'showdown')) return false;
		var text = '';
		if (!this.canUse('games', room, by)) {
			text += '/pm ' + by + ', ';
		}
		this.say(con, room, text + 'Game List: 1. Would You Rather, 2. NickGames, 3. Scattegories, 4. Commonyms, 5. Questionnaires, 6. Funarios, 7. Anagrams, 8. Spot the Reference, 9. Pokemath, 10. Liar\'s Dice');
		this.say(con, room, text + '11. Pun Game, 12. Dice Cup, 13. Who\'s That Pokemon?, 14. Pokemon V Pokemon (BST GAME), 15. Letter Getter, 16. Missing Link, 17. Parameters! More information can be found here: http://psgamecorner.weebly.com/games.html');
	},
	happy: function(arg, by, room, con) {
		// info for The Happy Place
		if (!(toId(room) === 'thehappyplace' && config.serverid === 'showdown')) return false;
		var text = '';
		if (!this.canUse('happy', room, by)) text += '/pm ' + by + ', ';
		this.say(con, room, text + "The Happy Place, at its core, is a friendly environment for anyone just looking for a place to hang out and relax. We also specialize in taking time to give advice on life problems for users. Need a place to feel at home and unwind? Look no further!");
	},*/


	/**
	 * Jeopardy commands
	 *
	 * The following commands are used for Jeopardy in the Academics room
	 * on the Smogon server.
	 */


	/*b: 'buzz',
	buzz: function(arg, by, room, con) {
		if (this.buzzed || !this.canUse('buzz', room, by) || room.charAt(0) === ',') return false;
		this.say(con, room, '**' + by.substr(1) + ' has buzzed in!**');
		this.buzzed = by;
		var self = this;
		this.buzzer = setTimeout(function(con, room, buzzMessage) {
			self.say(con, room, buzzMessage);
			self.buzzed = '';
		}, 7000, con, room, by + ', your time to answer is up!');
	},
	reset: function(arg, by, room, con) {
		if (!this.buzzed || !this.hasRank(by, '%@&#~') || room.charAt(0) === ',') return false;
		clearTimeout(this.buzzer);
		this.buzzed = '';
		this.say(con, room, 'The buzzer has been reset.');
	},*/
};
