/*
	Label page v1.0 beta (2021-04-26)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Adds a label on the current page's slug.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument)) exit();

app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined,
	UndoModes.ENTIRE_SCRIPT, "Label page");


function main() {
	var page = app.activeWindow.activePage;
	var isOnTop = true;
	var ui = new Window("dialog", "Label page");
	ui.orientation = "row";
	ui.alignChildren = [ "left", "fill" ];
	ui.main = ui.add("panel", undefined, undefined);
	ui.main.orientation = "column";
	ui.main.alignChildren = [ "left", "top" ];
	ui.main.add("statictext", undefined, "Enter label text:");
	ui.label = ui.main.add("edittext", undefined, "", { enterKeySignalsOnChange: true });
	ui.label.characters = 56;
	ui.label.active = true;
	ui.caps = ui.main.add("checkbox", undefined, "Make label uppercase");
	ui.actions = ui.add("group", undefined);
	ui.actions.orientation = "column";
	ui.actions.alignChildren = [ "fill", "top" ];
	ui.ontop = ui.actions.add("button", undefined, "On top", { name: "ok" });
	ui.onbottom = ui.actions.add("button", undefined, "On bottom");
	ui.actions.add("button", undefined, "Cancel", { name: "cancel" });
	ui.ontop.onClick = function() { isOnTop = true; ui.close() };
	ui.onbottom.onClick = function() { isOnTop = false; ui.close() };
	if (ui.show() == 2) exit();
	SlugInfo(page, ui.label.text, ui.caps.value, isOnTop);
};

function SlugInfo(page, label, isCaps, isOnTop) {
	app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;
	var infoLayer = doc.layers.item("info");
	if (!infoLayer.isValid) doc.layers.add({ name: "info", layerColor: UIColors.CYAN });
	infoLayer.move(LocationOptions.AT_BEGINNING);
	infoLayer.visible = true;
	// Remove old page labels
	var item, items = page.pageItems.everyItem().getElements();
	while (item = items.shift()) if (item.name == "<page label>") { item.itemLayer.locked = false; item.remove() };
	// Add new label
	if (label == "") label = doc.name;
	label = label.replace(/^\s+/, '').replace(/\s+$/, '');
	doc.activeLayer = infoLayer;
	var infoFrame, infoText;
	infoFrame = page.textFrames.add({
		itemLayer: infoLayer.name,
		name: "<page label>",
		contents: label
	});
	infoText = infoFrame.parentStory.paragraphs.everyItem();
	infoText.properties = {
		appliedFont: app.fonts.item("Helvetica\tRegular"),
		pointSize: 6,
		fillColor: "Registration",
		capitalization: isCaps ? Capitalization.ALL_CAPS : Capitalization.NORMAL
	};
	infoFrame.fit(FitOptions.FRAME_TO_CONTENT);
	infoFrame.textFramePreferences.properties = {
		verticalJustification: VerticalJustification.TOP_ALIGN,
		firstBaselineOffset: FirstBaseline.CAP_HEIGHT,
		autoSizingReferencePoint: AutoSizingReferenceEnum.TOP_LEFT_POINT,
		autoSizingType: AutoSizingTypeEnum.HEIGHT_AND_WIDTH,
		useNoLineBreaksForAutoSizing: true
	};
	// Move frame in position
	switch (isOnTop) {
		case false:
			if (doc.documentPreferences.slugBottomOffset < 9)
				doc.documentPreferences.slugBottomOffset = 9 +
				doc.documentPreferences.properties.documentBleedBottomOffset;
			infoFrame.move([
				page.bounds[1] + 10,
				page.bounds[2] + doc.documentPreferences.properties.documentBleedBottomOffset + 3.5
			]);
			break;
		default:
			if (doc.documentPreferences.slugTopOffset < 9)
				doc.documentPreferences.slugTopOffset = 9 +
				doc.documentPreferences.properties.documentBleedTopOffset;
			infoFrame.move([
				page.bounds[1] + 10,
				-4.2 - infoFrame.geometricBounds[2] - doc.documentPreferences.properties.documentBleedTopOffset
			]);
	};
};
