/*
	Save swatches v2.0 (2021-05-04)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Save document's swatches to a 4-column TSV file:

	Name       | Color Model | Color Space | Values
	Rich Black | process     | cmyk        | 60 40 40 100
	RGB Grey   | process     | rgb         | 128 128 128
	Cut        | spot        | cmyk        | 0 100 0 0
	...
	1. <Name>: swatch name,
	2. <Color Model>: "process" or "spot" (default "process"),
	3. <Color Space>: "cmyk", "rgb" or "lab" (default "cmyk"),
	4. <Values>: list of values, depends on the color model & space.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument)) exit();
app.scriptPreferences.measurementUnit = MeasurementUnits.MILLIMETERS;

var swatchesFile = File(String(doc.fullName).replace(/\.indd$/ig, "_swatches.txt"));
swatchesFile.open("w");
swatchesFile.writeln("Name\tColor Model\tColor Space\tValues"); // Header

var c, cols = doc.colors.everyItem().getElements();
while(c = cols.shift()) {
	if (c.name == "") continue; // Skip unnamed colors
	if (/^(Registration|Paper|Black|Cyan|Magenta|Yellow)$/.test($.global.localize(c.name))) continue;
	var k, i; for (i = (k = c.colorValue).length; i--; k[i] = Math.round(k[i]));
	swatchesFile.writeln(
		c.name + "\t" +
		String(c.model).replace(/ColorModel\./i, "").toLowerCase() + "\t" +
		String(c.space).replace(/ColorSpace\./i, "").toLowerCase() + "\t" +
		k.join(" ")
	)
}
swatchesFile.close();
swatchesFile.execute();
