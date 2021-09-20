/*
	Adjust items v0.1.1 (2021-09-12)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

// @include '../lib/FitTo.jsxinc';

if (!(doc = app.activeDocument)) exit();

app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined,
	UndoModes.ENTIRE_SCRIPT, 'Adjust items');

function main() {
	var item;
	var items = (doc.selection.length === 0) ?
		doc.pageItems.everyItem().getElements() : doc.selection;

	while ((item = items.shift())) {
		app.select(item);

		if (/\balign[TB]?L\b/ig.test(item.label))
			doc.align(item, AlignOptions.LEFT_EDGES,   AlignDistributeBounds.MARGIN_BOUNDS);
		if (/\balign[TB]?R\b/ig.test(item.label))
			doc.align(item, AlignOptions.RIGHT_EDGES,  AlignDistributeBounds.MARGIN_BOUNDS);
		if (/\balignT[LR]?\b/ig.test(item.label))
			doc.align(item, AlignOptions.TOP_EDGES,    AlignDistributeBounds.MARGIN_BOUNDS);
		if (/\balignB[LR]?\b/ig.test(item.label))
			doc.align(item, AlignOptions.BOTTOM_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);

		if (/\bhw\b/ig.test(item.label)) {
			app.doScript(fitTo, ScriptLanguage.JAVASCRIPT,
				[ 'spread', 'bleed' ],
				UndoModes.ENTIRE_SCRIPT, 'Fit HW to spread bleed');
			continue;
		}

		if (/\bfitV\b/ig.test(item.label)) {
			item.fit(FitOptions.FRAME_TO_CONTENT);
			app.doScript(fitTo, ScriptLanguage.JAVASCRIPT,
				[ 'page', 'size' ],
				UndoModes.ENTIRE_SCRIPT, 'Fit to page');
		}
		if (/\bfitB\b/ig.test(item.label)) {
			app.doScript(fitTo, ScriptLanguage.JAVASCRIPT,
				[ 'spread', 'bleed' ],
				UndoModes.ENTIRE_SCRIPT, 'Fit to spread bleed');
		}
	}

	app.select(null);
}
