/*
	Prepare for print v1.6.0
	© September 2020, Paul Chiorean
	Hides "safe area" layer and moves white, varnish & dielines to separate spreads.
*/

if (app.documents.length == 0) exit();
app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
app.scriptPreferences.enableRedraw = false;
var doc = app.activeDocument;

var safeLayerName = ["safe area", "visible", "Visible", "vizibil", "Vizibil", "vis. area", "Vis. area"];
var dieLayerName = ["dielines", "diecut", "die cut", "Die Cut", "decoupe", "cut", "Cut", "cut lines", "stanze", "Stanze", "Stanz", "Stanzform"];
var whiteLayerName = ["white", "WHITE"];
var uvLayerName = ["varnish", "Varnish", "UV"];
var safeLayer = FindLayer(safeLayerName);
var dieLayer = FindLayer(dieLayerName);
var whiteLayer = FindLayer(whiteLayerName);
var uvLayer = FindLayer(uvLayerName);

doc.layers.everyItem().locked = false;
try { safeLayer.visible = false } catch (_) {};
try { dieLayer.visible = true } catch (_) {};
try { whiteLayer.visible = true } catch (_) {};
try { uvLayer.visible = true } catch (_) {};

if (dieLayer != null) Prepare4Print(dieLayer);
if (whiteLayer != null) Prepare4Print(whiteLayer);
if (uvLayer != null) Prepare4Print(uvLayer);


function Prepare4Print(layer) { // Move items on 'layer' to separate spread(s)
	var selSp, pageItem;
	for (var i = 0; i < doc.spreads.length; i++) {
		selSp = doc.spreads[i];
		if (!LayerHasItems(selSp, layer)) continue;
		// Spread has items on 'layer'; duplicate it
		selSp.duplicate(LocationOptions.AFTER, selSp);
		// Pass 1: delete items on 'layer' from this spread
		for (var j = 0; j < selSp.pageItems.length; j++) {
			pageItem = selSp.pageItems.item(j);
			// Check for locked items
			if (pageItem.itemLayer.name == layer.name) {
				if (pageItem.locked) pageItem.locked = false;
				pageItem.remove(); j--;
			}
		}
		// Pass 2: delete items not on 'layer' from next spread
		for (var j = 0; j < doc.spreads[i + 1].pageItems.length; j++) {
			pageItem = doc.spreads[i + 1].pageItems.item(j);
			if (pageItem.itemLayer.name !== layer.name) {
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