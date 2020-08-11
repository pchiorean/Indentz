/*
	Toggle 'Align To' v1.0.0
	© August 2020, Paul Chiorean
*/

if (app.documents.length == 0) exit();

switch(app.alignDistributePreferences.alignDistributeBounds) {
	case 1416587604: // ITEM_BOUNDS
	case 1699439993: // KEY_OBJECT
		app.alignDistributePreferences.alignDistributeBounds = AlignDistributeBounds.MARGIN_BOUNDS; break;
	case 1416588609: // MARGIN_BOUNDS
		app.alignDistributePreferences.alignDistributeBounds = AlignDistributeBounds.PAGE_BOUNDS; break;
	case 1416589377: // PAGE_BOUNDS
		app.alignDistributePreferences.alignDistributeBounds = AlignDistributeBounds.SPREAD_BOUNDS; break;
	case 1416590160: // SPREAD_BOUNDS
		app.alignDistributePreferences.alignDistributeBounds = AlignDistributeBounds.ITEM_BOUNDS; break;
}