/*
	Undo clipping v2.4.2 (2021-06-15)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Releases selected objects from their clipping frames.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument)) exit();
var item, items = doc.selection.length == 0 ?
	doc.pageItems.everyItem().getElements() : doc.selection;
var clippingFrameRE = /^\<(auto )?clip(ping)? frame\>$/i;
var clippingGroupRE = /^\<(auto )?clip(ping)? group\>$/i;

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
	if (!clippingFrameRE.test(item.name)) return;
	var child = item.pageItems[0].duplicate();
	child.sendToBack(item); item.remove();
	app.select(child);
	if (clippingGroupRE.test(child.name)) {
		var bakSel = child.pageItems.everyItem().getElements();
		child.ungroup();
		app.select(bakSel);
	}
}
