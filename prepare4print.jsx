/*
    Prepare for print v1.3.0
    © April 2020, Paul Chiorean
    This script hides 'safe area' and moves 'dielines' to separate page(s).
*/

var doc = app.activeDocument;
var safeLayer = doc.layers.item("safe area" | "Visible" | "Vis. area" | "vizibil");
var dieLayer = doc.layers.item("dielines" | "diecut" | "Die Cut" | "cut lines" | "Stanze");

doc.layers.everyItem().locked = false; // unlock all layers
try { safeLayer.visible = false } catch (e) {}; // hide 'safe area' layer
try { dieLayer.visible = true } catch (e) {}; // show 'dielines' layer

// Function to check if page has dielines
function dieLayerItems(i) {
    for (var j = 0; j < doc.spreads[i].pageItems.length; j++) {
        if (doc.spreads[i].pageItems.item(j).itemLayer.name == dieLayer.name) { return true };
    }
}

if (dieLayer.isValid) {
    for (var i = 0; i < doc.spreads.length; i++) {
        if (dieLayerItems(i)) {
            // Page has dielines; duplicate it
            doc.spreads[i].duplicate(LocationOptions.AFTER, doc.spreads[i]);
            // Delete dielines from this spread
            for (var j = 0; j < doc.spreads[i].pageItems.length; j++) {
                var pageItem = doc.spreads[i].pageItems.item(j);
                if (pageItem.itemLayer.name == dieLayer.name) {
                    if (pageItem.locked) { pageItem.locked = false };
                    pageItem.remove(); j--;
                }
            }
            // Delete non-dielines from next page
            for (var j = 0; j < doc.spreads[i + 1].pageItems.length; j++) {
                var pageItem = doc.spreads[i + 1].pageItems.item(j);
                if (pageItem.itemLayer.name !== dieLayer.name) {
                    if (pageItem.locked) { pageItem.locked = false };
                    pageItem.remove(); j--;
                }
            }
            // If empty, delete spread
            if (doc.spreads[i].pageItems.length == 0) { doc.spreads[i].remove() };
            i++ // skip next spread
        }
    }
}