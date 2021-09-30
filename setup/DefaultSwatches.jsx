/*
	Default swatches v4.3.4 (2021-09-30)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

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
	UndoModes.ENTIRE_SCRIPT, 'Default swatches');

function main() {
	var dataFile = getDataFile('swatches.txt');
	if (!dataFile) { alert('No data file found.'); exit(); }
	var data = parseInfo(dataFile);
	if (data.errors.length > 0) { report(data.errors, decodeURI(dataFile.getRelativeURI(doc.filePath))); exit(); }
	if (data.records.length === 0) exit();

	for (var i = 0, n = data.records.length; i < n; i++) {
		addSwatch(
			data.records[i].name,
			data.records[i].model,
			data.records[i].space,
			data.records[i].values,
			data.records[i].variants
		);
	}

	function addSwatch(name, model, space, values, variants) {
		var c, colors;
		var color = doc.colors.itemByName(name);
		if (color.isValid) {
			color.properties = {
				model:      model,
				space:      space,
				colorValue: values
			};
		} else {
			color = doc.colors.add({
				name:       name,
				model:      model || ColorModel.PROCESS,
				space:      space || ColorSpace.CMYK,
				colorValue: values
			});
		}
		// Merge variants
		if (variants.length > 0) {
			colors = doc.colors.everyItem().getElements();
			while ((c = colors.shift())) {
				if (c === color) continue;
				if (isIn(c.name, variants)) try { c.remove(color); } catch (e) {}
			}
		}
		return color;
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
			if (!infoLine[0]) errors.push('Line ' + line + ': Missing swatch name.');
			if (errors.length === 0) {
				// [TODO] Data validation
				records.push({
					name:     infoLine[0],
					model:    getColorModel(infoLine[1]),
					space:    getColorSpace(infoLine[2]),
					values:   getColorValues(infoLine[3]),
					variants: infoLine[4] ? infoLine[4].split(/ *, */) : ''
				});
			}
		}
	}
	dataFile.close(); infoLine = '';
	return { records: records, errors: errors };

	function getColorModel(model) {
		return {
			process: ColorModel.PROCESS,
			spot:    ColorModel.SPOT
		}[model] || ColorModel.PROCESS;
	}

	function getColorSpace(space) {
		return {
			cmyk: ColorSpace.CMYK,
			rgb:  ColorSpace.RGB,
			lab:  ColorSpace.LAB
		}[space] || ColorSpace.CMYK;
	}

	function getColorValues(values) {
		var c;
		var array = [];
		values = /[,|]/.test(values) ? values.split(/ *[,|] */) : values.split(/ +/);
		while ((c = values.shift())) array.push(Number(c));
		return array;
	}
}
