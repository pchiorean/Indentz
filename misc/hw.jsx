/*
	HW 2.5.1 (2021-06-10)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Labels 'HW' selected objects and adds a HW bottom guide on the current spread.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
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
		if (item.constructor.name == "Rectangle") {
			if (item.graphics[0].isValid) {
				// item.fillColor = "Paper";
				item.graphics[0].localDisplaySetting = DisplaySettingOptions.HIGH_QUALITY;
			}
		}
		if (item.constructor.name == "TextFrame") {
			// item.fillColor = "Paper";
			item.paragraphs.everyItem().justification = Justification.CENTER_ALIGN;
			item.textFramePreferences.properties = {
				firstBaselineOffset: FirstBaseline.CAP_HEIGHT,
				verticalJustification: VerticalJustification.CENTER_ALIGN,
				autoSizingReferencePoint: AutoSizingReferenceEnum.CENTER_POINT,
				autoSizingType: AutoSizingTypeEnum.OFF,
				useNoLineBreaksForAutoSizing: true,
				insetSpacing: 0
			}
		}
	}
	// Remove old guides
	var guide, guides = doc.guides.everyItem().getElements();
	while (guide = guides.shift()) if (guide.label == "HW") guide.remove();
	// Add guides
	var target, pages = doc.pages.everyItem().getElements();
	while (target = pages.shift()) {
		var top = target.bounds[0], bottom = target.bounds[2];
		var frame, frames = target.rectangles.everyItem().getElements();
		while (frame = frames.shift()) {
			if (frame.label == "visible area" || frame.name == "<visible area>") {
				top = frame.geometricBounds[0],
				bottom = frame.geometricBounds[2];
				break;
			}
		}
		target.guides.add(undefined, {
			itemLayer: hwLayer,
			label: "HW",
			guideColor: UIColors.GREEN,
			orientation: HorizontalOrVertical.horizontal,
			location: bottom - (bottom - top) * (Number(HW_PCT) / 100) });
	}
}
