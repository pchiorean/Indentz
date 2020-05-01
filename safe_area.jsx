/*
	Safe area v1.5.5
	© May 2020, Paul Chiorean
	This script creates a 'safe area' frame, on every page or spread, 
	if it doesn't already exist and if margins are defined.
*/

var doc = app.activeDocument;

// Defaults
var scope = doc.pages; // doc.pages or doc.spreads
const safeLayerName = "safe area";
const dieLayerName = "dielines";
const safeSwatchName = "Safe area";
const safeAreaProps = {
	itemLayer: safeLayerName,
	label: "safe area",
	contentType: ContentType.UNASSIGNED,
	fillColor: "None",
	strokeColor: safeSwatchName,
	strokeWeight: "0.5pt",
	strokeAlignment: StrokeAlignment.INSIDE_ALIGNMENT,
	strokeType: "$ID/Canned Dashed 3x2",
	overprintStroke: false
}

// Create 'safe area' layer and move it below 'dielines' layer, or 1st
var safeLayer = doc.layers.item(safeLayerName);
var dieLayer = doc.layers.item(dieLayerName);
if (safeLayer.isValid) { safeLayer.layerColor = UIColors.YELLOW, safeLayer.visible = true
} else doc.layers.add({ name: safeLayerName, layerColor: UIColors.YELLOW, visible: true, locked: false });
try { safeLayer.move(LocationOptions.after, dieLayer) } catch (_) { safeLayer.move(LocationOptions.AT_BEGINNING) };
// Create 'Safe area' color
try { doc.colors.add({ name: safeSwatchName, model: ColorModel.PROCESS, space: ColorSpace.CMYK, colorValue: [0, 100, 0, 0] }) } catch (_) {};

// Draw frames
var safeAreaBounds, safeAreaRect;
for (var i = 0; i < scope.length; i++) {
	safeAreaBounds = safeArea(scope[i]);
	if (safeAreaBounds == false) continue; // No margins; skip
	if (safeLayerItems(scope[i]) == true) continue; // Frame already exists
	safeAreaRect = scope[i].rectangles.add(safeAreaProps);
	safeAreaRect.geometricBounds = safeAreaBounds;
}

// Function to calculate safe area coordinates
function safeArea(scope) {
	switch (scope.constructor.name) {
		case "Page":
			var pageMargins = scope.marginPreferences;
			var m_y1, m_x1, m_y2, m_x2;
			// Reverse left and right margins if left-hand page
			if (pageMargins.top + pageMargins.left + pageMargins.bottom + pageMargins.right != 0) {
				m_y1 = scope.bounds[0] + pageMargins.top;
				m_x1 = scope.bounds[1] + pageMargins.left;
				m_y2 = scope.bounds[2] - pageMargins.bottom;
				m_x2 = scope.bounds[3] - pageMargins.right;
				if (scope.side == PageSideOptions.LEFT_HAND) {
					m_x1 = scope.bounds[1] + pageMargins.right;
					m_x2 = scope.bounds[3] - pageMargins.left;
				}
				return [m_y1, m_x1, m_y2, m_x2];
			} else return false;
			break;
		case "Spread":
			var firstPage = scope.pages.firstItem(); // First page of spread
			var lastPage = scope.pages.lastItem(); // Last page of spread
			var spreadSize, spreadMargins, m_y1, m_x1, m_y2, m_x2;
			spreadSize = firstPage.bounds;
			spreadMargins = {
				top: firstPage.marginPreferences.top,
				left: firstPage.marginPreferences.left,
				bottom: firstPage.marginPreferences.bottom,
				right: firstPage.marginPreferences.right
			}
			if (scope.pages.length == 1) { // Spread is single page
				// Reverse left and right margins if left-hand page
				if (firstPage.side == PageSideOptions.LEFT_HAND) {
					spreadMargins.left = firstPage.marginPreferences.right;
					spreadMargins.right =  firstPage.marginPreferences.left;
				}
			} else { // Spread is multiple pages
				spreadSize = [firstPage.bounds[0], firstPage.bounds[1], lastPage.bounds[2], lastPage.bounds[3]];
				// Reverse left and right margins if left-hand page
				if (firstPage.side == PageSideOptions.LEFT_HAND) {
					spreadMargins.left = firstPage.marginPreferences.right;
				}
				spreadMargins.bottom = lastPage.marginPreferences.bottom;
				spreadMargins.right = lastPage.marginPreferences.right;
			}
			if (spreadMargins.top + spreadMargins.left + spreadMargins.bottom + spreadMargins.right != 0) {
				m_y1 = spreadMargins.top;
				m_x1 = spreadMargins.left;
				m_y2 = spreadSize[2] - spreadMargins.bottom;
				m_x2 = spreadSize[3] - spreadMargins.right;
				return [m_y1, m_x1, m_y2, m_x2];
			} else return false;
			break;
	}
}

// Function to check for items labeled 'safe area'
function safeLayerItems(scope) {
	for (var i = 0; i < scope.pageItems.length; i++) {
		if (scope.pageItems.item(i).label == "safe area") return true;
	}
}