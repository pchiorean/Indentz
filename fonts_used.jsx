/*
	Used fonts 1.0.0
	© April 2020, Paul Chiorean
	This script replaces missing or unwanted fonts with their equivalents.
*/

var usedFonts = app.activeDocument.fonts;
var fontName1 = [], fontName2 = [];
for (var i = 0; i < usedFonts.length; i++) {
	if (usedFonts[i].status == FontStatus.INSTALLED) {
		fontName1.push(usedFonts[i].fontFamily + " " + usedFonts[i].fontStyleName);
	} else {
		fontName2.push(usedFonts[i].fontFamily + " " + usedFonts[i].fontStyleName);
	}
}
alert("Fonts used:\r" + fontName1.join("\n") + "\r\rMissing:\r" + fontName2.join("\n"));
