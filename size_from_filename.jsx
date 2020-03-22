/*
    Size from filename v1.1.1
    © March 2020, Paul Chiorean
    This script sets every page size and margins based on the filename.
    It looks for pairs of values like 000x000 (page size) or 000x000_000x000 (page size_safe area).
*/

var doc = app.activeDocument;
app.scriptPreferences.measurementUnit = MeasurementUnits.MILLIMETERS;
doc.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.MILLIMETERS;
doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.MILLIMETERS;
doc.adjustLayoutPreferences.enableAdjustLayout = false;
doc.adjustLayoutPreferences.enableAutoAdjustMargins = false;
// app.generalPreferences.objectsMoveWithPage = false;

var docName = doc.name.substr(0, doc.name.lastIndexOf(".")); // name w/o extension
var sizeArray = docName.match(/_\d{2,}([\.,]\d{1,2})?x\d{2,}([\.,]\d{1,2})?/ig); // match '_000x000' pairs

if (sizeArray != null) { // at least one pair of dimensions
    for (i = 0; i < sizeArray.length; i++) { // clean up
        sizeArray[i] = sizeArray[i].replace(/_/g, "");
        sizeArray[i] = sizeArray[i].replace(/,/g, ".");
    }
    switch (sizeArray.length) {
        case 1: // one pair; page size
            var p = 0;
            break;
        case 2: // 2 pairs; page size is larger
            var dimA = sizeArray[0].split("x");
            var dimB = sizeArray[1].split("x");
            if ((dimA[0] >= dimB[0]) && (dimA[1] >= dimB[1])) {
                var p = 0; var m = 1;
            } else {
                var p = 1; var m = 0;
            }
    }
    resizePages(p, m);

    // Check for bleed
    var bleedArray = /_\d{2,}x\d{2,}_(\d{1,3})\s?[cm]m/i.exec(docName); // match '_000x000_(00)mm'
    if (bleedArray != null) {
        doc.documentPreferences.documentBleedUniformSize = true;
        doc.documentPreferences.documentBleedTopOffset = bleedArray[1];
    }
}


function resizePages(p, m) {
    var pageSize = sizeArray[p].split("x");
    var pageSizeMM = { // page size in millimeters
        width: Number(pageSize[0]),
        height: Number(pageSize[1])
    }
    var pageSizePT = { // page size in points
        width: pageSizeMM.width / 0.352777777777778,
        height: pageSizeMM.height / 0.352777777777778
    }
    // Resize pages
    for (var i = 0; i < doc.pages.length; i++) {
        doc.pages[i].layoutRule = LayoutRuleOptions.OFF;
        doc.pages[i].resize(CoordinateSpaces.INNER_COORDINATES,
            AnchorPoint.CENTER_ANCHOR,
            ResizeMethods.REPLACING_CURRENT_DIMENSIONS_WITH,
            [pageSizePT.width, pageSizePT.height]);
    }
    // Also set document size
    doc.documentPreferences.pageWidth = pageSizeMM.width;
    doc.documentPreferences.pageHeight = pageSizeMM.height;

    if (m != null) { // margins
        var pageMargins = sizeArray[m].split("x");
        var pageMarginsMM = {
            top: (pageSizeMM.height - pageMargins[1]) / 2,
            left: (pageSizeMM.width - pageMargins[0]) / 2,
            bottom: (pageSizeMM.height - pageMargins[1]) / 2,
            right: (pageSizeMM.width - pageMargins[0]) / 2
        }
        for (var i = 0; i < doc.pages.length; i++) {
            doc.pages[i].marginPreferences.properties = pageMarginsMM;
        }
    }
}
