/*
	Default swatches 22.8.10
	(c) 2020-2022 Paul Chiorean (jpeg@basement.ro)

	Adds swatches from a 5-column TSV file named 'swatches.txt':

	Name       | Color Model | Color Space | Values       | Variants
	Rich Black | process     | cmyk        | 60 40 40 100 |
	RGB Grey   | process     | rgb         | 128 128 128  |
	Cut        | spot        | cmyk        | 0 100 0 0    | couper, diecut
	...
	1. <Name>: swatch name
	2. <Color Model>: 'process' or 'spot' (default 'process')
	3. <Color Space>: 'cmyk', 'rgb' or 'lab' (default 'cmyk')
	4. <Values>: 3 values in 0–255 range for RGB,
	   4 values in 0–100 range for CMYK,
	   3 values in 0–100 (L), -128–127 (A and B) range for Lab
	5. <Variants>: a list of swatches that will be replaced by the base swatch
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
	var counter = { add: 0, merge: 0 };
	if (doc.converted && VERBOSITY > 0) {
		alert('Can\'t get document path.\nThe document was converted from a previous InDesign version. ' +
		'The default swatch substitution list will be used.');
	}

	if (!(file = getDataFile('swatches.txt'))) {
		if (VERBOSITY > 1) {
			alert('Can\'t locate a swatch substitution list.\nThe file must be saved in the current folder, ' +
			'on the desktop, or next to the script. Check docs for details.');
		}
		exit();
	}

	data = parseDataFile(file);
	if (data.errors.fail.length > 0) { report(data.errors.fail, decodeURI(file.getRelativeURI(doc.filePath))); exit(); }
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
		messages = data.errors.warn;
		if (VERBOSITY > 1) messages = messages.concat(data.errors.info);
		if (messages.length > 0) report(messages, 'Swatches: ' + counter.add + ' added | ' + counter.merge + ' merged');
	}

	function addSwatch(name, model, space, values, variants) {
		var c, oldName, colors;
		var newColor = doc.colors.itemByName(name);
		if (newColor.isValid) {
			newColor.properties = {
				model:      model,
				space:      space,
				colorValue: values
			};
		} else {
			newColor = doc.colors.add({
				name:       name,
				model:      model || ColorModel.PROCESS,
				space:      space || ColorSpace.CMYK,
				colorValue: values
			});
			counter.add++;
			data.errors.info.push('Added \'' + newColor.name + '\'.');
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
					data.errors.info.push('Merged \'' + oldName + '\' with \'' + newColor.name + '\'.');
				} catch (e) {
					data.errors.warn.push('Could not merge \'' + c.name + '\' with \'' + newColor.name + '\'.');
				}
			}
		}
		return newColor;
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
		dataFile.encoding = 'UTF-8';
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
			record = record.replace(/^\s+|\s+$/g, '');
			record = record.split(/ *\t */);
			checkRecord();
		}
		dataFile.close(); record = '';
		return { records: records, errors: { info: errors.info, warn: errors.warn, fail: errors.fail } };

		function checkRecord() {
			var tmpErrors = { info: [], warn: [], fail: [] };
			var tmpRecord = {
				name:   record[0],
				model:  getColorModel(record[1]),
				space:  getColorSpace(record[2]),
				values: getColorValues(record[3])
			};
			tmpRecord.variants = unique((getCVName(record[2], tmpRecord.values) +
				(record[4] ? ',' + record[4] : '')).split(/ *, */));

			// [TODO] Add model/space/values validation
			if (!tmpRecord.name) {
				tmpErrors.warn.push((flgR ? decodeURI(dataFile.name) + ':' : 'Line ') + line +
					': Skipped: missing swatch name.');
			}

			if (tmpErrors.warn.length === 0 && tmpErrors.fail.length === 0) records.push(tmpRecord);
			errors = {
				info: errors.info.concat(tmpErrors.info),
				warn: errors.warn.concat(tmpErrors.warn),
				fail: errors.fail.concat(tmpErrors.fail)
			};

			function getColorModel(cModel) {
				return {
					process: ColorModel.PROCESS,
					spot:    ColorModel.SPOT
				}[cModel] || ColorModel.PROCESS;
			}

			function getColorSpace(cSpace) {
				return {
					cmyk: ColorSpace.CMYK,
					rgb:  ColorSpace.RGB,
					lab:  ColorSpace.LAB
				}[cSpace] || ColorSpace.CMYK;
			}

			function getColorValues(cVal) {
				var v;
				var array = [];
				cVal = /[,|\/]/.test(cVal) ? cVal.split(/ *[,|\/] */) : cVal.split(/ +/);
				while ((v = cVal.shift())) array.push(Number(v));
				return array;
			}

			function getCVName(cSpace, cVal) {
				return {
					cmyk: $.global.localize('C=%1 M=%2 Y=%3 K=%4', cVal[0], cVal[1], cVal[2], cVal[3]),
					rgb:  $.global.localize('R=%1 G=%2 B=%3', cVal[0], cVal[1], cVal[2]),
					lab:  $.global.localize('L=%1 a=%2 b=%3', cVal[0], cVal[1], cVal[2], cVal[3])
				}[cSpace];
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
		}
	}
}
