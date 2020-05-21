/*
	Page ratios v1.0.0
	© May 2020, Paul Chiorean
*/

var doc = app.activeDocument;
var idLayerName = "id", idLayer = doc.layers.item(idLayerName);
var ratioLayerName = "ratio", ratioLayer = doc.layers.item(ratioLayerName);
var i, j, pg, pgSz, pgAR, pgTF;
app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;

if (!ratioLayer.isValid) doc.layers.add({ name: ratioLayerName });
ratioLayer.properties = { layerColor: UIColors.CYAN, visible: true, locked: false, printable: false };
if (idLayer.isValid) ratioLayer.move(LocationOptions.after, idLayer);
else ratioLayer.move(LocationOptions.AT_BEGINNING);

for (i = 0; i < doc.pages.length; i++) {
	pg = doc.pages.item(i); pgSz = pg.bounds;
	pgAR = ((pgSz[3] - pgSz[1]) / (pgSz[2] - pgSz[0])).toFixed(3);
	for (j = 0; j < pg.pageItems.length; j++) if (pg.pageItems.item(j).label == "ratio") pg.pageItems.item(j).remove();
	pgTF = pg.textFrames.add({ itemLayer: ratioLayer.name, contents: pgAR, label: "ratio", fillColor: "Black" });
	pgTF.paragraphs.everyItem().properties = { appliedFont: app.fonts.item("Verdana"), fontStyle: "Bold", pointSize: 32, fillColor: "Paper" };
	pgTF.fit(FitOptions.FRAME_TO_CONTENT);
	pgTF.textFramePreferences.properties = {
		verticalJustification: VerticalJustification.CENTER_ALIGN,
		firstBaselineOffset: FirstBaseline.CAP_HEIGHT,
		autoSizingReferencePoint: AutoSizingReferenceEnum.TOP_CENTER_POINT,
		autoSizingType: AutoSizingTypeEnum.HEIGHT_AND_WIDTH,
		useNoLineBreaksForAutoSizing: true,
		insetSpacing: 4.25196850393701
	}
	doc.align(pgTF, AlignOptions.LEFT_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
	doc.align(pgTF, AlignOptions.TOP_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
}
ratioLayer.locked = true;