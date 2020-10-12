/*
	Clip v1.5.0
	© October 2020, Paul Chiorean
	Clip selected objects in a "<clip frame>", or restores them
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;

var sel = doc.selection;
if (sel.length == 0 || (sel[0].constructor.name == "Guide")) {
	alert("Select an object and try again."); exit();
}
// Remember layers for grouping/ungrouping
var set_URL = app.generalPreferences.ungroupRemembersLayers;
var set_PRL = app.clipboardPreferences.pasteRemembersLayers;
app.generalPreferences.ungroupRemembersLayers = true;
app.clipboardPreferences.pasteRemembersLayers = true;
// If multiple selection, group it
if (sel.length > 1) {
	var selArray = [];
	for (var i = 0; i < sel.length; i++) if (!sel[i].locked) selArray.push(sel[i]);
	sel = doc.groups.add(selArray);
	sel.name = "<clip group>";
} else sel = sel[0];
Clip(sel);
// Restore layer grouping settings
app.generalPreferences.ungroupRemembersLayers = set_URL;
app.clipboardPreferences.pasteRemembersLayers = set_PRL;


function Clip(obj) {
	// Undo if already clipped
	if (obj.name == "<clip frame>" && obj.pageItems[0].isValid) {
		var objD = obj.pageItems[0].duplicate();
		objD.label = obj.label;
		objD.sendToBack(obj); obj.remove(); obj = objD; app.select(obj);
		if (obj.name == "<clip group>") {
			var sel_BAK = obj.pageItems.everyItem().getElements();
			obj.ungroup(); app.select(sel_BAK);
		}
		return obj;
	}
	// Clip!
	var size = obj.visibleBounds;
	var frame = doc.rectangles.add(
		obj.itemLayer, LocationOptions.AFTER, obj,
		{ name: "<clip frame>", label: obj.label,
		fillColor: "None", strokeColor: "None",
		geometricBounds: size });
	frame.sendToBack(obj); app.select(obj); app.cut(); app.select(frame); app.pasteInto();
	obj = frame; return obj;
}
