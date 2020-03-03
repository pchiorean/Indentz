/*
    Make defaults v1.3.1
    © March 2020, Paul Chiorean
    This script sets some defaults (settings, layers, swatches) and 
    creates 'safe area' frames based on the page margins, if defined.
*/

var doc = app.activeDocument

// Initialization
doc.zeroPoint = [0, 0];
doc.cmykProfile = "ISO Coated v2 (ECI)";
doc.rgbProfile = "sRGB IEC61966-2.1";
doc.guidePreferences.guidesShown = true;
doc.guidePreferences.guidesLocked = false;
doc.viewPreferences.showFrameEdges = true;
doc.viewPreferences.cursorKeyIncrement = "0.2mm";
doc.textPreferences.leadingKeyIncrement = "0.5pt";
doc.textPreferences.kerningKeyIncrement = 5;
doc.textPreferences.baselineShiftKeyIncrement = "0.1pt";
doc.pasteboardPreferences.pasteboardMargins = ["150mm", "25mm"];
doc.transparencyPreferences.blendingSpace = BlendingSpace.CMYK;
app.transformPreferences.adjustStrokeWeightWhenScaling = true;
app.transformPreferences.adjustEffectsWhenScaling = true;
app.generalPreferences.ungroupRemembersLayers = true;
app.clipboardPreferences.pasteRemembersLayers = true;
app.activeWindow.transformReferencePoint = AnchorPoint.CENTER_ANCHOR;
doc.pageItemDefaults.fillColor = "None";
doc.pageItemDefaults.strokeColor = "None";
doc.selection = [];
doc.selectionKeyObject = null;

// Add default swatches
try {
    doc.colors.add({
        name: "C=60 M=40 Y=40 K=100",
        model: ColorModel.PROCESS,
        space: ColorSpace.CMYK,
        colorValue: [60, 40, 40, 100]
    })
} catch (e) {}
try {
    doc.colors.add({
        name: "Cut",
        model: ColorModel.SPOT,
        space: ColorSpace.CMYK,
        colorValue: [0, 100, 0, 0]
    })
} catch (e) {}
try {
    doc.colors.add({
        name: "Fold",
        model: ColorModel.SPOT,
        space: ColorSpace.CMYK,
        colorValue: [100, 0, 0, 0]
    })
} catch (e) {}
try {
    doc.colors.add({
        name: "Safe area",
        model: ColorModel.SPOT,
        space: ColorSpace.CMYK,
        colorValue: [0, 100, 0, 0]
    })
} catch (e) {}

// Make default layers
var bgLayer = doc.layers.item("bg");
var artLayer = doc.layers.item("artwork");
var txtLayer = doc.layers.item("type");
var hwLayer = doc.layers.item("HW");
var guidesLayer = doc.layers.item("guides");
var safeLayer = doc.layers.item("safe area");
var dieLayer = doc.layers.item("dielines");

if (bgLayer.isValid) {
    bgLayer.layerColor = UIColors.RED
} else {
    doc.layers.add({
        name: "bg",
        layerColor: UIColors.RED
    })//.move(LocationOptions.AT_END)
}
if (artLayer.isValid) {
    artLayer.layerColor = UIColors.LIGHT_BLUE
} else {
    doc.layers.add({
        name: "artwork",
        layerColor: UIColors.LIGHT_BLUE
    }).move(LocationOptions.before, bgLayer)
}
if (txtLayer.isValid) {
    txtLayer.layerColor = UIColors.GREEN
} else {
    doc.layers.add({
        name: "type",
        layerColor: UIColors.GREEN
    }).move(LocationOptions.before, artLayer)
}
if (hwLayer.isValid) {
    hwLayer.layerColor = UIColors.LIGHT_GRAY
} else {
    doc.layers.add({
        name: "HW",
        layerColor: UIColors.LIGHT_GRAY
    }).move(LocationOptions.before, txtLayer)
}
if (dieLayer.isValid) {
    dieLayer.layerColor = UIColors.RED
} else {
    doc.layers.add({
        name: "dielines",
        layerColor: UIColors.RED
    })
}
dieLayer.move(LocationOptions.AT_BEGINNING);
if (safeLayer.isValid) {
    safeLayer.layerColor = UIColors.YELLOW
} else {
    doc.layers.add({
        name: "safe area",
        layerColor: UIColors.YELLOW
    })
}
safeLayer.move(LocationOptions.after, dieLayer);
if (guidesLayer.isValid) {
    guidesLayer.layerColor = UIColors.MAGENTA;
    guidesLayer.printable = false
} else {
    doc.layers.add({
        name: "guides",
        layerColor: UIColors.MAGENTA,
        printable: false
    }).move(LocationOptions.after, safeLayer)
}

// Add safe area rectangle(s)
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
            return true;
        }
    }
}

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
            overprintStroke: true
        });
    }
}

//doc.activeLayer = safeLayer;