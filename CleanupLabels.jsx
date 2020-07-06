/*
	Remove all labels v1.0.0
	© July 2020, Paul Chiorean
	This script removes all labels from the document.
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;
var item, items = doc.allPageItems;

while (item = items.shift()) item.label = "";