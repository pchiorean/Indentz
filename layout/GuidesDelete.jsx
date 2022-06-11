/*
	Delete guides 21.10.9
	(c) 2021 Paul Chiorean (jpeg@basement.ro)

	Deletes all guides from the document.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument)) exit();

app.doScript(
	'doc.guides.everyItem().remove()',
	ScriptLanguage.JAVASCRIPT, undefined,
	UndoModes.ENTIRE_SCRIPT, 'Delete guides'
);
