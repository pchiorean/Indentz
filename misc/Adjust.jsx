// @include "FitTo.jsxinc";

function ExpandItems(items) {
	while (item = items.shift()) {
		item.redefineScaling();
		switch (item.label) {
			case "fit":
				app.select(item);
				item.fit(FitOptions.FRAME_TO_CONTENT);
				app.doScript(FitTo, ScriptLanguage.javascript, [ "page", "size" ],
				UndoModes.ENTIRE_SCRIPT, "Resize to page");
				break;
			case "bleed":
				app.select(item);
				app.doScript(FitTo, ScriptLanguage.javascript, [ "spread", "bleed", true ],
				UndoModes.ENTIRE_SCRIPT, "Resize to spread bleed");
				break;
		}
	}
	app.select(null);
}
