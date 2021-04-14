/*
	Visible area v3.0 (2021-04-14)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Creates on each page a 'visible area' frame the size of the page margins.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument)) exit();
var visLayerName = FindLayer([
	"visible area",
	"visible", "Visible",
	"vizibil", "Vizibil",
	"vis. area", "Vis. area"
]);
var dieLayerName = FindLayer([
	"dielines",
	"cut lines", "Cut lines", "cut", "Cut", "CUT",
	"decoupe", "Decoupe",
	"die", "Die", "die cut", "Die Cut", "diecut", "Diecut",
	"stanz", "Stanz", "stanze", "Stanze",
	"stanzform", "Stanzform"
]);
var visSwatchName = "Visible area";

app.doScript(main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "Visible area");


function main() {

for (var i = 0; i < doc.pages.length; i++) {
	var page = doc.pages[i];
	var margins = page.marginPreferences;
	if (margins.top + margins.left + margins.bottom + margins.right == 0) continue;
	// Make swatch
	if (!doc.colors.itemByName(visSwatchName).isValid)
		doc.colors.add({
			name: visSwatchName,
			model: ColorModel.PROCESS,
			space: ColorSpace.CMYK,
			colorValue: [ 0, 100, 0, 0 ]
		});
	// Make layer
	var visLayer = doc.layers.item(visLayerName);
	var dieLayer = doc.layers.item(dieLayerName);
	if (visLayer.isValid) {
		visLayer.properties = {
			layerColor: UIColors.YELLOW,
			visible: true,
			locked: false
		}
		if (dieLayer.isValid) visLayer.move(LocationOptions.before, dieLayer);
	} else {
		visLayer = doc.layers.add({ name: visLayerName,
			layerColor: UIColors.YELLOW,
			visible: true,
			locked: false
		});
		if (dieLayer.isValid) {
			visLayer.move(LocationOptions.before, dieLayer);
		} else visLayer.move(LocationOptions.AT_BEGINNING);
	}
	// Remove old frames
	var frame, frames = page.rectangles.everyItem().getElements();
	while (frame = frames.shift())
		if ((frame.label == "visible area" || frame.name == "<visible area>") &&
				frame.itemLayer == visLayer) {
			frame.locked == false;
			frame.remove();
		}
	// Add frames
	var frame = page.rectangles.add({
		name: "<visible area>", label: "visible area",
		contentType: ContentType.UNASSIGNED,
		fillColor: "None", strokeColor: visSwatchName,
		strokeWeight: "0.75pt",
		strokeAlignment: StrokeAlignment.INSIDE_ALIGNMENT,
		strokeType: "$ID/Canned Dashed 3x2",
		overprintStroke: false,
		itemLayer: visLayerName,
		geometricBounds: [
			page.bounds[0] + margins.top,
			page.side == PageSideOptions.LEFT_HAND ?
				page.bounds[1] + margins.right : page.bounds[1] + margins.left,
			page.bounds[2] - margins.bottom,
			page.side == PageSideOptions.LEFT_HAND ?
				page.bounds[3] - margins.left : page.bounds[3] - margins.right
		]
	});
	visLayer.locked = true;
}

}

// Find first valid layer from a list of names
function FindLayer(names) {
	for (var i = 0; i < names.length; i++) {
		var layer = doc.layers.item(names[i]);
		if (layer.isValid) return names[i];
	}
	return names[0]; // If nothing found, return first name
}
