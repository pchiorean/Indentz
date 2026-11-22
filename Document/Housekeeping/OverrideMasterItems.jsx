/*
	Override master items 26.11.22
	(c) 2025-2026 Paul Chiorean <jpeg@basement.ro>

	Overrides master items on all pages.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

// @includepath '.;./lib;../lib;../../lib';
// @include 'overrideMasterItems.jsxinc';

if (!(doc = app.activeDocument)) exit();

app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, 'Override master items');

function main() {
	doc.layers.everyItem().properties = { locked: false };

	var spread;
	var spreads = doc.spreads.everyItem().getElements();

	while ((spread = spreads.shift())) {
		overrideMasterItems(spread);
		spread.appliedMaster = NothingEnum.NOTHING;
	}
}
