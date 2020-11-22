/*
	Page margins from selection v1.3.1
	© November 2020, Paul Chiorean
	Sets the page margins to the selected objects bounds.
*/

if (!(doc = app.activeDocument)) exit();
var sel = doc.selection;
if (sel.length == 0 || (sel[0].constructor.name == "Guide")) {
	alert("Select an object and try again."); exit();
}

app.doScript(main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "Page margins from selection");


function main() {
	// Get selection's parent page
	var selObj = sel, page;
	for (var i = 0; i < selObj.length; i++) {
		if (selObj[i].parentPage != null) { page = selObj[i].parentPage; break }
	}
	if (page == null) { alert("Select an object on page and try again."); exit() }
	// Get selection dimensions
	var size = selObj[0].visibleBounds;
	for (var i = 1; i < selObj.length; i++) {
		size[0] = Math.min(selObj[i].visibleBounds[0], size[0]);
		size[1] = Math.min(selObj[i].visibleBounds[1], size[1]);
		size[2] = Math.max(selObj[i].visibleBounds[2], size[2]);
		size[3] = Math.max(selObj[i].visibleBounds[3], size[3]);
	}
	page.marginPreferences.properties = {
		top: 0, left: 0, bottom: 0, right: 0, columnCount: 1, columnGutter: 0
	}
	page.marginPreferences.properties = {
		top: size[0] - page.bounds[0],
		left: page.side == PageSideOptions.LEFT_HAND ? page.bounds[3] - size[3] : size[1] - page.bounds[1],
		bottom: page.bounds[2] - size[2],
		right: page.side == PageSideOptions.LEFT_HAND ? size[1] - page.bounds[1] : page.bounds[3] - size[3]
	}
	// Restore initial selection
	try { app.select(sel) } catch (_) {}
}