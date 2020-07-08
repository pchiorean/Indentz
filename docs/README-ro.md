Am scris scripturile acestea ca să-mi fie de ajutor cu mici sarcini repetitive în InDesign. Sunt câteva categorii:

## Seria `FitToPage/Spread`

Acestea redimensionează unul sau mai multe obiecte selectate, fără să le scaleze. Pentru fiecare obiect, dacă dimensiunile acestuia depășesc dimensiunile paginii (`FitToPage`), ale marginii paginii (`FitToPageMargins`), sau ale bleed-ului paginii (`FitToPageBleed`), le constrânge la acestea.

Înainte | FitToPage | FitToPageMargins | FitToPageBleed
:---: | :---: | :---: | :---:
![Înainte](img/fittopage-0.png) | ![FitToPage](img/fittopage-1.png) | ![FitToPageBleed](img/fittopage-2.png) | ![FitToPageMargins](img/fittopage-3.png)

* `FitToSpread...` fac același lucru pentru paginile grupate într-un spread.

* `FitToPageBleedForced` și `FitToPageSpreadForced` întotdeauna redimensionează la bleed-ul paginii sau ale spread-ului, indiferent de dimensiunile obiectului selectat. Sunt utile, de exemplu, pentru imaginea de background.

#### Undo

Frame-urile obișnuite, rectangulare, sunt redimensionate pur și simplu. Obiectele rotite, grupurile etc sunt încapsulate într-un clipping frame și acesta e redimensionat. Dacă îl rulați a doua oară pe un astfel de obiect, îl va restaura. Alternativ, dacă doriți restaurarea tuturor obiectelor deodată, rulați scriptul `FitUndo`.

## Seria `ScaleToPage`

Aceste scripturi lucrează, de asemenea, cu o selecție de unul sau mai multe obiecte. Tot ce e selectat va fi considerat un bloc unitar și va fi scalat proporțional la dimensiunile paginii (`ScaleToPageSize`) sau ale marginii paginii (`ScaleToPageMargins`).

Variantele `H` (height) și `W` (width) scalează la înălțimea, respectiv lățimea marginii/paginii.

Înainte | ScaleToPageSizeH | ScaleToPageMarginsH
:---: | :---: | :---:
![Înainte](img/scaletopage-0.png) | ![FitToPage](img/scaletopage-1.png) | ![FitToPageBleed](img/scaletopage-2.png)

## Seria `PageSize`

Acestea redimensionează paginile documentului în funcție de numele fișierului, de marginile paginii, sau de obiectele selectate:

* `PageSizeFromFilename` caută în numele fișierului perechi de numere de genul `000x000`, unde `000` înseamnă un grup de cel puțin o cifră, urmată sau nu de zecimale, și opțional de `mm` sau `cm`. Dacă găsește doar o pereche, aceasta va fi dimensiunea paginii. Dacă găsește două (de ex. `000x000_000x000`), perechea mai mare va fi dimensiunea paginii, iar perechea mai mică dimensiunea ariei vizibile. \
Dacă sunt urmate de o secvență de una sau două cifre, aceasta e considerată bleed.

	Exemplu:

		VYPE_FR_MentholBan_Sticker_Vitrine_Phrase_1400x400_700x137_5mm.indd

* `PageSizeFromMargins` redimensionează fiecare pagină la marginile acesteia.

* `PageSizeFromSelection` redimensionează pagina curentă la obiectele selectate (similar cu **Fit to Selected Art** din Illustrator).

* `PageMarginsFromSelection` setează marginile paginii la obiectele selectate.

## Seria `TextAutosize`

Uneori, mai ales când am text scurt pe un singur rând, îmi doresc să-l pot manevra mai ușor, ca în Illustrator. Aceste scripturi "strâng" chenarul la text și-l aliniază la centru (`TextAutosize`), la stânga (`TextAutosizeL`), sau la dreapta (`TextAutosizeR`). Dacă textul are un singur rând, vor seta **Auto-Sizing** la **Height and Width**. Dacă are mai multe rânduri, la prima rulare îl vor seta la **Height Only**, a doua oară la **Height and Width** (caz în care trebuie avut grijă ca textul să fie în prealabil rupt manual pe rânduri).

Înainte | TextAutosizeL (1) | TextAutosizeL (2)
:---: | :---: | :---:
![Înainte](img/textautosize-0.png) | ![FitToPage](img/textautosize-1.png) | ![FitToPageBleed](img/textautosize-2.png)
