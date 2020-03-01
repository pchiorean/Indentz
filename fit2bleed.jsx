/*
    Fit to bleedbox v1.0
    © March 2020, Paul Chiorean
    This script resizes the selection to page bleedbox.
*/

var doc = app.activeDocument;

// Function to calculate bleedbox coordinates
function pageBleedSize(page) {
    var pageSize = doc.pages[page].bounds;
    var pageBleed = doc.documentPreferences.properties.documentBleedTopOffset;
    if (pageBleed != 0) {
        var b_y1 = pageSize[0] - pageBleed;
        var b_x1 = pageSize[1] - pageBleed;
        var b_y2 = pageSize[2] + pageBleed;
        var b_x2 = pageSize[3] + pageBleed;
        return [b_y1, b_x1, b_y2, b_x2];
    } else {
        return false;
    }
}

// If something is selected, resize it to bleedbox, if defined
// ***TODO*** If selection = multiple objects, resize it proportionally as an unit
if (doc.selection.length != 0) {
    var docPage = doc.selection[0].parentPage.documentOffset;
    if (pageBleedSize(docPage) != false) {
        doc.selection[0].geometricBounds = pageBleedSize(docPage);
    } else {
        doc.selection[0].geometricBounds = pageSize;
    }
} else {
    // alert("Please select an object and try again.");
}