/*
	Show used fonts 1.3 (2021-05-16)
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

AlertScroll("Document fonts", fontList);


// Modified from 'Scrollable alert' by Peter Kahrel
// http://forums.adobe.com/message/2869250#2869250
function AlertScroll(title, msg, /*bool*/filter) {
	if (msg instanceof Array) msg = msg.join("\n");
	var msgArray = msg.split(/\r|\n/g);
	var w = new Window("dialog", title);
	if (filter) var search = w.add("edittext { characters: 40 }");
	var list = w.add("edittext", undefined, msg, { multiline: true, scrolling: true, readonly: true });
	list.characters = (function() {
		for (var i = 0, width = 50; i < msgArray.length; i++) width = Math.max(width, msgArray[i].length);
		return width;
	})();
	list.minimumSize.width = 100; list.maximumSize.width = 1024;
	list.minimumSize.height = 100; list.maximumSize.height = 1024;
	w.add("button", undefined, "Close", { name: "ok" });
	w.ok.active = true;
	if (filter) search.onChanging = function() {
		var result = [];
		for (var i = 0; i < msgArray.length; i++)
			if (msgArray[i].toLowerCase().indexOf(this.text) != -1) result.push(msgArray[i]);
		if (result.length > 0) list.text = result.join("\n")
		else list.text = "Nothing found."
	};
	w.show();
};
