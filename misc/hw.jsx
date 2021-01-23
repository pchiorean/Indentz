/*
	HW 2.0.0
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
	// Remove old HW guides
	var guide, guides = page.guides.everyItem().getElements();
	while (guide = guides.shift())
		if (guide.label == "HW") guide.remove();
	// Check if safe area is set
	var saFrame, frames = page.rectangles.everyItem().getElements(), flg_SA = false;
	while (saFrame = frames.shift())
		if (saFrame.label == "safe area") { flg_SA = true; break };
	// Check if E grid is set
	var flg_E = ((page.marginPreferences.columnCount == 6 ||
		page.marginPreferences.columnCount == 12) &&
		page.marginPreferences.columnGutter == 0);
	// Add HW guide
	if (flg_SA) { // Safe area takes priority
		var target = { top: saFrame.geometricBounds[0], bottom: saFrame.geometricBounds[2] }
	} else { // Page height, considering margins (not if E grid)
		var target = {
			top: page.bounds[0] + (flg_E ? 0 : page.marginPreferences.top),
			bottom: page.bounds[2] - (flg_E ? 0 : page.marginPreferences.bottom)
		}
	}
	page.guides.add(undefined, {
		itemLayer: hwLayer,
		label: "HW",
		guideColor: UIColors.GREEN,
		orientation: HorizontalOrVertical.horizontal,
		location: target.bottom - (target.bottom - target.top) * (Number(HW_PCT) / 100) }
	);
}
