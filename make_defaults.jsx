/*
    Make defaults v1.4.4
    © March 2020, Paul Chiorean
    This script sets default settings, swatches & layers, and merges similar layers.
*/

var doc = app.activeDocument;

// Layer names
var bgLayerName = "bg";
var artLayerName = "artwork";
var txtLayerName = "type";
var hwLayerName = "HW";
var guidesLayerName = "guides";
var safeLayerName = "safe area";
var dieLayerName = "dielines";

// Swatch names
var cutSwatchName = "Cut";
var foldSwatchName = "Fold";
var safeSwatchName = "Safe area";
var uvSwatchName = "Varnish";

// Settings
doc.zeroPoint = [0, 0];
doc.cmykProfile = "ISO Coated v2 (ECI)"; // ?cmykProfileList
doc.rgbProfile = "sRGB IEC61966-2.1";
doc.guidePreferences.guidesShown = true;
doc.guidePreferences.guidesLocked = false;
doc.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.MILLIMETERS;
doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.MILLIMETERS;
doc.viewPreferences.showFrameEdges = true;
doc.viewPreferences.cursorKeyIncrement = "0.2mm";
doc.textPreferences.leadingKeyIncrement = "0.5pt";
doc.textPreferences.kerningKeyIncrement = 5;
doc.textPreferences.baselineShiftKeyIncrement = "0.1pt";
doc.pasteboardPreferences.pasteboardMargins = ["150mm", "25mm"];
doc.documentPreferences.intent = DocumentIntentOptions.PRINT_INTENT;
doc.transparencyPreferences.blendingSpace = BlendingSpace.CMYK;
app.transformPreferences.adjustStrokeWeightWhenScaling = true;
app.transformPreferences.adjustEffectsWhenScaling = true;
app.generalPreferences.ungroupRemembersLayers = true;
app.clipboardPreferences.pasteRemembersLayers = true;
app.activeWindow.transformReferencePoint = AnchorPoint.CENTER_ANCHOR;
doc.pageItemDefaults.fillColor = "None";
doc.pageItemDefaults.strokeColor = "None";
doc.selection = [];

// Sets page dimensions from filename
try {
    app.doScript(File(app.activeScript.path + "/size_from_filename.jsx"), ScriptLanguage.javascript, null, UndoModes.FAST_ENTIRE_SCRIPT, "Page dimensions");
} catch (e) {}

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
        name: cutSwatchName,
        model: ColorModel.SPOT,
        space: ColorSpace.CMYK,
        colorValue: [0, 100, 0, 0]
    })
} catch (e) {}
try {
    doc.colors.add({
        name: foldSwatchName,
        model: ColorModel.SPOT,
        space: ColorSpace.CMYK,
        colorValue: [100, 0, 0, 0]
    })
} catch (e) {}
try {
    doc.colors.add({
        name: safeSwatchName,
        model: ColorModel.PROCESS,
        space: ColorSpace.CMYK,
        colorValue: [0, 100, 0, 0]
    })
} catch (e) {}
try {
    doc.colors.add({
        name: uvwatchName,
        model: ColorModel.PROCESS,
        space: ColorSpace.CMYK,
        colorValue: [0, 10, 70, 0]
    })
} catch (e) {}

// Delete unused layers
// try {
//     app.menuActions.item("$ID/Delete Unused Layers").invoke();
// } catch (e) {}

// Make default layers (and merge with similar)
var bgLayer = doc.layers.item(bgLayerName);
var artLayer = doc.layers.item(artLayerName);
var txtLayer = doc.layers.item(txtLayerName);
var hwLayer = doc.layers.item(hwLayerName);
var guidesLayer = doc.layers.item(guidesLayerName);
var safeLayer = doc.layers.item(safeLayerName);
var dieLayer = doc.layers.item(dieLayerName);

doc.activeLayer = doc.layers.item(0);

// Artwork layer
if (artLayer.isValid) {
    artLayer.layerColor = UIColors.LIGHT_BLUE
} else {
    doc.layers.add({
        name: artLayerName,
        layerColor: UIColors.LIGHT_BLUE
    }) //.move(LocationOptions.AT_BEGINNING)
}
for (i = 0; i < doc.layers.length; i++) {
    var docLayer = doc.layers.item(i);
    switch (docLayer.name) {
        case "Artwork":
        case "AW":
        case "Layout":
        case "layout":
        case "Ebene 1":
        case "Layer_lucru":
            artLayer.merge(docLayer);
            i--;
            break
    }
}
if (txtLayer.isValid) {
    artLayer.move(LocationOptions.after, txtLayer)
}

// Type layer
if (txtLayer.isValid) {
    txtLayer.layerColor = UIColors.GREEN
} else {
    doc.layers.add({
        name: txtLayerName,
        layerColor: UIColors.GREEN
    }).move(LocationOptions.before, artLayer)
}
for (i = 0; i < doc.layers.length; i++) {
    var docLayer = doc.layers.item(i);
    switch (docLayer.name) {
        case "Type":
        case "TEXT":
        case "Text":
        case "text":
        case "txt":
            txtLayer.merge(docLayer);
            i--;
            break
    }
}

// HW layer
if (hwLayer.isValid) {
    hwLayer.layerColor = UIColors.LIGHT_GRAY
} else {
    doc.layers.add({
        name: hwLayerName,
        layerColor: UIColors.LIGHT_GRAY
    }).move(LocationOptions.before, txtLayer)
}
for (i = 0; i < doc.layers.length; i++) {
    var docLayer = doc.layers.item(i);
    switch (docLayer.name) {
        case "WHW":
        case "WH":
        case "wh":
        case "hw":
            hwLayer.merge(docLayer);
            i--;
            break
    }
}

// Dielines layer
if (dieLayer.isValid) {
    dieLayer.layerColor = UIColors.RED
} else {
    doc.layers.add({
        name: dieLayerName,
        layerColor: UIColors.RED
    })
}
dieLayer.move(LocationOptions.AT_BEGINNING);
for (i = 0; i < doc.layers.length; i++) {
    var docLayer = doc.layers.item(i);
    switch (docLayer.name) {
        case "diecut":
        case "cut lines":
            dieLayer.merge(docLayer);
            i--;
            break
    }
}

// Safe area layer
if (safeLayer.isValid) {
    safeLayer.layerColor = UIColors.YELLOW
} else {
    doc.layers.add({
        name: safeLayerName,
        layerColor: UIColors.YELLOW
    })
}
safeLayer.move(LocationOptions.after, dieLayer);
for (i = 0; i < doc.layers.length; i++) {
    var docLayer = doc.layers.item(i);
    switch (docLayer.name) {
        case "Visible":
        case "vizibil":
            safeLayer.merge(docLayer);
            i--;
            break
    }
}

// Guides layer
if (guidesLayer.isValid) {
    guidesLayer.layerColor = UIColors.MAGENTA;
    guidesLayer.printable = false
} else {
    doc.layers.add({
        name: guidesLayerName,
        layerColor: UIColors.MAGENTA,
        printable: false
    }).move(LocationOptions.after, safeLayer)
}
for (i = 0; i < doc.layers.length; i++) {
    var docLayer = doc.layers.item(i);
    switch (docLayer.name) {
        case "Guides":
            guidesLayer.merge(docLayer);
            i--;
            break
    }
}

// Background layer
if (bgLayer.isValid) {
    bgLayer.layerColor = UIColors.RED
} else {
    doc.layers.add({
        name: bgLayerName,
        layerColor: UIColors.RED
    }).move(LocationOptions.AT_END)
}
for (i = 0; i < doc.layers.length; i++) {
    var docLayer = doc.layers.item(i);
    switch (docLayer.name) {
        case "BG":
            bgLayer.merge(docLayer);
            i--;
            break
    }
}