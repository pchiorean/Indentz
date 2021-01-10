# Indentz

Collection of InDesign scripts for simple and repetitive tasks. Many are designed to be run by a keyboard shortcut (**Edit > Keyboard Shortcuts... > Product Area > Scripts**; suggestions below each section). Some can be run by the [**`batch_convert.jsx`**](https://creativepro.com/files/kahrel/indesign/batch_convert.html) script by Peter Kahrel.

## Description

### **Alignment/Proxy**

Make it easier to align objects or set the reference point for transformations using shortcuts.

* **`AlignTo`** scripts align the selected object(s) to the **Align To** setting:

  ![Align Panel](img/alignto.png)

* **`ToggleAlignTo.jsx`** toggles the alignment between item, margins, page or spread (just run it repeatedly).

* **`ResetAlignTo.jsx`** resets the setting to **Align to Selection**.

* **`SetRefPoint`** scripts change the reference point used for transformations (like clicking the little proxy squares in the **Transform** palette).

**Note:** These two sets don't make much sense if they're not associated with the numeric keypad.

<details><summary><strong>Shortcuts</strong></summary>

Alignment | | | | | | | |
:- | -: | :- | -: | :- | -: | :- | -:
**AlignToTL.jsx** | Num7 | **AlignToT.jsx** | Num8 | **AlignToTR.jsx** | Num9 | **ToggleAlignTo.jsx** | Num0
**AlignToL.jsx** | Num4 | **AlignToC.jsx** | Num5 | **AlignToR.jsx**  | Num6 | **ResetAlignTo.jsx** | ⌃Num0
**AlignToBL.jsx** | Num1 | **AlignToB.jsx** | Num2 | **AlignToBR.jsx** | Num3

Proxy | | | | | |
:- | -: | :- | -: | :- | -:
**SetRefPointTL.jsx** | ⌃Num7 | **SetRefPointT.jsx** | ⌃Num8 | **SetRefPointTR.jsx** | ⌃Num9
**SetRefPointL.jsx** | ⌃Num4 | **SetRefPointC.jsx** | ⌃Num5 | **SetRefPointR.jsx** | ⌃Num6
**SetRefPointBL.jsx** | ⌃Num1 | **SetRefPointB.jsx** | ⌃Num2 | **SetRefPointBR.jsx** | ⌃Num3

</details>

### **Fitting**

Resize the selected objects, without scaling. Rectangular frames are simply resized; rotated objects, ovals, groups, etc. are inserted in a clipping frame that is resized.

* **`FitToPage`** and **`FitToSpread`**: if the selected object is larger than the page/spread/margins/bleed, it will be reduced; if it is smaller but inside a 1% "snap" area, it will be enlarged.

  **`FitTo...Forced.jsx`** resize exactly to the named dimensions.

* **`TextAutosize.jsx`** fits the text frame to the text and sets it to auto‑size. You control the auto‑sizing reference point by setting **Paragraph Alignment** for the horizontal axis, and **Text Frame Options > Vertical Justification** for the vertical axis:

  | | ![¶ Align left](img/paragraphalign-L.png) | ![¶ Align center](img/paragraphalign-C.png) | ![¶ Align right](img/paragraphalign-R.png)
  :-: | :-: | :-: | :-:
  ![Vertical Justification Top](img/verticaljustification-T.png) | ![top-left](img/textautosize-TL.png) | ![top-center](img/textautosize-TC.png) | ![top-right](img/textautosize-TR.png)
  ![Vertical Justification Center](img/verticaljustification-C.png) | ![center-left](img/textautosize-CL.png) | ![center](img/textautosize-C.png) | ![center-right](img/textautosize-CR.png)
  ![Vertical Justification Bottom](img/verticaljustification-B.png) | ![bottom-left](img/textautosize-BL.png) | ![bottom-center](img/textautosize-BC.png) | ![bottom-right](img/textautosize-BR.png)

  If the text has only one line, **Auto‑Sizing Type** will be set to *Height and width*. If it has multiple lines, the first run will set it to *Height only*, the second run to *Height and width*.

<details><summary><strong>Shortcuts</strong></summary>

FitToPage | | FitToSpread | | TextAutosize | |
:- | -: | :- | -: | :- | -:
**FitToPage.jsx** | F11 | **FitToSpread.jsx** | F12 | **TextAutosize.jsx** | F6
**FitToPageMargins.jsx** | ⌥F11 | **FitToSpreadMargins.jsx** | ⌥F12
**FitToPageBleed.jsx** | ⇧F11 | **FitToSpreadBleed.jsx** | ⇧F12
**FitToPageBleedForced.jsx** | ⇧⌘F11 | **FitToSpreadBleedForced.jsx** | ⇧⌘F12

</details>

### **Scaling**

Scale the selected objects proportionally, as a block.

* **`ScaleToPageSize.jsx`** and **`ScaleToPageMargins.jsx`** scale to the page size or page margins.

* The **`H`** (height) and **`W`** (width) variants scale to the height or width of the page or page margins.

<details><summary><strong>Shortcuts</strong></summary>

Scale | |
:- | -:
**ScaleToPageSize.jsx** | F5
**ScaleToPageMargins.jsx** | ⌥F5

</details>

### **Print**

Make several preparations for export and can be used with [**`batch_convert.jsx`**](https://creativepro.com/files/kahrel/indesign/batch_convert.html). The scripts detect alternative layers like **visible**, **vizibil** for **safe area**, or **diecut**, **die cut**, **cut lines**, **stanze** for **dielines**.

* **`PrepareForPrint.jsx`** hides the **safe area** layer and moves the dielines, white and UV markings from **dielines** / **white** / **varnish** to separate spreads.

* **`SafeArea.jsx`** creates a frame the size of the page margins on the **safe area** layer. It uses the **Safe area** swatch, which if it does not exist will be created with the value "C=0 M=100 Y=0 K=0".

* **`SafeAreaHideLayer.jsx`** and **`SafeAreaShowLayer.jsx`** hide or show **safe area**.

### **Setup**

There are two sets: one related to document preferences, layers, swatches and fonts, the other to page size and margins.

#### **Document**

* **`DefaultPrefs.jsx`** sets the following preferences:

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
  > **Guides & Pasteboard: Margins:** H 150 mm, V 25 mm \
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

* **`DefaultLayers.jsx`** adds a set of layers defined in a TSV *(tab‑separated values)* file named [**`layers.txt`**](../layers.txt):

  Name | Color | Visible | Printable | Order | Variants
  :- | :-: | :-: | :-: | :-: | :-
  dielines | Magenta | yes | yes | above | cut, cut lines, decoupe, die, die cut, stanze
  template | Gray | no | no | below
  ... |

  > **Name**: layer name \
  > **Color**: layer color (see [**`UIColors.txt`**](UIColors.txt); default `Light Blue`) \
  > **Visible**: `yes` or `no` (default `yes`) \
  > **Printable**: `yes` or `no` (default `yes`) \
  > **Order**: `above` or `below` existing layers (default `above`) \
  > **Variants**: a list of layers that will be merged with the base layer (case insensitive)

  The file can be saved in the current folder, on the desktop, or next to the script (the first one found will be used). Empty lines and lines beginning with "#" are ignored. This also applies to the next lists.

  **Note:** **`layers.xlsx`** can be used to generate the list.

* **`DefaultSwatches.jsx`** adds a set of swatches defined in a TSV file named [**`swatches.txt`**](../swatches.txt):

  Name | Model | Values
  :- | :-: | :-
  Rich Black | process | 60|40|40|100
  Cut | spot | 0|100|0|0
  ... |

  > **Name**: swatch name \
  > **Model**: color model: `process` or `spot` (default `process`) \
  > **Values**: 3 values in 0–255 range (RGB) or 4 values in 0–100 range (CMYK)

* **`CleanupSwatches.jsx`** converts process RGB swatches to CMYK, renames them to "C= M= Y= K=" form, removes duplicates and deletes unused. Spot colors are not changed.

* **`ReplaceFonts.jsx`** substitute fonts from a list defined in a TSV file named [**`fonts.txt`**](../fonts.txt):

  Old font | Style | New font | Style
  :- | :- | :- | :-
  Arial | Regular | Helvetica Neue | Regular
  Arial | Bold | Helvetica Neue | Bold
  ... |

  **Note:** You can use **`ShowFonts.jsx`** from **Misc** to get a tab delimited list of fonts for copy‑pasting.

* **`DocCleanup.jsx`** sets preferences (it runs **`DefaultPrefs.jsx`**), cleans up unused swatches, layers and pages, unlocks all items and resets their scaling to 100%.

* **`DocDefaults.jsx`** just runs **`DefaultPrefs.jsx`**, **`DefaultSwatches.jsx`**, **`DefaultLayers.jsx`**, **`ReplaceFonts.jsx`** and **`PageSizeFromFilename.jsx`**.

#### **Layout**

* **`PageMarginsFromSelection.jsx`** sets the page margins to the selected objects.

* **`PageSizeFromFilename.jsx`** sets the page size and margins by retrieving the information from the filename:

  Filename | Total size | Safe area | Bleed
  :- | :-: | :-: | :-:
  File1\_`1400x400`\_`700x137`\_`5`mm\_QR.indd | 1400x400 | 700x137 | 5
  File2\_`597x517`\_`577x500.5`\_`3`mm V4\_QR.indd | 597x517 | 577x500.5 | 3

  > It searches for pairs of numbers like `000x000` (where `000` means a group of at least one digit, followed or not by decimals, and optionally by `mm` or `cm`). If only one pair is found, it's the size of the page. If two are found (e.g., `000x000_000x000`), the larger pair it's the page size, the smaller pair the visible/safe area size. If followed by a one- or two‑digit sequence, this will be bleed.

* **`PageSizeFromMargins.jsx`** resizes each page to its margins.

* **`PageSizeFromSelection.jsx`** resizes the current page to the selected objects (similar to **Artboards > Fit to Selected Art** in Illustrator).

<details><summary><strong>Shortcuts</strong></summary>

Setup | | | |
:- | -: | :- | -:
**DocCleanup.jsx** | F2 | **PageSizeFromFilename.jsx** | F3
**DocDefaults.jsx** | ⌥F2 | **PageSizeFromMargins.jsx** | ⌥F3
**CleanupSwatches.jsx** | ⇧F2 | **PageSizeFromSelection.jsx** | ⇧F3

</details>

### **Misc**

* **`CleanupLabels.jsx`**: sometimes objects that have a label attached *(Script Label)* are reused, which may create problems later. The script deletes the labels of the selected objects or all objects in the document if nothing is selected.

* **`Clip.jsx`**: To handle some objects it is sometimes useful to temporarily insert them into a container *(clipping frame)*. The script inserts selected objects in a clipping frame or restores them if already clipped.

  **`ClipUndo.jsx`** restores one or several clipped objects at once.

* **`HW.jsx`** labels selected objects with 'HW'; if nothing is selected, it adds a 10% bottom guide on the current page.

* **`PageRatios.jsx`** calculates the ratio of each page and puts it in the upper left corner, on the **info** layer.

* **`PagesToFiles.jsx`** saves the pages of the active document in separate files, with a user configurable suffix.

* **`QR.jsx`** adds a QR code in the active document, in a file, or creates multiple codes in separate files:

  ![Generate QR Code](img/qr.png)

  * **On page** adds the code on each page, on the bottom left corner.

  * **On file** saves it in a file with the name of the active document and "_QR" added to the end.

  * **Batch** it's enabled only if a TSV file named **QR.txt**, containing a list of codes and filenames, is found in the current folder:

    Filename | Code
    :- | :-
    File 1 | CODE 1
    File 2 | CODE 2
    ... |

  **Note:** You can insert "|" for manually splitting the text into several lines.

* **`ShowFonts.jsx`** shows all fonts used in the current document (useful with **`ReplaceFonts.jsx`**).

* **`ShowProfiles.jsx`** shows all color profiles available to InDesign.

* **`ShowProperties.jsx`** shows properties and methods of a selected object (useful for debugging).

* **`TileAll.jsx`** invokes **Window > Arrange > Tile All Vertically** or **Tile All Horizontally**, depending on the current spread orientation.

* **`ZoomToSelection.jsx`** resembles **Fit Selection in Window** (⌥⌘=), but with some improvements:

  * brings the selection a little closer;
  * if the cursor is in the text, zooms on the whole frame;
  * without anything selected zooms on the spread.

<details><summary><strong>Shortcuts</strong></summary>

Misc | | | | | |
:- | -: | :- | -: | :- | -:
**Clip.jsx** | Num* | **TileAll.jsx** | ⇧F4 | **QR.jsx** | F9
**ClipUndo.jsx** | ⌃Num* | **ZoomToSelection.jsx** | F4

</details>

## Installation

1. Open **Window > Utilities > Scripts**.
2. Right‑click on folder **User** and select **Reveal in Finder/Explorer**.
3. Copy files to this folder.

## License

© 2021 Paul Chiorean \<jpeg AT basement.ro\>. \
The code is released under the MIT License (see [LICENSE.txt](LICENSE.txt)).

<!-- Some of the code contained in this repository is based on blog posts, forum posts, or tutorials by Marc Autret, Dave Saunders, Peter Kahrel, Peter Werner, Richard Harrington and others. -->

README.md • January 6, 2021
