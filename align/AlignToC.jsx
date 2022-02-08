/*
	Align to center 21.9.12
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Aligns the selected objects to the center of the 'Align To' setting.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/

if (!(doc = app.activeDocument) || doc.selection.length === 0) exit();

app.doScript(main, ScriptLanguage.JAVASCRIPT, doc.selection,
	UndoModes.ENTIRE_SCRIPT, 'Align to center');

function main(selection) {
	var item, page;
	var items = [];
	var old = {
		selection: doc.selection,
		ungroupRemembersLayers: app.generalPreferences.ungroupRemembersLayers,
		pasteRemembersLayers: app.clipboardPreferences.pasteRemembersLayers
	};
	var ADP = app.alignDistributePreferences.alignDistributeBounds;
	// If we have a key object, align to it and exit
	if (doc.selectionKeyObject) { align(selection); return; }
	// Group multiple items
	app.generalPreferences.ungroupRemembersLayers = true;
	app.clipboardPreferences.pasteRemembersLayers = true;
	if (selection.length > 1) {
		for (var i = 0, n = selection.length; i < n; i++) if (!selection[i].locked) items.push(selection[i]);
		item = doc.groups.add(items, { name: '<align group>' });
	} else {
		item = selection[0];
	}
	// Align, ungroup and restore initial selection (sans key object)
	if (ADP === AlignDistributeBounds.ITEM_BOUNDS) ADP = AlignDistributeBounds.PAGE_BOUNDS;
	align(item);
	if (item.name === '<align group>') item.ungroup();
	app.select(old.selection);
	// Restore layer grouping settings
	app.generalPreferences.ungroupRemembersLayers = old.ungroupRemembersLayers;
	app.clipboardPreferences.pasteRemembersLayers = old.pasteRemembersLayers;


	function align(objects) {
		switch (selectOption()) {
			case 0:
				doc.align(objects, AlignOptions.HORIZONTAL_CENTERS, ADP, doc.selectionKeyObject);
				break;
			case 1:
				doc.align(objects, AlignOptions.VERTICAL_CENTERS, ADP, doc.selectionKeyObject);
				break;
			case 2: // Ignore 10% of bottom
				doc.align(objects, AlignOptions.VERTICAL_CENTERS, ADP, doc.selectionKeyObject);
				page = app.activeWindow.activePage;
				switch (ADP) {
					case AlignDistributeBounds.PAGE_BOUNDS:
					case AlignDistributeBounds.SPREAD_BOUNDS:
						objects.move(undefined,
							[ 0, -(page.bounds[2] - page.bounds[0]) * 0.1 / 2 ]);
						break;
					case AlignDistributeBounds.MARGIN_BOUNDS:
						objects.move(undefined,
							[ 0, -((page.bounds[2] - page.bounds[0]) -
							(page.marginPreferences.top + page.marginPreferences.bottom)) * 0.1 / 2 ]);
						break;
				}
				break;
			case 3:
				doc.align(objects, AlignOptions.HORIZONTAL_CENTERS, ADP, doc.selectionKeyObject);
				doc.align(objects, AlignOptions.VERTICAL_CENTERS,   ADP, doc.selectionKeyObject);
				break;
		}

		function selectOption() {
			var option;
			var title = (function (str) {
				return {
					ITEM_BOUNDS:   'page',
					KEY_OBJECT:    'key object',
					MARGIN_BOUNDS: 'page margins',
					PAGE_BOUNDS:   'page',
					SPREAD_BOUNDS: 'spread'
				}[str];
			}(ADP));
			var w = new Window('dialog', 'Center to ' + title);
			w.orientation = 'row';
			w.alignChildren = [ 'center', 'top' ];
			w.main = w.add('panel');
			w.main.spacing = 5;
			w.main.orientation = 'column';
			w.main.alignChildren = [ 'left', 'top' ];
				w.main.add('radiobutton { text: "Horizontal" }');
				w.main.add('radiobutton { text: "Vertical" }');
				w.main.add('radiobutton { text: "Vertical (HW)" }')
					.enabled = (ADP !== AlignDistributeBounds.KEY_OBJECT);
				w.main.add('radiobutton { text: "Both" }');
				w.main.children[0].active = w.main.children[0].value = true;
			w.actions = w.add('group', undefined, { name: 'actions' });
			w.actions.orientation = 'column';
			w.actions.alignChildren = [ 'fill', 'top' ];
				w.actions.add('button { text: "Ok", name: "ok" }');
				w.actions.add('button { text: "Cancel", name: "cancel" }');
			w.onClose = function () {
				for (var i = 0, n = w.main.children.length; i < n; i++)
					if (w.main.children[i].value === true) option = i;
				};
			if (w.show() === 2) return -1;
			return option;
		}
	}
}
