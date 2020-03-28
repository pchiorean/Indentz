/*
    Safe area v1.5.0
    © March 2020, Paul Chiorean
    This script sets page(s) size and margins based on the filename 
    and creates 'safe area' frames, on every page or spread, 
    if doesn't already exist and if margins are defined.
*/

var doc = app.activeDocument;
var scope = "page"; // "spread" or "page";

// Sets page dimensions from filename
try {
    app.doScript(File(app.activeScript.path + "/size_from_filename.jsx"), ScriptLanguage.javascript, null, UndoModes.FAST_ENTIRE_SCRIPT, "Page dimensions");
} catch (e) {}

var safeLayerName = "safe area";
var dieLayerName = "dielines";
var safeSwatchName = "Safe area";

// Create 'safe area' layer and move it below 'dielines' layer, or 1st
var safeLayer = doc.layers.item(safeLayerName);
var dieLayer = doc.layers.item(dieLayerName);
if (safeLayer.isValid) {
    safeLayer.layerColor = UIColors.YELLOW,
    safeLayer.visible = true
} else {
    doc.layers.add({
        name: safeLayerName,
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
        name: safeSwatchName,
        model: ColorModel.PROCESS,
        space: ColorSpace.CMYK,
        colorValue: [0, 100, 0, 0]
    })
} catch (e) {}

switch (scope) {
    case "page":
        for (var i = 0; i < doc.pages.length; i++) {
            if ((pageSafeArea(i) != false) && (safeLayerItems(doc.pages[i]) != true)) {
                doc.pages[i].rectangles.add({
                    itemLayer: safeLayerName,
                    label: "safe area",
                    geometricBounds: pageSafeArea(i),
                    contentType: ContentType.UNASSIGNED,
                    fillColor: "None",
                    strokeColor: safeSwatchName,
                    strokeWeight: "0.5pt",
                    strokeAlignment: StrokeAlignment.INSIDE_ALIGNMENT,
                    strokeType: "$ID/Canned Dashed 3x2",
                    overprintStroke: false
                })
            }
        }
        break;
    case "spread":
        for (var i = 0; i < doc.spreads.length; i++) {
            if ((spreadSafeArea(i) != false) && (safeLayerItems(doc.spreads[i]) != true)) {
                doc.spreads[i].pages.firstItem().rectangles.add({
                    itemLayer: safeLayerName,
                    label: "safe area",
                    geometricBounds: spreadSafeArea(i),
                    contentType: ContentType.UNASSIGNED,
                    fillColor: "None",
                    strokeColor: safeSwatchName,
                    strokeWeight: "0.5pt",
                    strokeAlignment: StrokeAlignment.INSIDE_ALIGNMENT,
                    strokeType: "$ID/Canned Dashed 3x2",
                    overprintStroke: false
                })
            }
        }
        break
}

// Function to calculate safe area coordinates from page margins
function pageSafeArea(page) {
    var page = doc.pages[page];
    var pageMargins = page.marginPreferences;
    // Reverse left and right margins if left-hand page
    if (page.side == PageSideOptions.LEFT_HAND) {
        pageMargins.left = page.marginPreferences.right;
        pageMargins.right = page.marginPreferences.left
    }
    if (pageMargins.top + pageMargins.left + pageMargins.bottom + pageMargins.right != 0) {
        var m_y1 = page.bounds[0] + pageMargins.top;
        var m_x1 = page.bounds[1] + pageMargins.left;
        var m_y2 = page.bounds[2] - pageMargins.bottom;
        var m_x2 = page.bounds[3] - pageMargins.right;
        return [m_y1, m_x1, m_y2, m_x2]
    } else {
        return false
    }
}

// Function to calculate safe area coordinates from spread margins
function spreadSafeArea(spread) {
    var spreadPages = doc.spreads[spread].pages; // spread pages
    var firstPage = spreadPages.firstItem(); // first page of spread
    var lastPage = spreadPages.lastItem(); // last page of spread
    if (spreadPages.length == 1) {
        // Spread is single page
        var spreadSize = firstPage.bounds;
        var spreadMargins = {
            top: firstPage.marginPreferences.top,
            left: firstPage.marginPreferences.left,
            bottom: firstPage.marginPreferences.bottom,
            right: firstPage.marginPreferences.right
        }
        // Reverse left and right margins if left-hand page
        if (firstPage.side == PageSideOptions.LEFT_HAND) {
            spreadMargins.left = firstPage.marginPreferences.right;
            spreadMargins.right = firstPage.marginPreferences.left
        }
    } else {
        // Spread is multiple pages
        var spreadSize = [firstPage.bounds[0], firstPage.bounds[1], lastPage.bounds[2], lastPage.bounds[3]]
        var spreadMargins = {
            top: firstPage.marginPreferences.top,
            left: firstPage.marginPreferences.left,
            bottom: lastPage.marginPreferences.bottom,
            right: lastPage.marginPreferences.right
        }
        // Reverse left and right margins if left-hand page
        if (firstPage.side == PageSideOptions.LEFT_HAND) {
            spreadMargins.left = firstPage.marginPreferences.right
        }
    }
    if (spreadMargins.top + spreadMargins.left + spreadMargins.bottom + spreadMargins.right != 0) {
        var m_y1 = spreadMargins.top;
        var m_x1 = spreadMargins.left;
        var m_y2 = spreadSize[2] - spreadMargins.bottom;
        var m_x2 = spreadSize[3] - spreadMargins.right;
        return [m_y1, m_x1, m_y2, m_x2]
    } else {
        return false
    }
}

// Function to check for items labeled 'safe area'
function safeLayerItems(scope) {
    switch (scope.constructor.name) {
        case "Page":
            var scope = doc.pages[scope.documentOffset];
            break;
        case "Spread":
            var scope = doc.spreads[scope.index];
            break
    }
    for (var i = 0; i < scope.pageItems.length; i++) {
        if (scope.pageItems.item(i).label == "safe area") {
            return true
        }
    }
}