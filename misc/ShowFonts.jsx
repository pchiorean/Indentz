/*
	Show used fonts 1.4.4 (2021-09-14)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Shows all fonts used in the current document.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (app.documents.length === 0) exit();

var f = {
	installed: [],
	substituted: [],
	fauxed: [],
	notAvailable: [],
	unknown: []
};
var usedFonts = app.activeDocument.fonts.everyItem().getElements();

for (var i = 0, n = usedFonts.length; i < n; i++) {
	switch (String(usedFonts[i].status)) {
		case 'INSTALLED':     f.installed.push(usedFonts[i].fontFamily    + '\t' + usedFonts[i].fontStyleName); break;
		case 'SUBSTITUTED':   f.substituted.push(usedFonts[i].fontFamily  + '\t' + usedFonts[i].fontStyleName); break;
		case 'FAUXED':        f.fauxed.push(usedFonts[i].fontFamily       + '\t' + usedFonts[i].fontStyleName); break;
		case 'NOT_AVAILABLE': f.notAvailable.push(usedFonts[i].fontFamily + '\t' + usedFonts[i].fontStyleName); break;
		case 'UNKNOWN':       f.unknown.push(usedFonts[i].fontFamily      + '\t' + usedFonts[i].fontStyleName); break;
	}
}

report(
	'INSTALLED:\n\n'     + f.installed.join('\n')    + '\n\n' +
	'SUBSTITUTED:\n\n'   + f.substituted.join('\n')  + '\n\n' +
	'FAUXED:\n\n'        + f.fauxed.join('\n')       + '\n\n' +
	'NOT_AVAILABLE:\n\n' + f.notAvailable.join('\n') + '\n\n' +
	'UNKNOWN:\n\n'       + f.unknown.join('\n'),
	'Document fonts'
);

/**
 * Displays a message in a scrollable list with optional filtering and/or compact mode.
 * Inspired by this snippet by Peter Kahrel:
 * http://web.archive.org/web/20100807190517/http://forums.adobe.com/message/2869250#2869250
 * @version 2.0 (2021-09-12)
 * @author Paul Chiorean <jpeg@basement.ro>
 * @license MIT
 * @param {String|String[]} message - Message to be displayed (string or array)
 * @param {String} title - Dialog title
 * @param {Boolean} [showFilter] - Shows a filtering field; wildcards: '?' (any char), space and '*' (AND), '|' (OR)
 * @param {Boolean} [showCompact] - Sorts message and removes duplicates
 */
function report(message, title, showFilter, showCompact) {
	var search, list;
	var w = new Window('dialog', title);
	// Convert message to array
	if (message.constructor.name !== 'Array') message = message.split(/\r|\n/g);
	if (showCompact && message.length > 1) { // Sort and remove duplicates
		message = message.sort();
		for (var i = 1, l = message[0]; i < message.length; l = message[i], i++) {
			if (l === message[i]) { message.splice(i, 1); i--; }
			if (message[i] === '') { message.splice(i, 1); i--; }
		}
	}
	if (showFilter && message.length > 1) { // Add a filtering field
		search = w.add('edittext { characters: 40, helpTip: "Wildcards: \'?\' (any character), space and \'*\' (AND), \'|\' (OR)" }');
		search.onChanging = function () {
			var str, line, i, n;
			var result = [];
			if (this.text === '') {
				list.text = message.join('\n'); w.text = title; return;
			}
			str = this.text.replace(/[.[\]{+}]/g, '\\$&'); // Pass through '^*()|?'
			str = str.replace(/\?/g, '.'); // '?' -> any character
			if (/[ *]/g.test(str)) str = '(' + str.replace(/ +|\*/g, ').*(') + ')'; // space or '*' -> AND
			str = RegExp(str, 'gi');
			for (i = 0, n = message.length; i < n; i++) {
				line = message[i].toString().replace(/^\s+?/g, '');
				if (str.test(line)) result.push(line.replace(/\r|\n/g, '\u00b6').replace(/\t/g, '\\t'));
			}
			w.text = str + ' | ' + result.length + ' record' + (result.length === 1 ? '' : 's');
			if (result.length > 0) list.text = result.join('\n'); else list.text = '';
		};
	}
	list = w.add('edittext', undefined, message.join('\n'), { multiline: true, scrolling: true, readonly: true });
	list.characters = (function () {
		var width = 50;
		for (var i = 0, n = message.length; i < n; width = Math.max(width, message[i].toString().length), i++);
		return width;
	}());
	list.minimumSize.width  = 600; list.maximumSize.width  = 1024;
	list.minimumSize.height = 100; list.maximumSize.height = 1024;
	w.add('button { text: "Close", properties: { name: "ok" } }');
	w.ok.active = true;
	w.show();
}
