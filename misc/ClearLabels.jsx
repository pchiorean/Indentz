/*
	Cleanup labels v1.2.1 (2020-11-22)
	(c) 2020 Paul Chiorean (jpeg@basement.ro)

	Removes all labels from the document.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument)) exit();

app.doScript(main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "Cleanup labels");


function main() {
	var item, items = doc.selection.length == 0 ? doc.allPageItems : doc.selection;
	while (item = items.shift()) item.label = "";
}
