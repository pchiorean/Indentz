/*
	Clip v1.7.1
	© November 2020, Paul Chiorean
	Clip selected objects in a "<clip frame>", or restores them
*/

if (!(doc = app.activeDocument)) exit();
var sel = doc.selection;
if (sel.length == 0 || (sel[0].constructor.name == "Guide")) {
	alert("Select an object and try again."); exit();
}

app.doScript(main, ScriptLanguage.javascript, sel,
	UndoModes.ENTIRE_SCRIPT, "Clipping");


function main(sel) {
	// Remember layers for grouping/ungrouping
	var set_URL = app.generalPreferences.ungroupRemembersLayers;
	var set_PRL = app.clipboardPreferences.pasteRemembersLayers;
	app.generalPreferences.ungroupRemembersLayers = true;
	app.clipboardPreferences.pasteRemembersLayers = true;
	// Filter selection and get a single object
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
		//Clip!
		var size = obj.visibleBounds;
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
		frame.sendToBack(obj); app.select(obj); app.cut(); app.select(frame); app.pasteInto();
		obj = frame; return obj;
	}
}
