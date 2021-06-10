/*
	Delete guides v1.0 (2021-06-08)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Deletes all guides from the document.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument)) exit();

app.doScript(
function() {
	var g = doc.guides.everyItem().getElements();
	for (var i = 0; i < g.length; i++) g[i].remove();
},
ScriptLanguage.javascript, undefined,
UndoModes.ENTIRE_SCRIPT, "Delete guides");
