/*
	Page size from selection 21.9.17
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Sets the page size to the selected objects bounds.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument) || doc.selection.length === 0) exit();

app.doScript(main, ScriptLanguage.JAVASCRIPT, doc.selection,
	UndoModes.ENTIRE_SCRIPT, 'Page size from selection');


function main(selection) {
	var page, size, newPgSize, tmpFrame, i, n, mm, pp, p, s;
	var old = {
		objectsMoveWithPage: app.generalPreferences.objectsMoveWithPage,
		enableAdjustLayout: doc.adjustLayoutPreferences.enableAdjustLayout,
		enableAutoAdjustMargins: doc.adjustLayoutPreferences.enableAutoAdjustMargins
	};
	app.generalPreferences.objectsMoveWithPage = false;
	doc.adjustLayoutPreferences.enableAdjustLayout = false;
	doc.adjustLayoutPreferences.enableAutoAdjustMargins = false;
	// Get selection's parent page
	s = selection[0].parent;
	while (s.constructor.name !== 'Spread') s = s.parent;
	page = s.pages[0];
	for (i = 0, n = selection.length; i < n; i++)
		if (selection[i].parentPage) { page = selection[i].parentPage; break; }
	// Get selection dimensions
	size = selection[0].geometricBounds;
	for (i = 1, n = selection.length; i < n; i++) {
		size[0] = Math.min(selection[i].geometricBounds[0], size[0]);
		size[1] = Math.min(selection[i].geometricBounds[1], size[1]);
		size[2] = Math.max(selection[i].geometricBounds[2], size[2]);
		size[3] = Math.max(selection[i].geometricBounds[3], size[3]);
	}
	// Set page size
	page.marginPreferences.properties = { top: 0, left: 0, bottom: 0, right: 0 };
	doc.marginPreferences.properties =  { top: 0, left: 0, bottom: 0, right: 0 };
	page.layoutRule = LayoutRuleOptions.OFF;
	tmpFrame = page.rectangles.add({
		contentType: ContentType.UNASSIGNED,
		fillColor: 'None',
		strokeColor: 'None',
		geometricBounds: size
	});
	page.reframe(CoordinateSpaces.SPREAD_COORDINATES, [
		tmpFrame.resolve(AnchorPoint.TOP_LEFT_ANCHOR,     CoordinateSpaces.SPREAD_COORDINATES)[0],
		tmpFrame.resolve(AnchorPoint.BOTTOM_RIGHT_ANCHOR, CoordinateSpaces.SPREAD_COORDINATES)[0]
	]);
	tmpFrame.remove();
	// Also set document size
	if (doc.pages.length === 1) {
		newPgSize = { width: size[3] - size[1], height: size[2] - size[0] };
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
			doc.documentPreferences.pageWidth =  newPgSize.width;
			doc.documentPreferences.pageHeight = newPgSize.height;
		}
	}
	// Restore settings
	app.generalPreferences.objectsMoveWithPage = old.objectsMoveWithPage;
	doc.adjustLayoutPreferences.enableAdjustLayout = old.enableAdjustLayout;
	doc.adjustLayoutPreferences.enableAutoAdjustMargins = old.enableAutoAdjustMargins;
}
