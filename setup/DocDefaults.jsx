/*
	Default layers and more v3.0.0
	© November 2020, Paul Chiorean
	Changes some settings, adds default swatches/layers, merges similar layers, 
	cleans up fonts and sets page dimensions from the filename.
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;


// Set preferences
app.doScript(
function() {
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
UndoModes.ENTIRE_SCRIPT, "Set preferences");

// Add default swatches
app.doScript(File(app.activeScript.path + "/DefSwatches.jsx"), 
ScriptLanguage.javascript, undefined,
UndoModes.ENTIRE_SCRIPT, "Default swatches");

// Make default layers
app.doScript(File(app.activeScript.path + "/DefLayers.jsx"), 
ScriptLanguage.javascript, undefined,
UndoModes.ENTIRE_SCRIPT, "Default layers");

// Replace fonts
app.doScript(File(app.activeScript.path + "/ReplaceFonts.jsx"), 
ScriptLanguage.javascript, undefined,
UndoModes.ENTIRE_SCRIPT, "Replace fonts");

// Sets page dimensions from filename
app.doScript(File(app.activeScript.path + "/PageSizeFromFilename.jsx"), 
ScriptLanguage.javascript, undefined,
UndoModes.ENTIRE_SCRIPT, "Set page dimensions");
