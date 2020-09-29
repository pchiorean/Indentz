/*
	Hide safe area layer v1.1.5
	© September 2020, Paul Chiorean
	Hides the "safe area" layer (or equivalents).
*/

if (app.documents.length == 0) exit();

var saLayerName = [
	"safe area",
	"visible", "Visible",
	"vizibil", "Vizibil",
	"vis. area", "Vis. area"
];

(function(doc) {
	for (var i = 0; i < saLayerName.length; i++) {
		var saLayer = doc.layers.item(saLayerName[i]);
		if (!saLayer.isValid) continue;
		try { doc.layers.item(saLayer.name).visible = false } catch (_) {};
	}
})(app.activeDocument);
