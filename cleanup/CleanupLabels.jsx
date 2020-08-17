/*
	Cleanup labels v1.1.0
	© August 2020, Paul Chiorean
	Removes all labels from the document.
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;

if (doc.selection.length == 0) {
	var item, items = doc.allPageItems;
} else {
	var item, items = doc.selection;
}
while (item = items.shift()) item.label = "";