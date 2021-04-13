/*
	E grid 2.0 (2021-04-12)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)
*/

// @include "../lib/Bounds.jsxinc";

if (!(doc = app.activeDocument)) exit();

app.doScript(main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "E grid");

function main() {
	try { doc.layers.add({ name: "guides", layerColor: UIColors.MAGENTA }) } catch (_) {};
	try { doc.layers.itemByName("guides").visible = true } catch (_) {};
	try { doc.layers.itemByName("guides").locked = false } catch (_) {};

	for (var i = 0; i < doc.pages.length; i++) {
		var tgBounds = Bounds(doc.pages[i]).page.safearea || Bounds(doc.pages[i]).page.size;
		var tgSize = {
			width: tgBounds[3] - tgBounds[1],
			height: tgBounds[2] - tgBounds[0]
		}
		switch (tgSize.width / tgSize.height <= 1) {
			case true: // Portrait
				// Margin = 10% of page width
				// Columns = 6, zero gutter
				var mg = tgSize.width * 0.1, cols = 6;
				var kTB = kLR = 1;
				break;
			case false: // Landscape
				// Margin = 5% of page width
				// Columns = 12, zero gutter
				var mg = tgSize.width * 0.1 / 2, cols = 12;
				// Half margins for XL formats
				var kTB = (tgSize.width / tgSize.height >= 2.5) ? 0.5 : 1;
				var kLR = 1;
				// Add a horizontal middle guide
				doc.pages[i].guides.add(undefined, {
					itemLayer: "guides", label: "middle",
					guideColor: UIColors.LIGHT_GRAY,
					orientation: HorizontalOrVertical.horizontal,
					location: (doc.pages[i].bounds[2] - doc.pages[i].bounds[0]) * 0.9 / 2
				});
				break;
		}
		// Set margins
		doc.pages[i].marginPreferences.properties = {
			top: mg * kTB + tgBounds[0],
			left: mg * kLR + tgBounds[1],
			bottom: mg * kTB + tgSize.height / 10 + (doc.pages[i].bounds[2] - tgBounds[2]),
			right: mg * kLR + (doc.pages[i].bounds[3] - tgBounds[3]),
			columnCount: cols, columnGutter: 0
		}
	}
}
