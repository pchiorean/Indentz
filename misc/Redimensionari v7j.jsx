/*
	Redimensionari v7.8j
	A modified version of Redimensionari v7 by Dan Ichimescu, 22 April 2020
	May 2020, Paul Chiorean

	v7.1j – cleanup
	v7.2j – fix progress bar
	v7.3j – change 'Vizibil' to 'safe area'; no guides
	v7.4j – 3 decimals for aspect ratio
	v7.5j – update 'ratio' layer
	v7.6j – remove 'HW' layer dependence
	v7.8j – more cleanup
*/

var doc = app.documents[0];
var pgLength = doc.pages.length;

app.activeWindow.transformReferencePoint = AnchorPoint.CENTER_ANCHOR;
app.generalPreferences.pageNumbering = PageNumberingOptions.absolute;
app.scriptPreferences.enableRedraw = false;
app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;
app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
app.activeDocument.spreads.everyItem().allowPageShuffle = true;
doc.documentPreferences.facingPages = false;
doc.documentPreferences.allowPageShuffle = true;
doc.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.millimeters;
doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.millimeters;

try { doc.layers.add({ name: "safe area", layerColor: UIColors.RED }).move(LocationOptions.AT_BEGINNING) } catch (e) {};
try { doc.layers.add({ name: "ratio", layerColor: UIColors.CYAN }).move(LocationOptions.AT_BEGINNING) } catch (e) {};
try { doc.layers.add({ name: "id", layerColor: UIColors.CYAN }).move(LocationOptions.AT_BEGINNING) } catch (e) {};

// 1. Sort master by ratios
var ratia = [];
sort_master(ratia);
doc.save();

function sort_master(r) {
	for (var i = 0; i < doc.pages.length; i++) {
		myPage = doc.pages.item(i);
		var b = myPage.bounds;
		var W_ = b[3] - b[1];
		var H_ = b[2] - b[0];
		var r_zecimale = W_ / H_;
		var r = r_zecimale.toFixed(3);
		ratia.push(r);
	}
	sort_spreads_by_ratio(ratia);
}

function sort_spreads_by_ratio(r) {
	for (var i = 0; i < (r.length - 1); i++) {
		if (r[i] > r[(i + 1)]) {
			doc.spreads.item(i).move(LocationOptions.AFTER, doc.spreads.item(i + 1));
			r = [];
			sort_master(r);
		}
	}
}

// 2. Parse info file
var myFilePath = doc.filePath;
var myFileName_full = doc.fullName + "";
var myFileName = doc.name + "";
var myFileName_full_length = myFileName_full.length;
var myFileName_length = myFileName.length;

var myFileName0 = myFileName.substr(0, myFileName.lastIndexOf("."));

var definitionsFile = File(myFilePath + "/" + myFileName0 + ".txt");
definitionsFile.open("r");
var lines_l = 0;
while (!definitionsFile.eof) {
	var numarLinii = lines_l++;
	var readLine_l = definitionsFile.readln().split("\t");
}

var ratia = [];
for (var i = 0; i < doc.pages.length; i++) {
	myPage = doc.pages.item(i);
	var b = myPage.bounds;
	var W_ = b[3] - b[1];
	var H_ = b[2] - b[0];
	var r_zecimale = W_ / H_;
	var r = r_zecimale.toFixed(3);
	ratia.push(r);
}

var progressWin = CreateProgressBar();
progressWin.pb.minvalue = 1; progressWin.pb.maxvalue = lines_l - 1;
progressWin.show();

definitionsFile.close("r");

function CreateProgressBar() {
	var w = new Window("window", "Redimensionare");
	w.pb = w.add("progressbar", [12, 12, 650, 24], 0, undefined);
	w.st = w.add("statictext");
	w.st.bounds = [0, 0, 640, 20];
	w.st.alignment = "left";
	return w;
}

definitionsFile.open("r");
var lines = -1;
while (!definitionsFile.eof) {
	lines++;
	var readLine = definitionsFile.readln().split("\t");
	if (lines != 0) {
		var finalFileName = readLine[7];
		var idNumar = readLine[0];
		progressWin.pb.value = (lines + 1);
		progressWin.st.text = "Processing file - " + finalFileName + " (" + lines + " / " + (lines_l - 1) + ")";
		progressWin.update();

		var first_W_mm = (readLine[1]);
		var first_W_mm = first_W_mm.replace(/\,/g, ".");
		var first_H_mm = (readLine[2]);
		var first_H_mm = first_H_mm.replace(/\,/g, ".");
		var second_W_mm = (readLine[3]);
		var second_W_mm = second_W_mm.replace(/\,/g, ".");
		var second_H_mm = (readLine[4]);
		var second_H_mm = second_H_mm.replace(/\,/g, ".");
		var aria_viz = first_W_mm * first_H_mm;
		var aria_total = second_W_mm * second_H_mm;

		if (aria_viz < aria_total) {
			var visible_W = Number(first_W_mm / 0.352777777777778);
			var visible_H = Number(first_H_mm / 0.352777777777778);
			var total_W = Number(second_W_mm / 0.352777777777778);
			var total_H = Number(second_H_mm / 0.352777777777778);
			var visible_W_mm = readLine[1];
			var visible_H_mm = readLine[2];
			var total_W_mm = readLine[3];
			var total_H_mm = readLine[4];
		} else {
			var visible_W = Number(second_W_mm / 0.352777777777778);
			var visible_H = Number(second_H_mm / 0.352777777777778);
			var total_W = Number(first_W_mm / 0.352777777777778);
			var total_H = Number(first_H_mm / 0.352777777777778);
			var visible_W_mm = readLine[3];
			var visible_H_mm = readLine[4];
			var total_W_mm = readLine[1];
			var total_H_mm = readLine[2];
		}

		var ratia_final = (visible_W / visible_H).toFixed(3);
		for (var i = 0; i < ratia.length; i++) {
			var val_jumatea_intervalului = (ratia[i + 1] - ratia[i]) / 2;
			var text_ratia = ratia[i];
			var ratia_i = parseFloat(text_ratia);
			var jumate_interval = val_jumatea_intervalului + ratia_i;
			if (ratia_final > ratia[i]) {
				if (i == ratia.length - 1) {
					var pagDeExtras = i;
					break;
				} else if (ratia_final <= ratia[i + 1]) {
					if (ratia_final <= jumate_interval) {
						var pagDeExtras = i;
						break;
					} else if (ratia_final > jumate_interval) {
						var pagDeExtras = i + 1;
						break;
					}
				}
			} else if (ratia_final <= ratia[0]) {
				var pagDeExtras = 0;
				break;
			}
		}

		for (var i = pgLength - 1; i >= 0; i--) {
			if (i > pagDeExtras) doc.pages[i].remove();
			if (i < pagDeExtras) doc.pages[i].remove();
		}
		var numarRatieRotunjit_u = Number(ratia[pagDeExtras]);
		var numarRatieRotunjit = numarRatieRotunjit_u.toFixed(3);
		var numeRatieFolder1 = numarRatieRotunjit.toString();
		var numeRatieFolder = numeRatieFolder1.replace(/\./g, "_");
		var myFilePath = doc.filePath;
		var myFileName_full = doc.fullName + "";
		var myFileName = doc.name + "";
		var myFileName_full_length = myFileName_full.length;
		var myFileName_length = myFileName.length;
		var f = new Folder(myFilePath + "/" + ("_ratia_" + (numeRatieFolder)));
		f.create();

		scale_document(visible_W, visible_H, total_W, total_H);
		resize_document(total_W, total_H);
		id_and_info(visible_W, visible_H, total_W, total_H, idNumar);
		align_elements(visible_W, visible_H, total_W, total_H);

		doc.layers.itemByName("id").visible = true;
		doc.layers.itemByName("id").locked = true;
		doc.layers.itemByName("safe area").visible = true;
		doc.layers.itemByName("safe area").locked = true;
		doc.layers.itemByName("ratio").visible = false;
		doc.layers.itemByName("ratio").locked = true;
		doc.layers.itemByName("HW").visible = true;
		doc.layers.itemByName("HW").locked = true;

		var savedocname = finalFileName + ".indd";
		var savedoc = doc.save(File(myFilePath + "/" + ("_ratia_" + (numeRatieFolder)) + "/" + savedocname));
		savedoc.close(SaveOptions.no);

		app.open(File(myFilePath + "/" + myFileName), false);
	}
}
progressWin.close();
doc.close();


function scale_document(visible_W, visible_H, total_W, total_H) {
	myPage = doc.pages.item(0);
	doc.zeroPoint = [0, 0];
	doc.viewPreferences.rulerOrigin = RulerOrigin.PAGE_ORIGIN;
	pages = doc.pages;
	pages[0].marginPreferences.properties = { top: 0, left: 0, bottom: 0, right: 0 };
	pages[0].layoutRule = LayoutRuleOptions.SCALE;
	pages[0].resize(CoordinateSpaces.SPREAD_COORDINATES,
		AnchorPoint.CENTER_ANCHOR,
		ResizeMethods.REPLACING_CURRENT_DIMENSIONS_WITH,
		[visible_W, visible_H]);
}

function resize_document(total_W, total_H) {
	pages = doc.pages;
	pages[0].marginPreferences.properties = { top: 0, left: 0, bottom: 0, right: 0 };
	pages[0].layoutRule = LayoutRuleOptions.OFF;
	pages[0].resize(CoordinateSpaces.SPREAD_COORDINATES,
		AnchorPoint.CENTER_ANCHOR,
		ResizeMethods.REPLACING_CURRENT_DIMENSIONS_WITH,
		[total_W, total_H]);
}

function id_and_info(visible_W, visible_H, total_W, total_H, idNumar) {
	doc.activeLayer = doc.layers.itemByName("id");
	myPage = doc.pages.item(0);
	var textFrame = myPage.textFrames.add();
	var y1, x1, y2, x2;
	y1 = Number((total_H - visible_H) / 2) + Number(visible_H);
	x1 = Number((total_W - visible_W) / 2);
	y2 = Number((total_H - visible_H) / 2) + Number(visible_H) + 11;
	x2 = Number((total_W - visible_W) / 2) + 56;
	textFrame.geometricBounds = [y1, x1, y2, x2];
	if (idNumar == "") { textFrame.contents = " " } else { textFrame.contents = "ID " + idNumar };
	var myText_id = textFrame.parentStory.paragraphs.item(0);
	try { myText_id.appliedFont = app.fonts.item("Helvetica Neue") } catch (e) {}
	try { myText_id.fontStyle = "Light"; myText_id.pointSize = 5 } catch (e) {};
	textFrame.label = "ID";
	textFrame.fit(FitOptions.FRAME_TO_CONTENT);
	textFrame.textFramePreferences.properties = {
		verticalJustification: VerticalJustification.BOTTOM_ALIGN,
		autoSizingReferencePoint: AutoSizingReferenceEnum.BOTTOM_LEFT_POINT,
		firstBaselineOffset: FirstBaseline.CAP_HEIGHT,
		useNoLineBreaksForAutoSizing: true
	}
	textFrame.textFramePreferences.autoSizingType = AutoSizingTypeEnum.HEIGHT_AND_WIDTH;
	textFrame.move([x1 + 5.67, y1 - 9.239]);

	doc.activeLayer = doc.layers.itemByName("ratio");
	var textFrame_info = myPage.textFrames.add();
	textFrame_info.contents = "Total W = " + total_W_mm + "\rTotal H = " + total_H_mm + 
		"\r\rVizibil W = " + visible_W_mm + "\rVizibil H = " + visible_H_mm +
		"\r\rRaport = " + ratia_final;
	var myText = textFrame_info.parentStory.paragraphs.everyItem();
	try { myText.appliedFont = app.fonts.item("Helvetica Neue") } catch (e) {};
	try { myText.fontStyle = "Regular"; myText.pointSize = 12 } catch (e) {};
	textFrame_info.label = "ratio";
	textFrame_info.fit(FitOptions.FRAME_TO_CONTENT);
	textFrame_info.textFramePreferences.properties = {
		verticalJustification: VerticalJustification.TOP_ALIGN,
		firstBaselineOffset: FirstBaseline.CAP_HEIGHT,
		autoSizingReferencePoint: AutoSizingReferenceEnum.TOP_LEFT_POINT,
		autoSizingType: AutoSizingTypeEnum.HEIGHT_AND_WIDTH,
		useNoLineBreaksForAutoSizing: true
	}
	textFrame_info.move([total_W + 20, 0]);

	var m_top = (total_H - visible_H) / 2;
	var m_left = (total_W - visible_W) / 2;
	var m_right = m_left;
	var m_bottom = m_top;
	m_topq = m_top * 0.352777777777778;
	m_leftq = m_left * 0.352777777777778;
	myPage = doc.pages.item(0);
	myPage.marginPreferences.properties = { top: m_top, left: m_left, right: m_right, bottom: m_bottom };

	doc.activeLayer = doc.layers.itemByName("safe area");
	var safeSwatchName = "Safe area";
	try { doc.colors.add({ name: safeSwatchName, model: ColorModel.PROCESS,
		space: ColorSpace.CMYK, colorValue: [0, 100, 0, 0] })
	} catch (_) {};
	var myItem_vizibil = myPage.rectangles.add({
		geometricBounds: [m_top, m_left, m_top + visible_H, m_left + visible_W],
		label: "safe area",
		contentType: ContentType.UNASSIGNED,
		fillColor: "None",
		strokeColor: safeSwatchName,
		strokeWeight: "0.5pt",
		strokeAlignment: StrokeAlignment.INSIDE_ALIGNMENT,
		strokeType: "$ID/Canned Dashed 3x2",
		overprintStroke: false
	});
}

function align_elements(visible_W, visible_H, total_W, total_H) {
	var myFrames = doc.rectangles;
	var count = 0;
	for (var i = 0; i < myFrames.length; i++) {
		if (myFrames[i].label == "alignRightLaVizibil") {
			count++;
			doc.align(myFrames[i], AlignOptions.RIGHT_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
			if (count == 4) break;
		}
	}

	var count = 0;
	for (var i = 0; i < myFrames.length; i++) {
		if (myFrames[i].label == "alignLeftLaVizibil") {
			count++;
			doc.align(myFrames[i], AlignOptions.LEFT_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
			if (count == 4) break;
		}
	}

	var count = 0;
	for (var i = 0; i < myFrames.length; i++) {
		if (myFrames[i].label == "alignUpLaVizibil") {
			count++;
			doc.align(myFrames[i], AlignOptions.TOP_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
			if (count == 4) break;
		}
	}

	var count = 0;
	for (var i = 0; i < myFrames.length; i++) {
		if (myFrames[i].label == "alignDownLaVizibil") {
			count++;
			doc.align(myFrames[i], AlignOptions.BOTTOM_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
			if (count == 4) break;
		}
	}

	var count = 0;
	for (var i = 0; i < myFrames.length; i++) {
		if (myFrames[i].label == "alignRightLaPagina") {
			count++;
			doc.align(myFrames[i], AlignOptions.RIGHT_EDGES, AlignDistributeBounds.PAGE_BOUNDS);
			if (count == 4) break;
		}
	}

	var count = 0;
	for (var i = 0; i < myFrames.length; i++) {
		if (myFrames[i].label == "alignLeftLaPagina") {
			count++;
			doc.align(myFrames[i], AlignOptions.LEFT_EDGES, AlignDistributeBounds.PAGE_BOUNDS);
			if (count == 4) break;
		}
	}

	var count = 0;
	for (var i = 0; i < myFrames.length; i++) {
		if (myFrames[i].label == "alignHorizontalCenter") {
			count++;
			doc.align(myFrames[i], AlignOptions.HORIZONTAL_CENTERS, AlignDistributeBounds.MARGIN_BOUNDS);
			if (count == 4) break;
		}
	}

	var count = 0;
	for (var i = 0; i < myFrames.length; i++) {
		if (myFrames[i].label == "alignVerticalCentersMinusHW") {
			count++;
			doc.align(myFrames[i], AlignOptions.VERTICAL_CENTERS, AlignDistributeBounds.MARGIN_BOUNDS);
			var myPage = doc.pages.item(0);
			var b = myPage.bounds;
			var W_ = b[3] - b[1];
			var H_ = b[2] - b[0];

			var myBoundsFrame = myFrames[i].geometricBounds; // HW dreptunghi alb
			var myYF = myBoundsFrame[0];
			var myXF = myBoundsFrame[1];
			var myHF = myBoundsFrame[2];
			var myWF = myBoundsFrame[3];
			var W_hF = myWF - myXF;
			var H_hF = myHF - myYF;
			var moveFrame = (H_ - (H_ * 0.1)) / 2 - (H_hF / 2);
			myFrames[i].move([myXF, moveFrame]);
			if (count == 4) break;
		}
	}

	var count = 0;
	for (var i = 0; i < myFrames.length; i++) {
		if (myFrames[i].label == "expandToVizibil") {
			count++;
			var myPage = doc.pages.item(0);
			var m_top = myPage.marginPreferences.properties.top;
			var m_left = myPage.marginPreferences.properties.left;
			var m_right = myPage.marginPreferences.properties.right;
			var m_bottom = myPage.marginPreferences.properties.bottom;

			var b = myPage.bounds;
			var W_ = b[3] - b[1];
			var H_ = b[2] - b[0];
			myFrames[i].geometricBounds = [m_top, m_left, H_ - m_bottom, W_ - m_right];
			if (count == 4) break;
		}
	}

	var count = 0;
	for (var i = 0; i < myFrames.length; i++) {
		if (myFrames[i].label == "expandToBleed") {
			var myPage = doc.pages.item(0);
			count++;
			var b = myPage.bounds;
			var W_ = b[3] - b[1];
			var H_ = b[2] - b[0];
			myFrames[i].geometricBounds = [-14.174, -14.174, H_ + 14.174, W_ + 14.174];
			if (count == 4) break;
		}
	}
}