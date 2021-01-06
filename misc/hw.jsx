/*
	HW 0.6.0
	© January 2021, Paul Chiorean
	Labels 'HW' selected objects; w/o selection, adds a 10% bottom guide.
*/

if (!(doc = app.activeDocument)) exit();
var page = app.activeWindow.activePage;

var hwLayerName = "HW";
var hwLayer = doc.layers.item(hwLayerName);
if (!hwLayer.isValid) {
	doc.layers.add({ name: hwLayerName, layerColor: UIColors.LIGHT_GRAY });
	hwLayer.move(LocationOptions.AT_BEGINNING) }
hwLayer.locked = false;

var sel = doc.selection;
if (sel.length >= 1) {
	for (var i = 0; i < sel.length; i++) {
		sel[i].label = "HW";
		if (sel[i].constructor.name == "Rectangle" || sel[i].constructor.name == "TextFrame")
			sel[i].fillColor = "Paper";
	}
} else {
	var szPg = page.bounds[2];
	var szMg = szPg - (page.marginPreferences.top + page.marginPreferences.bottom);
	var j, guide;
	for (j = (guide = page.guides.everyItem().getElements()).length; j--;
		(guide[j].label == "HW") && guide[j].remove());
	doc.activeLayer = hwLayer;
	page.guides.add(undefined, {
		itemLayer: hwLayer, label: "HW", guideColor: UIColors.GREEN,
		orientation: HorizontalOrVertical.horizontal,
		location: szPg * 0.9 });
	if (szMg != szPg) {
		page.guides.add(undefined, {
			itemLayer: hwLayer, label: "HW", guideColor: UIColors.GREEN,
			orientation: HorizontalOrVertical.horizontal,
			location: page.marginPreferences.top + szMg * 0.9 });
	}
}
