/*
	LS BC grid 1.0.0
	© July 2020, Paul Chiorean
	This script sets the page margins to the LS BC grid system.
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;

doc.activeLayer = doc.layers.item(0);
try { doc.layers.add({ name: "guides", layerColor: UIColors.MAGENTA }) } catch (_) {};

for (var i = 0; i < doc.pages.length; i++) {
	var szPg = {
		width: doc.pages[i].bounds[3] - doc.pages[i].bounds[1],
		height: doc.pages[i].bounds[2] - doc.pages[i].bounds[0]
	}
	switch (szPg.width / szPg.height <= 1) {
		case true: // Portrait
			var logo = szPg.width * 0.12; // Logo = 12% of format height except HW
			// var oring = logo * 1.16 // Outer ring = 116% of logo
			var mg = logo * 0.35 // Margin = 35% of logo
			var b = 4; // Bottom margin = 4 x mg
			// Set margins
			doc.pages[i].marginPreferences.properties = {
				top: mg, left: mg, bottom: mg * b + szPg.height / 10, right: mg,
				columnCount: 1, columnGutter: 0
			}
			// Vertical middle guide
			doc.pages[i].guides.add(undefined, {
				itemLayer: "guides", guideColor: UIColors.GREEN,
				orientation: HorizontalOrVertical.vertical,
				location: szPg.width / 2
			});
			break;
		case false: // Landscape
			var logo = szPg.height * 0.9 * 0.14; // Logo = 14% of format height except HW
			// var oring = logo * 1.16 // Outer ring = 116% of logo
			var mg = logo * 0.3 // Margin = 30% of logo
			var b = 2; // Bottom margin = 2 x mg
			// Set margins
			doc.pages[i].marginPreferences.properties = {
				top: mg, left: mg, bottom: mg * b + szPg.height / 10, right: mg,
				columnCount: 1, columnGutter: 0
			}
			// Horizontal middle guide
			doc.pages[i].guides.add(undefined, {
				itemLayer: "guides", guideColor: UIColors.GREEN,
				orientation: HorizontalOrVertical.horizontal,
				location: szPg.height * 0.9 / 2
			});
			// Horizontal bottom guide for extreme formats
			doc.pages[i].guides.add(undefined, {
				itemLayer: "guides", guideColor: UIColors.GREEN,
				orientation: HorizontalOrVertical.horizontal,
				location: szPg.height * 0.9 - mg
			});
			break;
	}
	var logoFrame = doc.pages[i].ovals.add({
		geometricBounds: [0, 0, logo, logo], 
		contentType: ContentType.UNASSIGNED, 
		fillColor: "Magenta", strokeColor: "None"
	});
	logoFrame.transparencySettings.blendingSettings.opacity = 90;
	doc.align(logoFrame, AlignOptions.RIGHT_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
	doc.align(logoFrame, AlignOptions.TOP_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
}