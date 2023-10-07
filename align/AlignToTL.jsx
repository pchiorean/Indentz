/*
	Align to top-left 23.10.7
	(c) 2020-2023 Paul Chiorean <jpeg@basement.ro>

	Aligns the selected objects to the top-left of the 'Align To' setting.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument) || doc.selection.length === 0) exit();

app.doScript(main, ScriptLanguage.JAVASCRIPT, doc.selection, UndoModes.ENTIRE_SCRIPT, 'Align to top-left');

function main(selection) {
	var item, i, n;
	var items = [];
	var old = {
		selection: selection,
		ungroupRemembersLayers: app.generalPreferences.ungroupRemembersLayers,
		pasteRemembersLayers:   app.clipboardPreferences.pasteRemembersLayers
	};
	var ADP = app.alignDistributePreferences.alignDistributeBounds;

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
		doc.align(objects, AlignOptions.TOP_EDGES,  ADP, doc.selectionKeyObject);
		doc.align(objects, AlignOptions.LEFT_EDGES, ADP, doc.selectionKeyObject);
	}
}
