# Batch resize v7.20j

Acest script automatizează declinarea unui master pe baza unui tabel cu informații.

## Pregătire

Avem un fișier InDesign, denumit în continuare *master*, în care fiecare pagină e un vizual cu un anumit raport (rație). <!-- Nu contează dacă sunt în ordine, paginile vor fi sortate automat în funcție de rații. -->
În același folder cu masterul trebuie pregătit un fișier text cu același nume, exportat din Excel cu opțiunea *tab delimited*, conținând opt coloane:

ID|Vizibil W|Vizibil H|Total W|Total H|Raport|Vizual|Denumire
:---:|---:|---:|---:|---:|---:|:---:|:---
**1**|200|600|230|620|0.333|L1|**01_Denumire_Layout1_230x620_200x600**
**2**|206|421|230|440|0.489|L2|**02_Denumire_Layout2_230x440_421x230**
**3**|205|297|230|320|0.690|L3|**03_Denumire_Layout3_230x320_297x230**
**4**|310|300|320|305|1.033|L1|**04_Denumire_Layout1_320x305_300x320**
**5**|420|210|440|230|2.000||**05_Denumire_440x230_420x210**
**6**|440|210|480|230|2.095||**06_Denumire_480x230_440x210**
**7**|598|210|620|220|2.848||**07_Denumire_620x220_598x210**
**8**|985|210|1200|225|4.690|L1|**08_Denumire_Layout1_1200x225_985x210**
**9**|985|105|1200|125|9.381|L2|**09_Denumire_Layout2_1200x125_985x105**
**10**|292|210|320|230|1.390|L3|**10_Denumire_Layout3_320x230_292x210**

**`ID`**: Textul va fi formatat cu "Helvetica Neue Light" 5 pt și va fi poziționat în partea din stânga-jos a paginii sau, dacă nu încape, a ariei vizibile. Dacă nu se dorește ID se lasă celula goală.

**`Vizibil W/H`** și **`Total W/H`**: După cum e de bănuit, conțin dimensiunea vizibilă și totală. :) <!-- Scriptul le compară și, dacă sunt trecute invers în tabel (se întâmplă), le tratează corect. Numele fișierului însă va rămâne cel din **`Denumire`**. -->

**`Raport`**: Informația e preluată din Excel, dar aici nu e folosită.

**`Vizual`**: Opțional, masterul poate să conțină un set de layere cu layout-uri alternative (de ex. Layout 1/Layout 2, Valora/Denner, D/F/I, etc). Scriptul preia din coloana `Vizual` setul de layere și, pentru fiecare fișier, îl va exporta doar pe cel din celula respectivă. De exemplu, în "04_Denumire_Layout1_320x305_300x320" vor fi șterse `L2` și `L3` și va rămâne `L1`. Restul layerelor rămân neatinse. \
Dacă celula e goală, masterul nu e modificat în nici un fel.

**`Denumire`**: Fișierele vor avea exact denumirea din coloană, deci atenție la caractere ilegale în nume de fișiere.

E recomandat să se creeze cât mai multe pagini în master, pentru a acoperi toate rațiile de care este nevoie. E mai util să se folosească rațiile reale din tabel, în loc de rații generice gen 0.5, 1, 1.5, 2 ... 4.5 ș.a.m.d. Scriptul lucrează cu trei zecimale, pentru cazuri în care avem multe fișiere cu rații foarte apropiate, care cer ulterior multe ajustări manuale minore (de genul 25 de fișiere cu rația 0.331, 50 de fișiere cu rația 0.333 și 30 de fișiere cu rația 0.335). TL;DR: Un master cu 20 de pagini e ok. :) Oricum trebuie declinate manual formatele mai ciudate, mai bine în master, pentru că ar putea fi eventual refolosite.

### Layere tehnice

Deasupra layerelor care compun vizualul vor fi create, dacă nu există deja, layerele `id`, `info` și `safe area`, care la execuție vor fi populate cu:
* ID-ul, poziționat în stânga-jos a paginii;
* info box, un text cu geometria paginii (total/vizibil/rație), poziționat dreapta-sus, pe pasteboard;
* un chenar care marchează aria vizibilă; culoarea lui este un swatch, `Safe area`, care dacă nu există deja va fi creat cu valoarea C=0 M=100 Y=0 K=0.

Dacă există deja un layer cu numele `vizibil` va fi folosit acesta în loc de `safe area`.

### Alinieri automate

Anumite elemente pot fi aliniate automat prin etichetarea lor prealabilă din **Windows > Utilities > Script label**. Sunt posibile următoarele etichete:

* `alignL`, `alignR`, `alignT`, `alignB` – aliniat la aria vizibilă la stânga, dreapta, sus, jos;
* `alignTL`, `alignBL`, `alignTR`, `alignBR` – aliniat stânga-sus, stânga-jos, dreapta-sus, dreapta-jos;
* `alignC`, `alignCh`, `alignCv` – aliniat la centru, centrat pe orizontală, centrat pe verticală;
* `fit` – marginile care depășesc bleed-ul sunt restrânse la acesta;
* `bleed` – toate marginile vor fi restrânse/extinse la bleed.

Dacă se dorește "resetarea" masterului se pot șterge toate etichetele cu ajutorul scriptului **CleanupLabelsBR.jsx**.

## Execuție

Pentru fiecare rând din tabel scriptul va alege din master pagina cu rația cea mai apropiată, o va scala la `Vizibil W` × `Vizibil H` și o va extinde la `Total W` × `Total H`. Dacă e cazul, va activa layoutul din coloana `Vizual`. Va plasa ID-ul, info box-ul, chenarul pentru aria vizibilă și va alinia elementele etichetate. Va salva fișierul cu numele din `Denumire` într-un subfolder cu numele rației folosite.