/*
	HW 2.7 (2021-09-12)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Labels 'HW' selected objects and adds a HW bottom guide on all spreads.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument)) exit();

app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined,
	UndoModes.ENTIRE_SCRIPT, 'HW');

function main() {
	var item, guide, target, top, frame, frames;
	var items = doc.selection;
	var guides = doc.guides.everyItem().getElements();
	var pages = doc.pages.everyItem().getElements();
	var hwLayerName = 'HW';
	var hwLayer = doc.layers.item(hwLayerName);
	var HW_PCT = 10; // HW size in percent of visible area
	var visibleAreaRE = /^<?(visible|safe) area>?$/i;
	app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;

	// Make HW layer
	if (!hwLayer.isValid) {
		doc.layers.add({ name: hwLayerName, layerColor: UIColors.LIGHT_GRAY });
		hwLayer.move(LocationOptions.AT_BEGINNING);
	}
	hwLayer.locked = false;
	doc.activeLayer = hwLayer;
	// Set selected objects' label and properties
	while ((item = items.shift())) {
		if (!/\bhw\b/gi.test(item.label)) item.label += ' hw';
		item.label = item.label.replace(/ +/g, ' ').replace(/^ +| +$/g, '');
		if (item.constructor.name === 'Rectangle') {
			if (item.graphics[0].isValid)
				item.graphics[0].localDisplaySetting = DisplaySettingOptions.HIGH_QUALITY;
		}
		if (item.constructor.name === 'TextFrame') {
			item.paragraphs.everyItem().justification = Justification.CENTER_ALIGN;
			item.textFramePreferences.properties = {
				firstBaselineOffset:          FirstBaseline.CAP_HEIGHT,
				verticalJustification:        VerticalJustification.CENTER_ALIGN,
				autoSizingReferencePoint:     AutoSizingReferenceEnum.CENTER_POINT,
				autoSizingType:               AutoSizingTypeEnum.OFF,
				useNoLineBreaksForAutoSizing: true,
				insetSpacing:                 0
			};
		}
	}
	// Remove old guides
	while ((guide = guides.shift())) if (/hw/gi.test(guide.label)) guide.remove();
	// Add guides
	while ((target = pages.shift())) {
		top = target.bounds[0];
		bottom = target.bounds[2];
		frames = target/*.parent*/.pageItems.everyItem().getElements();
		while ((frame = frames.shift())) {
			if (visibleAreaRE.test(frame.label) || visibleAreaRE.test(frame.name)) {
				top = frame.geometricBounds[0];
				bottom = frame.geometricBounds[2];
				break;
			}
		}
		target.guides.add(undefined, {
			itemLayer:   hwLayer,
			label:       'hw',
			guideColor:  UIColors.GREEN,
			orientation: HorizontalOrVertical.HORIZONTAL,
			location:    (bottom - (bottom - top) * (Number(HW_PCT) / 100))
		});
	}
}
