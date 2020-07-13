/*
	Cleanup BR labels v1.0.3
	© July 2020, Paul Chiorean
	Removes all auto alignment labels used by BatchResize.jsx.
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