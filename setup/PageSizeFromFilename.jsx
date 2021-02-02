/*
	Page size from filename v2.0.0
	© February 2021, Paul Chiorean
	Sets every page size and margins according to the filename.
	It looks for patterns like 000x000 (page size) or 000x000_000x000 (page size_page margins).
*/

if (!(doc = app.activeDocument)) exit();
var saLayerName = FindLayer(["safe area", "visible", "Visible", "vizibil", "Vizibil",
	"vis. area", "Vis. area"]);
var dieLayerName = FindLayer(["dielines", "diecut", "die cut", "Die Cut", "cut", "Cut",
	"cut lines", "stanze", "Stanze", "Stanz", "decoupe"]);
var saSwatchName = "Safe area";

app.doScript(main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "Set page dimensions");


function main() {
	app.scriptPreferences.measurementUnit = MeasurementUnits.MILLIMETERS;
	doc.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.MILLIMETERS;
	doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.MILLIMETERS;
	doc.adjustLayoutPreferences.enableAdjustLayout = false;
	doc.adjustLayoutPreferences.enableAutoAdjustMargins = false;
	app.generalPreferences.objectsMoveWithPage = false;
	var szPg, szMg, margins, flg_IsSpread = false;

	// Look for '_000[.0] [mm] x 000[.0] [mm]' pairs. If none are found, try to match common 'A' sizes
	var docName = doc.name.substr(0, doc.name.lastIndexOf("."));
	var pairsRE = /[_-]\s*\d+([.,]\d+)?\s*([cm]m)?\s*x\s*\d+([.,]\d+)?\s*([cm]m)?\s*(?!x)\s*(?!\d)/ig;
	var szArr = docName.match(pairsRE);
	// 1. [_-] -- '_' or '-' separator between pairs
	// 2. \d+([.,]\d+)?([cm]m)? -- group 1: digits, optional decimals, optional cm/mm
	// 3. x -- 'x' separator between groups
	// 4. \d+([.,]\d+)?(cm|mm)? -- group 2
	// 5. (?!x)(?!\d) -- discard if more groups (to avoid 000x00x00 et al)
	// Bleed: look for '_00 [mm]' after '0 [mm]'
	var bleed = /\d\s*(?:[cm]m)?[_+](\d{1,2})\s*(?:[cm]m)/i.exec(docName);
	// 1. \d(?:[cm]m)? -- 1 digit followed by optional mm/cm (non-capturing group)
	// 2. [_+] -- '_' or '+' separator
	// 3. (\d{1,2}) -- 1 or 2 digits (capturing group #1)
	// 4. (?:[cm]m) -- mandatory mm/cm (non-capturing group)
	if (szArr == null) {
		var ISO216SubsetRE = /A[1-7]\b/;
		var szArr = docName.match(ISO216SubsetRE);
		if (szArr == null) exit();
		switch (szArr[0]) {
			case "A1": szPg = { width: 594, height: 841 }; break;
			case "A2": szPg = { width: 420, height: 594 }; break;
			case "A3": szPg = { width: 297, height: 420 }; break;
			case "A4": szPg = { width: 210, height: 297 }; break;
			case "A5": szPg = { width: 148, height: 210 }; break;
			case "A6": szPg = { width: 105, height: 148 }; break;
			case "A7": szPg = { width:  74, height: 105 }; break;
		}
	} else {
		// Sanitize dimensions array
		for (var i = 0; i < szArr.length; i++) {
			szArr[i] = szArr[i].replace(/[_-]/g, ""); // Clean up underscores
			szArr[i] = szArr[i].replace(/\s/g, ""); // Clean up whitespace
			szArr[i] = szArr[i].replace(/[cm]m/g, ""); // Clean up cm/mm
			szArr[i] = szArr[i].replace(/,/g, "."); // Replace commas
		}
		// Check number of pairs and set page size and, if defined, page margins
		var dimA = szArr[0].split(/x/ig);
		dimA[0] = Number(dimA[0]), dimA[1] = Number(dimA[1]);
		szPg = { width: dimA[0], height: dimA[1] }; // First pair
		// If 2 pairs (page size & page margins), page size is the largest
		if (szArr.length == 2) { // Second pair
			var dimB = szArr[1].split(/x/ig);
			dimB[0] = Number(dimB[0]), dimB[1] = Number(dimB[1]);
			if (szPg.width >= dimB[0] && szPg.height >= dimB[1]) {
				szMg = { width: dimB[0], height: dimB[1] }
			} else if (szPg.width <= dimB[0] && szPg.height <= dimB[1]) {
				szMg = szPg;
				szPg = { width: dimB[0], height: dimB[1] }
			} else {
				alert("Dimensions are wrong."); exit();
			}
			margins = {
				top: (szPg.height - szMg.height) / 2,
				left: (szPg.width - szMg.width) / 2,
				bottom: (szPg.height - szMg.height) / 2,
				right: (szPg.width - szMg.width) / 2 }
		}
	}
	// Resize pages
	for (var i = 0; i < doc.pages.length; i++) {
		var page = doc.pages[i];
		if (page.parent.pages.length > 1) { flg_IsSpread = true; continue } // Skip multipage spreads
		page.layoutRule = LayoutRuleOptions.OFF;
		try {
			page.resize(CoordinateSpaces.INNER_COORDINATES,
				AnchorPoint.CENTER_ANCHOR,
				ResizeMethods.REPLACING_CURRENT_DIMENSIONS_WITH,
				[UnitValue(szPg.width, "mm").as('pt'), UnitValue(szPg.height, "mm").as('pt')]);
		} catch (_) {
			page.marginPreferences.properties = { top: 0, left: 0, bottom: 0, right: 0 }
			page.resize(CoordinateSpaces.INNER_COORDINATES,
				AnchorPoint.CENTER_ANCHOR,
				ResizeMethods.REPLACING_CURRENT_DIMENSIONS_WITH,
				[UnitValue(szPg.width, "mm").as('pt'), UnitValue(szPg.height, "mm").as('pt')]);
		}
		if (!!margins) {
			page.marginPreferences.properties = margins;
			page.marginPreferences.columnCount = 1;
			page.marginPreferences.columnGutter = 0;
			MarkSafeArea(page);
		}
	}
	// Set document size and bleed
	if (!flg_IsSpread) {
		doc.documentPreferences.pageWidth = szPg.width;
		doc.documentPreferences.pageHeight = szPg.height }
	if (!!bleed) {
		doc.documentPreferences.documentBleedUniformSize = true;
		doc.documentPreferences.documentBleedTopOffset = bleed[1] }
	app.activeWindow.zoom(ZoomOptions.FIT_SPREAD); app.activeWindow.zoomPercentage *= 0.9;
}


function MarkSafeArea(page) { // Draw a 'safe area' frame
	if (!doc.colors.itemByName(saSwatchName).isValid)
		doc.colors.add({
			name: saSwatchName,
			model: ColorModel.PROCESS,
			space: ColorSpace.CMYK,
			colorValue: [0, 100, 0, 0] });
	var saLayer = doc.layers.item(saLayerName);
	var dieLayer = doc.layers.item(dieLayerName);
	if (saLayer.isValid) {
		saLayer.properties = {
			layerColor: UIColors.YELLOW,
			visible: true, locked: false }
		if (dieLayer.isValid) saLayer.move(LocationOptions.before, dieLayer);
	} else {
		saLayer = doc.layers.add({ name: saLayerName,
			layerColor: UIColors.YELLOW,
			visible: true, locked: false });
		if (dieLayer.isValid) {
			saLayer.move(LocationOptions.before, dieLayer);
		} else saLayer.move(LocationOptions.AT_BEGINNING);
	}

	var frame, frames = page.rectangles.everyItem().getElements();
	while (frame = frames.shift())
		if (frame.label == "safe area" &&
			frame.itemLayer == saLayer &&
			frame.locked == false) frame.remove();
	var margins = page.marginPreferences;
	var frame = page.rectangles.add({
		name: "<safe area>", label: "safe area",
		contentType: ContentType.UNASSIGNED,
		fillColor: "None", strokeColor: saSwatchName,
		strokeWeight: "0.75pt",
		strokeAlignment: StrokeAlignment.INSIDE_ALIGNMENT,
		strokeType: "$ID/Canned Dashed 3x2",
		overprintStroke: false,
		itemLayer: saLayerName,
		geometricBounds: [
			page.bounds[0] + margins.top,
			page.side == PageSideOptions.LEFT_HAND ?
				page.bounds[1] + margins.right : page.bounds[1] + margins.left,
			page.bounds[2] - margins.bottom,
			page.side == PageSideOptions.LEFT_HAND ?
				page.bounds[3] - margins.left : page.bounds[3] - margins.right
		]
	});
	saLayer.locked = true;
}

function FindLayer(names) { // Find first valid layer from a list of names
	for (var i = 0; i < names.length; i++) {
		var layer = doc.layers.item(names[i]);
		if (layer.isValid) return names[i];
	}
	return names[0]; // Nothing found, return first name
}
