/*
	HW 1.0.0
	© January 2021, Paul Chiorean
	Labels 'HW' selected objects; w/o selection, adds a 10% bottom guide.
*/

if (!(doc = app.activeDocument)) exit();
var page = app.activeWindow.activePage;

app.doScript(main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "HW");


function main() {
	var hwLayerName = "HW";
	var hwLayer = doc.layers.item(hwLayerName);
	if (!hwLayer.isValid) {
		doc.layers.add({ name: hwLayerName, layerColor: UIColors.LIGHT_GRAY });
		hwLayer.move(LocationOptions.AT_BEGINNING) }
	hwLayer.locked = false;

	var sel = doc.selection;
	if (sel.length >= 1) {
		for (var i = 0; i < sel.length; i++) {
			sel[i].label = "HW";
			if (sel[i].constructor.name == "Rectangle" || sel[i].constructor.name == "TextFrame")
				sel[i].fillColor = "Paper";
		}
	} else {
		var szPg = page.bounds[2] - page.bounds[0];
		var szMg = szPg - (page.marginPreferences.top + page.marginPreferences.bottom);
		var j, guide;
		for (j = (guide = page.guides.everyItem().getElements()).length; j--;
			(guide[j].label == "HW") && guide[j].remove());
		doc.activeLayer = hwLayer;
		if (szMg != szPg) {
			if (!((page.marginPreferences.columnCount == 6 ||
				page.marginPreferences.columnCount == 12) &&
				page.marginPreferences.columnGutter == 0))
				AddMarginHWGuide();
		}
		AddPageHWGuide();
	}

	function AddPageHWGuide() {
		page.guides.add(
			undefined,
			{ itemLayer: hwLayer,
			label: "HW",
			guideColor: UIColors.GREEN,
			orientation: HorizontalOrVertical.horizontal,
			location: page.bounds[0] + szPg * 0.9 }
		);
	}

	function AddMarginHWGuide() {
		page.guides.add(
			undefined,
			{ itemLayer: hwLayer,
			label: "HW",
			guideColor: UIColors.GREEN,
			orientation: HorizontalOrVertical.horizontal,
			location: page.bounds[0] + page.marginPreferences.top + szMg * 0.9 }
		);
	}
}
