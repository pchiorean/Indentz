/*
	E grid 1.5.2
	© November 2020, Paul Chiorean
*/

if (!(doc = app.activeDocument)) exit();

app.doScript(main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "E grid");


function main() {
	try { doc.layers.add({ name: "guides", layerColor: UIColors.MAGENTA }) } catch (_) {};
	try { doc.layers.itemByName("guides").visible = true } catch (_) {};
	try { doc.layers.itemByName("guides").locked = false } catch (_) {};

	for (var i = 0; i < doc.pages.length; i++) {
		if ((doc.pages[i].marginPreferences.columnCount == 6 ||
			doc.pages[i].marginPreferences.columnCount == 12) &&
			doc.pages[i].marginPreferences.columnGutter == 0) {
			var mgBounds = doc.pages[i].bounds;
		} else {
			var mgBounds = Bounds(doc.pages[i]);
		}

		var size = {
			width: mgBounds[3] - mgBounds[1],
			height: mgBounds[2] - mgBounds[0]
		}
		switch (size.width / size.height <= 1) {
			case true: // Portrait
				// Margin = 10% of page width
				// Columns = 6, zero gutter
				var mg = size.width * 0.1, cols = 6;
				var kTB = kLR = 1;
				break;
			case false: // Landscape
				// Margin = 5% of page width
				// Columns = 12, zero gutter
				var mg = size.width * 0.1 / 2, cols = 12;
				// Half margins for XL formats
				var kTB = (size.width / size.height >= 2.5) ? 0.5 : 1;
				var kLR = 1;
				// Add a horizontal middle guide
				doc.pages[i].guides.add(undefined, {
					itemLayer: "guides", guideColor: UIColors.GREEN,
					orientation: HorizontalOrVertical.horizontal,
					location: (doc.pages[i].bounds[2] - 
					doc.pages[i].bounds[0]) * 0.9 / 2 });
				break;
		}
		// Set margins
		doc.pages[i].marginPreferences.properties = {
			top: mg * kTB + mgBounds[0],
			left: mg * kLR + mgBounds[1],
			bottom: mg * kTB + size.height / 10 - (size.height - mgBounds[2]),
			right: mg * kLR - (size.width - mgBounds[3]),
			columnCount: cols,
			columnGutter: 0
		}
	}
}

function Bounds(page) { // Return page margins bounds
	return [
		page.bounds[0] + page.marginPreferences.top,
		page.side == PageSideOptions.LEFT_HAND ?
			page.bounds[1] + page.marginPreferences.right :
			page.bounds[1] + page.marginPreferences.left,
		page.bounds[2] - page.marginPreferences.bottom,
		page.side == PageSideOptions.LEFT_HAND ?
			page.bounds[3] - page.marginPreferences.left :
			page.bounds[3] - page.marginPreferences.right
	];
}