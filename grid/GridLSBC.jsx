/*
	LS BC grid 1.1.1
	© July 2020, Paul Chiorean
	Sets the page margins and puts in place some guides for the LS BC grid system.
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;
app.scriptPreferences.measurementUnit = MeasurementUnits.MILLIMETERS;

doc.activeLayer = doc.layers.item(0);
try { doc.layers.add({ name: "guides", layerColor: UIColors.MAGENTA }) } catch (_) {};
try { doc.layers.itemByName("guides").visible = true } catch (_) {};
try { doc.layers.itemByName("guides").locked = false } catch (_) {};

for (var i = 0; i < doc.pages.length; i++) {
	var szPg = {
		width: doc.pages[i].bounds[3] - doc.pages[i].bounds[1],
		height: doc.pages[i].bounds[2] - doc.pages[i].bounds[0]
	}
	switch (szPg.width / szPg.height <= 1) { // Page orientation
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
			if (szPg.width / szPg.height >= 3) { var k = 1.2 } else { var k = 1 }; // XL
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
			// Horizontal bottom guide for extreme formats
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