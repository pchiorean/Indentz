/*
	Doc cleanup v1.8.5
	© July 2020, Paul Chiorean
	This script sets default settings, cleans up swatches/layers/pages/guides and resets scaling.
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;

// Step 0. Initialisation
(function() {
	app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
	app.scriptPreferences.enableRedraw = false;
	doc.zeroPoint = [0, 0];
	try { doc.cmykProfile = "ISO Coated v2 (ECI)" } catch (_) { doc.cmykProfile = "Coated FOGRA39 (ISO 12647-2:2004)" };
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
})();

// Step 1. Delete unused swatches
(function() {
	var swa = doc.unusedSwatches;
	for (var i = 0; i < swa.length; i++) if (swa[i].name != "") swa[i].remove();
})();

// Step 2. Turn off 'AutoUpdateURLStatus' from 'Hyperlinks' panel
(function() {
	var set_AUU = app.menuActions.itemByName("$ID/AutoUpdateURLStatus");
	var hyperLinksPanel = app.panels.itemByName("$ID/Hyperlinks");
	var flag_HLP = hyperLinksPanel.visible;
	if (!flag_HLP) hyperLinksPanel.visible = true;
	if (set_AUU.checked) set_AUU.invoke();
	hyperLinksPanel.visible = flag_HLP;
})();

// Step 3. Show 'guides' layer
(function() {
	try { doc.layers.item("guides").visible = true } catch (_) {
		try { doc.layers.item("Guides").visible = true } catch (_) {};
	}
})();

// Step 4. Delete unused layers
(function() {
	try { app.menuActions.item("$ID/Delete Unused Layers").invoke() } catch (_) {};
})();

// Step 5. Delete empty spreads
(function() {
	var s = doc.spreads;
	for (var i = 0; i < s.length; i++) {
		if (s[i].pageItems.length == 0 && s.length > 1) { s[i].remove(); i-- }
	}
})();

// Step 6. Unlock all items & redefine scaling to 100%
(function() {
	for (var i = 0; i < doc.spreads.length; i++) {
		var item, items = doc.spreads[i].allPageItems;
		while (item = items.shift()) {
			try { item.locked = false } catch (_) {};
			item.redefineScaling();
		}
	}
})();

// Step 7. Delete guides
(function() {
	var g = doc.guides.everyItem().getElements();
	for (var i = 0; i < g.length; i++)  if (g[i].label != "HW") g[i].remove();
})();