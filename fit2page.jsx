/*
    Fit to page v1.1.1
    © March 2020, Paul Chiorean
    This script resizes the selection to the page size.
*/

var doc = app.activeDocument;

// If something is selected, resize it to page size
if (doc.selection.length != 0) {
    var selPage = doc.selection[0].parentPage.documentOffset;
    var pageSize = doc.pages[selPage].bounds;
    doc.selection[0].geometricBounds = pageSize
} else {
    // alert("Please select an object and try again.")
}