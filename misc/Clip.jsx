/*
	Clip v2.0.0
	© November 2020, Paul Chiorean
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
	if (items.length == 1 &&
		(items[0].name == "<clip frame>" || items[0].name == "<auto clip frame>") &&
		items[0].pageItems[0].isValid) {
			UndoClip(items[0]);
			exit()
	}
	// Filter selection and get a single object
	if (items.length == 1 && items[0].constructor.name == "TextFrame") {
		var obj = doc.groups.add([
			items[0],
			doc.rectangles.add(
				items[0].itemLayer,
				LocationOptions.BEFORE, items[0],
				{
					name: "<temp frame>",
					fillColor: "None", strokeColor: "None",
					geometricBounds: items[0].visibleBounds
				})
			],
			{ name: "<clip group>" });
	} else if (items.length > 1) {
		var selArray = [];
		for (var i = 0; i < items.length; i++) if (!items[i].locked) selArray.push(items[i]);
		var obj = doc.groups.add(selArray);
		obj.name = "<clip group>";
	} else var obj = items[0];
	// Clip!
	var size = obj.visibleBounds,
		sizeBAK = obj.geometricBounds;
	var frame = doc.rectangles.add(
		obj.itemLayer,
		LocationOptions.AFTER,
		obj,
		{
			name: "<clip frame>",
			label: obj.label,
			fillColor: "None",
			strokeColor: "Magenta",
			strokeWeight: "0.5pt",
			strokeAlignment: StrokeAlignment.INSIDE_ALIGNMENT,
			strokeType: "$ID/Canned Dashed 3x2",
			geometricBounds: size
		});
	frame.contentPlace(obj);
	obj.remove();
	obj = frame;
	obj.pageItems[0].geometricBounds = sizeBAK;
	app.select(obj);
	return obj;
}

function UndoClip(obj) {
	var o = obj.pageItems[0].duplicate();
	o.label = obj.label;
	o.sendToBack(obj);
	obj.remove();
	obj = o;
	app.select(obj);
	if (obj.name == "<clip group>") {
		try { obj.pageItems.item("<temp frame>").remove() } catch (_) {};
		var sel_BAK = obj.pageItems.everyItem().getElements();
		obj.ungroup();
		app.select(sel_BAK);
	}
	return obj;
}
