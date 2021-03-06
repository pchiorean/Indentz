/*
	Align to center v2.6 (2021-04-27)
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

if (!(doc = app.activeDocument)) exit();
app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;
app.scriptPreferences.enableRedraw = false;
var sel = doc.selection, bakSel = sel, obj;
if (sel.length == 0 || (sel[0].constructor.name == "Guide")) {
	alert("Select an object and try again."); exit() }
if (sel.length == 1 && sel[0].locked) { alert("This object is locked."); exit() }

app.doScript(main, ScriptLanguage.javascript, sel,
	UndoModes.ENTIRE_SCRIPT, "Align to center");


function main(sel) {
	var setADB = app.alignDistributePreferences.alignDistributeBounds;
	// If we have a key object, align all to it and exit
	if (doc.selectionKeyObject != undefined) {
		setADB = AlignDistributeBounds.KEY_OBJECT;
		Align(sel, doc.selectionKeyObject);
		return;
	}
	// Remember layers for grouping/ungrouping
	var oldURL = app.generalPreferences.ungroupRemembersLayers;
	var oldPRL = app.clipboardPreferences.pasteRemembersLayers;
	app.generalPreferences.ungroupRemembersLayers = true;
	app.clipboardPreferences.pasteRemembersLayers = true;
	// Filter selection and get a single object
	if (sel.length > 1) {
		var objects = [];
		for (var i = 0; i < sel.length; i++) {
			if (sel[i].locked) continue;
			objects.push(sel[i]);
		}
		obj = doc.groups.add(objects);
		obj.name = "<align group>";
	} else obj = sel[0];
	// Align, ungroup and restore initial selection (sans key object)
	if (setADB == AlignDistributeBounds.ITEM_BOUNDS)
		setADB = AlignDistributeBounds.PAGE_BOUNDS;
	Align(obj);
	if (obj.name == "<align group>") obj.ungroup();
	app.select(bakSel);
	// Restore layer grouping settings
	app.generalPreferences.ungroupRemembersLayers = oldURL;
	app.clipboardPreferences.pasteRemembersLayers = oldPRL;

	function Align(obj, selKO) {
		switch (SelectOption()) {
			case 0:
				doc.align(obj, AlignOptions.HORIZONTAL_CENTERS, setADB, selKO);
				break;
			case 1:
				doc.align(obj, AlignOptions.VERTICAL_CENTERS, setADB, selKO);
				break;
			case 2: // Ignore 10% of bottom
				doc.align(obj, AlignOptions.VERTICAL_CENTERS, setADB, selKO);
				var page = app.activeWindow.activePage;
				switch (setADB) {
					case AlignDistributeBounds.PAGE_BOUNDS:
					case AlignDistributeBounds.SPREAD_BOUNDS:
						obj.move(undefined,
							[ 0, -(page.bounds[2] - page.bounds[0]) * 0.1 / 2 ]);
						break;
					case AlignDistributeBounds.MARGIN_BOUNDS:
						obj.move(undefined,
							[ 0, -((page.bounds[2] - page.bounds[0]) -
							(page.marginPreferences.top + page.marginPreferences.bottom)) * 0.1 / 2 ]);
						break;
				}
				break;
			case 3:
				doc.align(obj, AlignOptions.HORIZONTAL_CENTERS, setADB, selKO);
				doc.align(obj, AlignOptions.VERTICAL_CENTERS, setADB, selKO);
				break;
		}
	}

	function SelectOption() {
		var title = (function(adb) { return {
			'ITEM_BOUNDS': 'page',
			'KEY_OBJECT': 'key object',
			'MARGIN_BOUNDS': 'page margins',
			'PAGE_BOUNDS': 'page',
			'SPREAD_BOUNDS': 'spread' }[adb]
		})(setADB);
		var w = new Window("dialog", "Center to " + title);
		w.orientation = "row";
		w.alignChildren = [ "center", "top" ];
		w.main = w.add("panel");
		w.main.spacing = 5;
		w.main.orientation = "column";
		w.main.alignChildren = [ "left", "top" ];
		w.main.add("radiobutton { text: 'Horizontal' }");
		w.main.add("radiobutton { text: 'Vertical' }");
		w.main.add("radiobutton { text: 'Vertical (HW)' }")
			.enabled = !(setADB == AlignDistributeBounds.KEY_OBJECT);
		w.main.add("radiobutton { text: 'Both' }");
		w.main.children[0].active = w.main.children[0].value = true;
		w.actions = w.add("group", undefined, { name: "actions" });
		w.actions.orientation = "column";
		w.actions.alignChildren = [ "fill", "top" ];
		w.actions.add("button { text: 'Ok', name: 'ok' }");
		w.actions.add("button { text: 'Cancel', name: 'cancel' }");
		if (w.show() == 2) return;
		for (var i = 0; i < w.main.children.length; i++)
			if (w.main.children[i].value == true) return i;
	}
}
