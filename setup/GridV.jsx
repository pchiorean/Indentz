/*
	V grid 1.1.1 (2021-08-16)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)
*/

// @include "../lib/Bounds.jsxinc";

if (!(doc = app.activeDocument)) exit();
app.scriptPreferences.measurementUnit = MeasurementUnits.MILLIMETERS;

app.doScript(main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "V grid");

function main() {
	try { doc.layers.add({ name: "guides", layerColor: UIColors.MAGENTA }) } catch (_) {};
	try { doc.layers.itemByName("guides").visible = true } catch (_) {};
	try { doc.layers.itemByName("guides").printable = false } catch (_) {};
	try { doc.layers.itemByName("guides").locked = false } catch (_) {};

	for (var i = 0, n = doc.pages.length; i < n; i++) {
		var page = doc.pages[i];
		var tgBounds = Bounds(page).page.visible || Bounds(page).page.size;
		var tgSize = { width: tgBounds[3] - tgBounds[1], height: tgBounds[2] - tgBounds[0] };
		var shortSize = Math.min(tgSize.height, tgSize.width);
		var longSize = Math.max(tgSize.height, tgSize.width);
		var guide = {
			color: "Magenta",
			type: "$ID/Canned Dashed 3x2",
			weight: longSize < 500 ? "0.75 pt" : (longSize < 1000 ? "1.5 pt" : "3 pt")
		};
		// Margin = 1/19 of the short size
		// Big SKU is height w/o 6 margins top & bottom
		// Small SKU is 23% smaller than big SKU
		// HW at 1/2 margin of bottom
		var MG = shortSize / 19;
		var bigSKUsize = shortSize - 12 * MG;
		var smallSKUscaleFactor = 1 - 23/100;
		var smallSKUsize = bigSKUsize * smallSKUscaleFactor;
		// Margins
		page.marginPreferences.properties = {
			top: (tgBounds[0] - page.bounds[0]) + MG,
			left: (tgBounds[1] - page.bounds[1]) + MG,
			bottom: (page.bounds[2] - tgBounds[2]) + MG,
			right: (page.bounds[3] - tgBounds[3]) + MG,
			columnCount: 2, columnGutter: 0
		};
		// Guides
		if (tgSize.width / tgSize.height <= 0.95) { // Portrait
			AddGuide("vertical", tgBounds[0] + MG * 5, "5 x mg");
			AddGuide("vertical", tgBounds[0] + MG * 6, "6 x mg");
		} else { // Landscape
			AddGuide("horizontal", tgBounds[0] + MG * 5, "5 x mg");
			AddGuide("horizontal", tgBounds[0] + MG * 6, "6 x mg");
		};
		// var arrowTip = tgBounds[1] + (tgBounds[3] - tgBounds[1]) / 2 + bigSKUsize * 0.25033;
		// AddGuide("vertical", arrowTip, "arrow tip", UIColors.GRID_GREEN);
		// AddGuide("vertical", tgBounds[3] - MG * 0.5, "half mg");
		AddGuide("vertical", (tgBounds[3] - tgBounds[1]) * 3/4, "3/4");
		// AddGuide("vertical", tgBounds[3] - MG * 1.5, "SKU right (with pouch)");
		AddGuide("horizontal", tgBounds[0] + tgSize.height / 2, "middle", UIColors.GRID_GREEN);
		AddGuide("horizontal", tgBounds[2] - MG * 3, "SKU bottom");
		// AddGuide("horizontal", tgBounds[2] - MG * 4.338711, "product range top", UIColors.GRID_BLUE);
		// AddGuide("horizontal", tgBounds[2] - MG * 2.4, "product range bottom", UIColors.GRID_BLUE);
		// AddGuide("horizontal", tgBounds[2] - MG / 2, "HW bottom", UIColors.GREEN);
		// SKUs
		// var bigSKU = page.ovals.add({
		// 	itemLayer: "guides", label: "SKU big",
		// 	geometricBounds: [
		// 		page.bounds[0], page.bounds[1],
		// 		page.bounds[0] + 100, page.bounds[1] + 100
		// 	],
		// 	contentType: ContentType.UNASSIGNED,
		// 	fillColor: guide.color
		// });
		// bigSKU.transparencySettings.blendingSettings.opacity = 66;
		// var SKUsymbols = page.graphicLines.add({
		// 	itemLayer: "guides", fillColor: "Paper", strokeColor: "None"
		// });
		// SKUsymbols.paths[0].entirePath = [
		// 	[ 18.424, 24.108 ], [ 39.378, 33.692 ], [ 39.378, 14.079 ],
		// 	[ 60.625, 14.079 ], [ 60.625, 43.41 ], [ 75.033, 50 ],
		// 	[ 60.625, 56.59 ], [ 60.625, 85.921 ], [ 39.378, 85.921 ],
		// 	[ 39.378, 66.308 ], [ 18.425, 75.892 ], [ 18.424, 24.108 ],
		// ];
		// SKUsymbols.transparencySettings.blendingSettings.opacity = 50;
		// bigSKU.contentPlace(SKUsymbols); SKUsymbols.remove();
		// bigSKU.pageItems[0].move(undefined, [ 18.424, 14.079 ]);
		// bigSKU.transform(CoordinateSpaces.INNER_COORDINATES, AnchorPoint.TOP_LEFT_ANCHOR,
		// 	app.transformationMatrices.add({
		// 		horizontalScaleFactor: bigSKUsize/100, verticalScaleFactor: bigSKUsize/100
		// 	})
		// );
		// doc.align(bigSKU, AlignOptions.VERTICAL_CENTERS, AlignDistributeBounds.PAGE_BOUNDS);
		// doc.align(bigSKU, AlignOptions.HORIZONTAL_CENTERS, AlignDistributeBounds.PAGE_BOUNDS);
		// var smallSKU = bigSKU.duplicate(); smallSKU.sendToBack(bigSKU);
		// smallSKU.transform(CoordinateSpaces.INNER_COORDINATES, AnchorPoint.CENTER_ANCHOR,
		// 	app.transformationMatrices.add({
		// 		horizontalScaleFactor: smallSKUscaleFactor, verticalScaleFactor: smallSKUscaleFactor
		// 	})
		// );
		// smallSKU.move(undefined, [ bigSKUsize * 0.63597, 0 ]);
		// page.groups.add([ smallSKU, bigSKU ]);
		// Arrow lines
		// var oldTRP = app.layoutWindows[0].transformReferencePoint;
		// var vLine1 = page.graphicLines.add({ itemLayer: "guides", label: "arrow guide",
		// 	strokeColor: guide.color, strokeType: guide.type, strokeWeight: guide.weight
		// });
		// vLine1.transparencySettings.blendingSettings.opacity = 90;
		// vLine1.paths[0].entirePath = [
		// 	[ 2 * arrowTip - tgBounds[3], tgBounds[0] + tgSize.height / 2 ],
		// 	[ tgBounds[3], tgBounds[0] + tgSize.height / 2 ]
		// ];
		// app.layoutWindows[0].transformReferencePoint = AnchorPoint.CENTER_ANCHOR;
		// vLine1.rotationAngle = 24.44;
		// var vLine2 = page.graphicLines.add({ itemLayer: "guides", label: "arrow guide",
		// 	strokeColor: guide.color, strokeType: guide.type, strokeWeight: guide.weight
		// });
		// vLine2.transparencySettings.blendingSettings.opacity = 90;
		// vLine2.paths[0].entirePath = [
		// 	[ 2 * arrowTip - tgBounds[3], tgBounds[0] + tgSize.height / 2 ],
		// 	[ arrowTip, tgBounds[0] + tgSize.height / 2 ]
		// ];
		// app.layoutWindows[0].transformReferencePoint = AnchorPoint.RIGHT_CENTER_ANCHOR;
		// vLine2.rotationAngle = -24.44;
		// var vLine3 = page.graphicLines.add({ itemLayer: "guides", label: "rotated HL guide",
		// 	strokeColor: guide.color, strokeType: guide.type, strokeWeight: guide.weight
		// });
		// vLine3.transparencySettings.blendingSettings.opacity = 90;
		// vLine3.paths[0].entirePath = [
		// 	[ tgBounds[3] - MG * 6, tgBounds[0] + MG ],
		// 	[ tgBounds[3] - MG * 6, tgBounds[2] - MG ]
		// ];
		// app.layoutWindows[0].transformReferencePoint = AnchorPoint.BOTTOM_CENTER_ANCHOR;
		// vLine3.rotationAngle = 24.44;
		// page.groups.add([ vLine1, vLine2 ]);
		// app.layoutWindows[0].transformReferencePoint = oldTRP;
		// Margin size square
		var mgFrame = page.rectangles.add({
			itemLayer: "guides", label: "mg",
			geometricBounds: [ tgBounds[0], tgBounds[1], tgBounds[0] + MG, tgBounds[1] + MG] ,
			contentType: ContentType.UNASSIGNED,
			fillColor: "Magenta", strokeColor: "None"
		});
		mgFrame.transparencySettings.blendingSettings.opacity = 90;
		doc.align(mgFrame, AlignOptions.RIGHT_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
		doc.align(mgFrame, AlignOptions.TOP_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
		mgFrame.move(undefined, [ MG, -MG ]);
	};

	function AddGuide(horv, location, label, color) {
		page.guides.add(undefined, {
			itemLayer: "guides", label: label,
			guideColor: color || UIColors.LIGHT_GRAY,
			orientation: horv == "horizontal" ?
				HorizontalOrVertical.HORIZONTAL : HorizontalOrVertical.VERTICAL,
			location: location
		});
	};
};
