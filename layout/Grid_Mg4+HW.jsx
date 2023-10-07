/*
	Page margins and HW from the script name 23.10.7
	(c) 2022-2023 Paul Chiorean <jpeg@basement.ro>

	By default it sets the page margins to 5% of the visible/page area for
	all document pages. Renaming the script (e.g., Margins<XX>HW<YY>.jsx) you
	can set a value `XX` for the margins and (optionally) a `YY` value for an
	HW area at the bottom. The default values are 5 for margins and 10 for HW.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument)) exit();

app.doScript(grid, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, 'Set margins');

function grid() {
	var guidesLayer, hwLayer, page, tgBounds, tgSize, MG, RE;
	var guidesLayerName = '.guides';
	var hwLayerName = 'HW';
	var MG_PCT = 5;
	var HW_PCT = 10;

	app.scriptPreferences.measurementUnit = MeasurementUnits.MILLIMETERS;
	doc.guidePreferences.guidesLocked = false;
	doc.guidePreferences.guidesShown = true;

	// Add layers
	hwLayer = doc.layers.item(hwLayerName);
	if (hwLayer.isValid) {
		hwLayer.properties = { visible: true, locked: false };
	} else {
		hwLayer = doc.layers.add({
			name: hwLayerName,
			layerColor: UIColors.LIGHT_GRAY,
			visible: true,
			printable: true,
			locked: false
		}).move(LocationOptions.AT_BEGINNING);
	}
	guidesLayer = doc.layers.item(guidesLayerName);
	if (guidesLayer.isValid) {
		guidesLayer.properties = { visible: true, locked: false };
	} else {
		guidesLayer = doc.layers.add({
			name: guidesLayerName,
			layerColor: UIColors.MAGENTA,
			visible: true,
			printable: false,
			locked: false
		}).move(LocationOptions.AT_BEGINNING);
	}

	// Deduce MG and HW from filename
	RE = File($.fileName).name.match(/\d+/g); // Get all numbers
	if (RE) { // We have at least 1 match
		if (RE.length === 1) { // If 1 number, check if it should be MG or HW
			if (/hw\d+/i.test(File($.fileName).name)) { HW_PCT = Number(RE[0]); } // HW is explicit => HW
			else if (/hw(?!\d+)/i.test(File($.fileName).name)) { MG_PCT = Number(RE[0]); } // HW is implicit => MG
			else { MG_PCT = Number(RE[0]); HW_PCT = 0; } // No HW => MG / zero HW
		} else { MG_PCT = Number(RE[0]); HW_PCT = Number(RE[1]); } // First 2 numbers => MG / HW
	} else if (!/hw/i.test(File($.fileName).name)) { HW_PCT = 0; } // No match => zero HW

	doc.guides.everyItem().remove();

	for (var i = 0; i < doc.pages.length; i++) {
		page = doc.pages[i];
		tgBounds = getBounds(page).page.visible;
		tgSize = { width: tgBounds[3] - tgBounds[1], height: tgBounds[2] - tgBounds[0] };
		MG = Math.min(tgSize.height, tgSize.width) * MG_PCT / 100;

		// Set margins
		page.marginPreferences.properties = {
			top:    (tgBounds[0] - page.bounds[0]) + MG,
			left:   (tgBounds[1] - page.bounds[1]) + MG,
			bottom: (page.bounds[2] - tgBounds[2]) + tgSize.height * HW_PCT / 100 + MG,
			right:  (page.bounds[3] - tgBounds[3]) + MG,
			columnCount:  1,
			columnGutter: 0
		};

		// Common guides
		addGuide(page, guidesLayer, 'h', tgBounds[0] + tgSize.height * (1 - HW_PCT / 100) / 2, 'middle', 'x');
		addGuide(page, guidesLayer, 'v', tgBounds[1] + tgSize.width / 2, 'middle', 'x');
		addGuide(page, hwLayer, 'h', tgBounds[0] + tgSize.height * (1 - HW_PCT / 100), 'hw', 's');
	}

	/**
	 * Adds a custom ruler guide.
	 * @param {Object} target - A `Document`, `Spread`, `Page` or a `MasterSpread`.
	 * @param {Layer} [layer=activeLayer] - A target layer; defaults to the active layer. (Optional.)
	 * @param {string} HorV - If the string begins with `v`, the guide is vertical, else horizontal.
	 * @param {number} location - The location at which to place the guide relative to the current ruler zero point.
	 * @param {string} [label] - The label of the guide. (Optional.)
	 * @param {number} [preset] - A customized set of properties. WIP. (Optional.)
	 */
	function addGuide(target, layer, HorV, location, label, preset) {
		var g = target.guides.add(
			undefined,
			{
				itemLayer:   layer || app.activeDocument.activeLayer,
				label:       label || '',
				orientation: (/^v/i.test(HorV)) ? HorizontalOrVertical.VERTICAL : HorizontalOrVertical.HORIZONTAL,
				location:    location
			}
		);
		switch (preset) {
			case '-': g.guideColor = app.activeDocument.guidePreferences.rulerGuidesColor; break; // Standard guide
			case 'x': g.guideColor = UIColors.MAGENTA; break; // Center
			case 's': g.guideColor = UIColors.GREEN; break; // Section
			case 'g': g.guideColor = app.smartGuidePreferences.guideColor; g.viewThreshold = 101; break; // Subsection
			case 'p': g.guideColor = app.activeDocument.pasteboardPreferences.slugGuideColor; g.viewThreshold = 101; break; // Product
			default:  g.guideColor = UIColors.LIGHT_GRAY; g.viewThreshold = 101; break; // Miscellaneous
		}
		return g;
	}

	/*
		GetBounds 22.2.13
		(c) 2021-2022 Paul Chiorean (jpeg@basement.ro)

		Returns an object containing the geometric bounds of the given page, its parent spread, and miscellaneous
		page boxes, using the current measurement units:

		{
			page: {
				size:    [ top, left, bottom, right ],
				margins: [ t, l, b, r ],
				visible: [ t, l, b, r ],
				bleed:   [ t, l, b, r ]
			},
			spread: {
				size:    [ t, l, b, r ],
				margins: [ t, l, b, r ],
				visible: [ t, l, b, r ],
				bleed:   [ t, l, b, r ]
			}
		};

		Note: 'Visible area' is an area marked by one or more frames named `<visible area>` or labeled `visible area`.
		If margins or visible area are undefined, they fallback to page/spread size.

		Released under MIT License:
		https://choosealicense.com/licenses/mit/
	*/
	function getBounds(page) {
		var PSO = PageSideOptions;
		var visAreaRE = /^<?(visible|safe) area>?$/i;
		var fPg = page.parent.pages.firstItem();
		var lPg = page.parent.pages.lastItem();
		var bleed = {
			top:    page.parent.parent.documentPreferences.properties.documentBleedTopOffset,
			left:   page.parent.parent.documentPreferences.properties.documentBleedInsideOrLeftOffset,
			bottom: page.parent.parent.documentPreferences.properties.documentBleedBottomOffset,
			right:  page.parent.parent.documentPreferences.properties.documentBleedOutsideOrRightOffset
		};
		var margins = {
			top:    page.marginPreferences.top,
			left:   page.marginPreferences.left,
			bottom: page.marginPreferences.bottom,
			right:  page.marginPreferences.right
		};

		return {
			page: {
				size: page.bounds,
				margins: [
					page.bounds[0] + margins.top,
					(page.side === PSO.LEFT_HAND) ? page.bounds[1] + margins.right : page.bounds[1] + margins.left,
					page.bounds[2] - margins.bottom,
					(page.side === PSO.LEFT_HAND) ? page.bounds[3] - margins.left : page.bounds[3] - margins.right
				],
				visible: (function () {
					var frame, i, n;
					var frames = page.pageItems.everyItem().getElements();
					var bounds = [];
					var v = [];
					while ((frame = frames.shift()))
						if (visAreaRE.test(frame.label) || visAreaRE.test(frame.name)) v.push(frame);
					if (v.length > 0) { // Found visible area frame(s)
						bounds = v[0].geometricBounds;
						for (i = 1, n = v.length; i < n; i++) {
							bounds[0] = Math.min(v[i].geometricBounds[0], bounds[0]);
							bounds[1] = Math.min(v[i].geometricBounds[1], bounds[1]);
							bounds[2] = Math.max(v[i].geometricBounds[2], bounds[2]);
							bounds[3] = Math.max(v[i].geometricBounds[3], bounds[3]);
						}
						bounds = [ // Intersect with page bounds
							Math.max(bounds[0], page.bounds[0]),
							Math.max(bounds[1], page.bounds[1]),
							Math.min(bounds[2], page.bounds[2]),
							Math.min(bounds[3], page.bounds[3])
						];
					} else { bounds = page.bounds; } // Fallback to page bounds
					return bounds;
				}()),
				bleed: [
					page.bounds[0] - bleed.top,
					page.bounds[1] - ((page === fPg)
						? ((fPg.side === PSO.LEFT_HAND) ? bleed.right : bleed.left)
						: 0),
					page.bounds[2] + bleed.bottom,
					page.bounds[3] + ((fPg === lPg)
						? ((fPg.side === PSO.LEFT_HAND) ? bleed.left : bleed.right)
						: (page === lPg ? bleed.right : 0))
				]
			},
			spread: {
				size: [ fPg.bounds[0], fPg.bounds[1], lPg.bounds[2], lPg.bounds[3] ],
				margins: (function () {
					var fm, lm, m, i, n;
					var p = page.parent.pages;
					var bounds = [];
					for (i = 0, n = p.length; i < n; i++) {
						m = p[i].marginPreferences;
						if (m.top + m.left + m.bottom + m.right > 0) { fm = p[i]; break; }
					}
					for (i = p.length - 1; i >= 0 ; i--) {
						m = p[i].marginPreferences;
						if (m.top + m.left + m.bottom + m.right > 0) { lm = p[i]; break; }
					}
					if (!fm && !lm) {
						bounds = [ fPg.bounds[0], fPg.bounds[1], lPg.bounds[2], lPg.bounds[3] ];
					} else {
						bounds = [
							Math.min(fm.bounds[0] + fm.marginPreferences.top,
								lm.bounds[0] + lm.marginPreferences.top),
							fm.bounds[1] + ((fm.side === PSO.LEFT_HAND)
								? fm.marginPreferences.right : fm.marginPreferences.left),
							Math.max(lm.bounds[2] - lm.marginPreferences.bottom,
								fm.bounds[2] - fm.marginPreferences.bottom),
							lm.bounds[3] - ((fm === lm)
								? ((fm.side === PSO.LEFT_HAND) ? fm.marginPreferences.left : fm.marginPreferences.right)
								: lm.marginPreferences.right)
						];
					}
					return bounds;
				}()),
				visible: (function () {
					var frame, i, n;
					var frames = page.parent.pageItems.everyItem().getElements();
					var bounds = [];
					var v = [];
					while ((frame = frames.shift()))
						if (visAreaRE.test(frame.label) || visAreaRE.test(frame.name)) v.push(frame);
					if (v.length > 0) { // Found visible area frame(s)
						bounds = v[0].geometricBounds;
						for (i = 1, n = v.length; i < n; i++) {
							bounds[0] = Math.min(v[i].geometricBounds[0], bounds[0]);
							bounds[1] = Math.min(v[i].geometricBounds[1], bounds[1]);
							bounds[2] = Math.max(v[i].geometricBounds[2], bounds[2]);
							bounds[3] = Math.max(v[i].geometricBounds[3], bounds[3]);
						}
					} else { // Fallback to spread bounds
						bounds = [ fPg.bounds[0], fPg.bounds[1], lPg.bounds[2], lPg.bounds[3] ];
					}
					return bounds;
				}()),
				bleed: [
					fPg.bounds[0] - bleed.top,
					fPg.bounds[1] - ((fPg.side === PSO.LEFT_HAND) ? bleed.right : bleed.left),
					lPg.bounds[2] + bleed.bottom,
					lPg.bounds[3] + ((fPg === lPg)
						? ((fPg.side === PSO.LEFT_HAND) ? bleed.left : bleed.right)
						: bleed.right)
				]
			}
		};
	}
}
