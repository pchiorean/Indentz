/*
	Prepare for print v1.4.2
	© May 2020, Paul Chiorean
	This script hides 'safe area' layer and moves dielines to separate spread(s).
*/

var doc = app.activeDocument;

var safeLayerName = ["safe area", "visible", "Visible", "vizibil", "Vizibil", "vis. area", "Vis. area"];
var dieLayerName = ["dielines", "diecut", "die cut", "Die Cut", "cut lines", "Stanze"];
var safeLayer = findLayer(safeLayerName);
var dieLayer = findLayer(dieLayerName);

doc.layers.everyItem().locked = false; // Unlock all layers
try { safeLayer.visible = false } catch (_) {}; // Hide 'safe area' layer
try { dieLayer.visible = true } catch (_) {}; // Show 'dielines' layer

if (dieLayer != null) {
	var selSp, pageItem;
	for (var i = 0; i < doc.spreads.length; i++) {
		selSp = doc.spreads[i];
		if (!dieLayerItems(selSp)) continue;
		// Spread has dielines; duplicate it
		selSp.duplicate(LocationOptions.AFTER, selSp);
		// Pass 1: delete dielines from this spread
		for (var j = 0; j < selSp.pageItems.length; j++) {
			pageItem = selSp.pageItems.item(j);
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
		if (selSp.pageItems.length == 0) selSp.remove(); // If empty, delete spread
		i++; // Skip next spread
	}
}


// Function to find first layer from a list of names
function findLayer(names) {
	for (var i = 0; i < names.length; i++) {
		var layer = doc.layers.item(names[i]);
		if (layer.isValid) return layer;
	}
}

// Function to check if spread has dielines
function dieLayerItems(spread) {
	for (var i = 0; i < spread.pageItems.length; i++) {
		if (spread.pageItems.item(i).itemLayer.name == dieLayer.name) return true;
	}
}