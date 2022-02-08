/*
	Files to spreads 21.9.12
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Combines the open documents, sorted alphabetically.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (app.documents.length < 2) exit();

var doc, name, spread, spreads, oldAPS;
var docs = [];
var names = [];
var oldUIL = app.scriptPreferences.userInteractionLevel;
app.scriptPreferences.userInteractionLevel = UserInteractionLevels.INTERACT_WITH_ALERTS;

// Get a sorted document list
docs = app.documents.everyItem().getElements();
while ((doc = docs.shift())) {
	try { names.push(doc.fullName); } catch (e) {
		names.push(doc.name);
	}
}
names.sort();
docs = [];
while ((name = names.shift())) docs.push(app.documents.itemByName(name));

// Disable page shuffle and join spreads
target = docs.shift();
oldAPS = target.documentPreferences.allowPageShuffle;
target.documentPreferences.allowPageShuffle = false;
while ((doc = docs.shift())) {
	spreads = doc.spreads.everyItem().getElements();
	while ((spread = spreads.shift())) spread.duplicate(LocationOptions.AT_END, target);
	doc.close(SaveOptions.ASK);
}

// Restore settings
target.documentPreferences.allowPageShuffle = oldAPS;
app.scriptPreferences.userInteractionLevel = oldUIL;
