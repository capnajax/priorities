'use strict';

const
	debug = require('debug')("priorities:AppUser"),
	emojiRegex = require('emoji-regex'),
	_ = require('lodash'),

	letterSet = function(str) {
			var seen = new Set(),
				i = str.length;
			while(i--) {
				let c = str.charCodeAt(i);
				if (!seen.has(c)) {
					seen.add(c);
				}
			}

			return seen;
		},

	inRange = function(c, a, b) {
			debug("inRange called, [c,a,b] ==", [c,a,b]);
			debug("inRange (c >= a && c <= b) ==", (c >= a && c <= b));
			return (c >= a && c <= b);
		},
	
	// most common 100 Chinese words in both Traditional and Simplified
	COMMON_HANZI = letterSet( 
			"的一是不了人我在有他这为之大来以个中上们到说国和地也子时道出而要于就下得可你年生自会那后能对着事其里" +
			"的一是不了人我在有他這為之大來以個中上們到說國和地也子時道出而要於就下得可你年生自會那後能對著事其里" +
			"所去行过家十用发天如然作方成者多日都三小军二无同么经法当起与好看学进种将还分此心前面又定见只主没公从" +
			"所去行過家十用發天如然作方成者多日都三小軍二無同麼經法當起與好看學進種將還分此心前面又定見只主沒公從"),

	/**
	 *	@constant ENTROPY_CLASSES
	 *	Each character can only be a member of one class, the first matching class takes
	 *	precedent. Each category has an entropy score (usually how may possible characters with
	 *	some consideration for the randomness of their usage), a description, and either a 
	 *	range or a test to indicate if the character is in the class. Total entropy is ln(scores
	 *	of all the unique entropy classes multiplied*length);
	 */
	ENTROPY_CLASSES = [
			{ score: Math.log(10), desc: "number", range: [0x30, 0x39]},
			{ score: Math.log(26), desc: "lowerRoman", range: [0x61,0x7a]},
			{ score: Math.log(26), desc: "upperRoman", range: [0x41,0x5a]},
			{ score: Math.log(12), desc: "special", range: [0x21, 0x2f, 0x3a, 0x3f]},
			{ score: Math.log(33), desc: "lowerCyrillic", range: [0x410,0x42f]},
			{ score: Math.log(33), desc: "upperCyrillic", range: [0x430,0x44f]},
			{ score: Math.log(24), desc: "lowerGreek", range: [0x391,0x3a9]},
			{ score: Math.log(24), desc: "upperGreek", range: [0x3b1,0x3c9]},
			{ score: Math.log(40), desc: "hiragana", range: [0x3041,0x3096]},
			{ score: Math.log(40), desc: "katakana", range: [0x30A0,0x30fa]},
			{ score: Math.log(40), desc: "bopomofo", range: [0x31A0,0x31ba]},
			{ score: Math.log(100), desc: "commonhanzi", test: (c) => {
					return COMMON_HANZI.has(c);
				}},
			{ score: Math.log(1000), desc: "hanzi", range: [0x4e00, 0x9fbf], cancel: ["commonhanzi"]},
			{ score: Math.log(1000), desc: "emoji", test: (c) => {
					return !!emojiRegex().exec(c);
				}},
			// unknown can cover "burred" latin, cyrillic, etc, so the
			// entropy is limited to 100.
			{ score: Math.log(100), desc: "unknown", test: (c) => {return true;}}
		],

	ENTROPY_RANGES = [
			{ max: 64, acceptable: false, ideal: false},
			{ max: 96, acceptable: true, ideal: false},
			{ max: Infinity, acceptable: true, ideal: true}
		],

	// suggested maximum scale for measuring entropy
	ENTROPY_SCALE_MAX = 128;

module.exports = function(Appuser) {

	/**
	 *	Estimate password entropy, assigning it a score roughly equal to the log of the number
	 *	of guesses it would take to guess the password.
	 *	<ul><li>Repeated characters are only counted once, `000` is the same as `0`</li>
	 *		<li>Every character type (upper, lower, number, special, hiragana...) that 
	 *				appears in the password increases by a certain amount, loosely based
	 *				on the natural log of the number of characters in that class.</li>
	 *		<li>The score for character classes is multiplied by the number of unique 
	 *				characters, so an 16 (unique) char password will have double the 
	 *				entropy of a 8 (unique) char password.</li>
	 *		<li>If Hanzi (Chinese) characters are used, passwords with only the 100 most 
	 *				common words score less than the others.</li>
	 *		<li>Any character in any language is permitted.</li>
	 *	</ul>
	 */
	Appuser.passwordEntropy = function passwordEntropy(_password, _cb) {
		var entropyClassnamesFound = new Set(),
			uniquePasswordLetters = letterSet(_password),
			cancelations = new Set(), // in case one set cancels the entropy of another set
			result = {
					classes: [], 
					classNames: [],
					length: uniquePasswordLetters.size, 
					entropy: 0,
					max_entropy_scale: ENTROPY_SCALE_MAX
				},
			i,
			foundClass = function(ecj) {
				if (!entropyClassnamesFound.has(ecj.desc)) {
					entropyClassnamesFound.add(ecj.desc);
					result.classes.push(ecj);
				}
			};

		for(let pci of uniquePasswordLetters) {
			debug("entropy code point:", pci);
			// first find the right class
			for(let j = 0; j < ENTROPY_CLASSES.length; j++) {
				let ecj = ENTROPY_CLASSES[j],
					found = false;
				debug("entropy - ecj ==", ecj);
				if (_.has(ecj, "range")) {
					for (let k = 0; k < ecj.range.length; k += 2) {
						if (inRange(pci, ecj.range[k], ecj.range[k+1])) {
							foundClass(ecj);
							found = true;
							break;
						}
					}
					if (found) {
						break;
					}
				} else if(_.has(ecj, "test")) {
					if (ecj.test(pci)) {
						foundClass(ecj);
						break;
					}
				}
			}
		}

		// TODO filter out "cancel"s so hanzi scores cancel commonhanzi scores.

		for (let i = 0; i < result.classes.length; i++) {
			if (_.has(result.classes[i], 'cancel')) {
				for (let j = 0; j < result.classes[i].cancel.length; j++ ) {
					cancelations.add(result.classes[i].cancel[j]);
				}
			}
		}

		for (i = 0; i < result.classes.length; i++) {
			debug("entropy - result class:", result.classes[i]);
			if (cancelations.has(result.classes[i].desc)) {
				continue;
			}
			result.entropy += result.classes[i].score;
			result.classNames.push(result.classes[i].desc)
		}
		result.entropy *= result.length;

		debug("entropy - result:", result);

		// get the acceptability range
		i = ENTROPY_RANGES.length;
		while(i--) {
			if (result.entropy < ENTROPY_RANGES[i].max) {
				result.acceptable = ENTROPY_RANGES[i].acceptable;
				result.ideal = ENTROPY_RANGES[i].ideal;
			} else {
				break;
			}
		}

		delete result.classes;

		debug("entropy - returns", result);

		_cb && _cb(null, result);
	}

};
