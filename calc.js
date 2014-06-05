module.exports = {
	calcfunc: function (arg, what, con, room, self) {
		try {
			var pokedex = require('./pokedex.js').BattlePokedex;
			var aliases = require('./aliases.js').BattleAliases;
			var movedex = require('./moves.js').BattleMovedex;
		} catch (e) {
			return self.say(con, room, 'Si è verificato un errore: riprova fra qualche secondo.');
		}
		
		var moveType = false;
		var movePower = false;
		var moveCategory = false;
		var ev = -1;
		var iv = -1;
		var itemBoost = 0;
		var boost = 0;
		var nature = 0;
		var abilityBoost = 0;
		var level = 0;
		
		var evHP = -1;
		
		var item = '';
		var ability = '';
		var statBoost = '';
		
		var natureCheck = '';
		var evCheck = '';
		var ivCheck = '';
		var boostCheck = '';
		var levelCheck = '';
		
		for (var i in arg) {
			if (movedex[arg[i]] && what == 'attack') {
				if (move == '') {
					moveType = movedex[arg[i]].type;
					movePower = movedex[arg[i]].basePower;
					moveCategory = movedex[arg[i]].category;
				}
				else return self.say(con, room, 'Errore: hai specificato più di una volta la mossa');
			}
			else if (arg[i].substring(0, 6) == 'natura' && what == 'stat') {
				if (nature == 0) {
					if      (arg[i].substring(6) == 'favorevole')  nature = 1.1;
					else if (arg[i].substring(6) == 'neutra') nature = 1;
					else if (arg[i].substring(6) == 'sfavorevole') nature = 0.9;
					else return self.say(con, room, 'Per specificare la natura scegli tra natura favorevole, natura sfavorevole, natura neutra');
				}
				else return self.say(con, room, 'Errore: hai specificato più di una volta la natura');
			}
			else if ((arg[i].substring(arg[i].length - 1) == '+' || arg[i].substring(arg[i].length - 1) == '-') && what == 'stat') {
				if (nature == 0) {
					if (ev == -1) {
						evCheck = Number(arg[i].substring(0, arg[i].length - 1));
						if (evCheck >= 0 && evCheck <= 252) ev = evCheck;
						else return self.say(con, room, "Numero di EV non valido.");
						natureCheck = arg[i].substring(arg[i].length - 1);
						if      (natureCheck == '+') nature = 1.1;
						else if (natureCheck == '-') nature = 0.9;
						else return self.say(con, room, 'Si è verificato un errore');
					}
					else return self.say(con, room, 'Errore: hai specificato più di una volta gli ev');
				}
				else return self.say(con, room, 'Errore: hai specificato più di una volta la natura');
			}
			else if (arg[i].substring(arg[i].length - 2) == 'ev' && (what == 'stat' || what == 'stathp' || what == 'attack')) {
				if (ev == -1) {
					evCheck = Number(arg[i].substring(0, arg[i].length - 2));
					if (evCheck >= 0 && evCheck <= 252) ev = evCheck;
					else return self.say(con, room, "Numero di EV non valido.");
				}
				else return self.say(con, room, 'Errore: hai specificato più di una volta gli ev');
			}
			else if (arg[i].substring(arg[i].length - 2) == 'iv' && (what == 'stat' || what == 'stathp' || what == 'attack')) {
				if (iv == -1) {
					ivCheck = Number(arg[i].substring(0, arg[i].length - 2));
					if (ivCheck >= 0 && ivCheck <= 31) iv = ivCheck;
					else return self.say(con, room, "Numero di IV non valido.");
				}
				else return self.say(con, room, 'Errore: hai specificato più di una volta gli iv');
			}
			else if (arg[i].substring(arg[i].length - 4) == 'evhp' && what == 'defense') {
				if (evHP == -1) {
					evCheck = Number(arg[i].substring(0, arg[i].length - 4));
					if (evCheck >= 0 && evCheck <= 252) ev = evCheck;
					else return self.say(con, room, "Numero di EV non valido.");
				}
				else return self.say(con, room, 'Errore: hai specificato più di una volta gli ev');
			}
			else if (((arg[i].substring(arg[i].length - 4) == '+atk' || arg[i].substring(arg[i].length - 4) == '+spa') && what == 'attack') || ((arg[i].substring(arg[i].length - 4) == '+def' || arg[i].substring(arg[i].length - 4) == '+spd') && what == 'defense')) {
				if (nature == 0) {
					if (ev == -1) {
						evCheck = Number(arg[i].substring(0, arg[i].length - 4));
						if (evCheck >= 0 && evCheck <= 252) ev = evCheck;
						else return self.say(con, room, "Numero di EV non valido.");
						natureCheck = arg[i].substring(arg[i].length - 4, arg[i].length - 3);
						if      (natureCheck == '+') nature = 1.1;
						else if (natureCheck == '-') nature = 0.9;
						else return self.say(con, room, 'Si è verificato un errore');
					}
					else return self.say(con, room, 'Errore: hai specificato più di una volta gli ev');
				}
				else return self.say(con, room, 'Errore: hai specificato più di una volta la natura');
			}
			else if (((arg[i].substring(arg[i].length - 5) == 'evatk' || arg[i].substring(arg[i].length - 5) == 'evspa') && what == 'attack') || ((arg[i].substring(arg[i].length - 5) == 'evdef' || arg[i].substring(arg[i].length - 5) == 'evspd') && what == 'defense')) {
				if (ev == -1) {
					evCheck = Number(arg[i].substring(0, arg[i].length - 5));
					if (evCheck >= 0 && evCheck <= 252) ev = evCheck;
					else return self.say(con, room, "Numero di EV non valido.");
				}
				else return self.say(con, room, 'Errore: hai specificato più di una volta gli ev');
			}
			else if (((arg[i].substring(arg[i].length - 5) == 'ivatk' || arg[i].substring(arg[i].length - 5) == 'ivspa') && what == 'attack') || ((arg[i].substring(arg[i].length - 5) == 'ivdef' || arg[i].substring(arg[i].length - 5) == 'ivspd') && what == 'defense')) {
				if (iv == -1) {
					ivCheck = Number(arg[i].substring(0, arg[i].length - 5));
					if (ivCheck >= 0 && ivCheck <= 31) iv = ivCheck;
					else return self.say(con, room, "Numero di IV non valido.");
				}
				else return self.say(con, room, 'Errore: hai specificato più di una volta gli iv');
			}
			else if ((arg[i] == 'choiceband' || arg[i] == 'choicebanded' || arg[i] == 'band' || arg[i] == 'banded') && what == 'stat') {
				if (itemBoost == 0) {
					if (arg[statarg] == 'atk') {
						itemBoost = 1.5;
						item = 'Choice Band';
					}
					else return self.say(con, room, 'La Choice Band non influenza la statistica ' + arg[statarg]);
				}
				else return self.say(con, room, 'Errore: hai specificato più di un item');
			}
			else if ((arg[i] == 'choicespecs' || arg[i] == 'choicespecsed' || arg[i] == 'specs' || arg[i] == 'specsed') && what == 'stat') {
				if (itemBoost == 0) {
					if (arg[statarg] == 'spa') {
						itemBoost = 1.5;
						item = 'Choice Specs';
					}
					else return self.say(con, room, 'La Choice Specs non influenza la statistica ' + arg[statarg]);
				}
				else return self.say(con, room, 'Errore: hai specificato più di un item');
			}
			else if ((arg[i] == 'assaultvest' || arg[i] == 'vest') && what == 'stat') {
				if (itemBoost == 0) {
					if (arg[statarg] == 'spd') {
						itemBoost = 1.5;
						item = 'Assault Vest';
					}
					else return self.say(con, room, 'L\'Assault Vest non influenza la statistica ' + arg[statarg]);
				}
				else return self.say(con, room, 'Errore: hai specificato più di un item');
			}
			else if ((arg[i] == 'choicescarf' || arg[i] == 'choicescarfed' || arg[i] == 'scarf' || arg[i] == 'scarfed') && what == 'stat') {
				if (itemBoost == 0) {
					if (arg[statarg] == 'spe') {
						itemBoost = 1.5;
						item = 'Choice Scarf';
					}
					else return self.say(con, room, 'La Choice Scarf non influenza la statistica ' + arg[statarg]);
				}
				else return self.say(con, room, 'Errore: hai specificato più di un item');
			}
			else if (arg[i] == 'quickpowder' && what == 'stat') {
				if (itemBoost == 0) {
					if (arg[pokemonarg] == 'ditto') {
						if (arg[statarg] == 'spe') {
							itemBoost = 2;
							item = 'Quick Powder';
						}
						else return self.say(con, room, 'La Quick Powder non influenza la statistica ' + arg[statarg]);
					}
					else return self.say(con, room, 'La Quick Powder ha effetto solo su Ditto; su ' + pokedex[arg[pokemonarg]].species + ' è inutile');
				}
				else return self.say(con, room, 'Errore: hai specificato più di un item');
			}
			else if (arg[i] == 'ironball' && what == 'stat') {
				if (itemBoost == 0) {
					if (arg[statarg] == 'spe') {
						itemBoost = 0.5;
						item = 'Iron Ball';
					}
					else return self.say(con, room, 'L\'Iron Ball non influenza la statistica ' + arg[statarg]);
				}
				else return self.say(con, room, 'Errore: hai specificato più di un item');
			}
			else if (arg[i] == 'lightball' && what == 'stat') {
				if (itemBoost == 0) {
					if (arg[pokemonarg] == 'pikachu') {
						if (arg[statarg] == 'atk' || arg[statarg] == 'spa') {
							itemBoost = 2;
							item = 'Light Ball';
						}
						else return self.say(con, room, 'La Light Ball non influenza la statistica ' + arg[statarg]);
					}
					else return self.say(con, room, 'La Light Ball ha effetto solo su Pikachu; su ' + pokedex[arg[pokemonarg]].species + ' è inutile');
				}
				else return self.say(con, room, 'Errore: hai specificato più di un item');
			}
			else if ((arg[i] == 'eviolite' || arg[i] == 'evio') && what == 'stat') {
				if (itemBoost == 0) {
					if (pokedex[arg[pokemonarg]].evos) {
						if (arg[statarg] == 'def' || arg[statarg] == 'spd') {
							itemBoost = 1.5;
							item = 'Eviolite';
						}
						else return self.say(con, room, 'L\'Eviolite non influenza la statistica ' + arg[statarg]);
					}
					else return self.say(con, room, 'L\'Eviolite non ha nessun effetto su ' + pokedex[arg[pokemonarg]].species);
				}
				else return self.say(con, room, 'Errore: hai specificato più di un item');
			}
			else if (arg[i] == 'souldew' && what == 'stat') {
				if (itemBoost == 0) {
					if (arg[pokemonarg] == 'latios' || arg[pokemonarg] == 'latias') {
						if (arg[statarg] == 'spa' || arg[statarg] == 'spd') {
							itemBoost = 1.5;
							item = 'Soul Dew';
						}
						else return self.say(con, room, 'La Soul Dew non influenza la statistica ' + arg[statarg]);
					}
					else return self.say(con, room, 'La Soul Dew ha effetto solo su Latias e Latios; su ' + pokedex[arg[pokemonarg]].species + ' è inutile');
				}
				else return self.say(con, room, 'Errore: hai specificato più di un item');
			}
			else if (arg[i].substring(0, 1) == '+' && what == 'stat') {
				if (boost == 0) {
					boostCheck = arg[i].substring(1);
					statBoost = arg[i];
					if (boostCheck == '1') boost = 1.5;
					else if (boostCheck == '2') boost = 2;
					else if (boostCheck == '3') boost = 2.5;
					else if (boostCheck == '4') boost = 3;
					else if (boostCheck == '5') boost = 3.5;
					else if (boostCheck == '6') boost = 4;
					else return self.say(con, room, "Boost non valido");
				}
				else return self.say(con, room, 'Errore: hai specificato più di un boost');
			}
			else if (arg[i].substring(0, 1) == '-' && what == 'stat') {
				if (boost == 0) {
					boostCheck = arg[i].substring(1);
					statBoost = arg[i];
					if (boostCheck == '1') boost = 0.75;
					else if (boostCheck == '2') boost = 0.6;
					else if (boostCheck == '3') boost = 0.5;
					else if (boostCheck == '4') boost = 0.43;
					else if (boostCheck == '5') boost = 0.38;
					else if (boostCheck == '6') boost = 0.33;
					else return self.say(con, room, "Drop non valido");
				}
				else return self.say(con, room, 'Errore: hai specificato più di un boost');
			}
			else if ((arg[i] == 'hugepower' || arg[i] == 'purepower') && what == 'stat') {
				if (abilityBoost == 0) {
					if (arg[statarg] == 'atk') {
						abilityBoost = 2;
						if      (arg[i] == 'hugepower') ability = 'Huge Power';
						else if (arg[i] == 'purepower') ability = 'Pure Power';
					}
					else return self.say(con, room, 'Huge Power e Pure Power non influenzano la statistica ' + arg[statarg]);
				}
				else return self.say(con, room, 'Errore: hai specificato più di un\'abilità');
			}
			else if (arg[i] == 'hustle' && what == 'stat') {
				if (abilityBoost) {
					if (arg[statarg] == 'atk') {
						abilityBoost = 1.5;
						ability = 'Hustle';
					}
					else return self.say(con, room, 'Hustle non influenza la statistica ' + arg[statarg]);
				}
				else return self.say(con, room, 'Errore: hai specificato più di un\'abilità');
			}
			else if (arg[i].substring(0, 5) == 'level') {
				if (level == 0) {
					levelCheck = arg[i].substring(5);
					if (levelCheck >= 1 && levelCheck <= 100) level = levelCheck;
					else return self.say(con, room, "Livello non valido");
				}
				else return self.say(con, room, 'Errore: hai specificato più di una volta il livello');
			}
			else if (arg[i].substring(0, 7) == 'livello') {
				if (level == 0) {
					levelCheck = arg[i].substring(7);
					if (levelCheck >= 1 && levelCheck <= 100) level = levelCheck;
					else return self.say(con, room, "Livello non valido");
				}
				else return self.say(con, room, 'Errore: hai specificato più di una volta il livello');
			}
			else return self.say(con, room, '"' + arg[i] + '" non corrisponde a nessun termine di ricerca');
		}
		
		return [ev, iv, itemBoost, boost, nature, abilityBoost, level, item, ability, statBoost, moveType, movePower, moveCategory, evHP]
	}
}
