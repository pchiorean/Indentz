/*
	Page ratios v2.0 (2021-06-11)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Calculates the ratio of each page and displays it in the upper left corner.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument)) exit();
var idLayerName = "id", idLayer = doc.layers.item(idLayerName);
var infoLayerName = "info", infoLayer = doc.layers.item(infoLayerName);
app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;

app.doScript(main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "Page ratios");


function main() {
	if (!infoLayer.isValid) doc.layers.add({ name: infoLayerName });
	infoLayer.properties = {
		layerColor: UIColors.CYAN,
		visible: true,
		locked: false,
		printable: true };
	if (idLayer.isValid) infoLayer.move(LocationOptions.after, idLayer);
	else infoLayer.move(LocationOptions.AT_BEGINNING);

	var item, items = doc.rectangles.everyItem().getElements();
	while (item = items.shift()) if (item.name == "<page label>") item.remove();
	for (var i = 0; i < doc.pages.length; i++) {
		var page = doc.pages.item(i), size = Bounds(page);
		var ratio = ((size[3] - size[1]) / (size[2] - size[0])).toFixed(3);
		SlugInfo(page.parent, ratio);
	};
};

function SlugInfo(spread, name) {
	app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;
	if (doc.documentPreferences.slugTopOffset < 9)
		doc.documentPreferences.slugTopOffset = 9 +
		doc.documentPreferences.properties.documentBleedTopOffset;
	var infoFrame, infoText, infoColor;
	infoFrame = spread.pages[0].textFrames.add({
		itemLayer: infoLayer.name,
		name: "<page label>",
		contents: name
	});
	infoText = infoFrame.parentStory.paragraphs.everyItem();
	infoText.properties = {
		appliedFont: app.fonts.item("Helvetica\tRegular"),
		pointSize: 6,
		fillColor: "Registration",
		capitalization: Capitalization.ALL_CAPS
	};
	infoFrame.fit(FitOptions.FRAME_TO_CONTENT);
	infoFrame.textFramePreferences.properties = {
		verticalJustification: VerticalJustification.TOP_ALIGN,
		firstBaselineOffset: FirstBaseline.CAP_HEIGHT,
		autoSizingReferencePoint: AutoSizingReferenceEnum.TOP_LEFT_POINT,
		autoSizingType: AutoSizingTypeEnum.HEIGHT_AND_WIDTH,
		useNoLineBreaksForAutoSizing: true
	};
	infoFrame.move([ 10, -4.2 - infoFrame.geometricBounds[2] -
		doc.documentPreferences.properties.documentBleedTopOffset ]);
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
