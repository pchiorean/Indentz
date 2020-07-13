﻿/*
	Prepare for print v1.4.7
	© July 2020, Paul Chiorean
	Hides "safe area" layer and moves dielines to separate spreads.
*/

if (app.documents.length == 0) exit();
app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
app.scriptPreferences.enableRedraw = false;
var doc = app.activeDocument;

var safeLayerName = ["safe area", "visible", "Visible", "vizibil", "Vizibil", "vis. area", "Vis. area"];
var dieLayerName = ["dielines", "diecut", "die cut", "Die Cut", "cut", "Cut", "cut lines", "stanze", "Stanze", "decoupe"];
var safeLayer = FindLayer(safeLayerName);
var dieLayer = FindLayer(dieLayerName);

doc.layers.everyItem().locked = false; // Unlock all layers
try { safeLayer.visible = false } catch (_) {}; // Hide 'safe area' layer
try { dieLayer.visible = true } catch (_) {}; // Show 'dielines' layer

if (dieLayer != null) Prepare4Print();


function Prepare4Print() { // Move dielines to separate spread(s)
	var selSp, pageItem;
	for (var i = 0; i < doc.spreads.length; i++) {
		selSp = doc.spreads[i];
		if (!LayerHasItems(selSp, dieLayer)) continue;
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

function FindLayer(names) { // Find first layer from a list of names
	for (var i = 0; i < names.length; i++) {
		var layer = doc.layers.item(names[i]);
		if (layer.isValid) return layer;
	}
}

function LayerHasItems(spread, layer) { // Check if 'layer' has items on 'spread'
	for (var i = 0; i < spread.pageItems.length; i++) {
		if (spread.pageItems.item(i).itemLayer.name == layer.name) return true;
	}
}