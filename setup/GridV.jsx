/*
	V grid 1.1.4 (2021-10-07)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)
*/

// @include '../lib/GetBounds.jsxinc';

if (!(doc = app.activeDocument)) exit();
app.scriptPreferences.measurementUnit = MeasurementUnits.MILLIMETERS;

app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined,
	UndoModes.ENTIRE_SCRIPT, 'V grid');

function main() {
	var page, tgBounds, tgSize, guide, shortSize, longSize, MG, bigSKU, smallSKU, bigSKUsize, smallSKUscaleFactor,
		smallSKUsize, SKUsymbols, arrowTip, oldTRP, vLine1, vLine2, vLine3, mgFrame;
	try { doc.layers.add({ name: 'guides', layerColor: UIColors.MAGENTA }); } catch (e) {}
	try { doc.layers.itemByName('guides').visible   = true; }  catch (e) {}
	try { doc.layers.itemByName('guides').printable = false; } catch (e) {}
	try { doc.layers.itemByName('guides').locked    = false; } catch (e) {}

	for (var i = 0, n = doc.pages.length; i < n; i++) {
		// Margin = 1/19 of the short size
		// Big SKU is height w/o 6 margins top & bottom
		// Small SKU is 23% smaller than big SKU
		// HW at 1/2 margin of bottom

		page = doc.pages[i];
		tgBounds = getBounds(page).page.visible || getBounds(page).page.size;
		tgSize = { width: tgBounds[3] - tgBounds[1], height: tgBounds[2] - tgBounds[0] };
		guide = {
			color:  'Magenta',
			type:   '$ID/Canned Dashed 3x2',
			weight: (longSize < 500) ? '0.75 pt' : (longSize < 1000 ? '1.5 pt' : '3 pt')
		};
		shortSize = Math.min(tgSize.height, tgSize.width);
		longSize  = Math.max(tgSize.height, tgSize.width);
		MG = shortSize / 19;
		bigSKUsize = shortSize - 12 * MG;
		smallSKUscaleFactor = 1 - 23 / 100;
		smallSKUsize = bigSKUsize * smallSKUscaleFactor;

		// Margins
		page.marginPreferences.properties = {
			top:          (tgBounds[0] - page.bounds[0]) + MG,
			left:         (tgBounds[1] - page.bounds[1]) + MG,
			bottom:       (page.bounds[2] - tgBounds[2]) + MG,
			right:        (page.bounds[3] - tgBounds[3]) + MG,
			columnCount:  2,
			columnGutter: 0
		};

		// Guides
		arrowTip = tgBounds[1] + (tgBounds[3] - tgBounds[1]) / 2 + bigSKUsize * 0.25033;
		if (tgSize.width / tgSize.height <= 0.95) { // Portrait
			addGuide('vertical', tgBounds[0] + MG * 5, '5 x mg');
			// addGuide('vertical', tgBounds[0] + MG * 6, '6 x mg');
		} else { // Landscape
			addGuide('horizontal', tgBounds[0] + MG * 5, '5 x mg');
			// addGuide('horizontal', tgBounds[0] + MG * 6, '6 x mg');
			addGuide('vertical', (tgBounds[3] - tgBounds[1]) * 0.225, 'middle of 45% section');
			addGuide('vertical', (tgBounds[3] - tgBounds[1]) * 0.45, '45%');
		}
		// addGuide('vertical', arrowTip, 'arrow tip', UIColors.GRID_GREEN);
		// addGuide('vertical', tgBounds[3] - MG * 0.5, 'half mg');
		// addGuide('vertical', (tgBounds[3] - tgBounds[1]) * 3 / 4, '3/4');
		// addGuide('vertical', tgBounds[3] - MG * 1.5, 'SKU right (with pouch)');
		addGuide('horizontal', tgBounds[0] + tgSize.height / 2, 'middle', UIColors.GRID_GREEN);
		// addGuide('horizontal', tgBounds[2] - MG * 3, 'SKU bottom');
		// addGuide('horizontal', tgBounds[2] - MG * 4.338711, 'product range top', UIColors.GRID_BLUE);
		// addGuide('horizontal', tgBounds[2] - MG * 2.4, 'product range bottom', UIColors.GRID_BLUE);
		// addGuide('horizontal', tgBounds[2] - MG / 2, 'HW bottom', UIColors.GREEN);

		// SKUs
		// bigSKU = page.ovals.add({
		// 	itemLayer: 'guides',
		// 	label: 'SKU big',
		// 	geometricBounds: [ page.bounds[0], page.bounds[1], page.bounds[0] + 100, page.bounds[1] + 100 ],
		// 	contentType: ContentType.UNASSIGNED,
		// 	fillColor: guide.color
		// });
		// bigSKU.transparencySettings.blendingSettings.opacity = 66;
		// SKUsymbols = page.graphicLines.add({
		// 	itemLayer: 'guides',
		// 	fillColor: 'Paper',
		// 	strokeColor: 'None'
		// });
		// SKUsymbols.paths[0].entirePath = [
		// 	[ 18.424, 24.108 ], [ 39.378, 33.692 ], [ 39.378, 14.079 ],
		// 	[ 60.625, 14.079 ], [ 60.625, 43.410 ], [ 75.033, 50.000 ],
		// 	[ 60.625, 56.590 ], [ 60.625, 85.921 ], [ 39.378, 85.921 ],
		// 	[ 39.378, 66.308 ], [ 18.425, 75.892 ], [ 18.424, 24.108 ],
		// ];
		// SKUsymbols.transparencySettings.blendingSettings.opacity = 50;
		// bigSKU.contentPlace(SKUsymbols);
		// SKUsymbols.remove();
		// bigSKU.pageItems[0].move(undefined, [ 18.424, 14.079 ]);
		// bigSKU.transform(CoordinateSpaces.INNER_COORDINATES, AnchorPoint.TOP_LEFT_ANCHOR,
		// 	app.transformationMatrices.add({
		// 		horizontalScaleFactor: bigSKUsize / 100,
		// 		verticalScaleFactor: bigSKUsize / 100
		// 	})
		// );
		// doc.align(bigSKU, AlignOptions.VERTICAL_CENTERS, AlignDistributeBounds.PAGE_BOUNDS);
		// doc.align(bigSKU, AlignOptions.HORIZONTAL_CENTERS, AlignDistributeBounds.PAGE_BOUNDS);
		// smallSKU = bigSKU.duplicate();
		// smallSKU.sendToBack(bigSKU);
		// smallSKU.transform(CoordinateSpaces.INNER_COORDINATES, AnchorPoint.CENTER_ANCHOR,
		// 	app.transformationMatrices.add({
		// 		horizontalScaleFactor: smallSKUscaleFactor,
		// 		verticalScaleFactor: smallSKUscaleFactor
		// 	})
		// );
		// smallSKU.move(undefined, [ bigSKUsize * 0.63597, 0 ]);
		// page.groups.add([ smallSKU, bigSKU ]);

		// Arrow lines
		// oldTRP = app.layoutWindows[0].transformReferencePoint;
		// vLine1 = page.graphicLines.add({
		// 	itemLayer: 'guides',
		// 	label: 'arrow guide',
		// 	strokeColor: guide.color,
		// 	strokeType: guide.type,
		// 	strokeWeight: guide.weight
		// });
		// vLine1.transparencySettings.blendingSettings.opacity = 90;
		// vLine1.paths[0].entirePath = [
		// 	[ 2 * arrowTip - tgBounds[3], tgBounds[0] + tgSize.height / 2 ],
		// 	[ tgBounds[3], tgBounds[0] + tgSize.height / 2 ]
		// ];
		// app.layoutWindows[0].transformReferencePoint = AnchorPoint.CENTER_ANCHOR;
		// vLine1.rotationAngle = 24.44;
		// vLine2 = page.graphicLines.add({
		// 	itemLayer: 'guides',
		// 	label: 'arrow guide',
		// 	strokeColor: guide.color,
		// 	strokeType: guide.type,
		// 	strokeWeight: guide.weight
		// });
		// vLine2.transparencySettings.blendingSettings.opacity = 90;
		// vLine2.paths[0].entirePath = [
		// 	[ 2 * arrowTip - tgBounds[3], tgBounds[0] + tgSize.height / 2 ],
		// 	[ arrowTip, tgBounds[0] + tgSize.height / 2 ]
		// ];
		// app.layoutWindows[0].transformReferencePoint = AnchorPoint.RIGHT_CENTER_ANCHOR;
		// vLine2.rotationAngle = -24.44;
		// vLine3 = page.graphicLines.add({
		// 	itemLayer: 'guides',
		// 	label: 'rotated HL guide',
		// 	strokeColor: guide.color,
		// 	strokeType: guide.type,
		// 	strokeWeight: guide.weight
		// });
		// vLine3.transparencySettings.blendingSettings.opacity = 90;
		// vLine3.paths[0].entirePath = [
		// 	[ tgBounds[3] - MG * 6, tgBounds[0] + MG ],
		// 	[ tgBounds[3] - MG * 6, tgBounds[2] - MG ]
		// ];
		// app.layoutWindows[0].transformReferencePoint = AnchorPoint.BOTTOM_CENTER_ANCHOR;
		// vLine3.rotationAngle = 24.44;
		// page.groups.add([ vLine1, vLine2 ]);
		// app.layoutWindows[0].transformReferencePoint = oldTRP;

		// Margin size square
		mgFrame = page.rectangles.add({
			itemLayer:       'guides',
			label:           'mg',
			geometricBounds: [ tgBounds[0], tgBounds[1], tgBounds[0] + MG, tgBounds[1] + MG ] ,
			contentType:     ContentType.UNASSIGNED,
			fillColor:       'Magenta',
			strokeColor:     'None'
		});
		mgFrame.transparencySettings.blendingSettings.opacity = 90;
		doc.align(mgFrame, AlignOptions.RIGHT_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
		doc.align(mgFrame, AlignOptions.TOP_EDGES,   AlignDistributeBounds.MARGIN_BOUNDS);
		mgFrame.move(undefined, [ MG, -MG ]);
	}

	function addGuide(HorV, location, label, color) {
		page.guides.add(undefined, {
			itemLayer:   'guides',
			label:       label,
			guideColor:  color || UIColors.LIGHT_GRAY,
			orientation: (HorV === 'horizontal') ? HorizontalOrVertical.HORIZONTAL : HorizontalOrVertical.VERTICAL,
			location:    location
		});
	}
}
