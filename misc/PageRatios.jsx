/*
	Page ratios v1.4.1 (2021-01-24)
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
	while (item = items.shift()) if (item.label == "ratio") item.remove();
	for (var i = 0; i < doc.pages.length; i++) {
		var page = doc.pages.item(i), size = Bounds(page);
		var ratio = ((size[3] - size[1]) / (size[2] - size[0])).toFixed(3);
		var infoFrame = page.textFrames.add({
			itemLayer: infoLayer.name,
			contents: ratio,
			label: "ratio",
			fillColor: "Black",
			nonprinting: true });
		infoFrame.paragraphs.everyItem().properties = {
			appliedFont: app.fonts.item("Verdana\tBold"),
			pointSize: 22,
			fillColor: "Paper" };
		infoFrame.fit(FitOptions.FRAME_TO_CONTENT);
		infoFrame.textFramePreferences.properties = {
			verticalJustification: VerticalJustification.CENTER_ALIGN,
			firstBaselineOffset: FirstBaseline.CAP_HEIGHT,
			autoSizingReferencePoint: AutoSizingReferenceEnum.TOP_LEFT_POINT,
			autoSizingType: AutoSizingTypeEnum.HEIGHT_AND_WIDTH,
			useNoLineBreaksForAutoSizing: true,
			insetSpacing: UnitValue("1.5mm").as('pt')
		}
		doc.align(infoFrame, AlignOptions.LEFT_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
		doc.align(infoFrame, AlignOptions.TOP_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
		// Outline text
		var infoOutlines = infoFrame.createOutlines(false);
		infoFrame.contents = "";
		infoFrame.contentType = ContentType.UNASSIGNED;
		infoFrame.contentPlace(infoOutlines);
		infoOutlines[0].remove();
		infoFrame.fit(FitOptions.CENTER_CONTENT);
	}
	// infoLayer.locked = true;
}

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
}