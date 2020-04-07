/*
    Fit to page v1.2.1
    © March 2020, Paul Chiorean
    This script resizes the selection to the page size.
*/

var doc = app.activeDocument;

// If something is selected, resize it to page size
if (doc.selection.length != 0 && doc.selection[0].parentPage != null) {
    var selPage = doc.selection[0].parentPage.documentOffset;
    var pageSize = doc.pages[selPage].bounds;
    for (i = 0; i < doc.selection.length; i++) {
        doc.selection[i].geometricBounds = pageSize;
    }
} else {
    // alert("Please select an object not on pasteboard and try again.")
}