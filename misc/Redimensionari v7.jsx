app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;
app.layoutWindows[0].transformReferencePoint = AnchorPoint.CENTER_ANCHOR;
app.generalPreferences.pageNumbering = PageNumberingOptions.absolute;
app.scriptPreferences.enableRedraw = false;
app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;

var myDocument = app.documents[0];
var myPage_length = app.documents[0].pages.length;
var myPages = app.documents[0].pages;

//**************** TEST LAYERE VIZIBIL ID SI HW START *********************************************/
try {
    app.documents[0].layers.add({
        name: "vizibil",
        layerColor: UIColors.RED
    }).move(LocationOptions.AT_BEGINNING);
    app.documents[0].layers.add({
        name: "id",
        layerColor: UIColors.RED
    }).move(LocationOptions.AT_BEGINNING);
    // app.documents[0].layers.itemByName("vizibil").move(LocationOptions.AT_BEGINNING);
    // app.documents[0].layers.itemByName("id").move(LocationOptions.AT_BEGINNING);
} catch (e) {}

try {
    app.documents[0].layers.itemByName("HW").move(LocationOptions.AFTER, app.documents[0].layers.itemByName("vizibil"));
} catch (e) {
    alert("HW layer NU exista!" + "\n" + "Document will close");
    app.documents[0].close(SaveOptions.no);
    exit();
}
//**************** TEST LAYERE VIZIBIL ID SI HW END ***********************************************/

var myFile_calea = app.documents[0].filePath;
var myFileName_full = app.documents[0].fullName + "";
var myFileName = app.documents[0].name + "";
var myFileName_full_length = myFileName_full.length;
var myFileName_length = myFileName.length;
var myFileName0 = myFileName.substr(0, myFileName.lastIndexOf("."));

//**************** ORDONEAZA PAGINI DUPA RATIE START **********************************************/
var spread = app.activeDocument.spreads.everyItem();
spread.allowPageShuffle = true;
myDocument.documentPreferences.facingPages = false;
myDocument.documentPreferences.allowPageShuffle = true;

var myRatiaUnu = new Array;
citestepaginile(myRatiaUnu);
app.documents[0].save();

function citestepaginile(myRatiaUnu) {
    for (i = 0; i < app.documents[0].pages.length; i++) {
        myPage = app.documents[0].pages.item(i);
        var b = myPage.bounds;
        var W_ = b[3] - b[1];
        var H_ = b[2] - b[0];
        var ratia_zecimale = W_ / H_;
        var ratia = ratia_zecimale.toFixed(2);
        myRatiaUnu.push(ratia);
    }
    comparaRatia_simuta(myRatiaUnu);
}

function comparaRatia_simuta(myRatiaUnu) {
    for (var myCounter = 0; myCounter < (myRatiaUnu.length - 1); myCounter++) {
        if (myRatiaUnu[myCounter] > myRatiaUnu[(myCounter + 1)]) {
            app.documents[0].spreads.item(myCounter).move(LocationOptions.AFTER, app.documents[0].spreads.item(myCounter + 1));
            myRatiaUnu = [];
            citestepaginile(myRatiaUnu);
        }
    }
}
//**************** ORDONEAZA PAGINI DUPA RATIE END ************************************************/

var definitionsFile = File(myFile_calea + "/" + myFileName0 + ".txt");
definitionsFile.open("r");
var countLines_l = 0;
while (!definitionsFile.eof) {
    var numarLinii = countLines_l++;
    var readedLine_l = definitionsFile.readln().split("\t"); // umplutura ca altfel da eroare
}

//**************** RATIA MASTER START *************************************************************/
var myPageNames = new Array;
for (myCounter = 0; myCounter < app.documents[0].pages.length; myCounter++) {
    myPageNames.push(app.documents[0].pages.item(myCounter).name);
}
var myRatia = new Array;
for (myCounter = 0; myCounter < app.documents[0].pages.length; myCounter++) {
    myPage = app.documents[0].pages.item(myCounter);
    var b = myPage.bounds;
    var W_ = b[3] - b[1];
    var H_ = b[2] - b[0];
    var ratia_zecimale = W_ / H_;
    var ratia = ratia_zecimale.toFixed(2);
    myRatia.push(ratia);
}
//**************** RATIA MASTER END ***************************************************************/

//**************** PROGRESS BAR START *************************************************************/
var progressWin = CreateProgressBar();
progressWin.show();
progressWin.update(); // poate merge pe Windows
progressWin.pb.minvalue = 0;
progressWin.pb.maxvalue = countLines_l;
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
var countLines = -1;
while (!definitionsFile.eof) {
    countLines++;

    //************ CITESTE DOC TEXT START *********************************************************/
    var readedLine = definitionsFile.readln().split("\t");
    if (countLines != 0) {
        // ======= PROGRESS BAR START
        var finalFileName = readedLine[7];
        var idNumar = readedLine[0];
        progressWin.pb.value = (countLines + 1);
        progressWin.st.text = "Processing file - " + finalFileName + " (" + countLines + " / " + countLines_l + ")";
        progressWin.update();
        //======== PROGRESS BAR END

        //======== CITESTE W SI H START
        var primu_W_mm = (readedLine[1]);
        var primu_W_mm = primu_W_mm.replace(/\,/g, ".");
        var primuH_mm = (readedLine[2]);
        var primuH_mm = primuH_mm.replace(/\,/g, ".");
        var aldoilea_W_mm = (readedLine[3]);
        var aldoilea_W_mm = aldoilea_W_mm.replace(/\,/g, ".");
        var aldoilea_H_mm = (readedLine[4]);
        var aldoilea_H_mm = aldoilea_H_mm.replace(/\,/g, ".");
        var varAria_viz = primu_W_mm * primuH_mm;
        var varAria_total = aldoilea_W_mm * aldoilea_H_mm;

        if (varAria_viz < varAria_total) {
            var vizibil_W = Number(primu_W_mm / 0.352777777777778);
            var vizibil_H = Number(primuH_mm / 0.352777777777778);
            var total_W = Number(aldoilea_W_mm / 0.352777777777778);
            var total_H = Number(aldoilea_H_mm / 0.352777777777778);
            var vizibil_W_mm = readedLine[1];
            var vizibil_H_mm = readedLine[2];
            var total_W_mm = readedLine[3];
            var total_H_mm = readedLine[4];
        } else {
            var vizibil_W = Number(aldoilea_W_mm / 0.352777777777778);
            var vizibil_H = Number(aldoilea_H_mm / 0.352777777777778);
            var total_W = Number(primu_W_mm / 0.352777777777778);
            var total_H = Number(primuH_mm / 0.352777777777778);
            var vizibil_W_mm = readedLine[3];
            var vizibil_H_mm = readedLine[4];
            var total_W_mm = readedLine[1];
            var total_H_mm = readedLine[2];
        }
        //======== CITESTE W SI H END

        //******** CAUTA RATIA START **************************************************************/
        var ratia_final_zecimale = vizibil_W / vizibil_H;
        var ratia_final = ratia_final_zecimale.toFixed(2);

        var myDocument = app.documents[0];
        var myPage_length = app.documents[0].pages.length;
        var myPages = app.documents[0].pages;

        for (var myCounter = 0; myCounter < myRatia.length; myCounter++) {
            var val_jumatea_intervalului = (myRatia[myCounter + 1] - myRatia[myCounter]) / 2;
            var text_myRatia = myRatia[myCounter];
            var myRatia_myCounter = parseFloat(text_myRatia);
            var jumate_interval = val_jumatea_intervalului + myRatia_myCounter;
            if (ratia_final > myRatia[myCounter]) {
                // ratia noastra cautata e mai mare sau egala cu capatul de jos al intervalului;
                // in continuare verificam daca suntem pe ultimul element din array (daca intervalul are si un capat superior sau nu)
                if (myCounter == myRatia.length - 1) {
                    // caz de exceptie, suntem pe ultimul interval (am ajuns la capatul array-ului);
                    // limita superioara a intervalului este infinit, nu mai avem ce verifica, am gasit intervalul
                    var pagDeExtras = myCounter;
                    break; // ne-am gasit intervalul, iesi din "for"
                } else if (ratia_final <= myRatia[myCounter + 1]) {
                    // cazul normal, suntem intre 2 intervale, si ratia noastra e strict mai mica decat limita superioara
                    // comparam daca e mai aproape de primul element sau mai aproape de ultimul element din interval
                    if (ratia_final <= jumate_interval) {
                        var pagDeExtras = myCounter;
                        break;
                    } else if (ratia_final > jumate_interval) {
                        var pagDeExtras = myCounter + 1;
                        break;
                    }
                }
            } else if (ratia_final <= myRatia[0]) {
                var pagDeExtras = 0;
                break;
            }
        }
        //******** CAUTA RATIA END ****************************************************************/

        //******** EXTRACT PAGE START *************************************************************/
        var myPageNames = new Array;
        for (myCounter = 0; myCounter < app.documents[0].pages.length; myCounter++) {
            myPageNames.push(app.documents[0].pages.item(myCounter).name);
        }
        for (var i = myPage_length - 1; i >= 0; i--) {
            if (i > pagDeExtras) {
                myPages[i].remove();
            }
            if (i < pagDeExtras) {
                myPages[i].remove();
            }
        }
        var numarRatieRotunjit_u = Number(myRatia[pagDeExtras]);
        var numarRatieRotunjit = numarRatieRotunjit_u.toFixed(2);
        var numeRatieFolder1 = numarRatieRotunjit.toString();
        var numeRatieFolder = numeRatieFolder1.replace(/\./g, "_");
        var myFile_calea = app.documents[0].filePath;
        var myFileName_full = app.documents[0].fullName + "";
        var myFileName = app.documents[0].name + "";
        var myFileName_full_length = myFileName_full.length;
        var myFileName_length = myFileName.length;
        var f = new Folder(myFile_calea + "/" + ("_ratia_" + (numeRatieFolder)));
        f.create();

        // var finalFileName = finalFileName.replace(/\./g, "_");
        // var finalFileName = finalFileName.replace(/\,/g, "_");
        // var finalFileName = finalFileName.replace(/\:/g, "_");
        // var finalFileName = finalFileName.replace(/\;/g, "_");
        // var finalFileName = finalFileName.replace(/`/g, "_");
        // var finalFileName = finalFileName.replace(/\!/g, "_");
        // var finalFileName = finalFileName.replace(/\?/g, "_");
        // var finalFileName = finalFileName.replace(/\>/g, "_");
        // var finalFileName = finalFileName.replace(/\</g, "_");
        // var finalFileName = finalFileName.replace(/\//g, "_");
        // var finalFileName = finalFileName.replace(/\[/g, "_");
        // var finalFileName = finalFileName.replace(/\\/g, "_");
        // var finalFileName = finalFileName.replace(/\|/g, "_");
        // var finalFileName = finalFileName.replace(/\]/g, "_");
        // var finalFileName = finalFileName.replace(/\{/g, "_");
        // var finalFileName = finalFileName.replace(/\}/g, "_");
        // var finalFileName = finalFileName.replace(/\*/g, "_");
        // var finalFileName = finalFileName.replace(/\^/g, "_");
        // var finalFileName = finalFileName.replace(/\$/g, "_");
        // var finalFileName = finalFileName.replace(/\&/g, "_");
        // var finalFileName = finalFileName.replace(/\"/g, "_");
        // var finalFileName = finalFileName.replace(/\'/g, "_");

        //******** OPERATII PE PAGINA START *******************************************************/
        scaleDocument(vizibil_W, vizibil_H, total_W, total_H);
        resizeDocument(total_W, total_H);
        idsimargineDocument(vizibil_W, vizibil_H, total_W, total_H, idNumar);
        aliniereHwDocument(vizibil_W, vizibil_H, total_W, total_H);
        //******** OPERATII PE PAGINA END *********************************************************/

        var savedocname = finalFileName + ".indd";
        var savedoc = myDocument.save(File(myFile_calea + "/" + ("_ratia_" + (numeRatieFolder)) + "/" + savedocname));
        savedoc.close(SaveOptions.no);
        //******** EXTRACT PAGE END ***************************************************************/

        //******** OPEN MASTER AGAIN **************************************************************/
        app.open(File(myFile_calea + "/" + myFileName), false);
    }
    //************ CITESTE DOC TEXT END ***********************************************************/
}

//**************** FUNCTII START ******************************************************************/
function scaleDocument(vizibil_W, vizibil_H, total_W, total_H) {
    myPage = app.documents[0].pages.item(0);
    app.documents[0].zeroPoint = [0, 0];
    app.documents[0].viewPreferences.rulerOrigin = RulerOrigin.PAGE_ORIGIN;
    pages = app.documents[0].pages;
    pages[0].marginPreferences.properties = {
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
    };
    pages[0].layoutRule = LayoutRuleOptions.SCALE;
    pages[0].resize(CoordinateSpaces.SPREAD_COORDINATES,
        AnchorPoint.CENTER_ANCHOR,
        ResizeMethods.REPLACING_CURRENT_DIMENSIONS_WITH,
        [vizibil_W, vizibil_H]);
}

function resizeDocument(total_W, total_H) {
    pages = app.documents[0].pages;
    pages[0].marginPreferences.properties = {
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
    };
    pages[0].layoutRule = LayoutRuleOptions.OFF;
    pages[0].resize(CoordinateSpaces.SPREAD_COORDINATES,
        AnchorPoint.CENTER_ANCHOR,
        ResizeMethods.REPLACING_CURRENT_DIMENSIONS_WITH,
        [total_W, total_H]);
}

function idsimargineDocument(vizibil_W, vizibil_H, total_W, total_H, idNumar) {
    try {
        app.documents[0].activeLayer = app.documents[0].layers.itemByName("id");
    } catch (e) {}
    myPage = app.documents[0].pages.item(0);
    var textFrame = myPage.textFrames.add(); // ID-ul
    var textFrame_info = myPage.textFrames.add();
    var y1, x1, y2, x2;
    y1 = Number((total_H - vizibil_H) / 2) + Number(vizibil_H);
    x1 = Number((total_W - vizibil_W) / 2);
    y2 = Number((total_H - vizibil_H) / 2) + Number(vizibil_H) + 11;
    x2 = Number((total_W - vizibil_W) / 2) + 56;
    textFrame.geometricBounds = [y1, x1, y2, x2];

    if (idNumar == "noid") {
        textFrame.contents = " ";
    } else {
        textFrame.contents = "ID " + idNumar;
    }
    var myText_id = textFrame.parentStory.paragraphs.item(0);
    try {
        appliedFont = app.fonts.item("Helvetica");
        myText_id.appliedFont = app.fonts.item("Helvetica");
    } catch (e) {}
    try {
        fontStyle = "Light";
        myText_id.fontStyle = "Light";
        myText_id.pointSize = 8;
    } catch (e) {}
    textFrame.label = "ID";
    textFrame.fit(FitOptions.FRAME_TO_CONTENT);
    textFrame.move([x1 + 5.67, y1 - 11.34]);
    textFrame_info.contents = "W vizibil = " + vizibil_W_mm + "\n" + "H vizibil = " + vizibil_H_mm + "\n" + "W total = " + total_W_mm + "\n" + "H total = " + total_H_mm + "\n";
    textFrame_info.label = "Info";
    var myText = textFrame_info.parentStory.paragraphs.item(0);
    myText.fontStyle = "Regular";
    myText.pointSize = 20;
    textFrame_info.fit(FitOptions.FRAME_TO_CONTENT);
    textFrame_info.move([total_W + 20, 0]);

    var m_top = (total_H - vizibil_H) / 2;
    var m_left = (total_W - vizibil_W) / 2;
    var m_right = m_left;
    var m_bottom = m_top;
    m_topq = m_top * 0.352777777777778;
    m_leftq = m_left * 0.352777777777778;
    myPage = app.documents[0].pages.item(0);
    myPage.marginPreferences.properties = {
        top: m_top,
        left: m_left,
        right: m_right,
        bottom: m_bottom
    }

    app.documents[0].activeLayer = app.documents[0].layers.itemByName("vizibil");
    var myItem_vizibil = myPage.rectangles.add({
        geometricBounds: [m_top, m_left, m_top + vizibil_H, m_left + vizibil_W]
    });
    myItem_vizibil.label = "Vizibil";
    myItem_vizibil.fillColor = "None";
    myItem_vizibil.strokeColor = "None";
}

function aliniereHwDocument(vizibil_W, vizibil_H, total_W, total_H) {
    try {
        app.documents[0].activeLayer = app.documents[0].layers.itemByName("HW");
        myPage = app.documents[0].pages.item(0);
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
        SAIZECI_Hwai = (HW_h_final * 0.6) // 60% din inaltime lui h
        Y_HW_final = (m_top + h - (h * 0.1));
        Y_HW_final_latotal = (h - HW_h_final) + ((h_t - h) / 2);
        var myHW = app.documents[0].rectangles.itemByName("hwul");
        var myHWai = app.documents[0].rectangles.itemByName("hwul").rectangles.itemByName("hwaiul"); // ai-ul din HW!
        myHW.redefineScaling([1, 1]);
        myHWai.redefineScaling([1, 1]);
        myHW.geometricBounds = [Y_HW_final, m_left, h + m_top, w + m_left]; //succes
        app.documents[0].align(myHWai, AlignOptions.HORIZONTAL_CENTERS, AlignDistributeBounds.MARGIN_BOUNDS);
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
    var myFrames = myDocument.rectangles;
    var count = 0;
    for (var i = 0; i < myFrames.length; i++) {
        if (myFrames[i].label == "alignRightLaVizibil") {
            count++;
            app.documents[0].align(myFrames[i], AlignOptions.RIGHT_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
            if (count == 4) {
                break;
            }
        }
    }

    var count = 0;
    for (var i = 0; i < myFrames.length; i++) {
        if (myFrames[i].label == "alignLeftLaVizibil") {
            count++;
            app.documents[0].align(myFrames[i], AlignOptions.LEFT_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
            if (count == 4) {
                break;
            }
        }
    }

    var count = 0;
    for (var i = 0; i < myFrames.length; i++) {
        if (myFrames[i].label == "alignUpLaVizibil") {
            count++;
            app.documents[0].align(myFrames[i], AlignOptions.TOP_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
            if (count == 4) {
                break;
            }
        }
    }

    var count = 0;
    for (var i = 0; i < myFrames.length; i++) {
        if (myFrames[i].label == "alignDownLaVizibil") {
            count++;
            app.documents[0].align(myFrames[i], AlignOptions.BOTTOM_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
            if (count == 4) {
                break;
            }
        }
    }

    var count = 0;
    for (var i = 0; i < myFrames.length; i++) {
        if (myFrames[i].label == "alignRightLaPagina") {
            count++;
            app.documents[0].align(myFrames[i], AlignOptions.RIGHT_EDGES, AlignDistributeBounds.PAGE_BOUNDS);
            if (count == 4) {
                break;
            }
        }
    }

    var count = 0;
    for (var i = 0; i < myFrames.length; i++) {
        if (myFrames[i].label == "alignLeftLaPagina") {
            count++;
            app.documents[0].align(myFrames[i], AlignOptions.LEFT_EDGES, AlignDistributeBounds.PAGE_BOUNDS);
            if (count == 4) {
                break;
            }
        }
    }

    var count = 0;
    for (var i = 0; i < myFrames.length; i++) {
        if (myFrames[i].label == "alignHorizontalCenter") {
            count++;
            app.documents[0].align(myFrames[i], AlignOptions.HORIZONTAL_CENTERS, AlignDistributeBounds.MARGIN_BOUNDS);
            if (count == 4) {
                break;
            }
        }
    }

    var count = 0;
    for (var i = 0; i < myFrames.length; i++) {
        if (myFrames[i].label == "alignVerticalCentersMinusHW") {
            count++;
            app.documents[0].align(myFrames[i], AlignOptions.VERTICAL_CENTERS, AlignDistributeBounds.MARGIN_BOUNDS);
            var myPage = app.documents[0].pages.item(0);
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
            if (count == 4) {
                break;
            }
        }
    }

    var count = 0;
    for (var i = 0; i < myFrames.length; i++) {
        if (myFrames[i].label == "expandToVizibil") {
            count++;
            var myPage = app.documents[0].pages.item(0);
            var m_top = myPage.marginPreferences.properties.top;
            var m_left = myPage.marginPreferences.properties.left;
            var m_right = myPage.marginPreferences.properties.right;
            var m_bottom = myPage.marginPreferences.properties.bottom;

            var b = myPage.bounds;
            var W_ = b[3] - b[1];
            var H_ = b[2] - b[0];
            myFrames[i].geometricBounds = [m_top, m_left, H_ - m_bottom, W_ - m_right];
            if (count == 4) {
                break;
            }
        }
    }

    var count = 0;
    for (var i = 0; i < myFrames.length; i++) {
        if (myFrames[i].label == "expandToBleed") {
            var myPage = app.documents[0].pages.item(0);
            count++;
            var b = myPage.bounds;
            var W_ = b[3] - b[1];
            var H_ = b[2] - b[0];
            myFrames[i].geometricBounds = [-14.174, -14.174, H_ + 14.174, W_ + 14.174];
            if (count == 4) {
                break;
            }
        }
    }
    //************ ALINIERE ELEMENTE STANGA, DREAPTA, FIT END *************************************/

    myPage = app.documents[0].pages.item(0);
    with(myPage) {
        var m_top = myPage.marginPreferences.properties.top;
        var m_left = myPage.marginPreferences.properties.left;
        var m_right = myPage.marginPreferences.properties.right;
        var m_bottom = myPage.marginPreferences.properties.bottom;
        var b = myPage.bounds;
        var W_ = b[3] - b[1];
        var H_ = b[2] - b[0];

        app.documents[0].activeLayer = app.documents[0].layers.itemByName("vizibil");
        guides.add(undefined, {
            orientation: HorizontalOrVertical.vertical,
            location: (W_ - m_right)
        });
        guides.add(undefined, {
            orientation: HorizontalOrVertical.vertical,
            location: m_left
        });
        guides.add(undefined, {
            orientation: HorizontalOrVertical.horizontal,
            location: m_top
        });
        guides.add(undefined, {
            orientation: HorizontalOrVertical.horizontal,
            location: (H_ - m_bottom)
        });
    }

    //************ LOCK LAYERS START **************************************************************/
    try {
        app.documents.item(0).layers.itemByName("id").locked ^= 1;
        app.documents.item(0).layers.itemByName("vizibil").locked ^= 1;
        app.documents.item(0).layers.itemByName("HW").locked ^= 1;
    } catch (e) {}
    //************ LOCK LAYERS START **************************************************************/
}

//**************** FUNCTII END ********************************************************************/

app.scriptPreferences.userInteractionLevel = UserInteractionLevels.INTERACT_WITH_ALL;
app.documents[0].viewPreferences.horizontalMeasurementUnits = MeasurementUnits.millimeters;
app.documents[0].viewPreferences.verticalMeasurementUnits = MeasurementUnits.millimeters;

progressWin.close();
app.documents[0] = app.documents[0];
app.documents[0].close();
alert("job done.");