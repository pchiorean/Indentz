/*
	HW 2.1.0
	© January 2021, Paul Chiorean
	Labels 'HW' selected objects and adds a HW bottom guide.
*/

if (!(doc = app.activeDocument)) exit();
var page = app.activeWindow.activePage;
app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;
const HW_PCT = 10; // HW: percent of visible area

app.doScript(main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "HW");

function main() {
	// Make HW layer
	var hwLayerName = "HW";
	var hwLayer = doc.layers.item(hwLayerName);
	if (!hwLayer.isValid) {
		doc.layers.add({ name: hwLayerName, layerColor: UIColors.LIGHT_GRAY });
		hwLayer.move(LocationOptions.AT_BEGINNING) }
	hwLayer.locked = false;
	doc.activeLayer = hwLayer;
	// Set selected objects' label and color
	var item, items = doc.selection;
	while (item = items.shift()) {
		item.label = "HW";
		if (item.constructor.name == "Rectangle" || item.constructor.name == "TextFrame")
			item.fillColor = "Paper";
	}
	// Remove old guides
	var guide, guides = page.parent.guides.everyItem().getElements();
	while (guide = guides.shift()) if (guide.label == "HW") guide.remove();
	// Add guides
	var target, pages = page.parent.pages.everyItem().getElements();
	while (target = pages.shift()) {
		var top = target.bounds[0], bottom = target.bounds[2];
		var saFrame, frames = page.rectangles.everyItem().getElements();
		while (saFrame = frames.shift()) if (saFrame.label == "safe area")
			top = saFrame.geometricBounds[0], bottom = saFrame.geometricBounds[2];
		target.guides.add(undefined, {
			itemLayer: hwLayer,
			label: "HW",
			guideColor: UIColors.GREEN,
			orientation: HorizontalOrVertical.horizontal,
			location: bottom - (bottom - top) * (Number(HW_PCT) / 100) });
	}
}
