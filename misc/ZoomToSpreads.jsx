/*
	Zoom to spreads v2.0.0
	© February 2021, Paul Chiorean
	Zooms to the current spread (N = 1) or the first N spreads (N > 1).
*/

if (!(doc = app.activeDocument)) exit();
var window = app.activeWindow;
var page = app.activeWindow.activePage;
app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;
const TL = AnchorPoint.TOP_LEFT_ANCHOR, BR = AnchorPoint.BOTTOM_RIGHT_ANCHOR,
	CS_PBRD = +CoordinateSpaces.PASTEBOARD_COORDINATES;
const PW = 600; // Side panels width
const Z = 5.856; // Voodoo zoom coeficient
const N = 3; // Number of spreads to zoom to

var targetBounds = [];
targetBounds[0] = ((N == 1) ? page.parent : doc.spreads[0]).pages[0].resolve(TL, CS_PBRD)[0][1];
targetBounds[1] = ((N == 1) ? page.parent : doc.spreads[0]).pages[0].resolve(TL, CS_PBRD)[0][0];
targetBounds[2] = ((N == 1) ? page.parent : doc.spreads[0]).pages[-1].resolve(BR, CS_PBRD)[0][1];
targetBounds[3] = ((N == 1) ? page.parent : doc.spreads[0]).pages[-1].resolve(BR, CS_PBRD)[0][0];
for (var i = 0; i < doc.spreads.length && i < N && N > 1; i++) {
	targetBounds[0] = Math.min(targetBounds[0], doc.spreads[i].pages[0].resolve(TL, CS_PBRD)[0][1]);
	targetBounds[1] = Math.min(targetBounds[1], doc.spreads[i].pages[0].resolve(TL, CS_PBRD)[0][0]);
	targetBounds[2] = Math.max(targetBounds[2], doc.spreads[i].pages[-1].resolve(BR, CS_PBRD)[0][1]);
	targetBounds[3] = Math.max(targetBounds[3], doc.spreads[i].pages[-1].resolve(BR, CS_PBRD)[0][0]);
}
// Compute zoom percentage
var zoom = Math.min(
	(UnitValue(window.bounds[3] - window.bounds[1] - PW, "px").as('pt')) / (targetBounds[3] - targetBounds[1]),
	(UnitValue(window.bounds[2] - window.bounds[0], "px").as('pt')) / (targetBounds[2] - targetBounds[0])
);
zoom = Number(zoom * 10 * Z).toFixed(2);
zoom = Math.max(5, zoom), Math.min(zoom, 4000); // Keep in 5-4000% range
// Zoom to target
window.zoom(ZoomOptions.FIT_SPREAD);
window.zoomPercentage = zoom;
