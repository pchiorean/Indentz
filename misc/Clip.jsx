/*
	Clip v2.5.3 (2021-06-07)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Clips selected objects in a "<clip frame>", or restores them.

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

app.doScript(Clip, ScriptLanguage.javascript, items,
	UndoModes.ENTIRE_SCRIPT, "Clipping");

// Restore layer grouping settings
app.generalPreferences.ungroupRemembersLayers = oldURL;
app.clipboardPreferences.pasteRemembersLayers = oldPRL;


function Clip(items) {
	// Undo if already clipped
	if (items.length == 1 &&
			(items[0].name == "<clip frame>" ||
			 items[0].name == "<auto clip frame>")) {
		UndoClip(items[0]); exit() }

	var obj = items[0];
	var size = obj.visibleBounds;
	// If multiple objects are selected, group them
	if (items.length > 1) {
		var objects = [];
		for (var i = 0; i < items.length; i++)
			if (!items[i].locked) objects.push(items[i]);
		obj = doc.groups.add(objects);
		obj.name = "<auto clip group>";
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
		{ name: "<clip frame>", label: obj.label,
		fillColor: "None", strokeColor: "None",
		geometricBounds: size });
	clipFrame.sendToBack(obj);
	app.select(obj); app.cut(); app.select(clipFrame); app.pasteInto();
}

function UndoClip(clipFrame) {
	var child = clipFrame.pageItems[0].duplicate();
	child.sendToBack(clipFrame); clipFrame.remove();
	app.select(child);
	if (child.name == "<clip group>" || child.name == "<auto clip group>") {
		var selBAK = child.pageItems.everyItem().getElements();
		child.ungroup();
		app.select(selBAK);
	}
}
