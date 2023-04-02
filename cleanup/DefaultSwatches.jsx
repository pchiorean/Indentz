/*
	Default swatches 23.4.2
	(c) 2020-2023 Paul Chiorean <jpeg@basement.ro>

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
	<Variants>: a list of swatches that will be replaced by the base swatch
		(case insensitive; `*` and `?` wildcards accepted)

	The TSV file must be saved locally (in the active document folder or its parent folder) or as a global default
	(on the desktop, next to the script, or in Indentz root); local files and files starting with `_` take precedence.
	Blank lines and those starting with `#` are ignored. A line ending in `\` continues on the next line.
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
// @include 'isInArray.jsxinc';
// @include 'parseDataFile.jsxinc';
// @include 'progressBar.jsxinc';
// @include 'report.jsxinc';

app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined,
	UndoModes.ENTIRE_SCRIPT, 'Default swatches');

function main() {
	var title = 'Default swatches';
	var dataFileName = [ 'swatches.tsv', 'swatches.txt' ];
	var VERBOSITY = ScriptUI.environment.keyboardState.ctrlKey ? 2 : 1; // 0: FAIL, 1: +WARN, 2: +INFO
	var file, messages, progressBar, i;
	var parsed = { header: [], data: [], errors: [] };
	var data = { records: [], status: { info: [], warn: [], fail: [] } };
	var counter = { add: 0, merge: 0 };
	var docHasPath = (function () {
		var ret = false;
		try { ret = !!doc.filePath; } catch (e) {}
		return ret;
	}());

	if (!docHasPath && VERBOSITY > 0)
		alert('Can\'t get document path.\nThe default swatch substitution list will be used.');

	// Get raw data from TSV
	if (!(file = getDataFile(dataFileName))) { // No data file found
		if (VERBOSITY > 1) {
			alert('Can\'t locate a substitution list \'' +
				(dataFileName.constructor.name === 'Array' ? dataFileName.join('\' or \'') : dataFileName) +
				'\'.\nThe file must be saved in the current folder, on the desktop, or next to the script. ' +
				'Check docs for details.');
		}
		exit();
	}
	parsed = parseDataFile(file, dataFileName);
	if (parsed.errors.length > 0) { report(parsed.errors, title); exit(); }

	// Build structured data
	for (i = 0; i < parsed.data.length; i++)
		data.records[i] = checkRecord(parsed.data[i].record);
	if (data.status.fail.length > 0) { report(data.status.fail, title); exit(); }

	// Processing
	if (data.records.length > 9) progressBar = new ProgressBar(title, data.records.length);
	for (i = 0; i < data.records.length; i++) {
		if (progressBar) progressBar.update();
		addSwatch(
			data.records[i].name,
			data.records[i].model,
			data.records[i].space,
			data.records[i].values,
			data.records[i].variants
		);
		if (ScriptUI.environment.keyboardState.keyName === 'Escape') exit();
	}

	// Closing up
	if (progressBar) progressBar.close();
	if (VERBOSITY > 0) {
		messages = data.status.warn;
		if (VERBOSITY > 1) messages = messages.concat(data.status.info);
		if (messages.length > 0)
			report(messages, 'Swatches: ' + counter.add + ' added | ' + counter.merge + ' merged', 'auto');
		else if (VERBOSITY > 1 && (counter.add + counter.merge) === 0) alert('No swatches added or merged.');
	}

	function checkRecord(/*array*/record) {
		var tmpData = {};

		tmpData.source = parsed.data[i].source.join(':');

		// Swatch name
		tmpData.name = record[0];
		if (!tmpData.name) stat(data.status, tmpData.source + ':1', 'Missing swatch name.', -1);

		// Color model (optional)
		tmpData.model = (function (str) {
			return { // str => enum
				process: ColorModel.PROCESS,
				spot:    ColorModel.SPOT
			}[str] || ColorModel.PROCESS; // Default value
		}(record[1]));

		// Color space (optional)
		tmpData.space = (function (str) {
			return { // str => enum
				cmyk: ColorSpace.CMYK,
				rgb:  ColorSpace.RGB,
				lab:  ColorSpace.LAB
			}[str] || ColorSpace.CMYK; // Default value
		}(record[2]));

		// Color values
		if (record[3]) {
			tmpData.values = (function (str) {
				var v;
				var array = [];
				str = /[,|\/]/.test(str) ? str.split(/ *[,|\/] */) : str.split(/ +/);
				while ((v = str.shift())) array.push(Number(v));
				return array;
			}(record[3]));
			if ((tmpData.space === ColorSpace.CMYK && tmpData.values.length !== 4) ||
				(tmpData.space === ColorSpace.RGB  && tmpData.values.length !== 3) ||
				(tmpData.space === ColorSpace.LAB  && tmpData.values.length !== 3))
				stat(data.status, tmpData.source + ':4', 'Mismatched color values.', -1);
		} else {
			stat(data.status, tmpData.source + ':4', 'Missing color values.', -1);
		}

		// Swatch variants (optional)
		if (tmpData.values) {
			tmpData.variants = (function (str) {
			return unique((getCVName(tmpData.space.toString().toLowerCase(), tmpData.values) +
				(str ? ',' + str : '')).split(/ *, */));

				function getCVName(/*string*/cSpace, /*string*/cVal) {
					return {
						cmyk: $.global.localize('C=%1 M=%2 Y=%3 K=%4', cVal[0], cVal[1], cVal[2], cVal[3]),
						rgb:  $.global.localize('R=%1 G=%2 B=%3', cVal[0], cVal[1], cVal[2]),
						lab:  $.global.localize('L=%1 a=%2 b=%3', cVal[0], cVal[1], cVal[2], cVal[3])
					}[cSpace];
				}
			}(record[4]));
		}

		if (data.status.fail.length > 0) return false;
		return tmpData;
	}

	function addSwatch(name, model, space, values, variants) {
		var c, oldName, colors;
		var newColor = doc.colors.itemByName(name);

		if (newColor.isValid) { // Swatch exists
			newColor.properties = {
				model: model,
				space: space,
				colorValue: values
			};
		} else { // Add swatch
			try {
				newColor = doc.colors.add({
					name: name,
					model: model || ColorModel.PROCESS,
					space: space || ColorSpace.CMYK,
					colorValue: values
				});
				counter.add++;
				stat(data.status, data.records[i].source, 'Added \'' + newColor.name + '\'.', 0);
			} catch (e) {
				stat(data.status, data.records[i].source, 'Could not add \'' + name + '\'.', 1);
				return false;
			}
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
					stat(data.status, data.records[i].source,
						'Merged \'' + oldName + '\' with \'' + newColor.name + '\'.', 0);
				} catch (e) {
					stat(data.status, data.records[i].source,
						'Could not merge \'' + c.name + '\' with \'' + newColor.name + '\'.', 1);
				}
			}
		}
		return newColor;
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
