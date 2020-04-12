/*
    Fit to page margins v1.0.7
    © April 2020, Paul Chiorean
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
// END

function pageSafeArea(page) {
    var pageSize = page.bounds;
    var pageMargins = page.marginPreferences;
    // Reverse left and right margins if left-hand page
    if (pageMargins.top + pageMargins.left + pageMargins.bottom + pageMargins.right != 0) {
        if (page.side == PageSideOptions.LEFT_HAND) {
            var m_x1 = page.bounds[1] + pageMargins.right;
            var m_x2 = page.bounds[3] - pageMargins.left;
        } else {
            var m_x1 = page.bounds[1] + pageMargins.left;
            var m_x2 = page.bounds[3] - pageMargins.right;
        }
        var m_y1 = page.bounds[0] + pageMargins.top;
        var m_y2 = page.bounds[2] - pageMargins.bottom;
        return [m_y1, m_x1, m_y2, m_x2];
    } else {
        return pageSize;
    }
}