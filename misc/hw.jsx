if (app.documents.length == 0) exit();
var doc = app.activeDocument;

var hwLayerName = FindLayer(["HW", "hw", "WH", "wh", "WHW"]);
var hwLayer = doc.layers.item(hwLayerName);
try { hwLayer.locked = false } catch (_) {};
if (!hwLayer.isValid) {
	doc.layers.add({ name: hwLayerName, layerColor: UIColors.LIGHT_GRAY });
	hwLayer.move(LocationOptions.AT_BEGINNING);
}
for (var i = 0; i < doc.pages.length; i++) {
	var szPg = doc.pages[i].bounds[2];
	var szMg = szPg - (doc.pages[i].marginPreferences.top + doc.pages[i].marginPreferences.bottom);
	var j, guide;
	for (j = (guide = doc.pages[i].guides.everyItem().getElements()).length; j--; 
	(guide[j].label == "HW") && guide[j].remove());
	doc.pages[i].guides.add(undefined, {
		itemLayer: hwLayer, label: "HW", guideColor: UIColors.GREEN,
		orientation: HorizontalOrVertical.horizontal,
		location: szPg * 0.9
	});
	if (szMg == szPg) continue;
	doc.pages[i].guides.add(undefined, {
		itemLayer: hwLayer, label: "HW", guideColor: UIColors.GREEN,
		orientation: HorizontalOrVertical.horizontal,
		location: doc.pages[i].marginPreferences.top + szMg * 0.9
	});
}

function FindLayer(names) { // Find first layer from a list of names
	for (var i = 0; i < names.length; i++) {
		var layer = doc.layers.item(names[i]); if (layer.isValid) return names[i];
	}
	return names[0]; // Nothing found, return first name
}