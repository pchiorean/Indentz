/*
	Hide safe area layer v1.1.2
	© June 2020, Paul Chiorean
	This script hides the "safe area" layer (or equivalents).
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;

var safeLayerName = [
	"safe area",
	"visible", "Visible",
	"vizibil", "Vizibil",
	"vis. area", "Vis. area"
];

for (var i = 0; i < safeLayerName.length; i++) {
	var safeLayer = doc.layers.item(safeLayerName[i]);
	if (!safeLayer.isValid) continue;
	try { doc.layers.item(safeLayer.name).visible = false } catch (_) {};
}