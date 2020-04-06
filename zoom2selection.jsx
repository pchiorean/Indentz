/*
    Zoom to selection v1.2.1
    © April 2020, Paul Chiorean
    This script zooms to the selected objects.
*/

var doc = app.activeDocument;
var window = app.activeWindow;
var selObj = doc.selection;

if (selObj.length != 0) {
    var selObj_y1 = selObj[0].visibleBounds[0];
    var selObj_x1 = selObj[0].visibleBounds[1];
    var selObj_y2 = selObj[0].visibleBounds[2];
    var selObj_x2 = selObj[0].visibleBounds[3];
    for (i = 1; i < selObj.length; i++) {
        if (selObj[i].visibleBounds[0] < selObj_y1) {
            selObj_y1 = selObj[i].visibleBounds[0]
        }
        if (selObj[i].visibleBounds[1] < selObj_x1) {
            selObj_x1 = selObj[i].visibleBounds[1]
        }
        if (selObj[i].visibleBounds[2] > selObj_y2) {
            selObj_y2 = selObj[i].visibleBounds[2]
        }
        if (selObj[i].visibleBounds[3] > selObj_x2) {
            selObj_x2 = selObj[i].visibleBounds[3]
        }
    }
    var W_sel = selObj_x2 - selObj_x1;
    var H_sel = selObj_y2 - selObj_y1;

    var W_win = window.bounds[3] - window.bounds[1];
    var H_win = (window.bounds[2] - window.bounds[0]) * 1.33;

    var zoom = H_win / H_sel;
    if (W_sel * zoom > W_win) { zoom = W_win / W_sel }
    zoom = zoom * 13.3;

    window.zoom(ZoomOptions.fitPage);
    if (zoom > 4000) { zoom = 4000 };
    window.zoomPercentage = zoom;
} else {
    // alert("Please select an object not on pasteboard and try again.")
}