/*
	Default layers v1.14.0
	© January 2021, Paul Chiorean
	Adds/merges layers from a 6-column TSV file:

	Name | Color | Visible | Printable | Order | Variants
	dielines | Magenta | yes | yes | top | cut, cut lines, decoupe, die, die cut, stanze
	template | Gray | no | no | bottom
	...
	1. <Name>: layer name,
	2. <Color>: layer color (see UIColors.txt),
	3. <Visible>: "yes" or "no",
	4. <Printable>: "yes" or "no",
	5. <Order>: "above" or "below" existing layers,
	6. <Variants>: a list of layers which will be merged with the base layer (case insensitive).
*/

// Add ECMA262-5 string trim method
String.prototype.trim = function() { return this.replace(/^\s+/, '').replace(/\s+$/, '') }

if (!(doc = app.activeDocument)) exit();
if (!(infoFile = TSVFile("layers.txt"))) { alert("File 'layers.txt' not found."); exit() }

app.doScript(main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "Default layers");


function main() {
	infoFile.open("r");
	var infoLine, header, data = [],
		line = 0, flg_H = false,
		errors = [], errln, errfn = infoFile.fullName + "\n";
	while (!infoFile.eof) {
		infoLine = infoFile.readln(); line++;
		if (infoLine == "") continue; // Skip empty lines
		if (infoLine.toString().slice(0,1) == "\u0023") continue; // Skip lines beginning with '#'
		infoLine = infoLine.split("\t");
		if (!flg_H) { header = infoLine; flg_H = true; continue } // 1st line is header
		errln = "Line " + line + ": ";
		infoLine[0] = infoLine[0].trim();
		if (!infoLine[0]) errors.push(errln + "Missing layer name.");
		if (errors.length == 0) data.push({
			name: infoLine[0],
			color: !!infoLine[1] ? GetUIColor(infoLine[1].trim()) : UIColors.LIGHT_BLUE,
			isVisible: !!infoLine[2] ? (infoLine[2].toLowerCase().trim() == "yes") : true,
			isPrintable: !!infoLine[3] ? (infoLine[3].toLowerCase().trim() == "yes") : true,
			isBelow: !!infoLine[4] ? (infoLine[4].toLowerCase().trim() == "below") : false,
			variants: !!infoLine[5] ? GetVariants(infoLine[0], infoLine[5].split(",")) : ""
		});
	}
	infoFile.close(); infoLine = "";
	if (errors.length > 0) { alert(errfn + errors.join("\n")); exit() }
	if (data.length < 1) exit();

	doc.layers.everyItem().properties = { // Prepare existing layers
		locked: false,
		layerColor: UIColors.LIGHT_GRAY
	}
	var set_AL = doc.activeLayer; // Save active layer
	// Top layers
	for (var i = data.length - 1; i >= 0 ; i--) {
		if (data[i].isBelow) continue;
		MakeLayer(
			data[i].name,
			data[i].color,
			data[i].isVisible,
			data[i].isPrintable,
			data[i].variants);
	}
	// Bottom layers
	for (var i = 0; i < data.length; i++) {
		if (!data[i].isBelow) continue;
		MakeLayer(
			data[i].name,
			data[i].color,
			data[i].isVisible,
			data[i].isPrintable,
			data[i].variants)
		.move(LocationOptions.AT_END);
	}
	doc.activeLayer = set_AL; // Restore active layer

	function MakeLayer(name, color, isVisible, isPrintable, variants) {
		doc.activeLayer = doc.layers.firstItem();
		var layer = doc.layers.item(name);
		if (layer.isValid) layer.properties = {
			layerColor: color,
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
			if (isIn(l.name, variants, false)) {
				var set_LV = l.visible;
				if (l == set_AL) set_AL = layer;
				layer.merge(l);
				layer.visible = set_LV;
			};
		return layer;
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

function GetUIColor(color) {
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

function GetVariants(base, variants) {
	var v, vv = [];
	vv.push(base);
	while (v = variants.shift()) vv.push(v.trim());
	return vv;
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
