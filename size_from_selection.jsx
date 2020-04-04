/*
    Size from selection v1.0
    © March 2020, Paul Chiorean
    This script sets the page size to the selection bounds.
*/

var doc = app.activeDocument;
var sel = doc.selection; // save selection
// doc.adjustLayoutPreferences.enableAdjustLayout = false;
// doc.adjustLayoutPreferences.enableAutoAdjustMargins = false;
// app.generalPreferences.objectsMoveWithPage = false;

if (doc.selection.length != 0) {
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

    // Set margins to zero
    selPage.marginPreferences.properties = { top: 0, left: 0, bottom: 0, right: 0 };

    // Resize page
    selPage.layoutRule = LayoutRuleOptions.OFF;
    var selObjTL = selObj.resolve(AnchorPoint.TOP_LEFT_ANCHOR, CoordinateSpaces.SPREAD_COORDINATES);
    var selObjBR = selObj.resolve(AnchorPoint.BOTTOM_RIGHT_ANCHOR, CoordinateSpaces.SPREAD_COORDINATES);
    selPage.reframe(CoordinateSpaces.SPREAD_COORDINATES, [selObjTL[0], selObjBR[0]]);

    // Ungroup and restore selection
    try { selObj.ungroup() } catch (e) {}
    app.select(sel);
} else {
    // alert("Please select an object and try again.")
}