# Batch resize v7.11j

## Pregătire

Trebuie să avem deschis în InDesign un fișier, denumit în continuare *master*, în care fiecare pagină reprezintă un vizual cu un anumit raport (rație).

În același folder cu masterul trebuie să existe un fișier text cu același nume, exportat din Excel cu opțiunea *tab delimited*, cu coloanele următoare: **ID**, **Vizibil W**, **Vizibil H**, **Total W**, **Total H**, **Raport**, **Vizual**, **Denumire** (numele nu e important, dar ordinea este). Coloanele **Raport** și **Vizual** nu sunt de fapt folosite, dar trebuie să existe. Atenție: fișierele vor fi denumite *exact* ca în coloana **Denumire**, deci nu folosiți caractere ilegale. Exemplu:

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

E recomandat să se creeze cât mai multe pagini în master, pentru a acoperi toate rațiile de care este nevoie. E mai util să se folosească rațiile reale din tabel, în loc de rații generice gen 0.5, 1, 1.5, 2 ... 4.5 ș.a.m.d. Scriptul ține cont de trei zecimale, pentru cazul în care avem  multe fișiere cu rații foarte apropiate, care cer ulterior multe ajustări manuale minore (de genul 25 de fișiere cu rația 0.331, 50 de fișiere cu rația 0.333 și 30 de fișiere cu rația 0.335).

Deasupra layerelor care compun vizualul vor fi create, dacă nu există, layerele **id**, **info** și **safe area**, care vor conține: 
* ID-ul, care va fi poziționat în partea din stânga-jos a ariei vizibile. Dacă nu se dorește ID se lasă celula goală (ex. rândul 10);
* un text cu dimensiunile paginii (total/vizibil/rație), poziționat dreapta-sus, pe pasteboard;
* un chenar care delimitează aria vizibilă. Culoarea lui este un swatch, **Safe area**, care va fi creat dacă nu există.

Dacă există deja layere cu numele **raport** (sau **ratio**) și **vizibil** vor fi folosite acestea în loc de **info** și **safe area**.

<!-- WIP Auto layout – col. 7! -->

Anumite elemente pot fi poziționate automat prin etichetarea lor prealabilă din **Windows > Utilities > Script label**. Sunt posibile următoarele etichete:

* **alignL, alignR, alignT, alignB** – aliniat la stânga, dreapta, sus, jos
* **alignTL, alignBL, alignTR, alignBR** – aliniat stânga-sus, stânga-jos, dreapta-sus, dreapta-jos
* **alignC, alignCh, alignCv** – aliniat la centru, centrat pe orizontală, centrat pe verticală
* **expand** – fit-to-object, apoi restrâns la bleed
* **bleed** – extins la bleed

## Execuție

Paginile vor fi sortate automat în funcție de rații, apoi vor fi create, în același folder cu masterul, fișierele declinate pe baza informațiilor din col. 1–5 și denumite cf. col. 8, grupate în subfoldere corespunzător rației folosite.

Atenție! Când se rulează scriptul nu trebuie să existe alte fișiere deschise în afară de fișierul master.