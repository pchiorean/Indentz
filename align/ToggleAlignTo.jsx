/*
	Toggle 'Align To' 21.9.8
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Toggles the 'Align To' setting.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

var ADB = AlignDistributeBounds;

switch (app.alignDistributePreferences.alignDistributeBounds) {
	case ADB.ITEM_BOUNDS:
	case ADB.KEY_OBJECT:
		app.alignDistributePreferences.alignDistributeBounds = ADB.MARGIN_BOUNDS;
		break;
	case ADB.MARGIN_BOUNDS:
		app.alignDistributePreferences.alignDistributeBounds = ADB.PAGE_BOUNDS;
		break;
	case ADB.PAGE_BOUNDS:
		app.alignDistributePreferences.alignDistributeBounds = ADB.SPREAD_BOUNDS;
		break;
	case ADB.SPREAD_BOUNDS:
		app.alignDistributePreferences.alignDistributeBounds = ADB.ITEM_BOUNDS;
		break;
}
