/*
	Page size from file name 24.12.3
	(c) 2020-2024 Paul Chiorean <jpeg@basement.ro>

	Sets every page size and margins according to the file name.
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

// @includepath '.;./lib;../lib;../../lib';
// @include 'isInArray.jsxinc';

app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, 'Set page dimensions');

function main() {
	var dimensions, firstPair, secondPair, newPgSize, newMgSize, newBleed, newMargins, page, i, n;
	var visLayerName = getLayer([ '.visible area', 'rahmen', 'sicht*', '*visib*', '*vizib*', 'vis*area' ]);
	var dieLayerName = getLayer([ '+dielines', 'dielines', 'cut', 'cut*line*', 'decoupe', 'die', 'die*cut', 'stanz*' ]);
	var visFrame = {
		swatchName: 'Visible area',
		swatchModel: ColorModel.SPOT,
		swatchSpace: ColorSpace.RGB,
		swatchValue: [ 255, 180, 0 ],
		strokeWeightS: '0.75 pt',
		strokeWeightL: '1.00 pt',
		strokeType: '$ID/Canned Dashed 3x2'
	};
	var visAreaRE = /^<?(visible|safe) area>?$/i;
	// pairsRE: match '_000[.0] [mm] x 000[.0] [mm]' dimension pairs
	// 1. [_-]                  // '_' or '-' separator between pairs
	// 2. \d+([.,]\d+)?([cm]m)? // group 1: digits, optional decimals, optional cm/mm
	// 3. x                     // 'x' separator between groups
	// 4. \d+([.,]\d+)?(cm|mm)? // group 2
	// 5. (?!x)(?!\d)           // discard if more groups (to avoid 000x000x000 et al)
	var pairsRE = /[ _-]\s*\d+([.,]\d+)?\s*([cm]m)?\s*x\s*\d+([.,]\d+)?\s*([cm]m)?\s*(?!x)\s*(?!\d)/ig;
	// bleedRE: match '_00 [mm]' after '0 [mm]'
	// 1. \d(?:[cm]m)?          // 1 digit followed by optional mm/cm (non-capturing group)
	// 2. [_+]                  // '_' or '+' separator
	// 3. (\d{1,2})             // 1 or 2 digits (capturing group #1)
	// 4. (?:[cm]m)             // mandatory mm/cm (non-capturing group)
	var bleedRE = /\d\s*(?:[cm]m)?[_+](\d{1,2})\s*(?:[cm]m)/i;
	var ISO216SubsetRE = /A[1-7]\b/; // Common 'A' sizes (https://en.wikipedia.org/wiki/ISO_216)
	var baseName = (/\./g.test(doc.name) && doc.name.slice(0, doc.name.lastIndexOf('.'))) || doc.name;
	// isCombo: documents with multiple dimensions (000x000+000x000)
	var isCombo = /[ _-]\s*\d+([.,]\d+)?\s*([cm]m)?\s*x\s*\d+([.,]\d+)?\s*([cm]m)?\s*\+\s*\d+([.,]\d+)?\s*([cm]m)?\s*x\s*\d+([.,]\d+)?\s*([cm]m)?\s*(?!x)\s*(?!\d)/ig.test(decodeURI(doc.name));
	var isSpread = false; // Multipage spreads
	var old = {
		horizontalMeasurementUnits: doc.viewPreferences.horizontalMeasurementUnits,
		verticalMeasurementUnits:   doc.viewPreferences.verticalMeasurementUnits,
		enableAdjustLayout:         doc.adjustLayoutPreferences.enableAdjustLayout,
		enableAutoAdjustMargins:    doc.adjustLayoutPreferences.enableAutoAdjustMargins,
		objectsMoveWithPage:        app.generalPreferences.objectsMoveWithPage
	};

	app.scriptPreferences.measurementUnit = MeasurementUnits.MILLIMETERS;
	doc.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.MILLIMETERS;
	doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.MILLIMETERS;
	doc.adjustLayoutPreferences.enableAdjustLayout = false;
	doc.adjustLayoutPreferences.enableAutoAdjustMargins = false;
	app.generalPreferences.objectsMoveWithPage = false;

	// Get dimensions from the filename, using `pairsRE` to match dimension pairs;
	// if no pairs are found, try to match common 'A' sizes
	dimensions = baseName.match(pairsRE);
	if (dimensions == null) { // No dimension pairs found
		dimensions = baseName.match(ISO216SubsetRE);
		if (dimensions == null) cleanupAndExit();
		switch (dimensions[0]) {
			case 'A1': newPgSize = { width: 594, height: 841 }; break;
			case 'A2': newPgSize = { width: 420, height: 594 }; break;
			case 'A3': newPgSize = { width: 297, height: 420 }; break;
			case 'A4': newPgSize = { width: 210, height: 297 }; break;
			case 'A5': newPgSize = { width: 148, height: 210 }; break;
			case 'A6': newPgSize = { width: 105, height: 148 }; break;
			case 'A7': newPgSize = { width:  74, height: 105 }; break;
		}
	} else if (isCombo) { // Skip documents with multiple dimensions (000x000+000x000)
		cleanupAndExit();
	} else {
		// Clean-up values
		for (i = 0, n = dimensions.length; i < n; i++) {
			dimensions[i] = dimensions[i].replace(/[ _-]/g, ''); // Remove separators
			dimensions[i] = dimensions[i].replace(/\s/g, '');    // Remove whitespace
			dimensions[i] = dimensions[i].replace(/[cm]m/g, ''); // Remove cm/mm
			dimensions[i] = dimensions[i].replace(/,/g, '.');    // Replace commas with dots
		}

		// Get page size and margins: if two pairs are found, the larger is the page size
		firstPair = dimensions[0].split(/x/ig);
		firstPair[0] = Number(firstPair[0]);
		firstPair[1] = Number(firstPair[1]);
		newPgSize = { width: firstPair[0], height: firstPair[1] };
		newMgSize = { width: 0, height: 0 };
		if (dimensions.length > 1) {
			secondPair = dimensions[1].split(/x/ig);
			secondPair[0] = Number(secondPair[0]);
			secondPair[1] = Number(secondPair[1]);
			if (firstPair[0] >= secondPair[0] && firstPair[1] >= secondPair[1]) {
				newMgSize = { width: secondPair[0], height: secondPair[1] };
			} else if (newPgSize.width <= secondPair[0] && newPgSize.height <= secondPair[1]) {
				newPgSize = { width: secondPair[0], height: secondPair[1] };
				newMgSize = { width: firstPair[0], height: firstPair[1] };
			} else {
				alert('Can\'t set page size, please check the values.'); cleanupAndExit();
			}
		}
		// -- Page size: minimum 1 pt, maximum 15552 pt
		if (UnitValue(newPgSize.width + newPgSize.height, 'mm').as('pt') < 2
				|| UnitValue(newPgSize.width + newPgSize.height, 'mm').as('pt') > 15552 * 2) {
			alert('Page size is out of bounds. The values must be between '
				+ UnitValue('1 pt').as('mm').toFixed(2).replace(/\.?0+$/, '') + ' and '
				+ UnitValue('15552 pt').as('mm').toFixed(2).replace(/\.?0+$/, '') + ' mm.');
			cleanupAndExit();
		}
		// -- Margins: minimum 0 pt, maximum 10000 pt
		if (UnitValue(newMgSize.width + newMgSize.height, 'mm').as('pt') > 10000 * 2) {
			alert('Margins are out of bounds. The values must be between 0 and '
				+ UnitValue('10000 pt').as('mm').toFixed(2).replace(/\.?0+$/, '') + ' mm.');
			cleanupAndExit();
		}
		if (newMgSize.width + newMgSize.height > 0) {
			newMargins = {
				top:    (newPgSize.height - newMgSize.height) / 2,
				left:   (newPgSize.width  - newMgSize.width)  / 2,
				bottom: (newPgSize.height - newMgSize.height) / 2,
				right:  (newPgSize.width  - newMgSize.width)  / 2
			};
		}
	}

	// Resize pages and set margins
	for (i = 0, n = doc.pages.length; i < n; i++) {
		page = doc.pages[i];
		if (page.parent.pages.length > 1) { isSpread = true; continue; } // Skip multipage spreads
		page.layoutRule = LayoutRuleOptions.OFF;
		try {
			page.resize(
				CoordinateSpaces.INNER_COORDINATES,
				AnchorPoint.CENTER_ANCHOR,
				ResizeMethods.REPLACING_CURRENT_DIMENSIONS_WITH,
				[ UnitValue(newPgSize.width, 'mm').as('pt'), UnitValue(newPgSize.height, 'mm').as('pt') ]
			);
		} catch (e) {
			page.marginPreferences.properties = { top: 0, left: 0, bottom: 0, right: 0 };
			page.resize(
				CoordinateSpaces.INNER_COORDINATES,
				AnchorPoint.CENTER_ANCHOR,
				ResizeMethods.REPLACING_CURRENT_DIMENSIONS_WITH,
				[ UnitValue(newPgSize.width, 'mm').as('pt'), UnitValue(newPgSize.height, 'mm').as('pt') ]
			);
		}
		if (newMargins) {
			page.marginPreferences.properties = newMargins;
			page.marginPreferences.columnCount = 1;
			page.marginPreferences.columnGutter = 0;
			markVisibleArea();
		}
	}

	// Set document size and bleed
	if (!isSpread) {
		try {
			doc.documentPreferences.pageWidth  = newPgSize.width;
			doc.documentPreferences.pageHeight = newPgSize.height;
		} catch (e) {}
	}
	newBleed = bleedRE.exec(baseName);
	if (newBleed) {
		doc.documentPreferences.documentBleedUniformSize = true;
		doc.documentPreferences.documentBleedTopOffset = newBleed[1];
	}
	cleanupAndExit();

	// Find first valid layer from a list of names, else return first name
	function getLayer(names) {
		for (var i = 0; i < doc.layers.length; i++)
			if (isInArray(doc.layers[i].name, names)) return doc.layers[i].name;
		return names[0];
	}

	function markVisibleArea() {
		var visLayer, dieLayer, oldFrame, frames;
		var isLargePage = ((page.bounds[3] - page.bounds[1]) > 666 || (page.bounds[2] - page.bounds[0]) > 666);
		var mgs = page.marginPreferences;
		if (mgs.top + mgs.left + mgs.bottom + mgs.right === 0) return;

		// Make swatch
		if (!doc.colors.itemByName(visFrame.swatchName).isValid) {
			doc.colors.add({
				name:       visFrame.swatchName,
				model:      visFrame.swatchModel,
				space:      visFrame.swatchSpace,
				colorValue: visFrame.swatchValue
			});
		}

		// Make layer
		visLayer = doc.layers.item(visLayerName);
		dieLayer = doc.layers.item(dieLayerName);
		if (visLayer.isValid) {
			visLayer.properties = {
				layerColor: UIColors.YELLOW,
				visible: true,
				locked: false
			};
			if (dieLayer.isValid) visLayer.move(LocationOptions.before, dieLayer);
		} else {
			visLayer = doc.layers.add({
				name: visLayerName,
				layerColor: UIColors.YELLOW,
				visible: true,
				locked: false
			});
			if (dieLayer.isValid) visLayer.move(LocationOptions.before, dieLayer);
			else visLayer.move(LocationOptions.AT_BEGINNING);
		}

		// Remove old frames
		frames = page.rectangles.everyItem().getElements();
		while ((oldFrame = frames.shift())) {
			if (visAreaRE.test(oldFrame.label) || visAreaRE.test(oldFrame.name)) {
				oldFrame.locked = false;
				oldFrame.remove();
			}
		}

		// Add frames
		frame = page.rectangles.add({
			name: '<visible area>',
			label: 'visible area',
			contentType: ContentType.UNASSIGNED,
			fillColor: 'None',
			strokeColor: visFrame.swatchName,
			strokeTint: 100,
			strokeWeight: isLargePage ? visFrame.strokeWeightL : visFrame.strokeWeightS,
			strokeAlignment: StrokeAlignment.INSIDE_ALIGNMENT,
			strokeType: visFrame.strokeType,
			bottomLeftCornerOption:  CornerOptions.NONE,
			bottomRightCornerOption: CornerOptions.NONE,
			topLeftCornerOption:     CornerOptions.NONE,
			topRightCornerOption:    CornerOptions.NONE,
			geometricBounds: [
				page.bounds[0] + mgs.top,
				(page.side === PageSideOptions.LEFT_HAND)
					? page.bounds[1] + mgs.right
					: page.bounds[1] + mgs.left,
				page.bounds[2] - mgs.bottom,
				(page.side === PageSideOptions.LEFT_HAND)
					? page.bounds[3] - mgs.left
					: page.bounds[3] - mgs.right
			],
			itemLayer: visLayerName
		});
		try { frame.overprintStroke = false; } catch (e) {}
		visLayer.locked = true;
	}

	function cleanupAndExit() {
		doc.viewPreferences.horizontalMeasurementUnits      = old.horizontalMeasurementUnits;
		doc.viewPreferences.verticalMeasurementUnits        = old.verticalMeasurementUnits;
		doc.adjustLayoutPreferences.enableAdjustLayout      = old.enableAdjustLayout;
		doc.adjustLayoutPreferences.enableAutoAdjustMargins = old.enableAutoAdjustMargins;
		app.generalPreferences.objectsMoveWithPage          = old.objectsMoveWithPage;
		exit();
	}
}
