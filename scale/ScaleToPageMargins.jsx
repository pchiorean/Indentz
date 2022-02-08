/*
	Scale to page margins 21.9.15
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Scales the selected objects to the page margins.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument) || doc.selection.length === 0) exit();

app.doScript(main, ScriptLanguage.JAVASCRIPT, doc.selection,
	UndoModes.ENTIRE_SCRIPT, 'Scale to page margins');

function main(selection) {
	var item, page, i, n;
	var items = [];
	var old = {
		selection: selection,
		ungroupRemembersLayers: app.generalPreferences.ungroupRemembersLayers,
		pasteRemembersLayers: app.clipboardPreferences.pasteRemembersLayers
	};
	// Get selection's parent page
	for (i = 0, n = selection.length; i < n; i++)
		if (selection[i].parentPage) { page = doc.pages[selection[i].parentPage.documentOffset]; break; }
	if (!page) return;
	// Group multiple items
	app.generalPreferences.ungroupRemembersLayers = true;
	app.clipboardPreferences.pasteRemembersLayers = true;
	if (selection.length > 1) {
		for (i = 0, n = selection.length; i < n; i++) if (!selection[i].locked) items.push(selection[i]);
		item = page.groups.add(items, { name: '<scale group>' });
	} else {
		item = selection[0];
	}
	// Scale, ungroup and restore initial selection
	scale(item);
	if (item.name === '<scale group>') item.ungroup();
	app.select(old.selection);
	// Restore layer grouping settings
	app.generalPreferences.ungroupRemembersLayers = old.ungroupRemembersLayers;
	app.clipboardPreferences.pasteRemembersLayers = old.pasteRemembersLayers;

	function scale(objects) {
		var size = {
			target: {
				w: (page.bounds[3] - page.bounds[1]) - (page.marginPreferences.left + page.marginPreferences.right),
				h: (page.bounds[2] - page.bounds[0]) - (page.marginPreferences.top  + page.marginPreferences.bottom)
			},
			item: {
				w: item.visibleBounds[3] - item.visibleBounds[1],
				h: item.visibleBounds[2] - item.visibleBounds[0]
			}
		};
		var scaleFactor = Math.min(
			size.target.w / size.item.w,
			size.target.h / size.item.h
		);
		objects.transform(
			CoordinateSpaces.PASTEBOARD_COORDINATES,
			AnchorPoint.CENTER_ANCHOR,
			app.transformationMatrices.add({
				horizontalScaleFactor: scaleFactor,
				verticalScaleFactor:   scaleFactor
			})
		);
		doc.align(item, DistributeOptions.HORIZONTAL_CENTERS, AlignDistributeBounds.MARGIN_BOUNDS);
		doc.align(item, DistributeOptions.VERTICAL_CENTERS,   AlignDistributeBounds.MARGIN_BOUNDS);
	}
}
