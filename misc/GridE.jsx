/*
	E grid 1.0.1
	© July 2020, Paul Chiorean
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;

for (var i = 0; i < doc.pages.length; i++) {
	var szPg = {
		width: doc.pages[i].bounds[3] - doc.pages[i].bounds[1],
		height: doc.pages[i].bounds[2] - doc.pages[i].bounds[0]
	}
	var mg = szPg.width * 0.1, cols = 6; // Default: portrait
	if (szPg.width / szPg.height > 1) { mg = mg / 2; cols = cols * 2 }; // Landscape
	doc.pages[i].marginPreferences.properties = {
		top: mg, left: mg, bottom: mg + szPg.height / 10, right: mg,
		columnCount: cols, columnGutter: 0
	}
}