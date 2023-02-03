# Indentz

<small>[Cleanup](#cleanup) | [Layout](#layout) | [Align](#align) | [Fit](#fit) | [Scale](#scale) | [Proxy](#proxy) | [File](#file) | [Export](#export) | [View](#view) | [Miscellaneous](#miscellaneous) | [Install](#install) | [About](#about)</small>

This is a collection of InDesign scripts for various simple and repetitive tasks.

As an artworker, I often have to perform repeated, tedious, or time-consuming operations. Working from home during the Covid lockdown, I used the extra time to learn a bit of the (now ancient) Extendscript 'art'. 😉 These are simple scripts adapted to my current workflow, and I tried to make them as generic as possible ([suggestions](https://github.com/pchiorean/Indentz/discussions) are welcome). I'm a big fan of shortcuts, so there are suggestions for Mac below (unfortunately they must be added manually from **Edit ‣ Keyboard Shortcuts ‣ Product Area ‣ Scripts**).

The code was developed and tested in Adobe InDesign CC 2020–2023 on Mac (but I mostly used [InDesign ExtendScript API 8.0](https://www.indesignjs.de/extendscriptAPI/indesign8/) for compatibility with CS6). I'm a graphic designer, not a programmer, so do expect oversights and bugs (please create an [issue](https://github.com/pchiorean/Indentz/issues) if you encounter one, though).

---

## Usage

### Cleanup

<small>_**Defaults and cleanup.**_</small>

#### **`DefaultPrefs.jsx`**
Sets some preferences for the active document. You should customize them to your workflow by editing the script.

<details><summary><strong>Details</strong></summary>

**Application:**
> **Preferences ‣ General:** Prevent Selection of Locked Objects\
> **Preferences ‣ Display Performance:** Preserve Object-Level Display Settings\
> **Preferences ‣ File Handling:** Always Save Preview Images with Documents\
> **View ‣ Screen Mode:** Normal\
> **View ‣ Grids & Guides:** Snap to Guides; Smart Guides\
> **Windows ‣ Layers:** Ungroup Remembers Layers; Paste Remembers Layers\
> **Windows ‣ Objects & Layout ‣ Transform:** Reference Point: Center; Adjust Stroke Weight when Scaling; Adjust Effects when Scaling\
> **Windows ‣ Output ‣ Preflight:** Off

**Document:**
> **Adjust Layout:** Off\
> **Document Intent:** Print\
> **Rulers:** Zero Point: Reset\
> **Preferences ‣ Type:** Use Typographer's Quotes; Apply Leading to Entire Paragraphs\
> **Preferences ‣ Units & Increments ‣ Keyboard Increments:** Cursor Key: 0.2 mm; Size/Leading: 0.5 pt; Baseline Shift: 0.1 pt; Kerning/Tracking: 5/1000 em\
> **Preferences ‣ Units & Increments ‣ Ruler Units:** Origin: Spread; Units: Millimeters\
> **Preferences ‣ Units & Increments ‣ Other Units:** Stroke: Points\
> **Preferences ‣ Grids:** Baseline Grid Color: R=230 G=230 B=230\
> **Preferences ‣ Guides & Pasteboard:** Preview Background Color: Light Gray\
> **Edit ‣ Transparency Blend Space:** Document CMYK\
> **Edit ‣ Color Settings ‣ Working Spaces**: RGB Profile: sRGB IEC61966-2.1; CMYK Profile: ISO Coated v2 (ECI), fallback to Coated FOGRA39 (ISO 12647-2:2004)\
> **View:** Show Rulers\
> **View ‣ Extras:** Show Frame Edges\
> **View ‣ Grids & Guides:** Show Guides; Unlock Guides; Snap to Guides\
> **Windows ‣ Color:** Fill: None; Stroke: None\
> **Windows ‣ Effects:** Blending Mode: Normal; Opacity: 100%\
> **Windows ‣ Output ‣ Attributes:** Nonprinting: Off\
> **Windows ‣ Pages:** Allow Document Pages to Shuffle\
> **Windows ‣ Type & Tables ‣ Paragraph:** Shading: Off

</details>

#### **`DefaultLayers.jsx`**
Adds a set of layers defined in a TSV data file named **`layers.tsv`** ([sample](samples/layers.tsv)) saved _locally_ (meaning the active document folder or its parent), or as a _global default_ (on the desktop, next to the script, or in **`Indentz`** root); local files and those starting with `_` take precedence:

| Name         | Color   | Visible | Printable | Order  | Variants                                           |
|:-------------|:--------|:--------|:----------|:-------|:---------------------------------------------------|
| **dielines** | Magenta | yes     | yes       | above  | cut\*, decoupe, die, die\*cut, stanz\*             |
| **text**     | Green   |         |           |        | copy, headline\*, hl, text\*, txt, typ?            |
| **bg**       | Red     |         |           | below  | back, \*background\*, bgg, fond, hg, hintergrund\* |
| **template** | Gray    | no      | no        | bottom |                                                    |
| ...          |         |         |           |        |                                                    |

> **Name**: Layer name\
> **Color**: Layer color (defaults to `Light Blue`; see [**`UIColors.txt`**](misc/UIColors.txt) for color names)\
> **Visible**: `yes` or `no` (defaults to `yes`)\
> **Printable**: `yes` or `no` (defaults to `yes`)\
> **Order**: `above` or `below` existing layers, or `top`/`bottom` (defaults to `above`)\
> **Variants**: A list of layers that will be merged with the base layer; it's case insensitive and can take simple wildcards (`?` and `*`)

**Additional features:**

A line may also contain a _statement_:

- `@includepath` `reference/path` – defines a folder to which subsequent relative paths will refer;
- `@include` `path/to/other.tsv` – includes another TSV file at this position; `path/to` may be an absolute path, one relative to the current data file, or one relative to `reference/path` if defined;
- `@defaults` – includes the global data file;

There's also some non-standard stuff that will confuse Excel et al.:

- Blank lines and those starting with `#` (comments) are ignored;
- The fields can be visually aligned with spaces that will be removed at processing (I use [VS Code](https://code.visualstudio.com) and [Rainbow CSV](https://marketplace.visualstudio.com/items?itemName=mechatroner.rainbow-csv));
- A very long line can be broken into multiple lines with a backslash (`\`) added at the end of each segment.

#### **`DefaultSwatches.jsx`**
Adds a set of swatches defined in a TSV data file named **`swatches.tsv`** ([sample](samples/swatches.tsv)) saved _locally_ (meaning the active document folder or its parent), or as a _global default_ (on the desktop, next to the script, or in **`Indentz`** root); local files and those starting with `_` take precedence:

| Name           | Color Model | Color Space | Values       | Variants         |
|:---------------|:------------|:------------|:-------------|:-----------------|
| **Rich Black** | process     | cmyk        | 60 40 40 100 |                  |
| **RGB Grey**   | process     | rgb         | 128 128 128  |                  |
| **Cut**        | spot        | cmyk        | 0 100 0 0    | couper, die\*cut |
| ...            |             |             |              |                  |

> **Name**: Swatch name\
> **Color Model**: `process` or `spot` (defaults to `process`)\
> **Color Space**: `cmyk`, `rgb` or `lab` (defaults to `cmyk`)\
> **Values**: a list of numbers separated by space (` `), comma (`,`), pipe (`|`) or slash (`/`):
> - 3 values in 0–255 range for RGB
> - 4 values in 0–100 range for CMYK
> - 3 values in 0–100 (L), –128–127 (A and B) range for Lab
>
> **Variants**: a list of swatches that will be replaced by the base swatch; it's case insensitive and can take simple wildcards (`?` and `*`)

You can use [**`DumpSwatches.jsx`**](#dumpswatchesjsx) to save a tab delimited list of swatches from any document.

<details><summary><strong>Additional features</strong></summary>

A line may also contain a _statement_:

- `@includepath` `reference/path` – defines a folder to which subsequent relative paths will refer;
- `@include` `path/to/other.tsv` – includes another TSV file at this position; `path/to` may be an absolute path, one relative to the current data file, or one relative to `reference/path` if defined;
- `@defaults` – includes the global data file;

There's also some non-standard stuff that will confuse Excel et al.:

- Blank lines and those starting with `#` (comments) are ignored;
- The fields can be visually aligned with spaces that will be removed at processing (I use [VS Code](https://code.visualstudio.com) and [Rainbow CSV](https://marketplace.visualstudio.com/items?itemName=mechatroner.rainbow-csv));
- A very long line can be broken into multiple lines with a backslash (`\`) added at the end of each segment.

</details>

#### **`ReplaceFonts.jsx`**
Replaces document fonts using a TSV data file named **`fonts.tsv`** ([sample](samples/fonts.tsv)) saved _locally_ (meaning the active document folder or its parent), or as a _global default_ (on the desktop, next to the script, or in **`Indentz`** root); local files and those starting with `_` take precedence:

| Old font family | Style   | New font family    | Style   |
|:----------------|:--------|:-------------------|:--------|
| **Arial**       | Regular | **Helvetica Neue** | Regular |
| **Arial**       | Bold    | **Helvetica Neue** | Bold    |
| ...             |         |                    |         |

You can use [**`ShowFonts.jsx`**](#showfontsjsx) from [**Miscellaneous**](#miscellaneous) to get a tab delimited list of document fonts for copy-pasting.

<details><summary><strong>Additional features</strong></summary>

A line may also contain a _statement_:

- `@includepath` `reference/path` – defines a folder to which subsequent relative paths will refer;
- `@include` `path/to/other.tsv` – includes another TSV file at this position; `path/to` may be an absolute path, one relative to the current data file, or one relative to `reference/path` if defined;
- `@defaults` – includes the global data file;

There's also some non-standard stuff that will confuse Excel et al.:

- Blank lines and those starting with `#` (comments) are ignored;
- The fields can be visually aligned with spaces that will be removed at processing (I use [VS Code](https://code.visualstudio.com) and [Rainbow CSV](https://marketplace.visualstudio.com/items?itemName=mechatroner.rainbow-csv));
- A very long line can be broken into multiple lines with a backslash (`\`) added at the end of each segment.

</details>

#### **`ReplaceLinks.jsx`** <small>⌥F8</small>
Replaces document links using a TSV data file named **`links.tsv`** ([sample](samples/links.tsv)) saved _locally_ (meaning the active document folder or its parent), or as a _global default_ (on the desktop, next to the script, or in **`Indentz`** root); local files and those starting with `_` take precedence:

| Relink to                         | Document links              |
|:----------------------------------|:----------------------------|
| **/absolute/path/to/img1.psd**    | img1_lowres.jpg, img1-rgb.* |
| **img2.psd**                      | img2.*                      |
| **`@includepath` reference/path** |                             |
| **img3.psd**                      |                             |
| **subfolder/img4.psd**            |                             |
| ...                               |                             |

> **Relink to** (also see **Additional features** below):
> - An absolute path of the form `/absolute/path/to/img1.psd`;
> - A relative path which is:
>   - relative by default to the document `Links` folder (`img2.psd`);
>   - relative to `reference/path` defined by a previous `@includepath` statement (`img3.psd` and `subfolder/img4.psd`).
> 
> **Document links:**
> - If empty, the _name_ from the first column will be used (so that if it's in the document, it will be replaced);
> - One or more document link names; it's case insensitive and can take simple wildcards (`?` and `*`).

Quoting the paths is not required.

<details><summary><strong>Additional features</strong></summary>

A line may also contain a _statement_:

- `@includepath` `reference/path` – defines a folder to which subsequent relative paths will refer;
- `@include` `path/to/other.tsv` – includes another TSV file at this position; `path/to` may be an absolute path, one relative to the current data file, or one relative to `reference/path` if defined;
- `@defaults` – includes the global data file;

There's also some non-standard stuff that will confuse Excel et al.:

- Blank lines and those starting with `#` (comments) are ignored;
- The fields can be visually aligned with spaces that will be removed at processing (I use [VS Code](https://code.visualstudio.com) and [Rainbow CSV](https://marketplace.visualstudio.com/items?itemName=mechatroner.rainbow-csv));
- A very long line can be broken into multiple lines with a backslash (`\`) added at the end of each segment.

</details>

#### **`ReplaceSnippets.jsx`** <small>⌥F6</small>
Replaces a list of text snippets using a TSV data file named **`snippets.tsv`** ([sample](samples/snippets.tsv)) saved _locally_ (meaning the active document folder or its parent), or as a _global default_ (on the desktop, next to the script, or in **`Indentz`** root); local files and those starting with `_` take precedence:

| Find what              | Change to                 | Case sensitive | Whole word | Scope |
|:-----------------------|:--------------------------|:---------------|:-----------|:------|
| English instructions   | Deutsche anleitung        | yes            | yes        |       |
| The sample is for free | Das Sample ist kostenlos  | yes            | yes        | _DE$  |
| The sample is for free | L'échantillon est gratuit | yes            | yes        | _FR$  |
| 12.06.22               | 13.11.2022                |                |            |       |
| ...                    |                           |                |            |       |

> **Find what**: Text to be replaced (you can use [special characters](https://helpx.adobe.com/indesign/using/find-change.html#metacharacters_for_searching))\
> **Change to**: The replacement text\
> **Case sensitive**: `yes` or `no` (defaults to `yes`)\
> **Whole word**: `yes` or `no` (defaults to `yes`)\
> **Scope**: Replacement will only be done if the document name matches the [regular expression](https://regex101.com) (case sensitive)

For example, 'The sample is for free' will be replaced with 'Das Sample ist kostenlos' in **`Document_DE.indd`**, and with 'L'échantillon est gratuit' in **`Document_FR.indd`**.

<details><summary><strong>Additional features</strong></summary>

A line may also contain a _statement_:

- `@includepath` `reference/path` – defines a folder to which subsequent relative paths will refer;
- `@include` `path/to/other.tsv` – includes another TSV file at this position; `path/to` may be an absolute path, one relative to the current data file, or one relative to `reference/path` if defined;
- `@defaults` – includes the global data file;

There's also some non-standard stuff that will confuse Excel et al.:

- Blank lines and those starting with `#` (comments) are ignored;
- The fields can be visually aligned with spaces that will be removed at processing (I use [VS Code](https://code.visualstudio.com) and [Rainbow CSV](https://marketplace.visualstudio.com/items?itemName=mechatroner.rainbow-csv));
- A very long line can be broken into multiple lines with a backslash (`\`) added at the end of each segment.

</details>

#### **`BreakLinkToStyles.jsx`**
Unnaplies paragraph/character/object styles from the selected objects or all objects in the document if nothing is selected.

#### **`DocCleanup.jsx`** <small>F2</small>
It runs [**`DefaultPrefs.jsx`**](#defaultprefsjsx); deletes unused swatches, layers and spreads; unlocks all objects and resets their scaling to 100%; optionally deletes hidden objects; resets default transparency effects; converts empty text frames to generic frames and empty frames to graphic frames; sets tight pasteboard margins.

#### **`RemoveScriptLabels.jsx`**
Sometimes objects that have a script label attached are reused, which may create problems later. The script deletes the labels of the selected objects or all objects in the document if nothing is selected.

#### **`SwatchesCleanup.jsx`** <small>⇧F2</small>
Converts process RGB swatches to CMYK and renames them to 'C= M= Y= K=' format. It also deletes unused swatches and removes duplicates. Spot colors are not changed.

#### **`DumpLayers.jsx`**
Saves a TSV file (compatible with [**`DefaultLayers.jsx`**](#defaultlayersjsx)) containing the names and properties of the active document layers.

#### **`DumpSwatches.jsx`**
Saves a TSV file (compatible with [**`DefaultSwatches.jsx`**](#defaultswatchesjsx)) containing the names and properties of the active document swatches.

---

### Layout

<small>_**Document setup – page size, margins & columns, guides.**_</small>

#### **`PageSizeFromFilename.jsx`** <small>F3</small>
Sets the size of the page, the margins, and marks the visible area[^1], getting dimensions from the file name. It looks for pairs of numbers like `000x000` (where `000` means a group of at least one digit, followed or not by decimals, and optionally by `mm` or `cm`). If only one pair is found, it sets the size of the page. If two are found (e.g., `000x000_000x000`), the larger pair sets the page size, the smaller pair the visible area. If a one- or two-digit sequence follows, it sets the bleed. Example:

| File name                                       | Total size | Visible area | Bleed |
|:------------------------------------------------|:-----------|:-------------|:------|
| **Document1\_315x55\.indd**                     | 315×55     | –            | –     |
| **Document2\_1400x400\_700x137mm\.indd**        | 1400×400   | 700×137      | –     |
| **Document3\_597x517\_577x500.5\_3mm V4\.indd** | 597×517    | 577×500.5    | 3     |

#### **`PageSizeFromMargins.jsx`**
Resizes the current page to its margins.

#### **`PageSizeFromSelection.jsx`** <small>⇧F3</small>
Resizes the page to the selected objects.

#### **`PageMarginsFromScriptName.jsx`**
Sets the page margins and optionally the HW area (expressed in percentage of the visible/page area), getting the values from the script name. It's designed to be duplicated and renamed to customize the values, using one or two numbers and the keyword `HW` – e.g., `MG5HW10.jsx` sets a value of 5% for the margins and 10% for the HW (`HW` can also be used alone, which sets it to 10%, or omitted, which sets it to 0).

#### **`PageMarginsFromSelection.jsx`** <small>⌥F3</small>
Sets the page margins from the selected objects.

#### **`GuidesAdd.jsx`**
If any page objects are selected, it adds guides around them. If nothing is selected, it adds guids on page edges and in the middle of margins; a second run deletes them.

#### **`GuidesDelete.jsx`**
Deletes all guides from the document.

---

### Align

<small>_**Align page objects with ease using the numeric keypad.**_</small>

#### **`AlignTo*.jsx`**
Use the numeric keypad to instantly align the selected object to the **Align To** selection (see below), with a single keystroke.

<details><summary><strong>Shortcuts</strong></summary>

| Left              |  Key | Center           |  Key | Right             |  Key |
|:------------------|-----:|:-----------------|-----:|:------------------|-----:|
| **AlignToTL.jsx** | Num7 | **AlignToT.jsx** | Num8 | **AlignToTR.jsx** | Num9 |
| **AlignToL.jsx**  | Num4 | **AlignToC.jsx** | Num5 | **AlignToR.jsx**  | Num6 |
| **AlignToBL.jsx** | Num1 | **AlignToB.jsx** | Num2 | **AlignToBR.jsx** | Num3 |

</details>

#### **`ToggleAlignTo.jsx`** <small>Num0</small>
Toggles **Align To** between selection, margins, page or spread (just run it repeatedly):

![Align Panel screenshot](img/alignto.png)

#### **`ResetAlignTo.jsx`** <small>⌃Num0</small>
Resets **Align To** to default (**Align to Selection**).

---

### Fit

<small>_**Reframe selected objects.**_</small>

#### **`FitTo*.jsx`**

These scripts reframe the selected objects to the target area specified in the script name (page/spread or their margins, bleed or visible area). Example for running `FitToPageBleed.jsx` (⇧F11) on selected frames:

![Example](img/fit.png)

The refitting is done by:

- **Shrinking** the edges that hang outside the specified area.

  Rectangular frames and straight lines are simply reframed; rotated objects, ovals, groups etc., are first inserted into a clipping frame.

- **Extending** the edges that touch or are very close to a trigger zone[^2] (either target or visible area).

  Only clipped objects, straight frames and lines are extended. Frames with an embedded object are only extended to the limits of that object.

Variants with the suffix **`Forced`** simply reframe the objects to the target area.

<details><summary><strong>Shortcuts</strong></summary>

| Page                               |    Key | Spread                               |    Key |
|:-----------------------------------|-------:|:-------------------------------------|-------:|
| **FitToPage.jsx**                  |    F11 | **FitToSpread.jsx**                  |    F12 |
| **FitToPageMargins.jsx**           |   ⌥F11 | **FitToSpreadMargins.jsx**           |   ⌥F12 |
| **FitToPageVisibleArea.jsx**       |  ⌥⇧F11 | **FitToSpreadVisibleArea.jsx**       |  ⌥⇧F12 |
| **FitToPageBleed.jsx**             |   ⇧F11 | **FitToSpreadBleed.jsx**             |   ⇧F12 |
| **FitToPageForced.jsx**            |   ⌘F11 | **FitToSpreadForced.jsx**            |   ⌘F12 |
| **FitToPageMarginsForced.jsx**     |  ⌥⌘F11 | **FitToSpreadMarginsForced.jsx**     |  ⌥⌘F12 |
| **FitToPageVisibleAreaForced.jsx** | ⌥⇧⌘F11 | **FitToSpreadVisibleAreaForced.jsx** | ⌥⇧⌘F12 |
| **FitToPageBleedForced.jsx**       |  ⇧⌘F11 | **FitToSpreadBleedForced.jsx**       |  ⇧⌘F12 |

**Note:** `F11` page, `F12` spread; `⌥` margins, `⌥⇧` visible area, `⇧` bleed; `⌘` forced.

</details>

#### **`TextAutosize.jsx`** <small>F6</small>
Auto-sizes the selected text frames to their content. It's designed to be run repeatedly.

Each run increases the level with one step (from **None** to **Height Only**, and from **Height Only** to **Height and Width**), except single lines, which are always set **Height and Width**. The reference point is set by the first paragraph's alignment and the text frame's vertical justification:

| <small>Paragraph Alignment →<br>↓ Vertical Justification</small> | ![¶ Align left](img/paragraphalign-L.png) | ![¶ Align center](img/paragraphalign-C.png) | ![¶ Align right](img/paragraphalign-R.png) |
| :-: | :-: | :-: | :-: |
| ![Vertical Justification Top](img/verticaljustification-T.png) | ![top-left](img/textautosize-TL.png) | ![top-center](img/textautosize-TC.png) | ![top-right](img/textautosize-TR.png) |
| ![Vertical Justification Center](img/verticaljustification-C.png) | ![center-left](img/textautosize-CL.png) | ![center](img/textautosize-C.png) | ![center-right](img/textautosize-CR.png) |
| ![Vertical Justification Bottom](img/verticaljustification-B.png) | ![bottom-left](img/textautosize-BL.png) | ![bottom-center](img/textautosize-BC.png) | ![bottom-right](img/textautosize-BR.png) |

**Note:** A second run will preserve the current auto-sizing if only the alignment is changed.

---

### Scale

<small>_**Resize selected objects.**_</small>

#### **`ScaleTo*.jsx`**
Scale the selected objects to the page size, page margins, or spread bleed. All objects are scaled together, as a group.

**`*H.jsx`** and **`*W.jsx`** variants scale to the height or width of their target.

<details><summary><strong>Shortcuts</strong></summary>

| Page                     | Key | Page margins                |  Key | Spread bleed                |  Key |
|:-------------------------|----:|:----------------------------|-----:|:----------------------------|-----:|
| **ScaleToPageSize.jsx**  |  F5 | **ScaleToPageMargins.jsx**  |  ⌥F5 | **ScaleToSpreadBleed.jsx**  |  ⇧F5 |
| **ScaleToPageSizeH.jsx** | ⌃F5 | **ScaleToPageMarginsH.jsx** | ⌃⌥F5 | **ScaleToSpreadBleedH.jsx** | ⌃⇧F5 |

</details>

---

### Proxy

#### **`SetRefPoint*.jsx`**
Use the numeric keypad to set the reference point used for transformations (similar to clicking the little proxy squares in the **Control** palette):

![Proxy](img/proxy.png)

<details><summary><strong>Shortcuts</strong></summary>

| Left                  |   Key | Center               |   Key | Right                 |   Key |
|:----------------------|------:|:---------------------|------:|:----------------------|------:|
| **SetRefPointTL.jsx** | ⌃Num7 | **SetRefPointT.jsx** | ⌃Num8 | **SetRefPointTR.jsx** | ⌃Num9 |
| **SetRefPointL.jsx**  | ⌃Num4 | **SetRefPointC.jsx** | ⌃Num5 | **SetRefPointR.jsx**  | ⌃Num6 |
| **SetRefPointBL.jsx** | ⌃Num1 | **SetRefPointB.jsx** | ⌃Num2 | **SetRefPointBR.jsx** | ⌃Num3 |

</details>

---

### File

#### **`FilesToSpreads.jsx`**
Combines the open documents, sorted alphabetically.

#### **`SpreadsToFiles.jsx`**
Saves each spread of the active document to a separate file.

If the file name ends with a _separator_ (space/dot/underline/hyphen) followed by _a sequence_ of digits or letters _equal_ to the number of spreads, each saved spread will have the letter corresponding to its index appended to its name – e.g., a document with three spreads named **`Document_ABC.indd`** will be split into **`Document_A.indd`** / **`Document_B.indd`** / **`Document_C.indd`**. If not autodetected, the script will prompt the user for a sequence.

By default, the index will be appended at the end, but you can put a `#` in the file name to place the index at that particular position.

#### **`LayersToSpreads.jsx`**
Moves all layers of the active document to separate spreads (the document must have a single spread).

You can use **`SpreadsToFiles.jsx`** to save them in separate documents.

---

### Export

#### **`QuickExport.jsx`** <small>⌃E</small>
Exports to PDF all opened documents or, with nothing opened, all documents from a folder.

For convenience, some export options can be easily changed from the preset settings: resolution, export as pages/spreads, include crop marks, page information, slug area, and you can set a custom bleed.

There are two export presets that can be used simultaneously or one at a time:

![Quick export](img/script-quickexport.png)

The text from the **Suffix** field will be appended to the name of the exported file (everything in the preset name after the last `_` will be autodetected as suffix).

If **Sort files by suffix into subfolders** is checked, files will be exported in subfolders named using the suffix text up to the first `+` character. For example, for a `print+diecut` suffix, the PDF will be saved as **`Document_print+diecut.pdf`** in a subfolder named **`print`**.

It can also run a JavaScript or AppleScript before exporting, e.g., one of the following:

#### **`MarkVisibleArea.jsx`**
Creates a frame the size of the page margins on the **visible area** layer. It will use the **Visible area** swatch, which will be created with the values R=255 G=180 B=0 if it doesn't exist.

#### **`PrepareForExport.jsx`**
Hides **covered areas**, **visible area**, **safety area**, **safe area**, **segmentation**, **guides**, and all layers starting with either a dot or a hyphen; moves all page objects from **varnish**, **uv**, **foil**, **silver** and **white** to separate spreads.

#### **`ShowDNPLayers.jsx`** / **`HideDNPLayers.jsx`**
Show or hide the following _do-not-print_ layers: **covered areas**, **visible area**, **\*vi?ib\***, **vis?\***, **safety area**, **safe area**, **segmentation**, **rahmen** and **sicht\***, and all layers starting with either a dot or a hyphen.

---

### View

#### **`TileAll.jsx`** <small>⇧F4</small>
Invokes **Window ‣ Arrange ‣ Tile All Vertically** or **Tile All Horizontally**, depending on the current spread orientation.

#### **`ZoomTo300Percent.jsx`** <small>⌘3</small>
Zooms current layout window to 300%.

#### **`ZoomToSelection.jsx`** <small>F4</small>
It resembles **Fit Selection in Window** **<small>(⌥⌘=)</small>**, but with some changes:

- Brings the selection a little closer;
- If the cursor is in a text frame, zooms on the whole frame;
- Without anything selected zooms on the current spread.

#### **`ZoomToSpreads.jsx`** <small>⌥F4</small>
Zooms on the first 3 spreads.

---

### Miscellaneous

#### **`Clip.jsx`** <small>Num\*</small>
To handle some objects, it may be useful to temporarily insert them into a container (clipping frame). The script inserts the selected objects into a clipping frame or restores them if they are already clipped.

**Note:** It uses the clipboard, so make sure you don't lose anything important.

#### **`ClipUndo.jsx`** <small>⌃Num\*</small>
Releases one or several objects from their clipping frames (you can select any objects, it will only release the clipped ones). If nothing is selected, it will release all clipped objects.

#### **`EAN.jsx`** <small>⌥F9</small>
This script is inspired by [**EAN Barcode Generator**](https://github.com/smorodsky/ean-barcode-generator) by Konstantin Smorodsky, modified to embed a code in the selected rectangle: if we have a page object (ideally a rectangle) selected, the script embeds an EAN code in it, scaled to width. If nothing is selected, creates a new document.

Enter 8 or 13 digits for the code itself; if you have an add-on, add a hyphen and another 2 or 5 digits.

#### **`LabelPage.jsx`**
Adds a custom label on the current page slug, on the **info** layer (Helvetica Regular 6 pt, fill **Registration**, stroke **Paper** 0.4 pt):

![Label Page](img/labelpage.png)

#### **`LabelPageRatios.jsx`**
Adds a label with the page aspect ratio, on the slug of each page, on the **info** layer.

#### **`OffsetPaths.jsx`**
This is a slightly modified version of [**OffsetPath**](https://creativepro.com/indesign-cad-tool/) by Olav Martin Kvern, which uses a clever method to create paths around selected objects at a custom offset distance:

> When you apply a Contour-type text wrap to an object, you’re creating a path around that object—and you can specify an offset distance. The text wrap path is accessible via scripting. That means that we could apply a text wrap with a given offset, then capture the path and path points of that path, turn off text wrap, and then create a new path from those geometric coordinates.

I fixed some bugs and added a default value, an option to join contours, and support for undoing.

#### **`QR.jsx`** <small>F9</small>
Adds a QR code on each spread of the active document (outside visible area, if possible) or to separate PDF files[^3]:

|             On document             |             On file              |
|:-----------------------------------:|:--------------------------------:|
| ![QR on document](img/qr-ondoc.png) | ![QR on file](img/qr-onfile.png) |

If the document name ends with a _separator_ (space/dot/underline/hyphen) followed by a _sequence_ of digits or letters _equal_ to the number of spreads, the letter corresponding to the spread index will be appended to each code/file – e.g., for a document with three spreads named **`Document_ABC.indd`**, the script will generate **`Document_A_QR.pdf`**, **`Document_B_QR.pdf`** and **`Document_C_QR.pdf`**.

You can insert `|` for manually splitting the label into several lines.

#### **`QRBatch.jsx`** <small>⇧F9</small>
Does the same thing as **`QR`** but in a non-interactive way: retrieves a list of codes from a TSV data file named **`qr.tsv`** ([sample](samples/qr.tsv)) and adds them to existing documents or creates separate files (the suffix thing applies here as well):

| File name          | Code   | On doc |
|:-------------------|:-------|:------:|
| **Document 1**     | Code 1 |   +    |
| **Document 2_ABC** | Code 2 |   +    |
| **Document 3_AC**  | Code 3 |        |
| ...                |        |        |

> **File name**: document name\
> **Code**: any string\
> **On doc**: any string: on existing document; empty or missing: on separate file

The TSV file must be saved locally (in the active document folder); files starting with `_` take precedence. Blank lines and those starting with `#` are ignored (this will confuse Excel).

You can insert `|` for manually splitting the label into several lines.


#### **`ShowFonts.jsx`**
Shows all fonts used in the active document.

#### **`ShowProfiles.jsx`**
Shows all color profiles available to InDesign.

#### **`ShowProperties.jsx`** <small>F1</small>
Shows properties and methods of a selected object (for debugging purposes).

## Install

1. Clone or download from **Code ‣ Download ZIP**. The repository uses dynamically linked libraries from **`lib/`**, so the folder structure should be preserved; if you prefer stand-alone scripts, download the latest [release](https://github.com/pchiorean/Indentz/releases), where they are statically linked.
2. Open **Window ‣ Utilities ‣ Scripts**.
3. Right-click on folder **User** and select **Reveal in Finder/Explorer**.
4. Copy **Indentz** to this folder.

## About

All scripts are created by me unless otherwise noted.

© 2020-2023 Paul Chiorean \<jpeg AT basement.ro\>.\
The code is released under the MIT License (see [LICENSE.txt](LICENSE.txt)).

The code in this project would not have been possible without the InDesign ExtendScript API by [Theunis de Jong](http://jongware.mit.edu) and [Gregor Fellenz](https://www.indesignjs.de/extendscriptAPI/indesign-latest/), Mozilla's [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/About), and also blog posts, forum posts, tutorials or code by [Marc Autret](https://www.indiscripts.com), [Dave Saunders](http://jsid.blogspot.com), [Peter Kahrel](https://creativepro.com/files/kahrel/indesignscripts.html), [Gregor Fellenz](https://github.com/grefel/indesignjs), [Marijan Tompa](https://indisnip.wordpress.com), [Richard Harrington](https://github.com/richardharrington/indesign-scripts) and many others.

Thanks to Adrian Frigioiu for bug reports and feedback.

<small>Last updated: February 3, 2023</small>

[^1]: A visible area is a zone delimited by a frame named `<visible area>`, and it's used to mark the visible part of a poster, etc.; some scripts take it into account. When undefined, it fallbacks to the page/spread size.

[^2]: By default, the trigger zone is 1% of the visible area. The value is configurable by editing the constant `SNAP_PCT` from `fitTo()`.

[^3]: The codes are used by a customer who needs to manage POS posters in multiple locations and languages.
