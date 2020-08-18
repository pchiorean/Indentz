/*
	Align to right v1.1.0
	© August 2020, Paul Chiorean
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;

var items = doc.selection;
if (items.length == 0 || (items[0].constructor.name == "Guide")) exit();

var set_ADB = app.alignDistributePreferences.alignDistributeBounds;
if (doc.selectionKeyObject != undefined) set_ADB = AlignDistributeBounds.KEY_OBJECT;

doc.align(items, AlignOptions.RIGHT_EDGES, set_ADB, doc.selectionKeyObject);
