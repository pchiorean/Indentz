/*
    Page size from selection v1.4.3
    © April 2020, Paul Chiorean
    This script sets the page size to the selection bounds.
*/

var doc = app.activeDocument;
// app.generalPreferences.objectsMoveWithPage = false;
// doc.adjustLayoutPreferences.enableAdjustLayout = false;
doc.adjustLayoutPreferences.enableAutoAdjustMargins = false;

var sel = doc.selection; // Save selection
if (sel.length > 0 && sel[0].constructor.name != "Guide") {
    // Get selection's parent page
    var selObj = sel;
    var selPage = selObj[0].parent.pages[0]; // 1st page of parent spread, as backup
    for (i = 0; i < selObj.length; i++) {
        if (selObj[i].parentPage != null) {
            selPage = selObj[i].parentPage;
            break;
        }
    }
    // Save original margins
    var pageMargins = {
        top: selPage.marginPreferences.top,
        left: selPage.marginPreferences.left,
        bottom: selPage.marginPreferences.bottom,
        right: selPage.marginPreferences.right
    }
    // If multiple selection, temporarily group it
    var flagUngroup = false;
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
        flagUngroup = true; // Flag for ungroup
    } else {
        selObj = selObj[0];
    }
    // Set margins to zero
    selPage.marginPreferences.properties = { top: 0, left: 0, bottom: 0, right: 0 };
    // Resize page
    selPage.layoutRule = LayoutRuleOptions.OFF; // Don't scale page items
    var selObjTL = selObj.resolve(AnchorPoint.TOP_LEFT_ANCHOR, CoordinateSpaces.SPREAD_COORDINATES)[0];
    var selObjBR = selObj.resolve(AnchorPoint.BOTTOM_RIGHT_ANCHOR, CoordinateSpaces.SPREAD_COORDINATES)[0];
    selPage.reframe(CoordinateSpaces.SPREAD_COORDINATES, [selObjTL, selObjBR]);
    // Ungroup and restore locked state
    if (flagUngroup) {
        selObj.ungroup();
        for (i = 0; i < selObjLockedArray.length; i++) {
            sel[selObjLockedArray[i]].locked = true;
        };
    }
    // Try to restore original margins
    try {
        selPage.marginPreferences.properties = {
            top: pageMargins.top,
            left: pageMargins.left,
            bottom: pageMargins.bottom,
            right: pageMargins.right
        }
    } catch (e) {};
    // Also set document size
    if (doc.pages.length == 1) {
        var pageSize = { width: (selObjBR[0] - selObjTL[0]), height: (selObjBR[1] - selObjTL[1]) };
        doc.documentPreferences.pageWidth = pageSize.width;
        doc.documentPreferences.pageHeight = pageSize.height;
    }
    app.select(sel); // Restore initial selection
} else {
    alert("Select an object and try again.")
}