/*
	Page size from filename v1.6.2
	© September 2020, Paul Chiorean
	Sets every page size and margins according to the filename.
	It looks for patterns like 000x000 (page size) or 000x000_000x000 (page size_page margins).
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;

app.scriptPreferences.measurementUnit = MeasurementUnits.MILLIMETERS;
doc.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.MILLIMETERS;
doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.MILLIMETERS;
doc.adjustLayoutPreferences.enableAdjustLayout = false;
doc.adjustLayoutPreferences.enableAutoAdjustMargins = false;
app.generalPreferences.objectsMoveWithPage = false;

var docName = doc.name.substr(0, doc.name.lastIndexOf(".")); // Get name w/o extension
// Get '_000[.0] [mm] x 000[.0] [mm]' pairs
var szArr = docName.match(/[_-]\s?\d+([.,]\d+)?\s?([cm]m)?\s?x\s?\d+([.,]\d+)?\s?([cm]m)?(?!x)(?!\d)/ig);
// 1. [_-] -- '_' or '-' separator between pairs
// 2. \d+([.,]\d+)?([cm]m)? -- group 1: digits, optional decimals, optional cm/mm
// 3. x -- 'x' separator between groups
// 4. \d+([.,]\d+)?(cm|mm)? -- group 2
// 5. (?!x)(?!\d) -- discard if more groups (to avoid 000x00x00 et al)
if (szArr == null) exit();

// Sanitize dimensions array
for (var i = 0; i < szArr.length; i++) {
	szArr[i] = szArr[i].replace(/[_-]/g, ""); // Clean up underscores
	szArr[i] = szArr[i].replace(/\s/g, ""); // Clean up whitespace
	szArr[i] = szArr[i].replace(/[cm]m/g, ""); // Clean up cm/mm
	szArr[i] = szArr[i].replace(/,/g, "."); // Replace commas
}
// Check number of pairs and set page size and, if defined, page margins
var page, szPg, szMg, mgs;
var dimA = szArr[0].split("x"); // First pair
szPg = { width: Number(dimA[0]), height: Number(dimA[1]) };
if (szArr.length == 2) { // If 2 pairs (page size & page margins), page size is larger
	var dimB = szArr[1].split("x"); // Second pair
	szPg = { // Choose the largest
		width: Math.max(Number(dimA[0]), Number(dimB[0])),
		height: Math.max(Number(dimA[1]), Number(dimB[1]))
	}
	szMg = { // Choose the smallest
		width: Math.min(Number(dimA[0]), Number(dimB[0])),
		height: Math.min(Number(dimA[1]), Number(dimB[1]))
	}
	mgs = {
		top: (szPg.height - szMg.height) / 2,
		left: (szPg.width - szMg.width) / 2,
		bottom: (szPg.height - szMg.height) / 2,
		right: (szPg.width - szMg.width) / 2
	}
}
// Resize pages
for (var i = 0; i < doc.pages.length; i++) {
	page = doc.pages[i];
	if (page.parent.pages.length > 1) { var flag_S = true; continue }; // Skip multipage spreads
	// page.marginPreferences.properties = { top: 0, left: 0, bottom: 0, right: 0 }; // Set margins to zero
	page.layoutRule = LayoutRuleOptions.OFF;
	page.resize(CoordinateSpaces.INNER_COORDINATES,
		AnchorPoint.CENTER_ANCHOR,
		ResizeMethods.REPLACING_CURRENT_DIMENSIONS_WITH,
		[szPg.width / 0.352777777777778, szPg.height / 0.352777777777778]);
	if (mgs != null) SafeArea(); // Set margins and safe area
}
// Also set document size
if (!flag_S) {
	doc.documentPreferences.pageWidth = szPg.width;
	doc.documentPreferences.pageHeight = szPg.height;
}
// Check for bleed: try to match '_00 [mm]' after '0 [mm]'
var bleed = /\d\s?(?:[cm]m)?[_+](\d{1,2})\s?(?:[cm]m)/i.exec(docName);
// 1. \d(?:[cm]m)? -- 1 digit followed by optional mm/cm (non-capturing group)
// 2. [_+] -- '_' or '+' separator
// 3. (\d{1,2}) -- 1 or 2 digits (capturing group #1)
// 4. (?:[cm]m) -- mandatory mm/cm (non-capturing group)
if (bleed != null) {
	doc.documentPreferences.documentBleedUniformSize = true;
	doc.documentPreferences.documentBleedTopOffset = bleed[1];
}


function SafeArea() { // Draw a 'safe area' frame
	var saSwatchName = "Safe area";
	var saSwatch = doc.swatches.itemByName(saSwatchName);
	if (!saSwatch.isValid) {
		doc.colors.add({ name: saSwatchName, model: ColorModel.PROCESS, 
		space: ColorSpace.CMYK, colorValue: [0, 100, 0, 0] });
	}
	var saLayerName = FindLayer(["safe area", "visible", "Visible", "vizibil", "Vizibil", "vis. area", "Vis. area"]);
	var saLayerFrameP = {
		label: "safe area",
		contentType: ContentType.UNASSIGNED,
		fillColor: "None",
		strokeColor: saSwatchName,
		strokeWeight: "0.75pt",
		strokeAlignment: StrokeAlignment.INSIDE_ALIGNMENT,
		strokeType: "$ID/Canned Dashed 3x2",
		overprintStroke: false
	}
	doc.activeLayer = doc.layers.item(0);
	var saLayer = doc.layers.item(saLayerName);
	if (!saLayer.isValid) doc.layers.add({ name: saLayerName, layerColor: UIColors.YELLOW });
	// saLayer.move(LocationOptions.BEFORE, XXXX);

	var mgPg, mgBounds, saLayerFrame;
	mgPg = {
		top: (szPg.height - szMg.height) / 2,
		left: (szPg.width - szMg.width) / 2,
		bottom: (szPg.height - szMg.height) / 2,
		right: (szPg.width - szMg.width) / 2
	};
	if (mgPg.top + mgPg.left + mgPg.bottom + mgPg.right == 0) return;
	mgBounds = [mgPg.top, mgPg.left, szMg.height + mgPg.top, szMg.width + mgPg.left];
	page.marginPreferences.properties = mgPg;
	saLayerFrame = page.rectangles.add(saLayerFrameP);
	saLayerFrame.properties = { itemLayer: saLayerName, geometricBounds: mgBounds };
}

function FindLayer(names) { // Find first layer from a list of names
	for (var i = 0; i < names.length; i++) {
		var layer = doc.layers.item(names[i]);
		if (layer.isValid) return names[i];
	}
	return names[0]; // Nothing found, return first name
}
