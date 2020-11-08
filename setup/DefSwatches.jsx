/*
	Make default swatches v1.0.0
	© November 2020, Paul Chiorean
	Adds default swatches from a list.

	The list is a 3-column TSV file with the same name as the script
	and the following format:
	Name | Model | Values (header, ignored)
	Rich Black | process | 60, 40, 40, 100
	...
	1. <Name>: string,
	2. <Model>: "process" or "spot",
	3. <Values>: CSV list of 3 (RGB) or 4 (CMYK) color values
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;
var infoFile = File(app.activeScript.path + "/" + app.activeScript.name.replace(/jsx/g, "txt"));

app.doScript(main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "Default swatches");


function main() {

if (!infoFile.open("r")) { alert("File '" + infoFile.name + "' not found."); exit() };
var colorData = [], line = 0;
while (!infoFile.eof) {
	var infoLine = infoFile.readln().split("\t"); line++;
	if (infoLine[0].toString().slice(0,1) == "\u003B") continue; // Skip ';' commented lines
	if (!infoLine[0] || !infoLine[1] || !infoLine[2]) {
		alert ("Missing data in record " + line + "."); exit() }
	colorData.push(infoLine);
}
infoFile.close();

for (var i = 1; i < colorData.length; i++) {
	var colorName, colorModel, colorValue = [], c, cc;
	colorName = colorData[i][0];
	colorModel = getColorModel(colorData[i][1]);
	cc = colorData[i][2].split(",");
	while (c = cc.shift()) colorValue.push(Number(trim(c)));
	colorAdd(doc, colorName, colorModel, colorValue);
}


function getColorModel(color) {
	const CM = [
		["process", "spot"],
		[ColorModel.PROCESS, ColorModel.SPOT]
	];
	for (var i = 0; i < CM[0].length; i++)
		if (color === CM[0][i]) return CM[1][i];
}

// ES3/5 Compatibility shims and other utilities for older browsers
// https://github.com/SheetJS/sheetjs/blob/master/dist/xlsx.extendscript.js
function trim(string) {
	var s = string.replace(/^\s+/, '');
	for(var i = s.length - 1; i >= 0; --i) if(!s.charAt(i).match(/^\s/)) return s.slice(0, i + 1);
	return "";
}

// Add Custom (CMYK/RGB/HEX) Colors to Document, by Marijan Tompa (tomaxxi)
// https://indisnip.wordpress.com/2010/09/11/quicktip-add-custom-cmykrgbhex-colors-to-document/
function colorAdd(doc, name, model, values) {
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

} // End main()
