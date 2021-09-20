/*
	Undo clipping v2.5 (2021-09-20)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Releases selected objects from their clipping frames.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument)) exit();

app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined,
	UndoModes.ENTIRE_SCRIPT, 'Unclipping');

function main() {
	var item;
	var items = (doc.selection.length === 0) ? doc.pageItems.everyItem().getElements() : doc.selection;
	var clippingFrameRE = /^<(auto )?clip(ping)? frame>$/i;
	var clippingGroupRE = /^<(auto )?clip(ping)? group>$/i;
	var oldURL = app.generalPreferences.ungroupRemembersLayers;
	var oldPRL = app.clipboardPreferences.pasteRemembersLayers;

	// Remember layers for grouping/ungrouping
	app.generalPreferences.ungroupRemembersLayers = true;
	app.clipboardPreferences.pasteRemembersLayers = true;
	// Restore clipped objects
	while ((item = items.shift())) {
		if (item.parent.constructor.name !== 'Spread') continue;
		if (!clippingFrameRE.test(item.name)) continue;
		undoClip(item);
	}
	// Restore layer grouping settings
	app.generalPreferences.ungroupRemembersLayers = oldURL;
	app.clipboardPreferences.pasteRemembersLayers = oldPRL;

	function undoClip(frame) {
		var oldSelection;
		var child = frame.pageItems[0].duplicate();
		child.sendToBack(frame);
		frame.remove();
		app.select(child);
		if (clippingGroupRE.test(child.name)) {
			oldSelection = child.pageItems.everyItem().getElements();
			child.ungroup();
			app.select(oldSelection);
		}
	}
}
