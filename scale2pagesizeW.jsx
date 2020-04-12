/*
    Scale to page (left/right) v1.0.0
    © April 2020, Paul Chiorean
    This script scales the selected objects to the page left/right dimensions.
*/

var doc = app.activeDocument;
var sel = doc.selection; // save selection

if (sel.length != 0 && sel[0].parentPage != null) {
    // Remember layers for grouping/ungrouping
    var set_uRL = app.generalPreferences.ungroupRemembersLayers;
    var set_pRL = app.clipboardPreferences.pasteRemembersLayers;
    app.generalPreferences.ungroupRemembersLayers = true;
    app.clipboardPreferences.pasteRemembersLayers = true;

    var selObj = sel;
    var selPage = selObj[0].parentPage;
    var flagUngroup = false;

    // If multiple selection, temporarily group it
    if (selObj.length > 1) {
        var selObjArray = [];
        for (i = 0; i < selObj.length; i++) {
            if (!selObj[i].locked) { selObjArray.push(selObj[i]) };
        }
        selObj = selPage.groups.add(selObjArray);
        flagUngroup = true;
    } else {
        selObj = selObj[0];
    }

    var W_pg = selPage.bounds[3] - selPage.bounds[1];
    var H_pg = selPage.bounds[2] - selPage.bounds[0];
    var W_obj = selObj.visibleBounds[3] - selObj.visibleBounds[1];
    var H_obj = selObj.visibleBounds[2] - selObj.visibleBounds[0];

    var objSF = W_pg / W_obj;
    var matrix = app.transformationMatrices.add({
        horizontalScaleFactor: objSF,
        verticalScaleFactor: objSF
    });

    selObj.transform(CoordinateSpaces.PASTEBOARD_COORDINATES, AnchorPoint.CENTER_ANCHOR, matrix);
    doc.align(selObj, DistributeOptions.HORIZONTAL_CENTERS, AlignDistributeBounds.PAGE_BOUNDS);
    doc.align(selObj, DistributeOptions.VERTICAL_CENTERS, AlignDistributeBounds.PAGE_BOUNDS);

    // Ungroup and restore selection
    if (flagUngroup) { selObj.ungroup() };
    app.select(sel);

    // Restore layer grouping settings
    app.generalPreferences.ungroupRemembersLayers = set_uRL;
    app.clipboardPreferences.pasteRemembersLayers = set_pRL;
} else {
    // alert("Please select an object not on pasteboard and try again.")
}