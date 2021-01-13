/*
	Align to center v2.5.2
	© January 2021, Paul Chiorean
	Aligns the selected objects to the center of the 'Align To' setting.
*/

if (!(doc = app.activeDocument)) exit();
app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;
app.scriptPreferences.enableRedraw = false;
var sel = doc.selection, selBAK = sel, obj;
if (sel.length == 0 || (sel[0].constructor.name == "Guide")) {
	alert("Select an object and try again."); exit() }
if (sel.length == 1 && sel[0].locked) { alert("This object is locked."); exit() }

app.doScript(main, ScriptLanguage.javascript, sel,
	UndoModes.ENTIRE_SCRIPT, "Align to center");


function main(sel) {
	var set_ADB = app.alignDistributePreferences.alignDistributeBounds;
	// If we have a key object, align all to that and exit
	if (doc.selectionKeyObject != undefined) {
		set_ADB = AlignDistributeBounds.KEY_OBJECT;
		Align(sel, doc.selectionKeyObject);
		return;
	}
	// Remember layers for grouping/ungrouping
	var set_URL = app.generalPreferences.ungroupRemembersLayers;
	var set_PRL = app.clipboardPreferences.pasteRemembersLayers;
	app.generalPreferences.ungroupRemembersLayers = true;
	app.clipboardPreferences.pasteRemembersLayers = true;
	// Filter selection and get a single object
	if (sel.length > 1) {
		var objArray = [];
		for (var i = 0; i < sel.length; i++) {
			if (sel[i].locked) continue;
			objArray.push(sel[i]);
		}
		obj = doc.groups.add(objArray);
		obj.name = "<align group>";
	} else obj = sel[0];
	// Align, ungroup and restore initial selection (sans key object)
	if (set_ADB == AlignDistributeBounds.ITEM_BOUNDS)
		set_ADB = AlignDistributeBounds.PAGE_BOUNDS;
	Align(obj);
	if (obj.name == "<align group>") obj.ungroup();
	app.select(selBAK);
	// Restore layer grouping settings
	app.generalPreferences.ungroupRemembersLayers = set_URL;
	app.clipboardPreferences.pasteRemembersLayers = set_PRL;

	function Align(obj, selKO) {
		switch (SelectOption()) {
			case 0:
				doc.align(obj, AlignOptions.HORIZONTAL_CENTERS, set_ADB, selKO);
				break;
			case 1:
				doc.align(obj, AlignOptions.VERTICAL_CENTERS, set_ADB, selKO);
				break;
			case 2: // Ignore 10% of bottom
				doc.align(obj, AlignOptions.VERTICAL_CENTERS, set_ADB, selKO);
				var page = app.activeWindow.activePage;
				switch (set_ADB) {
					case AlignDistributeBounds.PAGE_BOUNDS:
					case AlignDistributeBounds.SPREAD_BOUNDS:
						obj.move(undefined,
							[0, -(page.bounds[2] - page.bounds[0]) * 0.1 / 2]);
						break;
					case AlignDistributeBounds.MARGIN_BOUNDS:
						obj.move(undefined,
							[0, -((page.bounds[2] - page.bounds[0]) -
							(page.marginPreferences.top + page.marginPreferences.bottom)) * 0.1 / 2]);
						break;
				}
				break;
			case 3:
				doc.align(obj, AlignOptions.HORIZONTAL_CENTERS, set_ADB, selKO);
				doc.align(obj, AlignOptions.VERTICAL_CENTERS, set_ADB, selKO);
				break;
		}
	}

	function SelectOption() {
		var w = new Window("dialog", "Select alignment");
			w.orientation = "row";
			w.alignChildren = ["center","top"];
		var center = w.add("panel {text: 'Center'}");
			center.spacing = 5;
			center.margins = [10,15,10,12];
			center.orientation = "column";
			center.alignChildren = ["left","top"];
			center.add("radiobutton {text: 'Horizontal'}");
			center.add("radiobutton {text: 'Vertical'}");
			center.add("radiobutton {text: 'Vertical (HW)'}")
				.enabled = !(set_ADB == AlignDistributeBounds.KEY_OBJECT);
			center.add("radiobutton {text: 'Both'}");
			center.children[0].active = center.children[0].value = true;
		var okcancel = w.add("group", undefined, {name: "okcancel"});
			okcancel.orientation = "column";
			okcancel.alignChildren = ["fill","top"];
			okcancel.add("button {text: 'Ok', name: 'ok'}");
			okcancel.add("button {text: 'Cancel', name: 'cancel'}");
		if (w.show() == 2) return;
		for (i = 0; i < center.children.length; i++)
			if (center.children[i].value == true) return i;
	}
}
