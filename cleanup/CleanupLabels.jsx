/*
	Cleanup labels v1.1.1
	© August 2020, Paul Chiorean
	Removes all labels from the document.
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;

var item, items = doc.selection.length == 0 ? doc.allPageItems : doc.selection;
while (item = items.shift()) item.label = "";
