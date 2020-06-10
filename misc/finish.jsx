if (app.documents.length == 0) exit();
var doc = app.activeDocument;
var page = app.activeWindow.activePage;

// ExpandItems();

TextRegColor();

Relink("LS_RING_RED_770_CHF 3D.ai", "Price Tag/LS_RING_RED_790_CHF 3D.ai");
Relink("LS_RING_AMBER_770_CHF 3D.ai", "Price Tag/LS_RING_AMBER_790_CHF 3D.ai");
Relink("6150241_LS BC_FU_MAR_APR _2020_Original Image_982x737mm_v2_CMYK.tif",
	"6150241_LS BC_FU_MAR_APR_2020_Original Image_982x737mm_v2_CMYK.tif");
Relink("6150241_LS BC_FU_MAR_APR _2020_Sky&Amber Image_982x737mm_v4_CMYK.tif",
	"6150241_LS BC_FU_MAR_APR_2020_Sky&Amber Image_982x737mm_v4_CMYK.tif");

var i, swa; for (i = (swa = doc.unusedSwatches).length; i--;
	(swa[i].name != "" && swa[i].name != "C=60 M=40 Y=40 K=100") && swa[i].remove());
try { doc.swatches.itemByName("SPOT LIGHT BLUE").remove() } catch (_) {};
// try { doc.swatches.itemByName("Safe area").colorValue = [100, 0, 0, 0] } catch (_) {};

try { doc.layers.itemByName("visible area").name = "safe area" } catch (_) {};
try { doc.layers.itemByName("die cut").name = "dielines" } catch (_) {};
try { doc.layers.itemByName("diecut").name = "dielines" } catch (_) {};
try { doc.layers.itemByName("id").visible = true } catch (_) {};
try { doc.layers.itemByName("guides").visible = false } catch (_) {};
try { doc.layers.itemByName("safe area").visible = true } catch (_) {};
try { doc.layers.itemByName("HW").properties = { visible: true, locked: true } } catch (_) {};
try { doc.layers.itemByName("bg").properties = { visible: true, locked: true } } catch (_) {};


// function ExpandItems() {
// 	var bleed = bleedBounds(page);
// 	var item, items = doc.allPageItems;
// 	while (item = items.shift()) {
// 		item.redefineScaling();
// 		switch (item.label) {
// 			case "bleed":
// 			case "bg":
// 				item.geometricBounds = bleed; break;
// 			case "expand":
// 			case "aw":
// 				item.fit(FitOptions.FRAME_TO_CONTENT);
// 				item.geometricBounds = [
// 					Math.max(item.visibleBounds[0], bleed[0]),
// 					Math.max(item.visibleBounds[1], bleed[1]),
// 					Math.min(item.visibleBounds[2], bleed[2]),
// 					Math.min(item.visibleBounds[3], bleed[3])
// 				];
// 				break;
// 		}
// 	}
// }

// function BleedBounds(page) {
// 	var bleed = {
// 		top: doc.documentPreferences.properties.documentBleedTopOffset,
// 		left: doc.documentPreferences.properties.documentBleedInsideOrLeftOffset,
// 		bottom: doc.documentPreferences.properties.documentBleedBottomOffset,
// 		right: doc.documentPreferences.properties.documentBleedOutsideOrRightOffset
// 	}
// 	if (page.side == PageSideOptions.LEFT_HAND) {
// 		bleed.left = doc.documentPreferences.properties.documentBleedOutsideOrRightOffset;
// 		bleed.right = doc.documentPreferences.properties.documentBleedInsideOrLeftOffset;
// 	}
// 	var m_x1 = page.bounds[1] - bleed.left;
// 	var m_y1 = page.bounds[0] - bleed.top;
// 	var m_x2 = page.bounds[3] + bleed.right;
// 	var m_y2 = page.bounds[2] + bleed.bottom;
// 	return [m_y1, m_x1, m_y2, m_x2];
// }

function TextRegColor(){
	try { doc.colors.add({
		name: "Reg. black",
		model: ColorModel.PROCESS,
		space: ColorSpace.CMYK,
		colorValue: [100, 100, 100, 100] });
	} catch (_) {};
	app.findTextPreferences = app.changeTextPreferences = NothingEnum.nothing;
	app.findChangeTextOptions.includeHiddenLayers =
	app.findChangeTextOptions.includeLockedLayersForFind =
	app.findChangeTextOptions.includeLockedStoriesForFind =
	app.findChangeTextOptions.includeMasterPages = true;
	app.findTextPreferences.fillColor = "Registration";
	app.changeTextPreferences.fillColor = "Reg. black";
	doc.changeText();
	app.findTextPreferences = app.changeTextPreferences = NothingEnum.nothing;
}

function Relink(oldLink, newLink) {
	for (var i = 0; i < doc.links.length; i++) {
		var link = doc.links[i];
		if (link.name == oldLink) link.relink(File(doc.filePath + "/Links/" + newLink));
		// if (link.name == oldLink) link.relink(File(File(link.filePath).path + "/" + newLink));
	}
}