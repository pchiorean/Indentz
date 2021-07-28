/*
	Show color profiles 1.4.2 (2021-07-28)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Shows all color profiles available to the document.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (app.documents.length == 0) exit();
var profilesCMYK = app.activeDocument.cmykProfileList;
var profilesRGB = app.activeDocument.rgbProfileList;
var result = [];
result.push('CMYK Profiles:\n');
result.push(profilesCMYK.join("\n"));
result.push('\nRGB Profiles:\n');
result.push(profilesRGB.join("\n"));

Report(result, "Color Profiles", true);


/**
 * Simple scrollable alert inspired by this snippet by Peter Kahrel:
 * http://web.archive.org/web/20100807190517/http://forums.adobe.com/message/2869250#2869250
 * @param {string|string[]} message - Message to be displayed (string or array)
 * @param {string} title - Dialog title
 * @param {boolean} [showFilter] - Shows a filtering field; wildcards: '?' (any char), space and '*' (AND), '|' (OR)
 * @param {boolean} [showCompact] - Sorts message and removes duplicates
 */
function Report(message, title, showFilter, showCompact) {
	if (message instanceof Array) message = message.join("\n"); message = message.split(/\r|\n/g);
	if (showCompact && message.length > 1) {
		message = message.sort();
		for (var i = 1, l = message[0]; i < message.length; l = message[i], i++)
			if (l == message[i] || message[i] == "") { message.splice(i, 1); i-- };
	};
	var w = new Window('dialog', title);
	if (showFilter && message.length > 1) var search = w.add('edittext { characters: 40, \
		helpTip: "Wildcards: \'?\' (any character), space and \'*\' (AND), \'|\' (OR)" }');
	var list = w.add('edittext', undefined, message.join("\n"), { multiline: true, scrolling: true, readonly: true });
	w.add('button { text: "Close", properties: { name: "ok" } }');
	list.characters = (function() {
		for (var i = 0, width = 50; i < message.length;
		width = Math.max(width, message[i].toString().length), i++);
		return width;
	})();
	list.minimumSize.width = 600, list.maximumSize.width = 1024;
	list.minimumSize.height = 100, list.maximumSize.height = 1024;
	w.ok.active = true;
	if (search) {
		search.onChanging = function() {
			if (this.text == "") { list.text = message.join("\n"); w.text = title; return };
			var str = this.text.replace(/[.\[\]{+}]/g, "\\$&"); // Pass through '^*()|?'
			str = str.replace(/\?/g, "."); // '?' -> any character
			if (/[ *]/g.test(str)) str = "(" + str.replace(/ +|\*/g, ").*(") + ")"; // space or '*' -> AND
			str = RegExp(str, "gi");
			for (var i = 0, result = []; i < message.length; i++) {
				var line = message[i].toString().replace(/^\s+?/g, "");
				if (str.test(line)) result.push(line.replace(/\r|\n/g, "\u00b6").replace(/\t/g, "\\t"));
			};
			w.text = str + " | " + result.length + " record" + (result.length == 1 ? "" : "s");
			if (result.length > 0) { list.text = result.join("\n") } else list.text = "";
		};
	};
	w.show();
};
