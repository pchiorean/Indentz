/*
    Fit to margins v1.4 WIP
    © March 2020, Paul Chiorean
    This script resizes the selection to page margins.
*/

var doc = app.activeDocument;

// Function to calculate safe area coordinates from page margin size
// ***TODO*** Check filenames for safe area size
function pageSafeArea(page) {
    var curPage = doc.pages[page];
    var pageSize = curPage.bounds; // check for spreads

    // Set ruler origin to spread
    var ro = doc.viewPreferences.rulerOrigin;
    doc.viewPreferences.rulerOrigin = RulerOrigin.SPREAD_ORIGIN;

    var pageMargins = {
        top: curPage.marginPreferences.top,
        bottom: curPage.marginPreferences.bottom,
        left: curPage.marginPreferences.left,
        right: curPage.marginPreferences.right
    }
    // Reverse left and right if left-hand page
    if (curPage.side == PageSideOptions.LEFT_HAND) {
        pageMargins.left = curPage.marginPreferences.right;
        pageMargins.right = curPage.marginPreferences.left
    }
    if (pageMargins.top + pageMargins.left + pageMargins.bottom + pageMargins.right != 0) {
        var m_y1 = pageMargins.top;
        var m_x1 = pageMargins.left;
        var m_y2 = pageSize[2] - pageMargins.bottom;
        var m_x2 = pageSize[3] - pageMargins.right;
        if (curPage.side == PageSideOptions.RIGHT_HAND) {
            // var m_x1 = pageMargins.left;
            // var m_x2 = pageSize[3] - pageMargins.right;
        } else {}

        //alert("pageSize = [" + pageSize[0] + ", " + pageSize[1] + ", " + pageSize[2] + ", " + pageSize[3] + "]\n" + "pageMargins = [" + pageMargins.top + ", " + pageMargins.left + ", " + pageMargins.bottom + ", " + pageMargins.right + "]\n" + "pageSafeArea = [" + [m_y1, m_x1, m_y2, m_x2] + "]");

        // Restore ruler origin
        doc.viewPreferences.rulerOrigin = ro;
        return [m_y1, m_x1, m_y2, m_x2]
    } else {
        return pageSize
    }
}

// If something is selected, resize it to safe area, if defined
// ***TODO*** If selection = multiple objects, resize it proportionally as an unit
if (doc.selection.length != 0) {
    var docPage = doc.selection[0].parentPage.documentOffset;
    doc.selection[0].geometricBounds = pageSafeArea(docPage)
} else {
    // alert("Please select an object and try again.")
}