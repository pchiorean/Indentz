/*
    Zoom to selection v1.4.8
    © April 2020, Paul Chiorean
    This script zooms to the selected objects or, if nothing is selected, to the current page.
*/

var doc = app.activeDocument;
var window = app.activeWindow;
var selPage = window.activePage;
var selSpread = selPage.parent;
app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;

var sel = doc.selection; // Save selection
var selObj = sel;
var selObj_y1, selObj_x1, selObj_y2, selObj_x2;
var spreadBounds = spreadBleedSize(selSpread);
var W_win, H_win, W_obj, H_obj, zoom;

// Get target dimensions
if (selObj.length > 0 && selObj[0].constructor.name != "Guide") {
        // Something is selected, get dimensions
        if (selObj[0].hasOwnProperty("parentTextFrames")) {
            // We are inside a text frame, get frame bounds
            selObj_y1 = selObj[0].parentTextFrames[0].visibleBounds[0];
            selObj_x1 = selObj[0].parentTextFrames[0].visibleBounds[1];
            selObj_y2 = selObj[0].parentTextFrames[0].visibleBounds[2];
            selObj_x2 = selObj[0].parentTextFrames[0].visibleBounds[3];
            app.select(selObj[0].parentTextFrames[0]); // Select text frame
        } else {
            // Iterate selection, get extremities
            selObj_y1 = selObj[0].visibleBounds[0];
            selObj_x1 = selObj[0].visibleBounds[1];
            selObj_y2 = selObj[0].visibleBounds[2];
            selObj_x2 = selObj[0].visibleBounds[3];
            for (var i = 1; i < selObj.length; i++) {
                selObj_y1 = Math.min(selObj[i].visibleBounds[0], selObj_y1);
                selObj_x1 = Math.min(selObj[i].visibleBounds[1], selObj_x1);
                selObj_y2 = Math.max(selObj[i].visibleBounds[2], selObj_y2);
                selObj_x2 = Math.max(selObj[i].visibleBounds[3], selObj_x2);
            }
        }
        W_obj = selObj_x2 - selObj_x1;
        H_obj = selObj_y2 - selObj_y1;
    } else {
    // Nothing is selected, we'll zoom to spread
    W_obj = spreadBounds[3] - spreadBounds[1];
    H_obj = spreadBounds[2] - spreadBounds[0];
}

// Get window dimensions
W_win = window.bounds[3] - window.bounds[1];
H_win = (window.bounds[2] - window.bounds[0]) * 1.33;

// Compute zoom percentage
zoom = Math.min(W_win / W_obj, H_win / H_obj);
zoom = Number(zoom * 10 * 4.2).toFixed(1); // Adjust to taste
zoom = Math.max(5, zoom); zoom = Math.min(zoom, 4000); // Fit in 5-4000% range

// Zoom to target
window.zoom(ZoomOptions.FIT_SPREAD);
try { window.zoomPercentage = zoom } catch (e) {
    // Avoid error 30481 'Data is out of range'
    try { app.menuActions.item("$ID/Fit Selection in Window").invoke() } catch (e) {};
}

// Restore initial selection
try { app.select(sel) } catch (e) {};
// END


function spreadBleedSize(spread) {
    var spreadPages = spread.pages; // Spread pages
    var firstPage = spreadPages.firstItem(); // First page of spread
    var lastPage = spreadPages.lastItem(); // Last page of spread
    var bleedMargins = {
        top: doc.documentPreferences.properties.documentBleedTopOffset,
        left: doc.documentPreferences.properties.documentBleedInsideOrLeftOffset,
        bottom: doc.documentPreferences.properties.documentBleedBottomOffset,
        right: doc.documentPreferences.properties.documentBleedOutsideOrRightOffset
    }
    if (spreadPages.length == 1) {
        // Spread is single page
        var spreadSize = firstPage.bounds;
        // Reverse left and right margins if left-hand page
        if (firstPage.side == PageSideOptions.LEFT_HAND) {
            bleedMargins.left = doc.documentPreferences.properties.documentBleedOutsideOrRightOffset;
            bleedMargins.right = doc.documentPreferences.properties.documentBleedInsideOrLeftOffset;
        }
    } else {
        // Spread is multiple pages
        var spreadSize = [firstPage.bounds[0], firstPage.bounds[1], lastPage.bounds[2], lastPage.bounds[3]];
        // Reverse left and right margins if left-hand page
        if (firstPage.side == PageSideOptions.LEFT_HAND) {
            bleedMargins.left = doc.documentPreferences.properties.documentBleedOutsideOrRightOffset;
        }
    }
    if (bleedMargins.top + bleedMargins.left + bleedMargins.bottom + bleedMargins.right != 0) {
        var m_y1 = spreadSize[0] - bleedMargins.top;
        var m_x1 = spreadSize[1] - bleedMargins.left;
        var m_y2 = spreadSize[2] + bleedMargins.bottom;
        var m_x2 = spreadSize[3] + bleedMargins.right;
        return [m_y1, m_x1, m_y2, m_x2];
    } else {
        return spreadSize;
    }
}