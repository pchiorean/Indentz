/*
    Zoom to selection v1.3.1
    © April 2020, Paul Chiorean
    This script zooms to the selected objects or, if nothing is selected, to the current page.
*/

var doc = app.activeDocument;
var window = app.activeWindow;
var selPage = window.activePage;
var selObj = doc.selection;

if (selObj.length != 0) {
    var selObj_y1 = selObj[0].visibleBounds[0];
    var selObj_x1 = selObj[0].visibleBounds[1];
    var selObj_y2 = selObj[0].visibleBounds[2];
    var selObj_x2 = selObj[0].visibleBounds[3];
    for (i = 1; i < selObj.length; i++) {
        selObj_y1 = Math.min(selObj[i].visibleBounds[0], selObj_y1);
        selObj_x1 = Math.min(selObj[i].visibleBounds[1], selObj_x1);
        selObj_y2 = Math.max(selObj[i].visibleBounds[2], selObj_y2);
        selObj_x2 = Math.max(selObj[i].visibleBounds[3], selObj_x2);
    }
    var W_obj = selObj_x2 - selObj_x1;
    var H_obj = selObj_y2 - selObj_y1;
} else {
    var W_obj = selPage.bounds[3] - selPage.bounds[1];
    var H_obj = selPage.bounds[2] - selPage.bounds[0];
}
var W_win = window.bounds[3] - window.bounds[1];
var H_win = (window.bounds[2] - window.bounds[0]) * 1.33;

var zoom = H_win / H_obj;
if (W_obj * zoom > W_win) { zoom = W_win / W_obj }
zoom = zoom * 10 * 1.5;

if (zoom > 4000) { zoom = 4000 };
window.zoom(ZoomOptions.FIT_PAGE);
window.zoomPercentage = zoom;