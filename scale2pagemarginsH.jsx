/*
    Scale to page margins (top/bottom) v1.4.4
    © April 2020, Paul Chiorean
    This script scales the selected objects to the page top/bottom margins.
*/

var doc = app.activeDocument;
var sel = doc.selection; // Save selection

if (sel.length > 0) {
    // Get selection's parent page
    var selPage;
    for (i = 0; i < sel.length; i++) {
        if (sel[i].parentPage != null) {
            selPage = doc.pages[sel[i].parentPage.documentOffset];
            break;
        }
    }
    if (selPage != null) {
        // Remember layers for grouping/ungrouping
        var set_uRL = app.generalPreferences.ungroupRemembersLayers;
        var set_pRL = app.clipboardPreferences.pasteRemembersLayers;
        app.generalPreferences.ungroupRemembersLayers = true;
        app.clipboardPreferences.pasteRemembersLayers = true;

        var selObj = sel;
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
        var W_mg = W_pg - (selPage.marginPreferences.left + selPage.marginPreferences.right);
        var H_mg = H_pg - (selPage.marginPreferences.top + selPage.marginPreferences.bottom);
        var W_obj = selObj.visibleBounds[3] - selObj.visibleBounds[1];
        var H_obj = selObj.visibleBounds[2] - selObj.visibleBounds[0];

        var objSF = H_mg / H_obj;
        var matrix = app.transformationMatrices.add({
            horizontalScaleFactor: objSF,
            verticalScaleFactor: objSF
        });

        selObj.transform(CoordinateSpaces.PASTEBOARD_COORDINATES, AnchorPoint.CENTER_ANCHOR, matrix);
        doc.align(selObj, DistributeOptions.HORIZONTAL_CENTERS, AlignDistributeBounds.MARGIN_BOUNDS);
        doc.align(selObj, DistributeOptions.VERTICAL_CENTERS, AlignDistributeBounds.MARGIN_BOUNDS);

        // Ungroup and restore selection
        if (flagUngroup) { selObj.ungroup() };
        app.select(sel);

        // Restore layer grouping settings
        app.generalPreferences.ungroupRemembersLayers = set_uRL;
        app.clipboardPreferences.pasteRemembersLayers = set_pRL;
    } else {
        alert("Please select an object not on pasteboard and try again.")
    }
} else {
    alert("Please select an object and try again.")
}