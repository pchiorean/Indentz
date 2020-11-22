/*
	Scale to page v1.1.1
	© November 2020, Paul Chiorean
	Scales the selected objects to the page size.
*/

if (!(doc = app.activeDocument)) exit();
var sel = doc.selection, sel_BAK = sel;
if (sel.length == 0 || (sel[0].constructor.name == "Guide")) {
	alert("Select an object and try again."); exit();
}
app.doScript(main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "Scale to page");


function main() {
	// Get selection's parent page
	var page;
	for (var i = 0; i < sel.length; i++) {
		if (sel[i].parentPage != null) { page = doc.pages[sel[i].parentPage.documentOffset]; break }
	}
	if (page == null) { alert("Select an object on page and try again."); exit() }
	// Remember layers for grouping/ungrouping
	var set_URL = app.generalPreferences.ungroupRemembersLayers;
	var set_PRL = app.clipboardPreferences.pasteRemembersLayers;
	app.generalPreferences.ungroupRemembersLayers = true;
	app.clipboardPreferences.pasteRemembersLayers = true;
	// Get selection dimensions
	var ungroup = false;
	if (sel.length > 1) {
		var selArray = [];
		for (var i = 0; i < sel.length; i++) if (!sel[i].locked) selArray.push(sel[i]);
		sel = page.groups.add(selArray); ungroup = true;
	} else sel = sel[0];
	// Compute scale factor
	var pgW = page.bounds[3] - page.bounds[1];
	var pgH = page.bounds[2] - page.bounds[0];
	var objW = sel.visibleBounds[3] - sel.visibleBounds[1];
	var objH = sel.visibleBounds[2] - sel.visibleBounds[0];
	var objSF = Math.min(pgW / objW, pgH / objH);
	var matrix = app.transformationMatrices.add({ horizontalScaleFactor: objSF, verticalScaleFactor: objSF });
	// Scale selection
	sel.transform(CoordinateSpaces.PASTEBOARD_COORDINATES, AnchorPoint.CENTER_ANCHOR, matrix);
	doc.align(sel, DistributeOptions.HORIZONTAL_CENTERS, AlignDistributeBounds.PAGE_BOUNDS);
	doc.align(sel, DistributeOptions.VERTICAL_CENTERS, AlignDistributeBounds.PAGE_BOUNDS);
	// Ungroup and restore selection
	if (ungroup) sel.ungroup();
	app.select(sel_BAK);
	// Restore layer grouping settings
	app.generalPreferences.ungroupRemembersLayers = set_URL;
	app.clipboardPreferences.pasteRemembersLayers = set_PRL;
}
