/*
	Default layers 22.9.15
	(c) 2020-2022 Paul Chiorean (jpeg@basement.ro)

	Adds/merges layers from a 6-column TSV file named 'layers.tsv':

	Name     | Color   | Visible | Printable | Order | Variants
	dielines | Magenta | yes     | yes       | above | cut*, decoupe, die, die*cut, stanz*
	template | Gray    | no      | no        | below
	...

	<Name>: layer name
	<Color>: layer color (defaults to Light Blue; see UIColors.txt for color names)
	<Visible>: 'yes' or 'no' (defaults to 'yes')
	<Printable>: 'yes' or 'no' (defaults to 'yes')
	<Order>: 'above' or 'below' existing layers (defaults to 'above')
	<Variants>: a list of layers that will be merged with the base layer (case insensitive; '*' and '?' wildcards accepted)

	The TSV file must be saved locally (in the active document folder or its parent folder) or as a global default
	(on the desktop, next to the script, or in Indentz root); local files and files starting with `_` take precedence.
	Blank lines and those prefixed with `#` are ignored. A line ending in `\` continues on the next line.
	Use `@defaults` to include the global default, or `@include path/to/another.tsv` for other file.
	The path can be absolute, or relative to the data file; a default path can be set with `@includepath path/to`.

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

// @includepath '.;./lib;../lib';
// @include 'getDataFile.jsxinc';
// @include 'isInArray.jsxinc';
// @include 'report.jsxinc';

app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined,
	UndoModes.ENTIRE_SCRIPT, 'Default layers');

function main() {
	var VERBOSITY = ScriptUI.environment.keyboardState.ctrlKey ? 2 : 1; // 0: FAIL, 1: +WARN, 2: +INFO
	var file, data, messages, oldActiveLayer, newLayer, tmpLayer, i;
	var dataFileName = 'layers.tsv';
	var counter = { add: 0, merge: 0 };

	if (doc.converted && VERBOSITY > 0) {
		alert('Can\'t get document path.\nThe document was converted from a previous InDesign version. ' +
			'The default layer substitution list will be used.');
	}
	if (!(file = getDataFile(dataFileName))) {
		if (VERBOSITY > 1) {
			alert('Can\'t locate a substitution list \'' + dataFileName +
			'\'.\nThe file must be saved in the current folder, on the ' +
			'desktop, or next to the script. Check docs for details.');
		}
		exit();
	}

	data = parseDataFile(file);
	if (data.status.fail.length > 0) { report(data.status.fail, decodeURI(file.getRelativeURI(doc.filePath))); exit(); }
	if (data.records.length > 0) {
		oldActiveLayer = doc.activeLayer; // Save active layer
		doc.layers.everyItem().properties = { locked: false }; // Unlock existing layers
		// Top layers
		for (i = data.records.length - 1; i >= 0; i--) {
			if (data.records[i].isBelow) continue;
			newLayer = makeLayer(
				data.records[i].name,
				data.records[i].color,
				data.records[i].isVisible,
				data.records[i].isPrintable,
				data.records[i].variants);
			if (i < data.records.length - 1) {
				tmpLayer = doc.layers.item(data.records[i + 1].name);
				if (tmpLayer.isValid && (newLayer.index > tmpLayer.index)) {
					data.status.info.push(data.records[i].source +
						'Moved \'' + newLayer.name + '\' above \'' + tmpLayer.name + '\'.');
					newLayer.move(LocationOptions.BEFORE, tmpLayer);
				}
			}
		}
		// Bottom layers
		for (i = 0; i < data.records.length; i++) {
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
	}
	if (VERBOSITY > 0) {
		messages = data.status.warn;
		if (VERBOSITY > 1) messages = messages.concat(data.status.info);
		if (messages.length > 0) report(messages, 'Layers: ' + counter.add + ' added | ' + counter.merge + ' merged');
		else if (VERBOSITY > 1 && (counter.add + counter.merge) === 0) alert('No layers added or merged.');
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
			data.status.info.push(data.records[i].source + 'Added \'' + targetLayer.name + '\'.');
		}
		// Merge variants
		layers = doc.layers.everyItem().getElements();
		while ((l = layers.shift())) {
			if (l.name !== variants[0] && isInArray(l.name, variants)) {
				oldLayerVisibility = l.visible;
				if (l === oldActiveLayer) oldActiveLayer = targetLayer;
				oldName = l.name;
				targetLayer.merge(l);
				targetLayer.visible = oldLayerVisibility;
				if (oldName !== targetLayer.name) {
					counter.merge++;
					data.status.info.push(data.records[i].source +
						'Merged \'' + oldName + '\' with \'' + targetLayer.name + '\'.');
				}
			}
		}
		return targetLayer;
	}

	/**
	 * Reads a TSV (tab-separated-values) file, returning an object containing found records and errors.
	 * Blank lines and those prefixed with `#` are ignored. A line ending in `\` continues on the next line.
	 * Use `@defaults` to include the global default, or `@include path/to/another.tsv` for other file.
	 * The path can be absolute, or relative to the data file; a default path can be set with `@includepath path/to`.
	 * @version 22.9.11
	 * @author Paul Chiorean <jpeg@basement.ro>
	 * @license MIT
	 * @param {File} dataFile - A tab-separated-values file (object).
	 * @returns {{records: array, status: { info: array, warn: array, fail: array }}}
	 */
	function parseDataFile(dataFile) {
		var record, part, source, includeFolder;
		var records = [];
		var status = { info: [], warn: [], fail: [] };
		var isHeaderFound = false;
		var line = 0;
		var includeFile = '';

		dataFile = File(compactRelPath(dataFile.absoluteURI));
		dataFile.open('r');
		dataFile.encoding = 'UTF-8';
		includeFolder = Folder(dataFile.path);

	while (!dataFile.eof) {
			line++;
			source = decodeURI(dataFile.absoluteURI) + ':' + line + ' :: ';
			record = (part ? part.slice(0,-1) : '') + dataFile.readln();
			if (record.slice(-1) === '\\') { part = record; continue; } else { part = ''; } // '\': Line continues
			if (record.replace(/^\s+|\s+$/g, '') === '') continue;            // Blank line, skip
			if (record.slice(0,1) === '\u0023') continue;                     // '#': Comment line, skip
			if (record.slice(0,1) === '\u0040') { parseInclude(); continue; } // '@': Include directive, parse
			if (!isHeaderFound) { isHeaderFound = true; continue; }           // Header line, skip
			record = record.replace(/#.+$/g, '');    // Trim end comment
			record = record.replace(/^ +| +$/g, ''); // Trim spaces at both ends
			record = record.split(/ *\t */); // Split on \t & trim spaces
			checkRecord();
		}
		dataFile.close();
		record = '';

		return {
			records: records,
			status: { info: status.info, warn: status.warn, fail: status.fail }
		};

		function compactRelPath(/*string*/str) {
			str = str.replace(/^\.\/|\/\.$/, '').replace(/\/\.\//g, '/'); // Trim '.'
			str = str.replace(/\/[^\/]+\/\.{2}/g, '/'); // Resolve '..'
			str = str.replace(/\/+/g, '/'); // Compact '//'
			return str;
		}

		// Get unique array elements
		// http://indisnip.wordpress.com/2010/08/24/findchange-missing-font-with-scripting/
		function unique(/*array*/array) {
			var i, j;
			var r = [];
			o: for (i = 0; i < array.length; i++) {
				for (j = 0; j < r.length; j++) if (r[j] === array[i]) continue o;
				if (array[i] !== '') r[r.length] = array[i];
			}
			return r;
		}

		function parseInclude() {
			var tmpData = [];
			var include = record.replace(/['"]+/g, '').replace(/\s+$/g, '');
			include = include.match(/^@(include(?:path)?|defaults|default)(?: +)?(.+)?$/i);
			if (!include) {
				status.warn.push(source + '\'' + record + '\' is not recognized (see docs).');
				return;
			}

			switch (include[1]) {
				case 'includepath':
					if (include[2]) {
						if (!/^~?\/{1,2}/.test(include[2])) include[2] = Folder(dataFile.path).absoluteURI + '/' + include[2];
						include[2] = compactRelPath(include[2]);
						if (Folder(include[2]).exists) includeFolder = Folder(include[2]);
						else status.warn.push(source + '\'' + include[2] + '\' not found.');
					} else {
						status.warn.push(source + '\'' + record + '\' is malformed (see docs).');
					}
					return;
				case 'include':
					if (include[2]) {
						if (!/^~?\/{1,2}/.test(include[2])) include[2] = includeFolder.absoluteURI + '/' + include[2];
						include[2] = compactRelPath(include[2]);
						if (!/\.(tsv|txt)$/i.test(include[2])) {
							status.warn.push(source + '\'' + decodeURI(include[2]) + '\' is not a TSV file.');
							return;
						}
						if (File(include[2]).exists) {
							includeFile = File(include[2]);
						} else {
							status.warn.push(source + '\'' + decodeURI(include[2]) + '\' not found.');
							return;
						}
					} else {
						status.warn.push(source + '\'' + record + '\' is malformed (see docs).');
						return;
					}
					break;
				case 'default':
				case 'defaults':
					includeFile = getDataFile(dataFileName, true);
					if (!includeFile || !includeFile.exists) {
						status.info.push(source + 'Default list \'' + decodeURI(dataFileName) + '\' not found.');
						return;
					}
					break;
			}

			if (includeFile.absoluteURI === dataFile.absoluteURI) return; // Skip self
			tmpData = parseDataFile(includeFile);
			records = records.concat(tmpData.records);
			status = {
				info: status.info.concat(tmpData.status.info),
				warn: status.warn.concat(tmpData.status.warn),
				fail: status.fail.concat(tmpData.status.fail)
			};
		}

		function checkRecord() {
			var tmpStatus = { info: [], warn: [], fail: [] };
			var tmpRecord = {
				source:      source,
				name:        record[0],
				color:       record[1] ? getUIColor(record[1]) : UIColors.LIGHT_BLUE,
				isVisible:   record[2] ? (record[2].toLowerCase() === 'yes')   : true,
				isPrintable: record[3] ? (record[3].toLowerCase() === 'yes')   : true,
				isBelow:     record[4] ? (record[4].toLowerCase() === 'below') : false,
				variants:    record[5] ? unique((record[0] + ',' + record[5]).split(/ *, */)) : [ record[0] ]
			};
			if (!tmpRecord.name) tmpStatus.fail.push(tmpRecord.source + 'Missing layer name.');
			if (tmpStatus.warn.length === 0 && tmpStatus.fail.length === 0) records.push(tmpRecord);
			status = {
				info: status.info.concat(tmpStatus.info),
				warn: status.warn.concat(tmpStatus.warn),
				fail: status.fail.concat(tmpStatus.fail)
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
