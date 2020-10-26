/*
	Reset 'Align To' v1.1.1
	© August 2020, Paul Chiorean
	Resets the 'Align To' setting to default.
*/

if (app.documents.length == 0) exit();

if (app.selection != NothingEnum.NOTHING && app.selectionKeyObject != NothingEnum.NOTHING) {
	var sel = app.selection;
	app.selectionKeyObject = NothingEnum.NOTHING;
	app.selection = sel;
}

app.alignDistributePreferences.alignDistributeBounds = AlignDistributeBounds.ITEM_BOUNDS;
