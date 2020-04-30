/*
	Prepare for print v1.4.1
	© May 2020, Paul Chiorean
	This script hides 'safe area' layer and moves dielines to separate spread(s).
*/

var doc = app.activeDocument;

var safeLayerName = ["safe area", "visible", "vizibil", "vis. area"];
var dieLayerName = ["dielines", "diecut", "die cut", "cut lines", "stanze"];
var safeLayer = findLayer(safeLayerName);
var dieLayer = findLayer(dieLayerName);

doc.layers.everyItem().locked = false; // Unlock all layers
try { safeLayer.visible = false } catch (_) {}; // Hide 'safe area' layer
try { dieLayer.visible = true } catch (_) {}; // Show 'dielines' layer

if (dieLayer != null) {
	for (var i = 0; i < doc.spreads.length; i++) {
		if (dieLayerItems(i)) {
			var pageItem;
			// Spread has dielines; duplicate it
			doc.spreads[i].duplicate(LocationOptions.AFTER, doc.spreads[i]);
			// Pass 1: delete dielines from this spread
			for (var j = 0; j < doc.spreads[i].pageItems.length; j++) {
				pageItem = doc.spreads[i].pageItems.item(j);
				// Check for locked items
				if (pageItem.itemLayer.name == dieLayer.name) {
					if (pageItem.locked) pageItem.locked = false;
					pageItem.remove(); j--;
				}
			}
			// Pass 2: delete non-dielines from next spread
			for (var j = 0; j < doc.spreads[i + 1].pageItems.length; j++) {
				pageItem = doc.spreads[i + 1].pageItems.item(j);
				if (pageItem.itemLayer.name !== dieLayer.name) {
					if (pageItem.locked) pageItem.locked = false;
					pageItem.remove(); j--;
				}
			}
			// If empty, delete spread
			if (doc.spreads[i].pageItems.length == 0) doc.spreads[i].remove();
			i++; // Skip next spread
		}
	}
}
// END


// Function to check if spread has dielines
function dieLayerItems(spread) {
	for (var i = 0; i < doc.spreads[spread].pageItems.length; i++) {
		if (doc.spreads[spread].pageItems.item(i).itemLayer.name == dieLayer.name) return true;
	}
}

// Function to find first layer from a list of names
function findLayer(names) {
	var layer;
	for (var i = 0; i < names.length; i++) {
		layer = doc.layers.item(names[i]);
		if (layer.isValid) { return layer } else continue;
	}
}