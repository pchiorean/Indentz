/*
    Fit to spread v1.1.4
    © April 2020, Paul Chiorean
    This script resizes the selection to the spread size.
*/

var doc = app.activeDocument;
var selObj = doc.selection;

if (selObj.length > 0 && selObj[0].constructor.name != "Guide") {
    // Save setting and set ruler origin to spread
    var ro = doc.viewPreferences.rulerOrigin;
    doc.viewPreferences.rulerOrigin = RulerOrigin.SPREAD_ORIGIN;
    // Get selection's parent spread
    var selSpread;
    for (i = 0; i < selObj.length; i++) {
        if (selObj[i].parentPage != null) {
            selSpread = selObj[i].parentPage.parent;
            break;
        }
    }
    if (selSpread != null) {
        for (i = 0; i < selObj.length; i++) {
            selObj[i].geometricBounds = spreadSize(selSpread.index);
        }
        // Restore ruler origin setting
        doc.viewPreferences.rulerOrigin = ro;
    } else {
        alert("Please select an object not on pasteboard and try again.")
    }
} else {
    alert("Please select an object and try again.")
}
// END


function spreadSize(spread) {
    var spreadPages = doc.spreads[spread].pages;
    var firstPage = spreadPages.firstItem();
    var lastPage = spreadPages.lastItem();
    if (spreadPages.length == 1) { // Spread is single page
        var spreadSize = firstPage.bounds;
    } else { // Spread is multiple pages
        var spreadSize = [firstPage.bounds[0], firstPage.bounds[1], lastPage.bounds[2], lastPage.bounds[3]];
    }
    return spreadSize;
}