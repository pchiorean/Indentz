/*
	Show safe area layer v1.1.4
	© August 2020, Paul Chiorean
	Shows the "safe area" layer (or equivalents).
*/

if (app.documents.length == 0) exit();

var safeLayerName = [
	"safe area",
	"visible", "Visible",
	"vizibil", "Vizibil",
	"vis. area", "Vis. area"
];

(function(doc) {
	for (var i = 0; i < safeLayerName.length; i++) {
		var safeLayer = doc.layers.item(safeLayerName[i]);
		if (!safeLayer.isValid) continue;
		try { doc.layers.item(safeLayer.name).visible = true } catch (_) {};
	}
})(app.activeDocument);
