/*
	Align to right v2.4.2 (2020-11-22)
	(c) 2020 Paul Chiorean (jpeg@basement.ro)

	Aligns the selected objects to the right of the 'Align To' setting.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument)) exit();
app.scriptPreferences.enableRedraw = false;
var sel = doc.selection, bakSel = sel, obj;
if (sel.length == 0 || (sel[0].constructor.name == "Guide")) {
	alert("Select an object and try again."); exit() }
if (sel.length == 1 && sel[0].locked) { alert("This object is locked."); exit() }

app.doScript(main, ScriptLanguage.javascript, sel,
	UndoModes.ENTIRE_SCRIPT, "Align to right");


function main(sel) {
	var setADB = app.alignDistributePreferences.alignDistributeBounds;
	// If we have a key object, align all to that and exit
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
		doc.align(obj, AlignOptions.RIGHT_EDGES, setADB, selKO);
	}
}
