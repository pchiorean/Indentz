/*
	Show used fonts 1.2.2 (2021-04-20)
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

var fontList = "INSTALLED:\r" + fontName1.join("\n") +
	"\r\rSUBSTITUTED:\r" + fontName2.join("\n") +
	"\r\rFAUXED:\r" + fontName3.join("\n") +
	"\r\rNOT_AVAILABLE:\r" + fontName4.join("\n") +
	"\r\rUNKNOWN:\r" + fontName5.join("\n");

AlertScroll("Document fonts", fontList);


// Modified from 'Scrollable alert' by Peter Kahrel
// http://forums.adobe.com/message/2869250#2869250
function AlertScroll(title, input) {
	if (input instanceof Array) input = input.join("\r");
	var lines = input.split(/\r|\n/g);
	var w = new Window("dialog", title);
	var list = w.add("edittext", undefined, input, { multiline: true, scrolling: true, readonly: true });
	list.characters = (function() {
		for (var i = 0, width = 50; i < lines.length; i++) width = Math.max(width, lines[i].length);
		return width;
	})();
	list.minimumSize.width = 100; list.maximumSize.width = 1024;
	list.minimumSize.height = 100; list.maximumSize.height = 1024;
	w.add("button", undefined, "Close", { name: "ok" });
	w.ok.active = true;
	w.show();
}
