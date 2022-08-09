/*
	Zoom to spreads 22.8.9
	(c) 2021-2022 Paul Chiorean (jpeg@basement.ro)

	Zooms to the current spread (if N = 1) or the first N spreads (if N > 1).

	Released under MIT License:
	https://choosealicense.com/licenses/mit/

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/

if (!(doc = app.activeDocument)) exit();

var zoom;
var window = app.activeWindow;
var page = window.activePage;
var targetBounds = [];
var TL = AnchorPoint.TOP_LEFT_ANCHOR;
var BR = AnchorPoint.BOTTOM_RIGHT_ANCHOR;
var CS_PBRD = CoordinateSpaces.PASTEBOARD_COORDINATES;
var SP = 600;  // Side panels width
var CP = 60;   // Control panel height
var Z = 5.469; // Generic 4K monitor: 5.469; iMac Retina 5K: 5.856
var N = 3;     // Number of spreads to zoom to
app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;

targetBounds[0] = ((N === 1) ? page.parent : doc.spreads[0]).pages[0].resolve(TL, CS_PBRD)[0][1];
targetBounds[1] = ((N === 1) ? page.parent : doc.spreads[0]).pages[0].resolve(TL, CS_PBRD)[0][0];
targetBounds[2] = ((N === 1) ? page.parent : doc.spreads[0]).pages[-1].resolve(BR, CS_PBRD)[0][1];
targetBounds[3] = ((N === 1) ? page.parent : doc.spreads[0]).pages[-1].resolve(BR, CS_PBRD)[0][0];
for (var i = 0; N > 1 && i < doc.spreads.length && i < N; i++) {
	targetBounds[0] = Math.min(targetBounds[0], doc.spreads[i].pages[0].resolve(TL, CS_PBRD)[0][1]);
	targetBounds[1] = Math.min(targetBounds[1], doc.spreads[i].pages[0].resolve(TL, CS_PBRD)[0][0]);
	targetBounds[2] = Math.max(targetBounds[2], doc.spreads[i].pages[-1].resolve(BR, CS_PBRD)[0][1]);
	targetBounds[3] = Math.max(targetBounds[3], doc.spreads[i].pages[-1].resolve(BR, CS_PBRD)[0][0]);
}
if (app.properties.activeWindow.screenMode === ScreenModeOptions.PREVIEW_OFF) {
	targetBounds[0] -= doc.documentPreferences.properties.documentBleedTopOffset;
	targetBounds[1] -= doc.documentPreferences.properties.documentBleedInsideOrLeftOffset;
	targetBounds[2] += doc.documentPreferences.properties.documentBleedBottomOffset;
	targetBounds[3] += doc.documentPreferences.properties.documentBleedOutsideOrRightOffset;
}
// Compute zoom percentage
zoom = Math.min(
	(UnitValue(window.bounds[3] - window.bounds[1] - SP, 'px').as('pt')) / (targetBounds[3] - targetBounds[1]),
	(UnitValue(window.bounds[2] - window.bounds[0] + CP, 'px').as('pt')) / (targetBounds[2] - targetBounds[0])
);
zoom = Number(zoom * 10 * Z).toFixed(2);
zoom = (Math.max(5, zoom), Math.min(zoom, 4000)); // Keep it in 5-4000% range
// Zoom to target
window.activePage = (doc.spreads.length > 2) ? doc.spreads[1].pages[0] : doc.spreads[0].pages[0];
window.zoom(ZoomOptions.FIT_SPREAD);
window.zoomPercentage = zoom;
