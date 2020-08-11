/*
	Align to center v1.0.0
	© August 2020, Paul Chiorean
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;

var sel = doc.selection;
if (sel.length == 0 || (sel[0].constructor.name == "Guide")) exit();

var set_ADB = app.alignDistributePreferences.alignDistributeBounds;

for (var i = 0; i < sel.length; i++) {
	var obj = sel[i], page;
	if (page = obj.parentPage) {
		doc.align(obj, AlignOptions.HORIZONTAL_CENTERS, set_ADB);
		doc.align(obj, AlignOptions.VERTICAL_CENTERS, set_ADB);
	}
}
