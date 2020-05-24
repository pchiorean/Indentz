# Batch resize v7.10j

Trebuie să existe un fișier InDesign (denumit în continuare *master*) în care fiecare pagină reprezintă un vizual cu un anumit raport (rație). Dacă nu există, vor fi create layerele **id**, **info** și **safe area** deasupra layerelor care compun vizualul.

În același folder trebuie să existe un fișier text cu același nume, exportat din Excel cu opțiunea *tab delimited*, cu coloanele următoare: **ID**, **Vizibil W**, **Vizibil H**, **Total W**, **Total H**, **Raport**, **Vizual**, **Denumire** (scriptul ia în considerare doar coloanele 1–5 și 8). Nu contează denumirile, ci să existe cele opt coloane cu aceste informații:

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
||292|210|320|230|1.390|L1|Denumire_L1_320x230_292x210

La rulare scriptul poziționează ID-ul în partea din stânga jos a fiecărei pagini. Dacă nu se dorește ID se lasă celula goală.

Vor fi create, în folderul unde este fișierul master, mai multe subfoldere cu denumirea corespunzătoare rației – câte pagini are masterul, atâtea foldere – care vor conține fișierele declinate și denumite pe baza informațiilor din tabel. E recomandat să se creeze cât mai multe pagini în fișierul master, pentru a acoperi toate rațiile de care este nevoie.

Atenție! Când se rulează scriptul nu trebuie să existe alte fișiere deschise în afară de fișierul master.

## Aliniere automată

Anumite elemente pot fi poziționate automat prin etichetarea lor prealabilă din **Windows > Utilities > Script label**. Sunt posibile următoarele etichete:

* **alignL, alignR, alignT, alignB** – align to left, right, top, bottom
* **alignTL, alignTR, alignBL, alignBR** – align to top-left, top-right, bottom-left, bottom-right
* **alignC, alignCh, alignCv** – align to center, center-horizontal, center-vertical
* **expand** – expand to bleed, loose fit
* **bleed** – expand to bleed, forced fit