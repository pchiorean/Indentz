/*
	Generate EAN Codes 23.10.27
	(c) 2020-2023 Paul Chiorean <jpeg@basement.ro>

	Inserts EAN codes into the selected frames or in a new document.

	The code that generates the EAN code (`BarCode()`) was borrowed
	from 'EAN Barcode Generator' by Konstantin Smorodsky.
	https://github.com/smorodsky/ean-barcode-generator

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

// @includepath '.;./lib;../lib';
// @include 'progressBar.jsxinc';

app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, 'EAN code');

function main() {
	var doc, page, ui, rows, items, codeFrame, codeLayer, txtLayer, target, SF, oldCenter, newCenter, progressBar;
	var barcode = [];
	var barcodes = [];
	var selection = [];
	var codeLayerName = 'codes';
	var txtLayerName = 'text & logos';
	if (app.layoutWindows.length > 0) selection = app.selection;
	rows = Math.min(Math.max(6, selection.length), 20); // Keep list rows between 6 and 20

	app.scriptPreferences.measurementUnit = MeasurementUnits.MILLIMETERS;
	app.scriptPreferences.enableRedraw = false;

	ui = new Window('dialog { alignChildren: [ "left", "fill" ], orientation: "row", text: "Generate EAN Codes" }');
	ui.main = ui.add('panel { alignChildren: [ "fill", "center" ], orientation: "column" }');
		ui.legend = ui.main.add('group { orientation: "column", alignChildren: [ "left", "top" ], spacing: 0 }');
		if (selection.length > 0) {
				ui.legend.add('statictext { text: "This script inserts EAN-8 or EAN-13" }');
				ui.legend.add('statictext { text: "barcodes into the selected frames." }');
			} else {
				ui.legend.add('statictext { text: "This script creates EAN-8 or EAN-13" }');
				ui.legend.add('statictext { text: "barcodes in a new document." }');
			}
			ui.legend.add('statictext');
			ui.legend.add('statictext { text: "Enter 8 or 13 digits for codes and" }');
			ui.legend.add('statictext { text: "2 or 5 digits for EAN-2/5 addons" }');
			ui.legend.add('statictext { text: "(separated by a space or a hyphen):" }');
		ui.code = ui.main.add('edittext { active: true, properties: { multiline: true, scrolling: true, enterKeySignalsOnChange: true } }');
			ui.code.characters = 22;
			ui.code.preferredSize.height = rows * 15 + 2;
			ui.code.active = true;
		ui.options = ui.main.add('group { orientation: "column", alignChildren: [ "left", "top" ], margins: [ 0, 5, 0, 0 ], spacing: 5 }');
			ui.rightMark = ui.options.add('checkbox { text: "Quiet Zone indicator (>)" }');
			ui.rightMark.helpTip = 'Add a \'>\' on the right to mark Quiet Zones that are\nnecessary for barcode scanners to work properly';
			ui.rightMark.value = true;
			ui.extOnTop = ui.options.add('checkbox { text: "Put addon text on top" }');
			ui.extOnTop.value = false;
	ui.actions = ui.add('group { alignChildren: [ "fill", "top" ], orientation: "column" }');
		ui.ok = ui.actions.add('button { text: "OK" }');
		ui.actions.add('button { text: "Cancel" }');

	ui.code.onChanging = function () {
		this.text = this.text.replace(/[,;\t\n\r]/g, '\n');
	};
	ui.ok.onClick = function () {
		var i, j, buffer, accumulator, chr;
		buffer = ui.code.text
			.replace(/^\s+|\s+$/g, '') // Trim whitespaces at both ends
			.split(/ *[,;\t\n\r] */);  // Split into multiple candidates
		barcodes = [];
		for (i = 0; i < buffer.length; i++) {
			try {
				barcode = [];
				accumulator = '';
				for (j = 0; j < buffer[i].length; j++) {
					chr = buffer[i][j];
					if (chr >= '0' && chr <= '9') { accumulator += chr; continue; }
					if (chr === 'x' || chr === 'X') {
						if (j !== 12 || barcode.length !== 0) throw Error(0);
						accumulator += 'X';
						continue;
					}
					if (accumulator) { barcode.push(accumulator); accumulator = ''; }
				}
				barcode.push(accumulator);
				if (barcode.length > 2) throw Error(0);
				if (barcode[0].length !== 8 && barcode[0].length !== 12 && barcode[0].length !== 13) throw Error(0);
				if (barcode.length === 2 && barcode[1].length !== 2 && barcode[1].length !== 5) throw Error(0);
				barcodes.push(barcode); // [ [ code1, ext1 ], [ code2, ext2 ], ... ]
			} catch (e) {
				alert('Invalid barcode: ' + buffer[i] + '\nEnter 8 or 13 digits for the code and 2 or 5 digits '
					+ 'for the add-on, separated by a space or a hyphen.');
				ui.code.active = true;
				return;
			}
		}
		ui.close();
	};
	ui.onShow = function () {
		ui.frameLocation = [
			(app.activeWindow.bounds[1] + app.activeWindow.bounds[3] - ui.frameSize.width) / 2,
			(app.activeWindow.bounds[0] + app.activeWindow.bounds[2] - ui.frameSize.height) / 2
		];
	};
	if (ui.show() === 2) exit();

	if (barcodes.length === 0) exit();

	// Embed the code in the selected objects, else make a new doc
	if (app.documents.length > 0 && selection.length > 0) {
		doc = app.activeDocument;
		items = selection;

		if (items.length > 2) progressBar = new ProgressBar('Generating EAN Codes', items.length);

		for (i = 0; i < items.length; i++) {
			if (progressBar) progressBar.update();
			target = items[i];

			// If one barcode, use it for all selected items, else insert sequentially
			if (barcodes[i] || barcodes.length === 1)
				codeFrame = makeBarcode(barcodes.length === 1 ? barcodes[0] : barcodes[i]);
			else continue;

			codeFrame.fillColor = 'None';

			codeFrame.absoluteRotationAngle = target.absoluteRotationAngle;
			switch (target.absoluteRotationAngle) {
				case 90:
					SF = (target.geometricBounds[2] - target.geometricBounds[0])
						/ (codeFrame.geometricBounds[2] - codeFrame.geometricBounds[0]);
					doc.align(codeFrame, AlignOptions.RIGHT_EDGES, AlignDistributeBounds.KEY_OBJECT, target);
					doc.align(codeFrame, AlignOptions.VERTICAL_CENTERS, AlignDistributeBounds.KEY_OBJECT, target);
					break;
				case -90:
					SF = (target.geometricBounds[2] - target.geometricBounds[0])
						/ (codeFrame.geometricBounds[2] - codeFrame.geometricBounds[0]);
					doc.align(codeFrame, AlignOptions.LEFT_EDGES, AlignDistributeBounds.KEY_OBJECT, target);
					doc.align(codeFrame, AlignOptions.VERTICAL_CENTERS, AlignDistributeBounds.KEY_OBJECT, target);
					break;
				case 180:
					SF = (target.geometricBounds[3] - target.geometricBounds[1])
						/ (codeFrame.geometricBounds[3] - codeFrame.geometricBounds[1]);
					doc.align(codeFrame, AlignOptions.HORIZONTAL_CENTERS, AlignDistributeBounds.KEY_OBJECT, target);
					doc.align(codeFrame, AlignOptions.TOP_EDGES, AlignDistributeBounds.KEY_OBJECT, target);
					break;
				default:
					SF = (target.geometricBounds[3] - target.geometricBounds[1])
						/ (codeFrame.geometricBounds[3] - codeFrame.geometricBounds[1]);
					doc.align(codeFrame, AlignOptions.HORIZONTAL_CENTERS, AlignDistributeBounds.KEY_OBJECT, target);
					doc.align(codeFrame, AlignOptions.BOTTOM_EDGES, AlignDistributeBounds.KEY_OBJECT, target);
					break;
			}
			if (codeFrame.pageItems[0].label.length === 8) SF *= 0.76518424396442; // Adjust scale factor for EAN-8's narrower width
			codeFrame.transform(
				CoordinateSpaces.INNER_COORDINATES,
				AnchorPoint.BOTTOM_CENTER_ANCHOR,
				app.transformationMatrices.add({ horizontalScaleFactor: SF, verticalScaleFactor: SF })
			);

			oldCenter = codeFrame.pageItems[0].resolve(
				[ [ 0.5, 0.5 ], BoundingBoxLimits.GEOMETRIC_PATH_BOUNDS ],
				CoordinateSpaces.SPREAD_COORDINATES
			)[0];
			if (target.pageItems.length > 0) target.pageItems.everyItem().remove();
			target.contentPlace(codeFrame);
			codeFrame.remove();
			newCenter = target.pageItems[0].resolve(
				[ [ 0.5, 0.5 ], BoundingBoxLimits.GEOMETRIC_PATH_BOUNDS ],
				CoordinateSpaces.SPREAD_COORDINATES
			)[0];
			target.pageItems[0].move(undefined, [
				UnitValue(oldCenter[0] - newCenter[0], 'pt').as('mm'),
				UnitValue(oldCenter[1] - newCenter[1], 'pt').as('mm')
			]);
		}
		app.select(selection);
	} else {
		doc = app.documents.add();
		doc.documentPreferences.pageWidth  = '58.19 mm';
		doc.documentPreferences.pageHeight = '27.93 mm';

		if (barcodes.length > 2) progressBar = new ProgressBar('Generating EAN Codes', barcodes.length);

		for (i = 0; i < barcodes.length; i++) {
			if (progressBar) progressBar.update();

			page = i === 0 ? doc.pages[0] : doc.pages.add();
			app.activeWindow.activePage = page;
			app.activeWindow.zoom(ZoomOptions.FIT_SPREAD);

			codeFrame = makeBarcode(barcodes[i], page);

			page.marginPreferences.properties = { top: 0, left: 0, bottom: 0, right: 0 };
			page.reframe(CoordinateSpaces.SPREAD_COORDINATES, [
				codeFrame.resolve(AnchorPoint.TOP_LEFT_ANCHOR, CoordinateSpaces.SPREAD_COORDINATES)[0],
				codeFrame.resolve(AnchorPoint.BOTTOM_RIGHT_ANCHOR, CoordinateSpaces.SPREAD_COORDINATES)[0]
			]);
			doc.pasteboardPreferences.pasteboardMargins = [ 0, 0 ];
		}

		doc.layers.item(-1).remove();
		app.activeWindow.activePage = doc.pages[0];
		app.activeWindow.zoomPercentage = 150;
		app.activeWindow.screenMode = ScreenModeOptions.PREVIEW_TO_PAGE;
		app.select(null);
	}

	if (progressBar) progressBar.close();

	function makeBarcode(code, page) {
		codeLayer = doc.layers.item(codeLayerName);
		if (!codeLayer.isValid) {
			doc.layers.add({
				name: codeLayerName,
				layerColor: UIColors.GRID_GREEN,
				visible: true,
				locked: false,
				printable: true
			});
			txtLayer = doc.layers.item(txtLayerName);
			if (txtLayer.isValid) codeLayer.move(LocationOptions.AFTER, txtLayer);
		}

		codeFrame = new BarCode(
			code[0].substr(0, 12), // code
			code[1], // ext
			ui.rightMark.value,
			ui.extOnTop.value,
			page
		);
		codeFrame.itemLayer = codeLayer;

		return codeFrame;
	}

	/**
	 * Makes an EAN-8, EAN-13, EAN-13+2, EAN-13+5 barcode on the current page
	 * Taken from 'EAN Barcode Generator' (2013-11-21) by Konstantin Smorodsky
	 * https://github.com/smorodsky/ean-barcode-generator
	 *
	 * Changes by Paul Chiorean <jpeg@basement.ro>:
	 * - Refactored functions.
	 * - Return the barcode embedded in a frame;
	 * @version 23.9.8-PC
	 * @author Konstantin Smorodsky
	 * @license MIT
	 * @param {String} code - A string of 9 or 13 digits for the code.
	 * @param {String} ext - A string of 0, 2 or 5 digits for the add-on.
	 * @param {Boolean} rightMark - Append a Quiet Zone indicator (`>`).
	 * @param {Boolean} extOnTop - Put add-on text on top
	 * @returns {Rectangle} - The barcode as a compound path embedded in a white rectangle
	 */
	function BarCode(code, ext, rightMark, extOnTop, page) {
		var pos, frame, oldCenter, newCenter;
		var bcPolygon       = null;  // Main object (black)
		var lineWidth       =  0.33; // mm
		var lineHeight      = 22.85; // Default line (short)
		var separatorHeight = 24.5;  // Separator line height
		var addonHeight     = 21.9;  // Add-On line height (top chars)
		var topMargin       =  1;    // White space
		var bottomMargin    =  1;
		var leftMargin      =  4;
		var rightMargin     =  4;
		var firstCharEAN13  =  3.63; // Вынос левого края первой цифры
		var charHeight      =  2.75;
		var charHSpace      =  0.33; // Отступ при нижнем расположении цифр
		var addonCharHSpace =  0.33; // Min 0.16
		var EANData = {
			main: [ // See http://en.wikipedia.org/wiki/European_Article_Number
				'LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG',
				'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL'
			],
			addon2: [ // See http://en.wikipedia.org/wiki/EAN_2
				'LL', 'LG', 'GL', 'GG'
			],
			addon5: [ // See http://en.wikipedia.org/wiki/EAN_5
				'GGLLL', 'GLGLL', 'GLLGL', 'GLLLG', 'LGGLL',
				'LLGGL', 'LLLGG', 'LGLGL', 'LGLLG', 'LLGLG'
			],
			digits: [ // L-code only
				[ 3, 2, 1, 1 ], // 0 ...||.|
				[ 2, 2, 2, 1 ], // 1 ..||..|
				[ 2, 1, 2, 2 ], // 2 ..|..||
				[ 1, 4, 1, 1 ], // 3 .||||.|
				[ 1, 1, 3, 2 ], // 4 .|...||
				[ 1, 2, 3, 1 ], // 5 .||...|
				[ 1, 1, 1, 4 ], // 6 .|.||||
				[ 1, 3, 1, 2 ], // 7 .|||.||
				[ 1, 2, 1, 3 ], // 8 .||.|||
				[ 3, 1, 1, 2 ]  // 9 ...|.||
			],
			separators: {
				EAN13Start : { start: 1, lines: [ 1, 1, 1       ] }, // |.|
				EAN13      : { start: 0, lines: [ 1, 1, 1, 1, 1 ] }, // .|.|.
				EAN5Start  : { start: 0, lines: [ 1, 1, 1, 2    ] }, // .|.||
				EAN5       : { start: 0, lines: [ 1, 1          ] }  // .|
			},
			font: { // Human-readable digits (OCR-B 11pt)
				// digit: [ [ path1 { pathPoint1 t, a, l, r }, ... ], [ path2 { t, a, l, r }, ... ], ... ]
				// t - PointType:
				//   0 - PointType.SMOOTH
				//   1 - PointType.CORNER
				//   2 - PointType.PLAIN
				//   3 - PointType.SYMMETRICAL
				// a - anchor
				// l - leftDirection
				// r - rightDirection
				'0': [
					[
						{ t: 1, a: [ -0.453, -1.309 ], l: [ -0.335, -1.35  ], r: [ -0.571, -1.269 ] },
						{ t: 1, a: [ -0.708, -1.114 ], l: [ -0.656, -1.204 ], r: [ -0.832, -0.901 ] },
						{ t: 0, a: [ -0.893, -0.015 ], l: [ -0.893, -0.534 ], r: [ -0.893,  0.503 ] },
						{ t: 1, a: [ -0.708,  1.107 ], l: [ -0.832,  0.877 ], r: [ -0.613,  1.282 ] },
						{ t: 0, a: [ -0.033,  1.37  ], l: [ -0.388,  1.37  ], r: [  0.309,  1.37  ] },
						{ t: 1, a: [  0.658,  1.173 ], l: [  0.54,   1.304 ], r: [  0.815,  0.999 ] },
						{ t: 0, a: [  0.893,  0.004 ], l: [  0.893,  0.609 ], r: [  0.893, -0.479 ] },
						{ t: 1, a: [  0.723, -1.072 ], l: [  0.837, -0.838 ], r: [  0.672, -1.18  ] },
						{ t: 1, a: [  0.489, -1.302 ], l: [  0.594, -1.256 ], r: [  0.383, -1.347 ] },
						{ t: 0, a: [  0.039, -1.37  ], l: [  0.233, -1.37  ], r: [ -0.171, -1.37  ] }
					],
					[
						{ t: 1, a: [  0.281, -1.01  ], l: [  0.23,  -1.023 ], r: [  0.333, -0.997 ] },
						{ t: 1, a: [  0.399, -0.94  ], l: [  0.372, -0.974 ], r: [  0.441, -0.888 ] },
						{ t: 1, a: [  0.499, -0.579 ], l: [  0.474, -0.768 ], r: [  0.525, -0.39  ] },
						{ t: 0, a: [  0.537,  0.074 ], l: [  0.537, -0.172 ], r: [  0.537,  0.492 ] },
						{ t: 1, a: [  0.423,  0.917 ], l: [  0.499,  0.773 ], r: [  0.399,  0.961 ] },
						{ t: 0, a: [  0.282,  1.012 ], l: [  0.352,  0.993 ], r: [  0.212,  1.031 ] },
						{ t: 0, a: [ -0.037,  1.04  ], l: [  0.106,  1.04  ], r: [ -0.161,  1.04  ] },
						{ t: 1, a: [ -0.313,  1.002 ], l: [ -0.253,  1.028 ], r: [ -0.373,  0.977 ] },
						{ t: 1, a: [ -0.439,  0.872 ], l: [ -0.415,  0.934 ], r: [ -0.464,  0.807 ] },
						{ t: 1, a: [ -0.506,  0.506 ], l: [ -0.486,  0.685 ], r: [ -0.526,  0.327 ] },
						{ t: 0, a: [ -0.535, -0.017 ], l: [ -0.535,  0.152 ], r: [ -0.535, -0.22  ] },
						{ t: 1, a: [ -0.497, -0.592 ], l: [ -0.523, -0.412 ], r: [ -0.472, -0.772 ] },
						{ t: 1, a: [ -0.408, -0.928 ], l: [ -0.442, -0.884 ], r: [ -0.379, -0.966 ] },
						{ t: 1, a: [ -0.269, -1.007 ], l: [ -0.333, -0.993 ], r: [ -0.205, -1.022 ] },
						{ t: 0, a: [  0.031, -1.029 ], l: [ -0.105, -1.029 ], r: [  0.146, -1.029 ] }
					]
				],
				'1': [
					[
						{ t: 2, a: [ -0.035,  1.34  ] },
						{ t: 2, a: [  0.334,  1.34  ] },
						{ t: 2, a: [  0.334, -1.34  ] },
						{ t: 2, a: [ -0.069, -1.34  ] },
						{ t: 2, a: [ -0.719, -0.794 ] },
						{ t: 2, a: [ -0.719, -0.335 ] },
						{ t: 2, a: [ -0.035, -0.927 ] }
					]
				],
				'2': [
					[
						{ t: 0, a: [ -0.465,  0.946 ], l: [ -0.465,  0.946 ], r: [ -0.465,  0.822 ] },
						{ t: 1, a: [ -0.34,   0.597 ], l: [ -0.423,  0.706 ], r: [ -0.257,  0.489 ] },
						{ t: 1, a: [  0.069,  0.249 ], l: [ -0.12,   0.373 ], r: [  0.286,  0.109 ] },
						{ t: 1, a: [  0.495, -0.042 ], l: [  0.428,  0.012 ], r: [  0.561, -0.096 ] },
						{ t: 1, a: [  0.668, -0.236 ], l: [  0.619, -0.161 ], r: [  0.747, -0.356 ] },
						{ t: 0, a: [  0.787, -0.657 ], l: [  0.787, -0.497 ], r: [  0.787, -0.879 ] },
						{ t: 1, a: [  0.557, -1.191 ], l: [  0.711, -1.057 ], r: [  0.404, -1.325 ] },
						{ t: 0, a: [ -0.058, -1.392 ], l: [  0.199, -1.392 ], r: [ -0.336, -1.392 ] },
						{ t: 0, a: [ -0.789, -1.17  ], l: [ -0.58,  -1.318 ], r: [ -0.789, -1.17  ] },
						{ t: 0, a: [ -0.789, -0.773 ], l: [ -0.789, -0.773 ], r: [ -0.52,  -0.959 ] },
						{ t: 0, a: [ -0.007, -1.053 ], l: [ -0.259, -1.053 ], r: [  0.107, -1.053 ] },
						{ t: 1, a: [  0.291, -0.929 ], l: [  0.206, -1.012 ], r: [  0.375, -0.846 ] },
						{ t: 0, a: [  0.418, -0.64  ], l: [  0.418, -0.75  ], r: [  0.418, -0.545 ] },
						{ t: 1, a: [  0.315, -0.382 ], l: [  0.383, -0.459 ], r: [  0.246, -0.305 ] },
						{ t: 1, a: [ -0.086, -0.077 ], l: [  0.112, -0.203 ], r: [ -0.273,  0.04  ] },
						{ t: 1, a: [ -0.506,  0.235 ], l: [ -0.413,  0.144 ], r: [ -0.599,  0.325 ] },
						{ t: 1, a: [ -0.73,   0.544 ], l: [ -0.674,  0.428 ], r: [ -0.802,  0.692 ] },
						{ t: 0, a: [ -0.838,  1.126 ], l: [ -0.838,  0.886 ], r: [ -0.838,  1.172 ] },
						{ t: 0, a: [ -0.823,  1.34  ], l: [ -0.833,  1.243 ], r: [ -0.823,  1.34  ] },
						{ t: 2, a: [  0.751,  1.34  ] },
						{ t: 2, a: [  0.751,  0.997 ] },
						{ t: 2, a: [ -0.465,  0.997 ] }
					]
				],
				'3': [
					[
						{ t: 2, a: [ -0.414, -0.29  ] },
						{ t: 2, a: [ -0.414, -0.008 ] },
						{ t: 0, a: [ -0.088, -0.008 ], l: [ -0.088, -0.008 ], r: [  0.081, -0.008 ] },
						{ t: 0, a: [  0.331,  0.129 ], l: [  0.221,  0.038 ], r: [  0.441,  0.22  ] },
						{ t: 0, a: [  0.495,  0.474 ], l: [  0.495,  0.335 ], r: [  0.495,  0.649 ] },
						{ t: 1, a: [  0.313,  0.886 ], l: [  0.435,  0.787 ], r: [  0.191,  0.985 ] },
						{ t: 0, a: [ -0.194,  1.034 ], l: [  0.022,  1.034 ], r: [ -0.437,  1.034 ] },
						{ t: 0, a: [ -0.865,  0.845 ], l: [ -0.66,   0.971 ], r: [ -0.865,  0.845 ] },
						{ t: 0, a: [ -0.865,  1.211 ], l: [ -0.865,  1.211 ], r: [ -0.615,  1.317 ] },
						{ t: 0, a: [ -0.156,  1.37  ], l: [ -0.379,  1.37  ], r: [  0.149,  1.37  ] },
						{ t: 1, a: [  0.584,  1.13  ], l: [  0.396,  1.29  ], r: [  0.771,  0.97  ] },
						{ t: 0, a: [  0.865,  0.502 ], l: [  0.865,  0.761 ], r: [  0.865,  0.268 ] },
						{ t: 1, a: [  0.66,  -0.052 ], l: [  0.797,  0.084 ], r: [  0.524, -0.188 ] },
						{ t: 0, a: [  0.067, -0.288 ], l: [  0.326, -0.267 ], r: [  0.067, -0.288 ] },
						{ t: 2, a: [  0.753, -0.972 ] },
						{ t: 2, a: [  0.753, -1.34  ] },
						{ t: 2, a: [ -0.865, -1.34  ] },
						{ t: 2, a: [ -0.865, -1.008 ] },
						{ t: 2, a: [  0.283, -1.008 ] }
					]
				],
				'4': [
					[
						{ t: 2, a: [  0.528, -0.144 ] },
						{ t: 2, a: [  0.158, -0.144 ] },
						{ t: 2, a: [  0.158,  0.415 ] },
						{ t: 2, a: [ -0.505,  0.415 ] },
						{ t: 2, a: [  0.308, -1.34  ] },
						{ t: 2, a: [ -0.073, -1.34  ] },
						{ t: 2, a: [ -0.861,  0.356 ] },
						{ t: 2, a: [ -0.861,  0.758 ] },
						{ t: 2, a: [  0.158,  0.758 ] },
						{ t: 2, a: [  0.158,  1.34  ] },
						{ t: 2, a: [  0.528,  1.34  ] },
						{ t: 2, a: [  0.528,  0.758 ] },
						{ t: 2, a: [  0.861,  0.758 ] },
						{ t: 2, a: [  0.861,  0.415 ] },
						{ t: 2, a: [  0.528,  0.415 ] }
					]
				],
				'5': [
					[
						{ t: 2, a: [  0.679, -1.004 ] },
						{ t: 2, a: [  0.679, -1.339 ] },
						{ t: 2, a: [ -0.67,  -1.339 ] },
						{ t: 0, a: [ -0.751, -0.1   ], l: [ -0.751, -0.1   ], r: [ -0.724, -0.102 ] },
						{ t: 0, a: [ -0.7,   -0.105 ], l: [ -0.706, -0.104 ], r: [ -0.7,   -0.105 ] },
						{ t: 0, a: [ -0.566, -0.121 ], l: [ -0.566, -0.121 ], r: [ -0.484, -0.129 ] },
						{ t: 0, a: [ -0.283, -0.134 ], l: [ -0.389, -0.134 ], r: [  0.16,  -0.134 ] },
						{ t: 0, a: [  0.382,  0.382 ], l: [  0.382,  0.038 ], r: [  0.382,  0.543 ] },
						{ t: 1, a: [  0.226,  0.79  ], l: [  0.33,   0.679 ], r: [  0.123,  0.9   ] },
						{ t: 1, a: [ -0.207,  1.013 ], l: [ -0.022,  0.975 ], r: [ -0.306,  1.031 ] },
						{ t: 0, a: [ -0.522,  1.041 ], l: [ -0.411,  1.041 ], r: [ -0.522,  1.041 ] },
						{ t: 2, a: [ -0.711,  1.039 ] },
						{ t: 2, a: [ -0.751,  1.039 ] },
						{ t: 0, a: [ -0.751,  1.365 ], l: [ -0.751,  1.365 ], r: [ -0.345,  1.365 ] },
						{ t: 1, a: [  0.175,  1.227 ], l: [ -0.036,  1.319 ], r: [  0.559,  1.059 ] },
						{ t: 0, a: [  0.751,  0.385 ], l: [  0.751,  0.778 ], r: [  0.751,  0.116 ] },
						{ t: 1, a: [  0.477, -0.244 ], l: [  0.66,  -0.093 ], r: [  0.293, -0.394 ] },
						{ t: 0, a: [ -0.291, -0.469 ], l: [  0.038, -0.469 ], r: [ -0.291, -0.469 ] },
						{ t: 2, a: [ -0.387, -0.467 ] },
						{ t: 2, a: [ -0.342, -1.004 ] }
					]
				],
				'6': [
					[
						{ t: 0, a: [ -0.488, -0.608 ], l: [ -0.488, -0.608 ], r: [ -0.637, -0.402 ] },
						{ t: 1, a: [ -0.806, -0.057 ], l: [ -0.743, -0.219 ], r: [ -0.869,  0.105 ] },
						{ t: 0, a: [ -0.901,  0.455 ], l: [ -0.901,  0.275 ], r: [ -0.901,  0.745 ] },
						{ t: 1, a: [ -0.664,  1.13  ], l: [ -0.822,  0.97  ], r: [ -0.506,  1.29  ] },
						{ t: 0, a: [  0.001,  1.37  ], l: [ -0.285,  1.37  ], r: [  0.273,  1.37  ] },
						{ t: 1, a: [  0.655,  1.124 ], l: [  0.49,   1.288 ], r: [  0.819,  0.961 ] },
						{ t: 0, a: [  0.901,  0.475 ], l: [  0.901,  0.744 ], r: [  0.901,  0.234 ] },
						{ t: 1, a: [  0.657, -0.135 ], l: [  0.82,   0.031 ], r: [  0.495, -0.3   ] },
						{ t: 0, a: [  0.058, -0.383 ], l: [  0.295, -0.383 ], r: [ -0.042, -0.383 ] },
						{ t: 1, a: [ -0.285, -0.303 ], l: [ -0.156, -0.356 ], r: [ -0.256, -0.341 ] },
						{ t: 0, a: [ -0.232, -0.372 ], l: [ -0.238, -0.364 ], r: [ -0.232, -0.372 ] },
						{ t: 0, a: [ -0.071, -0.591 ], l: [ -0.071, -0.591 ], r: [  0.055, -0.761 ] },
						{ t: 0, a: [  0.592, -1.298 ], l: [  0.276, -0.996 ], r: [  0.592, -1.298 ] },
						{ t: 2, a: [  0.636, -1.34  ] },
						{ t: 0, a: [  0.153, -1.34  ], l: [  0.153, -1.34  ], r: [ -0.099, -1.093 ] },
						{ t: 0, a: [ -0.488, -0.608 ], l: [ -0.312, -0.85  ], r: [ -0.488, -0.608 ] }
					],
					[
						{ t: 1, a: [  0.384,  0.107 ], l: [  0.283,  0.006 ], r: [  0.485,  0.207 ] },
						{ t: 0, a: [  0.535,  0.483 ], l: [  0.535,  0.333 ], r: [  0.535,  0.643 ] },
						{ t: 0, a: [  0.385,  0.877 ], l: [  0.485,  0.775 ], r: [  0.284,  0.979 ] },
						{ t: 0, a: [ -0.001,  1.031 ], l: [  0.156,  1.031 ], r: [ -0.158,  1.031 ] },
						{ t: 1, a: [ -0.386,  0.877 ], l: [ -0.286,  0.979 ], r: [ -0.485,  0.775 ] },
						{ t: 0, a: [ -0.535,  0.481 ], l: [ -0.535,  0.643 ], r: [ -0.535,  0.328 ] },
						{ t: 1, a: [ -0.383,  0.104 ], l: [ -0.484,  0.203 ], r: [ -0.281,  0.006 ] },
						{ t: 0, a: [  0.005, -0.044 ], l: [ -0.152, -0.044 ], r: [  0.156, -0.044 ] }
					]
				],
				'7': [
					[
						{ t: 2, a: [  0.333, -0.771 ] },
						{ t: 0, a: [  0.143, -0.555 ], l: [  0.143, -0.555 ], r: [ -0.054, -0.329 ] },
						{ t: 1, a: [ -0.315,  0.158 ], l: [ -0.207, -0.091 ], r: [ -0.424,  0.408 ] },
						{ t: 0, a: [ -0.478,  0.875 ], l: [ -0.478,  0.647 ], r: [ -0.478,  0.875 ] },
						{ t: 2, a: [ -0.478,  1.34  ] },
						{ t: 2, a: [ -0.109,  1.34  ] },
						{ t: 0, a: [ -0.109,  0.875 ], l: [ -0.109,  0.875 ], r: [ -0.109,  0.639 ] },
						{ t: 1, a: [  0.027,  0.235 ], l: [ -0.063,  0.426 ], r: [  0.118,  0.044 ] },
						{ t: 1, a: [  0.55,  -0.504 ], l: [  0.293, -0.202 ], r: [  0.692, -0.669 ] },
						{ t: 1, a: [  0.831, -0.895 ], l: [  0.785, -0.8   ], r: [  0.876, -0.991 ] },
						{ t: 0, a: [  0.899, -1.234 ], l: [  0.899, -1.103 ], r: [  0.899, -1.234 ] },
						{ t: 2, a: [  0.899, -1.34  ] },
						{ t: 2, a: [ -0.863, -1.34  ] },
						{ t: 2, a: [ -0.863, -1.008 ] },
						{ t: 0, a: [  0.456, -1.008 ], l: [  0.456, -1.008 ], r: [  0.442, -0.928 ] },
						{ t: 0, a: [  0.333, -0.771 ], l: [  0.401, -0.849 ], r: [  0.333, -0.771 ] }
					]
				],
				'8': [
					[
						{ t: 0, a: [  0.377, -0.186 ], l: [  0.377, -0.186 ], r: [  0.526, -0.287 ] },
						{ t: 1, a: [  0.693, -0.472 ], l: [  0.631, -0.382 ], r: [  0.754, -0.561 ] },
						{ t: 0, a: [  0.784, -0.784 ], l: [  0.784, -0.666 ], r: [  0.784, -0.963 ] },
						{ t: 0, a: [  0.568, -1.211 ], l: [  0.712, -1.105 ], r: [  0.424, -1.317 ] },
						{ t: 0, a: [ -0.011, -1.37  ], l: [  0.231, -1.37  ], r: [ -0.244, -1.37  ] },
						{ t: 1, a: [ -0.578, -1.212 ], l: [ -0.433, -1.317 ], r: [ -0.723, -1.106 ] },
						{ t: 0, a: [ -0.796, -0.8   ], l: [ -0.796, -0.969 ], r: [ -0.796, -0.667 ] },
						{ t: 1, a: [ -0.701, -0.468 ], l: [ -0.764, -0.556 ], r: [ -0.638, -0.38  ] },
						{ t: 1, a: [ -0.332, -0.152 ], l: [ -0.515, -0.274 ], r: [ -0.711,  0.02  ] },
						{ t: 0, a: [ -0.9,    0.633 ], l: [ -0.9,    0.282 ], r: [ -0.9,    0.867 ] },
						{ t: 1, a: [ -0.666,  1.177 ], l: [ -0.822,  1.048 ], r: [ -0.51,   1.306 ] },
						{ t: 0, a: [ -0.008,  1.37  ], l: [ -0.291,  1.37  ], r: [  0.282,  1.37  ] },
						{ t: 1, a: [  0.663,  1.177 ], l: [  0.505,  1.306 ], r: [  0.821,  1.048 ] },
						{ t: 0, a: [  0.9,    0.627 ], l: [  0.9,    0.865 ], r: [  0.9,    0.468 ] },
						{ t: 1, a: [  0.791,  0.228 ], l: [  0.864,  0.335 ], r: [  0.718,  0.122 ] },
						{ t: 0, a: [  0.404, -0.104 ], l: [  0.589,  0.011 ], r: [  0.404, -0.104 ] },
						{ t: 2, a: [  0.326, -0.152 ] }
					],
					[
						{ t: 0, a: [ -0.432, -0.752 ], l: [ -0.432, -0.752 ], r: [ -0.432, -0.843 ] },
						{ t: 1, a: [ -0.316, -0.967 ], l: [ -0.393, -0.915 ], r: [ -0.239, -1.02  ] },
						{ t: 0, a: [ -0.002, -1.046 ], l: [ -0.135, -1.046 ], r: [  0.126, -1.046 ] },
						{ t: 1, a: [  0.305, -0.964 ], l: [  0.228, -1.019 ], r: [  0.382, -0.91  ] },
						{ t: 0, a: [  0.421, -0.747 ], l: [  0.421, -0.838 ], r: [  0.421, -0.675 ] },
						{ t: 1, a: [  0.307, -0.527 ], l: [  0.383, -0.601 ], r: [  0.231, -0.452 ] },
						{ t: 1, a: [ -0.004, -0.332 ], l: [  0.128, -0.387 ], r: [ -0.289, -0.445 ] },
						{ t: 0, a: [ -0.432, -0.752 ], l: [ -0.432, -0.585 ], r: [ -0.432, -0.752 ] }
					],
					[
						{ t: 1, a: [  0.392,  0.29  ], l: [  0.297,  0.186 ], r: [  0.487,  0.393 ] },
						{ t: 0, a: [  0.534,  0.618 ], l: [  0.534,  0.503 ], r: [  0.534,  0.745 ] },
						{ t: 1, a: [  0.392,  0.925 ], l: [  0.487,  0.848 ], r: [  0.297,  1.002 ] },
						{ t: 0, a: [  0.013,  1.04  ], l: [  0.171,  1.04  ], r: [ -0.153,  1.04  ] },
						{ t: 1, a: [ -0.387,  0.922 ], l: [ -0.287,  1.001 ], r: [ -0.486,  0.843 ] },
						{ t: 0, a: [ -0.536,  0.606 ], l: [ -0.536,  0.738 ], r: [ -0.536,  0.496 ] },
						{ t: 1, a: [ -0.436,  0.325 ], l: [ -0.503,  0.403 ], r: [ -0.369,  0.247 ] },
						{ t: 0, a: [ -0.076,  0.074 ], l: [ -0.249,  0.164 ], r: [ -0.076,  0.074 ] },
						{ t: 0, a: [  0,      0.032 ], l: [  0,      0.032 ], r: [  0.167,  0.1   ] }
					]
				],
				'9': [
					[
						{ t: 0, a: [ -0.096,  1.281 ], l: [ -0.096,  1.281 ], r: [  0.272,  0.897 ] },
						{ t: 0, a: [  0.68,   0.316 ], l: [  0.531,  0.575 ], r: [  0.83,   0.056 ] },
						{ t: 0, a: [  0.905, -0.455 ], l: [  0.905, -0.201 ], r: [  0.905, -0.732 ] },
						{ t: 1, a: [  0.658, -1.121 ], l: [  0.823, -0.954 ], r: [  0.494, -1.287 ] },
						{ t: 0, a: [  0.001, -1.37  ], l: [  0.275, -1.37  ], r: [ -0.269, -1.37  ] },
						{ t: 1, a: [ -0.655, -1.124 ], l: [ -0.488, -1.288 ], r: [ -0.821, -0.961 ] },
						{ t: 0, a: [ -0.905, -0.479 ], l: [ -0.905, -0.746 ], r: [ -0.905, -0.239 ] },
						{ t: 1, a: [ -0.664,  0.128 ], l: [ -0.825, -0.037 ], r: [ -0.504,  0.293 ] },
						{ t: 0, a: [ -0.071,  0.375 ], l: [ -0.306,  0.375 ], r: [  0.04,   0.375 ] },
						{ t: 1, a: [  0.276,  0.298 ], l: [  0.156,  0.349 ], r: [  0.081,  0.603 ] },
						{ t: 0, a: [ -0.641,  1.34  ], l: [ -0.225,  0.951 ], r: [ -0.641,  1.34  ] },
						{ t: 2, a: [ -0.151,  1.34  ] }
					],
					[
						{ t: 0, a: [  0.403, -0.87  ], l: [  0.403, -0.87  ], r: [  0.494, -0.762 ] },
						{ t: 0, a: [  0.539, -0.502 ], l: [  0.539, -0.64  ], r: [  0.539, -0.344 ] },
						{ t: 1, a: [  0.389, -0.114 ], l: [  0.489, -0.215 ], r: [  0.29,  -0.014 ] },
						{ t: 0, a: [  0.007,  0.036 ], l: [  0.162,  0.036 ], r: [ -0.155,  0.036 ] },
						{ t: 0, a: [ -0.389, -0.112 ], l: [ -0.287, -0.013 ], r: [ -0.492, -0.21  ] },
						{ t: 0, a: [ -0.543, -0.492 ], l: [ -0.543, -0.337 ], r: [ -0.543, -0.654 ] },
						{ t: 1, a: [ -0.39,  -0.887 ], l: [ -0.492, -0.786 ], r: [ -0.289, -0.988 ] },
						{ t: 0, a: [  0.003, -1.038 ], l: [ -0.158, -1.038 ], r: [  0.173, -1.038 ] },
						{ t: 0, a: [  0.403, -0.87  ], l: [  0.307, -0.982 ], r: [  0.403, -0.87  ] }
					]
				],
				'>': [
					[
						{ t: 2, a: [ -0.861, -0.825 ] },
						{ t: 2, a: [  0.397,  0     ] },
						{ t: 2, a: [ -0.844,  0.823 ] },
						{ t: 2, a: [ -0.844,  1.252 ] },
						{ t: 2, a: [  0.929,  0.062 ] },
						{ t: 2, a: [  0.929, -0.063 ] },
						{ t: 2, a: [ -0.861, -1.252 ] }
					]
				],

				// Decode point type
				'getPointType': function (pointCode) {
					return {
						0: PointType.SMOOTH,
						1: PointType.CORNER,
						2: parseFloat(app.version) < 7 ? PointType.LINE_TYPE : PointType.PLAIN,
						3: PointType.SYMMETRICAL
					}[pointCode];
				},

				'makePath': function (pageItem, center, pathData) {
					var i, l, path, ppData, pointType, point;
					if (pageItem) {
						path = pageItem.paths.add();
					} else {
						pageItem = page.ovals.add();
						path = pageItem.paths[0];
					}
					for (i = 0, l = pathData.length; i < l; i++) {
						ppData = pathData[i];
						pointType = this.getPointType(ppData.t);
						point = path.pathPoints.length > i ? path.pathPoints[i] : path.pathPoints.add();
						point.pointType = pointType;
						point.anchor = [ ppData.a[0] + center[0], ppData.a[1] + center[1] ];
						if (ppData.t !== 2) {
							point.leftDirection  = [ ppData.l[0] + center[0], ppData.l[1] + center[1] ];
							point.rightDirection = [ ppData.r[0] + center[0], ppData.r[1] + center[1] ];
						}
					}
					if (path.pathType === PathType.OPEN_PATH) point.join(path.pathPoints[0]);
					return path;
				},

				// Draw number n
				'draw': function (center, n) {
					var i, l, path, pathData;
					var nData = this[n];
					if (!(page instanceof Page)) throw Error('Need page object');
					if (!(center instanceof Array) || center.length !== 2) throw Error('Bad center');
					if (!(String(n) in this)) throw Error('Can not draw letter "' + n + '"');
					for (i = 0, l = nData.length; i < l; i++) {
						pathData = nData[i];
						path = this.makePath(path && path.parent, center, pathData);
					}
					return path.parent;
				}
			}
		};
		page = page || app.activeWindow.activePage;

		// Build code + add-on + quiet zone
		ext = ext || '';
		if ((code + ext).search('^[0-9]+')) return null;
		switch (code.length) {
			case 8:
				pos = getEAN8(code, leftMargin);
				break;
			case 12: // Without checksum
				pos = getEAN13(code, leftMargin);
				break;
			default:
				return null;
		}
		pos = getEANAddon(ext, pos, extOnTop);
		if (rightMark) {
			if (ext) writeChar(pos - 0.2, '>', extOnTop); // До правого края стрелки 1.65
			else writeChar(pos + 0.25, '>'); // От последней линии до конца стрелки 2.31
		}

		// Insert code in frame
		frame = writeBG(pos + rightMargin);
		oldCenter = bcPolygon.resolve(
			[ [ 0.5, 0.5 ], BoundingBoxLimits.GEOMETRIC_PATH_BOUNDS ],
			CoordinateSpaces.SPREAD_COORDINATES
		)[0];
		frame.contentPlace(bcPolygon);
		bcPolygon.remove();
		newCenter = frame.pageItems[0].resolve(
			[ [ 0.5, 0.5 ], BoundingBoxLimits.GEOMETRIC_PATH_BOUNDS ],
			CoordinateSpaces.SPREAD_COORDINATES
		)[0];
		frame.pageItems[0].move(undefined, [
			UnitValue(oldCenter[0] - newCenter[0], 'pt').as('mm'),
			UnitValue(oldCenter[1] - newCenter[1], 'pt').as('mm')
		]);
		frame.name = '<EAN>';
		frame.pageItems[0].label
			= (code.length === 12 ? getValidChecksum(code) : code) + (ext && ('-' + ext));
		return frame;

		function getEAN8(s, p) {
			var i, binKey;
			p = writeDigit(EANData.separators.EAN13Start, p, separatorHeight);
			for (i = 0; i <= 3; i++) {
				binKey = getCode(s.charAt(i), 'L');
				p = writeDigit(binKey, p, lineHeight, s.charAt(i));
			}
			p = writeDigit(EANData.separators.EAN13, p, separatorHeight);
			for (i = 4; i <= 7; i++) {
				binKey = getCode(s.charAt(i), 'R');
				p = writeDigit(binKey, p, lineHeight, s.charAt(i), -lineWidth);
			}
			p = writeDigit(EANData.separators.EAN13Start, p, separatorHeight);
			return p;
		}

		function getEAN13(s, p) {
			var i, n, codeArray, binKey;
			s = getValidChecksum(s);
			codeArray = EANData.main[parseInt(s.charAt(0), 10)];
			writeChar(p - firstCharEAN13, s.charAt(0));
			p = writeDigit(EANData.separators.EAN13Start, p, separatorHeight);
			for (i = 1; i <= 6; i++) {
				n = codeArray.charAt(i - 1);
				binKey = getCode(s.charAt(i), n);
				p = writeDigit(binKey, p, lineHeight, s.charAt(i));
			}
			p = writeDigit(EANData.separators.EAN13, p, separatorHeight);
			n = 'R';
			for (i = 7; i <= 12; i++) {
				binKey = getCode(s.charAt(i), n);
				p = writeDigit(binKey, p, lineHeight, s.charAt(i), -lineWidth);
			}
			p = writeDigit(EANData.separators.EAN13Start, p, separatorHeight);
			return p;
		}

		function getEANAddon(s, p, top) {
			var i, l, codeArray, extLineHeight, binKey;
			var checksum = 0;
			if (top) extLineHeight = addonHeight;
			else extLineHeight = lineHeight;
			switch (s.length) {
				case 2:
					codeArray = EANData.addon2[parseInt(s, 10) % 4];
					break;
				case 5:
					for (i = 0, l = s.length; i < l; ++i)
						checksum += (i % 2 ? 9 : 3) * parseInt(s.charAt(i), 10);
					checksum %= 10;
					codeArray = EANData.addon5[checksum];
					break;
				default:
					return p;
			}
			p = writeDigit(EANData.separators.EAN5Start, p + 3, extLineHeight, undefined, undefined, top);
			for (i = 0; i < s.length; i++) {
				if (i > 0) p = writeDigit(EANData.separators.EAN5, p, extLineHeight, undefined, undefined, top);
				binKey = getCode(s.charAt(i), codeArray.charAt(i));
				p = writeDigit(binKey, p, extLineHeight, s.charAt(i), undefined, top);
			}
			return p;
		}

		function getValidChecksum(s) {
			var i;
			var checksum = 0;
			for (i = 0; i < 12; i++) {
				if ((13 + i) % 2 === 0) checksum += 3 * parseInt(s.charAt(i), 10);
				else checksum += parseInt(s.charAt(i), 10);
			}
			checksum %= 10;
			checksum = (10 - checksum) % 10;
			return s + checksum;
		}

		function writeBG(right) {
			var rect = page.rectangles.add();
			rect.applyObjectStyle(app.activeDocument.objectStyles[0]);
			rect.strokeColor = 'None';
			rect.fillColor = 'Paper';
			rect.fillTint = -1;
			rect.geometricBounds = [
				0, 0,
				topMargin + lineHeight + charHSpace + charHeight + bottomMargin + 'mm',
				right + 'mm'
			];
			return rect;
		}

		function getCode(value, key) {
			var lines = EANData.digits[parseInt(value, 10)];
			// L: 3211, G: 1123, R: 3211
			if (key === 'G') lines = lines.slice(0).reverse(); // Duplicate & reverse
			return {
				start: key === 'R' ? 1 : 0,
				lines: lines
			};
		}

		function writeChar(left, chr, addonSymbol) {
			var top, obj;
			if (!chr) return;
			top = topMargin + (addonSymbol ? charHeight / 2 : lineHeight + charHeight / 2 + charHSpace);
			left = addonSymbol ? left + 0.95 : left + 4 * lineWidth;
			obj = EANData.font.draw([ left, top ], chr);
			addPathToBC(obj);
		}

		function writeDigit(binKey, p, len, num, shiftChar, addonSymbol) {
			var i, l, lines, draw;
			shiftChar = shiftChar || 0;
			writeChar(p + shiftChar, num, addonSymbol);
			lines = binKey.lines;
			draw = binKey.start === 1;
			for (i = 0, l = lines.length; i < l; ++i) {
				if (draw) writeLine(lines[i]);
				draw = !draw;
				p += lineWidth * lines[i];
			}
			return p;

			function writeLine(width) {
				var rect = page.rectangles.add();
				var top = addonSymbol ? topMargin + charHeight + addonCharHSpace : topMargin;
				rect.geometricBounds = [
					top + 'mm',
					p + 'mm',
					(top + len) + 'mm',
					(p + lineWidth * width) + 'mm'
				];
				addPathToBC(rect);
			}
		}

		function addPathToBC(pageItem) {
			if (bcPolygon) {
				bcPolygon = bcPolygon.makeCompoundPath(pageItem);
			} else {
				pageItem.applyObjectStyle(app.activeDocument.objectStyles.item(0));
				pageItem.strokeColor = 'None';
				pageItem.fillColor = 'Black';
				pageItem.fillTint = -1;
				bcPolygon = pageItem;
			}
		}
	}
}
