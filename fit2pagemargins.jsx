/*
    Fit to page margins v1.0.5
    © March 2020, Paul Chiorean
    This script resizes the selection to the page margins.
*/

var doc = app.activeDocument;
var selObj = doc.selection;

if (selObj.length != 0 && selObj[0].parentPage != null) {
    var selPage = selObj[0].parentPage;
    for (i = 0; i < selObj.length; i++) {
        selObj[i].geometricBounds = pageSafeArea(selPage);
    }
} else {
    // alert("Please select an object not on pasteboard and try again.")
}


function pageSafeArea(page) {
    var pageSize = page.bounds;
    var pageMargins = page.marginPreferences;
    // Reverse left and right margins if left-hand page
    if (page.side == PageSideOptions.LEFT_HAND) {
        pageMargins.left = page.marginPreferences.right;
        pageMargins.right = page.marginPreferences.left;
    }
    if (pageMargins.top + pageMargins.left + pageMargins.bottom + pageMargins.right != 0) {
        var m_y1 = pageSize[0] + pageMargins.top;
        var m_x1 = pageSize[1] + pageMargins.left;
        var m_y2 = pageSize[2] - pageMargins.bottom;
        var m_x2 = pageSize[3] - pageMargins.right;
        return [m_y1, m_x1, m_y2, m_x2];
    } else {
        return pageSize;
    }
}