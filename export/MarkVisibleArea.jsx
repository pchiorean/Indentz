/*
	Mark visible area 22.5.23
	(c) 2020-2022 Paul Chiorean (jpeg@basement.ro)

	Creates on each page a 'visible area' frame the size of the page margins.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument)) exit();

app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined,
	UndoModes.ENTIRE_SCRIPT, 'Visible area');

function main() {
	var page, mgs,
		visLayer, dieLayer,
		oldFrame, frames;
	var visLayerName = findLayer([
		'visible area',
		'visible', 'Visible',
		'vizibil', 'Vizibil',
		'vis. area', 'Vis. area',
		'rahmen'
	]);
	var dieLayerName = findLayer([
		'dielines',
		'cut lines', 'Cut lines', 'cut', 'Cut', 'CUT',
		'decoupe', 'Decoupe',
		'die', 'Die', 'die cut', 'Die Cut', 'diecut', 'Diecut',
		'stanz', 'Stanz', 'stanze', 'Stanze',
		'stanzform', 'Stanzform'
	]);
	var visFrame = {
		swatchName:  'Visible area',
		swatchModel: ColorModel.SPOT,
		swatchSpace: ColorSpace.RGB,
		swatchValue: [ 255, 180, 0 ],
		strokeWeight: '0.75 pt',
		strokeType: '$ID/Canned Dashed 3x2'
	};
	var visAreaRE = /^<?(visible|safe) area>?$/i;

	for (var i = 0, n = doc.pages.length; i < n; i++) {
		page = doc.pages[i];
		mgs = page.marginPreferences;
		if (mgs.top + mgs.left + mgs.bottom + mgs.right === 0) continue;
		// Make swatch
		if (!doc.colors.itemByName(visFrame.swatchName).isValid) {
			doc.colors.add({
				name: visFrame.swatchName,
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
		page.rectangles.add({
			name: '<visible area>',
			label: 'visible area',
			contentType: ContentType.UNASSIGNED,
			fillColor: 'None',
			strokeColor: visFrame.swatchName,
			strokeWeight: visFrame.strokeWeight,
			strokeAlignment: StrokeAlignment.INSIDE_ALIGNMENT,
			strokeType: visFrame.strokeType,
			overprintStroke: false,
			itemLayer: visLayerName,
			geometricBounds: [
				page.bounds[0] + mgs.top,
				(page.side === PageSideOptions.LEFT_HAND) ?
					page.bounds[1] + mgs.right : page.bounds[1] + mgs.left,
				page.bounds[2] - mgs.bottom,
				(page.side === PageSideOptions.LEFT_HAND) ?
					page.bounds[3] - mgs.left : page.bounds[3] - mgs.right
			]
		});
		visLayer.locked = true;
	}

	// Find first valid layer from a list of names
	function findLayer(names) {
		var layer;
		for (var i = 0, n = names.length; i < n; i++) {
			layer = doc.layers.item(names[i]);
			if (layer.isValid) return names[i];
		}
		// If nothing found, return first name
		return names[0];
	}
}
