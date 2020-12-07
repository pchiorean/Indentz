/*
	Default layers v1.6.0
	© December 2020, Paul Chiorean
	Adds/merges layers from a 6-column TSV file:

	Name | Color | Visible | Printable | Order | Variants (header, ignored)
	dielines | Magenta | TRUE | TRUE | top | cut, cut lines, decoupe, die, die cut, stanze
	template | Gray | FALSE | FALSE | bottom
	...
	1. <Name>: layer name,
	2. <Color>: layer color (see UIColors.txt),
	3. <Visible>: TRUE or FALSE,
	4. <Printable>: TRUE or FALSE,
	5. <Order>: "top" or "bottom" (above or below existing layers),
	6. <Variants>: a list of layers which will be merged with the base layer (case insensitive).
*/

// Add ECMA262-5 string trim method
String.prototype.trim = function() { return this.replace(/^\s+/, '').replace(/\s+$/, '') };

if (!(doc = app.activeDocument)) exit();
if (!doc.saved) { alert("Document is not saved."); exit() }

var infoFile = File(app.activeDocument.filePath + "/layers.txt");
if (!infoFile.exists) infoFile = File(app.activeScript.path + "/layers.txt");
if (!infoFile.exists) infoFile = File(app.activeScript.path + "/../layers.txt");
if (!infoFile.exists) { alert("File '" + infoFile.name + "' not found."); exit() }

app.doScript(main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "Default layers");


function main() {
	var layerData = [], line = 0;
	infoFile.open("r");
	while (!infoFile.eof) {
		var infoLine = infoFile.readln().split("\t"); line++;
		if (infoLine[0].toString().slice(0,1) == "\u0023") continue; // Skip lines beginning with '#'
		if (infoLine[0] == "") continue; // Skip empty lines
		if (!infoLine[0] || !infoLine[1] || !infoLine[2] || !infoLine[3] || !infoLine[4]) {
			alert ("Missing data in record " + line + "."); exit() }
		layerData.push(infoLine);
	}
	infoFile.close();

	doc.layers.everyItem().properties = {
		locked: false,
		layerColor: [215, 215, 215] // Mark existing layers light gray
	} 
	var set_AL = doc.activeLayer; // Save active layer
	// Top layers
	for (var i = layerData.length - 1; i >= 1 ; i--) {
		var name, color, isVisible, isPrintable, isBottom, variants = [], v, vv;
		name = layerData[i][0].trim();
		color = getUIColor(layerData[i][1].trim());
		isVisible = (layerData[i][2].toLowerCase() == "true");
		isPrintable = (layerData[i][3].toLowerCase() == "true");
		isBottom = (layerData[i][4].toLowerCase() == "bottom");
		if (isBottom) continue;
		variants.push(name);
		vv = layerData[i][5].split(",");
		while (v = vv.shift()) variants.push(v.trim());
		var layer = makeLayer(name, color, isVisible, isPrintable, variants);
	}
	// Bottom layers
	for (var i = 1; i < layerData.length; i++) {
		var name, color, isVisible, isPrintable, isBottom, variants = [], v, vv;
		name = layerData[i][0].trim();
		color = getUIColor(layerData[i][1].trim());
		isVisible = (layerData[i][2].toLowerCase() == "true");
		isPrintable = (layerData[i][3].toLowerCase() == "true");
		isBottom = (layerData[i][4].toLowerCase() == "bottom");
		if (!isBottom) continue;
		variants.push(name);
		vv = layerData[i][5].split(",");
		while (v = vv.shift()) variants.push(v.trim());
		var layer = makeLayer(name, color, isVisible, isPrintable, variants);
		if (isBottom) layer.move(LocationOptions.AT_END);
	}
	doc.activeLayer = set_AL; // Restore active layer

	function makeLayer(name, color, isVisible, isPrintable, variants) {
		doc.activeLayer = doc.layers.firstItem();
		var layer = doc.layers.item(name);
		if (layer.isValid) layer.properties = {
			layerColor: color,
			// visible:= isVisible,
			printable: isPrintable }
		else {
			doc.layers.add({
				name: name,
				layerColor: color,
				visible: isVisible,
				printable: isPrintable });
		}
		var l, layers = doc.layers.everyItem().getElements();
		while (l = layers.shift())
			if(isIn(l.name, variants, false)) {
				var set_LV = l.visible;
				if (l == set_AL) set_AL = layer;
				layer.merge(l);
				layer.visible = set_LV;
			};
		return layer;
	}
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
		if (color.toLowerCase() == UICOLS[0][i].toLowerCase()) return UICOLS[1][i];
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
