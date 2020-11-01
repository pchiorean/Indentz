/*
	Page size from margins v1.3.0
	© October 2020, Paul Chiorean
	Sets the page size to the page margins.
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;

app.doScript(main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "Page size from margins");


function main() {
	app.generalPreferences.objectsMoveWithPage = false;
	doc.adjustLayoutPreferences.enableAdjustLayout = false;
	doc.adjustLayoutPreferences.enableAutoAdjustMargins = false;
	for (var i = 0; i < doc.pages.length; i++) {
		var page = doc.pages[i];
		var mgPg = page.marginPreferences;
		if (mgPg.top + mgPg.left + mgPg.bottom + mgPg.right == 0) continue;
		var mg = page.rectangles.add({ // Make temp rectangle
			contentType: ContentType.UNASSIGNED,
			fillColor: "None", strokeColor: "None",
			geometricBounds: [
				page.bounds[0] + mgPg.top,
				page.bounds[1] + (page.side == PageSideOptions.LEFT_HAND ? mgPg.right : mgPg.left),
				page.bounds[2] - mgPg.bottom,
				page.bounds[3] - (page.side == PageSideOptions.LEFT_HAND ? mgPg.left : mgPg.right)
			]});
		page.marginPreferences.properties = { top: 0, left: 0, bottom: 0, right: 0 }
		doc.marginPreferences.properties = { top: 0, left: 0, bottom: 0, right: 0 }
		page.layoutRule = LayoutRuleOptions.OFF;
		page.reframe(CoordinateSpaces.SPREAD_COORDINATES, [
			mg.resolve(AnchorPoint.TOP_LEFT_ANCHOR, CoordinateSpaces.SPREAD_COORDINATES)[0],
			mg.resolve(AnchorPoint.BOTTOM_RIGHT_ANCHOR, CoordinateSpaces.SPREAD_COORDINATES)[0]
		]);
		mg.remove();
	}
	// Also set document size
	if (doc.pages.length == 1) {
		var sizePg = {
			width: (page.bounds[3] - page.bounds[1]),
			height: (page.bounds[2] - page.bounds[0]) }
		try {
			doc.documentPreferences.pageWidth = sizePg.width;
			doc.documentPreferences.pageHeight = sizePg.height;
		} catch (_) {
			while (s = doc.masterSpreads.shift()) {
				while (i = s.pages.shift())
					i.marginPreferences.properties = { top: 0, left: 0, bottom: 0, right: 0 }
			}
			doc.documentPreferences.pageWidth = sizePg.width;
			doc.documentPreferences.pageHeight = sizePg.height;
		}
	}
}
