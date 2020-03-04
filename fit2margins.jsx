/*
    Fit to margins v1.3
    © March 2020, Paul Chiorean
    This script resizes the selection to page margins.
*/

var doc = app.activeDocument;

// Function to calculate safe area coordinates from page margin size
// ***TODO*** Check filenames for safe area size
function pageSafeArea(page) {
    var pageSize = doc.pages[page].bounds; // check for spreads
    if (doc.pages[page].side != PageSideOptions.LEFT_HAND) {
        var pageMargins = {
            top: doc.pages[page].marginPreferences.top,
            bottom: doc.pages[page].marginPreferences.bottom,
            left: doc.pages[page].marginPreferences.left,
            right: doc.pages[page].marginPreferences.right
        }
    } else {
        // Reverse left and right if left-hand page
        var pageMargins = {
            top: doc.pages[page].marginPreferences.top,
            bottom: doc.pages[page].marginPreferences.bottom,
            left: doc.pages[page].marginPreferences.right,
            right: doc.pages[page].marginPreferences.left
        }
    }
    if (pageMargins.top + pageMargins.left + pageMargins.bottom + pageMargins.right != 0) {
        var m_y1 = pageMargins.top;
        var m_x1 = pageMargins.left;
        var m_y2 = pageSize[2] - pageMargins.bottom;
        var m_x2 = pageSize[3] - pageMargins.right;
        return [m_y1, m_x1, m_y2, m_x2]
    } else {
        return pageSize
    }
}

// If something is selected, resize it to safe area, if defined
// ***TODO*** If selection = multiple objects, resize it proportionally as an unit
if (doc.selection.length != 0) {
    var docPage = doc.selection[0].parentPage.documentOffset;
    if (pageSafeArea(docPage) != false) {
        doc.selection[0].geometricBounds = pageSafeArea(docPage)
    }
} else {
    // alert("Please select an object and try again.")
}