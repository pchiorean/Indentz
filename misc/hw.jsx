/*
	HW 0.5.0
	© August 2020, Paul Chiorean
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;

// Make layer
var hwLayerName = FindLayer(["HW", "Hw Logo", "HW Logo", "hw", "Logo HW", "wh", "WH", "WHW"]);
var hwLayer = doc.layers.item(hwLayerName);
if (!hwLayer.isValid) {
	doc.layers.add({ name: hwLayerName, layerColor: UIColors.LIGHT_GRAY });
	hwLayer.move(LocationOptions.AT_BEGINNING) }
hwLayer.locked = false;
// If a rectangle is selected, label it "HW" and make it white
var sel = doc.selection;
if (sel.length >= 1) {
	for (var i = 0; i < sel.length; i++) {
		if (sel[i].constructor.name == "Rectangle" || sel[i].constructor.name == "TextFrame") {
			sel[i].label = "HW"; sel[i].fillColor = "Paper" }
	}
	MkGuide(sel[0].parentPage); // Add a 10% bottom guide on this page
} else { // Add a 10% bottom guide on all pages
	for (var i = 0; i < doc.pages.length; i++) MkGuide(doc.pages[i]);
}


function MkGuide(page) { // Add 10% bottom guides
	var szPg = page.bounds[2];
	var szMg = szPg - (page.marginPreferences.top + page.marginPreferences.bottom);
	var j, guide;
	for (j = (guide = page.guides.everyItem().getElements()).length; j--;
		(guide[j].label == "HW") && guide[j].remove());
	doc.activeLayer = hwLayer;
	page.guides.add(undefined, {
		itemLayer: hwLayer, label: "HW", guideColor: UIColors.GREEN,
		orientation: HorizontalOrVertical.horizontal,
		location: szPg * 0.9
	});
	if (szMg != szPg) {
		page.guides.add(undefined, {
			itemLayer: hwLayer, label: "HW", guideColor: UIColors.GREEN,
			orientation: HorizontalOrVertical.horizontal,
			location: page.marginPreferences.top + szMg * 0.9
		});
	}
}

function FindLayer(names) { // Find first layer from a list of names
	for (var i = 0; i < names.length; i++) {
		var layer = doc.layers.item(names[i]);
		if (layer.isValid) return names[i];
	}
	return names[0]; // Nothing found, return first name
}