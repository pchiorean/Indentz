# Batch resize v7.17j

## Pregătire

Trebuie să avem un fișier, denumit în continuare *master*, în care fiecare pagină reprezintă un vizual cu un anumit raport (rație). Nu contează ordinea, paginile vor fi sortate automat în funcție de rații.

În același folder cu masterul trebuie să existe un fișier text cu același nume, exportat din Excel cu opțiunea *tab delimited*, conținând 8 coloane: **ID**, **Vizibil W**, **Vizibil H**, **Total W**, **Total H**, **Raport**, **Vizual**, **Denumire** (numele nu e important, dar ordinea este). Coloana **Raport** nu e folosită, dar trebuie să existe. 

Opțional, în coloana **Vizual** se poate trece numele unui layer care va fi activat doar pentru acel fișier, celelalte layere care apar în coloană fiind ascunse. De exemplu, în fișierul "04_Denumire_Layout1_320x305_300x320" va fi vizibil layerul L1 și vor fi ascunse layerele L2 și L3. Restul layerelor rămân neatinse.

Fișierele vor fi denumite exact ca în coloana **Denumire**, deci atenție la caractere ilegale în nume de fișiere:

ID|Vizibil W|Vizibil H|Total W|Total H|Raport|Vizual|Denumire
:---:|---:|---:|---:|---:|---:|:---:|:---
**1**|200|600|230|620|0.333|L1|**01_Denumire_Layout1_230x620_200x600**
**2**|206|421|230|440|0.489|L3|**02_Denumire_Layout3_230x440_421x230**
**3**|205|297|230|320|0.690|L2|**03_Denumire_Layout2_230x320_297x230**
**4**|310|300|320|305|1.033|L1|**04_Denumire_Layout1_320x305_300x320**
||420|210|440|230|2.000||**Denumire_440x230_420x210**
**6**|598|210|620|220|2.848|L2|**07_Denumire_Layout2_620x220_598x210**
**7**|985|210|1200|225|4.690|L2|**08_Denumire_Layout2_1200x225_985x210**
**8**|985|105|1200|125|9.381|L3|**09_Denumire_Layout3_1200x125_985x105**
**9**|292|210|320|230|1.390|L1|**10_Denumire_Layout1_320x230_292x210**

E recomandat să se creeze cât mai multe pagini în master, pentru a acoperi toate rațiile de care este nevoie. E mai util să se folosească rațiile reale din tabel, în loc de rații generice gen 0.5, 1, 1.5, 2 ... 4.5 ș.a.m.d. Scriptul lucrează cu trei zecimale, pentru cazuri în care avem multe fișiere cu rații foarte apropiate, care cer ulterior multe ajustări manuale minore (de genul 25 de fișiere cu rația 0.331, 50 de fișiere cu rația 0.333 și 30 de fișiere cu rația 0.335). TL;DR: Un master cu 20+ de pagini e ok. Oricum trebuie declinate manual formatele mai ciudate... Mai bine în master, pentru că ar putea fi, eventual, refolosite. :)

### Layere tehnice

Deasupra layerelor care compun vizualul vor fi create, dacă nu există, layerele **id**, **info** și **safe area**, care la execuție vor fi populate cu:
* ID-ul, care va fi poziționat în partea din stânga-jos a ariei vizibile; dacă nu se dorește ID se lasă celula goală (ex. în rândul 5);
* info box, un text cu geometria paginii (total/vizibil/rație), poziționat dreapta-sus, pe pasteboard;
* un chenar care marchează aria vizibilă; culoarea lui este un swatch, **Safe area**, care dacă nu există va fi creat cu valoarea 0/0/100/0.

Dacă există deja un layer cu numele **vizibil** va fi folosit acesta în loc de **safe area**.

### Alinieri automate

Anumite elemente pot fi poziționate automat prin etichetarea lor prealabilă din **Windows > Utilities > Script label**. Sunt posibile următoarele etichete:

* **alignL, alignR, alignT, alignB** – aliniat la stânga, dreapta, sus, jos
* **alignTL, alignBL, alignTR, alignBR** – aliniat stânga-sus, stânga-jos, dreapta-sus, dreapta-jos
* **alignC, alignCh, alignCv** – aliniat la centru, centrat pe orizontală, centrat pe verticală
* **expand** – fit-to-object, apoi restrâns la bleed
* **bleed** – extins la bleed

Dacă se dorește "resetarea" masterului se pot șterge toate etichetele cu ajutorul scriptului **remove_labels.jsx**.

## Execuție

Pentru fiecare rând din tabel scriptul va alege din master pagina cu rația cea mai apropiată, o va scala la **Vizibil W** × **Vizibil H** și o va extinde la **Total W** × **Total H**. Dacă e cazul, va activa layoutul din coloana **Vizual**. Va plasa ID-ul, info box-ul, chenarul pentru aria vizibilă și va alinia elementele etichetate. Va salva fișierul cu numele din **Denumire** într-un subfolder cu numele rației folosite.