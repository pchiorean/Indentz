/*
	Mark visible area 24.12.3
	(c) 2020-2024 Paul Chiorean <jpeg@basement.ro>

	Creates on each page a 'visible area' frame the size of the page margins.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument)) exit();

// @includepath '.;./lib;../lib;../../lib';
// @include 'isInArray.jsxinc';

app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, 'Visible area');

function main() {
	var page, mgs,
		visLayer, dieLayer,
		oldFrame, frame, frames;
	var visLayerName = getLayer([ '.visible area', 'rahmen', 'sicht*', '*vi?ib*', 'vis?*' ]);
	var dieLayerName = getLayer([ '+dielines', 'dielines', 'cut', 'cut*line*', 'decoupe', 'die', 'die*cut', 'stanz*' ]);
	var visFrame = {
		swatchName: 'Visible area',
		swatchModel: ColorModel.SPOT,
		swatchSpace: ColorSpace.RGB,
		swatchValue: [ 255, 180, 0 ],
		strokeWeightS: '0.75 pt',
		strokeWeightL: '1.00 pt',
		strokeType: '$ID/Canned Dashed 3x2'
	};
	var visAreaRE = /^<?(visible|safe) area>?$/i;
	var isLargePage = false;

	for (var i = 0, n = doc.pages.length; i < n; i++) {
		page = doc.pages[i];
		mgs = page.marginPreferences;
		if (mgs.top + mgs.left + mgs.bottom + mgs.right === 0) continue;
		isLargePage = ((page.bounds[3] - page.bounds[1]) > 666 || (page.bounds[2] - page.bounds[0]) > 666);

		// Make swatch
		if (!doc.colors.itemByName(visFrame.swatchName).isValid) {
			doc.colors.add({
				name:  visFrame.swatchName,
				model: visFrame.swatchModel,
				space: visFrame.swatchSpace,
				colorValue: visFrame.swatchValue
			});
		}
		// Make layer
		visLayer = doc.layers.item(visLayerName);
		dieLayer = doc.layers.item(dieLayerName);
		if (visLayer.isValid) {
			visLayer.properties = {
				layerColor: UIColors.YELLOW,
				visible: true,
				locked: false
			};
			if (dieLayer.isValid) visLayer.move(LocationOptions.before, dieLayer);
		} else {
			visLayer = doc.layers.add({
				name: visLayerName,
				layerColor: UIColors.YELLOW,
				visible: true,
				locked: false
			});
			if (dieLayer.isValid) visLayer.move(LocationOptions.before, dieLayer);
			else visLayer.move(LocationOptions.AT_BEGINNING);
		}
		// Remove old frames
		frames = page.rectangles.everyItem().getElements();
		while ((oldFrame = frames.shift())) {
			if ((visAreaRE.test(oldFrame.label) || visAreaRE.test(oldFrame.name))
				/* && oldFrame.itemLayer === visLayer */) {
				oldFrame.locked = false;
				oldFrame.remove();
			}
		}
		// Add frames
		frame = page.rectangles.add({
			name: '<visible area>',
			label: 'visible area',
			contentType: ContentType.UNASSIGNED,
			fillColor: 'None',
			strokeColor: visFrame.swatchName,
			strokeTint: 100,
			strokeWeight: isLargePage ? visFrame.strokeWeightL : visFrame.strokeWeightS,
			strokeAlignment: StrokeAlignment.INSIDE_ALIGNMENT,
			strokeType: visFrame.strokeType,
			bottomLeftCornerOption:  CornerOptions.NONE,
			bottomRightCornerOption: CornerOptions.NONE,
			topLeftCornerOption:     CornerOptions.NONE,
			topRightCornerOption:    CornerOptions.NONE,
			geometricBounds: [
				page.bounds[0] + mgs.top,
				(page.side === PageSideOptions.LEFT_HAND)
					? page.bounds[1] + mgs.right
					: page.bounds[1] + mgs.left,
				page.bounds[2] - mgs.bottom,
				(page.side === PageSideOptions.LEFT_HAND)
					? page.bounds[3] - mgs.left
					: page.bounds[3] - mgs.right
			],
			itemLayer: visLayerName
		});
		try { frame.overprintStroke = false; } catch (e) {}
		visLayer.locked = true;
	}

	// Find first valid layer from a list of names, else return first name
	function getLayer(names) {
		for (var i = 0; i < doc.layers.length; i++)
			if (isInArray(doc.layers[i].name, names)) return doc.layers[i].name;
		return names[0];
	}
}
