/*
    Merge similar layers v1.2
    © March 2020, Paul Chiorean
    This script will merge similar layers, wreaking havoc on your file.
*/

var doc = app.activeDocument;

var bgLayer = doc.layers.item("bg");
var artLayer = doc.layers.item("artwork");
var txtLayer = doc.layers.item("type");
var hwLayer = doc.layers.item("HW");
var guidesLayer = doc.layers.item("guides");
var safeLayer = doc.layers.item("safe area");
var dieLayer = doc.layers.item("dielines");

// Make default layers
if (bgLayer.isValid) {
    bgLayer.layerColor = UIColors.RED
} else {
    doc.layers.add({
        name: "bg",
        layerColor: UIColors.RED
    }).move(LocationOptions.AT_BEGINNING)
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

// Merge similar layers
var docLayer = doc.layers.item("BG");
if (docLayer.isValid) {
    bgLayer.merge(docLayer)
}

var docLayer = doc.layers.item("Artwork");
if (docLayer.isValid) {
    artLayer.merge(docLayer)
}
var docLayer = doc.layers.item("AW");
if (docLayer.isValid) {
    artLayer.merge(docLayer)
}
var docLayer = doc.layers.item("Layout");
if (docLayer.isValid) {
    artLayer.merge(docLayer)
}

var docLayer = doc.layers.item("Type");
if (docLayer.isValid) {
    txtLayer.merge(docLayer)
}
var docLayer = doc.layers.item("Text");
if (docLayer.isValid) {
    txtLayer.merge(docLayer)
}
var docLayer = doc.layers.item("text");
if (docLayer.isValid) {
    txtLayer.merge(docLayer)
}
var docLayer = doc.layers.item("txt");
if (docLayer.isValid) {
    txtLayer.merge(docLayer)
}

var docLayer = doc.layers.item("WHW");
if (docLayer.isValid) {
    hwLayer.merge(docLayer)
}

var docLayer = doc.layers.item("wh");
if (docLayer.isValid) {
    hwLayer.merge(docLayer)
}

var docLayer = doc.layers.item("Guides");
if (docLayer.isValid) {
    guidesLayer.merge(docLayer)
}

var docLayer = doc.layers.item("Visible");
if (docLayer.isValid) {
    safeLayer.merge(docLayer)
}

var docLayer = doc.layers.item("diecut");
if (docLayer.isValid) {
    dieLayer.merge(docLayer)
}
var docLayer = doc.layers.item("cut lines");
if (docLayer.isValid) {
    dieLayer.merge(docLayer)
}

// try {
//     app.menuActions.item("$ID/Delete Unused Layers").invoke();
// } catch (e) {}