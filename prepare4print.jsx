/*
    Prepare4Print v1.1.1
    © April 2020, Paul Chiorean
    This script hides 'safe area' and moves 'dielines' to separate page(s).
*/

var doc = app.activeDocument;
var safeLayer = doc.layers.item("safe area");
var dieLayer = doc.layers.item("dielines");

doc.layers.everyItem().locked = false; // unlock all layers
try { safeLayer.visible = false } catch (e) {}; // hide 'safe area' layer
try { dieLayer.visible = true } catch (e) {}; // show 'dielines' layer

// Function to check if page has dielines
function dieLayerItems(i) {
    for (var j = 0; j < doc.pages[i].pageItems.length; j++) {
        if (doc.pages[i].pageItems.item(j).itemLayer.name == dieLayer.name) { return true };
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
                    if (pageItem.locked) { pageItem.locked = false };
                    pageItem.remove(); j--;
                }
            }
            // Delete non-dielines from next page
            for (var j = 0; j < doc.pages[i + 1].pageItems.length; j++) {
                var pageItem = doc.pages[i + 1].pageItems.item(j);
                if (pageItem.itemLayer.name !== dieLayer.name) {
                    if (pageItem.locked) { pageItem.locked = false };
                    pageItem.remove(); j--;
                }
            }
            // If empty, delete page
            if (doc.pages[i].pageItems.length == 0) { doc.pages[i].remove() };
            i++ // skip next page
        }
    }
}