/*
	Align to bottom-left 23.10.7
	(c) 2020-2023 Paul Chiorean <jpeg@basement.ro>

	Aligns the selected objects to the bottom-left of the 'Align To' setting.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument) || doc.selection.length === 0) exit();

app.doScript(main, ScriptLanguage.JAVASCRIPT, doc.selection, UndoModes.ENTIRE_SCRIPT, 'Align to bottom-left');

function main(selection) {
	var item, i, n;
	var items = [];
	var old = {
		selection: selection,
		ungroupRemembersLayers: app.generalPreferences.ungroupRemembersLayers,
		pasteRemembersLayers:   app.clipboardPreferences.pasteRemembersLayers
	};
	var ADP = app.alignDistributePreferences.alignDistributeBounds;

	// Hack for Num 1 shortcut bug
	if (Object.prototype.hasOwnProperty.call(doc.selection[0], 'parentTextFrames')) {
		doc.selection[0].contents = '1';
		doc.select(doc.selection[0].insertionPoints[-1]);
		return;
	}

	// If we have a key object, align to it and exit
	if (doc.selectionKeyObject) { align(selection); return; }

	// Group multiple items
	app.generalPreferences.ungroupRemembersLayers = true;
	app.clipboardPreferences.pasteRemembersLayers = true;
	if (selection.length > 1) {
		for (i = 0, n = selection.length; i < n; i++) if (!selection[i].locked) items.push(selection[i]);
		item = doc.groups.add(items, { name: '<align group>' });
	} else {
		item = selection[0];
	}

	// Align, ungroup and restore initial selection (sans key object)
	if (ADP === AlignDistributeBounds.ITEM_BOUNDS) ADP = AlignDistributeBounds.PAGE_BOUNDS;
	align(item);
	if (item.name === '<align group>') item.ungroup();
	app.select(old.selection);

	// Restore layer grouping settings
	app.generalPreferences.ungroupRemembersLayers = old.ungroupRemembersLayers;
	app.clipboardPreferences.pasteRemembersLayers = old.pasteRemembersLayers;

	function align(objects) {
		doc.align(objects, AlignOptions.BOTTOM_EDGES, ADP, doc.selectionKeyObject);
		doc.align(objects, AlignOptions.LEFT_EDGES,   ADP, doc.selectionKeyObject);
	}
}
