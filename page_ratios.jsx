/*
	Page ratios v1.1.2
	© June 2020, Paul Chiorean
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;
var idLayerName = "id", idLayer = doc.layers.item(idLayerName);
var infoLayerName = "info", infoLayer = doc.layers.item(infoLayerName);
var i, j, selPg, sizeMg, ratio, infoFrame;
app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;

if (!infoLayer.isValid) doc.layers.add({ name: infoLayerName });
infoLayer.properties = { layerColor: UIColors.CYAN, visible: true, locked: false, printable: false };
if (idLayer.isValid) infoLayer.move(LocationOptions.after, idLayer);
else infoLayer.move(LocationOptions.AT_BEGINNING);

for (i = 0; i < doc.pages.length; i++) {
	selPg = doc.pages.item(i); sizeMg = mgBounds(selPg);
	ratio = ((sizeMg[3] - sizeMg[1]) / (sizeMg[2] - sizeMg[0])).toFixed(3);
	for (j = 0; j < selPg.pageItems.length; j++) if (selPg.pageItems.item(j).label == "ratio") selPg.pageItems.item(j).remove();
	infoFrame = selPg.textFrames.add({ itemLayer: infoLayer.name, contents: ratio, label: "ratio", fillColor: "Black" });
	infoFrame.paragraphs.everyItem().properties = { appliedFont: app.fonts.item("Verdana"), fontStyle: "Bold", pointSize: 32, fillColor: "Paper" };
	infoFrame.fit(FitOptions.FRAME_TO_CONTENT);
	infoFrame.textFramePreferences.properties = {
		verticalJustification: VerticalJustification.CENTER_ALIGN,
		firstBaselineOffset: FirstBaseline.CAP_HEIGHT,
		autoSizingReferencePoint: AutoSizingReferenceEnum.TOP_CENTER_POINT,
		autoSizingType: AutoSizingTypeEnum.HEIGHT_AND_WIDTH,
		useNoLineBreaksForAutoSizing: true,
		insetSpacing: 4.25196850393701
	}
	doc.align(infoFrame, AlignOptions.LEFT_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
	doc.align(infoFrame, AlignOptions.TOP_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
}
infoLayer.locked = true;


function mgBounds(page) { // Return page margins bounds
	var sizePg = page.bounds;
	var mgPg = page.marginPreferences;
	var m_y1, m_x1, m_y2, m_x2;
	if (mgPg.top + mgPg.left + mgPg.bottom + mgPg.right != 0) {
		m_y1 = page.bounds[0] + mgPg.top;
		m_x1 = page.bounds[1] + mgPg.left;
		m_y2 = page.bounds[2] - mgPg.bottom;
		m_x2 = page.bounds[3] - mgPg.right;
		// Reverse left and right margins if left-hand page
		if (page.side == PageSideOptions.LEFT_HAND) {
			m_x1 = page.bounds[1] + mgPg.right;
			m_x2 = page.bounds[3] - mgPg.left;
		}
		return [m_y1, m_x1, m_y2, m_x2];
	} else return sizePg;
}