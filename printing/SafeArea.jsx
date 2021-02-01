/*
	Safe area v1.8.5
	© February 2021, Paul Chiorean
	Creates a 'safe area' frame the size of the page margins.
*/

if (!(doc = app.activeDocument)) exit();
var saLayerName = FindLayer(["safe area", "visible", "Visible", "vizibil", "Vizibil", "vis. area", "Vis. area"]);
var dieLayerName = FindLayer(["dielines", "diecut", "die cut", "Die Cut", "cut", "Cut", "cut lines", "stanze", "Stanze", "Stanz", "decoupe"]);
var saSwatchName = "Safe area";

app.doScript(main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "Safe area");


function main() {
	if (!doc.colors.itemByName(saSwatchName).isValid)
		doc.colors.add({ name: saSwatchName, model: ColorModel.PROCESS,
		space: ColorSpace.CMYK, colorValue: [0, 100, 0, 0] });
	var saLayer = doc.layers.item(saLayerName);
	var dieLayer = doc.layers.item(dieLayerName);
	if (saLayer.isValid) {
		saLayer.properties = { layerColor: UIColors.YELLOW, visible: true, locked: false }
		if (dieLayer.isValid) saLayer.move(LocationOptions.before, dieLayer);
	} else {
		saLayer = doc.layers.add({ name: saLayerName,
			layerColor: UIColors.YELLOW, visible: true, locked: false });
		if (dieLayer.isValid) {
			saLayer.move(LocationOptions.before, dieLayer);
		} else saLayer.move(LocationOptions.AT_BEGINNING);
	}
	for (var i = 0; i < doc.pages.length; i++) {
		var page = doc.pages[i], saBounds = SafeArea(page);
		if (!saBounds) continue;
		var frame, frames = page.rectangles.everyItem().getElements();
		while (frame = frames.shift())
			if (frame.label == "safe area" &&
				frame.itemLayer == saLayer &&
				frame.locked == false) frame.remove();
		page.rectangles.add({
			name: "<safe area>", label: "safe area",
			contentType: ContentType.UNASSIGNED,
			fillColor: "None", strokeColor: saSwatchName,
			strokeWeight: "0.75pt",
			strokeAlignment: StrokeAlignment.INSIDE_ALIGNMENT,
			strokeType: "$ID/Canned Dashed 3x2",
			overprintStroke: false,
			itemLayer: saLayerName,
			geometricBounds: saBounds
		});
	}
	saLayer.locked = true;
}

function SafeArea(page) {
	var mg = page.marginPreferences;
	if (mg.top + mg.left + mg.bottom + mg.right == 0) return false;
	return [
		page.bounds[0] + mg.top,
		page.side == PageSideOptions.LEFT_HAND ? page.bounds[1] + mg.right : page.bounds[1] + mg.left,
		page.bounds[2] - mg.bottom,
		page.side == PageSideOptions.LEFT_HAND ? page.bounds[3] - mg.left : page.bounds[3] - mg.right
	];
}

function FindLayer(names) { // Find first valid layer from a list of names
	for (var i = 0; i < names.length; i++) {
		var layer = doc.layers.item(names[i]);
		if (layer.isValid) return names[i];
	}
	return names[0]; // Nothing found, return first name
}
