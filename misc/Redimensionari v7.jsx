app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;
app.generalPreferences.pageNumbering = PageNumberingOptions.absolute;

app.scriptPreferences.enableRedraw = false;
app.layoutWindows[0].transformReferencePoint = AnchorPoint.CENTER_ANCHOR;
// app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;

// app.activeDocument = app.documents.itemByName("Name")
// app.activeDocument = app.documents.itemByName("Name")
// app.activeDocument = app.documents[0];




var myDocument = app.documents[0];
var myPage_length = app.documents[0].pages.length
var myPages = app.documents[0].pages



///*************** TEST LAYERE VIZIBIL ID SI HW ************************************************************/
try {
    // app.documents[0].layers.item('Layer 1').name = 'art';
    app.documents[0].layers.add({ name: "vizibil", layerColor: UIColors.RED }).move(LocationOptions.AT_BEGINNING);
    app.documents[0].layers.add({ name: "id", layerColor: UIColors.RED }).move(LocationOptions.AT_BEGINNING);
    app.documents[0].layers.itemByName("vizibil").move(LocationOptions.AT_BEGINNING);
    app.documents[0].layers.itemByName("id").move(LocationOptions.AT_BEGINNING);

} catch (e) {
    // alert(e);
    // app.documents[0].layers.itemByName("vizibil").move(LocationOptions.AT_BEGINNING);
    // app.documents[0].layers.itemByName("id").move(LocationOptions.AT_BEGINNING);

}




try {
    // app.documents[0].layers.item('Layer 1').name = 'art';

    app.documents[0].layers.itemByName("HW").move(LocationOptions.AFTER, app.documents[0].layers.itemByName("vizibil"));
    // app.documents[0].layers.add({ name: 'HW', layerColor: UIColors.RED }).move(LocationOptions.AT_BEGINNING);


} catch (e) {
    // alert(e);
    alert("HW layer NU exista!" + "\n" + "Document will close");
    app.documents[0].close(SaveOptions.no);
    // return;
    exit();
    // app.documents[0].layers.itemByName("HW").move(LocationOptions.AT_BEGINNING);

}
///*************** TEST LAYERE VIZIBIL ID SI HW  END************************************************************/






var myFile_calea = app.documents[0].filePath;
// alert("calea e "+myFile_calea)	
var myFileName_full = app.documents[0].fullName + "";
var myFileName = app.documents[0].name + "";

var myFileName_full_length = myFileName_full.length
var myFileName_length = myFileName.length

var myFileName0 = myFileName.substr(0, myFileName.lastIndexOf("."));
// alert("myFileName0 "+myFileName0);
// var my_path = app.activeDocument.filePath;







///*************** ORDONEAZA PAGINI DUPA RATIE START   ************************************************************/


myDocument.documentPreferences.facingPages = false;
var spread = app.activeDocument.spreads.everyItem()
spread.allowPageShuffle = true;
// myDocument.documentPreferences.allowSpreadShuffle = true;
myDocument.documentPreferences.allowPageShuffle = true;

// myDocument.documentPreferences.preserveLayoutWhenShuffling = true;
// preserveLayoutWhenShuffling = true;


var myRatiaUnu = new Array;
citestepaginile(myRatiaUnu)

function citestepaginile(myRatiaUnu) {
    // alert("dafjalskj")
    // var myRatia = [];
    for (i = 0; i < app.documents[0].pages.length; i++) {

        myPage = app.documents[0].pages.item(i);

        var b = myPage.bounds;
        var W_ = b[3] - b[1]; // 
        var H_ = b[2] - b[0]; // 
        var ratia_zecimale = W_ / H_
        var ratia = ratia_zecimale.toFixed(2);
        myRatiaUnu.push(ratia);
        // return myRatia;

    }

    // alert("ratia din for din functia citeste " + myRatia)
    // alert("ratia length " + myRatia.length)
    comparaRatia_simuta(myRatiaUnu)
}


//return myRatia;
// alert("ratia din afara functiei " + myRatia)
// alert("ratia length " + myRatia.length)


function comparaRatia_simuta(myRatiaUnu) {
    for (var myCounter = 0; myCounter < (myRatiaUnu.length - 1); myCounter++) {



        if (myRatiaUnu[myCounter] > myRatiaUnu[(myCounter + 1)]) {
            // alert("counter din if " + myCounter)
            // alert("ratia din compara " + myRatia)
            // alert("ratia length din compara " + myRatia.length)
            // alert("counter " + myCounter + " counter plus 1  " + Number(myCounter + 1))
            // alert("ratia counter " + myRatia[myCounter] + " ratia Anticounter  " + myRatia[myCounter + 1])


            app.documents[0].spreads.item(myCounter).move(LocationOptions.AFTER, app.documents[0].spreads.item(myCounter + 1));
            // app.documents[0].pages.item(myCounter).move(LocationOptions.AFTER, app.documents[0].spreads.item(myCounter + 1));
            // app.documents[0].pages.item(myCounter).move(LocationOptions.AFTER, app.documents[0].pages[(myCounter + 1)]);

            // app.documents[0].pages.item(myCounter).move(LocationOptions.AFTER, app.documents[0].pages[(myCounter + 1)]);

            myRatiaUnu = [];
            // myRatia.length = 0;
            citestepaginile(myRatiaUnu)
        }



        // }
    }
}



app.documents[0].save();




///*************** ORDONEAZA PAGINI DUPA RATIE END    ************************************************************/











var definitionsFile = File(myFile_calea + "/" + myFileName0 + ".txt");
// alert("definitionsFile "+definitionsFile);

definitionsFile.open("r");
var countLines_l = 0;
while (!definitionsFile.eof) {
    var numarLinii = countLines_l++;
    var readedLine_l = definitionsFile.readln().split("\t"); // umplutura ca altfel da eroare
    // if (countLines_l != 0) {
    // var vizibil_W_mmoo = readedLine_l[1].split("x")[0]; // umplutura ca altfel da eroare
    // }
}
// alert("JOB line " + numarLinii);






////************************************************************ RATIA MASTER  */
var myPageNames = new Array;
for (myCounter = 0; myCounter < app.documents[0].pages.length; myCounter++) {
    myPageNames.push(app.documents[0].pages.item(myCounter).name);
}
//return myPageNames;


// alert(" "+myPageNames)

var myRatia = new Array;
for (myCounter = 0; myCounter < app.documents[0].pages.length; myCounter++) {
    myPage = app.documents[0].pages.item(myCounter);
    var b = myPage.bounds;
    var W_ = b[3] - b[1]; // 
    var H_ = b[2] - b[0]; // 
    var ratia_zecimale = W_ / H_
    var ratia = ratia_zecimale.toFixed(2);
    myRatia.push(ratia);
}
//return myRatia;
////************************************************************ RATIA MASTER END */






// ==================================================START PROGRESS BAR
var progressWin = CreateProgressBar();
progressWin.show();
progressWin.update(); // poate merge pe windows
progressWin.pb.minvalue = 0;
progressWin.pb.maxvalue = countLines_l;
app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
CreateProgressBar()
function CreateProgressBar() {
    var w = new Window("window", "Redimensionare");
    w.pb = w.add("progressbar", [12, 12, 650, 24], 0, undefined);
    w.st = w.add("statictext");
    w.st.bounds = [0, 0, 640, 20];
    w.st.alignment = "left";
    return w;
}
// ================================================== END PROGRESS BAR 1



definitionsFile.close("r");
definitionsFile.open("r");
var countLines = -1;
while (!definitionsFile.eof) {
    countLines++;
    // countLines_l--

    // $.sleep(300);

    //************************************************************************************************************* START ------ CITESTE DOC TEXT  */


    var readedLine = definitionsFile.readln().split("\t");//split("\t");
    // alert("readedLine[0] : "+readedLine[0]+"\n"+"readedLine[1] : "+readedLine[1]+"\n"+"readedLine[2] : "+readedLine[2]+"\n"+"readedLine[3] : "+
    // readedLine[3]+"\n"+"readedLine[4] : "+readedLine[4]+"\n"+"readedLine[5] : "+readedLine[5])
    if (countLines != 0) {
        // ==================================================  PROGRESS BAR
        var finalFileName = readedLine[7];
        // var finalFileName = readedLine[7];
        var idNumar = readedLine[0]
        progressWin.pb.value = (countLines + 1);
        progressWin.st.text = "Processing file - " + finalFileName + "  (" + countLines + " / " + countLines_l + ")";
        progressWin.update();
        // ==================================================  PROGRESS BAR END


        // ==================================================  CITESTE W SI H

        // var vizibil_W_mm = readedLine[1];
        // var vizibil_H_mm = readedLine[2];
        // var total_W_mm = readedLine[3];
        // var total_H_mm = readedLine[4];

        // var primu_W_mm = Number(readedLine[1]);
        // var primu_W_mm = primu_W_mm.replace(/\,/g, ".");
        // var primuH_mm = Number(readedLine[2]);
        // var primuH_mm = primuH_mm.replace(/\,/g, ".");
        // var aldoilea_W_mm = Number(readedLine[3]);
        // var aldoilea_W_mm = aldoilea_W_mm.replace(/\,/g, ".");
        // var aldoilea_H_mm = Number(readedLine[4]);
        // var aldoilea_H_mm = aldoilea_H_mm.replace(/\,/g, ".");


        var primu_W_mm = (readedLine[1]);
        var primu_W_mm = primu_W_mm.replace(/\,/g, ".");
        var primuH_mm = (readedLine[2]);
        var primuH_mm = primuH_mm.replace(/\,/g, ".");
        var aldoilea_W_mm = (readedLine[3]);
        var aldoilea_W_mm = aldoilea_W_mm.replace(/\,/g, ".");
        var aldoilea_H_mm = (readedLine[4]);
        var aldoilea_H_mm = aldoilea_H_mm.replace(/\,/g, ".");


        // alert("idNumar "+idNumar+"\n"+"vizibil_W_mm "+vizibil_W_mm+"\n"+"vizibil_H_mm "+vizibil_H_mm+"\n"+"total_W_mm "+total_W_mm+"\n"+"total_H_mm "+total_H_mm)
        var varAria_viz = primu_W_mm * primuH_mm
        var varAria_total = aldoilea_W_mm * aldoilea_H_mm

        if (varAria_viz < varAria_total) {
            var vizibil_W = Number(primu_W_mm * 2.83464567); //2.83464567
            var vizibil_H = Number(primuH_mm * 2.83464567);
            var total_W = Number(aldoilea_W_mm * 2.83464567);
            var total_H = Number(aldoilea_H_mm * 2.83464567);
            var vizibil_W_mm = readedLine[1];
            var vizibil_H_mm = readedLine[2];
            var total_W_mm = readedLine[3];
            var total_H_mm = readedLine[4];
        } else {
            var vizibil_W = Number(aldoilea_W_mm * 2.83464567);
            var vizibil_H = Number(aldoilea_H_mm * 2.83464567);
            var total_W = Number(primu_W_mm * 2.83464567);
            var total_H = Number(primuH_mm * 2.83464567);
            var vizibil_W_mm = readedLine[3];
            var vizibil_H_mm = readedLine[4];
            var total_W_mm = readedLine[1];
            var total_H_mm = readedLine[2];
        }
        // var vizibil_W = Number(vizibil_W_mm * 2.83464567);
        // var vizibil_H = Number(vizibil_H_mm * 2.83464567);
        // var total_W = Number(total_W_mm * 2.83464567);
        // var total_H = Number(total_H_mm * 2.83464567);
        // alert("total_H "+total_H)
        // alert("se executa "+countLines)
        // ==================================================  CITESTE W SI H END





        var ratia_final_zecimale = vizibil_W / vizibil_H
        var ratia_final = ratia_final_zecimale.toFixed(2);
        // var ratia_final = 4.1 ///// ********************************************************** RATIA FINALA PT UN DOCUMENT DECLINAT DIN MASTER


        // var ratia_final = -1; // -1 = nu am gasit ratia in niciun interval //ratia_final

        //++++++
        // app.activeDocument = app.documents[0];
        var myDocument = app.documents[0];
        var myPage_length = app.documents[0].pages.length
        var myPages = app.documents[0].pages
        //++++++


        for (var myCounter = 0; myCounter < myRatia.length; myCounter++) {
            // alert()
            var val_jumatea_intervalului = (myRatia[myCounter + 1] - myRatia[myCounter]) / 2
            // var pointNum = parseFloat(text);
            var text_myRatia = myRatia[myCounter]
            var myRatia_myCounter = parseFloat(text_myRatia);
            var jumate_interval = val_jumatea_intervalului + myRatia_myCounter
            // alert("val juamte "+val_jumatea_intervalului+"  juamte int "+jumate_interval)
            // alert("1 counter e " + myCounter + "\n" + " ratia_final " + ratia_final + "\n" + " myRatia[myCounter + 1] " + myRatia[myCounter + 1] +
            //     "\n" + " jumatea_intervalului!!: " + jumate_interval)
            if (ratia_final > myRatia[myCounter]) {
                // alert("2 " + "ratia_final > myRatia[myCounter]")
                // ratia noastra cautata e mai mare sau egala cu capatul de jos al intervalului;
                // in continuare verificam daca suntem pe ultimul element din array (daca intervalul are si un capat superior sau nu)
                if (myCounter == myRatia.length - 1) {
                    // alert("3 " + "myCounter == myRatia.length - 1")
                    // caz de exceptie, suntem pe ultimul interval (am ajuns la capatul array-ului);
                    // limita superioara a intervalului este infinit, nu mai avem ce verifica, am gasit intervalul
                    var pagDeExtras = myCounter;
                    break; // ne-am gasit intervalul, iesi din "for"
                } else if (ratia_final <= myRatia[myCounter + 1]) {
                    // alert("4 " + "ratia_final <= myRatia[myCounter + 1]")
                    // cazul normal, suntem intre 2 intervale, si ratia noastra e strict mai mica decat limita superioara

                    // comparam daca e mai aproape de primul element sau mai aproape de ultimul element din interval


                    if (ratia_final <= jumate_interval) {
                        // alert("5 ratia_final " + ratia_final + "jumate_interval " + jumate_interval)
                        var pagDeExtras = myCounter;
                        // alert("4b counter e " + myCounter + "pag de extras este " + pagDeExtras + "\n" + " ratia_final " + ratia_final +
                        //     "\n" + " myRatia[myCounter + 1] " + myRatia[myCounter + 1] +
                        //     "\n" + " jumatea_intervalului " + jumate_interval)
                        break;
                    }
                    else if (ratia_final > jumate_interval) {
                        // alert("6 ratia_final " + ratia_final + "jumate_interval " + jumate_interval)
                        var pagDeExtras = myCounter + 1;
                        // alert("6b pag de extras este " + pagDeExtras + " counter e " + myCounter)
                        break;
                    }

                    // var pagDeExtras = myCounter;
                    // break; // ne-am gasit intervalul, iesi din "for"
                }
            } else if (ratia_final <= myRatia[0]) {
                // alert("7 " + ratia_final <= myRatia[0])
                var pagDeExtras = 0;
                break;
            }

        }
        // alert("pag de extras are nr "+pagDeExtras)
        /////***********************************************************************************************************cauta ratia end */



        ////************************************************************************************************************* extract page */
        var myPageNames = new Array;
        for (myCounter = 0; myCounter < app.documents[0].pages.length; myCounter++) {
            myPageNames.push(app.documents[0].pages.item(myCounter).name);
        }

        // alert(myPage_length)

        // var pagDeExtras = 1 //************!!! */
        for (var i = myPage_length - 1; i >= 0; i--) {



            if (i > pagDeExtras) { //|| i > pagDeExtras
                // alert("i mai mare este " + i)

                myPages[i].remove();
            }
            if (i < pagDeExtras) {

                // alert(i)
                // alert("i mai mic este " + i)
                myPages[i].remove();

            }
        }
        // var numarRatieRotunjit = Number(Math.round((myRatia[pagDeExtras]) + 'e1') + 'e-1')
        // var ratia_final = ratia_final_zecimale.toFixed(2);
        var numarRatieRotunjit_u = Number(myRatia[pagDeExtras])
        var numarRatieRotunjit = numarRatieRotunjit_u.toFixed(2);
        var numeRatieFolder1 = numarRatieRotunjit.toString();
        var numeRatieFolder = numeRatieFolder1.replace(/\./g, "_");
        // alert("numeRatieFolder " + numeRatieFolder)
        // 3.2565547885
        // Number(Math.round(3.2565547885+'e2')+'e-2')

        var myFile_calea = app.documents[0].filePath;
        // alert("calea e "+myFile_calea)	
        var myFileName_full = app.documents[0].fullName + "";
        var myFileName = app.documents[0].name + "";

        var myFileName_full_length = myFileName_full.length
        var myFileName_length = myFileName.length

        var f = new Folder(myFile_calea + "/" + ("_ratia_" + (numeRatieFolder)));
        f.create();

        // var savedocname = "_Pg_nr_" + (pagDeExtras + 1) + "_.indd";

        var finalFileName = finalFileName.replace(/\./g, "_");
        var finalFileName = finalFileName.replace(/\,/g, "_");
        var finalFileName = finalFileName.replace(/\:/g, "_");
        var finalFileName = finalFileName.replace(/\;/g, "_");
        var finalFileName = finalFileName.replace(/`/g, "_");
        var finalFileName = finalFileName.replace(/\!/g, "_");
        var finalFileName = finalFileName.replace(/\?/g, "_");
        var finalFileName = finalFileName.replace(/\>/g, "_");
        var finalFileName = finalFileName.replace(/\</g, "_");
        var finalFileName = finalFileName.replace(/\//g, "_");
        var finalFileName = finalFileName.replace(/\[/g, "_");
        var finalFileName = finalFileName.replace(/\\/g, "_");
        var finalFileName = finalFileName.replace(/\|/g, "_");
        var finalFileName = finalFileName.replace(/\]/g, "_");
        var finalFileName = finalFileName.replace(/\{/g, "_");
        var finalFileName = finalFileName.replace(/\}/g, "_");
        var finalFileName = finalFileName.replace(/\*/g, "_");
        var finalFileName = finalFileName.replace(/\^/g, "_");
        var finalFileName = finalFileName.replace(/\$/g, "_");
        var finalFileName = finalFileName.replace(/\&/g, "_");
        var finalFileName = finalFileName.replace(/\"/g, "_");
        var finalFileName = finalFileName.replace(/\'/g, "_");


        // var savedocname = finalFileName + "_.indd";
        // var savedoc = myDocument.save(File(myFile_calea + "/" + ("_ratia_" + (numeRatieFolder)) + "/" + savedocname));


        // ************************************************************************************************************ MAI JOS SE FAC OPERATII PE PAGINA */


        // app.activeDocument = app.documents[0];
        scaleDocument(vizibil_W, vizibil_H, total_W, total_H);
        // expandToPageBounds(0);
        resizeDocument(total_W, total_H);
        // var idNumar = readedLine[0]
        idsimargineDocument(vizibil_W, vizibil_H, total_W, total_H, idNumar);
        aliniereHwDocument(vizibil_W, vizibil_H, total_W, total_H);






        // ************************************************************************************************************ MAI SUS SE FAC OPERATII PE PAGINA */
        var savedocname = finalFileName + "_.indd";
        var savedoc = myDocument.save(File(myFile_calea + "/" + ("_ratia_" + (numeRatieFolder)) + "/" + savedocname));
        savedoc.close(SaveOptions.no);
        // alert("document close")

        ////************************************************************************************************************* extract page END */


        ////************************************************************************************************************* OPEN MASTER AGAIN  */
        app.open(File(myFile_calea + "/" + myFileName), false);
        // var myDocument = app.open(File("/c/myTestDocument.indd"), false);!!!



    }
    //************************************************************************************************************* END ------ CITESTE DOC TEXT  */


}
//******************************************************************************************************************* START!! ------ FUNCTII



function scaleDocument(vizibil_W, vizibil_H, total_W, total_H) {
    // alert("idNumar "+idNumar+"\n"+"vizibil_W_mm "+vizibil_W_mm+"\n"+"vizibil_H_mm "+vizibil_H_mm+"\n"+"total_W_mm "+total_W_mm+"\n"+"total_H_mm "+total_H_mm)
    // alert("scaleDocument")
    // myPage = app.documents.item(0).pages.item(0);
    // app.activeDocument = app.documents[0];
    myPage = app.documents[0].pages.item(0);
    // app.documents.item(0).viewPreferences.rulerOrigin = RulerOrigin.SPINE_ORIGIN;
    // app.documents.item(0).zeroPoint = [0, 0];

    // myPage.layoutRule = LayoutRuleOptions.SCALE;
    // myPage.resize(
    //         CoordinateSpaces.INNER_COORDINATES,
    //         AnchorPoint.CENTER_ANCHOR,
    //         ResizeMethods.REPLACING_CURRENT_DIMENSIONS_WITH,
    //         [Number(vizibil_W), Number(vizibil_H)]
    //         // [Number(vizibil_W) / 0.3528, Number(vizibil_H) / 0.3528] //
    //         //*2.83464567
    //         );
    app.documents[0].zeroPoint = [0, 0];
    app.documents[0].viewPreferences.rulerOrigin = RulerOrigin.PAGE_ORIGIN;
    // app.activeDocument = app.documents[0];!!!!!
    // app.activeWindow.transformReferencePoint = AnchorPoint.CENTER_ANCHOR; 
    AnchorPoint.CENTER_ANCHOR,
        pages = app.documents[0].pages
    pages[0].marginPreferences.properties = { top: 0, left: 0, bottom: 0, right: 0 };
    pages[0].layoutRule = LayoutRuleOptions.SCALE;
    // pages[0].layoutRule = LayoutRuleOptions.OFF; 
    pages[0].resize(CoordinateSpaces.SPREAD_COORDINATES,
        AnchorPoint.CENTER_ANCHOR,
        ResizeMethods.REPLACING_CURRENT_DIMENSIONS_WITH,
        [vizibil_W, vizibil_H])

    ///***** */





    // vizibil_W_q=vizibil_W/2.8346438836889;
    // vizibil_H_q=vizibil_H/2.8346438836889;
    // total_Wq=total_W/2.8346438836889;
    // total_Hq=total_H/2.8346438836889;
    //     alert(" w vizibil pt "+" este "+vizibil_W_q+" h vizibil pt "+vizibil_H_q+" w t pt "+" este "+total_Wq+" h t pt "+total_Hq);
    ////** */
                    // myPage = app.documents[0].pages.item(0);
                    // with (myPage) {
                    //     app.documents[0].activeLayer = app.documents[0].layers.itemByName("vizibil");
                    //     guides.add(undefined, { orientation: HorizontalOrVertical.vertical, location: myPage.bounds[1] });
                    //     guides.add(undefined, { orientation: HorizontalOrVertical.vertical, location: myPage.bounds[3] });
                    //     guides.add(undefined, { orientation: HorizontalOrVertical.horizontal, location: myPage.bounds[0] });
                    //     guides.add(undefined, { orientation: HorizontalOrVertical.horizontal, location: myPage.bounds[2] });

                    //     // guides.add(undefined, {orientation: HorizontalOrVertical.vertical, location: myPage.bounds[1]});
                    //     // guides.add(undefined, {orientation: HorizontalOrVertical.vertical, location: myPage.bounds[3]});
                    //     // guides.add(undefined, {orientation: HorizontalOrVertical.horizontal, location: myPage.bounds[0]});
                    //     // guides.add(undefined, {orientation: HorizontalOrVertical.horizontal, location: myPage.bounds[2]});

                    //     //**** */

                    // }



}



function resizeDocument(total_W, total_H) {
    // alert("idNumar "+idNumar+"\n"+"vizibil_W_mm "+vizibil_W_mm+"\n"+"vizibil_H_mm "+vizibil_H_mm+"\n"+"total_W_mm "+total_W_mm+"\n"+"total_H_mm "+total_H_mm)
    // alert("resizeDocument")
    // myPage = app.documents.item(0).pages.item(0);
    // app.documents.item(0).viewPreferences.rulerOrigin = RulerOrigin.SPINE_ORIGIN;
    // app.documents.item(0).zeroPoint = [0, 0];
    // myPage.layoutRule = LayoutRuleOptions.OFF;


    // myPage.resize(
    //         CoordinateSpaces.INNER_COORDINATES,
    //         AnchorPoint.CENTER_ANCHOR,
    //         ResizeMethods.REPLACING_CURRENT_DIMENSIONS_WITH,
    //         [Number(total_W) , Number(total_H) ]
    //         // [Number(total_W) / 0.3528, Number(total_H) / 0.3528]
    //         //*2.83464567
    //         );


    // pages = app.documents[0].pages ///app.activeDocument
    // app.activeDocument = app.documents[0];
    pages = app.documents[0].pages ///app.activeDocument
    pages[0].marginPreferences.properties = { top: 0, left: 0, bottom: 0, right: 0 };
    //pages[0].layoutRule = LayoutRuleOptions.SCALE;
    pages[0].layoutRule = LayoutRuleOptions.OFF;
    pages[0].resize(CoordinateSpaces.SPREAD_COORDINATES,
        AnchorPoint.CENTER_ANCHOR,
        ResizeMethods.REPLACING_CURRENT_DIMENSIONS_WITH,
        [total_W, total_H])




}



function idsimargineDocument(vizibil_W, vizibil_H, total_W, total_H, idNumar) {
    // alert("idNumar "+idNumar+"\n"+"vizibil_W_mm "+vizibil_W_mm+"\n"+"vizibil_H_mm "+vizibil_H_mm+"\n"+"total_W_mm "+total_W_mm+"\n"+"total_H_mm "+total_H_mm)
    // alert("idsimargineDocument")
    // app.activeDocument = app.documents[0];
    try {
    app.documents[0].activeLayer = app.documents[0].layers.itemByName("id");
}
catch (e) { }
    // pages = app.activeDocument.pages
    myPage = app.documents[0].pages.item(0);
    var textFrame = myPage.textFrames.add(); // ID ul
    var textFrame_info = myPage.textFrames.add();
    var y1, x1, y2, x2;

    y1 = Number((total_H - vizibil_H) / 2) + Number(vizibil_H);
    x1 = Number((total_W - vizibil_W) / 2);

    y2 = Number((total_H - vizibil_H) / 2) + Number(vizibil_H) + 11;
    x2 = Number((total_W - vizibil_W) / 2) + 56;

    //alert("y1 = " + y1 + "\n" + "x1 = " + x1 + "\n" + "y2 = " + y2 + "\n" + "x2 = " + x2);

    textFrame.geometricBounds = [y1, x1, y2, x2]; //  ID ul
    if (idNumar == "noid") {
        textFrame.contents = " "; //
    }
    else {
        textFrame.contents = "ID " + idNumar; //
    }
    var myText_id = textFrame.parentStory.paragraphs.item(0)
    // watermarkFontFamily = "Arial";

    try {
        appliedFont = app.fonts.item("Helvetica");
        myText_id.appliedFont = app.fonts.item("Helvetica");
    }
    catch (e) { }
    //Because the font style might not be available, it's usually best
    //to apply the font style within a try...catch structure.
    try {
        fontStyle = "Light";
        myText_id.fontStyle = "Light";
        myText_id.pointSize = 8;
    }
    catch (e) { }

    textFrame.label = "IDul";
    textFrame.fit(FitOptions.FRAME_TO_CONTENT)
    textFrame.move([x1 + 5.67, y1 - 11.34]); //total_H + 15 ///2.83464567 2 mm = 5.67




    // myText_id.FontFamily = "Helvetica";
    // myText_id.fontStyle = "Light";
    // myText_id.pointSize = 8;
    // alert(idNumar)

    // x_idTextFrame = ((total_W - vizibil_W) / 2 + 8.64)
    // y_idTextFrame = (((total_H - vizibil_H) / 2) + vizibil_H - 15.35)
    // textFrame.move([x_idTextFrame,y_idTextFrame]);


    // textFrame.geometricBounds = [Number(vizibil_H) - 2, Number((total_W - vizibil_W) / 2) + Number(2), Number(vizibil_H) + Number(2), 58];
    // var boxStile = myDocument.objectStyles.item(styleName3);
    //     boxStile.name;
    // textFrame.contents = "ID " + readedLine[5].split("_")[0];
    // textFrame.contents = "ID " + readedLine[0]; //idNumar

    // textFrame.applyObjectStyle(boxStile);
    // var boxParagraphStile = myDocument.paragraphStyles.item(styleName4);
    // textFrame.parentStory.texts.item(0).applyParagraphStyle(boxParagraphStile, true); 



    textFrame_info.contents = "W vizibil = " + vizibil_W_mm + "\n" + "H vizibil = " + vizibil_H_mm + "\n" + "W total = " + total_W_mm + "\n" + "H total = " + total_H_mm + "\n";
    textFrame_info.label = "Info";
    var myText = textFrame_info.parentStory.paragraphs.item(0)
    myText.fontStyle = "Regular";
    myText.pointSize = 20;
    textFrame_info.fit(FitOptions.FRAME_TO_CONTENT)
    textFrame_info.move([total_W + 20, 0]); //total_H + 15




    // expandToPageBounds(bleed);

    /************* */
    // total_H
    // total_W
    // vizibil_H
    // vizibil_W
    var m_top = (total_H - vizibil_H) / 2;
    var m_left = (total_W - vizibil_W) / 2;
    var m_right = m_left;
    var m_bottom = m_top;

    m_topq = m_top / 2.83464567;
    m_leftq = m_left / 2.83464567;
    // alert(" m_top "+m_topq+" m_left "+m_leftq);

    // myPage = app.documents.item(0).pages.item(0);
    // app.activeDocument.pages
    // app.activeDocument = app.documents[0];
    myPage = app.documents[0].pages.item(0);
    myPage.marginPreferences.properties = {
        top: m_top,
        left: m_left,
        right: m_right,
        bottom: m_bottom
    };
    // var myRectangle_ptvizibil;
    app.documents[0].activeLayer = app.documents[0].layers.itemByName("vizibil");
    var myItem_vizibil = myPage.rectangles.add({ geometricBounds: [m_top, m_left, m_top + vizibil_H, m_left + vizibil_W] });
    // var myItem_vizibil = myPage.rectangles.add({geometricBounds:[50, 50, 50+vizibil_H, 50+vizibil_W]});
    // myRectangle_ptvizibil = myPage.rectangles.add({geometricBounds:[m_top, m_left, m_top+vizibil_H, m_left+vizibil_W]});
    myItem_vizibil.label = "Vizibil";
    myItem_vizibil.fillColor = "None";
    myItem_vizibil.strokeColor = "None";
    // myRectangle_ptvizibil = app.selection[0];
    //    var currentfilename= app.activeDocument
    //             vizibil_W_q=vizibil_W/2.8346438836889;
    // vizibil_H_q=vizibil_H/2.8346438836889;
    // total_Wq=total_W/2.8346438836889;
    // total_Hq=total_H/2.8346438836889;
    //     alert(" w vizibil pt "+" este "+vizibil_W_q+" h vizibil pt "+vizibil_H_q+" w t pt "+" este "+total_Wq+" h t pt "+total_Hq);

    /************* */


}


function aliniereHwDocument(vizibil_W, vizibil_H, total_W, total_H) {


    // app.activeDocument.pages
    // app.activeDocument = app.documents[0];
    app.documents[0].activeLayer = app.documents[0].layers.itemByName("HW");
    myPage = app.documents[0].pages.item(0);
    b_pgebounds = myPage.bounds;

    w_t = b_pgebounds[3] - b_pgebounds[1];
    h_t = b_pgebounds[2] - b_pgebounds[0];
    // alert("w_t "+w_t+"\n"+"h_t "+h_t+"\n"+"idNumar "+idNumar+"\n"+"vizibil_W_mm "+vizibil_W_mm+"\n"+"vizibil_H_mm "+vizibil_H_mm+
    // "\n"+"total_W_mm "+total_W_mm+"\n"+"total_H_mm "+total_H_mm)
    var m_left = myPage.marginPreferences.left; //mmyX2
    var m_right = myPage.marginPreferences.right; //mmyX1
    var m_top = myPage.marginPreferences.top; //mmyy2
    var m_bottom = myPage.marginPreferences.bottom; //mmyy1
    w = w_t - (2 * m_left)
    h = h_t - (2 * m_top)
    // alert(m_left/2.8346438836889+" "+" "+m_top/2.8346438836889)

    // /2.8346438836889

    HW_h_final = (h * 0.1);
    SAIZECI_Hwai = (HW_h_final * 0.6) // 60% din inaltime lui h
    // Y_HW_final = (h-HW_h_final+2*mmyy2);
    Y_HW_final = (m_top + h - (h * 0.1));
    // Y_HW_final = (h-HW_h_final);
    Y_HW_final_latotal = (h - HW_h_final) + ((h_t - h) / 2);
    // app.activeDocument.pages
    var myHW = app.documents[0].rectangles.itemByName("hwul");// HW
    var myHWai = app.documents[0].rectangles.itemByName("hwul").rectangles.itemByName("hwaiul"); // ai ul din HW!!!

    myHW.redefineScaling([1, 1]);
    myHWai.redefineScaling([1, 1]);


    // myHW.move([mmyX2, Y_HW_final]);

    myHW.geometricBounds = [Y_HW_final, m_left, h + m_top, w + m_left];//succes
    app.documents[0].align(myHWai, AlignOptions.HORIZONTAL_CENTERS, AlignDistributeBounds.MARGIN_BOUNDS);
    myHW.fit(FitOptions.CENTER_CONTENT);

    var myBoundsw = myHW.geometricBounds;  // HW dreptunghi alb
    var myYw = myBoundsw[0];
    var myXw = myBoundsw[1];
    var myHw = myBoundsw[2];
    var myWw = myBoundsw[3];
    var W_hw = myHW.geometricBounds[3] - myHW.geometricBounds[1]
    var H_hw = myHW.geometricBounds[2] - myHW.geometricBounds[0];

    // if (w > h) { // landscape
    var myBoundsw = myHWai.geometricBounds;  // HW dreptunghi alb
    var myYwai = myBoundsw[0];
    var myXwai = myBoundsw[1];
    var myHwai = myBoundsw[2];
    var myWwai = myBoundsw[3];
    var W_hwai = myHWai.geometricBounds[3] - myHWai.geometricBounds[1]
    var H_hwai = myHWai.geometricBounds[2] - myHWai.geometricBounds[0];
    var obj = myHWai
    // var anchor = app.activeWindow.transformReferencePoint;
    var anchor = AnchorPoint.CENTER_ANCHOR;
    var ow = obj.geometricBounds[3] - obj.geometricBounds[1]
    var oh = obj.geometricBounds[2] - obj.geometricBounds[0];

    if (w > h) { // landscape //H_hwai>h-(h*0.1)
        // alert("landscape")
        var pw = HW_h_final * 0.7 / H_hwai;
        var ph = pw;
        var matrix = app.transformationMatrices.add({ horizontalScaleFactor: pw, verticalScaleFactor: ph });
        obj.transform(CoordinateSpaces.pasteboardCoordinates, anchor, matrix);

        // myHWai.geometricBounds = [Y_HW_final, m_left, h + m_top, w + m_left];//succes

    }
    if (w < h) { // portrait //W_hwai>w-(w*0.1)
        // alert("portret")
        myHW.redefineScaling([1, 1]);
        myHWai.redefineScaling([1, 1]);
        var pw = W_hw * 0.8 / W_hwai;
        var ph = pw;
        var matrix = app.transformationMatrices.add({ horizontalScaleFactor: pw, verticalScaleFactor: ph });
        obj.transform(CoordinateSpaces.pasteboardCoordinates, anchor, matrix);

        // myHWai.geometricBounds = [Y_HW_final, m_left, h + m_top, w + m_left];//succes
    }
    var myBoundsw = myHWai.geometricBounds;  // HW dreptunghi alb
    var myYwai = myBoundsw[0];
    var myXwai = myBoundsw[1];
    var myHwai = myBoundsw[2];
    var myWwai = myBoundsw[3];
    var W_hwai = myHWai.geometricBounds[3] - myHWai.geometricBounds[1]
    var H_hwai = myHWai.geometricBounds[2] - myHWai.geometricBounds[0];
    if (W_hwai > w - (w * 0.1)) { // portrait //W_hwai>w-(w*0.1)
        // alert("ratia pe langa 1")
        myHW.redefineScaling([1, 1]);
        myHWai.redefineScaling([1, 1]);
        var pw = W_hw * 0.8 / W_hwai;
        var ph = pw;
        var matrix = app.transformationMatrices.add({ horizontalScaleFactor: pw, verticalScaleFactor: ph });
        obj.transform(CoordinateSpaces.pasteboardCoordinates, anchor, matrix);

        // myHWai.geometricBounds = [Y_HW_final, m_left, h + m_top, w + m_left];//succes
    }



    myHWai.fit(FitOptions.CENTER_CONTENT);
    // myHWai.fit(FitOptions.PROPORTIONALLY);
    myHW.fit(FitOptions.CENTER_CONTENT);
    // myHW.fit(FitOptions.PROPORTIONALLY);

    myHW.geometricBounds = [Y_HW_final_latotal, -14.17322835, h_t + 14.17322835, w_t + 14.17322835];



    ////***********************************************************************       ALINIERE ELEMENTE STANGA DREAPTA, FIT  *********************************************/


    var myFrames = myDocument.rectangles;

    //***-****** aliniere margini = vizibil


    var count = 0
    for (var i = 0; i < myFrames.length; i++) {
        if (myFrames[i].label == "alignRightLaVizibil") {
            // alert ("match"); // you changes here  
            count++
            // myFrames[i].move([0, 50]);
            app.documents[0].align(myFrames[i], AlignOptions.RIGHT_EDGES, AlignDistributeBounds.MARGIN_BOUNDS); // margin bounds e la marginile paginii adica la vizibil!!!
            if (count == 4) {
                break;

            }


        }
    }
    var count = 0
    for (var i = 0; i < myFrames.length; i++) {
        if (myFrames[i].label == "alignLeftLaVizibil") {
            // alert ("match"); // you changes here  
            count++
            // myFrames[i].move([0, 50]);
            app.documents[0].align(myFrames[i], AlignOptions.LEFT_EDGES, AlignDistributeBounds.MARGIN_BOUNDS); // margin bounds e la marginile paginii adica la vizibil!!!
            if (count == 4) {
                break;

            }


        }
    }
    var count = 0
    for (var i = 0; i < myFrames.length; i++) {
        if (myFrames[i].label == "alignUpLaVizibil") {
            // alert ("match"); // you changes here  
            count++
            // myFrames[i].move([0, 50]);
            app.documents[0].align(myFrames[i], AlignOptions.TOP_EDGES, AlignDistributeBounds.MARGIN_BOUNDS); // margin bounds e la marginile paginii adica la vizibil!!!
            if (count == 4) {
                break;

            }


        }
    }
    var count = 0
    for (var i = 0; i < myFrames.length; i++) {
        if (myFrames[i].label == "alignDownLaVizibil") {
            // alert ("match"); // you changes here  
            count++
            // myFrames[i].move([0, 50]);
            app.documents[0].align(myFrames[i], AlignOptions.BOTTOM_EDGES, AlignDistributeBounds.MARGIN_BOUNDS); // margin bounds e la marginile paginii adica la vizibil!!!
            if (count == 4) {
                break;

            }


        }
    }
     //***-****** aliniere margini = vizibil


    var count = 0
    for (var i = 0; i < myFrames.length; i++) {
        if (myFrames[i].label == "alignRightLaPagina") {
            // alert ("match"); // you changes here  
            count++
            // myFrames[i].move([0, 50]);
            app.documents[0].align(myFrames[i], AlignOptions.RIGHT_EDGES, AlignDistributeBounds.PAGE_BOUNDS); // PAGE bounds 
            if (count == 4) {
                break;

            }


        }
    }


    var count = 0
    for (var i = 0; i < myFrames.length; i++) {
        if (myFrames[i].label == "alignLeftLaPagina") {
            // alert ("match"); // you changes here  
            count++
            // myFrames[i].move([0, 50]);
            app.documents[0].align(myFrames[i], AlignOptions.LEFT_EDGES, AlignDistributeBounds.PAGE_BOUNDS);

            if (count == 4) {
                break;
            }
        }
    }
    //AlignOptions.HORIZONTAL_CENTERS

    var count = 0
    for (var i = 0; i < myFrames.length; i++) {
        if (myFrames[i].label == "alignHorizontalCenter") {
            // alert ("match"); // you changes here  
            count++
            // myFrames[i].move([0, 50]);
            app.documents[0].align(myFrames[i], AlignOptions.HORIZONTAL_CENTERS, AlignDistributeBounds.MARGIN_BOUNDS);

            if (count == 4) {
                break;
            }
        }
    }


    var count = 0
    for (var i = 0; i < myFrames.length; i++) {
        if (myFrames[i].label == "alignVerticalCentersMinusHW") {
            // alert ("match"); // you changes here  
            count++
            // myFrames[i].move([0, 50]);
            app.documents[0].align(myFrames[i], AlignOptions.VERTICAL_CENTERS, AlignDistributeBounds.MARGIN_BOUNDS);
            var myPage = app.documents[0].pages.item(0);
            // var myPage = app.activeWindow.activePage;
            var b = myPage.bounds;
            var W_ = b[3] - b[1]; // 
            var H_ = b[2] - b[0]; // 

            var myBoundsFrame = myFrames[i].geometricBounds;  // HW dreptunghi alb
            var myYF = myBoundsFrame[0];
            var myXF = myBoundsFrame[1];
            var myHF = myBoundsFrame[2];
            var myWF = myBoundsFrame[3];
            var W_hF = myWF - myXF;
            var H_hF = myHF - myYF;
            var moveFrame = (H_ - (H_ * 0.1)) / 2 - (H_hF / 2)
            //  (H_-(H_*0.1)-H_hF)
            myFrames[i].move([myXF, moveFrame])
            if (count == 4) {
                break;
            }
        }
    }

    var count = 0
    for (var i = 0; i < myFrames.length; i++) {
        if (myFrames[i].label == "expandToVizibil") {  // to page          
            // alert ("match expand"); // you changes here  
            count++
            var myPage = app.documents[0].pages.item(0);


            // myPage.marginPreferences.properties = {
            //     top: m_top,
            //     left: m_left,
            //     right: m_right,
            //     bottom: m_bottom
            // };
            var m_top = myPage.marginPreferences.properties.top;
            var m_left = myPage.marginPreferences.properties.left;
            var m_right = myPage.marginPreferences.properties.right;
            var m_bottom = myPage.marginPreferences.properties.bottom;

            var b = myPage.bounds;
            var W_ = b[3] - b[1]; // 
            var H_ = b[2] - b[0]; // 
            // alert("  "+H_/2.83464567 +"  "+ W_)
            myFrames[i].geometricBounds = [m_top, m_left, H_ - m_bottom, W_ - m_right]; //succes

            // app.documents[0].align( myFrames[i], AlignOptions.LEFT_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);

            if (count == 4) {
                break;
            }

        }
    }

    var count = 0
    for (var i = 0; i < myFrames.length; i++) {
        if (myFrames[i].label == "expandToBleed") {  // to page          
            // alert ("match expand"); // you changes here  

            // myFrames[i].move([0, 50]);
            // var currentPage = app.activeWindow.activePage;
            // var myPage = app.activeWindow.activePage;
            var myPage = app.documents[0].pages.item(0);
            // var myBleed = myPage.documentPreferences.properties.bleed;
            count++
            var b = myPage.bounds;
            var W_ = b[3] - b[1]; // 
            var H_ = b[2] - b[0]; // 
            // alert("  "+H_/2.83464567 +"  "+ W_)
            myFrames[i].geometricBounds = [-14.174, -14.174, H_ + 14.174, W_ + 14.174]; //succes // 14.174

            // app.documents[0].align( myFrames[i], AlignOptions.LEFT_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);

            if (count == 4) {
                break;
            }

        }
    }
    ////***********************************************************************  END     ALINIERE ELEMENTE STANGA DREAPTA, FIT  *********************************************/


    myPage = app.documents[0].pages.item(0);
    with (myPage) {
        var m_top = myPage.marginPreferences.properties.top;
        var m_left = myPage.marginPreferences.properties.left;
        var m_right = myPage.marginPreferences.properties.right;
        var m_bottom = myPage.marginPreferences.properties.bottom;
        var b = myPage.bounds;
        var W_ = b[3] - b[1]; // 
        var H_ = b[2] - b[0]; // 
    
        app.documents[0].activeLayer = app.documents[0].layers.itemByName("vizibil");
        guides.add(undefined, { orientation: HorizontalOrVertical.vertical, location: (W_-m_right) });
        guides.add(undefined, { orientation: HorizontalOrVertical.vertical, location: m_left }); // ok
        guides.add(undefined, { orientation: HorizontalOrVertical.horizontal, location: m_top }); // ok
        guides.add(undefined, { orientation: HorizontalOrVertical.horizontal, location: (H_-m_bottom) });
    
        // guides.add(undefined, {orientation: HorizontalOrVertical.vertical, location: myPage.bounds[1]});
        // guides.add(undefined, {orientation: HorizontalOrVertical.vertical, location: myPage.bounds[3]});
        // guides.add(undefined, {orientation: HorizontalOrVertical.horizontal, location: myPage.bounds[0]});
        // guides.add(undefined, {orientation: HorizontalOrVertical.horizontal, location: myPage.bounds[2]});
    
        //**** */
    
    }





    ///************* lock layers + active layer */

    try {
        // app.documents[0].layers.item('Layer 1').name = 'art';
        // app.documents[0].activeLayer = app.documents[0].layers.itemByName("Layer_lucru");
        app.documents.item(0).layers.itemByName("id").locked ^= 1;
        // app.documents.item(0).layers.itemByName("Guides").locked ^= 1;
        app.documents.item(0).layers.itemByName("vizibil").locked ^= 1;
        app.documents.item(0).layers.itemByName("HW").locked ^= 1;

    } catch (e) {
        // alert(e);


    }





    ///************* lock layers */

}






//******************************************************************************************************************* END!! ------ FUNCTII
//************************************************************************************************************* END ------ script
app.scriptPreferences.userInteractionLevel = UserInteractionLevels.INTERACT_WITH_ALL;
// app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS; 
app.documents[0].viewPreferences.horizontalMeasurementUnits = MeasurementUnits.millimeters;
app.documents[0].viewPreferences.verticalMeasurementUnits = MeasurementUnits.millimeters;

progressWin.close();
app.documents[0] = app.documents[0];
app.documents[0].close();
alert("job done.")