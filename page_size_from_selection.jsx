/*
    Page size from selection v1.3.2
    © April 2020, Paul Chiorean
    This script sets the page size to the selection bounds.
*/

var doc = app.activeDocument;
// app.generalPreferences.objectsMoveWithPage = false;
// doc.adjustLayoutPreferences.enableAdjustLayout = false;
var set_AAM = doc.adjustLayoutPreferences.enableAutoAdjustMargins; // Save AAM settings
doc.adjustLayoutPreferences.enableAutoAdjustMargins = true; // Preserve original margins

var sel = doc.selection; // Save selection
if (sel.length != 0) {
    var selObj = sel;
    var selPage = selObj[0].parent.pages[0]; // 1st page of parent spread
    var flagUngroup = false;

    // If multiple selection, temporarily group it
    if (selObj.length > 1) {
        var selObjArray = [];
        var selObjLockedArray = [];
        for (i = 0; i < selObj.length; i++) {
            // If locked, unlock and save index
            if (selObj[i].locked) {
                selObj[i].locked = false;
                selObjLockedArray.push(i);
            }
            selObjArray.push(selObj[i]);
        }
        selObj = selPage.groups.add(selObjArray);
        flagUngroup = true;
    } else {
        selObj = selObj[0];
    }

    // Resize page
    selPage.layoutRule = LayoutRuleOptions.OFF; // Don't scale page items
    var selObjTL = selObj.resolve(AnchorPoint.TOP_LEFT_ANCHOR, CoordinateSpaces.SPREAD_COORDINATES);
    var selObjBR = selObj.resolve(AnchorPoint.BOTTOM_RIGHT_ANCHOR, CoordinateSpaces.SPREAD_COORDINATES);
    selPage.reframe(CoordinateSpaces.SPREAD_COORDINATES, [selObjTL[0], selObjBR[0]]);

    // Ungroup and restore locked state
    if (flagUngroup) {
        selObj.ungroup();
        for (i = 0; i < selObjLockedArray.length; i++) {
            sel[selObjLockedArray[i]].locked = true;
        }
    }
    doc.adjustLayoutPreferences.enableAutoAdjustMargins = set_AAM; // Restore AAM settings
    app.select(sel); // Restore initial selection
} else {
    // alert("Please select an object and try again.")
}