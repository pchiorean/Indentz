/*
	Used fonts 1.1.1
	© May 2020, Paul Chiorean
	This script makes a list of the fonts used in the current document.
*/

if (app.documents.length == 0) exit();
var usedFonts = app.activeDocument.fonts.everyItem().getElements();
var fontName1 = [], fontName2 = [], fontName3 = [], fontName4 = [], fontName5 = [];

for (var i = 0; i < usedFonts.length; i++) {
	switch (String(usedFonts[i].status)) {
		case "INSTALLED":
			fontName1.push(usedFonts[i].fontFamily + " " + usedFonts[i].fontStyleName);
			break;
		case "SUBSTITUTED":
			fontName2.push(usedFonts[i].fontFamily + " " + usedFonts[i].fontStyleName);
			break;
		case "FAUXED":
			fontName3.push(usedFonts[i].fontFamily + " " + usedFonts[i].fontStyleName);
			break;
		case "NOT_AVAILABLE":
			fontName4.push(usedFonts[i].fontFamily + " " + usedFonts[i].fontStyleName);
			break;
		case "UNKNOWN":
			fontName5.push(usedFonts[i].fontFamily + " " + usedFonts[i].fontStyleName);
			break;
	}
}

var fontList = "INSTALLED:\r" + fontName1.join("\n") +
	"\r\rSUBSTITUTED:\r" + fontName2.join("\n") +
	"\r\rFAUXED:\r" + fontName3.join("\n") +
	"\r\rNOT_AVAILABLE:\r" + fontName4.join("\n") +
	"\r\rUNKNOWN:\r" + fontName5.join("\n");

var w = new Window('dialog { text: "Document fonts", alignChildren: "right" }');
w.ed = w.add('edittext', [0, 0, 400, 600], fontList, { multiline: true });
w.buttons = w.add('group');
w.close = w.buttons.add('button { text: "Close", properties: { name: "cancel" } }');
w.show();