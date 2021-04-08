/*
	Undo clipping v2.4 (2020-12-30)
	(c) 2020 Paul Chiorean (jpeg@basement.ro)

	Restores objects clipped in a "<clip frame>" by the "FitTo" scripts.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument)) exit();
var item, items = doc.selection.length == 0 ?
	doc.pageItems.everyItem().getElements() : doc.selection;

app.doScript(main, ScriptLanguage.javascript, items,
	UndoModes.ENTIRE_SCRIPT, "Unclipping");


function main(items) {
	// Remember layers for grouping/ungrouping
	var oldURL = app.generalPreferences.ungroupRemembersLayers;
	var oldPRL = app.clipboardPreferences.pasteRemembersLayers;
	app.generalPreferences.ungroupRemembersLayers = true;
	app.clipboardPreferences.pasteRemembersLayers = true;
	// Undo clip
	while (item = items.shift()) UndoClip(item);
	// Restore layer grouping settings
	app.generalPreferences.ungroupRemembersLayers = oldURL;
	app.clipboardPreferences.pasteRemembersLayers = oldPRL;
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
