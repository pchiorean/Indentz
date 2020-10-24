/*
	Fit to... v3.3.0
	© October 2020, Paul Chiorean
	Resizes the selected objects to the page/spread's size/margins/bleed.
	It's run internally by all the other FitTo scripts with the following arguments:
	1: SCOPE: 'page' / 'spread'
	2: TARGET: null / 'bleed' / 'margins'
	3: FORCED: true / false
*/

if (!this.arguments) {
	var SCOPE = "page"; var TARGET = null; var FORCED = false;
} else {
	var SCOPE = arguments[0]; var TARGET = arguments[1]; var FORCED = arguments[2];
}
var DEBUG = false;

if (app.documents.length == 0) exit();
var doc = app.activeDocument, sel = doc.selection;
if (sel.length == 0 || (sel[0].constructor.name == "Guide")) exit();

var set_RO = doc.viewPreferences.rulerOrigin;
doc.viewPreferences.rulerOrigin = RulerOrigin.SPREAD_ORIGIN;
app.scriptPreferences.measurementUnit = MeasurementUnits.MILLIMETERS;
var obj, page;
while (obj = sel.shift()) {
	if (page = obj.parentPage) { // Object is on page
		Fit(obj);
	} else if (FORCED) { // If forced fit, include objects on pasteboard
		var pages = app.activeWindow.activeSpread.pages;
		for (var i = 0; i < pages.length; i++) {
			if (obj.geometricBounds[3] <= pages[0].bounds[3]) { page = pages[0]; break }
			if (obj.geometricBounds[1] >= pages[i].bounds[1] &&
				obj.geometricBounds[3] <= pages[i].bounds[3]) { page = pages[i]; break}
			if (obj.geometricBounds[1] >= pages[-1].bounds[1]) { page = pages[-1]; break }
		}
		Fit(obj);
	}
}
doc.viewPreferences.rulerOrigin = set_RO;


function Fit(obj) {
	var pg = Bounds(page, SCOPE, null);
	var tg = Bounds(page, SCOPE, TARGET);
	var SNAP_ZONE = TARGET == "margins" ?
		Math.min(tg[2] - tg[0], tg[3] - tg[1]) * 0.05 :
		Math.min(pg[2] - pg[0], pg[3] - pg[1]) * 0.05;
	var pgZ = [pg[0] + SNAP_ZONE, pg[1] + SNAP_ZONE, pg[2] - SNAP_ZONE, pg[3] - SNAP_ZONE];
	var tgZ = [tg[0] + SNAP_ZONE, tg[1] + SNAP_ZONE, tg[2] - SNAP_ZONE, tg[3] - SNAP_ZONE];
	var zone = TARGET == "margins" ? tgZ : pgZ;
	var objG = obj.geometricBounds;
	var objV = obj.visibleBounds;
	var objRA = obj.absoluteRotationAngle;
	if (DEBUG) doc.textFrames.add(obj.itemLayer, LocationOptions.BEFORE, obj,
		{ contents: "snap zone", fillColor: "None", strokeColor: "Cyan",
		nonprinting: true, geometricBounds: TARGET == "margins" ? tgZ : pgZ });

	if (!FORCED) {
		// Check if obj is outside bounds / inside bounds but not in the snap zone
		if (objV[2] <= tg[0] || objV[3] <= tg[1] || objV[0] >= tg[2] || objV[1] >= tg[3]) return;
		if (objV[0] >= zone[0] && objV[1] >= zone[1] && objV[2] <= zone[2] && objV[3] <= zone[3]) return;
		// Compute target size
		var fitR = [ // If larger, reduce to bounds
			objG[2] > tg[0] ? Math.max(objV[0], tg[0]) : objG[0],
			objG[3] > tg[1] ? Math.max(objV[1], tg[1]) : objG[1],
			objG[0] < tg[2] ? Math.min(objV[2], tg[2]) : objG[2],
			objG[1] < tg[3] ? Math.min(objV[3], tg[3]) : objG[3]
		];
		if (obj.pageItems.length == 1) { // Child dimensions
			var objC = obj.pageItems[0].visibleBounds; objC = [
				objC[0] < zone[0] ? tg[0] : Math.min(objC[0], fitR[0]),
				objC[1] < zone[1] ? tg[1] : Math.min(objC[1], fitR[1]),
				objC[2] > zone[2] ? tg[2] : Math.max(objC[2], fitR[2]),
				objC[3] > zone[3] ? tg[3] : Math.max(objC[3], fitR[3])
			];
		} else { var objC = fitR }
		if (DEBUG) doc.textFrames.add(obj.itemLayer, LocationOptions.BEFORE, obj,
			{ contents: "objC", fillColor: "Magenta", strokeColor: "None",
			nonprinting: true, geometricBounds: objC });
		var fitE = [ // If smaller, expand to bounds if inside snap zone
			fitR[0] < zone[0] ? Math.min(objC[0], tg[0]) : fitR[0],
			fitR[1] < zone[1] ? Math.min(objC[1], tg[1]) : fitR[1],
			fitR[2] > zone[2] ? Math.max(objC[2], tg[2]) : fitR[2],
			fitR[3] > zone[3] ? Math.max(objC[3], tg[3]) : fitR[3]
		];
		if (DEBUG) doc.textFrames.add(obj.itemLayer, LocationOptions.BEFORE, obj,
			{ contents: "fitR", fillColor: "Yellow", strokeColor: "None",
			nonprinting: true, geometricBounds: fitR });
		if (DEBUG) doc.textFrames.add(obj.itemLayer, LocationOptions.BEFORE, obj,
			{ contents: "fitE", fillColor: "Cyan", strokeColor: "None",
			nonprinting: true, geometricBounds: fitE });
	}

	// Case 1: Objects labeled 'HW'
	if (obj.label == "HW") {
		obj.geometricBounds = TARGET == "margins" ?
			[tg[0] + (tg[2] - tg[0]) * 0.9, tg[1], tg[2], tg[3]] :
			[(pg[2] - pg[0]) * 0.9, tg[1], tg[2], tg[3]];
		if (obj.constructor.name == "TextFrame")
			obj.textFramePreferences.insetSpacing = [0, 0, TARGET == "bleed" ?
				doc.documentPreferences.properties.documentBleedBottomOffset : 0, 0];
		return;
	}
	// Case 2: Already clipped
	if (obj.name == "<clip frame>" && obj.pageItems[0].isValid) {
		obj.geometricBounds = FORCED ? tg : fitE; return;
	}
	// Case 2: Simple rectangles or containers
	if (obj.constructor.name == "Rectangle" &&
		obj.pageItems.length <= 1 &&
		(obj.strokeWeight == 0 || obj.strokeAlignment == StrokeAlignment.INSIDE_ALIGNMENT) &&
		(objRA == 0 || Math.abs(objRA) == 90 || Math.abs(objRA) == 180)) {
			obj.geometricBounds = FORCED ? tg : fitE; return;
	}
	// Case 3: Text frames
	if (obj.constructor.name == "TextFrame" &&
		(objRA == 0 || Math.abs(objRA) == 90 || Math.abs(objRA) == 180)) {
			obj.geometricBounds = FORCED ? tg : fitE; return;
	}
	// Case 4: Orthogonal lines
	if (obj.constructor.name == "GraphicLine" &&
		(objG[0] == objG[2]) || (objG[1] == objG[3])) {
		return; // ***TODO***
	}
	// Case 5: Groups
	if (obj.constructor.name == "Group") { Clip(FORCED ? tg : fitR); return; }
	// Other cases: Clip
	Clip(FORCED ? tg : fitE);

	function Clip(fit) {
		if (objV[0] >= tg[0] && objV[1] >= tg[1] && objV[2] <= tg[2] && objV[3] <= tg[3]) return;
		var frame = doc.rectangles.add(
			obj.itemLayer, LocationOptions.AFTER, obj,
			{ name: "<clip frame>", label: obj.label,
			fillColor: "None", strokeColor: "None",
			geometricBounds: fit });
		frame.sendToBack(obj); app.select(obj); app.cut(); app.select(frame); app.pasteInto();
	}
}

function Bounds(/*parent page*/page, /*'page','spread'*/scope, /*null,'bleed','margins'*/target) {
	var fPg = page.parent.pages.firstItem();
	var lPg = page.parent.pages.lastItem();
	var bleed = {
		top: doc.documentPreferences.properties.documentBleedTopOffset,
		left: doc.documentPreferences.properties.documentBleedInsideOrLeftOffset,
		bottom: doc.documentPreferences.properties.documentBleedBottomOffset,
		right: doc.documentPreferences.properties.documentBleedOutsideOrRightOffset
	}
	switch(scope) {
		case "page":
			switch(target) {
				case null:
					return page.bounds;
				case "bleed":
					return [
						page.bounds[0] - bleed.top,
						page.bounds[1] - (page == fPg ?
							(fPg.side == PageSideOptions.LEFT_HAND ? bleed.right : bleed.left) :
							0),
						page.bounds[2] + bleed.bottom,
						page.bounds[3] + (fPg == lPg ?
							(fPg.side == PageSideOptions.LEFT_HAND ? bleed.left : bleed.right) :
							page == lPg ? bleed.right : 0)
					];
				case "margins":
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
		case "spread":
			switch(target) {
				case null:
					return page.parent.pages.length == 1 ?
						page.parent.pages.firstItem().bounds : [
							page.parent.pages.firstItem().bounds[0],
							page.parent.pages.firstItem().bounds[1],
							page.parent.pages.lastItem().bounds[2],
							page.parent.pages.lastItem().bounds[3]
					];
				case "bleed":
					return [
						fPg.bounds[0] - bleed.top,
						fPg.bounds[1] - (fPg.side == PageSideOptions.LEFT_HAND ?
							bleed.right : bleed.left),
						lPg.bounds[2] + bleed.bottom,
						lPg.bounds[3] + (fPg == lPg ?
							(fPg.side == PageSideOptions.LEFT_HAND ? bleed.left : bleed.right) :
							bleed.right)
					];
				case "margins":
					return [
						fPg.bounds[0] + fPg.marginPreferences.top,
						fPg.bounds[1] + (fPg.side == PageSideOptions.LEFT_HAND ?
							fPg.marginPreferences.right :
							fPg.marginPreferences.left),
						lPg.bounds[2] - lPg.marginPreferences.bottom,
						lPg.bounds[3] - (fPg == lPg ?
							(fPg.side == PageSideOptions.LEFT_HAND ?
							fPg.marginPreferences.left : fPg.marginPreferences.right) :
							lPg.marginPreferences.right)
					];
			}
	}
}
