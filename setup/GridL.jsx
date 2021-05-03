/*
	L grid 2.3 (2021-05-03)
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
	try { doc.layers.itemByName("guides").printable = false } catch (_) {};
	try { doc.layers.itemByName("guides").locked = false } catch (_) {};

	for (var i = 0; i < doc.pages.length; i++) {
		var page = doc.pages[i];
		var tgBounds = Bounds(page).page.visible || Bounds(page).page.size;
		var tgSize = { width: tgBounds[3] - tgBounds[1], height: tgBounds[2] - tgBounds[0] };
		switch (tgSize.width / tgSize.height < 0.95) {
			case true: // Portrait
				// Logo = 12% of format height except HW
				// Outer ring = 116% of logo
				// Margin = 35% of logo
				// Bottom margin = 4 x margin
				var MG = Math.ceil(tgSize.width * 0.12 * 0.35);
				var bdist = 4;
				var logo = MG * 2.857142857142857;
				// Guides
				AddGuide("vertical", tgBounds[1] + tgSize.width / 2, "middle", UIColors.GRID_GREEN);
				AddGuide("horizontal", tgBounds[2] - tgSize.height * 0.1 - 2 * MG, "2 x mg");
				AddGuide("horizontal", tgBounds[2] - tgSize.height * 0.1 - 3 * MG, "3 x mg");
				break;
			case false: // Landscape
				// Logo = 14% of format height except HW
				// Outer ring = 116% of logo
				// Margin = 30% of logo
				// Bottom margin = 2 x margin
				var k = (tgSize.width / tgSize.height >= 3) ? 1.5 : 1; // XL formats
				var MG = Math.ceil(tgSize.height * 0.9 * 0.14 * 0.3 * k);
				var bdist = 2;
				var logo = MG * 3.333333333333333;
				// Guides
				AddGuide("horizontal", tgBounds[0] + tgSize.height * 0.9 / 2,
					"middle", UIColors.GRID_GREEN);
				break;
		}
		// Set margins
		page.marginPreferences.properties = {
			top: (tgBounds[0] - page.bounds[0]) + MG,
			left: (tgBounds[1] - page.bounds[1]) + MG,
			bottom: (page.bounds[2] - tgBounds[2]) + MG * bdist + tgSize.height / 10,
			right: (page.bounds[3] - tgBounds[3]) + MG,
			columnCount: 1, columnGutter: 0
		};
		// Common guides
		AddGuide("horizontal", tgBounds[2] - tgSize.height * 0.1 - MG, "mg");
		AddGuide("horizontal",
			Bounds(page).page.margins[2] -
				(((2 * MG) * 1.18 - (2 * MG)) / 2 + // line inner margin
				2 * ((2 * MG) * 0.28) + // space between lines
				8 * MG), // 3 lines + #EMM
			"HL (3 rows)", UIColors.GREEN);
		// Placeholders for logo etc.
		var logoFrame = page.ovals.add({
			itemLayer: "guides", label: "logo",
			geometricBounds: [ tgBounds[0], tgBounds[1], tgBounds[0] + logo, tgBounds[1] + logo ],
			contentType: ContentType.UNASSIGNED,
			fillColor: "Magenta", strokeColor: "None"
		});
		logoFrame.transparencySettings.blendingSettings.opacity = 66;
		doc.align(logoFrame, AlignOptions.RIGHT_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
		doc.align(logoFrame, AlignOptions.TOP_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
		var mgFrame = page.rectangles.add({
			itemLayer: "guides", label: "mg",
			geometricBounds: [ tgBounds[0], tgBounds[1], tgBounds[0] + MG, tgBounds[1] + MG ],
			contentType: ContentType.UNASSIGNED,
			fillColor: "Magenta", strokeColor: "None"
		});
		mgFrame.transparencySettings.blendingSettings.opacity = 90;
		doc.align(mgFrame, AlignOptions.RIGHT_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
		doc.align(mgFrame, AlignOptions.TOP_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
		mgFrame.move(undefined, [ MG, -MG ]);
	}

	function AddGuide(horv, location, label, color) {
		page.guides.add(undefined, {
			itemLayer: "guides", label: label,
			guideColor: color || UIColors.LIGHT_GRAY,
			orientation: horv == "horizontal" ?
				HorizontalOrVertical.HORIZONTAL : HorizontalOrVertical.VERTICAL,
			location: location
		});
	};
};
