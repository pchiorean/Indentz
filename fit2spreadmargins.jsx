/*
    Fit to spread margins v1.1.3
    © April 2020, Paul Chiorean
    This script resizes the selection to the page margins.
    If page is part of a spread, resize to the spread margins.
*/

var doc = app.activeDocument;
var selObj = doc.selection;

    // Save setting and set ruler origin to spread
    var ro = doc.viewPreferences.rulerOrigin;
    doc.viewPreferences.rulerOrigin = RulerOrigin.SPREAD_ORIGIN;

if (selObj.length != 0 && selObj[0].parentPage != null) {
    var selSpread = selObj[0].parentPage.parent;
    for (i = 0; i < selObj.length; i++) {
        selObj[i].geometricBounds = spreadSafeArea(selSpread.index);
    }
} else {
    // alert("Please select an object not on pasteboard and try again.")
}

// Restore ruler origin setting
doc.viewPreferences.rulerOrigin = ro;


function spreadSafeArea(spread) {
    var spreadPages = doc.spreads[spread].pages; // spread pages
    var firstPage = spreadPages.firstItem(); // first page of spread
    var lastPage = spreadPages.lastItem(); // last page of spread
    if (spreadPages.length == 1) {
        // Spread is single page
        var spreadSize = firstPage.bounds;
        var spreadMargins = {
            top: firstPage.marginPreferences.top,
            left: firstPage.marginPreferences.left,
            bottom: firstPage.marginPreferences.bottom,
            right: firstPage.marginPreferences.right
        }
        // Reverse left and right margins if left-hand page
        if (firstPage.side == PageSideOptions.LEFT_HAND) {
            spreadMargins.left = firstPage.marginPreferences.right;
            spreadMargins.right = firstPage.marginPreferences.left;
        }
    } else {
        // Spread is multiple pages
        var spreadSize = [firstPage.bounds[0], firstPage.bounds[1], lastPage.bounds[2], lastPage.bounds[3]];
        var spreadMargins = {
            top: firstPage.marginPreferences.top,
            left: firstPage.marginPreferences.left,
            bottom: lastPage.marginPreferences.bottom,
            right: lastPage.marginPreferences.right
        }
        // Reverse left and right margins if left-hand page
        if (firstPage.side == PageSideOptions.LEFT_HAND) {
            spreadMargins.left = firstPage.marginPreferences.right;
        }
    }
    if (spreadMargins.top + spreadMargins.left + spreadMargins.bottom + spreadMargins.right != 0) {
        var m_y1 = spreadMargins.top;
        var m_x1 = spreadMargins.left;
        var m_y2 = spreadSize[2] - spreadMargins.bottom;
        var m_x2 = spreadSize[3] - spreadMargins.right;
        return [m_y1, m_x1, m_y2, m_x2];
    } else {
        return spreadSize;
    }
}