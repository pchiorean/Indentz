/*
	Toggle 'Align To' v1.0.1 (2020-11-02)
	(c) 2020 Paul Chiorean (jpeg@basement.ro)

	Toggles the 'Align To' setting.

	Released under MIT License:
	https://opensource.org/licenses/MIT
*/

if (app.documents.length == 0) exit();

const ADB = AlignDistributeBounds;

switch(app.alignDistributePreferences.alignDistributeBounds) {
	case ADB.ITEM_BOUNDS:
	case ADB.KEY_OBJECT:
		app.alignDistributePreferences.alignDistributeBounds = ADB.MARGIN_BOUNDS; break;
	case ADB.MARGIN_BOUNDS:
		app.alignDistributePreferences.alignDistributeBounds = ADB.PAGE_BOUNDS; break;
	case ADB.PAGE_BOUNDS:
		app.alignDistributePreferences.alignDistributeBounds = ADB.SPREAD_BOUNDS; break;
	case ADB.SPREAD_BOUNDS:
		app.alignDistributePreferences.alignDistributeBounds = ADB.ITEM_BOUNDS; break;
}