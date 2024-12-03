/*
	Mark safety area 24.12.3
	(c) 2020-2024 Paul Chiorean <jpeg@basement.ro>

	Creates on each page a 'safety area' frame the size of the page margins.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument)) exit();

// @includepath '.;./lib;../lib;../../lib';
// @include 'isInArray.jsxinc';

app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, 'Safety area');

function main() {
	var page, mgs,
		saLayer, dieLayer,
		oldFrame, frame, frames;
	var saLayerName = getLayer([ '.safety area', 'limit*area', 'safe*area', 'safe*margins' ]);
	var dieLayerName = getLayer([ '+dielines', 'dielines', 'cut', 'cut*line*', 'decoupe', 'die', 'die*cut', 'stanz*' ]);
	var saFrame = {
		swatchName: 'Safety area',
		swatchModel: ColorModel.SPOT,
		swatchSpace: ColorSpace.RGB,
		swatchValue: [ 0, 180, 255 ],
		strokeWeightS: '0.35 pt',
		strokeWeightL: '0.75 pt',
		strokeType: '$ID/Canned Dashed 4x4'
	};
	var saAreaRE = /^<?safe(ty)? area>?$/i;
	var isLargePage = false;

	for (var i = 0, n = doc.pages.length; i < n; i++) {
		page = doc.pages[i];
		mgs = page.marginPreferences;
		if (mgs.top + mgs.left + mgs.bottom + mgs.right === 0) continue;
		isLargePage = ((page.bounds[3] - page.bounds[1]) > 666 || (page.bounds[2] - page.bounds[0]) > 666);

		// Make swatch
		if (!doc.colors.itemByName(saFrame.swatchName).isValid) {
			doc.colors.add({
				name:  saFrame.swatchName,
				model: saFrame.swatchModel,
				space: saFrame.swatchSpace,
				colorValue: saFrame.swatchValue
			});
		}
		// Make layer
		saLayer = doc.layers.item(saLayerName);
		dieLayer = doc.layers.item(dieLayerName);
		if (saLayer.isValid) {
			saLayer.properties = {
				layerColor: UIColors.GRID_GREEN,
				visible: true,
				locked: false
			};
			if (dieLayer.isValid) saLayer.move(LocationOptions.before, dieLayer);
		} else {
			saLayer = doc.layers.add({
				name: saLayerName,
				layerColor: UIColors.GRID_GREEN,
				visible: true,
				locked: false
			});
			if (dieLayer.isValid) saLayer.move(LocationOptions.before, dieLayer);
			else saLayer.move(LocationOptions.AT_BEGINNING);
		}
		// Remove old frames
		frames = page.rectangles.everyItem().getElements();
		while ((oldFrame = frames.shift())) {
			if ((saAreaRE.test(oldFrame.label) || saAreaRE.test(oldFrame.name))
				/* && oldFrame.itemLayer === saLayer */) {
				oldFrame.locked = false;
				oldFrame.remove();
			}
		}
		// Add frames
		frame = page.rectangles.add({
			name: '<safety area>',
			label: 'safety area',
			contentType: ContentType.UNASSIGNED,
			fillColor: 'None',
			strokeColor: saFrame.swatchName,
			strokeTint: 100,
			strokeWeight: isLargePage ? saFrame.strokeWeightL : saFrame.strokeWeightS,
			strokeAlignment: StrokeAlignment.INSIDE_ALIGNMENT,
			strokeType: saFrame.strokeType,
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
			itemLayer: saLayerName
		});
		try { frame.overprintStroke = false; } catch (e) {}
		saLayer.locked = true;
	}

	// Find first valid layer from a list of names, else return first name
	function getLayer(names) {
		for (var i = 0; i < doc.layers.length; i++)
			if (isInArray(doc.layers[i].name, names)) return doc.layers[i].name;
		return names[0];
	}
}
