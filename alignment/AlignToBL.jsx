/*
	Align to bottom-left v2.4.3 (2021-03-29)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Aligns the selected objects to the bottom-left of the 'Align To' setting.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument)) exit();
app.scriptPreferences.enableRedraw = false;
var sel = doc.selection, bakSel = sel, obj;
if (sel.length == 0 || (sel[0].constructor.name == "Guide")) {
	alert("Select an object and try again."); exit() }
if (sel[0].hasOwnProperty("parentTextFrames")) { sel[0].insertionPoints[0].contents = "1"; exit() }
if (sel.length == 1 && sel[0].locked) { alert("This object is locked."); exit() }

app.doScript(main, ScriptLanguage.javascript, sel,
	UndoModes.ENTIRE_SCRIPT, "Align to bottom-left");


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
		doc.align(obj, AlignOptions.BOTTOM_EDGES, setADB, selKO);
		doc.align(obj, AlignOptions.LEFT_EDGES, setADB, selKO);
	}
}
