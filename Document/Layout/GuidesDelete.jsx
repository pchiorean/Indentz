if (!(doc = app.activeDocument)) exit();

app.doScript(
	'doc.guides.everyItem().remove()',
	ScriptLanguage.JAVASCRIPT, undefined,
	UndoModes.ENTIRE_SCRIPT, 'Delete guides'
);
