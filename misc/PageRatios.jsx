/*
	Page ratios v1.1.6
	© July 2020, Paul Chiorean
	Calculates the ratio of each page and displays it in the upper left corner.
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;
var idLayerName = "id", idLayer = doc.layers.item(idLayerName);
var infoLayerName = "info", infoLayer = doc.layers.item(infoLayerName);
app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;

if (!infoLayer.isValid) doc.layers.add({ name: infoLayerName });
infoLayer.properties = { layerColor: UIColors.CYAN, visible: true, locked: false, printable: false };
if (idLayer.isValid) infoLayer.move(LocationOptions.after, idLayer);
else infoLayer.move(LocationOptions.AT_BEGINNING);

for (var i = 0; i < doc.pages.length; i++) {
	var page = doc.pages.item(i); var size = Bounds(page);
	var ratio = ((size[3] - size[1]) / (size[2] - size[0])).toFixed(3);
	for (var j = 0; j < page.pageItems.length; j++) if (page.pageItems.item(j).label == "ratio") page.pageItems.item(j).remove();
	var infoFrame = page.textFrames.add({ itemLayer: infoLayer.name, contents: ratio, label: "ratio", fillColor: "Black" });
	infoFrame.paragraphs.everyItem().properties = {
		appliedFont: app.fonts.item("Verdana\tBold"), pointSize: 32, fillColor: "Paper" };
	infoFrame.fit(FitOptions.FRAME_TO_CONTENT);
	infoFrame.textFramePreferences.properties = {
		verticalJustification: VerticalJustification.CENTER_ALIGN,
		firstBaselineOffset: FirstBaseline.CAP_HEIGHT,
		autoSizingReferencePoint: AutoSizingReferenceEnum.TOP_LEFT_POINT,
		autoSizingType: AutoSizingTypeEnum.HEIGHT_AND_WIDTH,
		useNoLineBreaksForAutoSizing: true,
		insetSpacing: 4.25196850393701 // 1.5 mm
	}
	doc.align(infoFrame, AlignOptions.LEFT_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
	doc.align(infoFrame, AlignOptions.TOP_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
}
infoLayer.locked = true;


function Bounds(page) { // Return page margins bounds
var size = [
	page.bounds[0] + page.marginPreferences.top,
	page.bounds[1] + page.marginPreferences.left,
	page.bounds[2] - page.marginPreferences.bottom,
	page.bounds[3] - page.marginPreferences.right
]
	// Reverse left and right margins if left-hand page
	if (page.side == PageSideOptions.LEFT_HAND) {
		page.bounds[1] = page.bounds[1] + page.marginPreferences.right;
		page.bounds[3] = page.bounds[3] - page.marginPreferences.left;
	}
	return size;
}