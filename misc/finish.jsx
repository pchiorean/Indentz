var doc = app.activeDocument;
var page = app.activeWindow.activePage;
var bleed = bleedBounds(page);
var item, items = doc.allPageItems;

while (item = items.shift()) {
	item.redefineScaling();
	switch (item.label) {
		case "bleed":
		case "bg":
			item.geometricBounds = bleed; break;
		case "expand":
		case "aw":
			item.fit(FitOptions.FRAME_TO_CONTENT);
			item.geometricBounds = [
				Math.max(item.visibleBounds[0], bleed[0]),
				Math.max(item.visibleBounds[1], bleed[1]),
				Math.min(item.visibleBounds[2], bleed[2]),
				Math.min(item.visibleBounds[3], bleed[3])
			];
			break;
	}
}

try { doc.swatches.itemByName("Safe area").colorValue = [100, 0, 0, 0] } catch (_) {};

doc.layers.itemByName("id").visible = false;
try { doc.layers.itemByName("info").properties = { visible: false, locked: true } } catch (_) {};
try { doc.layers.itemByName("ratio").properties = { visible: false, locked: true } } catch (_) {};
try { doc.layers.itemByName("safe area").visible = true } catch (_) {};
try { doc.layers.itemByName("vizibil").visible = true } catch (_) {};
try { doc.layers.itemByName("HW").visible = false } catch (_) {};


function bleedBounds(page) {
	var bleed = {
		top: doc.documentPreferences.properties.documentBleedTopOffset,
		left: doc.documentPreferences.properties.documentBleedInsideOrLeftOffset,
		bottom: doc.documentPreferences.properties.documentBleedBottomOffset,
		right: doc.documentPreferences.properties.documentBleedOutsideOrRightOffset
	}
	if (page.side == PageSideOptions.LEFT_HAND) {
		bleed.left = doc.documentPreferences.properties.documentBleedOutsideOrRightOffset;
		bleed.right = doc.documentPreferences.properties.documentBleedInsideOrLeftOffset;
	}
	var m_x1 = page.bounds[1] - bleed.left;
	var m_y1 = page.bounds[0] - bleed.top;
	var m_x2 = page.bounds[3] + bleed.right;
	var m_y2 = page.bounds[2] + bleed.bottom;
	return [m_y1, m_x1, m_y2, m_x2];
}