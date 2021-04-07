/*
	Reset 'Align To' v1.1.1 (2020-11-02)
	(c) 2020 Paul Chiorean (jpeg@basement.ro)

	Resets the 'Align To' setting to default.

	Released under MIT License:
	https://opensource.org/licenses/MIT
*/

if (app.documents.length == 0) exit();

if (app.selection != NothingEnum.NOTHING && app.selectionKeyObject != NothingEnum.NOTHING) {
	var sel = app.selection;
	app.selectionKeyObject = NothingEnum.NOTHING;
	app.selection = sel;
}

app.alignDistributePreferences.alignDistributeBounds = AlignDistributeBounds.ITEM_BOUNDS;
