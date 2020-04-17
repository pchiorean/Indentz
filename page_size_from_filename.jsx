/*
    Page size from filename v1.3.2
    © April 2020, Paul Chiorean
    This script sets every page size and margins based on the filename.
    It looks for pairs of values like 000x000 (page size) or 000x000_000x000 (page size_safe area).
*/

var doc = app.activeDocument;
app.scriptPreferences.measurementUnit = MeasurementUnits.MILLIMETERS;
doc.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.MILLIMETERS;
doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.MILLIMETERS;
doc.adjustLayoutPreferences.enableAdjustLayout = false;
doc.adjustLayoutPreferences.enableAutoAdjustMargins = false;
app.generalPreferences.objectsMoveWithPage = false;

var docName = doc.name.substr(0, doc.name.lastIndexOf(".")); // get name w/o extension
// Get '_00[.0] [mm] x 00[.0] [mm]' pairs with optional decimals, whitespace & mm/cm
var sizeArray = docName.match(/[_-]\d{2,}([\.,]\d{1,2})?\s?([cm]m)?\s?x\s?\d{2,}([\.,]\d{1,2})?\s?([cm]m)?(?!x)/ig);
    // 1. [_-] -- '_' or '-' separator
    // 2. \d{2,}([\.,]\d{1,2})? -- 2 digits or more followed by optional 1 or 2 decimals
    // 3. \s?([cm]m)? -- optional space followed by optional 'cm' or 'mm'
    // 4. \s?x\s? -- 'x' separator between optional spaces
    // 5. identical to 2.
    // 6. identical to 3.
    // 7. (?!x) -- negative lookhead 'x' separator (to avoid _000x00x00)

if (sizeArray != null) { // at least one pair of dimensions
    for (i = 0; i < sizeArray.length; i++) {
        sizeArray[i] = sizeArray[i].replace(/[_-]/g, ""); // clean up underscores
        sizeArray[i] = sizeArray[i].replace(/\s/g, ""); // clean up whitespace
        sizeArray[i] = sizeArray[i].replace(/[cm]m/g, ""); // clean up mm/cm
        sizeArray[i] = sizeArray[i].replace(/,/g, "."); // replace commas
    }
    switch (sizeArray.length) {
        case 1: // one pair: page size
            var p = 0;
            break;
        case 2: // 2 pairs: page size & safe area; page size is larger
            var dimA = sizeArray[0].split("x");
            var dimB = sizeArray[1].split("x");
            if ((dimA[0] >= dimB[0]) && (dimA[1] >= dimB[1])) {
                var p = 0; var m = 1;
            } else {
                var p = 1; var m = 0;
            }
    }
    resizePages(p, m);
}

// Check for bleed
// Get '_00 [mm]' after '0 [mm]'
var bleedArray = /\d\s?(?:[cm]m)?[_+](\d{1,2})\s?(?:[cm]m)/i.exec(docName);
    // \d\s?(?:[cm]m)? -- 1 digit followed by optional space and optional 'cm' or 'mm'
    // [_+] -- '_' or '+' separator
    // (\d{1,2}) -- 1 or 2 digits (capturing group #1)
    // \s?(?:[cm]m) -- optional space followed by mandatory 'cm' or 'mm'
if (bleedArray != null) {
    doc.documentPreferences.documentBleedUniformSize = true;
    doc.documentPreferences.documentBleedTopOffset = bleedArray[1];
}
// END


function resizePages(p, m) {
    var pageSize = sizeArray[p].split("x");
    pageSize = {
        width: Number(pageSize[0]),
        height: Number(pageSize[1])
    }
    var pageSizePT = { // page size in points
        width: pageSize.width / 0.352777777777778,
        height: pageSize.height / 0.352777777777778
    }

    // Resize pages
    for (i = 0; i < doc.pages.length; i++) {
        doc.pages[i].layoutRule = LayoutRuleOptions.OFF;
        doc.pages[i].resize(CoordinateSpaces.INNER_COORDINATES,
            AnchorPoint.CENTER_ANCHOR,
            ResizeMethods.REPLACING_CURRENT_DIMENSIONS_WITH,
            [pageSizePT.width, pageSizePT.height]);
    }
    // Also set document size
    doc.documentPreferences.pageWidth = pageSize.width;
    doc.documentPreferences.pageHeight = pageSize.height;

    // Set margins
    if (m != null) {
        var pageMargins = sizeArray[m].split("x");
        pageMargins = {
            top: (pageSize.height - pageMargins[1]) / 2,
            left: (pageSize.width - pageMargins[0]) / 2,
            bottom: (pageSize.height - pageMargins[1]) / 2,
            right: (pageSize.width - pageMargins[0]) / 2
        }
        for (i = 0; i < doc.pages.length; i++) {
            doc.pages[i].marginPreferences.properties = pageMargins;
        }
    }
}