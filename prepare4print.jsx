/*
    Prepare4Print v1.0
    © March 2020, Paul Chiorean
    This script hides 'safe area' and moves 'dielines' to separate page(s).
*/

var doc = app.activeDocument;
var safeLayer = doc.layers.item("safe area");
var dieLayer = doc.layers.item("dielines");

doc.layers.everyItem().locked = false; // Unlock all layers
try { safeLayer.visible = false } catch (e) {}; // Hide 'safe area' layer
try { dieLayer.visible = true } catch (e) {}; // Show 'dielines' layer

// Function to check if page has dielines
function dieLayerItems(i) {
    for (var j = 0; j < doc.pages[i].pageItems.length; j++) {
        if (doc.pages[i].pageItems.item(j).itemLayer.name == dieLayer.name) {
            return true;
        }
    }
}

if (dieLayer.isValid) {
    for (var i = 0; i < doc.pages.length; i++) {
        if (dieLayerItems(i)) {
            // Page has dielines; duplicate it
            doc.pages[i].duplicate(LocationOptions.AFTER, doc.pages[i]);
            // Delete dielines from this page
            for (var j = 0; j < doc.pages[i].pageItems.length; j++) {
                var pageItem = doc.pages[i].pageItems.item(j);
                if (pageItem.itemLayer.name == dieLayer.name) {
                    if (pageItem.locked) {
                        pageItem.locked = false;
                    }
                    pageItem.remove();
                    j--;
                }
            }
            // Delete non-dielines from next page
            for (var j = 0; j < doc.pages[i + 1].pageItems.length; j++) {
                var pageItem = doc.pages[i + 1].pageItems.item(j);
                if (pageItem.itemLayer.name !== dieLayer.name) {
                    if (pageItem.locked) {
                        pageItem.locked = false;
                    }
                    pageItem.remove();
                    j--;
                }
            }
            // If empty, delete page
            if (doc.pages[i].pageItems.length == 0) {
                doc.pages[i].remove();
            }
            // Skip next page
            i++;
        }
    }
}