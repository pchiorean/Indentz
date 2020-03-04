/*
    Fit to bleedbox v1.2
    © March 2020, Paul Chiorean
    This script resizes the selection to page bleedbox.
*/

var doc = app.activeDocument;

// Function to calculate bleedbox coordinates
function pageBleedSize(page) {
    var pageSize = doc.pages[page].bounds;
    var pageBleed = {
        top: doc.documentPreferences.properties.documentBleedTopOffset,
        left: doc.documentPreferences.properties.documentBleedInsideOrLeftOffset,
        bottom: doc.documentPreferences.properties.documentBleedBottomOffset,
        right: doc.documentPreferences.properties.documentBleedOutsideOrRightOffset
    }
    // Reverse left with right if left-hand page
	if (doc.pages[page].side == PageSideOptions.LEFT_HAND) {
        pageBleed.left = doc.documentPreferences.properties.documentBleedOutsideOrRightOffset;
        pageBleed.right = doc.documentPreferences.properties.documentBleedInsideOrLeftOffset;
    }
    if (pageBleed.top + pageBleed.left + pageBleed.bottom + pageBleed.right != 0) {
        var b_y1 = pageSize[0] - pageBleed.top;
        var b_x1 = pageSize[1] - pageBleed.left;
        var b_y2 = pageSize[2] + pageBleed.bottom;
        var b_x2 = pageSize[3] + pageBleed.right;
        return [b_y1, b_x1, b_y2, b_x2]
    } else {
        return pageSize
    }
}

// If something is selected, resize it to bleedbox, if defined
// ***TODO*** If selection = multiple objects, resize it proportionally as an unit
if (doc.selection.length != 0) {
    var docPage = doc.selection[0].parentPage.documentOffset;
    if (pageBleedSize(docPage) != false) {
        doc.selection[0].geometricBounds = pageBleedSize(docPage)
    }
} else {
    // alert("Please select an object and try again.")
}