/*
	Default swatches 23.10.6
	(c) 2020-2023 Paul Chiorean <jpeg@basement.ro>

	Adds swatches using a 5-column TSV file named `swatches.tsv`:

	Name       | Color Model | Color Space | Values       | Variants
	Rich Black | process     | cmyk        | 60 40 40 100 |
	RGB Grey   | process     | rgb         | 128 128 128  |
	Cut        | spot        | cmyk        | 0 100 0 0    | couper, die*cut
	...

	<Name>: swatch name
	<Color model>: `process` or `spot` (defaults to `process`)
	<Color space>: `cmyk`, `rgb` or `lab` (defaults to `cmyk`)
	<Values>: a list of numbers separated by space (` `), comma (`,`), pipe (`|`) or slash (`/`):
	- 3 values in 0-255 range for RGB
	- 4 values in 0-100 range for CMYK
	- 3 values in 0-100 (L), -128-127 (A and B) range for Lab
	<Variants>: a list of swatches separated by comma (`,`) that will be replaced by the base swatch
		(case insensitive; `*` and `?` wildcards accepted)

	The TSV file must be saved locally (in the active document folder or its parent) or as a global
	default (on the desktop, next to the script, or in Indentz root); local files and those starting
	with `_` take precedence. Blank lines are ignored; everything after a `#` (comments) is ignored.
	A line ending in `\` continues on the next line. Use `@defaults` to include the global default,
	or `@include path/to/another.tsv` for other data file. The path can be absolute, or by default
	relative to the data file; a new default path can be set with `@includepath path/to`.

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
// @include 'unique.jsxinc';

app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, 'Default swatches');

function main() {
	var title = 'Default swatches';
	var dataFileName = [ 'swatches.tsv', 'swatches.txt' ];
	var VERBOSITY = ScriptUI.environment.keyboardState.ctrlKey ? 2 : 1; // 0: only errors, 1: + warnings, 2: + infos
	var file, messages, progressBar, i;
	var parsed = { header: [], data: [], errors: [] };
	var data = { records: [], status: { info: [], warn: [], error: [] } };
	var counter = { add: 0, merge: 0 };
	var docHasPath = (function () {
		var ret = false;
		try { ret = !!doc.filePath; } catch (e) {}
		return ret;
	}());

	if (!docHasPath && VERBOSITY > 1)
		alert('Can\'t get document path.\nThe default swatch substitution list will be used.');

	// Get raw data from TSV
	if (!(file = getDataFile(dataFileName))) { // No data file found
		if (VERBOSITY > 1) {
			alert('Can\'t locate a substitution list \''
				+ (dataFileName.constructor.name === 'Array' ? dataFileName.join('\' or \'') : dataFileName)
				+ '\'.\nThe file must be saved in the current folder, on the desktop, or next to the script. '
				+ 'Check docs for details.');
		}
		exit();
	}
	parsed = parseDataFile(file, dataFileName);
	if (parsed.errors.length > 0) { report(parsed.errors, title); exit(); }

	// Build structured data
	for (i = 0; i < parsed.data.length; i++)
		data.records[i] = checkRecord(parsed.data[i].record);
	if (data.status.error.length > 0) { report(data.status.error, title); exit(); }

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
		var getCVName = {
			C0_M0_Y0_K0: function (/*string*/cSpace, /*string*/cVal) {
				return {
					cmyk: $.global.localize('C=%1 M=%2 Y=%3 K=%4', cVal[0], cVal[1], cVal[2], cVal[3]),
					rgb:  $.global.localize('R=%1 G=%2 B=%3', cVal[0], cVal[1], cVal[2]),
					lab:  $.global.localize('L=%1 a=%2 b=%3', cVal[0], cVal[1], cVal[2])
				}[cSpace];
			},
			c0m0y0k0: function (/*string*/cSpace, /*string*/cVal) {
				return {
					cmyk: $.global.localize('c%1m%2y%3k%4', cVal[0], cVal[1], cVal[2], cVal[3]),
					rgb:  $.global.localize('r%1g%2b%3', cVal[0], cVal[1], cVal[2]),
					lab:  $.global.localize('l%1a%2b%3', cVal[0], cVal[1], cVal[2])
				}[cSpace];
			}
		};

		tmpData.source = parsed.data[i].source.join(':');

		// Swatch name
		tmpData.name = record[0];
		if (!tmpData.name) stat(data.status, tmpData.source + ':1', 'Missing swatch name.', -1);

		// Color model (optional)
		if (!record[1]) stat(data.status, tmpData.source + ':2', 'Missing Color model, using Process.', 0);
		tmpData.model = (function (str) {
			return { // str => enum
				process: ColorModel.PROCESS,
				spot:    ColorModel.SPOT
			}[str] || ColorModel.PROCESS; // Default value
		}(record[1]));

		// Color space (optional)
		if (!record[1]) stat(data.status, tmpData.source + ':3', 'Missing Color space, using CMYK.', 0);
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
			if ((tmpData.space === ColorSpace.CMYK && tmpData.values.length !== 4)
				|| (tmpData.space === ColorSpace.RGB && tmpData.values.length !== 3)
				|| (tmpData.space === ColorSpace.LAB && tmpData.values.length !== 3))
				stat(data.status, tmpData.source + ':4', 'Mismatched color values.', -1);
		} else {
			stat(data.status, tmpData.source + ':4', 'Missing color values.', -1);
		}

		// Swatch variants (optional)
		tmpData.variants = [];
		if (tmpData.name) tmpData.variants.push(tmpData.name.toLowerCase());
		if (tmpData.values) {
			tmpData.variants.push(getCVName.C0_M0_Y0_K0(tmpData.space.toString().toLowerCase(), tmpData.values));
			tmpData.variants.push(getCVName.c0m0y0k0(tmpData.space.toString().toLowerCase(), tmpData.values));
		}
		if (record[4]) tmpData.variants = tmpData.variants.concat(record[4].split(/ *, */));
		if (tmpData.variants.length > 2) tmpData.variants = unique(tmpData.variants);

		if (data.status.error.length > 0) return false;
		return tmpData;
	}

	function addSwatch(name, model, space, values, variants) {
		var c, oldName, colors;
		var newSwatch = doc.colors.itemByName(name);

		if (newSwatch.isValid) { // Swatch exists, just update properties
			newSwatch.properties = {
				model: model,
				space: space,
				colorValue: values
			};
		} else { // Add swatch
			try {
				newSwatch = doc.colors.add({
					name: name,
					model: model || ColorModel.PROCESS,
					space: space || ColorSpace.CMYK,
					colorValue: values
				});
				counter.add++;
				stat(data.status, data.records[i].source, 'Added \'' + newSwatch.name + '\'.', 0);
			} catch (e) {
				stat(data.status, data.records[i].source, 'Could not add \'' + name + '\'.'
					+ ' Reason: ' + e.toString().replace(/\r|\n/g, '\u00B6'), 1);
				return false;
			}
		}
		if (ScriptUI.environment.keyboardState.keyName === 'Escape') exit();

		// Merge variants
		colors = doc.colors.everyItem().getElements();
		while ((c = colors.shift())) {
			if (c === newSwatch) continue; // Skip self
			if (/^(Registration|Paper|Black|Cyan|Magenta|Yellow)$/ // Skip standard colors
				.test($.global.localize(c.name))) continue;
			if (c.name === '') continue; // Skip unnamed colors
			if (variants.length > 0 && isInArray(c.name, variants)) {
				try {
					oldName = c.name;
					c.remove(newSwatch);
					counter.merge++;
					stat(data.status, data.records[i].source,
						'Merged \'' + oldName + '\' with \'' + newSwatch.name + '\'.', 0);
				} catch (e) {
					stat(data.status, data.records[i].source,
						'Could not merge \'' + c.name + '\' with \'' + newSwatch.name + '\'.'
							+ ' Reason: ' + e.toString().replace(/\r|\n/g, '\u00B6'), 1);
				}
			}
			if (ScriptUI.environment.keyboardState.keyName === 'Escape') exit();
		}
		return newSwatch;
	}
}
