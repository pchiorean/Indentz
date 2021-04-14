/*
	Page size from filename v2.0.2 (2021-03-12)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Sets every page size and margins according to the filename.
	It looks for patterns like 000x000 (page size) or 000x000_000x000 (page size_page margins).

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
var visLayerName = FindLayer([
	"visible area",
	"visible", "Visible",
	"vizibil", "Vizibil",
	"vis. area", "Vis. area"
]);
var dieLayerName = FindLayer([
	"dielines",
	"cut lines", "Cut lines", "cut", "Cut", "CUT",
	"decoupe", "Decoupe",
	"die", "Die", "die cut", "Die Cut", "diecut", "Diecut",
	"stanz", "Stanz", "stanze", "Stanze",
	"stanzform", "Stanzform"
]);
var visSwatchName = "Visible area";

app.doScript(main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "Set page dimensions");


function main() {
	app.scriptPreferences.measurementUnit = MeasurementUnits.MILLIMETERS;
	doc.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.MILLIMETERS;
	doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.MILLIMETERS;
	doc.adjustLayoutPreferences.enableAdjustLayout = false;
	doc.adjustLayoutPreferences.enableAutoAdjustMargins = false;
	app.generalPreferences.objectsMoveWithPage = false;
	var pgSize, mgSize, margins, isSpread = false;

	// Look for '_000[.0] [mm] x 000[.0] [mm]' pairs. If none are found, try to match common 'A' sizes
	var dName = doc.name.substr(0, doc.name.lastIndexOf("."));
	var pairsRE = /[_-]\s*\d+([.,]\d+)?\s*([cm]m)?\s*x\s*\d+([.,]\d+)?\s*([cm]m)?\s*(?!x)\s*(?!\d)/ig;
	var dimensions = dName.match(pairsRE);
	// 1. [_-] -- '_' or '-' separator between pairs
	// 2. \d+([.,]\d+)?([cm]m)? -- group 1: digits, optional decimals, optional cm/mm
	// 3. x -- 'x' separator between groups
	// 4. \d+([.,]\d+)?(cm|mm)? -- group 2
	// 5. (?!x)(?!\d) -- discard if more groups (to avoid 000x00x00 et al)
	// Bleed: look for '_00 [mm]' after '0 [mm]'
	var bleed = /\d\s*(?:[cm]m)?[_+](\d{1,2})\s*(?:[cm]m)/i.exec(dName);
	// 1. \d(?:[cm]m)? -- 1 digit followed by optional mm/cm (non-capturing group)
	// 2. [_+] -- '_' or '+' separator
	// 3. (\d{1,2}) -- 1 or 2 digits (capturing group #1)
	// 4. (?:[cm]m) -- mandatory mm/cm (non-capturing group)
	if (dimensions == null) {
		var ISO216SubsetRE = /A[1-7]\b/;
		var dimensions = dName.match(ISO216SubsetRE);
		if (dimensions == null) exit();
		switch (dimensions[0]) {
			case "A1": pgSize = { width: 594, height: 841 }; break;
			case "A2": pgSize = { width: 420, height: 594 }; break;
			case "A3": pgSize = { width: 297, height: 420 }; break;
			case "A4": pgSize = { width: 210, height: 297 }; break;
			case "A5": pgSize = { width: 148, height: 210 }; break;
			case "A6": pgSize = { width: 105, height: 148 }; break;
			case "A7": pgSize = { width:  74, height: 105 }; break;
		}
	} else {
		// Sanitize dimensions array
		for (var i = 0; i < dimensions.length; i++) {
			dimensions[i] = dimensions[i].replace(/[_-]/g, ""); // Clean up underscores
			dimensions[i] = dimensions[i].replace(/\s/g, ""); // Clean up whitespace
			dimensions[i] = dimensions[i].replace(/[cm]m/g, ""); // Clean up cm/mm
			dimensions[i] = dimensions[i].replace(/,/g, "."); // Replace commas
		}
		// Check number of pairs and set page size and, if defined, page margins
		var firstPair = dimensions[0].split(/x/ig);
		firstPair[0] = Number(firstPair[0]), firstPair[1] = Number(firstPair[1]);
		pgSize = { width: firstPair[0], height: firstPair[1] }; // First pair
		// If two pairs (page size & page margins), page size is the largest
		if (dimensions.length == 2) { // Second pair
			var secondPair = dimensions[1].split(/x/ig);
			secondPair[0] = Number(secondPair[0]), secondPair[1] = Number(secondPair[1]);
			if (pgSize.width >= secondPair[0] && pgSize.height >= secondPair[1]) {
				mgSize = { width: secondPair[0], height: secondPair[1] }
			} else if (pgSize.width <= secondPair[0] && pgSize.height <= secondPair[1]) {
				mgSize = pgSize;
				pgSize = { width: secondPair[0], height: secondPair[1] }
			} else {
				alert("Dimensions are wrong."); exit();
			}
			margins = {
				top: (pgSize.height - mgSize.height) / 2,
				left: (pgSize.width - mgSize.width) / 2,
				bottom: (pgSize.height - mgSize.height) / 2,
				right: (pgSize.width - mgSize.width) / 2 }
		}
	}
	// Resize pages
	for (var i = 0; i < doc.pages.length; i++) {
		var page = doc.pages[i];
		if (page.parent.pages.length > 1) { isSpread = true; continue } // Skip multipage spreads
		page.layoutRule = LayoutRuleOptions.OFF;
		try {
			page.resize(CoordinateSpaces.INNER_COORDINATES,
				AnchorPoint.CENTER_ANCHOR,
				ResizeMethods.REPLACING_CURRENT_DIMENSIONS_WITH,
				[ UnitValue(pgSize.width, "mm").as('pt'), UnitValue(pgSize.height, "mm").as('pt') ]);
		} catch (_) {
			page.marginPreferences.properties = { top: 0, left: 0, bottom: 0, right: 0 }
			page.resize(CoordinateSpaces.INNER_COORDINATES,
				AnchorPoint.CENTER_ANCHOR,
				ResizeMethods.REPLACING_CURRENT_DIMENSIONS_WITH,
				[ UnitValue(pgSize.width, "mm").as('pt'), UnitValue(pgSize.height, "mm").as('pt') ]);
		}
		if (!!margins) {
			page.marginPreferences.properties = margins;
			page.marginPreferences.columnCount = 1;
			page.marginPreferences.columnGutter = 0;
			MarkVisibleArea(page);
		}
	}
	// Set document size and bleed
	if (!isSpread) {
		doc.documentPreferences.pageWidth = pgSize.width;
		doc.documentPreferences.pageHeight = pgSize.height }
	if (!!bleed) {
		doc.documentPreferences.documentBleedUniformSize = true;
		doc.documentPreferences.documentBleedTopOffset = bleed[1] }
	// app.activeWindow.zoom(ZoomOptions.FIT_SPREAD); app.activeWindow.zoomPercentage *= 0.9;
}


function MarkVisibleArea(page) { // Draw a 'visible area' frame
	if (!doc.colors.itemByName(visSwatchName).isValid)
		doc.colors.add({
			name: visSwatchName,
			model: ColorModel.PROCESS,
			space: ColorSpace.CMYK,
			colorValue: [ 0, 100, 0, 0 ] });
	var visLayer = doc.layers.item(visLayerName);
	var dieLayer = doc.layers.item(dieLayerName);
	if (visLayer.isValid) {
		visLayer.properties = {
			layerColor: UIColors.YELLOW,
			visible: true, locked: false }
		if (dieLayer.isValid) visLayer.move(LocationOptions.before, dieLayer);
	} else {
		visLayer = doc.layers.add({ name: visLayerName,
			layerColor: UIColors.YELLOW,
			visible: true, locked: false });
		if (dieLayer.isValid) {
			visLayer.move(LocationOptions.before, dieLayer);
		} else visLayer.move(LocationOptions.AT_BEGINNING);
	}
	var frame, frames = page.rectangles.everyItem().getElements();
	while (frame = frames.shift())
		if (frame.label == "visible area" || frame.name == "<visible area>" &&
			frame.itemLayer == visLayer &&
			frame.locked == false) frame.remove();
	var margins = page.marginPreferences;
	var frame = page.rectangles.add({
		name: "<visible area>", label: "visible area",
		contentType: ContentType.UNASSIGNED,
		fillColor: "None", strokeColor: visSwatchName,
		strokeWeight: "0.75pt",
		strokeAlignment: StrokeAlignment.INSIDE_ALIGNMENT,
		strokeType: "$ID/Canned Dashed 3x2",
		overprintStroke: false,
		itemLayer: visLayerName,
		geometricBounds: [
			page.bounds[0] + margins.top,
			page.side == PageSideOptions.LEFT_HAND ?
				page.bounds[1] + margins.right : page.bounds[1] + margins.left,
			page.bounds[2] - margins.bottom,
			page.side == PageSideOptions.LEFT_HAND ?
				page.bounds[3] - margins.left : page.bounds[3] - margins.right
		]
	});
	visLayer.locked = true;
}

function FindLayer(names) { // Find first valid layer from a list of names
	for (var i = 0; i < names.length; i++) {
		var layer = doc.layers.item(names[i]);
		if (layer.isValid) return names[i];
	}
	return names[0]; // If nothing found, return first name
}
