/*
	Dump layers 23.2.3
	(c) 2022-2023 Paul Chiorean <jpeg@basement.ro>

	Saves document's layers to a TSV file compatible with `Defaultlayers.jsx`:

	Name     | Color   | Visible | Printable
	dielines | Magenta | yes     | yes
	template | Gray    | no      | no
	...

	<Name>: layer name,
	<Color>: layer color (see UIColors.txt for color names),
	<Visible>: `yes` or `no`,
	<Printable>: `yes` or `no`.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument)) exit();

var l, layers;
var dataFile = File(String(doc.fullName).replace(/\.indd$/ig, '_layers.tsv'));

dataFile.open('w');
dataFile.encoding = 'UTF-8';
dataFile.lineFeed = 'Unix';
dataFile.writeln('Name\tColor\tVisible\tPrintable'); // Header

layers = doc.layers.everyItem().getElements();
while ((l = layers.shift())) {
	dataFile.writeln(
		l.name + '\t' +
		String(l.layerColor)
			.replace('UIColors.', '').replace('_', ' ')
			.toLowerCase() + '\t' +
		(l.visible ? 'yes' : 'no') + '\t' +
		(l.printable ? 'yes' : 'no')
	);
}

dataFile.close();
