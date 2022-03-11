/*
	Add page guides 21.10.10
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Adds guides on pages' edges and inner centers or selected objects' edges.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument)) exit();

app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, 'Add page guides');

function main() {
	var hwLayer, guidesLayer, page, guide, s, i, n;
	var guides = doc.guides.everyItem().getElements();
	var items = doc.selection;
	var targetBounds = [];
	var flgExit = false;
	var guidesLayerName = 'guides';
	var hwLayerName = 'HW';
	var HW = 10 / 100;
	app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;
	doc.guidePreferences.guidesLocked = false;
	doc.guidePreferences.guidesShown = true;

	// Create guides layer
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
		});
	}
	hwLayer = doc.layers.item(hwLayerName);
	if (hwLayer.isValid) {
		hwLayer.properties = { locked: false };
		guidesLayer.move(LocationOptions.BEFORE, hwLayer);
	}

	// Add guides
	if (items.length > 0) { // Selection guides
		// Get selection's parent page
		s = items[0].parent;
		while (s.constructor.name !== 'Spread') s = s.parent;
		page = s.pages[0];
		for (i = 0, n = items.length; i < n; i++)
			if (items[i].parentPage) { page = items[i].parentPage; break; }
		// Get selection's bounds
		targetBounds = items[0].visibleBounds;
		for (i = 1, n = items.length; i < n; i++) {
			targetBounds[0] = Math.min(items[i].visibleBounds[0], targetBounds[0]);
			targetBounds[1] = Math.min(items[i].visibleBounds[1], targetBounds[1]);
			targetBounds[2] = Math.max(items[i].visibleBounds[2], targetBounds[2]);
			targetBounds[3] = Math.max(items[i].visibleBounds[3], targetBounds[3]);
		}
		// Add selection guides
		addGuide(page.parent, guidesLayer, 'v', targetBounds[1]);
		addGuide(page.parent, guidesLayer, 'v', targetBounds[3]);
		addGuide(page.parent, guidesLayer, 'h', targetBounds[0]);
		addGuide(page.parent, guidesLayer, 'h', targetBounds[2]);
	} else { // Page guides
		// If old guides exist, remove them and exit (undo mode)
		while ((guide = guides.shift()))
			if (/\b(left|right|top|bottom|middle|hw)\b/i.test(guide.label)) { guide.remove(); flgExit = true;}
		if (flgExit) exit();
		// Add page guides
		for (i = 0, n = doc.pages.length; i < n; i++) {
			page = doc.pages[i];
			mgbounds = mgBounds(page);
			pageSize = { width: page.bounds[3] - page.bounds[1], height: page.bounds[2] - page.bounds[0] };
			innerSize = { width: mgbounds[3] - mgbounds[1], height: mgbounds[2] - mgbounds[0] };
			addGuide(page.parent, guidesLayer, 'v', page.bounds[1], 'left');
			addGuide(page.parent, guidesLayer, 'v', page.bounds[3], 'right');
			addGuide(page.parent, guidesLayer, 'h', page.bounds[0], 'top');
			addGuide(page.parent, guidesLayer, 'h', page.bounds[2], 'bottom');
			addGuide(page, guidesLayer, 'v', (mgbounds[1] + innerSize.width / 2), 'middle');
			addGuide(page, guidesLayer, 'h', (mgbounds[0] + innerSize.height * (1 - HW) / 2), 'middle');
			if (hwLayer.isValid)
				addGuide(page, hwLayer, 'h', (mgbounds[2] - innerSize.height * HW), 'HW', UIColors.GRID_GREEN);
			else addGuide(page, guidesLayer, 'h', (mgbounds[2] - innerSize.height * HW), 'HW', UIColors.GRID_GREEN);
		}
	}

	function mgBounds(target) {
		var PSO = PageSideOptions;
		var margins = {
			top:    target.marginPreferences.top,
			left:   target.marginPreferences.left,
			bottom: target.marginPreferences.bottom,
			right:  target.marginPreferences.right
		};
		return [
			target.bounds[0] + margins.top,
			(target.side === PSO.LEFT_HAND) ? target.bounds[1] + margins.right : target.bounds[1] + margins.left,
			page.bounds[2] - margins.bottom,
			(target.side === PSO.LEFT_HAND) ? target.bounds[3] - margins.left : target.bounds[3] - margins.right
		];
	}

	function addGuide(target, layer, HorV, location, label, color) {
		target.guides.add(
			undefined,
			{
				itemLayer:   layer,
				label:       label || '',
				guideColor:  color || UIColors.LIGHT_GRAY,
				orientation: (HorV === 'h') ? HorizontalOrVertical.HORIZONTAL : HorizontalOrVertical.VERTICAL,
				location:    location
			}
		);
	}
}