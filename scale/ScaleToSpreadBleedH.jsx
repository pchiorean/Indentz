/*
	Scale to spread bleed (top/bottom) 22.11.17
	(c) 2021-2022 Paul Chiorean (jpeg@basement.ro)

	Scales the selected objects to the spread bleed top/bottom size.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument) || doc.selection.length === 0) exit();

app.doScript(main, ScriptLanguage.JAVASCRIPT, doc.selection,
	UndoModes.ENTIRE_SCRIPT, 'Scale to spread bleed');

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
	doScale();
	if (item.name === '<scale group>') item.ungroup();
	app.select(old.selection);

	// Restore layer grouping settings
	app.generalPreferences.ungroupRemembersLayers = old.ungroupRemembersLayers;
	app.clipboardPreferences.pasteRemembersLayers = old.pasteRemembersLayers;

	function doScale() {
		var ADB = AlignDistributeBounds.SPREAD_BOUNDS;
		var TRP = app.layoutWindows[0].transformReferencePoint;
		var bleed = getBounds();
		var size = {
			target: {
				w: (bleed[3] - bleed[1]),
				h: (bleed[2] - bleed[0])
			},
			item: {
				w: item.visibleBounds[3] - item.visibleBounds[1],
				h: item.visibleBounds[2] - item.visibleBounds[0]
			}
		};
		var scaleFactor = size.target.h / size.item.h;

		// Center object
		doc.align(item, AlignOptions.HORIZONTAL_CENTERS, ADB);
		doc.align(item, AlignOptions.VERTICAL_CENTERS, ADB);

		// Scale
		item.transform(
			CoordinateSpaces.PASTEBOARD_COORDINATES, AnchorPoint.CENTER_ANCHOR,
			app.transformationMatrices.add({ horizontalScaleFactor: scaleFactor, verticalScaleFactor: scaleFactor })
		);

		// Move to target
		switch (TRP) { // H axis
			case AnchorPoint.TOP_LEFT_ANCHOR:
			case AnchorPoint.LEFT_CENTER_ANCHOR:
			case AnchorPoint.BOTTOM_LEFT_ANCHOR:
				doc.align(item, AlignOptions.LEFT_EDGES, ADB);
				item.move(undefined, [ bleed[1] - page.bounds[1], 0 ]);
				break;
			case AnchorPoint.TOP_CENTER_ANCHOR:
			case AnchorPoint.CENTER_ANCHOR:
			case AnchorPoint.BOTTOM_CENTER_ANCHOR:
				doc.align(item, AlignOptions.HORIZONTAL_CENTERS, ADB);
				item.move(undefined, [ ((bleed[3] - page.bounds[3]) - (page.bounds[1] - bleed[1])) / 2, 0 ]);
				break;
			case AnchorPoint.TOP_RIGHT_ANCHOR:
			case AnchorPoint.RIGHT_CENTER_ANCHOR:
			case AnchorPoint.BOTTOM_RIGHT_ANCHOR:
				doc.align(item, AlignOptions.RIGHT_EDGES, ADB);
				item.move(undefined, [ bleed[3] - page.bounds[3], 0 ]);
				break;
		}
		switch (TRP) { // V axis
			case AnchorPoint.TOP_LEFT_ANCHOR:
			case AnchorPoint.TOP_CENTER_ANCHOR:
			case AnchorPoint.TOP_RIGHT_ANCHOR:
				doc.align(item, AlignOptions.TOP_EDGES, ADB);
				item.move(undefined, [ 0, bleed[0] - page.bounds[0] ]);
				break;
			case AnchorPoint.LEFT_CENTER_ANCHOR:
			case AnchorPoint.CENTER_ANCHOR:
			case AnchorPoint.RIGHT_CENTER_ANCHOR:
				doc.align(item, AlignOptions.VERTICAL_CENTERS, ADB);
				item.move(undefined, [ 0, ((bleed[2] - page.bounds[2]) - (page.bounds[0] - bleed[0])) / 2 ]);
				break;
			case AnchorPoint.BOTTOM_LEFT_ANCHOR:
			case AnchorPoint.BOTTOM_CENTER_ANCHOR:
			case AnchorPoint.BOTTOM_RIGHT_ANCHOR:
				doc.align(item, AlignOptions.BOTTOM_EDGES, ADB);
				item.move(undefined, [ 0, bleed[2] - page.bounds[2] ]);
				break;
		}
	}

	function getBounds() {
		var fPg = page.parent.pages.firstItem();
		var lPg = page.parent.pages.lastItem();
		var bleed = {
			top:    doc.documentPreferences.documentBleedTopOffset,
			left:   doc.documentPreferences.documentBleedInsideOrLeftOffset,
			bottom: doc.documentPreferences.documentBleedBottomOffset,
			right:  doc.documentPreferences.documentBleedOutsideOrRightOffset
		};
		return [
			fPg.bounds[0] - bleed.top,
			fPg.bounds[1] - ((fPg.side === PageSideOptions.LEFT_HAND) ? bleed.right : bleed.left),
			lPg.bounds[2] + bleed.bottom,
			lPg.bounds[3] + ((fPg === lPg) ?
				((fPg.side === PageSideOptions.LEFT_HAND) ? bleed.left : bleed.right) :
				bleed.right)
		];
	}
}
