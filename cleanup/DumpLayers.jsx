/*
	Dump layers 23.10.21
	(c) 2022-2023 Paul Chiorean <jpeg@basement.ro>

	Saves document's layers to a TSV file compatible with `DefaultLayers.jsx`:

	Name       | Color   | Visible | Printable | Order | Variants
	dielines   | Magenta | yes     | yes       |       |
	bg         | Red     | yes     | yes       |       |
	.reference | Black   | no      | no        |       |
	...

	<Name>: layer name;
	<Color>: layer color (see UIColors.txt for color names);
	<Visible>: `yes` or `no`;
	<Printable>: `yes` or `no`;
	<Order> and <Variants>: empty (see `DefaultLayers.jsx` for more info).
	<Variants>: empty (see `DefaultLayers.jsx` for more info).

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument)) exit();

var dataFile, l, layers;
var docHasPath = (function () {
	var ret = false;
	try { ret = !!doc.filePath; } catch (e) {}
	return ret;
}());

if (!docHasPath) {
	alert('Can\'t get document path.\nSave the document first and try again.');
	exit();
}

dataFile = File(String(doc.filePath + '/' + doc.name).replace(/\.indd$/ig, '_layers.tsv'));
dataFile.open('w');
dataFile.encoding = 'UTF-8';
dataFile.lineFeed = 'Unix';
dataFile.writeln('Name\tColor\tVisible\tPrintable\tOrder\tVariants'); // Header

layers = doc.layers.everyItem().getElements();
while ((l = layers.shift())) {
	dataFile.writeln(
		l.name + '\t'
		+ String(l.layerColor)
			.replace('UIColors.', '').replace('_', ' ')
			.toLowerCase() + '\t'
		+ (l.visible ? 'yes' : 'no') + '\t'
		+ (l.printable ? 'yes' : 'no')
	);
}

dataFile.close();
