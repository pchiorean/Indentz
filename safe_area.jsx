/*
    Safe area v1.2.1
    © March 2020, Paul Chiorean
    This script creates 'safe area' frames based on the page margins, if defined.
*/

var doc = app.activeDocument;
var safeLayer = doc.layers.item("safe area");
var dieLayer = doc.layers.item("dielines");

// Function to calculate safe area coordinates from page margin size
// ***TODO*** Check filenames for safe area size
function pageSafeArea(page) {
    var pageSize = doc.pages[page].bounds;
    var pageMargins = doc.pages[page].marginPreferences;
    if (pageMargins.top + pageMargins.left + pageMargins.bottom + pageMargins.right != 0) {
        var m_y1 = pageMargins.top;
        var m_x1 = pageMargins.left;
        var m_y2 = pageSize[2] - pageMargins.bottom;
        var m_x2 = pageSize[3] - pageMargins.right;
        return [m_y1, m_x1, m_y2, m_x2]
    } else {
        return false
    }
}

// Function to check for items labeled 'safe area'
function SafeAreaItems(i) {
    for (var j = 0; j < doc.pages[i].pageItems.length; j++) {
        if (doc.pages[i].pageItems.item(j).label == "safe area") {
            return true
        }
    }
}

// Create 'safe area' layer and move it below 'dielines' layer, or 1st
if (safeLayer.isValid) {
    safeLayer.layerColor = UIColors.YELLOW
} else {
    doc.layers.add({
        name: "safe area",
        layerColor: UIColors.YELLOW,
        visible: true,
        locked: false
    })
}
try {
    safeLayer.move(LocationOptions.after, dieLayer)
} catch (e) {
    safeLayer.move(LocationOptions.AT_BEGINNING)
}

// Create 'Safe area' color
try {
    doc.colors.add({
        name: "Safe area",
        model: ColorModel.PROCESS,
        space: ColorSpace.CMYK,
        colorValue: [0, 100, 0, 0]
    })
} catch (e) {}

// For every page, create 'safe area' frame if it doesn't exist and page margins are defined
for (var i = 0; i < doc.pages.length; i++) {
    if ((pageSafeArea(i) != false) && (SafeAreaItems(i) != true)) {
        doc.pages[i].rectangles.add({
            itemLayer: safeLayer.name,
            label: "safe area",
            geometricBounds: pageSafeArea(i),
            contentType: ContentType.UNASSIGNED,
            fillColor: "None",
            strokeColor: "Safe area",
            strokeWeight: "0.5pt",
            strokeAlignment: StrokeAlignment.INSIDE_ALIGNMENT,
            strokeType: "$ID/Canned Dashed 3x2",
            overprintStroke: false
        })
    }
}