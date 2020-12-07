/*
	Default swatches v1.5.0
	© December 2020, Paul Chiorean
	Adds swatches from a 3-column TSV file:

	Name | Model | Values (header, ignored)
	Rich Black | process | 60, 40, 40, 100
	Cut | spot | 0, 100, 0, 0
	...
	1. <Name>: swatch name,
	2. <Model>: color model: "process" or "spot",
	3. <Values>: a list of 3 (RGB) or 4 (CMYK) color values.
*/

// Add ECMA262-5 string trim method
String.prototype.trim = function() { return this.replace(/^\s+/, '').replace(/\s+$/, '') };

if (!(doc = app.activeDocument)) exit();
if (!doc.saved) { alert("Document is not saved."); exit() }

var infoFile = File(app.activeDocument.filePath + "/swatches.txt");
if (!infoFile.exists) infoFile = File(app.activeScript.path + "/swatches.txt");
if (!infoFile.exists) infoFile = File(app.activeScript.path + "/../swatches.txt");
if (!infoFile.exists) { alert("File '" + infoFile.name + "' not found."); exit() }

app.doScript(main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "Default swatches");


function main() {
	var colorData = [], line = 0;
	infoFile.open("r");
	while (!infoFile.eof) {
		var infoLine = infoFile.readln().split("\t"); line++;
		if (infoLine[0].toString().slice(0,1) == "\u0023") continue; // Skip '#' commented lines
		if (infoLine[0] == "") continue; // Skip empty lines
		if (!infoLine[0] || !infoLine[1] || !infoLine[2]) {
			alert ("Missing data in record " + line + "."); exit() }
		colorData.push(infoLine);
	}
	infoFile.close();

	for (var i = 1; i < colorData.length; i++) {
		var colorName, colorModel, colorValue = [], c, cc;
		colorName = colorData[i][0].trim();
		colorModel = getColorModel(colorData[i][1].trim());
		cc = colorData[i][2].split(",");
		while (c = cc.shift()) colorValue.push(Number(c.trim()));
		colorAdd(doc, colorName, colorModel, colorValue);
	}
}

function getColorModel(color) {
	const CM = [
		["process", "spot"],
		[ColorModel.PROCESS, ColorModel.SPOT]
	];
	for (var i = 0; i < CM[0].length; i++)
		if (color === CM[0][i]) return CM[1][i];
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
