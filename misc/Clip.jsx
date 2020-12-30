/*
	Clip v2.4.0
	© December 2020, Paul Chiorean
	Clip selected objects in a "<clip frame>", or restores them
*/

if (!(doc = app.activeDocument)) exit();
var items = doc.selection;
if (items.length == 0 || (items[0].constructor.name == "Guide")) {
	alert("Select an object and try again."); exit();
}
// Remember layers for grouping/ungrouping
var set_URL = app.generalPreferences.ungroupRemembersLayers;
var set_PRL = app.clipboardPreferences.pasteRemembersLayers;
app.generalPreferences.ungroupRemembersLayers = true;
app.clipboardPreferences.pasteRemembersLayers = true;

app.doScript(Clip, ScriptLanguage.javascript, items,
	UndoModes.ENTIRE_SCRIPT, "Clipping");

// Restore layer grouping settings
app.generalPreferences.ungroupRemembersLayers = set_URL;
app.clipboardPreferences.pasteRemembersLayers = set_PRL;


function Clip(items) {
	// Undo if already clipped
	if (items.length == 1 && (items[0].name == "<clip frame>" || items[0].name == "<auto clip frame>")) {
		UndoClip(items[0]); exit() }
	// Filter selection and get a single object
	if (items.length > 1) {
		var selArray = [];
		for (var i = 0; i < items.length; i++) if (!items[i].locked) selArray.push(items[i]);
		var obj = doc.groups.add(selArray);
		obj.name = "<auto clip group>";
	} else var obj = items[0];
	// Clip
	var clipFrame = doc.rectangles.add(
		obj.itemLayer,
		LocationOptions.AFTER, obj,
		{ name: "<clip frame>", label: obj.label,
		fillColor: "None", strokeColor: "None",
		geometricBounds: obj.visibleBounds });
	clipFrame.sendToBack(obj);
	app.select(obj); app.cut(); app.select(clipFrame); app.pasteInto();
}

function UndoClip(clipFrame) {
	var child = clipFrame.pageItems[0].duplicate();
	child.sendToBack(clipFrame); clipFrame.remove();
	app.select(child);
	if (child.name == "<clip group>" || child.name == "<auto clip group>") {
		var sel_BAK = child.pageItems.everyItem().getElements();
		child.ungroup();
		app.select(sel_BAK);
	}
}
