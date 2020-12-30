/*
	Undo clipping v2.4.0
	© December 2020, Paul Chiorean
	Restores objects clipped in a "<clip frame>" by the "FitTo" scripts.
*/

if (!(doc = app.activeDocument)) exit();
var item, items = doc.selection.length == 0 ?
	doc.pageItems.everyItem().getElements() : doc.selection;

app.doScript(main, ScriptLanguage.javascript, items,
	UndoModes.ENTIRE_SCRIPT, "Unclipping");


function main(items) {
	// Remember layers for grouping/ungrouping
	var set_URL = app.generalPreferences.ungroupRemembersLayers;
	var set_PRL = app.clipboardPreferences.pasteRemembersLayers;
	app.generalPreferences.ungroupRemembersLayers = true;
	app.clipboardPreferences.pasteRemembersLayers = true;
	// Undo clip
	while (item = items.shift()) UndoClip(item);
	// Restore layer grouping settings
	app.generalPreferences.ungroupRemembersLayers = set_URL;
	app.clipboardPreferences.pasteRemembersLayers = set_PRL;
}

function UndoClip(item) {
	if (item.name != "<clip frame>" && item.name != "<auto clip frame>") return;
	var child = item.pageItems[0].duplicate();
	child.sendToBack(item); item.remove();
	app.select(child);
	if (child.name == "<clip group>" || child.name == "<auto clip group>") {
		var sel_BAK = child.pageItems.everyItem().getElements();
		child.ungroup();
		app.select(sel_BAK);
	}
}
