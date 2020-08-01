/*
	E grid 1.1.0
	© July 2020, Paul Chiorean
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;

for (var i = 0; i < doc.pages.length; i++) {
	var szPg = {
		width: doc.pages[i].bounds[3] - doc.pages[i].bounds[1],
		height: doc.pages[i].bounds[2] - doc.pages[i].bounds[0]
	}
	switch (szPg.width / szPg.height <= 1) {
		case true: // Portrait
			// Margin = 10% of page width
			// Columns = 6, zero gutter
			var mg = szPg.width * 0.1, cols = 6;
			var kTB = kLR = 1;
			break;
		case false: // Landscape
			// Margin = 5% of page width
			// Columns = 12, zero gutter
			var mg = szPg.width * 0.1 / 2, cols = 12;
			// Half margins for XL formats
			var kTB = (szPg.width / szPg.height >= 3) ? 0.5 : 1;
			var kLR = 1;
			break;
	}
	// Set margins
	doc.pages[i].marginPreferences.properties = {
		top: mg * kTB, left: mg * kLR, bottom: mg * kTB + szPg.height / 10, right: mg * kLR,
		columnCount: cols, columnGutter: 0
	}
}