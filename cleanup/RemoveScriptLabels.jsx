/*
	Remove script labels 23.10.4
	(c) 2020-2023 Paul Chiorean <jpeg@basement.ro>

	Removes all script labels from all or selected objects.

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
	ScriptLanguage.JAVASCRIPT, undefined, UndoModes.FAST_ENTIRE_SCRIPT, 'Remove script labels');
