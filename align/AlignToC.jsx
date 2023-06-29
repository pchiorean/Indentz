/*
	Align to center 23.6.29
	(c) 2020-2023 Paul Chiorean <jpeg@basement.ro>

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

			var ui = new Window('dialog', 'Center to ' + title);
			ui.orientation = 'row';
			ui.alignChildren = [ 'center', 'top' ];
			ui.main = ui.add('panel');
			ui.main.spacing = 5;
			ui.main.orientation = 'column';
			ui.main.alignChildren = [ 'left', 'top' ];
				ui.main.add('radiobutton { text: "Horizontal" }');
				ui.main.add('radiobutton { text: "Vertical" }');
				ui.main.add('radiobutton { text: "Vertical w/o 10%", helpTip: "Ignore the bottom 10%" }')
					.enabled = (ADP !== AlignDistributeBounds.KEY_OBJECT);
				ui.main.add('radiobutton { text: "Both" }');
				ui.main.children[0].active = ui.main.children[0].value = true;
			ui.actions = ui.add('group', undefined, { name: 'actions' });
			ui.actions.orientation = 'column';
			ui.actions.alignChildren = [ 'fill', 'top' ];
				ui.actions.add('button { text: "Ok" }');
				ui.actions.add('button { text: "Cancel" }');

			ui.onShow = function () {
				ui.frameLocation = [
					(app.activeWindow.bounds[1] + app.activeWindow.bounds[3] - ui.frameSize.width) / 2,
					(app.activeWindow.bounds[0] + app.activeWindow.bounds[2] - ui.frameSize.height) / 2
				];
			};
			ui.onClose = function () {
			for (var i = 0, n = ui.main.children.length; i < n; i++)
				if (ui.main.children[i].value === true) option = i;
			};

			if (ui.show() === 2) return -1;
			return option;
		}
	}
}
