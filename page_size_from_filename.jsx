/*
	Page size from filename v1.4.1
	© May 2020, Paul Chiorean
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
var sizeArray = docName.match(/[_-]\d{2,}([\.,]\d{1,2})?\s?([cm]m)?\s?x\s?\d{2,}([\.,]\d{1,2})?\s?([cm]m)?(?!x)/ig);
	// 1. [_-] -- '_' or '-' separator
	// 2. \d{2,}([\.,]\d{1,2})? -- 2 digits or more followed by optional 1 or 2 decimals
	// 3. \s?([cm]m)? -- optional space followed by optional mm/cm
	// 4. \s?x\s? -- 'x' separator between optional spaces
	// 5. identical to 2.
	// 6. identical to 3.
	// 7. (?!x) -- negative lookhead 'x' separator (to avoid _000x00x00)

if (sizeArray != null) { // At least one pair of dimensions
	// Sanitize dimensions array
	for (i = 0; i < sizeArray.length; i++) {
		sizeArray[i] = sizeArray[i].replace(/[_-]/g, ""); // Clean up underscores
		sizeArray[i] = sizeArray[i].replace(/\s/g, ""); // Clean up whitespace
		sizeArray[i] = sizeArray[i].replace(/[cm]m/g, ""); // Clean up mm/cm
		sizeArray[i] = sizeArray[i].replace(/,/g, "."); // Replace commas
	}

	// Check number of pairs and set page size and, if defined, page margins
	var page, pageSize, marginSize, pageMargins;
	var dimA = sizeArray[0].split("x"); // First pair
	pageSize = {
		width: Number(dimA[0]),
		height: Number(dimA[1])
	}
	if (sizeArray.length == 2) { // If 2 pairs (page size & page margins), page size must be larger
		var dimB = sizeArray[1].split("x");
		pageSize = { // Choose the largest
			width: Math.max(Number(dimA[0]), Number(dimB[0])),
			height: Math.max(Number(dimA[1]), Number(dimB[1]))
		}
		marginSize = { // Choose the smallest
			width: Math.min(Number(dimA[0]), Number(dimB[0])),
			height: Math.min(Number(dimA[1]), Number(dimB[1]))
		}
		pageMargins = {
			top: (pageSize.height - marginSize.height) / 2,
			left: (pageSize.width - marginSize.width) / 2,
			bottom: (pageSize.height - marginSize.height) / 2,
			right: (pageSize.width - marginSize.width) / 2
		}
	}

	// Resize pages
	for (i = 0; i < doc.pages.length; i++) {
		page = doc.pages[i];
		page.marginPreferences.properties = { top: 0, left: 0, bottom: 0, right: 0 }; // Set margins to zero
		page.layoutRule = LayoutRuleOptions.OFF;
		page.resize(CoordinateSpaces.INNER_COORDINATES,
			AnchorPoint.CENTER_ANCHOR,
			ResizeMethods.REPLACING_CURRENT_DIMENSIONS_WITH,
			[pageSize.width / 0.352777777777778, pageSize.height / 0.352777777777778]);
		if (pageMargins != null) page.marginPreferences.properties = pageMargins; // Set margins
	}

	// Also set document size
	doc.documentPreferences.pageWidth = pageSize.width;
	doc.documentPreferences.pageHeight = pageSize.height;

	// Check for bleed: try to match '_00 [mm]' after '0 [mm]'
	var bleedSize = /\d\s?(?:[cm]m)?[_+](\d{1,2})\s?(?:[cm]m)/i.exec(docName);
		// \d\s?(?:[cm]m)? -- 1 digit followed by optional space and optional mm/cm
		// [_+] -- '_' or '+' separator
		// (\d{1,2}) -- 1 or 2 digits (capturing group #1)
		// \s?(?:[cm]m) -- optional space followed by mandatory mm/cm
	if (bleedSize != null) {
		doc.documentPreferences.documentBleedUniformSize = true;
		doc.documentPreferences.documentBleedTopOffset = bleedSize[1];
	}
}