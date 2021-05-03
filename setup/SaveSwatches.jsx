/*
	Save swatches v1.0 (2021-04-30)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Save document's swatches to a 3-column TSV file:

	Name       | Model   | Values
	Rich Black | process | 60 40 40 100
	RGB Grey   | process | 128 128 128
	Cut        | spot    | 0 100 0 0
	...
	1. <Name>: swatch name,
	2. <Model>: color model,
	3. <Values>: list of values, depends on the color model.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument)) exit();
app.scriptPreferences.measurementUnit = MeasurementUnits.MILLIMETERS;

var swatchesFile = File(String(doc.fullName).replace(/\.indd$/ig, "_swatches.txt"));
swatchesFile.open("w");
swatchesFile.writeln("Name\tModel\tValues"); // Header

var c, cols = doc.colors.everyItem().getElements();
while(c = cols.shift()) {
	if (c.name == "") continue; // Skip unnamed colors
	if (/^(Registration|Paper|Black|Cyan|Magenta|Yellow)$/.test($.global.localize(c.name))) continue;
	var k, i; for (i = (k = c.colorValue).length; i--; k[i] = Math.round(k[i]));
	swatchesFile.writeln(
		c.name + "\t" +
		String(c.model).replace(/ColorModel\./i, "").toLowerCase() + "\t" +
		k.join(" ")
	)
}
swatchesFile.close();
swatchesFile.execute();
