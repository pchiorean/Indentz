/*
	Safe area v2.0 (2021-02-02)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Creates on each page a 'safe area' frame the size of the page margins.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument)) exit();
var saLayerName = FindLayer([ "safe area", "visible", "Visible",
	"vizibil", "Vizibil", "vis. area", "Vis. area" ]);
var dieLayerName = FindLayer([ "dielines", "diecut", "die cut", "Die Cut",
	"cut", "Cut", "cut lines", "stanze", "Stanze", "Stanz", "decoupe" ]);
var saSwatchName = "Safe area";

app.doScript(main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "Safe area");


function main() {

for (var i = 0; i < doc.pages.length; i++) {
	var page = doc.pages[i];
	var margins = page.marginPreferences;
	if (margins.top + margins.left + margins.bottom + margins.right == 0) continue;
	// Make swatch
	if (!doc.colors.itemByName(saSwatchName).isValid)
		doc.colors.add({
			name: saSwatchName,
			model: ColorModel.PROCESS,
			space: ColorSpace.CMYK,
			colorValue: [ 0, 100, 0, 0 ]
		});
	// Make layer
	var saLayer = doc.layers.item(saLayerName);
	var dieLayer = doc.layers.item(dieLayerName);
	if (saLayer.isValid) {
		saLayer.properties = {
			layerColor: UIColors.YELLOW,
			visible: true,
			locked: false
		}
		if (dieLayer.isValid) saLayer.move(LocationOptions.before, dieLayer);
	} else {
		saLayer = doc.layers.add({ name: saLayerName,
			layerColor: UIColors.YELLOW,
			visible: true,
			locked: false
		});
		if (dieLayer.isValid) {
			saLayer.move(LocationOptions.before, dieLayer);
		} else saLayer.move(LocationOptions.AT_BEGINNING);
	}
	// Remove old frames
	var frame, frames = page.rectangles.everyItem().getElements();
	while (frame = frames.shift())
		if (frame.label == "safe area" &&
			frame.itemLayer == saLayer &&
			frame.locked == false) frame.remove();
	// Add frames
	var frame = page.rectangles.add({
		name: "<safe area>", label: "safe area",
		contentType: ContentType.UNASSIGNED,
		fillColor: "None", strokeColor: saSwatchName,
		strokeWeight: "0.75pt",
		strokeAlignment: StrokeAlignment.INSIDE_ALIGNMENT,
		strokeType: "$ID/Canned Dashed 3x2",
		overprintStroke: false,
		itemLayer: saLayerName,
		geometricBounds: [
			page.bounds[0] + margins.top,
			page.side == PageSideOptions.LEFT_HAND ?
				page.bounds[1] + margins.right : page.bounds[1] + margins.left,
			page.bounds[2] - margins.bottom,
			page.side == PageSideOptions.LEFT_HAND ?
				page.bounds[3] - margins.left : page.bounds[3] - margins.right
		]
	});
	saLayer.locked = true;
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
