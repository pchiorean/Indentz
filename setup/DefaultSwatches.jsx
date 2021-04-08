/*
	Default swatches v1.13.2 (2021-01-22)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Adds swatches from a 3-column TSV file:

	Name | Model | Values
	Rich Black | process | 60|40|40|100
	Cut | spot | 0|100|0|0
	...
	1. <Name>: swatch name,
	2. <Model>: color model: "process" or "spot",
	3. <Values>: a list of 3 (RGB) or 4 (CMYK) color values.

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
if (!(infoFile = TSVFile("swatches.txt"))) { alert("File 'swatches.txt' not found."); exit() }

app.doScript(main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "Default swatches");


function main() {
	infoFile.open("r");
	var infoLine, header, data = [],
		line = 0, flgHeader = false,
		errors = [], errln, errfn = infoFile.fullName + "\n";
	while (!infoFile.eof) {
		infoLine = infoFile.readln(); line++;
		if (infoLine == "") continue; // Skip empty lines
		if (infoLine.toString().slice(0,1) == "\u0023") continue; // Skip lines beginning with '#'
		infoLine = infoLine.split(/ *\t */);
		errln = "Line " + line + ": ";
		if (!flgHeader) { header = infoLine; flgHeader = true; continue } // 1st line is header
		if (!infoLine[0]) errors.push(errln + "Missing swatch name.");
		if (errors.length == 0) data.push({
			name: infoLine[0],
			model: GetColorModel(infoLine[1]),
			values: GetColorValues(infoLine[2])
		});
	}
	infoFile.close(); infoLine = "";
	if (errors.length > 0) { alert(errfn + errors.join("\n")); exit() }
	if (data.length < 1) exit();

	for (var i = 0; i < data.length; i++) {
		ColorAdd(doc,
			data[i].name,
			data[i].model,
			data[i].values
		);
	}
}

function TSVFile(fn) {
	var file = "";
	if (doc.saved && (file = File(app.activeDocument.filePath + "/_" + fn)) && file.exists) return file;
	if (doc.saved && (file = File(app.activeDocument.filePath + "/" + fn)) && file.exists) return file;
	if ((file = File(Folder.desktop + "/" + fn)) && file.exists) return file;
	if ((file = File(app.activeScript.path + "/" + fn)) && file.exists) return file;
	if ((file = File(app.activeScript.path + "/../" + fn)) && file.exists) return file;
}

function GetColorModel(color) {
	return {
		"process": ColorModel.PROCESS,
		"spot": ColorModel.SPOT
	}[color] || ColorModel.PROCESS;
}

function GetColorValues(array) {
	var values = [], c;
	array = array.split(/ *\| */);
	while (c = array.shift()) values.push(Number(c));
	return values;
}

// Add Custom (CMYK/RGB/HEX) Colors to Document, by Marijan Tompa (tomaxxi)
// https://indisnip.wordpress.com/2010/09/11/quicktip-add-custom-cmykrgbhex-colors-to-document/
function ColorAdd(doc, name, model, values) {
	if (values instanceof Array == false) {
		values = [
			(parseInt(values, 16) >> 16) & 0xff,
			(parseInt(values, 16) >> 8) & 0xff,
			 parseInt(values, 16) & 0xff
		];
		space = ColorSpace.RGB;
	} else {
		if (values.length == 3) space = ColorSpace.RGB;
		else space = ColorSpace.CMYK;
	}
	try {
		color = doc.colors.item(name);
		name = color.name;
	} catch (_) {
		color = doc.colors.add({
			name: name,
			model: model,
			space: space,
			colorValue: values
		});
	}
	return color;
}
