/*
    Fit to margins v1.4
    © March 2020, Paul Chiorean
    This script resizes the selection to page margins.
*/

var doc = app.activeDocument;

// If something is selected, resize it to safe area, if defined
if (doc.selection.length != 0 && doc.selection[0].parentPage != null) {
    var spread = doc.selection[0].parentPage.parent; // parent spread
    for (i = 0; i < doc.selection.length; i++) {
        doc.selection[i].geometricBounds = pageSafeArea(spread.index)
    }
} else {
    // alert("Please select an object not on pasteboard and try again.")
}

// Function to calculate safe area coordinates from page(s) margin size
// ***TODO*** Check filenames for safe area size
function pageSafeArea(s) {
    // Save setting and set ruler origin to spread
    var ro = doc.viewPreferences.rulerOrigin;
    doc.viewPreferences.rulerOrigin = RulerOrigin.SPREAD_ORIGIN;

    var spreadPages = doc.spreads[s].pages; // spread pages
    var firstPage = spreadPages.firstItem(); // first page of spread
    if (spreadPages.length == 1) {
        // Spread is single page
        var pageSize = firstPage.bounds;
        var pageMargins = {
            top: firstPage.marginPreferences.top,
            left: firstPage.marginPreferences.left,
            bottom: firstPage.marginPreferences.bottom,
            right: firstPage.marginPreferences.right
        }
        // Reverse left and right margins if left-hand page
        if (firstPage.side == PageSideOptions.LEFT_HAND) {
            pageMargins.left = firstPage.marginPreferences.right;
            pageMargins.right = firstPage.marginPreferences.left
        }
    } else {
        // Spread is multiple pages
        var lastPage = spreadPages.lastItem(); // last page of spread
        var pageSize = [firstPage.bounds[0], firstPage.bounds[1], lastPage.bounds[2], lastPage.bounds[3]]
        var pageMargins = {
            top: firstPage.marginPreferences.top,
            left: firstPage.marginPreferences.left,
            bottom: lastPage.marginPreferences.bottom,
            right: lastPage.marginPreferences.right
        }
        // Reverse left and right margins if left-hand page
        if (firstPage.side == PageSideOptions.LEFT_HAND) {
            pageMargins.left = firstPage.marginPreferences.right;
        }
    }
    if (pageMargins.top + pageMargins.left + pageMargins.bottom + pageMargins.right != 0) {
        var m_y1 = pageMargins.top;
        var m_x1 = pageMargins.left;
        var m_y2 = pageSize[2] - pageMargins.bottom;
        var m_x2 = pageSize[3] - pageMargins.right;
        // alert("pageSize = [" + pageSize[0] + ", " + pageSize[1] + ", " + pageSize[2] + ", " + pageSize[3] + "]\r" + "pageMargins.left = " + pageMargins.left + ", pageMargins.right = " + pageMargins.right + "\r" + "pageSafeArea = [" + [m_y1, m_x1, m_y2, m_x2] + "]");

        // Restore ruler origin
        doc.viewPreferences.rulerOrigin = ro;
        return [m_y1, m_x1, m_y2, m_x2]
    } else {
        return pageSize
    }
}