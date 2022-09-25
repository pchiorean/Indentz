/*
	Zoom to selection 22.9.25
	(c) 2020-2022 Paul Chiorean (jpeg@basement.ro)

	Zooms to the selected objects. If no selection, it zooms to the current spread.

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

var items, item, zoom, i, n;
var window = app.activeWindow;
var page = window.activePage;
var selection = doc.selection;
var oldSelection = doc.selection;
var targetBounds = [];
var TL = AnchorPoint.TOP_LEFT_ANCHOR;
var BR = AnchorPoint.BOTTOM_RIGHT_ANCHOR;
var CS_PBRD = CoordinateSpaces.PASTEBOARD_COORDINATES;

// Customizable items
var Z = 5.478; // App maximized on generic 4K monitor
// var Z = 4.769; // App maximized on iMac Retina 5K
var HC = 650; // Horizontal compensation (side panels)
var VC = 150; // Vertical compensation (Application Bar, document tabs, Control Panel)
var N = 1; // Number of spreads to zoom to

app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;

if (selection.length > 0 && selection[0].constructor.name !== 'Guide') {
	// We have a selection, get bounds
	items = selection;
	item = items[0];
	if (Object.prototype.hasOwnProperty.call(item, 'parentTextFrames')) { // Inside a text frame
		item = item.parentTextFrames[0];
		app.select(item);
	} else if (item.constructor.name === 'Table' || item.constructor.name === 'Cell') {
		item = item.parent;
		while (item.constructor.name !== 'TextFrame') item = item.parent;
		app.select(item);
	}
	targetBounds = item.visibleBounds;
	for (i = 1, n = items.length; i < n; i++) { // Get selection's extremities
		targetBounds[0] = Math.min(items[i].visibleBounds[0], targetBounds[0]);
		targetBounds[1] = Math.min(items[i].visibleBounds[1], targetBounds[1]);
		targetBounds[2] = Math.max(items[i].visibleBounds[2], targetBounds[2]);
		targetBounds[3] = Math.max(items[i].visibleBounds[3], targetBounds[3]);
	}
} else {
	// Nothing is selected, get spreads' bounds
	targetBounds[0] = ((N === 1) ? page.parent : doc.spreads[0]).pages[0].resolve(TL, CS_PBRD)[0][1];
	targetBounds[1] = ((N === 1) ? page.parent : doc.spreads[0]).pages[0].resolve(TL, CS_PBRD)[0][0];
	targetBounds[2] = ((N === 1) ? page.parent : doc.spreads[0]).pages[-1].resolve(BR, CS_PBRD)[0][1];
	targetBounds[3] = ((N === 1) ? page.parent : doc.spreads[0]).pages[-1].resolve(BR, CS_PBRD)[0][0];
	for (i = 0; N > 1 && i < doc.spreads.length && i < N; i++) {
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
	app.select(null);
}

// Compute zoom percentage
zoom = Math.min(
	(window.bounds[3] - window.bounds[1] - HC) / UnitValue((targetBounds[3] - targetBounds[1]), 'pt').as('px'),
	(window.bounds[2] - window.bounds[0] + VC) / UnitValue((targetBounds[2] - targetBounds[0]), 'pt').as('px')
);
zoom = Number(zoom * 10 * Z).toFixed(2);
zoom = (Math.max(5, zoom), Math.min(zoom, 4000)); // Keep it in 5-4000% range

// Zoom to target
if (N > 1 && selection.length === 0)
	window.activePage = (doc.spreads.length > 2) ? doc.spreads[1].pages[0] : page;
window.zoom(ZoomOptions.FIT_SPREAD);
try { window.zoomPercentage = zoom; } catch (e) {
	// Avoid error 30481 'Data is out of range'
	try { app.menuActions.item('$ID/Fit Selection in Window').invoke(); } catch (_) {}
}

// Restore initial selection
app.select(oldSelection);
