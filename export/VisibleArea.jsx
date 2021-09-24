/*
	Visible area v3.2.1 (2021-09-24)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Creates on each page a 'visible area' frame the size of the page margins.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument)) exit();

app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined,
	UndoModes.ENTIRE_SCRIPT, 'Visible area');

function main() {
	var page, PM,
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
	var visSwatchName = 'Visible area';
	var visAreaRE = /^<?(visible|safe) area>?$/i;

	for (var i = 0, n = doc.pages.length; i < n; i++) {
		page = doc.pages[i];
		PM = page.marginPreferences;
		if (PM.top + PM.left + PM.bottom + PM.right === 0) continue;
		// Make swatch
		if (!doc.colors.itemByName(visSwatchName).isValid) {
			doc.colors.add({
				name: visSwatchName,
				model: ColorModel.SPOT,
				space: ColorSpace.CMYK,
				colorValue: [ 0, 100, 0, 0 ]
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
			strokeColor: visSwatchName,
			strokeWeight: '0.75pt',
			strokeAlignment: StrokeAlignment.INSIDE_ALIGNMENT,
			strokeType: '$ID/Canned Dashed 3x2',
			overprintStroke: false,
			itemLayer: visLayerName,
			geometricBounds: [
				page.bounds[0] + PM.top,
				(page.side === PageSideOptions.LEFT_HAND) ?
					page.bounds[1] + PM.right : page.bounds[1] + PM.left,
				page.bounds[2] - PM.bottom,
				(page.side === PageSideOptions.LEFT_HAND) ?
					page.bounds[3] - PM.left : page.bounds[3] - PM.right
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
