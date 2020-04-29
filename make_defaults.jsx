﻿/*
	Make defaults v1.8.1
	© April 2020, Paul Chiorean
	This script sets default settings, replaces some fonts, creates swatches & layers, 
	merges similar layers, and sets page dimensions.
*/

var doc = app.activeDocument;

// Layer names
const bgLayerName = "bg";
const artLayerName = "artwork";
const txtLayerName = "type";
const hwLayerName = "HW";
const guidesLayerName = "guides";
const uvLayerName = "varnish";
const dieLayerName = "dielines";
const safeLayerName = "safe area";

// Swatch names
const cutSwatchName = "Cut";
const foldSwatchName = "Fold";
const uvSwatchName = "Varnish";
const safeSwatchName = "Safe area";

// Font list for replacement (from: Name\tStyle, to: Name\tStyle)
const fontList = [
	["Akzidenz Grotesk\tBold", "AkzidenzGrotesk\tBold"],
	["Arial\tBold", "Helvetica Neue\tBold"],
	["FoundryGridnik\tRegular", "Foundry Gridnik\tRegular"],
	["FoundryGridnik\tBold", "Foundry Gridnik\tBold"],
	["FoundryGridnik\tMedium", "Foundry Gridnik\tMedium"],
	["Gotham Light\tRegular", "Gotham\tLight"],
	["Gotham Book\tRegular", "Gotham\tBook"],
	["Gotham Medium\tRegular", "Gotham\tMedium"],
	["Gotham Bold\tRegular", "Gotham\tBold"],
	["Gotham Black\tRegular", "Gotham\tBlack"],
	["Helvetica Neue LT Std\t65 Medium", "Helvetica Neue\tMedium"],
	["Helvetica Neue LT Std\t75 Bold", "Helvetica Neue\tBold"],
	["Trade Gothic LT Std\tBold Condensed No. 20", "Trade Gothic for LS\tBold Condensed No. 20"],
	["Trade Gothic LT Std\tCondensed No. 18", "Trade Gothic for LS\tCondensed No. 18"]
];

// Set settings
doc.zeroPoint = [0, 0];
try { doc.cmykProfile = "ISO Coated v2 (ECI)" } catch (e) { doc.cmykProfile = "Coated FOGRA39 (ISO 12647-2:2004)" };
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
doc.pasteboardPreferences.previewBackgroundColor = UIColors.LIGHT_GRAY;
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

// Replace fonts
app.findTextPreferences = app.changeTextPreferences = NothingEnum.NOTHING;
for (var i = 0; i < fontList.length; i++) {
	var changed;
	app.findTextPreferences.appliedFont = fontList[i][0];
	app.changeTextPreferences.appliedFont = fontList[i][1];
	changed = doc.changeText();
	app.findTextPreferences = app.changeTextPreferences = NothingEnum.NOTHING;
}

// Add default swatches
try { doc.colors.add({ name: "C=60 M=40 Y=40 K=100", model: ColorModel.PROCESS, space: ColorSpace.CMYK, colorValue: [60, 40, 40, 100] }) } catch (e) {};
try { doc.colors.add({ name: cutSwatchName, model: ColorModel.SPOT, space: ColorSpace.CMYK, colorValue: [0, 100, 0, 0] }) } catch (e) {};
try { doc.colors.add({ name: foldSwatchName, model: ColorModel.SPOT, space: ColorSpace.CMYK, colorValue: [100, 0, 0, 0] }) } catch (e) {};
try { doc.colors.add({ name: uvSwatchName, model: ColorModel.SPOT, space: ColorSpace.CMYK, colorValue: [0, 10, 70, 0] }) } catch (e) {};
try { doc.colors.add({ name: safeSwatchName, model: ColorModel.PROCESS, space: ColorSpace.CMYK, colorValue: [0, 100, 0, 0] }) } catch (e) {};

// Make default layers (and merge with similar)
var bgLayer = doc.layers.item(bgLayerName);
var artLayer = doc.layers.item(artLayerName);
var txtLayer = doc.layers.item(txtLayerName);
var hwLayer = doc.layers.item(hwLayerName);
var guidesLayer = doc.layers.item(guidesLayerName);
var uvLayer = doc.layers.item(uvLayerName);
var dieLayer = doc.layers.item(dieLayerName);
var safeLayer = doc.layers.item(safeLayerName);
// Mark existing layers grey
for (i = 0; i < doc.layers.length; i++) {
	doc.layers.item(i).layerColor = [215, 215, 215];
}
// Artwork layer
doc.activeLayer = doc.layers.item(0); // Select first layer
for (i = 0; i < doc.layers.length; i++) {
	var docLayer = doc.layers.item(i);
	switch (docLayer.name) {
		case "Ebene 1":
		case "Calque 1":
		case "Artwork":
		case "AW":
		case "Layout":
		case "layout":
		case "Layer_lucru":
			try { doc.layers.add({ name: artLayerName }) } catch (e) {};
			artLayer.merge(docLayer); i--;
	}
}
if (artLayer.isValid) {
	artLayer.layerColor = UIColors.LIGHT_BLUE;
} else {
	doc.layers.add({ name: artLayerName, layerColor: UIColors.LIGHT_BLUE });
	// try { artLayer.move(LocationOptions.after, txtLayer) } catch (e) {};
	artLayer.visible = false;
}
// Type layer
doc.activeLayer = doc.layers.item(0);
for (i = 0; i < doc.layers.length; i++) {
	var docLayer = doc.layers.item(i);
	switch (docLayer.name) {
		case "Type":
		case "TEXT":
		case "TEXTES":
		case "Text":
		case "text":
		case "txt":
			try { doc.layers.add({ name: txtLayerName }) } catch (e) {};
			txtLayer.merge(docLayer); i--;
	}
}
if (txtLayer.isValid) {
	txtLayer.layerColor = UIColors.GREEN;
} else {
	doc.layers.add({ name: txtLayerName, layerColor: UIColors.GREEN });
	// txtLayer.move(LocationOptions.before, artLayer);
	txtLayer.visible = false;
}
// HW layer
doc.activeLayer = doc.layers.item(0);
for (i = 0; i < doc.layers.length; i++) {
	var docLayer = doc.layers.item(i);
	switch (docLayer.name) {
		case "WHW":
		case "WH":
		case "wh":
		case "hw":
			try { doc.layers.add({ name: hwLayerName }) } catch (e) {};
			hwLayer.merge(docLayer); i--;
	}
}
if (hwLayer.isValid) {
	hwLayer.layerColor = UIColors.LIGHT_GRAY;
} else {
	doc.layers.add({ name: hwLayerName, layerColor: UIColors.LIGHT_GRAY });
	hwLayer.visible = false;
}
hwLayer.move(LocationOptions.before, txtLayer);
// Safe area layer
doc.activeLayer = doc.layers.item(0);
for (i = 0; i < doc.layers.length; i++) {
	var docLayer = doc.layers.item(i);
	switch (docLayer.name) {
		case "Visible":
		case "visible":
		case "Vizibil":
		case "vizibil":
		case "Vis. area":
			try { doc.layers.add({ name: safeLayerName }) } catch (e) {};
			safeLayer.merge(docLayer); i--;
	}
}
if (safeLayer.isValid) {
	safeLayer.layerColor = UIColors.YELLOW;
} else {
	doc.layers.add({ name: safeLayerName, layerColor: UIColors.YELLOW });
	safeLayer.visible = false;
}
safeLayer.move(LocationOptions.AT_BEGINNING);
// Dielines layer
for (i = 0; i < doc.layers.length; i++) {
	var docLayer = doc.layers.item(i);
	switch (docLayer.name) {
		case "diecut":
		case "die cut":
		case "Die Cut":
		case "cut lines":
		case "Stanze":
			try { doc.layers.add({ name: dieLayerName }) } catch (e) {};
			dieLayer.merge(docLayer); i--;
	}
}
if (dieLayer.isValid) {
	dieLayer.layerColor = UIColors.RED;
} else {
	doc.layers.add({ name: dieLayerName, layerColor: UIColors.RED });
	dieLayer.visible = false;
}
dieLayer.move(LocationOptions.after, safeLayer);
// Varnish layer
for (i = 0; i < doc.layers.length; i++) {
	var docLayer = doc.layers.item(i);
	switch (docLayer.name) {
		case "UV":
		case "Varnish":
			try { doc.layers.add({ name: uvLayerName }) } catch (e) {};
			uvLayer.merge(docLayer); i--;
	}
}
if (uvLayer.isValid) {
	uvLayer.layerColor = UIColors.YELLOW;
} else {
	doc.layers.add({ name: uvLayerName, layerColor: UIColors.YELLOW });
	uvLayer.visible = false;
}
uvLayer.move(LocationOptions.after, dieLayer);
// Guides layer
for (i = 0; i < doc.layers.length; i++) {
	var docLayer = doc.layers.item(i);
	switch (docLayer.name) {
		case "Guides":
			try { doc.layers.add({ name: guidesLayerName }) } catch (e) {};
			guidesLayer.merge(docLayer); i--;
	}
}
if (guidesLayer.isValid) {
	guidesLayer.layerColor = UIColors.MAGENTA; guidesLayer.printable = false;
} else {
	doc.layers.add({ name: guidesLayerName, layerColor: UIColors.MAGENTA, printable: false });
	guidesLayer.visible = false;
}
guidesLayer.move(LocationOptions.after, uvLayer);
// Background layer
for (i = 0; i < doc.layers.length; i++) {
	var docLayer = doc.layers.item(i);
	switch (docLayer.name) {
		case "BACKGROUND":
		case "BG":
		case "HG":
			try { doc.layers.add({ name: bgLayerName }) } catch (e) {};
			bgLayer.merge(docLayer); i--;
	}
}
if (bgLayer.isValid) {
	bgLayer.layerColor = UIColors.RED;
} else {
	doc.layers.add({ name: bgLayerName, layerColor: UIColors.RED });
	bgLayer.visible = false;
}
bgLayer.move(LocationOptions.AT_END);

// Sets page dimensions from filename
try {
	app.doScript(File(app.activeScript.path + "/page_size_from_filename.jsx"), 
	ScriptLanguage.javascript, null, UndoModes.FAST_ENTIRE_SCRIPT, "Page dimensions")
} catch (e) {};