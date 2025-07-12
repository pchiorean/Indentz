/*
	Override master items 25.7.12
	(c) 2025 Paul Chiorean <jpeg@basement.ro>

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
	for (var i = 0; i < doc.spreads.length; i++) overrideMasterItems(doc.spreads[i]);
}
