/*
	Dump swatches 22.10.21
	(c) 2020-2022 Paul Chiorean (jpeg@basement.ro)

	Save document's swatches to a 4-column TSV file:

	Name       | Color Model | Color Space | Values
	Rich Black | process     | cmyk        | 60 40 40 100
	RGB Grey   | process     | rgb         | 128 128 128
	Cut        | spot        | cmyk        | 0 100 0 0
	...
	<Name>: swatch name,
	<Color Model>: `process` or `spot`,
	<Color Space>: `cmyk`, `rgb` or `lab`,
	<Values>: list of values, depends on the color model & space.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument)) exit();

var c, cols, i, k;
var dataFile = File(String(doc.fullName).replace(/\.indd$/ig, '_swatches.tsv'));

dataFile.open('w');
dataFile.encoding = 'UTF-8';
dataFile.writeln('Name\tColor Model\tColor Space\tValues'); // Header

cols = doc.colors.everyItem().getElements();
while ((c = cols.shift())) {
	if (c.name === '') continue; // Skip unnamed colors
	if (/^(Registration|Paper|Black|Cyan|Magenta|Yellow)$/ // Skip standard colors
		.test($.global.localize(c.name))) continue;
	for (i = (k = c.colorValue).length; i--; k[i] = Math.round(k[i])); // Round values
	dataFile.writeln(
		c.name + '\t' +
		String(c.model).replace(/ColorModel\./i, '').toLowerCase() + '\t' +
		String(c.space).replace(/ColorSpace\./i, '').toLowerCase() + '\t' +
		k.join(' ')
	);
}

dataFile.close();
