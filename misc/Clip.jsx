/*
	Clip v2.6.2 (2021-08-16)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Clips selected objects in a clipping frame (or releases them if already clipped).

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument)) exit();
var items = doc.selection;
if (items.length == 0 || (items[0].constructor.name == "Guide")) {
	alert("Select an object and try again."); exit();
}
// Remember layers for grouping/ungrouping
var oldURL = app.generalPreferences.ungroupRemembersLayers;
var oldPRL = app.clipboardPreferences.pasteRemembersLayers;
app.generalPreferences.ungroupRemembersLayers = true;
app.clipboardPreferences.pasteRemembersLayers = true;
var clippingFrameRE = /^\<(auto )?clip(ping)? frame\>$/i;
var clippingGroupRE = /^\<(auto )?clip(ping)? group\>$/i;

app.doScript(Clip, ScriptLanguage.javascript, items,
	UndoModes.ENTIRE_SCRIPT, "Clipping");

// Restore layer grouping settings
app.generalPreferences.ungroupRemembersLayers = oldURL;
app.clipboardPreferences.pasteRemembersLayers = oldPRL;


function Clip(items) {
	// Undo if already clipped
	if (items.length == 1 && clippingFrameRE.test(items[0].name)) { UndoClip(items[0]); exit() }
	// Clip
	try {
		var obj = items[0];
		var size = obj.visibleBounds;
		// If multiple objects are selected, group them
		if (items.length > 1) {
			var objects = [];
			for (var i = 0, n = items.length; i < n; i++) if (!items[i].locked) objects.push(items[i]);
			obj = doc.groups.add(objects);
			obj.name = "<auto clipping group>";
			size = obj.geometricBounds;
		}
		// Special case: text frames
		else if (items.length == 1 &&
			items[0].constructor.name == "TextFrame" &&
			(items[0].contents.replace(/^\s+|\s+$/g, "")).length > 0) {
			var outlines = items[0].createOutlines(false);
			size = [
				obj.geometricBounds[0], outlines[0].geometricBounds[1],
				obj.geometricBounds[2], outlines[0].geometricBounds[3]
			];
			outlines[0].remove();
		}
		var clipFrame = doc.rectangles.add(
			obj.itemLayer,
			LocationOptions.AFTER, obj,
			{ name: "<clipping frame>", label: obj.label,
			fillColor: "None", strokeColor: "None",
			geometricBounds: size });
		clipFrame.sendToBack(obj);
		app.select(obj); app.cut(); app.select(clipFrame); app.pasteInto();
	} catch (e) { alert("Can't clip this object.\nTry selecting the parent."); return }
}

function UndoClip(clipFrame) {
	var child = clipFrame.pageItems[0].duplicate();
	child.sendToBack(clipFrame); clipFrame.remove();
	app.select(child);
	if (clippingGroupRE.test(child.name)) {
		var selBAK = child.pageItems.everyItem().getElements();
		child.ungroup();
		app.select(selBAK);
	}
}
