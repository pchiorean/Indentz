/*
    Scale to page margins v1.0
    © March 2020, Paul Chiorean
    This script scales the selection to the page left/right margins.
*/

var doc = app.activeDocument;

// Remember layers for grouping/ungrouping
app.generalPreferences.ungroupRemembersLayers = true;
app.clipboardPreferences.pasteRemembersLayers = true;

if (doc.selection.length != 0 && doc.selection[0].parentPage != null) {
    var selObj = doc.selection;
    var selPage = selObj[0].parentPage;

    if (selObj.length > 1) { // if multiple selection, group it
        var selObjArray = [];
        for (i = 0; i < selObj.length; i++) {
            selObjArray.push(selObj[i])
        }
        selObj = selPage.groups.add(selObjArray)
    } else {
        selObj = selObj[0]
    }

    var W_pg = selPage.bounds[3] - selPage.bounds[1];
    var H_pg = selPage.bounds[2] - selPage.bounds[0];
    var W_mg = W_pg - (selPage.marginPreferences.left + selPage.marginPreferences.right);
    var H_mg = H_pg - (selPage.marginPreferences.top + selPage.marginPreferences.bottom);
    var W_obj = selObj.geometricBounds[3] - selObj.geometricBounds[1];
    var H_obj = selObj.geometricBounds[2] - selObj.geometricBounds[0];

    var objSF = W_mg / W_obj;
    var matrix = app.transformationMatrices.add({
        horizontalScaleFactor: objSF,
        verticalScaleFactor: objSF
    });

    selObj.transform(CoordinateSpaces.pasteboardCoordinates, AnchorPoint.CENTER_ANCHOR, matrix);
    doc.align(selObj, DistributeOptions.HORIZONTAL_CENTERS, AlignDistributeBounds.MARGIN_BOUNDS);
    doc.align(selObj, DistributeOptions.VERTICAL_CENTERS, AlignDistributeBounds.MARGIN_BOUNDS);

    // Ungroup selection
    try { selObj.ungroup() } catch (e) {}

} else {
    // alert("Please select an object not on pasteboard and try again.")
}