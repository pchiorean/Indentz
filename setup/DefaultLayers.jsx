/*
	Default layers v3.1.9 (2021-09-30)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Adds/merges layers from a 6-column TSV file named 'layers.txt':

	Name     | Color   | Visible | Printable | Order | Variants
	dielines | Magenta | yes     | yes       | top   | cut*, decoupe, die, die*cut, stanz*
	template | Gray    | no      | no        | below
	...
	1. <Name>: layer name
	2. <Color>: layer color (see UIColors.txt; default 'Light Blue')
	3. <Visible>: 'yes' or 'no' (default 'yes')
	4. <Printable>: 'yes' or 'no' (default 'yes')
	5. <Order>: 'above' or 'below' existing layers (default 'above')
	6. <Variants>: a list of layers that will be merged with the base layer
	   (case insensitive; '*' and '?' wildcards accepted)

	The file can be saved in the current folder, on the desktop, or next to the script.
	Blank lines and those prefixed with '#' are ignored; '@file.txt' includes records from 'file.txt'.

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

// @include '../lib/GetDataFile.jsxinc';
// @include '../lib/IsIn.jsxinc';
// @include '../lib/Report.jsxinc';

if (!(doc = app.activeDocument)) exit();

app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined,
	UndoModes.ENTIRE_SCRIPT, 'Default layers');

function main() {
	var newLayer, tmpLayer, i, n;
	var oldActiveLayer = doc.activeLayer; // Save active layer
	var dataFile = getDataFile('layers.txt');
	if (!dataFile) { alert('No data file found.'); exit(); }
	var data = parseInfo(dataFile);
	if (data.errors.length > 0) { report(data.errors, decodeURI(dataFile.getRelativeURI(doc.filePath))); exit(); }
	if (data.records.length === 0) exit();

	doc.layers.everyItem().properties = { locked: false }; // Unlock existing layers
	// Top layers
	for (i = data.records.length - 1; i >= 0 ; i--) {
		if (data.records[i].isBelow) continue;
		newLayer = makeLayer(
			data.records[i].name,
			data.records[i].color,
			data.records[i].isVisible,
			data.records[i].isPrintable,
			data.records[i].variants);
		if (i < data.records.length - 1) {
			tmpLayer = doc.layers.item(data.records[i + 1].name);
			if (tmpLayer.isValid && (newLayer.index > tmpLayer.index))
				newLayer.move(LocationOptions.BEFORE,doc.layers.item(data.records[i + 1].name));
		}
	}
	// Bottom layers
	for (i = 0, n = data.records.length; i < n; i++) {
		if (!data.records[i].isBelow) continue;
		makeLayer(
			data.records[i].name,
			data.records[i].color,
			data.records[i].isVisible,
			data.records[i].isPrintable,
			data.records[i].variants)
		.move(LocationOptions.AT_END);
	}
	doc.activeLayer = oldActiveLayer; // Restore active layer

	function makeLayer(name, color, isVisible, isPrintable, variants) {
		var targetLayer, docLayers, candidateLayer, oldLayerVisibility;
		targetLayer = doc.layers.item(name);
		if (targetLayer.isValid) {
			targetLayer.properties = {
				layerColor: color,
				// visible:    isVisible,
				printable:  isPrintable
			};
		} else {
			doc.activeLayer = doc.layers.firstItem();
			doc.layers.add({
				name:       name,
				layerColor: color,
				visible:    isVisible,
				printable:  isPrintable
			});
		}
		// Merge variants
		docLayers = doc.layers.everyItem().getElements();
		while ((candidateLayer = docLayers.shift())) {
			if (candidateLayer === targetLayer) continue;
			if (isIn(candidateLayer.name, variants)) {
				oldLayerVisibility = candidateLayer.visible;
				if (candidateLayer === oldActiveLayer) oldActiveLayer = targetLayer;
				targetLayer.merge(candidateLayer);
				targetLayer.visible = oldLayerVisibility;
			}
		}
		return targetLayer;
	}
}

/**
 * Reads a TSV (tab-separated-values) file, returning an object containing found records and errors.
 * It ignores blank lines and those prefixed with `#`. `@path/to/include.txt` includes records
 * from `include.txt`; `@default` includes the default data file (see `getDataFile()`).
 * @param {File} dataFile - Tab-separated-values file (object).
 * @returns {{records: array, errors: array}}
 */
function parseInfo(dataFile) {
	var infoLine, include, includeFile;
	var buffer = [];
	var records = [];
	var errors = [];
	var flgHeader = false;
	var line = 0;
	dataFile.open('r');
	while (!dataFile.eof) {
		infoLine = dataFile.readln(); line++;
		if (infoLine.replace(/^\s+|\s+$/g, '') === '') continue; // Ignore blank lines
		if (infoLine.slice(0,1) === '\u0023') continue;          // Ignore lines prefixed with '#'
		infoLine = infoLine.split(/ *\t */);
		if (!flgHeader) { flgHeader = true; continue; } // Header
		// '@include'
		if (infoLine[0].slice(0,1) === '\u0040') { // '@'
			include = infoLine[0].slice(1).replace(/^\s+|\s+$/g, '').replace(/^['"]+|['"]+$/g, '');
			includeFile = /^default(s?)$/i.test(include) ?                      // '@default' ?
				getDataFile(decodeURI(dataFile.name).replace(/^_/, ''), true) : // Include default data file :
				File(include);                                                  // Include 'path/to/file.txt'
			if (includeFile && includeFile.exists) {
				if (includeFile.fullName === dataFile.fullName) continue;       // Skip self
				buffer = parseInfo(includeFile);
				records = records.concat(buffer.records);
			}
		} else {
			if (!infoLine[0]) errors.push('Line ' + line + ': Missing layer name.');
			if (errors.length === 0) {
				records.push({
					name:        infoLine[0],
					color:       infoLine[1] ? getUIColor(infoLine[1]) : UIColors.LIGHT_BLUE,
					isVisible:   infoLine[2] ? (infoLine[2].toLowerCase() === 'yes')   : true,
					isPrintable: infoLine[3] ? (infoLine[3].toLowerCase() === 'yes')   : true,
					isBelow:     infoLine[4] ? (infoLine[4].toLowerCase() === 'below') : false,
					variants:    infoLine[5] ? (infoLine[0] + ',' + infoLine[5]).split(/ *, */) : ''
				});
			}
		}
	}
	dataFile.close(); infoLine = '';
	return { records: records, errors: errors };

	function getUIColor(color) {
		return {
			'Blue':        UIColors.BLUE,
			'Black':       UIColors.BLACK,
			'Brick Red':   UIColors.BRICK_RED,
			'Brown':       UIColors.BROWN,
			'Burgundy':    UIColors.BURGUNDY,
			'Charcoal':    UIColors.CHARCOAL,
			'Cute Teal':   UIColors.CUTE_TEAL,
			'Cyan':        UIColors.CYAN,
			'Dark Blue':   UIColors.DARK_BLUE,
			'Dark Green':  UIColors.DARK_GREEN,
			'Fiesta':      UIColors.FIESTA,
			'Gold':        UIColors.GOLD,
			'Grass Green': UIColors.GRASS_GREEN,
			'Gray':        UIColors.GRAY,
			'Green':       UIColors.GREEN,
			'Grid Blue':   UIColors.GRID_BLUE,
			'Grid Green':  UIColors.GRID_GREEN,
			'Grid Orange': UIColors.GRID_ORANGE,
			'Lavender':    UIColors.LAVENDER,
			'Light Blue':  UIColors.LIGHT_BLUE,
			'Light Gray':  UIColors.LIGHT_GRAY,
			'Light Olive': UIColors.LIGHT_OLIVE,
			'Lipstick':    UIColors.LIPSTICK,
			'Magenta':     UIColors.MAGENTA,
			'Ochre':       UIColors.OCHRE,
			'Olive Green': UIColors.OLIVE_GREEN,
			'Orange':      UIColors.ORANGE,
			'Peach':       UIColors.PEACH,
			'Pink':        UIColors.PINK,
			'Purple':      UIColors.PURPLE,
			'Red':         UIColors.RED,
			'Sulphur':     UIColors.SULPHUR,
			'Tan':         UIColors.TAN,
			'Teal':        UIColors.TEAL,
			'Violet':      UIColors.VIOLET,
			'White':       UIColors.WHITE,
			'Yellow':      UIColors.YELLOW
		}[color] || UIColors.LIGHT_BLUE;
	}
}
