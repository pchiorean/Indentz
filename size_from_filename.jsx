/*
    Size from filename v1.0
    © March 2020, Paul Chiorean
    This script sets every page size and margins based on the filename. 
    It looks for pairs of values like 000x000 (page size) or 000x000_000x000 (page size_safe area).
*/

var doc = app.activeDocument;
doc.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.MILLIMETERS;
doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.MILLIMETERS;
app.scriptPreferences.measurementUnit = MeasurementUnits.MILLIMETERS;

var docName = doc.name.substr(0, doc.name.lastIndexOf(".")); // name w/o extension
var sizeArray = docName.match(/_\d{2,}x\d{2,}/ig); // match '_000x000'

if (sizeArray != null) { // At least one pair of dimensions
    // Clean up underscores
    for (i = 0; i < sizeArray.length; i++) {
        sizeArray[i] = sizeArray[i].replace(/_/g, ""); // delete '_'
    }

    // 1st pair is page size
    var pageSize = sizeArray[0].split("x");
    var pageSizeMM = {
        width: Number(pageSize[0]),
        height: Number(pageSize[1])
    };
    var pageSizePT = {
        width: pageSizeMM.width / 0.352777777777778,
        height: pageSizeMM.height / 0.352777777777778
    };
    // Resize page(s)
    doc.documentPreferences.pageWidth = pageSizeMM.width;
    doc.documentPreferences.pageHeight = pageSizeMM.height;
    for (var i = 0; i < doc.pages.length; i++) {
        doc.pages[i].layoutRule = LayoutRuleOptions.OFF;
        doc.pages[i].resize(CoordinateSpaces.INNER_COORDINATES,
            AnchorPoint.CENTER_ANCHOR,
            ResizeMethods.REPLACING_CURRENT_DIMENSIONS_WITH,
            [pageSizePT.width, pageSizePT.height]);
    }

    // If 2 pairs, 2nd is safe area (or is it?)
    if (sizeArray.length == 2) {
        var pageMargins = sizeArray[1].split("x");
        var pageMarginsMM = {
            top: Math.abs((pageSizeMM.height - pageMargins[1]) / 2),
            left: Math.abs((pageSizeMM.width - pageMargins[0]) / 2),
            bottom: Math.abs((pageSizeMM.height - pageMargins[1]) / 2),
            right: Math.abs((pageSizeMM.width - pageMargins[0]) / 2)
        }
        // Set margins
        for (var i = 0; i < doc.pages.length; i++) {
            doc.pages[i].marginPreferences.properties = pageMarginsMM;
        }
    }
}