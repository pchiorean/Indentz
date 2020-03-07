/*
    Fit to spread margins v1.0
    © March 2020, Paul Chiorean
    This script resizes the selection to the page margins or, if not defined, to the page size. If page is part of a spread, resize to the spread margins (or size).
*/

var doc = app.activeDocument;

if (doc.selection.length != 0 && doc.selection[0].parentPage != null) {
    var parentPage = doc.selection[0].parentPage;
    var parentSpread = doc.selection[0].parentPage.parent;
    for (i = 0; i < doc.selection.length; i++) {
        doc.selection[i].geometricBounds = spreadSafeArea(parentSpread.index)
    }
} else {
    // alert("Please select an object not on pasteboard and try again.")
}

function spreadSafeArea(s) {
    // Save setting and set ruler origin to spread
    var ro = doc.viewPreferences.rulerOrigin;
    doc.viewPreferences.rulerOrigin = RulerOrigin.SPREAD_ORIGIN;

    var spreadPages = doc.spreads[s].pages; // spread pages
    var firstPage = spreadPages.firstItem(); // first page of spread
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
            spreadMargins.right = firstPage.marginPreferences.left
        }
    } else {
        // Spread is multiple pages
        var lastPage = spreadPages.lastItem(); // last page of spread
        var spreadSize = [firstPage.bounds[0], firstPage.bounds[1], lastPage.bounds[2], lastPage.bounds[3]]
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

        // alert("current spread = " + s + "\rspreadSize = [" + spreadSize[0] + ", " + spreadSize[1] + ", " + spreadSize[2] + ", " + spreadSize[3] + "]\r" + "spreadMargins.left = " + spreadMargins.left + "\rspreadMargins.right = " + spreadMargins.right + "\r" + "spreadSafeArea = [" + [m_y1, m_x1, m_y2, m_x2] + "]");

        // Restore ruler origin
        doc.viewPreferences.rulerOrigin = ro;
        return [m_y1, m_x1, m_y2, m_x2]
    } else {
        return spreadSize
    }
}