/*
	Remove styles 24.6.16
	(c) 2022-2024 Paul Chiorean <jpeg@basement.ro>

	Removes paragraph/character/object styles from all or selected objects.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument)) exit();

app.doScript(
	function () {
		var VERBOSE = ScriptUI.environment.keyboardState.ctrlKey;
		var oldSelection = doc.selection;
		var items = (oldSelection.length === 0) ? doc.allPageItems : oldSelection;
		var counter = { ps: 0, cs: 0, os: 0 };
		var item, menu;

		while ((item = items.pop())) {
			app.select(item);
			if (item.constructor.name === 'TextFrame') {
				if ((menu = app.menuActions.itemByID(8547)).enabled) { menu.invoke(); counter.ps++; }
				if ((menu = app.menuActions.itemByID(8500)).enabled) { menu.invoke(); counter.cs++; }
			}
			if ((menu = app.menuActions.itemByID(113166)).enabled) { menu.invoke(); counter.os++; }
		}

		try { doc.paragraphStyles.itemByRange(2, doc.paragraphStyles.length - 1).remove(); } catch (e) {}
		try { doc.paragraphStyleGroups.everyItem().remove(); } catch (e) {}
		try { doc.characterStyles.itemByRange(2, doc.characterStyles.length - 1).remove(); } catch (e) {}
		try { doc.characterStyleGroups.everyItem().remove(); } catch (e) {}
		try { doc.objectStyles.itemByRange(2, doc.objectStyles.length - 1).remove(); } catch (e) {}
		try { doc.objectStyleGroups.everyItem().remove(); } catch (e) {}

		try { app.select(oldSelection); } catch (e) {}

		if (VERBOSE) {
			alert('Unapplied:\n'
				+ 'Paragraph: ' + counter.ps + ' style' + (counter.ps !== 1 && 's') + '\n'
				+ 'Character: ' + counter.cs + ' style' + (counter.cs !== 1 && 's') + '\n'
				+ 'Object: '    + counter.os + ' style' + (counter.os !== 1 && 's')
			);
		}
	},
	ScriptLanguage.JAVASCRIPT, undefined,
	UndoModes.ENTIRE_SCRIPT, 'Break link to styles'
);
