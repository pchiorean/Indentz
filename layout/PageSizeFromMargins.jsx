/*
	Page size from margins 21.9.18
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Sets the page size to the page margins.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument)) exit();

app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined,
	UndoModes.ENTIRE_SCRIPT, 'Page size from margins');

function main() {
	var tmpFrame, newPgSize, mm, pp, s;
	var page = app.activeWindow.activePage;
	var PM = page.marginPreferences;
	if (PM.top + PM.left + PM.bottom + PM.right === 0) return;
	var old = {
		objectsMoveWithPage:     app.generalPreferences.objectsMoveWithPage,
		enableAdjustLayout:      doc.adjustLayoutPreferences.enableAdjustLayout,
		enableAutoAdjustMargins: doc.adjustLayoutPreferences.enableAutoAdjustMargins
	};
	app.generalPreferences.objectsMoveWithPage          = false;
	doc.adjustLayoutPreferences.enableAdjustLayout      = false;
	doc.adjustLayoutPreferences.enableAutoAdjustMargins = false;
	// Set page size
	tmpFrame = page.rectangles.add({
		contentType: ContentType.UNASSIGNED,
		fillColor: 'None',
		strokeColor: 'None',
		geometricBounds: [
			page.bounds[0] + PM.top,
			page.bounds[1] + (page.side === PageSideOptions.LEFT_HAND ? PM.right : PM.left),
			page.bounds[2] - PM.bottom,
			page.bounds[3] - (page.side === PageSideOptions.LEFT_HAND ? PM.left : PM.right)
		]
	});
	page.marginPreferences.properties = { top: 0, left: 0, bottom: 0, right: 0 };
	doc.marginPreferences.properties  = { top: 0, left: 0, bottom: 0, right: 0 };
	page.layoutRule = LayoutRuleOptions.OFF;
	page.reframe(CoordinateSpaces.SPREAD_COORDINATES, [
		tmpFrame.resolve(AnchorPoint.TOP_LEFT_ANCHOR,     CoordinateSpaces.SPREAD_COORDINATES)[0],
		tmpFrame.resolve(AnchorPoint.BOTTOM_RIGHT_ANCHOR, CoordinateSpaces.SPREAD_COORDINATES)[0]
	]);
	tmpFrame.remove();
	// Also set document size
	if (doc.pages.length === 1) {
		newPgSize = {
			width:  (page.bounds[3] - page.bounds[1]),
			height: (page.bounds[2] - page.bounds[0]) };
		try {
			doc.documentPreferences.pageWidth =  newPgSize.width;
			doc.documentPreferences.pageHeight = newPgSize.height;
		} catch (e) {
			mm = doc.masterSpreads.everyItem().getElements();
			while ((s = mm.shift())) {
				pp = s.pages.everyItem().getElements();
				while ((p = pp.shift()))
					p.marginPreferences.properties = { top: 0, left: 0, bottom: 0, right: 0 };
			}
			doc.documentPreferences.pageWidth  = newPgSize.width;
			doc.documentPreferences.pageHeight = newPgSize.height;
		}
	}
	// Restore settings
	app.generalPreferences.objectsMoveWithPage          = old.objectsMoveWithPage;
	doc.adjustLayoutPreferences.enableAdjustLayout      = old.enableAdjustLayout;
	doc.adjustLayoutPreferences.enableAutoAdjustMargins = old.enableAutoAdjustMargins;
}
