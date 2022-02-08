// @include '../lib/GetBounds.jsxinc';

if (!(doc = app.activeDocument)) exit();
app.scriptPreferences.measurementUnit = MeasurementUnits.MILLIMETERS;

app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined,
	UndoModes.ENTIRE_SCRIPT, 'V grid');

function main() {
	var page, tgBounds, tgSize, MG, mgFrame;
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
		MG = Math.min(tgSize.height, tgSize.width) / 19;

		// Margins
		page.marginPreferences.properties = {
			top:    (tgBounds[0] - page.bounds[0]) + MG,
			left:   (tgBounds[1] - page.bounds[1]) + MG,
			bottom: (page.bounds[2] - tgBounds[2]) + MG,
			right:  (page.bounds[3] - tgBounds[3]) + MG,
			columnCount:  2,
			columnGutter: 0
		};

		// Guides
		if (tgSize.width / tgSize.height <= 0.95) { // Portrait
			// addGuide('vertical', tgBounds[1] + MG * 5, '5 x mg');
			// addGuide('vertical', tgBounds[1] + MG * 6, '6 x mg');
			addGuide('vertical', tgBounds[1] + MG * 1.5, '1.5 x mg');
			addGuide('horizontal', tgBounds[0] + tgSize.height * 0.225, 'middle of 45% section');
			addGuide('horizontal', tgBounds[0] + tgSize.height * 0.45, '45%');
		} else { // Landscape
			// addGuide('horizontal', tgBounds[0] + MG * 5, '5 x mg');
			// addGuide('horizontal', tgBounds[0] + MG * 6, '6 x mg');
			addGuide('vertical', tgBounds[1] + tgSize.width * 0.225, 'middle of 45% section');
			addGuide('vertical', tgBounds[1] + tgSize.width * 0.45, '45%');
			addGuide('vertical', tgBounds[1] + tgSize.width / 3, '1/3');
		}
		// addGuide('vertical', tgBounds[1] + tgSize.width * 3 / 4, '3/4');
		addGuide('horizontal', tgBounds[0] + tgSize.height / 2, 'middle', UIColors.GRID_GREEN);
		// addGuide('horizontal', tgBounds[2] - MG * 3, 'SKU bottom');
		// addGuide('horizontal', tgBounds[2] - MG * 4.338711, 'product range top', UIColors.GRID_BLUE);
		// addGuide('horizontal', tgBounds[2] - MG * 2.4, 'product range bottom', UIColors.GRID_BLUE);
		// addGuide('horizontal', tgBounds[2] - MG / 2, 'HW bottom', UIColors.GREEN);

		// Margin size square
		// mgFrame = page.rectangles.add({
		// 	itemLayer:       'guides',
		// 	label:           'mg',
		// 	geometricBounds: [ tgBounds[0], tgBounds[1], tgBounds[0] + MG, tgBounds[1] + MG ] ,
		// 	contentType:     ContentType.UNASSIGNED,
		// 	fillColor:       'Magenta',
		// 	strokeColor:     'None'
		// });
		// mgFrame.transparencySettings.blendingSettings.opacity = 90;
		// doc.align(mgFrame, AlignOptions.RIGHT_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
		// doc.align(mgFrame, AlignOptions.TOP_EDGES,   AlignDistributeBounds.MARGIN_BOUNDS);
		// mgFrame.move(undefined, [ MG, -MG ]);
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
