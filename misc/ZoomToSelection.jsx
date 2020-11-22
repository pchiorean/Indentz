/*
	Zoom to selection v1.8.4
	© November 2020, Paul Chiorean
	Zooms to the selected objects or, if nothing is selected, to the current spread.
*/

if (!(doc = app.activeDocument)) exit();
var window = app.activeWindow;
app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;

var sel = doc.selection; // Save selection
if (sel.length == 0 || sel[0].constructor.name == "Guide") {
	// Nothing useful is selected, we'll zoom to spread
	window.zoom(ZoomOptions.FIT_SPREAD); window.zoomPercentage *= 0.9;
	exit();
}
// Get selection dimensions
var selObj = sel, obj = selObj[0];
if (obj.hasOwnProperty("parentTextFrames")) { // Inside a text frame
	obj = obj.parentTextFrames[0]; app.select(obj);
} else if (obj.constructor.name == "Table" || obj.constructor.name == "Cell") {
	obj = obj.parent;
	while (obj.constructor.name != "TextFrame") obj = obj.parent; app.select(obj);
}
var size = obj.visibleBounds;
for (var i = 1; i < selObj.length; i++) { // Iterate selection, get extremities
	size[0] = Math.min(selObj[i].visibleBounds[0], size[0]);
	size[1] = Math.min(selObj[i].visibleBounds[1], size[1]);
	size[2] = Math.max(selObj[i].visibleBounds[2], size[2]);
	size[3] = Math.max(selObj[i].visibleBounds[3], size[3]);
}
var obj = { width: size[3] - size[1], height: size[2] - size[0] }; // Get selection size
var win = { // Get window size
	width: window.bounds[3] - window.bounds[1],
	height: (window.bounds[2] - window.bounds[0]) * 1.33
}
// Compute zoom percentage
var zoom = Math.min(win.width / obj.width, win.height / obj.height);
zoom = Number(zoom * 10 * 4.2).toFixed(1); // Adjust to taste
zoom = Math.max(5, zoom), Math.min(zoom, 4000); // Fit in 5-4000% range
// Zoom to target
window.zoom(ZoomOptions.FIT_SPREAD);
try { window.zoomPercentage = zoom } catch (_) {
	// Avoid error 30481 'Data is out of range'
	try { app.menuActions.item("$ID/Fit Selection in Window").invoke() } catch (_) {};
}
// Restore initial selection
try { app.select(sel) } catch (_) {};