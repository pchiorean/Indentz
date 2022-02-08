/*
	Scale to page bleed (left/right) 21.9.28
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Scales the selected objects to the spread bleed left/right size.

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
	scale(item);
	if (item.name === '<scale group>') item.ungroup();
	app.select(old.selection);
	// Restore layer grouping settings
	app.generalPreferences.ungroupRemembersLayers = old.ungroupRemembersLayers;
	app.clipboardPreferences.pasteRemembersLayers = old.pasteRemembersLayers;

	function scale(objects) {
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
		var scaleFactor = size.target.w / size.item.w;
		objects.transform(
			CoordinateSpaces.PASTEBOARD_COORDINATES,
			AnchorPoint.CENTER_ANCHOR,
			app.transformationMatrices.add({
				horizontalScaleFactor: scaleFactor,
				verticalScaleFactor:   scaleFactor
			})
		);
		doc.align(item, DistributeOptions.HORIZONTAL_CENTERS, AlignDistributeBounds.SPREAD_BOUNDS);
		doc.align(item, DistributeOptions.VERTICAL_CENTERS,   AlignDistributeBounds.SPREAD_BOUNDS);
	}

	function getBounds() {
		var fPg = page.parent.pages.firstItem();
		var lPg = page.parent.pages.lastItem();
		var bleed = {
			top:    doc.documentPreferences.properties.documentBleedTopOffset,
			left:   doc.documentPreferences.properties.documentBleedInsideOrLeftOffset,
			bottom: doc.documentPreferences.properties.documentBleedBottomOffset,
			right:  doc.documentPreferences.properties.documentBleedOutsideOrRightOffset
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
