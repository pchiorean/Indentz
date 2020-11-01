﻿/*
	Default layers and more v2.0.4
	© October 2020, Paul Chiorean
	Changes some settings, makes default swatches/layers, merges similar layers, 
	cleans up fonts and sets page dimensions from the filename.
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;

// Layer names
const saLayerName = "safe area";
const dieLayerName = "dielines";
const uvLayerName = "varnish";
const whiteLayerName = "white";
const guidesLayerName = "guides";
const infoLayerName = "info";
const hwLayerName = "HW";
const tcLayerName = "disclaimer";
const txtLayerName = "text and logos";
const prodLayerName = "products";
const artLayerName = "artwork";
const bgLayerName = "bg";
const tmpLayerName = ".template";
// Swatch names
const whiteSwatchName = "White";
const uvSwatchName = "Varnish";
const cutSwatchName = "Cut";
const foldSwatchName = "Fold";
const saSwatchName = "Safe area";

// Step 0. Initialisation
app.doScript(
function() {
	app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
	app.scriptPreferences.enableRedraw = false;
	doc.zeroPoint = [0, 0];
	try { doc.cmykProfile = "ISO Coated v2 (ECI)" } catch (_) {
		doc.cmykProfile = "Coated FOGRA39 (ISO 12647-2:2004)" };
	doc.rgbProfile = "sRGB IEC61966-2.1";
	doc.guidePreferences.guidesShown = true;
	doc.guidePreferences.guidesLocked = false;
	doc.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.MILLIMETERS;
	doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.MILLIMETERS;
	doc.viewPreferences.showFrameEdges = true;
	doc.viewPreferences.showRulers = true;
	doc.pasteboardPreferences.pasteboardMargins = ["150mm", "25mm"];
	doc.pasteboardPreferences.previewBackgroundColor = UIColors.LIGHT_GRAY;
	doc.viewPreferences.cursorKeyIncrement = "0.2mm";
	doc.textPreferences.leadingKeyIncrement = "0.5pt";
	doc.textPreferences.kerningKeyIncrement = 5;
	doc.textPreferences.baselineShiftKeyIncrement = "0.1pt";
	doc.textPreferences.typographersQuotes = true;
	doc.textPreferences.useParagraphLeading = true;
	doc.documentPreferences.intent = DocumentIntentOptions.PRINT_INTENT;
	doc.documentPreferences.allowPageShuffle = false;
	doc.documentPreferences.preserveLayoutWhenShuffling = true;
	doc.transparencyPreferences.blendingSpace = BlendingSpace.CMYK;
	app.transformPreferences.adjustStrokeWeightWhenScaling = true;
	app.transformPreferences.adjustEffectsWhenScaling = true;
	app.generalPreferences.includePreview = true;
	app.generalPreferences.preventSelectingLockedItems = true;
	app.generalPreferences.ungroupRemembersLayers = true;
	app.clipboardPreferences.pasteRemembersLayers = true;
	app.displayPerformancePreferences.persistLocalSettings = true;
	app.activeWindow.transformReferencePoint = AnchorPoint.CENTER_ANCHOR;
	app.activeWindow.screenMode = ScreenModeOptions.PREVIEW_TO_PAGE;
	app.activeWindow.screenMode = ScreenModeOptions.PREVIEW_OFF;
	app.preflightOptions.preflightOff = true;
	doc.pageItemDefaults.transparencySettings.blendingSettings.blendMode = BlendMode.NORMAL;
	doc.pageItemDefaults.properties = { fillColor: "None", strokeColor: "None" };
	doc.selection = [];
},
ScriptLanguage.javascript, undefined,
UndoModes.ENTIRE_SCRIPT, "Initialisation");

// Step 1. Add default swatches
app.doScript(
function() {
	try { doc.colors.add({ name: "C=60 M=40 Y=40 K=100", model: ColorModel.PROCESS,
		space: ColorSpace.CMYK, colorValue: [60, 40, 40, 100] }) } catch (_) {};
	try { doc.colors.add({ name: whiteSwatchName, model: ColorModel.SPOT,
		space: ColorSpace.CMYK, colorValue: [0, 10, 10, 0] }) } catch (_) {};
	try { doc.colors.add({ name: uvSwatchName, model: ColorModel.SPOT,
		space: ColorSpace.CMYK, colorValue: [0, 10, 70, 0] }) } catch (_) {};
	try { doc.colors.add({ name: cutSwatchName, model: ColorModel.SPOT,
		space: ColorSpace.CMYK, colorValue: [0, 100, 0, 0] }) } catch (_) {};
	try { doc.colors.add({ name: foldSwatchName, model: ColorModel.SPOT,
		space: ColorSpace.CMYK, colorValue: [100, 0, 0, 0] }) } catch (_) {};
	try { doc.colors.add({ name: saSwatchName, model: ColorModel.PROCESS,
		space: ColorSpace.CMYK, colorValue: [0, 100, 0, 0] }) } catch (_) {};
},
ScriptLanguage.javascript, undefined,
UndoModes.ENTIRE_SCRIPT, "Add default swatches");

// Step 2. Make default layers
app.doScript(
function() {
	var tmpLayer = doc.layers.item(tmpLayerName);
	var bgLayer = doc.layers.item(bgLayerName);
	var artLayer = doc.layers.item(artLayerName);
	var prodLayer = doc.layers.item(prodLayerName);
	var txtLayer = doc.layers.item(txtLayerName);
	var tcLayer = doc.layers.item(tcLayerName);
	var hwLayer = doc.layers.item(hwLayerName);
	var infoLayer = doc.layers.item(infoLayerName);
	var guidesLayer = doc.layers.item(guidesLayerName);
	var whiteLayer = doc.layers.item(whiteLayerName);
	var uvLayer = doc.layers.item(uvLayerName);
	var dieLayer = doc.layers.item(dieLayerName);
	var saLayer = doc.layers.item(saLayerName);
	// Unlock and mark existing layers light grey
	doc.layers.everyItem().locked = false;
	doc.layers.everyItem().layerColor = [215, 215, 215];
	// Artwork layer
	doc.activeLayer = doc.layers.item(0); // Select first layer
	for (var i = 0; i < doc.layers.length; i++) {
		var docLayer = doc.layers.item(i);
		switch (docLayer.name) {
			case "Artwork":
			case "aw":
			case "AW":
			case "Elemente":
			case "layout":
			case "Layout":
			case "layouts":
			case "Layouts":
				try { doc.layers.add({ name: artLayerName }) } catch (_) {};
				artLayer.merge(docLayer); i--;
		}
	}
	if (artLayer.isValid) { artLayer.layerColor = UIColors.LIGHT_BLUE;
	} else {
		doc.layers.add({ name: artLayerName, layerColor: UIColors.LIGHT_BLUE });
		// try { artLayer.move(LocationOptions.after, prodLayer) } catch (_) {};
		artLayer.visible = false;
	}
	// Products layer
	doc.activeLayer = doc.layers.item(0); // Select first layer
	for (var i = 0; i < doc.layers.length; i++) {
		var docLayer = doc.layers.item(i);
		switch (docLayer.name) {
			case "tins":
				try { doc.layers.add({ name: prodLayerName }) } catch (_) {};
				prodLayer.merge(docLayer); i--;
		}
	}
	if (prodLayer.isValid) { prodLayer.layerColor = UIColors.BLUE;
	} else {
		doc.layers.add({ name: prodLayerName, layerColor: UIColors.BLUE });
		// try { prodLayer.move(LocationOptions.after, artLayer) } catch (_) {};
		prodLayer.visible = false;
	}
	// Type layer
	doc.activeLayer = doc.layers.item(0);
	for (var i = 0; i < doc.layers.length; i++) {
		var docLayer = doc.layers.item(i);
		switch (docLayer.name) {
			case "copy":
			case "Copy":
			case "text":
			case "Text":
			case "TEXT":
			case "Textes":
			case "TEXTES":
			case "txt":
			case "TXT":
			case "type":
			case "Type":
				try { doc.layers.add({ name: txtLayerName }) } catch (_) {};
				txtLayer.merge(docLayer); i--;
		}
	}
	if (txtLayer.isValid) { txtLayer.layerColor = UIColors.GREEN;
	} else {
		doc.layers.add({ name: txtLayerName, layerColor: UIColors.GREEN });
		// txtLayer.move(LocationOptions.before, prodLayer);
		txtLayer.visible = false;
	}
	// Disclaimer layer
	doc.activeLayer = doc.layers.item(0);
	for (var i = 0; i < doc.layers.length; i++) {
		var docLayer = doc.layers.item(i);
		switch (docLayer.name) {
			case "Disclaimer":
				try { doc.layers.add({ name: tcLayerName }) } catch (_) {};
				tcLayer.merge(docLayer); i--;
		}
	}
	if (tcLayer.isValid) { tcLayer.layerColor = UIColors.GRAY;
	} else {
		doc.layers.add({ name: tcLayerName, layerColor: UIColors.GRAY });
		// tcLayer.move(LocationOptions.before, txtLayer);
		tcLayer.visible = false;
	}
	// HW layer
	doc.activeLayer = doc.layers.item(0);
	for (var i = 0; i < doc.layers.length; i++) {
		var docLayer = doc.layers.item(i);
		switch (docLayer.name) {
			case "Hw Logo":
			case "HW Logo":
			case "hw":
			case "Logo HW":
			case "wh":
			case "WH":
			case "WHW":
				try { doc.layers.add({ name: hwLayerName }) } catch (_) {};
				hwLayer.merge(docLayer); i--;
		}
	}
	if (hwLayer.isValid) { hwLayer.layerColor = UIColors.LIGHT_GRAY;
	} else {
		doc.layers.add({ name: hwLayerName, layerColor: UIColors.LIGHT_GRAY });
		hwLayer.visible = false;
	}
	hwLayer.move(LocationOptions.before, tcLayer);
	// Info layer
	doc.activeLayer = doc.layers.item(0);
	for (var i = 0; i < doc.layers.length; i++) {
		var docLayer = doc.layers.item(i);
		switch (docLayer.name) {
			case "info copy":
			case "ratio":
				try { doc.layers.add({ name: infoLayerName }) } catch (_) {};
				infoLayer.merge(docLayer); i--;
		}
	}
	if (infoLayer.isValid) { infoLayer.layerColor = UIColors.CYAN;
	} else {
		doc.layers.add({ name: infoLayerName, layerColor: UIColors.CYAN });
		infoLayer.visible = false;
	}
	infoLayer.move(LocationOptions.before, hwLayer);
	// Safe area layer
	doc.activeLayer = doc.layers.item(0);
	for (var i = 0; i < doc.layers.length; i++) {
		var docLayer = doc.layers.item(i);
		switch (docLayer.name) {
			case "rahmen":
			case "Rahmen":
			case "vis. area":
			case "Vis. area":
			case "visible area":
			case "Visible area":
			case "Visible Area":
			case "visible":
			case "Visible":
			case "vizibil":
			case "Vizibil":
				try { doc.layers.add({ name: saLayerName }) } catch (_) {};
				saLayer.merge(docLayer); i--;
		}
	}
	if (saLayer.isValid) { saLayer.layerColor = UIColors.YELLOW;
	} else {
		doc.layers.add({ name: saLayerName, layerColor: UIColors.YELLOW });
		saLayer.visible = false;
	}
	saLayer.move(LocationOptions.AT_BEGINNING);
	// Dielines layer
	for (var i = 0; i < doc.layers.length; i++) {
		var docLayer = doc.layers.item(i);
		switch (docLayer.name) {
			case "cut lines":
			case "Cut lines":
			case "cut":
			case "Cut":
			case "CUT":
			case "decoupe":
			case "Decoupe":
			case "die cut":
			case "Die Cut":
			case "Die":
			case "diecut":
			case "Diecut":
			case "stanz":
			case "Stanz":
			case "stanze":
			case "Stanze":
			case "stanzform":
			case "Stanzform":
				try { doc.layers.add({ name: dieLayerName }) } catch (_) {};
				dieLayer.merge(docLayer); i--;
		}
	}
	if (dieLayer.isValid) { dieLayer.layerColor = UIColors.RED;
	} else {
		doc.layers.add({ name: dieLayerName, layerColor: UIColors.RED });
		dieLayer.visible = false;
	}
	dieLayer.move(LocationOptions.after, saLayer);
	// Varnish layer
	for (var i = 0; i < doc.layers.length; i++) {
		var docLayer = doc.layers.item(i);
		switch (docLayer.name) {
			case "UV":
			case "Varnish":
				try { doc.layers.add({ name: uvLayerName }) } catch (_) {};
				uvLayer.merge(docLayer); i--;
		}
	}
	if (uvLayer.isValid) { uvLayer.layerColor = UIColors.YELLOW;
	} else {
		doc.layers.add({ name: uvLayerName, layerColor: UIColors.YELLOW });
		uvLayer.visible = false;
	}
	uvLayer.move(LocationOptions.after, dieLayer);
	// White layer
	for (var i = 0; i < doc.layers.length; i++) {
		var docLayer = doc.layers.item(i);
		switch (docLayer.name) {
			case "White":
			case "WHITE":
				try { doc.layers.add({ name: whiteLayerName }) } catch (_) {};
				whiteLayer.merge(docLayer); i--;
		}
	}
	if (whiteLayer.isValid) { whiteLayer.layerColor = UIColors.CUTE_TEAL;
	} else {
		doc.layers.add({ name: whiteLayerName, layerColor: UIColors.CUTE_TEAL });
		whiteLayer.visible = false;
	}
	whiteLayer.move(LocationOptions.after, uvLayer);
	// Guides layer
	for (var i = 0; i < doc.layers.length; i++) {
		var docLayer = doc.layers.item(i);
		switch (docLayer.name) {
			case "Guides":
				try { doc.layers.add({ name: guidesLayerName }) } catch (_) {};
				guidesLayer.merge(docLayer); i--;
		}
	}
	if (guidesLayer.isValid) { guidesLayer.layerColor = UIColors.MAGENTA; guidesLayer.printable = false;
	} else {
		doc.layers.add({ name: guidesLayerName, layerColor: UIColors.MAGENTA, printable: false });
		guidesLayer.visible = false;
	}
	guidesLayer.move(LocationOptions.after, whiteLayer);
	// Background layer
	for (var i = 0; i < doc.layers.length; i++) {
		var docLayer = doc.layers.item(i);
		switch (docLayer.name) {
			case "background":
			case "BACKGROUND":
			case "BG":
			case "HG":
			case "Hintergrund":
				try { doc.layers.add({ name: bgLayerName }) } catch (_) {};
				bgLayer.merge(docLayer); i--;
		}
	}
	if (bgLayer.isValid) { bgLayer.layerColor = UIColors.RED;
	} else {
		doc.layers.add({ name: bgLayerName, layerColor: UIColors.RED });
		bgLayer.visible = false;
	}
	bgLayer.move(LocationOptions.AT_END);
	// Template layer
	for (var i = 0; i < doc.layers.length; i++) {
		var docLayer = doc.layers.item(i);
		switch (docLayer.name) {
			case "Template":
				try { doc.layers.add({ name: tmpLayerName }) } catch (_) {};
				tmpLayer.merge(docLayer); i--;
		}
	}
	if (tmpLayer.isValid) { tmpLayer.layerColor = UIColors.BLACK;
	} else {
		doc.layers.add({ name: tmpLayerName, layerColor: UIColors.BLACK });
		tmpLayer.visible = false;
	}
	tmpLayer.move(LocationOptions.after, bgLayer);
},
ScriptLanguage.javascript, undefined,
UndoModes.ENTIRE_SCRIPT, "Make default layers");

// Step 3. Replace fonts
try {
	app.doScript(File(app.activeScript.path + "/ReplaceFonts.jsx"), 
	ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "Replace fonts");
} catch (_) {};

// Step 4. Sets page dimensions from filename
try {
	app.doScript(File(app.activeScript.path + "/PageSizeFromFilename.jsx"), 
	ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "Set page dimensions");
} catch (_) {};
