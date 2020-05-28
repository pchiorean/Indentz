# Batch resize v7.13j

## Pregătire

Trebuie să avem un fișier, denumit în continuare *master*, în care fiecare pagină reprezintă un vizual cu un anumit raport (rație). Nu contează ordinea, paginile vor fi sortate automat în funcție de rații.

În același folder cu masterul trebuie să existe un fișier text cu același nume, exportat din Excel cu opțiunea *tab delimited*, conținând 8 coloane: **ID**, **Vizibil W**, **Vizibil H**, **Total W**, **Total H**, **Raport**, **Vizual**, **Denumire** (numele nu e important, dar ordinea este). Coloanele **Raport** și **Vizual** nu sunt de fapt folosite, dar trebuie să existe. Atenție: fișierele vor fi denumite *exact* ca în coloana **Denumire**, deci nu folosiți caractere ilegale. Un exemplu de tabel:

ID|Vizibil W|Vizibil H|Total W|Total H|Raport|Vizual|Denumire
:---:|---:|---:|---:|---:|---:|:---:|:---
1|200|600|230|620|0.333|L1|01_Denumire_L1_230x620_200x600
2|206|421|230|440|0.489|L1|02_Denumire_L1_230x440_421x230
3|205|297|230|320|0.690|L2|03_Denumire_L2_230x320_297x230
4|310|300|320|305|1.033|L1|04_Denumire_L1_320x305_300x320
6|420|210|440|230|2.000|L1|06_Denumire_L1_440x230_420x210
7|598|210|620|220|2.848|L2|07_Denumire_L2_620x220_598x210
8|985|210|1200|225|4.690|L2|08_Denumire_L2_1200x225_985x210
9|985|105|1200|125|9.381|L2|09_Denumire_L2_1200x125_985x105
||292|210|320|230|1.390|L1|10_Denumire_L1_320x230_292x210

E recomandat să se creeze cât mai multe pagini în master, pentru a acoperi toate rațiile de care este nevoie. E mai util să se folosească rațiile reale din tabel, în loc de rații generice gen 0.5, 1, 1.5, 2 ... 4.5 ș.a.m.d. Scriptul lucrează cu trei zecimale, pentru cazuri în care avem multe fișiere cu rații foarte apropiate, care cer ulterior multe ajustări manuale minore (de genul 25 de fișiere cu rația 0.331, 50 de fișiere cu rația 0.333 și 30 de fișiere cu rația 0.335).

Deasupra layerelor care compun vizualul vor fi create, dacă nu există, layerele **id**, **info** și **safe area**, care la execuție vor fi populate cu:
* ID-ul, care va fi poziționat în partea din stânga-jos a ariei vizibile. Dacă nu se dorește ID se lasă celula goală (ex. în rândul 10);
* info box, un text cu geometria paginii (total/vizibil/rație), poziționat dreapta-sus, pe pasteboard;
* un chenar care marchează aria vizibilă. Culoarea lui este un swatch, **Safe area**, care dacă nu există va fi creat cu valoarea 0/0/100/0.

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

Când se execută scriptul nu trebuie să existe alte fișiere deschise în afară de master.

Pentru fiecare rând din tabel scriptul va alege din master pagina cu rația cea mai apropiată, o va scala la **Vizibil W** × **Vizibil H**, apoi o va extinde la **Total W** × **Total H**. Va completa ID-ul, info box-ul, chenarul pentru aria vizibilă și va alinia elementele etichetate, dacă e cazul. Apoi va salva fișierul cu numele din **Denumire** într-un subfolder cu numele rației folosite.