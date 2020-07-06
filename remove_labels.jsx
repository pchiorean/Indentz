/*
	Remove BR labels v1.0.2
	© July 2020, Paul Chiorean
	This script cleans up the auto alinment labels used by batch_resize.jsx.
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;
var item, items = doc.allPageItems;

while (item = items.shift()) {
	switch (item.label) {
		case "alignL":
		case "alignR":
		case "alignT":
		case "alignB":
		case "alignCh":
		case "alignCv":
		case "alignC":
		case "fit":
		case "expand":
		case "bleed":
			item.label = "";
	}
}