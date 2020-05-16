/*
	Safe area v1.6.0
	© May 2020, Paul Chiorean
	This script creates a 'safe area' frame, on every page (or spread)
	for which margins are defined, if it doesn't already exist.
*/

var doc = app.activeDocument;

// Defaults
var scope = doc.pages; // doc.pages or doc.spreads

var safeLayerName = ["visible", "Visible", "vizibil", "Vizibil", "vis. area", "Vis. area", "safe area"];
var dieLayerName = ["diecut", "die cut", "Die Cut", "cut lines", "Stanze", "dielines"];
var safeLayer = findLayer(safeLayerName);
var dieLayer = findLayer(dieLayerName);
const safeSwatchName = "Safe area";
const saFrameP = {
	label: "safe area",
	contentType: ContentType.UNASSIGNED,
	fillColor: "None",
	strokeColor: safeSwatchName,
	strokeWeight: "0.5pt",
	strokeAlignment: StrokeAlignment.INSIDE_ALIGNMENT,
	strokeType: "$ID/Canned Dashed 3x2",
	overprintStroke: false
}

// Create 'safe area' layer
if (safeLayer.isValid) {
	safeLayer.layerColor = UIColors.YELLOW;
	safeLayer.visible = true; safeLayer.locked = false;
	try { safeLayer.move(LocationOptions.after, dieLayer) // move it below 'dielines' layer
	} catch (_) {};
} else {
	doc.layers.add({ name: safeLayerName, layerColor: UIColors.YELLOW,
	visible: true, locked: false });
	try { safeLayer.move(LocationOptions.after, dieLayer) // move it below 'dielines' layer, or 1st
	} catch (_) { safeLayer.move(LocationOptions.AT_BEGINNING) };
}
// Create 'Safe area' color
try { doc.colors.add({ name: safeSwatchName, model: ColorModel.PROCESS,
	space: ColorSpace.CMYK, colorValue: [0, 100, 0, 0] })
} catch (_) {};

// Draw frames
var saBounds, saFrame;
for (var i = 0; i < scope.length; i++) {
	saBounds = safeArea(scope[i]);
	if (saBounds == false) continue; // No margins; skip
	if (safeLayerItems(scope[i]) == true) continue; // Frame already exists
	saFrame = scope[i].rectangles.add(saFrameP);
	saFrame.geometricBounds = saBounds;
	saFrame.itemLayer = safeLayer.name;
}
try { safeLayer.locked = true } catch (_) {};


function safeArea(scope) { // Return safe area bounds
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
					mgSp.right =  fPg.marginPreferences.left;
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

function findLayer(names) { // Find first layer from a list of names
	for (var i = 0; i < names.length; i++) {
		var layer = doc.layers.item(names[i]);
		if (layer.isValid) return layer;
	}
}

function safeLayerItems(scope) { // Check for items labeled 'safe area'
	for (var i = 0; i < scope.pageItems.length; i++) {
		if (scope.pageItems.item(i).label == "safe area") { return true } else continue;
	}
}