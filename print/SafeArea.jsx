/*
	Safe area v1.7.1
	© October 2020, Paul Chiorean
	Creates a 'safe area' frame the size of the page margins.
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;

var scope = doc.pages; // doc.pages or doc.spreads
var saLayerName = ["safe area", "visible", "Visible", "vizibil", "Vizibil", "vis. area", "Vis. area"];
var dieLayerName = ["dielines", "diecut", "die cut", "Die Cut", "cut", "Cut", "cut lines", "stanze", "Stanze", "Stanz", "decoupe"];
var saSwatchName = "Safe area";

app.doScript(main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "Safe area");


function main() {
	if (!doc.colors.itemByName(saSwatchName).isValid)
		doc.colors.add({ name: saSwatchName, model: ColorModel.PROCESS,
		space: ColorSpace.CMYK, colorValue: [0, 100, 0, 0] });
	var saLayer, dieLayer;
	if (saLayer = FindLayer(saLayerName)) {
		saLayer.properties = { layerColor: UIColors.YELLOW, visible: true, locked: false }
		if (dieLayer = FindLayer(dieLayerName)) saLayer.move(LocationOptions.before, dieLayer);
	} else {
		saLayerName = saLayerName[0];
		saLayer = doc.layers.add({ name: saLayerName,
			layerColor: UIColors.YELLOW, visible: true, locked: false });
		if (dieLayer = FindLayer(dieLayerName)) {
			saLayer.move(LocationOptions.before, dieLayer);
		} else saLayer.move(LocationOptions.AT_BEGINNING);
	}
	for (var i = 0; i < scope.length; i++) {
		var saBounds = SafeArea(scope[i]);
		if (saBounds == false) continue; // No margins; skip
		if (HasItems(scope[i])) continue; // Frame already exists
		scope[i].rectangles.add({
			name: "<safe area>", label: "safe area",
			contentType: ContentType.UNASSIGNED,
			fillColor: "None", strokeColor: saSwatchName,
			strokeWeight: "0.5pt",
			strokeAlignment: StrokeAlignment.INSIDE_ALIGNMENT,
			strokeType: "$ID/Canned Dashed 3x2",
			overprintStroke: false,
			geometricBounds: saBounds,
			itemLayer: saLayer.name
		});
	}
	saLayer.locked = true;
}

function SafeArea(scope) { // Return safe area bounds
	switch (scope.constructor.name) {
		case "Page":
			var mgPg = scope.marginPreferences;
			var m_y1, m_x1, m_y2, m_x2;
			// Reverse left and right margins if left-hand page
			if (mgPg.top + mgPg.left + mgPg.bottom + mgPg.right != 0) {
				m_y1 = scope.bounds[0] + mgPg.top;
				m_x1 = scope.bounds[1] + mgPg.left;
				m_y2 = scope.bounds[2] - mgPg.bottom;
				m_x2 = scope.bounds[3] - mgPg.right;
				if (scope.side == PageSideOptions.LEFT_HAND) {
					m_x1 = scope.bounds[1] + mgPg.right;
					m_x2 = scope.bounds[3] - mgPg.left;
				}
				return [m_y1, m_x1, m_y2, m_x2];
			} else return false;
			break;
		case "Spread":
			var fPg = scope.pages.firstItem(); // First page of spread
			var lPg = scope.pages.lastItem(); // Last page of spread
			var sizeSp, mgSp, m_y1, m_x1, m_y2, m_x2;
			sizeSp = fPg.bounds;
			mgSp = {
				top: fPg.marginPreferences.top,
				left: fPg.marginPreferences.left,
				bottom: fPg.marginPreferences.bottom,
				right: fPg.marginPreferences.right
			}
			if (scope.pages.length == 1) { // Spread is single page
				// Reverse left and right margins if left-hand page
				if (fPg.side == PageSideOptions.LEFT_HAND) {
					mgSp.left = fPg.marginPreferences.right;
					mgSp.right = fPg.marginPreferences.left;
				}
			} else { // Spread is multiple pages
				sizeSp = [fPg.bounds[0], fPg.bounds[1], lPg.bounds[2], lPg.bounds[3]];
				// Reverse left and right margins if left-hand page
				if (fPg.side == PageSideOptions.LEFT_HAND) {
					mgSp.left = fPg.marginPreferences.right;
				}
				mgSp.bottom = lPg.marginPreferences.bottom;
				mgSp.right = lPg.marginPreferences.right;
			}
			if (mgSp.top + mgSp.left + mgSp.bottom + mgSp.right != 0) {
				m_y1 = mgSp.top;
				m_x1 = mgSp.left;
				m_y2 = sizeSp[2] - mgSp.bottom;
				m_x2 = sizeSp[3] - mgSp.right;
				return [m_y1, m_x1, m_y2, m_x2];
			} else return false;
			break;
	}
}

function FindLayer(names) { // Find first layer from a list of names
	for (var i = 0; i < names.length; i++) {
		var layer = doc.layers.item(names[i]);
		if (layer.isValid) return layer;
	}
}

function HasItems(scope) { // Check for items labeled 'safe area'
	for (var i = 0; i < scope.pageItems.length; i++) {
		if (scope.pageItems.item(i).label == "safe area") { return true } else continue;
	}
}
