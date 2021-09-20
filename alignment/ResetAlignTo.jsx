/*
	Reset 'Align To' v1.2 (2021-04-07)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Resets the 'Align To' setting to default.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (app.documents.length > 0 && app.selection.length > 0 && app.selectionKeyObject) {
	var oldSelection = app.selection;
	app.selectionKeyObject = NothingEnum.NOTHING;
	app.selection = oldSelection;
}

app.alignDistributePreferences.alignDistributeBounds = AlignDistributeBounds.ITEM_BOUNDS;
