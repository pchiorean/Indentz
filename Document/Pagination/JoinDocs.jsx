/*
	Join documents 25.7.12
	(c) 2020-2025 Paul Chiorean <jpeg@basement.ro>

	Combines all open documents, sorted alphabetically.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

// @includepath '.;./lib;../lib;../../lib';
// @include 'naturalSorter.jsxinc';
// @include 'overrideMasterItems.jsxinc';

if (app.documents.length < 2) exit();

app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, 'Join documents');

function main() {
	var target, doc, docName, spread;
	var docs = [];
	var docNames = [];
	var spreads = [];
	var old = {
		APS: undefined,
		MU: app.scriptPreferences.measurementUnit,
		UIL: app.scriptPreferences.userInteractionLevel
	};
	app.scriptPreferences.userInteractionLevel = UserInteractionLevels.INTERACT_WITH_ALERTS;

	// Get a sorted document list
	docs = app.documents.everyItem().getElements();
	while ((doc = docs.shift())) try { docNames.push(doc.fullName); } catch (e) { docNames.push(doc.name); }
	docNames.sort(naturalSorter);
	docs = [];
	while ((docName = docNames.shift())) docs.push(app.documents.itemByName(docName));

	// Prepare the first document as target
	target = docs.shift();
	target.layers.everyItem().properties = { locked: false };
	old.APS = target.documentPreferences.allowPageShuffle;
	target.documentPreferences.allowPageShuffle = false;
	spreads = target.spreads.everyItem().getElements();
	while ((spread = spreads.shift())) overrideMasterItems(spread);

	// Collect spreads from other documents
	while ((doc = docs.shift())) {
		doc.layers.everyItem().properties = { locked: false };
		spreads = doc.spreads.everyItem().getElements();
		while ((spread = spreads.shift())) {
			overrideMasterItems(spread);
			spread.duplicate(LocationOptions.AT_END, target);
		}
		doc.close(SaveOptions.ASK);
	}

	// Reset page numbering
	spreads = target.sections.everyItem().getElements();
	spread = spreads.shift();
	spread.continueNumbering = false;
	spread.pageNumberStart = 1;
	while ((spread = spreads.shift())) { spread.continueNumbering = true; spread.remove(); }

	// Restore settings
	target.documentPreferences.allowPageShuffle = old.APS;
	app.scriptPreferences.measurementUnit = old.MU;
	app.scriptPreferences.userInteractionLevel = old.UIL;
}
