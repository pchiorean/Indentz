/*
	Default swatches 22.9.11
	(c) 2020-2022 Paul Chiorean (jpeg@basement.ro)

	Adds swatches from a 5-column TSV file named `swatches.tsv`:

	Name       | Color Model | Color Space | Values       | Variants
	Rich Black | process     | cmyk        | 60 40 40 100 |
	RGB Grey   | process     | rgb         | 128 128 128  |
	Cut        | spot        | cmyk        | 0 100 0 0    | couper, diecut
	...

	<Name>: swatch name
	<Color model>: `process` or `spot` (defaults to `process`)
	<Color space>: `cmyk`, `rgb` or `lab` (defaults to `cmyk`)
	<Values>: (can be separated by ` `, `,`, `|` or `/`)
		3 values in 0-255 range for RGB;
		4 values in 0-100 range for CMYK;
		3 values in 0-100 (L), -128-127 (A and B) range for Lab
	<Variants>: a list of swatches that will be replaced by the base swatch (case insensitive; `*` and `?` wildcards accepted)

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
// @include 'progressBar.jsxinc';
// @include 'report.jsxinc';

app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined,
	UndoModes.ENTIRE_SCRIPT, 'Default swatches');

function main() {
	var VERBOSITY = ScriptUI.environment.keyboardState.ctrlKey ? 2 : 1; // 0: FAIL, 1: +WARN, 2: +INFO
	var file, data, messages, i, n, progressBar;
	var dataFileName = 'swatches.tsv';
	var counter = { add: 0, merge: 0 };

	if (doc.converted && VERBOSITY > 0) {
		alert('Can\'t get document path.\nThe document was converted from a previous InDesign version. ' +
		'The default swatch substitution list will be used.');
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
		if (data.records.length > 9) progressBar = new ProgressBar('Default swatches', data.records.length);
		for (i = 0, n = data.records.length; i < n; i++) {
			if (progressBar) progressBar.update();
			addSwatch(
				data.records[i].name,
				data.records[i].model,
				data.records[i].space,
				data.records[i].values,
				data.records[i].variants
			);
		}
	}

	if (progressBar) progressBar.close();
	if (VERBOSITY > 0) {
		messages = data.status.warn;
		if (VERBOSITY > 1) messages = messages.concat(data.status.info);
		if (messages.length > 0) report(messages, 'Swatches: ' + counter.add + ' added | ' + counter.merge + ' merged');
		else if (VERBOSITY > 1 && (counter.add + counter.merge) === 0) alert('No swatches added or merged.');
	}

	function addSwatch(name, model, space, values, variants) {
		var c, oldName, colors;
		var newColor = doc.colors.itemByName(name);
		if (newColor.isValid) {
			newColor.properties = {
				model: model,
				space: space,
				colorValue: values
			};
		} else {
			newColor = doc.colors.add({
				name: name,
				model: model || ColorModel.PROCESS,
				space: space || ColorSpace.CMYK,
				colorValue: values
			});
			counter.add++;
			data.status.info.push(data.records[i].source + 'Added \'' + newColor.name + '\'.');
		}
		// Merge variants
		colors = doc.colors.everyItem().getElements();
		while ((c = colors.shift())) {
			if (c === newColor) continue;
			if (/^(Registration|Paper|Black|Cyan|Magenta|Yellow)$/ // Skip standard colors
				.test($.global.localize(c.name))) continue;
			if (c.name === '') continue; // Skip unnamed colors
			if (isInArray(c.name, variants)) {
				try {
					oldName = c.name;
					c.remove(newColor);
					counter.merge++;
					data.status.info.push(data.records[i].source +
						'Merged \'' + oldName + '\' with \'' + newColor.name + '\'.');
				} catch (e) {
					data.status.warn.push(data.records[i].source +
						'Could not merge \'' + c.name + '\' with \'' + newColor.name + '\'.');
				}
			}
		}
		return newColor;
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
			if (record.replace(/^\s+|\s+$/g, '') === '') continue; // Blank line, skip
			if (record.slice(0,1) === '\u0023') continue; // '#': Comment line, skip
			if (record.slice(0,1) === '\u0040') { parseInclude(); continue; } // '@': Include directive, parse
			if (!isHeaderFound) { isHeaderFound = true; continue; } // Header line, skip
			record = record.replace(/^ +| +$/g, '');
			record = record.split(/ *\t */);
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
						if (!/^~?\/{1,2}/.test(include[2])) include[2] = includeFolder.absoluteURI + '/' + include[2];
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
						if (File(include[2]).exists) {
							includeFile = File(include[2]);
						} else {
							status.warn.push(source + '\'' + include[2] + '\' not found.');
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
						status.info.push(source + 'Default list \'' + dataFileName + '\' not found.');
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
				source: source,
				name:   record[0],
				model:  getColorModel(record[1]),
				space:  getColorSpace(record[2]),
				values: getColorValues(record[3])
			};
			tmpRecord.variants = unique((getCVName(record[2], tmpRecord.values) +
				(record[4] ? ',' + record[4] : '')).split(/ *, */));
			// [TODO] Add model/space/values validation
			if (tmpRecord.name.length === 0) tmpStatus.fail.push(tmpRecord.source + 'Missing swatch name.');
			if (tmpStatus.warn.length === 0 && tmpStatus.fail.length === 0) records.push(tmpRecord);
			status = {
				info: status.info.concat(tmpStatus.info),
				warn: status.warn.concat(tmpStatus.warn),
				fail: status.fail.concat(tmpStatus.fail)
			};

			function getColorModel(/*string*/cModel) {
				return {
					process: ColorModel.PROCESS,
					spot:    ColorModel.SPOT
				}[cModel] || ColorModel.PROCESS;
			}

			function getColorSpace(/*string*/cSpace) {
				return {
					cmyk: ColorSpace.CMYK,
					rgb:  ColorSpace.RGB,
					lab:  ColorSpace.LAB
				}[cSpace] || ColorSpace.CMYK;
			}

			function getColorValues(/*string*/cVal) {
				var v;
				var array = [];
				cVal = /[,|\/]/.test(cVal) ? cVal.split(/ *[,|\/] */) : cVal.split(/ +/);
				while ((v = cVal.shift())) array.push(Number(v));
				return array;
			}

			function getCVName(/*string*/cSpace, /*string*/cVal) {
				return {
					cmyk: $.global.localize('C=%1 M=%2 Y=%3 K=%4', cVal[0], cVal[1], cVal[2], cVal[3]),
					rgb:  $.global.localize('R=%1 G=%2 B=%3', cVal[0], cVal[1], cVal[2]),
					lab:  $.global.localize('L=%1 a=%2 b=%3', cVal[0], cVal[1], cVal[2], cVal[3])
				}[cSpace];
			}
		}
	}
}
