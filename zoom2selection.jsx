/*
    Zoom to selection v1.1.0
    © April 2020, Paul Chiorean
    This script zooms to the selected objects.
*/

var doc = app.activeDocument;
var window = app.activeWindow;
var sel = doc.selection; // save selection

if (doc.selection.length != 0 && doc.selection[0].parentPage != null) {
    // Remember layers for grouping/ungrouping
    var uRL = app.generalPreferences.ungroupRemembersLayers;
    var pRL = app.clipboardPreferences.pasteRemembersLayers;
    app.generalPreferences.ungroupRemembersLayers = true;
    app.clipboardPreferences.pasteRemembersLayers = true;

    var selObj = doc.selection;
    var selPage = selObj[0].parentPage;
    var flagUngroup = false;

    if (selObj.length > 1) { // if multiple selection, group it
        var selObjArray = [];
        for (i = 0; i < selObj.length; i++) {
            selObjArray.push(selObj[i])
        }
        selObj = selPage.groups.add(selObjArray);
        flagUngroup = true
    } else {
        selObj = selObj[0]
    }

    var W_win = window.bounds[3] - window.bounds[1];
    var H_win = (window.bounds[2] - window.bounds[0]) * 1.33;
    var W_obj = selObj.visibleBounds[3] - selObj.visibleBounds[1];
    var H_obj = selObj.visibleBounds[2] - selObj.visibleBounds[0];

    var zoom = H_win / H_obj;
    if (W_obj * zoom > W_win) {
        zoom = W_win / W_obj
    }
    zoom = zoom * 13.3;

    window.zoom(ZoomOptions.fitPage);
    if (zoom > 4000) { zoom = 4000 };
    window.zoomPercentage = zoom;

    // Ungroup and restore selection
    if (flagUngroup) { selObj.ungroup() };
    app.select(sel);

    // Restore layer grouping settings
    app.generalPreferences.ungroupRemembersLayers = uRL;
    app.clipboardPreferences.pasteRemembersLayers = pRL;
} else {
    // alert("Please select an object not on pasteboard and try again.")
}