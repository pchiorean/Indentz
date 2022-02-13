/*
	Default layers 22.2.13
	(c) 2020-2022 Paul Chiorean (jpeg@basement.ro)

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
	Blank lines and those prefixed with `#` are ignored. A line ending in `\` continues on the next line.
	Include records from another file with `@path/to/include.txt` or the `@default` data file.

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
// @include '../lib/IsInArray.jsxinc';
// @include '../lib/Report.jsxinc';

if (!(doc = app.activeDocument)) exit();

app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined,
	UndoModes.ENTIRE_SCRIPT, 'Default layers');

function main() {
	var VERBOSITY = ScriptUI.environment.keyboardState.ctrlKey ? 2 : 1; // 0: FAIL, 1: +WARN, 2: +INFO
	var file, data, messages, oldActiveLayer, newLayer, tmpLayer, i, n;
	var counter = { add: 0, merge: 0 };
	if (doc.converted && VERBOSITY > 0) {
		alert('Can\'t get document path.\nThe document was converted from a previous InDesign version. ' +
			'The default layer substitution list\nwill be used, if found.');
	}
	if (!(file = getDataFile('layers.txt'))) {
		if (VERBOSITY > 1) {
			alert('Can\'t locate a layer substitution list.\nThe file must be saved in the current folder,' +
				'\non the desktop, or next to the script.\nCheck docs for details.');
		}
		exit();
	}
	data = parseDataFile(file);
	if (data.errors.fail.length > 0) { report(data.errors.fail, decodeURI(file.getRelativeURI(doc.filePath))); exit(); }
	if (data.records.length === 0) exit();

	oldActiveLayer = doc.activeLayer; // Save active layer
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

	if (VERBOSITY > 0) {
		messages = data.errors.warn;
		if (VERBOSITY > 1) messages = messages.concat(data.errors.info);
		if (messages.length > 0) report(messages, 'Layers: ' + counter.add + ' added | ' + counter.merge + ' merged');
	}

	function makeLayer(name, color, isVisible, isPrintable, variants) {
		var targetLayer, l, oldName, layers, oldLayerVisibility;
		targetLayer = doc.layers.item(name);
		if (targetLayer.isValid) {
			targetLayer.properties = {
				layerColor: color,
				// visible:    isVisible,
				printable:  isPrintable
			};
		} else {
			doc.activeLayer = doc.layers.firstItem();
			targetLayer = doc.layers.add({
				name:       name,
				layerColor: color,
				visible:    isVisible,
				printable:  isPrintable
			});
			counter.add++;
			data.errors.info.push('Added \'' + targetLayer.name + '\'.');
		}
		// Merge variants
		layers = doc.layers.everyItem().getElements();
		while ((l = layers.shift())) {
			if (l === targetLayer) continue;
			if (isInArray(l.name, variants)) {
				oldLayerVisibility = l.visible;
				if (l === oldActiveLayer) oldActiveLayer = targetLayer;
				oldName = l.name;
				targetLayer.merge(l);
				targetLayer.visible = oldLayerVisibility;
				counter.merge++;
				data.errors.info.push('Merged \'' + oldName + '\' with \'' + targetLayer.name + '\'.');
			}
		}
		return targetLayer;
	}

	/**
	 * Reads a TSV (tab-separated-values) file, returning an object containing found records and errors.
	 * Blank lines and those prefixed with `#` are ignored. A line ending in `\` continues on the next line.
	 * Include records from another file with `@path/to/include.txt` or the `@default` data file.
	 * @param {File} dataFile - A tab-separated-values file (object).
	 * @param {boolean} flgR - Internal flag for recursive calls (`@include`).
	 * @returns {{records: array, errors: { info: array, warn: array, fail: array }}}
	 */
	function parseDataFile(dataFile, flgR) {
		var record, part, include, includeFile;
		var records = [];
		var errors = { info: [], warn: [], fail: [] };
		var tmpData = [];
		var isHeaderFound = false;
		var line = 0;
		dataFile.open('r');
		while (!dataFile.eof) {
			line++;
			record = (part ? part.slice(0,-1) : '') + dataFile.readln();
			if (record.slice(-1) === '\\') { part = record; continue; } else { part = ''; } // '\': Line continues
			if (record.replace(/^\s+|\s+$/g, '') === '') continue; // Blank line, skip
			if (record.slice(0,1) === '\u0023') continue;          // '#': Comment line, skip
			if (record.slice(0,1) === '\u0040') {                  // '@': Include directive, parse file
				include = record.slice(1).replace(/^\s+|\s+$/g, '').replace(/^['"]+|['"]+$/g, '');
				includeFile = /^default(s?)$/i.test(include) ?
					getDataFile(decodeURI(dataFile.name).replace(/^_/, ''), true) : // Default data file
					File(include); // 'path/to/file.txt'
				if (includeFile && includeFile.exists) {
					if (includeFile.fullName === dataFile.fullName) continue; // Skip self
					tmpData = parseDataFile(includeFile, true);
					records = records.concat(tmpData.records);
					errors = {
						info: errors.info.concat(tmpData.errors.info),
						warn: errors.warn.concat(tmpData.errors.warn),
						fail: errors.fail.concat(tmpData.errors.fail)
					};
				} else {
					errors.warn.push((flgR ? decodeURI(dataFile.name) + ':' : 'Line ') + line +
					': \'' + include + '\' not found.');
				}
				continue;
			}
			if (!isHeaderFound) { isHeaderFound = true; continue; } // Header line, skip
			record = record.split(/ *\t */);
			checkRecord();
		}
		dataFile.close(); record = '';
		return { records: records, errors: { info: errors.info, warn: errors.warn, fail: errors.fail } };

		function checkRecord() {
			var tmpErrors = { info: [], warn: [], fail: [] };
			if (!record[0]) {
				tmpErrors.warn.push((flgR ? decodeURI(dataFile.name) + ':' : 'Line ') + line +
				': Missing layer name.');
			}
			if (tmpErrors.warn.length === 0 && tmpErrors.fail.length === 0) {
				records.push({
					name:        record[0],
					color:       record[1] ? getUIColor(record[1]) : UIColors.LIGHT_BLUE,
					isVisible:   record[2] ? (record[2].toLowerCase() === 'yes')   : true,
					isPrintable: record[3] ? (record[3].toLowerCase() === 'yes')   : true,
					isBelow:     record[4] ? (record[4].toLowerCase() === 'below') : false,
					variants:    record[5] ? (record[0] + ',' + record[5]).split(/ *, */) : ''
				});
			}
			errors = {
				info: errors.info.concat(tmpErrors.info),
				warn: errors.warn.concat(tmpErrors.warn),
				fail: errors.fail.concat(tmpErrors.fail)
			};

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
	}
}
