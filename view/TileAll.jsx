/*
	Tile all 22.11.12
	(c) 2020-2022 Paul Chiorean (jpeg@basement.ro)

	Invokes 'Tile All Vertically' or 'Tile All Horizontally',
	depending on current spread orientation.

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

switch (size.width / size.height <= 1) {
	case true:
		app.menuActions.item('$ID/Tile All Vertically').invoke();
		break;
	case false:
		app.menuActions.item('$ID/Tile All Horizontally').invoke();
		break;
}

app.selection = NothingEnum.NOTHING;
for (var i = 0, n = app.windows.length; i < n; i++)
	if (app.windows[i].constructor.name === 'LayoutWindow') app.windows[i].zoom(ZoomOptions.FIT_SPREAD);
