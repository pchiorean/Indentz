/*
	Make default layers v1.0.0
	© November 2020, Paul Chiorean
	Makes default layers and merges equivalents, from a list.

	The list is a 6-column TSV file with the same name as the script
	and the following format:
	Name | Color | Visible | Printable | Order | Variants (header, ignored)
	dielines | Red | FALSE | TRUE | top | cut, cut lines, decoupe, die, die cut, diecut, stanze
	...
	1. <Name>: string,
	2. <Color>: UIColor (friendly) name (see the XLSX),
	3. <Visible>: boolean (TRUE or FALSE),
	4. <Printable>: boolean (TRUE or FALSE),
	5. <Order>: "top" or "bottom" (above or below existing layers),
	6. <Variants>: CSV list of alternative names.
	The XLSX template may be used for generating the TSV file.
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;
var infoFile = File(app.activeScript.path + "/" + app.activeScript.name.replace(/jsx/g, "txt"));

app.doScript(main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "Default layers");


function main() {

if (!infoFile.open("r")) { alert("File '" + infoFile.name + "' not found."); exit() };
var layerData = [], line = 0;
while (!infoFile.eof) {
	var infoLine = infoFile.readln().split("\t"); line++;
	if (infoLine[0].toString().slice(0,1) == "\u003B") continue; // Skip ';' commented lines
	if (!infoLine[0] || !infoLine[1] || !infoLine[2] || !infoLine[3] || !infoLine[4]) {
		alert ("Missing data in record " + line + "."); exit() }
	layerData.push(infoLine);
}
infoFile.close();

doc.layers.everyItem().locked = false;
doc.layers.everyItem().layerColor = [215, 215, 215]; // Mark existing layers light gray
// Top layers
for (var i = layerData.length - 1; i >= 1 ; i--) {
	var name, color, isVisible, isPrintable, isBottom, variants = [], v, vv;
	name = layerData[i][0];
	color = getUIColor(layerData[i][1]);
	isVisible = (layerData[i][2].toLowerCase() === "true");
	isPrintable = (layerData[i][3].toLowerCase() === "true");
	isBottom = (layerData[i][4].toLowerCase() === "bottom");
	if (isBottom) continue;
	variants.push(trim(layerData[i][0]));
	vv = layerData[i][5].split(",");
	while (v = vv.shift()) variants.push(trim(v));
	makeLayer(name, color, isVisible, isPrintable, variants);
}
// Bottom layers
for (var i = 1; i < layerData.length; i++) {
	var name, color, isVisible, isPrintable, isBottom, variants = [], v, vv;
	name = layerData[i][0];
	color = getUIColor(layerData[i][1]);
	isVisible = (layerData[i][2].toLowerCase() === "true");
	isPrintable = (layerData[i][3].toLowerCase() === "true");
	isBottom = (layerData[i][4].toLowerCase() === "bottom");
	if (!isBottom) continue;
	variants.push(trim(layerData[i][0]));
	vv = layerData[i][5].split(",");
	while (v = vv.shift()) variants.push(trim(v));
	var layer = makeLayer(name, color, isVisible, isPrintable, variants);
	if (isBottom) layer.move(LocationOptions.AT_END);
}


function makeLayer(name, color, isVisible, isPrintable, variants) {
	doc.activeLayer = doc.layers.firstItem();
	var layer = doc.layers.item(name);
	if (layer.isValid) {
		layer.layerColor = color;
		layer.printable = isPrintable }
	else {
		doc.layers.add({
			name: name,
			layerColor: color,
			visible: isVisible,
			printable: isPrintable });
	}
	var l, layers = doc.layers.everyItem().getElements();
	while (l = layers.shift()) if(isIn(l.name, variants, false)) layer.merge(l);
	return layer;
}

function getUIColor(color) {
	const UICOLS = [
		["Blue", "Black", "Brick Red", "Brown", "Burgundy", "Charcoal", "Cute Teal", "Cyan",
		"Dark Blue", "Dark Green", "Fiesta", "Gold", "Grass Green", "Gray", "Green", "Grid Blue",
		"Grid Green", "Grid Orange", "Lavender", "Light Blue", "Light Gray", "Light Olive",
		"Lipstick", "Magenta", "Ochre", "Olive Green", "Orange", "Peach", "Pink", "Purple", "Red",
		"Sulphur", "Tan", "Teal", "Violet", "White", "Yellow"],
		[UIColors.BLUE, UIColors.BLACK, UIColors.BRICK_RED, UIColors.BROWN, UIColors.BURGUNDY,
		UIColors.CHARCOAL, UIColors.CUTE_TEAL, UIColors.CYAN, UIColors.DARK_BLUE, 
		UIColors.DARK_GREEN, UIColors.FIESTA, UIColors.GOLD, UIColors.GRASS_GREEN, UIColors.GRAY,
		UIColors.GREEN, UIColors.GRID_BLUE, UIColors.GRID_GREEN, UIColors.GRID_ORANGE,
		UIColors.LAVENDER, UIColors.LIGHT_BLUE, UIColors.LIGHT_GRAY, UIColors.LIGHT_OLIVE,
		UIColors.LIPSTICK, UIColors.MAGENTA, UIColors.OCHRE, UIColors.OLIVE_GREEN, UIColors.ORANGE,
		UIColors.PEACH, UIColors.PINK, UIColors.PURPLE, UIColors.RED, UIColors.SULPHUR,
		UIColors.TAN, UIColors.TEAL, UIColors.VIOLET, UIColors.WHITE, UIColors.YELLOW]
	];
	for (var i = 0; i < UICOLS[0].length; i++)
		if (color === UICOLS[0][i]) return UICOLS[1][i];
	return UIColors.LIGHT_BLUE;
}

// FORWARD.Util functions, by Richard Harrington
// https://github.com/richardharrington/indesign-scripts
function isIn(searchValue, array, caseSensitive) {
	caseSensitive = (typeof caseSensitive !== 'undefined') ? caseSensitive : true;
	var item;
	if (!caseSensitive && typeof searchValue === 'string') searchValue = searchValue.toLowerCase();
	for (var i = 0; i < array.length; i++) {
		item = array[i];
		if (!caseSensitive && typeof item === 'string') item = item.toLowerCase();
		if (item === searchValue) return true;
	}
}

// ES3/5 Compatibility shims and other utilities for older browsers
// https://github.com/SheetJS/sheetjs/blob/master/dist/xlsx.extendscript.js
function trim(string) {
	var s = string.replace(/^\s+/, '');
	for(var i = s.length - 1; i >= 0; --i) if(!s.charAt(i).match(/^\s/)) return s.slice(0, i + 1);
	return "";
}

} // End main()
