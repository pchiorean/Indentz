/*
	Adjust layout 22.5.22
	(c) 2021-2022 Paul Chiorean (jpeg@basement.ro)

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

// @include '../lib/fitTo.jsxinc';

if (!(doc = app.activeDocument)) exit();

app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined,
	UndoModes.ENTIRE_SCRIPT, 'Adjust layout');

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
			app.doScript("fitTo(item, 'spread', 'bleed')",
				ScriptLanguage.JAVASCRIPT, undefined,
				UndoModes.ENTIRE_SCRIPT, 'Fit HW to spread bleed');
			continue;
		}

		if (/\bfitV\b/ig.test(item.label)) {
			item.fit(FitOptions.FRAME_TO_CONTENT);
			app.doScript("fitTo(item, 'spread', 'visible')",
				ScriptLanguage.JAVASCRIPT, undefined,
				UndoModes.ENTIRE_SCRIPT, 'Fit to spread visible area');
			continue;
		}
		if (/\bfitB\b/ig.test(item.label)) {
			app.doScript("fitTo(item, 'spread', 'bleed')",
				ScriptLanguage.JAVASCRIPT, undefined,
				UndoModes.ENTIRE_SCRIPT, 'Fit to spread bleed');
		}
	}

	app.select(null);
}
