/*
    Zoom to selection v1.2.0
    © April 2020, Paul Chiorean
    This script zooms to the selected objects.
*/

var doc = app.activeDocument;
var window = app.activeWindow;

if (doc.selection.length != 0 && doc.selection[0].parentPage != null) {
    var selObj = doc.selection;
    var selPage = selObj[0].parentPage;

    var selObjY1 = selObj[0].geometricBounds[0];
    var selObjX1 = selObj[0].geometricBounds[1];
    var selObjY2 = selObj[0].geometricBounds[2];
    var selObjX2 = selObj[0].geometricBounds[3];
    for (i = 0; i < selObj.length; i++) {
        if (selObj[i].geometricBounds[0] < selObjY1) {
            selObjY1 = selObj[i].geometricBounds[0]
        }
        if (selObj[i].geometricBounds[1] < selObjX1) {
            selObjX1 = selObj[i].geometricBounds[1]
        }
        if (selObj[i].geometricBounds[2] > selObjY2) {
            selObjY2 = selObj[i].geometricBounds[2]
        }
        if (selObj[i].geometricBounds[3] > selObjX2) {
            selObjX2 = selObj[i].geometricBounds[3]
        }
    }
    var W_sel = selObjX2 - selObjX1;
    var H_sel = selObjY2 - selObjY1;

    var W_win = window.bounds[3] - window.bounds[1];
    var H_win = (window.bounds[2] - window.bounds[0]) * 1.33;

    var zoom = H_win / H_sel;
    if (W_sel * zoom > W_win) {
        zoom = W_win / W_sel
    }
    zoom = zoom * 13.3;

    window.zoom(ZoomOptions.fitPage);
    if (zoom > 4000) { zoom = 4000 };
    window.zoomPercentage = zoom;
} else {
    // alert("Please select an object not on pasteboard and try again.")
}