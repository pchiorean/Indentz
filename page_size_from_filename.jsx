/*
	Page size from filename v1.4.4
	© June 2020, Paul Chiorean
	This script sets every page size and margins based on the filename.
	It looks for pairs of values like 000x000 (page size) or 000x000_000x000 (page size_page margins).
*/

var doc = app.activeDocument;
app.scriptPreferences.measurementUnit = MeasurementUnits.MILLIMETERS;
doc.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.MILLIMETERS;
doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.MILLIMETERS;
doc.adjustLayoutPreferences.enableAdjustLayout = false;
doc.adjustLayoutPreferences.enableAutoAdjustMargins = false;
app.generalPreferences.objectsMoveWithPage = false;

var docName = doc.name.substr(0, doc.name.lastIndexOf(".")); // Get name w/o extension
// Get '_00[.0] [mm] x 00[.0] [mm]' pairs with optional decimals, whitespace & mm/cm
var szArr = docName.match(/[_-]\d{2,}([\.,]\d{1,2})?\s?([cm]m)?\s?x\s?\d{2,}([\.,]\d{1,2})?\s?([cm]m)?(?!x)/ig);
	// 1. [_-] -- '_' or '-' separator
	// 2. \d{2,}([\.,]\d{1,2})? -- 2 digits or more followed by optional 1 or 2 decimals
	// 3. \s?([cm]m)? -- optional space followed by optional mm/cm
	// 4. \s?x\s? -- 'x' separator between optional spaces
	// 5. identical to 2.
	// 6. identical to 3.
	// 7. (?!x) -- negative lookhead 'x' separator (to avoid _000x00x00)

if (szArr != null) { // At least one pair of dimensions
	// Sanitize dimensions array
	for (i = 0; i < szArr.length; i++) {
		szArr[i] = szArr[i].replace(/[_-]/g, ""); // Clean up underscores
		szArr[i] = szArr[i].replace(/\s/g, ""); // Clean up whitespace
		szArr[i] = szArr[i].replace(/[cm]m/g, ""); // Clean up mm/cm
		szArr[i] = szArr[i].replace(/,/g, "."); // Replace commas
	}

	// Check number of pairs and set page size and, if defined, page margins
	var page, szPg, szMg, mgPg;
	var dimA = szArr[0].split("x"); // First pair
	szPg = { width: Number(dimA[0]), height: Number(dimA[1]) };
	if (szArr.length == 2) { // If 2 pairs (page size & page margins), page size must be larger
		var dimB = szArr[1].split("x");
		szPg = { // Choose the largest
			width: Math.max(Number(dimA[0]), Number(dimB[0])),
			height: Math.max(Number(dimA[1]), Number(dimB[1]))
		}
		szMg = { // Choose the smallest
			width: Math.min(Number(dimA[0]), Number(dimB[0])),
			height: Math.min(Number(dimA[1]), Number(dimB[1]))
		}
		mgPg = {
			top: (szPg.height - szMg.height) / 2,
			left: (szPg.width - szMg.width) / 2,
			bottom: (szPg.height - szMg.height) / 2,
			right: (szPg.width - szMg.width) / 2
		}
	}

	// Resize pages
	for (i = 0; i < doc.pages.length; i++) {
		page = doc.pages[i];
		// page.marginPreferences.properties = { top: 0, left: 0, bottom: 0, right: 0 }; // Set margins to zero
		page.layoutRule = LayoutRuleOptions.OFF;
		page.resize(CoordinateSpaces.INNER_COORDINATES,
			AnchorPoint.CENTER_ANCHOR,
			ResizeMethods.REPLACING_CURRENT_DIMENSIONS_WITH,
			[szPg.width / 0.352777777777778, szPg.height / 0.352777777777778]);
		if (mgPg != null) page.marginPreferences.properties = mgPg; // Set margins
	}

	// Also set document size
	doc.documentPreferences.pageWidth = szPg.width;
	doc.documentPreferences.pageHeight = szPg.height;

	// Check for bleed: try to match '_00 [mm]' after '0 [mm]'
	var bleed = /\d\s?(?:[cm]m)?[_+](\d{1,2})\s?(?:[cm]m)/i.exec(docName);
		// \d\s?(?:[cm]m)? -- 1 digit followed by optional space and optional mm/cm
		// [_+] -- '_' or '+' separator
		// (\d{1,2}) -- 1 or 2 digits (capturing group #1)
		// \s?(?:[cm]m) -- optional space followed by mandatory mm/cm
	if (bleed != null) {
		doc.documentPreferences.documentBleedUniformSize = true;
		doc.documentPreferences.documentBleedTopOffset = bleed[1];
	}
}