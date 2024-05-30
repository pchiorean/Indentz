/*
	Add page guides 24.5.30
	(c) 2021-2024 Paul Chiorean <jpeg@basement.ro>

	Adds guides on pages' edges and inner centers or selected objects' edges.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument)) exit();

// @includepath '.;./lib;../lib';
// @include 'addGuide.jsxinc';

app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, 'Add page guides');

function main() {
	var guidesLayer, page, guide, margins, s, i, n;
	var guides = doc.guides.everyItem().getElements();
	var items = doc.selection;
	var targetBounds = [];
	var flgExit = false;
	var guidesLayerName = '.guides';
	var ADV = ScriptUI.environment.keyboardState.altKey;
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

		// Add guides
		addGuide((ADV ? page.parent : page), guidesLayer, 'h', targetBounds[0]);
		addGuide((ADV ? page.parent : page), guidesLayer, 'v', targetBounds[1]);
		addGuide((ADV ? page.parent : page), guidesLayer, 'h', targetBounds[2]);
		addGuide((ADV ? page.parent : page), guidesLayer, 'v', targetBounds[3]);
	} else { // Page guides
		// If old guides exist, remove them and exit (undo mode)
		while ((guide = guides.shift()))
			if (/\b(left|right|top|bottom|middle|hw)\b/i.test(guide.label)) { guide.remove(); flgExit = true; }
		if (flgExit) exit();

		// Add guides
		for (i = 0; i < doc.pages.length; i++) {
			page = doc.pages[i];
			margins = mgBounds(page);
			pageSize = { width: page.bounds[3] - page.bounds[1], height: page.bounds[2] - page.bounds[0] };
			innerSize = { width: margins[3] - margins[1], height: margins[2] - margins[0] };
			addGuide((ADV ? page.parent : page), guidesLayer, 'h', page.bounds[0], 'top', 'g');
			addGuide((ADV ? page.parent : page), guidesLayer, 'v', page.bounds[1], 'left', 'g');
			addGuide((ADV ? page.parent : page), guidesLayer, 'h', page.bounds[2], 'bottom', 'g');
			addGuide((ADV ? page.parent : page), guidesLayer, 'v', page.bounds[3], 'right', 'g');
			addGuide((ADV ? page.parent : page), guidesLayer, 'v', margins[1] + innerSize.width / 2, 'middle', 'x');
			addGuide((ADV ? page.parent : page), guidesLayer, 'h', margins[0] + innerSize.height * (1 - HW) / 2, 'middle', 'x');
			addGuide((ADV ? page.parent : page), guidesLayer, 'h', (margins[2] - innerSize.height * HW), 'HW', 's');
		}
	}

	function mgBounds(target) {
		var PSO = PageSideOptions;
		var mg = {
			top:    target.marginPreferences.top,
			left:   target.marginPreferences.left,
			bottom: target.marginPreferences.bottom,
			right:  target.marginPreferences.right
		};
		return [
			target.bounds[0] + mg.top,
			(target.side === PSO.LEFT_HAND) ? target.bounds[1] + mg.right : target.bounds[1] + mg.left,
			page.bounds[2] - mg.bottom,
			(target.side === PSO.LEFT_HAND) ? target.bounds[3] - mg.left : target.bounds[3] - mg.right
		];
	}
}
