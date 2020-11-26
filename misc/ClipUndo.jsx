/*
	Undo clipping v2.1.0
	© November 2020, Paul Chiorean
	Restores objects clipped in a "<clip frame>" by the "FitTo" scripts.
*/

if (!(doc = app.activeDocument)) exit();
var items = doc.selection.length == 0 ?
	doc.pageItems.everyItem().getElements() : doc.selection;

app.doScript(main, ScriptLanguage.javascript, items,
	UndoModes.ENTIRE_SCRIPT, "Unclipping");


function main(items) {
	// Remember layers for grouping/ungrouping
	var set_URL = app.generalPreferences.ungroupRemembersLayers;
	var set_PRL = app.clipboardPreferences.pasteRemembersLayers;
	app.generalPreferences.ungroupRemembersLayers = true;
	app.clipboardPreferences.pasteRemembersLayers = true;
	// Undo clip!
	var obj; while (obj = items.shift()) UndoClip(obj);
	// Restore layer grouping settings
	app.generalPreferences.ungroupRemembersLayers = set_URL;
	app.clipboardPreferences.pasteRemembersLayers = set_PRL;
}

function UndoClip(obj) {
	if ((obj.name == "<clip frame>" || obj.name == "<auto clip frame>") &&
	obj.pageItems[0].isValid) {
		var o = obj.pageItems[0].duplicate();
		o.sendToBack(obj);
		obj.remove();
		app.select(o);
		if (o.name == "<clip group>") {
			try { o.pageItems.item("<temp frame>").remove() } catch (_) {};
			var sel_BAK = o.pageItems.everyItem().getElements();
			o.ungroup();
			app.select(sel_BAK);
		}
	}
}
