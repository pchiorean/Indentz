/*
	E grid 2.1.3 (2021-09-24)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)
*/

// @include '../lib/GetBounds.jsxinc';

if (!(doc = app.activeDocument)) exit();

app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined,
	UndoModes.ENTIRE_SCRIPT, 'E grid');

function main() {
	var page, tgBounds, tgSize, MG, cols, kTB, kLR;
	try { doc.layers.add({ name: 'guides', layerColor: UIColors.MAGENTA }); } catch (e) {}
	try { doc.layers.itemByName('guides').visible =   true; }  catch (e) {}
	try { doc.layers.itemByName('guides').printable = false; } catch (e) {}
	try { doc.layers.itemByName('guides').locked =    false; } catch (e) {}

	for (var i = 0, n = doc.pages.length; i < n; i++) {
		page = doc.pages[i];
		tgBounds = getBounds(page).page.visible || getBounds(page).page.size;
		tgSize = { width: tgBounds[3] - tgBounds[1], height: tgBounds[2] - tgBounds[0] };
		switch (tgSize.width / tgSize.height <= 1) {
			case true: // Portrait
				// Margin = 10% of page width
				// Columns = 6, zero gutter
				MG = tgSize.width * 0.1;
				cols = 6;
				kTB = kLR = 1;
				break;
			case false: // Landscape
				// Margin = 5% of page width
				// Columns = 12, zero gutter
				MG = tgSize.width * 0.1 / 2;
				cols = 12;
				// Half margins for XL formats
				kTB = (tgSize.width / tgSize.height >= 2.5) ? 0.5 : 1;
				kLR = 1;
				// Add a horizontal middle guide
				page.guides.add(undefined, {
					itemLayer:   'guides',
					label:       'middle',
					guideColor:  UIColors.GRID_GREEN,
					orientation: HorizontalOrVertical.horizontal,
					location:    (page.bounds[2] - page.bounds[0]) * 0.9 / 2
				});
				break;
		}
		// Set margins
		page.marginPreferences.properties = {
			top:    (tgBounds[0] - page.bounds[0]) + MG * kTB,
			left:   (tgBounds[1] - page.bounds[1]) + MG * kLR,
			bottom: (page.bounds[2] - tgBounds[2]) + MG * kTB + tgSize.height / 10,
			right:  (page.bounds[3] - tgBounds[3]) + MG * kLR,
			columnCount: cols,
			columnGutter: 0
		};
	}
}
