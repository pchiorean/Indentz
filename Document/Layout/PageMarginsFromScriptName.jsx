/*
	Page margins from script name 24.4.29
	(c) 2022-2024 Paul Chiorean <jpeg@basement.ro>

	By default it sets the page margins to 5% of the visible/page area for
	all document pages. Renaming the script (e.g., Margins<XX>HW<YY>.jsx) you
	can set a value `XX` for the margins and (optionally) a `YY` value for an
	HW area at the bottom. The default values are 5 for margins and 10 for HW.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

// @includepath '.;./lib;../lib;../../lib';
// @include 'addGuide.jsxinc';
// @include 'getBounds.jsxinc';

if (!(doc = app.activeDocument)) exit();

app.doScript(grid, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, 'Set margins');

function grid() {
	var oldActiveLayer, guidesLayer, page, tgBounds, tgSize, MG, RE;
	var guidesLayerName = '.guides';
	var MG_PCT = 5;
	var HW_PCT = 10;

	app.scriptPreferences.measurementUnit = MeasurementUnits.MILLIMETERS;
	doc.guidePreferences.guidesLocked = false;
	doc.guidePreferences.guidesShown = true;

	// Deduce MG and HW from filename
	RE = File($.fileName).name.match(/\d+/g); // Get all numbers
	if (RE) { // We have at least 1 match
		if (RE.length === 1) { // If 1 number, check if it should be MG or HW
			if (/hw\d+/i.test(File($.fileName).name)) { HW_PCT = Number(RE[0]); } // HW is explicit => HW
			else if (/hw(?!\d+)/i.test(File($.fileName).name)) { MG_PCT = Number(RE[0]); } // HW is implicit => MG
			else { MG_PCT = Number(RE[0]); HW_PCT = 0; } // No HW => MG / zero HW
		} else { MG_PCT = Number(RE[0]); HW_PCT = Number(RE[1]); } // First 2 numbers => MG / HW
	} else if (!/hw/i.test(File($.fileName).name)) { HW_PCT = 0; } // No match => zero HW

	// Create guides layer
	oldActiveLayer = doc.activeLayer;
	guidesLayer = doc.layers.item(guidesLayerName);
	if (guidesLayer.isValid) {
		guidesLayer.properties = { visible: true, locked: false };
	} else {
		guidesLayer = doc.layers.add({
			name: guidesLayerName,
			layerColor: UIColors.MAGENTA,
			visible: true,
			printable: false,
			locked: false
		}).move(LocationOptions.AT_BEGINNING);
	}
	doc.activeLayer = oldActiveLayer;

	doc.guides.everyItem().remove();

	for (var i = 0; i < doc.pages.length; i++) {
		page = doc.pages[i];
		tgBounds = getBounds(page).page.visible;
		tgSize = { width: tgBounds[3] - tgBounds[1], height: tgBounds[2] - tgBounds[0] };
		MG = Math.min(tgSize.height, tgSize.width) * MG_PCT / 100;

		// Set margins
		page.marginPreferences.properties = {
			top:    (tgBounds[0] - page.bounds[0]) + MG,
			left:   (tgBounds[1] - page.bounds[1]) + MG,
			bottom: (page.bounds[2] - tgBounds[2]) + tgSize.height * HW_PCT / 100 + MG,
			right:  (page.bounds[3] - tgBounds[3]) + MG,
			columnCount:  1,
			columnGutter: 0
		};

		// Common guides
		addGuide(page, guidesLayer, 'h', tgBounds[0] + tgSize.height * (1 - HW_PCT / 100) / 2, 'middle', 'x');
		addGuide(page, guidesLayer, 'v', tgBounds[1] + tgSize.width / 2, 'middle', 'x');
		if (HW_PCT > 0) addGuide(page, guidesLayer, 'h', tgBounds[0] + tgSize.height * (1 - HW_PCT / 100), 'hw', 's');
	}
}
