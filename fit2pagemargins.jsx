/*
    Fit to page margins v1.0.2
    © March 2020, Paul Chiorean
    This script resizes the selection to the page margins or, if not defined, to the page size.
*/

var doc = app.activeDocument;

// Save setting and set ruler origin to spread
var ro = doc.viewPreferences.rulerOrigin;
doc.viewPreferences.rulerOrigin = RulerOrigin.SPREAD_ORIGIN;

if (doc.selection.length != 0 && doc.selection[0].parentPage != null) {
    var selPage = doc.selection[0].parentPage;
    var selSpread = doc.selection[0].parentPage.parent;
    for (i = 0; i < doc.selection.length; i++) {
        doc.selection[i].geometricBounds = pageSafeArea(selPage)
    }
} else {
    // alert("Please select an object not on pasteboard and try again.")
}

// Restore ruler origin setting
doc.viewPreferences.rulerOrigin = ro;


function pageSafeArea(page) {
    var pageSize = page.bounds;
    var pageMargins = page.marginPreferences;
    // Reverse left and right margins if left-hand page
    if (page.side == PageSideOptions.LEFT_HAND) {
        pageMargins.left = page.marginPreferences.right;
        pageMargins.right = page.marginPreferences.left
    }
    if (pageMargins.top + pageMargins.left + pageMargins.bottom + pageMargins.right != 0) {
        var m_y1 = pageSize[0] + pageMargins.top;
        var m_x1 = pageSize[1] + pageMargins.left;
        var m_y2 = pageSize[2] - pageMargins.bottom;
        var m_x2 = pageSize[3] - pageMargins.right;

        // alert("current page = " + page.documentOffset + "\rpageSize = [" + pageSize[0] + ", " + pageSize[1] + ", " + pageSize[2] + ", " + pageSize[3] + "]\r" + "pageMargins.left = " + pageMargins.left + "\rpageMargins.right = " + pageMargins.right + "\r" + "pageSafeArea = [" + [m_y1, m_x1, m_y2, m_x2] + "]");

        return [m_y1, m_x1, m_y2, m_x2]
    } else {
        return pageSize
    }
}