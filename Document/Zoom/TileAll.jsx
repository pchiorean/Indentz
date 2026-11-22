/*
	Tile all 26.11.12
	(c) 2020-2026 Paul Chiorean <jpeg@basement.ro>

	Invokes different window tiling options, depending on the current spread orientation.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (app.documents.length < 2) exit();
if (app.activeWindow.constructor.name !== 'LayoutWindow') exit();

var page = app.activeWindow.activePage;

var size = {
	width:  page.parent.pages.lastItem().bounds[3] - page.parent.pages.firstItem().bounds[1],
	height: page.parent.pages.lastItem().bounds[2] - page.parent.pages.firstItem().bounds[0]
};
var R = size.width / size.height;

if (R < 1) app.menuActions.item('$ID/Tile All Vertically').invoke();
else if (R > 1) app.menuActions.item('$ID/Tile All Horizontally').invoke();
else app.menuActions.item('$ID/Tile').invoke();

app.selection = NothingEnum.NOTHING;
app.layoutWindows.everyItem().zoom(ZoomOptions.FIT_SPREAD);
