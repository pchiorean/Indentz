/*
	Clip v1.1.0
	© September 2020, Paul Chiorean
	Clip selected objects in a "\<clip frame\>", or restores them
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;

var sel = doc.selection;
if (sel.length == 0 || (sel[0].constructor.name == "Guide")) {
	alert("Select an object and try again."); exit();
}
// Get selection's parent page
var page;
for (var i = 0; i < sel.length; i++) {
	if (sel[i].parentPage != null) { page = doc.pages[sel[i].parentPage.documentOffset]; break };
}
if (page == null) { alert("Select an object on page and try again."); exit() };
// Remember layers for grouping/ungrouping
var set_URL = app.generalPreferences.ungroupRemembersLayers;
var set_PRL = app.clipboardPreferences.pasteRemembersLayers;
app.generalPreferences.ungroupRemembersLayers = true;
app.clipboardPreferences.pasteRemembersLayers = true;

if (sel.length > 1) { // If multiple selection, group it
	var selArray = [];
	for (var i = 0; i < sel.length; i++) if (!sel[i].locked) selArray.push(sel[i]);
	sel = page.groups.add(selArray);
	sel.name = "<clip group>";
} else sel = sel[0];
Fit2Bounds(sel, page);

// Restore layer grouping settings
app.generalPreferences.ungroupRemembersLayers = set_URL;
app.clipboardPreferences.pasteRemembersLayers = set_PRL;


function Fit2Bounds(obj, page) {
	// Undo if already clipped
	if (obj.name == "<clip frame>" && obj.pageItems[0].isValid) {
		var objD = obj.pageItems[0].duplicate();
		objD.label = obj.label;
		objD.sendToBack(obj); obj.remove(); obj = objD;
		if (obj.name == "<clip group>" ||
			(obj.constructor.name == "Rectangle" && obj.groups.length == 1)) {
			var sel_BAK = obj.pageItems.everyItem().getElements();
			obj.ungroup(); app.select(sel_BAK);
		} else { app.select(obj) };
		return obj;
	}
	// Compute bounds
	var objBounds = obj.visibleBounds;
	var size = [
		objBounds[2] > page.bounds[0] ? Math.max(objBounds[0], page.bounds[0]) : objBounds[0], // top
		objBounds[3] > page.bounds[1] ? Math.max(objBounds[1], page.bounds[1]) : objBounds[1], // left
		objBounds[0] < page.bounds[2] ? Math.min(objBounds[2], page.bounds[2]) : objBounds[2], // bottom
		objBounds[1] < page.bounds[3] ? Math.min(objBounds[3], page.bounds[3]) : objBounds[3]  // right
	];
	// Clip!
	var frame = page.rectangles.add(
		obj.itemLayer,
		LocationOptions.AFTER, obj,
		{
			name: "<clip frame>", label: obj.label,
			fillColor: "None", strokeColor: "None",
			geometricBounds: size
		}
	);
	frame.sendToBack(obj); app.select(obj); app.cut(); app.select(frame); app.pasteInto();
	obj = frame; return obj;
}
