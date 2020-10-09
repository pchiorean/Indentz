/*
	Fit to page margins v2.0.0
	© October 2020, Paul Chiorean
	Resizes the selected objects to the page margins.
*/

app.scriptPreferences.measurementUnit = MeasurementUnits.MILLIMETERS;

if (app.documents.length == 0) exit();
var doc = app.activeDocument;

var sel = doc.selection;
if (sel.length == 0 || (sel[0].constructor.name == "Guide")) exit();
for (var i = 0; i < sel.length; i++) {
	var obj = sel[i], page;
	if (page = obj.parentPage) Fit(obj);
}


function Fit(obj) {
	const SNAP_ZONE = 6; // mm
	var pg = Bounds(page); // Page or spread dimensions
	var pgZ = [pg[0] + SNAP_ZONE, pg[1] + SNAP_ZONE, pg[2] - SNAP_ZONE, pg[3] - SNAP_ZONE];
	var tg = MgBounds(page); // Target dimensions
	var tgZ = [tg[0] + SNAP_ZONE, tg[1] + SNAP_ZONE, tg[2] - SNAP_ZONE, tg[3] - SNAP_ZONE];
	var objG = obj.geometricBounds; // Object dimensions
	var objV = obj.visibleBounds;
	if (obj.pageItems.length == 1) { // Child dimensions for containers
		var objC = obj.pageItems[0].visibleBounds; objC = [
			objC[0] > tgZ[0] ? tg[0] : Math.min(objC[0], objV[0]),
			objC[1] > tgZ[1] ? tg[1] : Math.min(objC[1], objV[1]),
			objC[2] < tgZ[2] ? tg[2] : Math.max(objC[2], objV[2]),
			objC[3] < tgZ[3] ? tg[3] : Math.max(objC[3], objV[3])
		];
	} else { var objC = [tg[0], tg[1], tg[2], tg[3]] }
	var objRA = obj.absoluteRotationAngle; // Object angle

	// Case 1: Labeled 'HW'
	if (obj.label == "HW") {
		obj.geometricBounds = [tg[0] + (tg[2] - tg[0]) * 0.9, tg[1], tg[2], tg[3]];
		if (obj.constructor.name == "TextFrame")
			obj.textFramePreferences.insetSpacing = [0, 0, 0, 0];
		return;
	}
	// Check if obj is outside bounds / inside snap zone
	if (objV[2] <= tg[0] || objV[3] <= tg[1] || objV[0] >= tg[2] || objV[1] >= tg[3]) return;
	if (objV[0] >= tgZ[0] && objV[1] >= tgZ[1] && objV[2] <= tgZ[2] && objV[3] <= tgZ[3]) return;

	// Get target size
	var fitR = [ // Fit to bounds if larger
		objG[2] > tg[0] ? Math.max(objV[0], tg[0]) : objG[0],
		objG[3] > tg[1] ? Math.max(objV[1], tg[1]) : objG[1],
		objG[0] < tg[2] ? Math.min(objV[2], tg[2]) : objG[2],
		objG[1] < tg[3] ? Math.min(objV[3], tg[3]) : objG[3]
	];
	var fitE = [ // Snap to the nearest margins if smaller
		fitR[0] < tgZ[0] ? Math.max(objC[0], tg[0]) : fitR[0],
		fitR[1] < tgZ[1] ? Math.max(objC[1], tg[1]) : fitR[1],
		fitR[2] > tgZ[2] ? Math.min(objC[2], tg[2]) : fitR[2],
		fitR[3] > tgZ[3] ? Math.min(objC[3], tg[3]) : fitR[3]
	];
	// Case 2a: Already clipped
	if (obj.name == "<clip frame>" && obj.pageItems[0].isValid) {
		obj.geometricBounds = fitE; return;
	}
	// Case 2b: Already a container
	if (obj.constructor.name == "Rectangle" &&
		obj.pageItems.length == 1 &&
		obj.strokeWeight == 0 &&
		(objRA == 0 || Math.abs(objRA) == 90 || Math.abs(objRA) == 180)) {
			obj.geometricBounds = fitE; return;
	}
	// Case 3: Simple rectangles
	if (obj.constructor.name == "Rectangle" &&
		obj.strokeWeight == 0 &&
		(objRA == 0 || Math.abs(objRA) == 90 || Math.abs(objRA) == 180)) {
			obj.geometricBounds = fitE; return;
	}
	// Case 4: Text frames
	if (obj.constructor.name == "TextFrame" &&
		(objRA == 0 || Math.abs(objRA) == 90 || Math.abs(objRA) == 180)) {
			obj.geometricBounds = fitE; return;
	}
	// Case 5: Orthogonal lines
	if (obj.constructor.name == "GraphicLine" &&
		(objG[0] == objG[2]) || (objG[1] == objG[3])) {
		// ***TODO***
		return;
	}
	// Case 6: Groups
	if (obj.constructor.name == "Group") {
		if (objV[0] >= tg[0] && objV[1] >= tg[1] && objV[2] <= tg[2] && objV[3] <= tg[3]) return;
		var frame = doc.rectangles.add(
			obj.itemLayer, LocationOptions.AFTER, obj,
			{ name: "<clip frame>", label: obj.label,
			fillColor: "None", strokeColor: "None",
			geometricBounds: fitR }
		);
		frame.sendToBack(obj); app.select(obj); app.cut(); app.select(frame); app.pasteInto();
		return;
	}
	// Other cases: Clip
	if (objV[0] >= tg[0] && objV[1] >= tg[1] && objV[2] <= tg[2] && objV[3] <= tg[3]) return;
		var frame = doc.rectangles.add(
			obj.itemLayer, LocationOptions.AFTER, obj,
			{ name: "<clip frame>", label: obj.label,
			fillColor: "None", strokeColor: "None",
			geometricBounds: fitE }
		);
	frame.sendToBack(obj); app.select(obj); app.cut(); app.select(frame); app.pasteInto();
}

function Bounds(page) { // Return page bounds
	return page.bounds;
}

function MgBounds(page) { // Return page margins bounds
	return [
		page.bounds[0] + page.marginPreferences.top,
		page.side == PageSideOptions.LEFT_HAND ?
			page.bounds[1] + page.marginPreferences.right : page.bounds[1] + page.marginPreferences.left,
		page.bounds[2] - page.marginPreferences.bottom,
		page.side == PageSideOptions.LEFT_HAND ?
			page.bounds[3] - page.marginPreferences.left : page.bounds[3] - page.marginPreferences.right
	];
}
