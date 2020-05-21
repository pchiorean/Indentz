/*
    Redimensionari v7.5j
    A modified version of Redimensionari v7 by Dan Ichimescu, 22 April 2020
    May 2020, Paul Chiorean

    v7.1j – cleanup
    v7.2j – fix progress bar
    v7.3j – change 'Vizibil' to 'safe area'; no guides
    v7.4j – 3 decimals for aspect ratio
    v7.5j – update 'ratio' layer
*/

var doc = app.documents[0];
var pgLength = doc.pages.length;

app.activeWindow.transformReferencePoint = AnchorPoint.CENTER_ANCHOR;
app.generalPreferences.pageNumbering = PageNumberingOptions.absolute;
app.scriptPreferences.enableRedraw = false;
app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;
app.scriptPreferences.userInteractionLevel = UserInteractionLevels.INTERACT_WITH_ALL; // NEVER_INTERACT
app.activeDocument.spreads.everyItem().allowPageShuffle = true;
doc.documentPreferences.facingPages = false;
doc.documentPreferences.allowPageShuffle = true;
doc.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.millimeters;
doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.millimeters;

//**************** TEST LAYERE VIZIBIL ID SI HW START *********************************************/
try { doc.layers.add({ name: "safe area", layerColor: UIColors.RED }).move(LocationOptions.AT_BEGINNING) } catch (e) {};
try { doc.layers.add({ name: "ratio", layerColor: UIColors.CYAN }).move(LocationOptions.AT_BEGINNING) } catch (e) {};
try { doc.layers.add({ name: "id", layerColor: UIColors.CYAN }).move(LocationOptions.AT_BEGINNING) } catch (e) {};

try {
    doc.layers.itemByName("HW").move(LocationOptions.AFTER, doc.layers.itemByName("safe area"));
} catch (e) {
    alert("Nu există HW layer!" + "\r" + "Document will now close.");
    doc.close(SaveOptions.no); exit();
}
//**************** TEST LAYERE VIZIBIL ID SI HW END ***********************************************/

var myFilePath = doc.filePath;
var myFileName_full = doc.fullName + "";
var myFileName = doc.name + "";
var myFileName_full_length = myFileName_full.length;
var myFileName_length = myFileName.length;
var myFileName0 = myFileName.substr(0, myFileName.lastIndexOf("."));

//**************** ORDONEAZA PAGINI DUPA RATIE START **********************************************/
var ratia = new Array;
read_master_ratios(ratia);
doc.save();

function read_master_ratios(r) {
    for (var i = 0; i < doc.pages.length; i++) {
        myPage = doc.pages.item(i);
        var b = myPage.bounds;
        var W_ = b[3] - b[1];
        var H_ = b[2] - b[0];
        var r_zecimale = W_ / H_;
        var r = r_zecimale.toFixed(3);
        ratia.push(r);
    }
    sort_master_ratios(ratia);
}

function sort_master_ratios(r) {
    for (var i = 0; i < (r.length - 1); i++) {
        if (r[i] > r[(i + 1)]) {
            doc.spreads.item(i).move(LocationOptions.AFTER, doc.spreads.item(i + 1));
            r = [];
            read_master_ratios(r);
        }
    }
}
//**************** ORDONEAZA PAGINI DUPA RATIE END ************************************************/

var definitionsFile = File(myFilePath + "/" + myFileName0 + ".txt");
definitionsFile.open("r");
var lines_l = 0;
while (!definitionsFile.eof) {
    var numarLinii = lines_l++;
    var readLine_l = definitionsFile.readln().split("\t"); // umplutura ca altfel da eroare
}

//**************** RATIA MASTER START *************************************************************/
var myPageNames = new Array;
for (var i = 0; i < doc.pages.length; i++) {
    myPageNames.push(doc.pages.item(i).name);
}
var ratia = new Array;
for (var i = 0; i < doc.pages.length; i++) {
    myPage = doc.pages.item(i);
    var b = myPage.bounds;
    var W_ = b[3] - b[1];
    var H_ = b[2] - b[0];
    var r_zecimale = W_ / H_;
    var r = r_zecimale.toFixed(3);
    ratia.push(r);
}
//**************** RATIA MASTER END ***************************************************************/

//**************** PROGRESS BAR START *************************************************************/
var progressWin = CreateProgressBar();
progressWin.show();
progressWin.update(); // poate merge pe Windows
progressWin.pb.minvalue = 1;
progressWin.pb.maxvalue = lines_l - 1;
app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
CreateProgressBar();

function CreateProgressBar() {
    var w = new Window("window", "Redimensionare");
    w.pb = w.add("progressbar", [12, 12, 650, 24], 0, undefined);
    w.st = w.add("statictext");
    w.st.bounds = [0, 0, 640, 20];
    w.st.alignment = "left";
    return w;
}
//**************** PROGRESS BAR END ***************************************************************/

definitionsFile.close("r");
definitionsFile.open("r");
var lines = -1;
while (!definitionsFile.eof) {
    lines++;

    //************ CITESTE DOC TEXT START *********************************************************/
    var readLine = definitionsFile.readln().split("\t");
    if (lines != 0) {
        // ======= PROGRESS BAR START
        var finalFileName = readLine[7];
        var idNumar = readLine[0];
        progressWin.pb.value = (lines + 1);
        progressWin.st.text = "Processing file - " + finalFileName + " (" + lines + " / " + (lines_l - 1) + ")";
        progressWin.update();
        //======== PROGRESS BAR END

        //======== CITESTE W SI H START
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
        //======== CITESTE W SI H END

        //******** CAUTA RATIA START **************************************************************/
        var ratia_final = (visible_W / visible_H).toFixed(3);

        for (var i = 0; i < ratia.length; i++) {
            var val_jumatea_intervalului = (ratia[i + 1] - ratia[i]) / 2;
            var text_ratia = ratia[i];
            var ratia_i = parseFloat(text_ratia);
            var jumate_interval = val_jumatea_intervalului + ratia_i;
            if (ratia_final > ratia[i]) {
                // ratia noastra cautata e mai mare sau egala cu capatul de jos al intervalului;
                // in continuare verificam daca suntem pe ultimul element din array (daca intervalul are si un capat superior sau nu)
                if (i == ratia.length - 1) {
                    // caz de exceptie, suntem pe ultimul interval (am ajuns la capatul array-ului);
                    // limita superioara a intervalului este infinit, nu mai avem ce verifica, am gasit intervalul
                    var pagDeExtras = i;
                    break; // ne-am gasit intervalul, iesi din "for"
                } else if (ratia_final <= ratia[i + 1]) {
                    // cazul normal, suntem intre 2 intervale, si ratia noastra e strict mai mica decat limita superioara
                    // comparam daca e mai aproape de primul element sau mai aproape de ultimul element din interval
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
        //******** CAUTA RATIA END ****************************************************************/

        //******** EXTRACT PAGE START *************************************************************/
        var myPageNames = new Array;
        for (var i = 0; i < doc.pages.length; i++) {
            myPageNames.push(doc.pages.item(i).name);
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

        // var finalFileName = finalFileName.replace(/\,/g, ".");

        //******** OPERATII PE PAGINA START *******************************************************/
        scale_document(visible_W, visible_H, total_W, total_H);
        resize_document(total_W, total_H);
        id_and_info(visible_W, visible_H, total_W, total_H, idNumar);
        hw_and_align(visible_W, visible_H, total_W, total_H);
        //******** OPERATII PE PAGINA END *********************************************************/

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
        //******** EXTRACT PAGE END ***************************************************************/

        //******** OPEN MASTER AGAIN **************************************************************/
        app.open(File(myFilePath + "/" + myFileName), false);
    }
    //************ CITESTE DOC TEXT END ***********************************************************/
}
progressWin.close();
doc.close();
// alert("job done.");


//**************** FUNCTII START ******************************************************************/
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

function hw_and_align(visible_W, visible_H, total_W, total_H) {
    try {
        doc.activeLayer = doc.layers.itemByName("HW");
        myPage = doc.pages.item(0);
        b_pgebounds = myPage.bounds;
        w_t = b_pgebounds[3] - b_pgebounds[1];
        h_t = b_pgebounds[2] - b_pgebounds[0];
        var m_left = myPage.marginPreferences.left;
        var m_right = myPage.marginPreferences.right;
        var m_top = myPage.marginPreferences.top;
        var m_bottom = myPage.marginPreferences.bottom;
        w = w_t - (2 * m_left);
        h = h_t - (2 * m_top);
        HW_h_final = (h * 0.1);
        SAIZECI_Hwai = (HW_h_final * 0.6) // 60% din inaltimea lui h
        Y_HW_final = (m_top + h - (h * 0.1));
        Y_HW_final_latotal = (h - HW_h_final) + ((h_t - h) / 2);
        var myHW = doc.rectangles.itemByName("hwul");
        var myHWai = doc.rectangles.itemByName("hwul").rectangles.itemByName("hwaiul"); // ai-ul din HW!
        myHW.redefineScaling([1, 1]);
        myHWai.redefineScaling([1, 1]);
        myHW.geometricBounds = [Y_HW_final, m_left, h + m_top, w + m_left]; //succes
        doc.align(myHWai, AlignOptions.HORIZONTAL_CENTERS, AlignDistributeBounds.MARGIN_BOUNDS);
        myHW.fit(FitOptions.CENTER_CONTENT);

        var myBoundsw = myHW.geometricBounds; // HW dreptunghi alb
        var myYw = myBoundsw[0];
        var myXw = myBoundsw[1];
        var myHw = myBoundsw[2];
        var myWw = myBoundsw[3];
        var W_hw = myHW.geometricBounds[3] - myHW.geometricBounds[1]
        var H_hw = myHW.geometricBounds[2] - myHW.geometricBounds[0];

        var myBoundsw = myHWai.geometricBounds; // HW dreptunghi alb
        var myYwai = myBoundsw[0];
        var myXwai = myBoundsw[1];
        var myHwai = myBoundsw[2];
        var myWwai = myBoundsw[3];
        var W_hwai = myHWai.geometricBounds[3] - myHWai.geometricBounds[1]
        var H_hwai = myHWai.geometricBounds[2] - myHWai.geometricBounds[0];
        var obj = myHWai;

        var anchor = AnchorPoint.CENTER_ANCHOR;
        var ow = obj.geometricBounds[3] - obj.geometricBounds[1];
        var oh = obj.geometricBounds[2] - obj.geometricBounds[0];

        if (w > h) { // landscape // H_hwai > h - (h * 0.1)
            var pw = HW_h_final * 0.7 / H_hwai;
            var ph = pw;
            var matrix = app.transformationMatrices.add({
                horizontalScaleFactor: pw,
                verticalScaleFactor: ph
            });
            obj.transform(CoordinateSpaces.pasteboardCoordinates, anchor, matrix);
        }
        if (w < h) { // portrait // W_hwai > w - (w * 0.1)
            myHW.redefineScaling([1, 1]);
            myHWai.redefineScaling([1, 1]);
            var pw = W_hw * 0.8 / W_hwai;
            var ph = pw;
            var matrix = app.transformationMatrices.add({
                horizontalScaleFactor: pw,
                verticalScaleFactor: ph
            });
            obj.transform(CoordinateSpaces.pasteboardCoordinates, anchor, matrix);
        }
        var myBoundsw = myHWai.geometricBounds; // HW dreptunghi alb
        var myYwai = myBoundsw[0];
        var myXwai = myBoundsw[1];
        var myHwai = myBoundsw[2];
        var myWwai = myBoundsw[3];
        var W_hwai = myHWai.geometricBounds[3] - myHWai.geometricBounds[1]
        var H_hwai = myHWai.geometricBounds[2] - myHWai.geometricBounds[0];
        if (W_hwai > w - (w * 0.1)) { // portrait // W_hwai > w - (w * 0.1)
            myHW.redefineScaling([1, 1]);
            myHWai.redefineScaling([1, 1]);
            var pw = W_hw * 0.8 / W_hwai;
            var ph = pw;
            var matrix = app.transformationMatrices.add({
                horizontalScaleFactor: pw,
                verticalScaleFactor: ph
            });
            obj.transform(CoordinateSpaces.pasteboardCoordinates, anchor, matrix);
        }
        myHWai.fit(FitOptions.CENTER_CONTENT);
        myHW.fit(FitOptions.CENTER_CONTENT);
        myHW.geometricBounds = [Y_HW_final_latotal, -14.17322835, h_t + 14.17322835, w_t + 14.17322835];
    } catch (e) {}

    //************ ALINIERE ELEMENTE STANGA, DREAPTA, FIT START ***********************************/
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
    //************ ALINIERE ELEMENTE STANGA, DREAPTA, FIT END *************************************/

    // myPage = doc.pages.item(0);
    // with(myPage) {
    //     var m_top = myPage.marginPreferences.properties.top;
    //     var m_left = myPage.marginPreferences.properties.left;
    //     var m_right = myPage.marginPreferences.properties.right;
    //     var m_bottom = myPage.marginPreferences.properties.bottom;
    //     var b = myPage.bounds;
    //     var W_ = b[3] - b[1];
    //     var H_ = b[2] - b[0];
    //     doc.activeLayer = doc.layers.itemByName("safe area");
    //     guides.add(undefined, { orientation: HorizontalOrVertical.vertical, location: (W_ - m_right) });
    //     guides.add(undefined, { orientation: HorizontalOrVertical.vertical, location: m_left });
    //     guides.add(undefined, { orientation: HorizontalOrVertical.horizontal, location: m_top });
    //     guides.add(undefined, { orientation: HorizontalOrVertical.horizontal, location: (H_ - m_bottom) });
    // }
}