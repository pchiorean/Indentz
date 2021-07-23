/*
	FilesToSpreads v1.0.1 (2021-07-23)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Combines the open documents, sorted alphabetically.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (app.documents.length < 2) exit();
var oldUIL = app.scriptPreferences.userInteractionLevel;
app.scriptPreferences.userInteractionLevel = UserInteractionLevels.INTERACT_WITH_ALERTS;

// -- Get a sorted document list
var name, names = [], doc, docs = [];
docs = app.documents.everyItem().getElements();
while (doc = docs.shift()) try { names.push(doc.fullName) } catch (e) { names.push(doc.name) }; names.sort();
docs = []; while (name = names.shift()) docs.push(app.documents.itemByName(name));

var doc, target = docs.shift();
var oldAPS = target.documentPreferences.allowPageShuffle;
target.documentPreferences.allowPageShuffle = false;
while (doc = docs.shift()) {
	var spread, spreads = doc.spreads.everyItem().getElements();
	while (spread = spreads.shift()) spread.duplicate(LocationOptions.AT_END, target);
	doc.close(SaveOptions.ASK);
}
target.documentPreferences.allowPageShuffle = oldAPS;
app.scriptPreferences.userInteractionLevel = oldUIL;
