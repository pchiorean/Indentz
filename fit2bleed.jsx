/*
    Fit to bleedbox v1.4.4
    © April 2020, Paul Chiorean
    This script resizes the selection to the spread bleedbox.
*/

var doc = app.activeDocument;
var selObj = doc.selection;

// Save setting and set ruler origin to spread
var ro = doc.viewPreferences.rulerOrigin;
doc.viewPreferences.rulerOrigin = RulerOrigin.SPREAD_ORIGIN;

if (selObj.length != 0 && selObj[0].parentPage != null) {
    var selSpread = selObj[0].parentPage.parent;
    for (i = 0; i < selObj.length; i++) {
        selObj[i].geometricBounds = spreadBleedSize(selSpread.index);
    }
} else {
    // alert("Please select an object not on pasteboard and try again.")
}

// Restore ruler origin setting
doc.viewPreferences.rulerOrigin = ro;


function spreadBleedSize(spread) {
    var spreadPages = doc.spreads[spread].pages; // spread pages
    var firstPage = spreadPages.firstItem(); // first page of spread
    var lastPage = spreadPages.lastItem(); // last page of spread
    var bleedMargins = {
        top: doc.documentPreferences.properties.documentBleedTopOffset,
        left: doc.documentPreferences.properties.documentBleedInsideOrLeftOffset,
        bottom: doc.documentPreferences.properties.documentBleedBottomOffset,
        right: doc.documentPreferences.properties.documentBleedOutsideOrRightOffset
    }
    if (spreadPages.length == 1) {
        // Spread is single page
        var spreadSize = firstPage.bounds;
        // Reverse left and right margins if left-hand page
        if (firstPage.side == PageSideOptions.LEFT_HAND) {
            bleedMargins.left = doc.documentPreferences.properties.documentBleedOutsideOrRightOffset;
            bleedMargins.right = doc.documentPreferences.properties.documentBleedInsideOrLeftOffset;
        }
    } else {
        // Spread is multiple pages
        var spreadSize = [firstPage.bounds[0], firstPage.bounds[1], lastPage.bounds[2], lastPage.bounds[3]];
        // Reverse left and right margins if left-hand page
        if (firstPage.side == PageSideOptions.LEFT_HAND) {
            bleedMargins.left = doc.documentPreferences.properties.documentBleedOutsideOrRightOffset;
        }
    }
    if (bleedMargins.top + bleedMargins.left + bleedMargins.bottom + bleedMargins.right != 0) {
        var m_y1 = spreadSize[0] - bleedMargins.top;
        var m_x1 = spreadSize[1] - bleedMargins.left;
        var m_y2 = spreadSize[2] + bleedMargins.bottom;
        var m_x2 = spreadSize[3] + bleedMargins.right;
        return [m_y1, m_x1, m_y2, m_x2];
    } else {
        return spreadSize;
    }
}