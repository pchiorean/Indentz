/*
	Zoom to selection v1.6.0
	© April 2020, Paul Chiorean
	This script zooms to the selected objects or, if nothing is selected, to the current spread.
*/

var doc = app.activeDocument;
var window = app.activeWindow;
var selPage = window.activePage;
var selSpread = selPage.parent;
app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;

var sel = doc.selection; // Save selection
var selObj = sel;
var selObj_y1, selObj_x1, selObj_y2, selObj_x2;
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
		} else if (selObj[0].constructor.name == "Table") {
			// We are inside a table, get parent text frame bounds
			selObj_y1 = selObj[0].parent.visibleBounds[0];
			selObj_x1 = selObj[0].parent.visibleBounds[1];
			selObj_y2 = selObj[0].parent.visibleBounds[2];
			selObj_x2 = selObj[0].parent.visibleBounds[3];
			app.select(selObj[0].parent); // Select parent text frame
		} else if (selObj[0].constructor.name == "Cell") {
			// We are inside a table cell, get parent text frame bounds
			selObj_y1 = selObj[0].parent.parent.visibleBounds[0];
			selObj_x1 = selObj[0].parent.parent.visibleBounds[1];
			selObj_y2 = selObj[0].parent.parent.visibleBounds[2];
			selObj_x2 = selObj[0].parent.parent.visibleBounds[3];
			app.select(selObj[0].parent.parent); // Select parent text frame
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
		// Get selection size
		W_obj = selObj_x2 - selObj_x1;
		H_obj = selObj_y2 - selObj_y1;
		// Get window size
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
		// Restore initial selection
		try { app.select(sel) } catch (e) {};
}
	} else {
	// Nothing is selected, we'll zoom to spread
	window.zoom(ZoomOptions.FIT_SPREAD);
	window.zoomPercentage -= 2.5;
}