/*
	Zoom to selection v1.7.1
	© June 2020, Paul Chiorean
	This script zooms to the selected objects or, if nothing is selected, to the current spread.
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;
var window = app.activeWindow;
var selPg = window.activePage;
var selSp = selPg.parent;
app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;

var sel = doc.selection; // Save selection
var selObj = sel, obj, objBounds, win, zoom;

if (selObj.length == 0 || selObj[0].constructor.name == "Guide") {
	// Nothing useful is selected, we'll zoom to spread
	window.zoom(ZoomOptions.FIT_SPREAD); window.zoomPercentage *= 0.9;
	exit();
}

if (selObj[0].hasOwnProperty("parentTextFrames")) { // Inside a text frame
	obj = selObj[0].parentTextFrames[0];
	objBounds = obj.visibleBounds; app.select(obj);
} else if (selObj[0].constructor.name == "Table") { // Inside a table
	obj = selObj[0].parent;
	objBounds = obj.visibleBounds; app.select(obj);
} else if (selObj[0].constructor.name == "Cell") { // Inside a table cell
	obj = selObj[0].parent.parent;
	if (obj.constructor.name == "Cell") obj = obj.parent.parent; // Cell in cell
	objBounds = obj.visibleBounds; app.select(obj);
} else {
	obj = selObj[0]; objBounds = obj.visibleBounds;
	for (var i = 1; i < selObj.length; i++) { // Iterate selection, get extremities
		// Top-left corner
		objBounds[0] = Math.min(selObj[i].visibleBounds[0], objBounds[0]);
		objBounds[1] = Math.min(selObj[i].visibleBounds[1], objBounds[1]);
		// Bottom-right corner
		objBounds[2] = Math.max(selObj[i].visibleBounds[2], objBounds[2]);
		objBounds[3] = Math.max(selObj[i].visibleBounds[3], objBounds[3]);
	}
}
obj = { // Get selection size
	width: objBounds[3] - objBounds[1],
	height: objBounds[2] - objBounds[0]
}
win = { // Get window size
	width: window.bounds[3] - window.bounds[1],
	height: (window.bounds[2] - window.bounds[0]) * 1.33
}

// Compute zoom percentage
zoom = Math.min(win.width / obj.width, win.height / obj.height);
zoom = Number(zoom * 10 * 4.2).toFixed(1); // Adjust to taste
zoom = Math.max(5, zoom), Math.min(zoom, 4000); // Fit in 5-4000% range

// Zoom to target
window.zoom(ZoomOptions.FIT_SPREAD);
try { window.zoomPercentage = zoom } catch (_) {
	// Avoid error 30481 'Data is out of range'
	try { app.menuActions.item("$ID/Fit Selection in Window").invoke() } catch (_) {};
}

try { app.select(sel) } catch (_) {}; // Restore initial selection