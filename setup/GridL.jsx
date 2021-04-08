/*
	L grid 1.2.2 (2020-11-22)
	(c) 2020 Paul Chiorean (jpeg@basement.ro)
*/

if (!(doc = app.activeDocument)) exit();
app.scriptPreferences.measurementUnit = MeasurementUnits.MILLIMETERS;

app.doScript(main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "L grid");


function main() {
	try { doc.layers.add({ name: "guides", layerColor: UIColors.MAGENTA }) } catch (_) {};
	try { doc.layers.itemByName("guides").visible = true } catch (_) {};
	try { doc.layers.itemByName("guides").locked = false } catch (_) {};

	for (var i = 0; i < doc.pages.length; i++) {
		var szPg = {
			width: doc.pages[i].bounds[3] - doc.pages[i].bounds[1],
			height: doc.pages[i].bounds[2] - doc.pages[i].bounds[0]
		}
		switch (szPg.width / szPg.height <= 1) {
			case true: // Portrait
				// Logo = 12% of format height except HW
				// Outer ring = 116% of logo
				// Margin = 35% of logo
				// Bottom margin = 4 x margin
				var mg = Math.ceil(szPg.width * 0.12 * 0.35);
				var logo = mg * 2.857142857142857;
				// Set margins
				doc.pages[i].marginPreferences.properties = {
					top: mg, left: mg, bottom: mg * 4 + szPg.height / 10, right: mg,
					columnCount: 1, columnGutter: 0 };
				// Vertical middle guide for the ring
				doc.pages[i].guides.add(undefined, {
					itemLayer: "guides", guideColor: UIColors.GREEN,
					orientation: HorizontalOrVertical.vertical,
					location: szPg.width / 2 });
				break;
			case false: // Landscape
				// Logo = 14% of format height except HW
				// Outer ring = 116% of logo
				// Margin = 30% of logo
				// Bottom margin = 2 x margin
				var k = (szPg.width / szPg.height >= 3) ? 1.2 : 1; // XL formats
				var mg = Math.ceil(szPg.height * 0.9 * 0.14 * 0.3 * k);
				var logo = mg * 3.333333333333333;
				// Set margins
				doc.pages[i].marginPreferences.properties = {
					top: mg, left: mg, bottom: mg * 2 + szPg.height / 10, right: mg,
					columnCount: 1, columnGutter: 0 };
				// Horizontal middle guide for the ring
				doc.pages[i].guides.add(undefined, {
					itemLayer: "guides", guideColor: UIColors.GREEN,
					orientation: HorizontalOrVertical.horizontal,
					location: szPg.height * 0.9 / 2 });
				// Horizontal bottom guide for XL formats
				doc.pages[i].guides.add(undefined, {
					itemLayer: "guides", guideColor: UIColors.GREEN,
					orientation: HorizontalOrVertical.horizontal,
					location: szPg.height * 0.9 - mg });
				break;
		}
		// Placeholder for logo
		var logoFrame = doc.pages[i].ovals.add({
			itemLayer: "guides", geometricBounds: [0, 0, logo, logo],
			contentType: ContentType.UNASSIGNED,
			fillColor: "Magenta", strokeColor: "None" });
		logoFrame.transparencySettings.blendingSettings.opacity = 90;
		doc.align(logoFrame, AlignOptions.RIGHT_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
		doc.align(logoFrame, AlignOptions.TOP_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
	}
}
