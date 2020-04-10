/*
    Zoom to selection v1.4.2
    © April 2020, Paul Chiorean
    This script zooms to the selected objects or, if nothing is selected, to the current page.
*/

var doc = app.activeDocument;
var window = app.activeWindow;
var selPage = window.activePage;
var selObj = doc.selection;
app.scriptPreferences.measurementUnit = MeasurementUnits.PIXELS;

// Get target dimensions
if (selObj.length != 0) {
    if (selObj[0].hasOwnProperty("parentTextFrames")) {
        // We are inside a text frame, get frame bounds
        var selObj_y1 = selObj[0].parentTextFrames[0].visibleBounds[0];
        var selObj_x1 = selObj[0].parentTextFrames[0].visibleBounds[1];
        var selObj_y2 = selObj[0].parentTextFrames[0].visibleBounds[2];
        var selObj_x2 = selObj[0].parentTextFrames[0].visibleBounds[3];
        var sel = doc.selection; // Save selection
        app.select(selObj[0].parentTextFrames[0]); // Select frame
    } else {
        var selObj_y1 = selObj[0].visibleBounds[0];
        var selObj_x1 = selObj[0].visibleBounds[1];
        var selObj_y2 = selObj[0].visibleBounds[2];
        var selObj_x2 = selObj[0].visibleBounds[3];
        for (i = 1; i < selObj.length; i++) { // Find extremities
            selObj_y1 = Math.min(selObj[i].visibleBounds[0], selObj_y1);
            selObj_x1 = Math.min(selObj[i].visibleBounds[1], selObj_x1);
            selObj_y2 = Math.max(selObj[i].visibleBounds[2], selObj_y2);
            selObj_x2 = Math.max(selObj[i].visibleBounds[3], selObj_x2);
        }
    }
    var W_obj = selObj_x2 - selObj_x1;
    var H_obj = selObj_y2 - selObj_y1;
} else { // Nothing is selected, zoom to page
    var W_obj = selPage.bounds[3] - selPage.bounds[1];
    var H_obj = selPage.bounds[2] - selPage.bounds[0];
}

// Get window dimensions
var W_win = window.bounds[3] - window.bounds[1];
var H_win = (window.bounds[2] - window.bounds[0]) * 1.33;

// Compute zoom percentage
var zoom = Math.min(W_win / W_obj, H_win / H_obj);
zoom = Number(zoom * 10 * 4).toFixed(1); // Adjust to taste
zoom = Math.max(5, zoom); zoom = Math.min(zoom, 4000); // Fit in 5-4000% range

// Zoom
window.zoom(ZoomOptions.FIT_PAGE);
try { window.zoomPercentage = zoom } catch (e) {
    // Avoid error 30481 'Data is out of range'
    app.menuActions.item("$ID/Fit Selection in Window").invoke();
}

// Restore initial selection
try { app.select(sel) } catch (e) {};