/*
	Join documents 24.6.16
	(c) 2020-2024 Paul Chiorean <jpeg@basement.ro>

	Combines the open documents, sorted alphabetically.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

// @includepath '.;./lib;../lib';
// @include 'naturalSorter.jsxinc';

if (app.documents.length < 2) exit();

var target, doc, name, s, ss;
var docs = [];
var names = [];
var old = {
	APS: undefined,
	UIL: app.scriptPreferences.userInteractionLevel
};
app.scriptPreferences.userInteractionLevel = UserInteractionLevels.INTERACT_WITH_ALERTS;

// Get a sorted document list
docs = app.documents.everyItem().getElements();
while ((doc = docs.shift())) try { names.push(doc.fullName); } catch (e) { names.push(doc.name); }
names.sort(naturalSorter);
docs = [];
while ((name = names.shift())) docs.push(app.documents.itemByName(name));

// Disable page shuffle and join spreads
target = docs.shift();
old.APS = target.documentPreferences.allowPageShuffle;
target.documentPreferences.allowPageShuffle = false;
while ((doc = docs.shift())) {
	ss = doc.spreads.everyItem().getElements();
	while ((s = ss.shift())) s.duplicate(LocationOptions.AT_END, target);
	doc.close(SaveOptions.ASK);
}

// Reset page numbering
ss = target.sections.everyItem().getElements();
s = ss.shift();
s.continueNumbering = false;
s.pageNumberStart = 1;
while ((s = ss.shift())) { s.continueNumbering = true; s.remove(); }

// Restore settings
target.documentPreferences.allowPageShuffle = old.APS;
app.scriptPreferences.userInteractionLevel = old.UIL;
