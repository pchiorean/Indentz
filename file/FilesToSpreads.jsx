/*
	FilesToSpreads v1.0.0
	© February 2021, Paul Chiorean
	Combines the open documents, sorted alphabetically.
*/

if (app.documents.length < 2) exit();
var set_UIL = app.scriptPreferences.userInteractionLevel;
app.scriptPreferences.userInteractionLevel = UserInteractionLevels.INTERACT_WITH_ALERTS;

var doc, docs = app.documents.everyItem().getElements(), names = [];
while (doc = docs.shift()) names.push(doc.name); names.sort();
var name, docs = []; while (name = names.shift()) docs.push(app.documents.itemByName(name));

var doc, target = docs.shift();
var set_APS = target.documentPreferences.allowPageShuffle;
target.documentPreferences.allowPageShuffle = false;
while (doc = docs.shift()) {
	var spread, spreads = doc.spreads.everyItem().getElements();
	while (spread = spreads.shift()) spread.duplicate(LocationOptions.AT_END, target);
	doc.close(SaveOptions.ASK);
}
target.documentPreferences.allowPageShuffle = set_APS;
app.scriptPreferences.userInteractionLevel = set_UIL;
