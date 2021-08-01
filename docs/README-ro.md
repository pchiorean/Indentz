# Indentz

Colecție de scripturi InDesign pentru operații simple și repetitive. Ideal, o parte din ele ar trebui invocate printr‑un shortcut (**Edit > Keyboard Shortcuts... > Product Area > Scripts**; sugestii sub fiecare secțiune).

---

###### [Alignment/Proxy](#alignmentproxy) | [Export](#export) | [File](#file) | [Fitting](#fitting) | [Scaling](#scaling) | [Setup](#setup) | [View](#view) | [Miscellaneous](#miscellaneous) | [Instalare](#instalare) | [Despre](#about)

---

## Descriere

### **Alignment/Proxy**

Facilitează alinierea obiectelor sau setarea punctului de referință pentru transformări folosind shortcuturi.

* **`AlignTo`** aliniază obiectele selectate la referința setării **Align To**:

  ![Align Panel screenshot](img/alignto.png)

* **`ToggleAlignTo.jsx`** comută alinierea între obiect, margini, pagină sau spread (rulați scriptul în mod repetat).

* **`ResetAlignTo.jsx`** o resetează la **Align to Selection**.

* **`SetRefPoint`** schimbă punctul de referință pentru transformări, similar cu selectarea pătrățelelor proxy în paleta **Transform**.

**Notă:** Aceste două seturi nu au nici un sens dacă nu sunt asociate tastaturii numerice.

<details><summary><strong>Shortcuturi</strong></summary>

Alignment | | | | | | | |
:- | -: | :- | -: | :- | -: | :- | -:
**AlignToTL.jsx** | Num7 | **AlignToT.jsx** | Num8 | **AlignToTR.jsx** | Num9 | **ToggleAlignTo.jsx** | Num0
**AlignToL.jsx** | Num4 | **AlignToC.jsx** | Num5 | **AlignToR.jsx** | Num6 | **ResetAlignTo.jsx** | ⌃Num0
**AlignToBL.jsx** | Num1 | **AlignToB.jsx** | Num2 | **AlignToBR.jsx** | Num3

Proxy | | | | | |
:- | -: | :- | -: | :- | -:
**SetRefPointTL.jsx** | ⌃Num7 | **SetRefPointT.jsx** | ⌃Num8 | **SetRefPointTR.jsx** | ⌃Num9
**SetRefPointL.jsx** | ⌃Num4 | **SetRefPointC.jsx** | ⌃Num5 | **SetRefPointR.jsx** | ⌃Num6
**SetRefPointBL.jsx** | ⌃Num1 | **SetRefPointB.jsx** | ⌃Num2 | **SetRefPointBR.jsx** | ⌃Num3

</details>

---

### **Export**

* **`QuickExport.jsx`** exportă în PDF toate documentele deschise sau documentele dintr‑un folder, cu până la două preseturi configurabile. Fără documente deschise, puteți selecta un folder pentru procesarea în serie:

  ![Quick export](img/quickexport.png)

  Textul din câmpul **Suffix** va fi adăugat la numele fișierului exportat (e autodetectat dacă numele presetului se termină cu "_*sufix*"). Dacă **Export in subfolders** e activ, sufixul va fi folosit și pentru numele subfolderului.

  Pentru comoditate, câteva opțiuni de export sunt direct accesibile: export ca pagini/spreaduri, crop mark‑uri, page information, slug area; de asemenea, se poate seta un alt bleed.

  Opțional, poate rula un JavaScript sau AppleScript înainte de export, de exemplu unul din următoarele:

* **`PrepareForExport.jsx`** ascunde stratul **visible area** și mută ștanțele și marcajele pentru alb, foil și lac UV de pe **dielines** / **white** / **foil** / **varnish** pe spreaduri separate.

* **`VisibleArea.jsx`** creează un chenar de dimensiunea marginilor paginii pe stratul **visible area**. Folosește culoarea **Visible area**, care dacă nu există va fi creată cu valoarea "C=0 M=100 Y=0 K=0".

* **`VisibleAreaHideLayer.jsx`** și **`VisibleAreaShowLayer.jsx`** ascund sau afișează **visible area**.

**Notă:** Aceste scripturi detectează straturi cu denumiri similare pentru **visible area** (**visible**, **vizibil**), **dielines** (**diecut**, **die cut**, **cut lines**, **stanze**) etc.

<details><summary><strong>Shortcuts</strong></summary>

Export | |
:- | -:
**QuickExport.jsx** | ⌃E

</details>

---

### **File**

* **`FilesToSpreads.jsx`** combină documentele deschise, sortate alfabetic.

* **`SpreadsToFiles.jsx`** salvează fiecare spread al documentului activ într‑un fișier separat. Sufixul va fi autodetectat dacă numele documentului se termină cu un separator (spațiu, punct, linie de subliniere sau cratimă) urmat de o secvență de cifre sau litere egală cu numărul de spreaduri (de exemplu, un document `file_ABC.indd` cu trei spreaduri va fi separat în `file_A.indd`, `file_B.indd` și `file_C.indd`).

---

### **Fitting**

Redimensionează obiectele selectate, fără să le scaleze. Chenarele obișnuite sunt redimensionate pur și simplu; obiectele rotite, ovalurile, grupurile etc sunt incluse într‑un container *(clipping frame)* și acesta e redimensionat.

* **`FitToPage`** și **`FitToSpread`**: dacă obiectul este mai mare, va fi redus; dacă este mai mic dar intră într‑o zonă „snap” de 1%, va fi mărit.

  **`FitTo...Forced`** redimensionează exact la dimensiunile respective.

* **`TextAutosize.jsx`** setează dimensionarea automată a chenarului de text de la **None** la **Height Only** și de la **Height Only** la **Height and Width** (rândurile singulare sunt setate întotdeauna **Height and Width**). Alinierea primului paragraf setează alinierea orizontală a chenarului; **Text Frame Options > Vertical Justification** setează alinierea verticală:

  | | ![¶ Align left](img/paragraphalign-L.png) | ![¶ Align center](img/paragraphalign-C.png) | ![¶ Align right](img/paragraphalign-R.png)
  :-: | :-: | :-: | :-:
  ![Vertical Justification Top](img/verticaljustification-T.png) | ![top-left](img/textautosize-TL.png) | ![top-center](img/textautosize-TC.png) | ![top-right](img/textautosize-TR.png)
  ![Vertical Justification Center](img/verticaljustification-C.png) | ![center-left](img/textautosize-CL.png) | ![center](img/textautosize-C.png) | ![center-right](img/textautosize-CR.png)
  ![Vertical Justification Bottom](img/verticaljustification-B.png) | ![bottom-left](img/textautosize-BL.png) | ![bottom-center](img/textautosize-BC.png) | ![bottom-right](img/textautosize-BR.png)

<details><summary><strong>Shortcuturi</strong></summary>

FitToPage | | FitToSpread | |
:- | -: | :- | -:
**FitToPage.jsx** | F11 | **FitToSpread.jsx** | F12
**FitToPageMargins.jsx** | ⌥F11 | **FitToSpreadMargins.jsx** | ⌥F12
**FitToPageVisibleArea.jsx** | ⌥⇧F11 | **FitToSpreadVisibleArea.jsx** | ⌥⇧F12
**FitToPageBleed.jsx** | ⇧F11 | **FitToSpreadBleed.jsx** | ⇧F12
**FitToPageForced.jsx** | ⌘F11 | **FitToSpreadForced.jsx** | ⌘F12
**FitToPageMarginsForced.jsx** | ⌥⌘F11 | **FitToSpreadMarginsForced.jsx** | ⌥⌘F12
**FitToPageVisibleAreaForced.jsx** | ⌥⇧⌘F11 | **FitToSpreadVisibleAreaForced.jsx** | ⌥⇧⌘F12
**FitToPageBleedForced.jsx** | ⇧⌘F11 | **FitToSpreadBleedForced.jsx** | ⇧⌘F12

**Notă:** `F11` pagină, `F12` spread; `⌥` margini, `⌥⇧` aria vizibilă, `⇧` bleed; `⌘` forțat.

TextAutosize | |
:- | -:
**TextAutosize.jsx** | F6

</details>

---

### **Scaling**

Scalează proporțional obiectele selectate, ca un bloc unitar.

* **`ScaleToPageSize.jsx`** și **`ScaleToPageMargins.jsx`** scalează la dimensiunile paginii sau marginii.

* Variantele **`H`** (height) și **`W`** (width) scalează la înălțimea, respectiv lățimea paginii sau marginii.

<details><summary><strong>Shortcuturi</strong></summary>

Scaling | |
:- | -:
**ScaleToPageSize.jsx** | F5
**ScaleToPageSizeH.jsx** | ^F5
**ScaleToPageMargins.jsx** | ⌥F5
**ScaleToPageMarginsH.jsx** | ^⌥F5

</details>

---

### **Setup**

Sunt două seturi: unul legat de preferințele documentului, straturi, culori și fonturi, iar celălalt de dimensiunea și marginile paginii.

#### **Document**

* **`DefaultPrefs.jsx`** setează câteva preferințe.

  <details><summary><strong>Detalii</strong></summary>

    > **Rulers:** Reset Zero Point \
    > **Rulers Units:** Millimeters \
    > **View:** Show Rulers \
    > **View:** Show Frame Edges \
    > **Document Intent:** Print \
    > **Transparency Blend Space:** CMYK \
    > **CMYK Profile:** ISO Coated v2 (ECI) \
    > **RGB Profile:** sRGB IEC61966-2.1 \
    > **Grids & Guides:** Show Guides \
    > **Grids & Guides:** Unlock Guides \
    > **Guides & Pasteboard: Preview Background:** Light Gray \
    > **Keyboard Increments: Cursor Key:** 0.2 mm \
    > **Keyboard Increments: Size/Leading:** 0.5 pt \
    > **Keyboard Increments: Baseline Shift:** 0.1 pt \
    > **Keyboard Increments: Kerning/Tracking:** 5/1000 em \
    > **Pages:** Allow Document Pages to Shuffle \
    > **Layers:** Ungroup Remembers Layers \
    > **Layers:** Paste Remembers Layers \
    > **Transform Reference Point:** Center \
    > **Type Options:** Use Typographer's Quotes \
    > **Type Options:** Apply Leading to Entire Paragraphs

  </details>

* **`DefaultLayers.jsx`** creează un set de straturi definite într‑un fișier TSV *(tab‑separated values)* numit [**`layers.txt`**](../layers.txt):

  Name | Color | Visible | Printable | Order | Variants
  :- | :-: | :-: | :-: | :-: | :-
  dielines | Magenta | yes | yes | above | cut\*, decoupe, die, die\*cut, stanz\*
  template | Gray | no | no | below
  ... |

  > **Name**: numele stratului \
  > **Color**: culoarea stratului (v. [**`UIColors.txt`**](UIColors.txt); implicit `Light Blue`) \
  > **Visible**: `yes` sau `no` (implicit `yes`) \
  > **Printable**: `yes` sau `no` (implicit `yes`) \
  > **Order**: `above` sau `below` (deasupra sau sub straturile existente; implicit `above`) \
  > **Variants**: o listă de straturi care vor fi combinate cu stratul de bază (case insensitive; sunt acceptate metacaracterele `*` și `?`)

* **`DefaultSwatches.jsx`** creează un set de culori definite într‑un fișier TSV numit [**`swatches.txt`**](../swatches.txt):

  Name | Color Model | Color Space | Values | Variants
  :- | :-: | :-: | :- | :-
  Rich Black | process | cmyk | 60 40 40 100
  RGB Grey | process | rgb | 128 128 128
  Cut | spot | cmyk | 0 100 0 0 | couper, diecut
  ... |

  > **Name**: numele culorii \
  > **Model**: tipul culorii: `process` sau `spot` \
  > **Values**: 3 valori în intervalul 0–255 (RGB) sau 4 valori în intervalul 0–100 (CMYK) \
  > **Variants**: o listă de culori care vor fi combinate cu culoarea de bază (case insensitive; sunt acceptate metacaracterele `*` și `?`)

* **`SaveSwatches.jsx`** salvează culorile din document într‑un fișier TSV compatibil cu **`DefaultSwatches.jsx`**.

* **`CleanupSwatches.jsx`** convertește culorile RGB la CMYK, le redenumește după formula "C= M= Y= K=", elimină duplicatele și le șterge pe cele nefolosite. Culorile spot rămân neschimbate.

* **`DeleteGuides.jsx`** șterge toate liniile de ghidaj din document.

* **`ReplaceFonts.jsx`** substituie fonturi dintr‑o listă definită într‑un fișier TSV numit [**`fonts.txt`**](../fonts.txt):

  Old font | Style | New font | Style
  :- | :- | :- | :-
  Arial | Regular | Helvetica Neue | Regular
  Arial | Bold | Helvetica Neue | Bold
  ... |

  Puteți utiliza **`ShowFonts.jsx`** din **Misc** pentru a obține o listă a fonturilor pentru copy‑paste.

* **`DocDefaults.jsx`** rulează **`DefaultPrefs.jsx`**, **`DefaultSwatches.jsx`**, **`DefaultLayers.jsx`**, **`ReplaceFonts.jsx`**, **`PageSizeFromFilename.jsx`**, extinde pasteboardul.

* **`DocCleanup.jsx`** rulează **`DefaultPrefs.jsx`**, șterge culorile, straturile și paginile neutilizate, deblochează toate elementele și le resetează scalarea la 100%, convertește chenarele goale de text în chenare simple, compactează pasteboardul.

**Notă:** Fișierul poate fi plasat în folderul curent, pe desktop sau lângă script. Liniile goale și cele care încep cu `#` sunt ignorate. Puteți include un alt fișier inserând **`@path/to/file.txt`** în poziția dorită (fișierul implicit poate fi referit prin **`@default`**).

---

#### **Layout**

* **`PageMarginsFromSelection.jsx`** setează marginile paginii la dimensiunile selecției.

* **`PageSizeFromFilename.jsx`** setează dimensiunea paginii și a ariei vizibile, preluând informațiile din numele fișierului:

  Filename | Total size | Visible area | Bleed
  :- | :-: | :-: | :-:
  File1\_`1400x400`\_`700x137`\_`5`mm\.indd | 1400x400 | 700x137 | 5
  File2\_`597x517`\_`577x500.5`\_`3`mm V4\.indd | 597x517 | 577x500.5 | 3

  > Caută în numele fișierului perechi de numere de genul `000x000` (unde `000` înseamnă un grup de cel puțin o cifră, urmată sau nu de zecimale, și opțional de `mm` sau `cm`). Dacă găsește doar o pereche, e dimensiunea paginii. Dacă găsește două (de ex. `000x000_000x000`), perechea mai mare e dimensiunea paginii, perechea mai mică aria vizibilă. Dacă sunt urmate de o secvență de una sau două cifre, aceasta va fi bleed.

* **`PageSizeFromMargins.jsx`** redimensionează fiecare pagină la marginile acesteia.

* **`PageSizeFromSelection.jsx`** redimensionează pagina curentă la obiectele selectate (similar cu **Artboards > Fit to Selected Art** din Illustrator).

<details><summary><strong>Shortcuturi</strong></summary>

Setup | | | |
:- | -: | :- | -:
**DocCleanup.jsx** | F2 | **PageSizeFromFilename.jsx** | F3
**DocDefaults.jsx** | ⌥F2 | **PageMarginsFromSelection.jsx** | ⌥F3
**CleanupSwatches.jsx** | ⇧F2 | **PageSizeFromSelection.jsx** | ⇧F3

</details>

---

### **View**

* **`TileAll.jsx`** invocă **Window > Arrange > Tile All Vertically** sau **Tile All Horizontally**, în funcție de orientarea spreadului curent.

* **`ZoomToSelection.jsx`** e asemănător cu **Fit Selection in Window** (⌥⌘=), dar cu câteva îmbunătățiri:

  * aduce selecția puțin mai aproape;
  * dacă cursorul e în text, face zoom pe întreg cadrul;
  * fără nimic selectat face zoom pe spreadul curent.

* **`ZoomToSpreads.jsx`** face zoom pe primele 4 spreaduri.

<details><summary><strong>Shortcuts</strong></summary>

View | |
:- | -:
**TileAll.jsx** | ⇧F4
**ZoomToSelection.jsx** | F4
**ZoomToSpreads.jsx** | ⌥F4

</details>

---

### **Miscellaneous**

* **`ClearLabels.jsx`**: Uneori se refolosesc obiecte care au o etichetă atașată *(Script Label)*, și asta poate crea probleme ulterior. Scriptul șterge etichetele obiectelor selectate sau ale tuturor obiectelor din document dacă nu e selectat nimic.

* **`Clip.jsx`**: Pentru a manipula unele obiecte uneori e util să le inserăm temporar într‑un container *(clipping frame)*. Scriptul inserează obiectele selectate într‑un container sau le restaurează dacă sunt deja inserate.

  **Notă:** Folosește clipboardul, deci asigurați‑vă că nu pierdeți ceva important.

  **`ClipUndo.jsx`** restaurează unul sau mai multe obiecte simultan.

* **`HW.jsx`** etichetează obiectele selectate "HW" și adaugă un ghid inferior de 10% pe pagina curentă.

* **`LabelPage.jsx`** adaugă o etichetă configurabilă pe slugul paginii curente, pe stratul **info**.

* **`LabelPageRatios.jsx`** adaugă pe slugul fiecărei pagini o etichetă cu raportul acesteia, pe stratul **info**.

* **`QR.jsx`** adaugă un cod QR pe fiecare pagină a documentului activ sau într‑un fișier separat cu același nume și sufixul "_QR".

  **`QRBatch.jsx`** preia o listă de coduri QR dintr‑un fișier TSV numit **`qr.txt`**, pe care le adaugă unor documente existente sau creează fișiere separate:

  Filename | Code | Doc
  :- | :- | :-:
  File 1 | Code 1 | +
  File 2 | Code 2 |
  ... |

  > **Filename**: numele documentului (trebuie să fie valid pentru *Doc*) \
  > **Code**: orice șir de caractere \
  > **Doc**: orice șir de caractere: în document; lăsați gol sau omiteți pentru fișier separat

  **Notă:** Puteți insera "|" pentru împărțirea manuală a textului în mai multe rânduri.

* **`ShowFonts.jsx`** afișează toate fonturile utilizate în documentul curent (util pentru **`ReplaceFonts.jsx`**).

* **`ShowProfiles.jsx`** afișează toate profilele de culori disponibile.

* **`ShowProperties.jsx`** afișează proprietățile și metodele unui obiect selectat (util pentru depanare).

<details><summary><strong>Shortcuturi</strong></summary>

Miscellaneous | | | | | |
:- | -: | :- | -: | :- | -:
**Clip.jsx** | Num* | **QR.jsx** | F9 | **HW.jsx** | ⇧F10
**ClipUndo.jsx** | ⌃Num* | **QRBatch.jsx** | ⇧F9

</details>

---

## Instalare

1. Deschideți **Window > Utilities > Scripts**.
2. Faceți clic dreapta pe folderul **User** și selectați **Reveal in Finder/Explorer**.
3. Copiați fișierele în acest folder.

---

## Despre

Sunt un graphic designer, nu un programator, și am creat acest proiect pentru a‑mi simplifica niște operații monotone, așa că treceți cu vederea dacă unele lucruri nu sunt state‑of‑the‑art. Feedback sau sugestii sunt binevenite.

Codul din acest proiect nu ar fi fost posibil fără InDesign ExtendScript API de [Theunis de Jong](http://jongware.mit.edu) și [Gregor Fellenz](https://www.indesignjs.de/extendscriptAPI/indesign-latest/), Mozilla [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/About), postări pe bloguri și forumuri, tutoriale și scripturi de [Marc Autret](https://www.indiscripts.com), [Dave Saunders](http://jsid.blogspot.com), [Peter Kahrel](https://creativepro.com/files/kahrel/indesignscripts.html), [Gregor Fellenz](https://github.com/grefel/indesignjs), [Marijan Tompa](https://indisnip.wordpress.com), [Richard Harrington](https://github.com/richardharrington/indesign-scripts) și mulți alții.

© 2020-2021 Paul Chiorean \<jpeg AT basement.ro\>. \
Codul este publicat sub licența MIT (v. [LICENSE.txt](LICENSE.txt)).

README-ro.md • 1 august 2021
