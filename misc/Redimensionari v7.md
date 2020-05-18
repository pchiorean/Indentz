# Funcționarea scriptului

## Condiții preliminare

Trebuie să existe un fișier InDesign (denumit în continuare *master*) în care fiecare pagină reprezintă un vizual cu un anumit raport (rație). În acesta trebuie să avem layerele cu denumirea **HW**, **id**, **vizibil**, **Layer_lucru** (existente deja în **master_test.indd**). Layerele **id** și **vizibil** nu trebuie să conțină nimic. Dacă nu sunt, vor fi create. Pot exista și alte layere în afară de acestea.

În același folder trebuie să existe un fișier text cu același nume, exportat din Excel cu opțiunea *tab delimited*, cu coloanele următoare: **ID**, **Vizibil W**, **Vizibil H**, **Total W**, **Total H**, **Raport**, **Vizual** (aici poate fi orice), **Denumire**. Nu contează denumirea, ci să existe cele 8 coloane cu aceste informații:

ID|Vizibil W|Vizibil H|Total W|Total H|Raport|Vizual|Denumire
---:|:---:|:---:|:---:|:---:|:---:|:---:|:---
1|200|600|230|620|0.33|v9|01_Denumire035_200x600_230x620
2|206|421|230|440|0.48|v8|02_Denumire05_206x421_230x440
3|205|297|230|320|0.69|v7|03_Denumire07_205x297_230x320
4|320|305|310|300|1.00|v6|04_Denumire01_230x230_250x250
6|420|210|440|230|2.00|v4|06_Denumire02_420x210_440x230
7|598|210|620|220|2.84|v3|07_Denumire286_598x210_620x220
8|1200|225|985|210|4.69|v2|08_Denumire47_985x210_1200x225
9|985|105|1200|125|9.38|v1|09_Denumire09_985x105_1200x125
noid|292|210|320|230|1.39|v5|05_Denumire014_292x210_320x230

Scriptul poziționează ID-ul în partea din stânga jos a paginii. Dacă nu se dorește ID se trece **"noid"** în coloana corespunzătoare.

La rularea scriptului vor fi create, în folderul unde este fișierul master, mai multe subfoldere cu denumirea corespunzătoare rației – câte pagini are masterul, atâtea foldere – care vor conține fișierele declinate pe baza informațiilor din tabel. Recomand să se creeze cât mai multe pagini în documentul master, pentru a acoperi toate rațiile posibile.

Atenție! Când se rulează scriptul nu trebuie să existe alte fișiere deschise în afară de fișierul master.

### **Observații**

* Scriptul va activa opțiunile **Paste remember layers** și **Ungroup remember layers**.

* La final fiecare document va avea activ layerul cu denumirea **Layer_lucru**, restul vor fi *locked*.

## Aliniere automată

Anumite elemente pot fi poziționate automat prin etichetarea lor prealabilă din **Windows > Utilities > Script label**. Sunt posibile următoarele etichete:

* **alignRightLaVizibil**
* **alignLeftLaVizibil**
* **alignUpLaVizibil**
* **alignDownLaVizibil**
* **alignRightLaPagina**
* **alignLeftLaPagina**
* **alignHorizontalCenter**
* **alignVerticalCentersMinusHW**
* **expandToVizibil**
* **expandToBleed** (forțat la 5 mm, indiferent de bleed-ul paginii)

## Ce face scriptul

1. Calculează rația din master pentru fiecare pagină. Dacă e cazul, sortează paginile în funcție de rație.

2. Citește din fișierul text informațiile: id, dimensiuni vizibil/total, denumire. Dacă dimensiunile sunt greșite, adică vizibilul este trecut la total sau invers, scriptul verifică ariile și alege corect totalul și vizibilul.

3. Creează foldere după rațiile paginilor din master – pentru fiecare pagină va fi un folder corespunzător.

4. Alege pagina din master cu rația cea mai apropiată de rația documentului final și creează un document cu pagina aleasă.

5. Scalează conținutul paginii la vizibil.

6. Extinde pagina la dimensiunile totale (fără scalare).

7. Salvează documentul final cu denumirea corespunzătoare.
