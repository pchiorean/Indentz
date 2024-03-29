/*
	Scale to page 23.10.7
	(c) 2020-2023 Paul Chiorean <jpeg@basement.ro>

	Scales the selected objects to the page size.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument) || doc.selection.length === 0) exit();

app.doScript(main, ScriptLanguage.JAVASCRIPT, doc.selection, UndoModes.ENTIRE_SCRIPT, 'Scale to page');

function main(selection) {
	var item, page, i, n;
	var items = [];
	var old = {
		selection: selection,
		ungroupRemembersLayers: app.generalPreferences.ungroupRemembersLayers,
		pasteRemembersLayers:   app.clipboardPreferences.pasteRemembersLayers
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
	doScale();
	if (item.name === '<scale group>') item.ungroup();
	app.select(old.selection);

	// Restore layer grouping settings
	app.generalPreferences.ungroupRemembersLayers = old.ungroupRemembersLayers;
	app.clipboardPreferences.pasteRemembersLayers = old.pasteRemembersLayers;

	function doScale() {
		var ADB = AlignDistributeBounds.PAGE_BOUNDS;
		var TRP = app.layoutWindows[0].transformReferencePoint;
		var size = {
			target: {
				w: (page.bounds[3] - page.bounds[1]),
				h: (page.bounds[2] - page.bounds[0])
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

		// Center object
		doc.align(item, AlignOptions.HORIZONTAL_CENTERS, ADB);
		doc.align(item, AlignOptions.VERTICAL_CENTERS, ADB);

		// Scale
		item.transform(
			CoordinateSpaces.PASTEBOARD_COORDINATES, AnchorPoint.CENTER_ANCHOR,
			app.transformationMatrices.add({ horizontalScaleFactor: scaleFactor, verticalScaleFactor: scaleFactor })
		);

		// Move to target
		switch (TRP) {
			case AnchorPoint.TOP_LEFT_ANCHOR:
			case AnchorPoint.LEFT_CENTER_ANCHOR:
			case AnchorPoint.BOTTOM_LEFT_ANCHOR:
				doc.align(item, AlignOptions.LEFT_EDGES, ADB);
				break;
			case AnchorPoint.TOP_CENTER_ANCHOR:
			case AnchorPoint.CENTER_ANCHOR:
			case AnchorPoint.BOTTOM_CENTER_ANCHOR:
				doc.align(item, AlignOptions.HORIZONTAL_CENTERS, ADB);
				break;
			case AnchorPoint.TOP_RIGHT_ANCHOR:
			case AnchorPoint.RIGHT_CENTER_ANCHOR:
			case AnchorPoint.BOTTOM_RIGHT_ANCHOR:
				doc.align(item, AlignOptions.RIGHT_EDGES, ADB);
				break;
		}
		switch (TRP) {
			case AnchorPoint.TOP_LEFT_ANCHOR:
			case AnchorPoint.TOP_CENTER_ANCHOR:
			case AnchorPoint.TOP_RIGHT_ANCHOR:
				doc.align(item, AlignOptions.TOP_EDGES, ADB);
				break;
			case AnchorPoint.LEFT_CENTER_ANCHOR:
			case AnchorPoint.CENTER_ANCHOR:
			case AnchorPoint.RIGHT_CENTER_ANCHOR:
				doc.align(item, AlignOptions.VERTICAL_CENTERS, ADB);
				break;
			case AnchorPoint.BOTTOM_LEFT_ANCHOR:
			case AnchorPoint.BOTTOM_CENTER_ANCHOR:
			case AnchorPoint.BOTTOM_RIGHT_ANCHOR:
				doc.align(item, AlignOptions.BOTTOM_EDGES, ADB);
				break;
		}
	}
}
