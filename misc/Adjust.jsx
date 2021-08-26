/*
	Adjust items v0.1 (2021-08-19)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

// @include "../lib/FitTo.jsxinc";

if (!(doc = app.activeDocument)) exit();

app.doScript(main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "Adjust items");

function main() {
	var item, items = doc.selection.length == 0 ? doc.allPageItems : doc.selection;

	while (item = items.shift()) {
		// item.redefineScaling();
		app.select(item);

		if (/\balign[TB]?L\b/ig.test(item.label)) {
			doc.align(item, AlignOptions.LEFT_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
		};
		if (/\balign[TB]?R\b/ig.test(item.label)) {
			doc.align(item, AlignOptions.RIGHT_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
		};
		if (/\balignT[LR]?\b/ig.test(item.label)) {
			doc.align(item, AlignOptions.TOP_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
		};
		if (/\balignB[LR]?\b/ig.test(item.label)) {
			doc.align(item, AlignOptions.BOTTOM_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
		};

		if (/\bfitV\b/ig.test(item.label)) {
			item.fit(FitOptions.FRAME_TO_CONTENT);
			app.doScript(FitTo, ScriptLanguage.JAVASCRIPT, [ "page", "size" ],
			UndoModes.ENTIRE_SCRIPT, "Fit to page");
		};
		if (/\bfitB\b/ig.test(item.label)) {
			app.doScript(FitTo, ScriptLanguage.JAVASCRIPT, [ "spread", "bleed", true ],
			UndoModes.ENTIRE_SCRIPT, "Fit to spread bleed");
		};
	};
	app.select(null);
};
