/*
	Clip v2.1.0
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
	if (items.length == 1
		&& (items[0].name == "<clip frame>" || items[0].name == "<auto clip frame>")
		&& items[0].pageItems[0].isValid) { UndoClip(items[0]); exit() }
	// Filter selection and get a single object
	if (items.length == 1
		&& (items[0].constructor.name == "TextFrame"
		|| (items[0].constructor.name != "Group" && items[0].pageItems[0].isValid))) {
		var obj = doc.groups.add([
			items[0],
			doc.rectangles.add(
				items[0].itemLayer,
				LocationOptions.BEFORE, items[0],
				{ name: "<temp frame>",
				fillColor: "None", strokeColor: "None",
				geometricBounds: items[0].visibleBounds })
			],
			{ name: "<clip group>" });
		obj.pageItems.item("<temp frame>").remove();
	} else if (items.length > 1) {
		var selArray = [];
		for (var i = 0; i < items.length; i++) if (!items[i].locked) selArray.push(items[i]);
		var obj = doc.groups.add(selArray);
		obj.name = "<clip group>";
	} else var obj = items[0];
	// Clip!
	var frame = doc.rectangles.add(
		obj.itemLayer,
		LocationOptions.AFTER, obj,
		{ name: "<clip frame>", label: obj.label,
		fillColor: "None", strokeColor: "None",
		// strokeColor: "Yellow", strokeWeight: "0.5pt",
		// strokeAlignment: StrokeAlignment.INSIDE_ALIGNMENT,
		// strokeType: "$ID/Canned Dashed 3x2",
		geometricBounds: obj.visibleBounds });
	var objCenterBefore = obj.resolve(
		[[0.5, 0.5], BoundingBoxLimits.OUTER_STROKE_BOUNDS],
		CoordinateSpaces.SPREAD_COORDINATES)[0];
	frame.contentPlace(obj); obj.remove();
	var objCenterAfter = frame.pageItems[0].resolve(
		[[0.5, 0.5], BoundingBoxLimits.OUTER_STROKE_BOUNDS],
		CoordinateSpaces.SPREAD_COORDINATES)[0];
	frame.pageItems[0].move(undefined,[
		objCenterBefore[0] - objCenterAfter[0],
		objCenterBefore[1] - objCenterAfter[1]]);
	app.select(frame);
}

function UndoClip(obj) {
	var o = obj.pageItems[0].duplicate();
	o.sendToBack(obj);
	obj.remove();
	app.select(o);
	if (o.name == "<clip group>") {
		var sel_BAK = o.pageItems.everyItem().getElements();
		o.ungroup();
		app.select(sel_BAK);
	}
}
