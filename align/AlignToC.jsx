/*
	Align to center v1.2.1
	© September 2020, Paul Chiorean
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;

var items = doc.selection;
if (items.length == 0 || (items[0].constructor.name == "Guide")) exit();

var set_ADB = app.alignDistributePreferences.alignDistributeBounds;
if (doc.selectionKeyObject != undefined) set_ADB = AlignDistributeBounds.KEY_OBJECT;

switch (SelectOption()) {
	case 0:
		doc.align(items, AlignOptions.HORIZONTAL_CENTERS, set_ADB, doc.selectionKeyObject);
		break;
	case 1:
		doc.align(items, AlignOptions.VERTICAL_CENTERS, set_ADB, doc.selectionKeyObject);
		break;
	case 2:
		doc.align(items, AlignOptions.HORIZONTAL_CENTERS, set_ADB, doc.selectionKeyObject);
		doc.align(items, AlignOptions.VERTICAL_CENTERS, set_ADB, doc.selectionKeyObject);
		break;
}


function SelectOption() {
	var w = new Window("dialog", "Select alignment");
		w.orientation = "row";
		w.alignChildren = ["center","top"];
	var center = w.add("panel {text: 'Center'}");
		center.spacing = 5;
		center.margins = [10,15,10,12];
		center.orientation = "column";
		center.alignChildren = ["left","top"];
		center.add("radiobutton {text: 'Horizontal'}");
		center.add("radiobutton {text: 'Vertical'}");
		center.add("radiobutton {text: 'Both'}");
		center.children[0].active = center.children[0].value = true;
	var okcancel = w.add("group", undefined, {name: "okcancel"});
		okcancel.orientation = "column";
		okcancel.alignChildren = ["fill","top"];
		okcancel.add("button {text: 'Ok', name: 'ok'}");
		okcancel.add("button {text: 'Cancel', name: 'cancel'}");
	if (w.show() == 2) exit();
	for (i = 0; i < center.children.length; i++)
		if (center.children[i].value == true) return i;
}
