/*
    Fit to page v1.2.2
    © March 2020, Paul Chiorean
    This script resizes the selection to the page size.
*/

var doc = app.activeDocument;
var selObj = doc.selection;

// If something is selected, resize it to page size
if (selObj.length != 0 && selObj[0].parentPage != null) {
    var selPage = selObj[0].parentPage.documentOffset;
    var pageSize = doc.pages[selPage].bounds;
    for (i = 0; i < selObj.length; i++) {
        selObj[i].geometricBounds = pageSize;
    }
} else {
    // alert("Please select an object not on pasteboard and try again.")
}