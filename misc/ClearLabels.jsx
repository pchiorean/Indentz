/*
	Cleanup labels v1.2.2 (2021-09-12)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Removes all labels from the document.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument)) exit();

app.doScript(
	function () {
		var item;
		var items = (doc.selection.length === 0) ? doc.allPageItems : doc.selection;
		while ((item = items.shift())) item.label = '';
	},
	ScriptLanguage.JAVASCRIPT, undefined,
	UndoModes.ENTIRE_SCRIPT, 'Cleanup labels');
