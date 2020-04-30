var doc = app.activeDocument;

var safeLayerName = ["safe area", "visible", "vizibil", "vis. area"];
var safeLayer = findLayer(safeLayerName);

// Show the layer "safe area"
try { doc.layers.item(safeLayer.name).visible = true } catch (_) {}

// Function to find first layer from a list of names
function findLayer(names) {
	var layer;
	for (var i = 0; i < names.length; i++) {
		layer = doc.layers.item(names[i]);
		if (layer.isValid) { return layer } else continue;
	}
}