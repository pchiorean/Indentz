/*
	Cleanup labels v1.0.1
	© July 2020, Paul Chiorean
	Removes all labels from the document.
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;
var item, items = doc.allPageItems;

while (item = items.shift()) item.label = "";