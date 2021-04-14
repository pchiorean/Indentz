/*
	L grid 2.1 (2021-04-14)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)
*/

// @include "../lib/Bounds.jsxinc";

if (!(doc = app.activeDocument)) exit();
app.scriptPreferences.measurementUnit = MeasurementUnits.MILLIMETERS;

app.doScript(main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "L grid");

function main() {
	try { doc.layers.add({ name: "guides", layerColor: UIColors.MAGENTA }) } catch (_) {};
	try { doc.layers.itemByName("guides").visible = true } catch (_) {};
	try { doc.layers.itemByName("guides").locked = false } catch (_) {};

	for (var i = 0; i < doc.pages.length; i++) {
		var tgBounds = Bounds(doc.pages[i]).page.visible || Bounds(doc.pages[i]).page.size;
		var tgSize = {
			width: tgBounds[3] - tgBounds[1],
			height: tgBounds[2] - tgBounds[0]
		}
		switch (tgSize.width / tgSize.height <= 1) {
			case true: // Portrait
				// Logo = 12% of format height except HW
				// Outer ring = 116% of logo
				// Margin = 35% of logo
				// Bottom margin = 4 x margin
				var mg = Math.ceil(tgSize.width * 0.12 * 0.35);
				var bdist = 4;
				var logo = mg * 2.857142857142857;
				// Vertical middle guide for the ring
				doc.pages[i].guides.add(undefined, {
					itemLayer: "guides", label: "middle",
					guideColor: UIColors.LIGHT_GRAY,
					orientation: HorizontalOrVertical.vertical,
					location: tgBounds[1] + tgSize.width / 2
				});
				// Additional guides for exceptions
				doc.pages[i].guides.add(undefined, {
					itemLayer: "guides",
					guideColor: UIColors.LIGHT_GRAY,
					orientation: HorizontalOrVertical.horizontal,
					location: tgBounds[2] - tgSize.height * 0.1 - mg
				});
				doc.pages[i].guides.add(undefined, {
					itemLayer: "guides",
					guideColor: UIColors.LIGHT_GRAY,
					orientation: HorizontalOrVertical.horizontal,
					location: tgBounds[2] - tgSize.height * 0.1 - 3 * mg
				});
				break;
			case false: // Landscape
				// Logo = 14% of format height except HW
				// Outer ring = 116% of logo
				// Margin = 30% of logo
				// Bottom margin = 2 x margin
				var k = (tgSize.width / tgSize.height >= 3) ? 1.5 : 1; // XL formats
				var mg = Math.ceil(tgSize.height * 0.9 * 0.14 * 0.3 * k);
				var bdist = 2;
				var logo = mg * 3.333333333333333;
				// Horizontal middle guide for the ring
				doc.pages[i].guides.add(undefined, {
					itemLayer: "guides", label: "middle",
					guideColor: UIColors.LIGHT_GRAY,
					orientation: HorizontalOrVertical.horizontal,
					location: tgBounds[0] + tgSize.height * 0.9 / 2
				});
				// Additional guides for exceptions
				doc.pages[i].guides.add(undefined, {
					itemLayer: "guides",
					guideColor: UIColors.LIGHT_GRAY,
					orientation: HorizontalOrVertical.horizontal,
					location: tgBounds[2] - tgSize.height * 0.1 - mg
				});
				break;
		}
		// Set margins
		doc.pages[i].marginPreferences.properties = {
			top: tgBounds[0] + mg,
			left: tgBounds[1] + mg,
			bottom: mg * bdist + tgSize.height / 10 + (doc.pages[i].bounds[2] - tgBounds[2]),
			right: (doc.pages[i].bounds[3] - tgBounds[3]) + mg,
			columnCount: 1, columnGutter: 0
		};
		// Guide for HL
		doc.pages[i].guides.add(undefined, {
			itemLayer: "guides", label: "HL (3 rows)",
			guideColor: UIColors.GREEN,
			orientation: HorizontalOrVertical.horizontal,
			location: Bounds(doc.pages[i]).page.margins[2] -
				(((2 * mg) * 1.18 - (2 * mg)) / 2 + // line inner margin
				2 * ((2 * mg) * 0.28) + // space between lines
				8 * mg) // 3 lines + #EMM
		});
		// Placeholders for logo etc.
		var logoFrame = doc.pages[i].ovals.add({
			itemLayer: "guides", label: "logo",
			geometricBounds: [0, 0, logo, logo],
			contentType: ContentType.UNASSIGNED,
			fillColor: "Magenta", strokeColor: "None"
		});
		logoFrame.transparencySettings.blendingSettings.opacity = 90;
		doc.align(logoFrame, AlignOptions.RIGHT_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
		doc.align(logoFrame, AlignOptions.TOP_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
		var mgFrame = doc.pages[i].rectangles.add({
			itemLayer: "guides", label: "mg",
			geometricBounds: [0, 0, mg, mg],
			contentType: ContentType.UNASSIGNED,
			fillColor: "Magenta", strokeColor: "None"
		});
		mgFrame.transparencySettings.blendingSettings.opacity = 90;
		doc.align(mgFrame, AlignOptions.RIGHT_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
		doc.align(mgFrame, AlignOptions.TOP_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
		mgFrame.move(undefined, [ mg, -mg ]);
	}
}
