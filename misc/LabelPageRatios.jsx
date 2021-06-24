/*
	Page ratios v2.1 (2021-06-20)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Adds a label (ratio) on each page's slug.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument)) exit();

app.doScript(main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "Label page ratios");

function main() {
	for (var i = 0; i < doc.pages.length; i++) {
		var page = doc.pages.item(i), size = Bounds(page);
		var ratio = ((size[3] - size[1]) / (size[2] - size[0])).toFixed(3);
		SlugInfo(page, ratio);
	};
};

function SlugInfo(page, label, /*bool*/isCaps, /*bool*/isOnTop) {
	app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;
	isCaps = isCaps || true;
	isOnTop = isOnTop || true;
	// Make layer
	var infoLayerName = "info", infoLayer = doc.layers.item(infoLayerName);
	var idLayerName = "id", idLayer = doc.layers.item(idLayerName);
	if (!infoLayer.isValid) doc.layers.add({
		name: infoLayerName,
		layerColor: UIColors.CYAN,
		visible: true, locked: false, printable: true
	});
	if (idLayer.isValid) infoLayer.move(LocationOptions.after, idLayer);
	else infoLayer.move(LocationOptions.AT_BEGINNING);
	// Remove old page labels
	var item, items = page.pageItems.everyItem().getElements();
	while (item = items.shift()) if (item.name == "<page label>") { item.itemLayer.locked = false; item.remove() };
	// Add new label
	if (label == "") label = doc.name, isCaps = false;
	label = label.replace(/^\s+|\s+$/g, "");
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

function Bounds(page) { // Return page margins bounds
	return [
		page.bounds[0] + page.marginPreferences.top,
		page.side == PageSideOptions.LEFT_HAND ?
			page.bounds[1] + page.marginPreferences.right :
			page.bounds[1] + page.marginPreferences.left,
		page.bounds[2] - page.marginPreferences.bottom,
		page.side == PageSideOptions.LEFT_HAND ?
			page.bounds[3] - page.marginPreferences.left :
			page.bounds[3] - page.marginPreferences.right
	];
};
