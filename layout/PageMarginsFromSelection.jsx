/*
	Page margins from selection 21.9.17
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Sets the page margins to the selected objects bounds.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument) || doc.selection.length === 0) exit();

app.doScript(main, ScriptLanguage.JAVASCRIPT, doc.selection,
	UndoModes.ENTIRE_SCRIPT, 'Page margins from selection');

function main(selection) {
	var page, size, i, n;
	// Get selection's parent page
	for (i = 0, n = selection.length; i < n; i++)
		if (selection[i].parentPage) { page = doc.pages[selection[i].parentPage.documentOffset]; break; }
	if (!page) return;
	// Get selection dimensions
	size = selection[0].geometricBounds;
	for (i = 1, n = selection.length; i < n; i++) {
		size[0] = Math.min(selection[i].geometricBounds[0], size[0]);
		size[1] = Math.min(selection[i].geometricBounds[1], size[1]);
		size[2] = Math.max(selection[i].geometricBounds[2], size[2]);
		size[3] = Math.max(selection[i].geometricBounds[3], size[3]);
	}
	// Set page margins
	page.marginPreferences.properties = {
		top:          0,
		left:         0,
		bottom:       0,
		right:        0,
		columnCount:  1,
		columnGutter: 0
	};
	page.marginPreferences.properties = {
		top:    size[0] - page.bounds[0],
		left:   (page.side === PageSideOptions.LEFT_HAND) ? page.bounds[3] - size[3] : size[1] - page.bounds[1],
		bottom: page.bounds[2] - size[2],
		right:  (page.side === PageSideOptions.LEFT_HAND) ? size[1] - page.bounds[1] : page.bounds[3] - size[3]
	};
}
