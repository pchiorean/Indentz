/*
	E grid 2.1.1 (2021-08-16)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)
*/

// @include "../lib/Bounds.jsxinc";

if (!(doc = app.activeDocument)) exit();

app.doScript(main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "E grid");

function main() {
	try { doc.layers.add({ name: "guides", layerColor: UIColors.MAGENTA }) } catch (_) {};
	try { doc.layers.itemByName("guides").visible = true } catch (_) {};
	try { doc.layers.itemByName("guides").printable = false } catch (_) {};
	try { doc.layers.itemByName("guides").locked = false } catch (_) {};

	for (var i = 0, n = doc.pages.length; i < n; i++) {
		var page = doc.pages[i];
		var tgBounds = Bounds(page).page.visible || Bounds(page).page.size;
		var tgSize = { width: tgBounds[3] - tgBounds[1], height: tgBounds[2] - tgBounds[0] };
		switch (tgSize.width / tgSize.height <= 1) {
			case true: // Portrait
				// Margin = 10% of page width
				// Columns = 6, zero gutter
				var MG = tgSize.width * 0.1, cols = 6;
				var kTB = kLR = 1;
				break;
			case false: // Landscape
				// Margin = 5% of page width
				// Columns = 12, zero gutter
				var MG = tgSize.width * 0.1 / 2, cols = 12;
				// Half margins for XL formats
				var kTB = (tgSize.width / tgSize.height >= 2.5) ? 0.5 : 1;
				var kLR = 1;
				// Add a horizontal middle guide
				page.guides.add(undefined, {
					itemLayer: "guides", label: "middle",
					guideColor: UIColors.GRID_GREEN,
					orientation: HorizontalOrVertical.horizontal,
					location: (page.bounds[2] - page.bounds[0]) * 0.9 / 2
				});
				break;
		};
		// Set margins
		page.marginPreferences.properties = {
			top: (tgBounds[0] - page.bounds[0]) + MG * kTB,
			left: (tgBounds[1] - page.bounds[1]) + MG * kLR,
			bottom: (page.bounds[2] - tgBounds[2]) + MG * kTB + tgSize.height / 10,
			right: (page.bounds[3] - tgBounds[3]) + MG * kLR,
			columnCount: cols, columnGutter: 0
		};
	};
};
