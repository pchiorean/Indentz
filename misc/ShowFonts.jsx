/*
	Show used fonts 1.4.1 (2021-06-28)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Shows all fonts used in the current document.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (app.documents.length == 0) exit();
var usedFonts = app.activeDocument.fonts.everyItem().getElements();
var fontName1 = [], fontName2 = [], fontName3 = [], fontName4 = [], fontName5 = [];

for (var i = 0; i < usedFonts.length; i++) {
	switch (String(usedFonts[i].status)) {
		case "INSTALLED": fontName1.push(usedFonts[i].fontFamily + "\t" + usedFonts[i].fontStyleName); break;
		case "SUBSTITUTED": fontName2.push(usedFonts[i].fontFamily + "\t" + usedFonts[i].fontStyleName); break;
		case "FAUXED": fontName3.push(usedFonts[i].fontFamily + "\t" + usedFonts[i].fontStyleName); break;
		case "NOT_AVAILABLE": fontName4.push(usedFonts[i].fontFamily + "\t" + usedFonts[i].fontStyleName); break;
		case "UNKNOWN": fontName5.push(usedFonts[i].fontFamily + "\t" + usedFonts[i].fontStyleName); break;
	}
}

var fontList = "INSTALLED:\n\n" + fontName1.join("\n") +
	"\n\nSUBSTITUTED:\n\n" + fontName2.join("\n") +
	"\n\nFAUXED:\n\n" + fontName3.join("\n") +
	"\n\nNOT_AVAILABLE:\n\n" + fontName4.join("\n") +
	"\n\nUNKNOWN:\n\n" + fontName5.join("\n");

Report(fontList, "Document fonts");


// Inspired by this scrollable alert by Peter Kahrel:
// http://web.archive.org/web/20100807190517/http://forums.adobe.com/message/2869250#2869250
function Report(msg, title, /*bool*/filter, /*bool*/compact) {
	if (msg instanceof Array) msg = msg.join("\n"); msg = msg.split(/\r|\n/g);
	if (compact && msg.length > 1) {
		msg = msg.sort();
		for (var i = 1, l = msg[0]; i < msg.length; l = msg[i], i++)
			if (l == msg[i] || msg[i] == "") { msg.splice(i, 1); i-- };
	};
	var w = new Window('dialog', title);
	if (filter && msg.length > 1) var search = w.add('edittext { characters: 40, \
		helpTip: "Special operators: \'?\' (any character), space and \'*\' (and), \'|\' (or)" }');
	var list = w.add('edittext', undefined, msg.join("\n"), { multiline: true, scrolling: true, readonly: true });
	w.add('button { text: "Close", properties: { name: "ok" } }');
	list.characters = (function() {
		for (var i = 0, width = 50; i < msg.length;
		width = Math.max(width, msg[i].toString().length), i++);
		return width;
	})();
	list.minimumSize.width = 600, list.maximumSize.width = 1024;
	list.minimumSize.height = 100, list.maximumSize.height = 1024;
	w.ok.active = true;
	if (filter && msg.length > 1) {
		search.onChanging = function() {
			if (this.text == "") { list.text = msg.join("\n"); w.text = title; return };
			var str = this.text.replace(/[.\[\]{+}]/g, "\\$&"); // Pass through '^*()|?'
			str = str.replace(/\?/g, "."); // '?' -> any character
			if (/[ *]/g.test(str)) str = "(" + str.replace(/ +|\*/g, ").*(") + ")"; // space or '*' -> AND
			str = RegExp(str, "gi");
			for (var i = 0, result = []; i < msg.length; i++) {
				var line = msg[i].toString().replace(/^\s+?/g, "");
				if (str.test(line)) result.push(line.replace(/\r|\n/g, "\u00b6").replace(/\t/g, "\\t"));
			};
			w.text = str + " | " + result.length + " record" + (result.length == 1 ? "" : "s");
			if (result.length > 0) { list.text = result.join("\n") } else list.text = "";
		};
	};
	w.show();
};
