# Indentz

This is a collection of InDesign scripts for various simple and repetitive tasks.

I often perform repeated, tedious, or time-consuming operations as a DTP operator, so I wrote several simple scripts to improve my workflow. Most are meant to be used with shortcuts[^1] (suggestions for the Mac platform below). Some require one or more objects on the page to be selected. Apart from error alerts, they do their job silently; however, some[^2] give a report if run with **Ctrl**.

The code was developed and tested in Adobe InDesign CC 2020–2023 on Mac (I mostly used [InDesign ExtendScript API 8.0](https://www.indesignjs.de/extendscriptAPI/indesign8/), compatibile with CS6). I'm a graphic designer, not a programmer, so be prepared for oversights and bugs (please create an [issue](https://github.com/pchiorean/Indentz/issues) if you encounter one, though!).

## Usage

### Cleanup

<small>_**Defaults and cleanup.**_</small>

#### **`DefaultPrefs.jsx`**
Sets some preferences for the active document. You should customize them to your workflow by editing the script.

<details><summary><strong>Click here for details</strong></summary>

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
> **View:** Show Rulers\
> **View ‣ Extras:** Show Frame Edges\
> **View ‣ Grids & Guides:** Show Guides; Unlock Guides; Snap to Guides\
> **Windows ‣ Color:** Fill: None; Stroke: None\
> **Windows ‣ Effects:** Blending Mode: Normal; Opacity: 100%\
> **Windows ‣ Output ‣ Attributes:** Nonprinting: Off\
> **Windows ‣ Pages:** Allow Document Pages to Shuffle\
> **Windows ‣ Text Wrap:** No text wrap\
> **Windows ‣ Type & Tables ‣ Paragraph:** Shading: Off

</details>

#### **`DefaultLayers.jsx`**
Adds a set of layers defined in a TSV data file named **`layers.tsv`** ([sample](samples/layers.tsv)) saved _locally_ (meaning the active document folder or its parent), or as a _global default_ (on the desktop, next to the script, or in **`Indentz`** root); local files and those starting with `_` take precedence:

| Name              | Color      | Visible | Printable | Order  | Variants                                           |
|:------------------|:-----------|:--------|:----------|:-------|:---------------------------------------------------|
| **.visible area** | Yellow     | yes     | yes       | above  | nicht sicht\*, rahmen, sicht\*, \*vi?ib\*          |
| **dielines**      | Magenta    | yes     | yes       | above  | cut\*, decoupe, die, die\*cut, stanz\*             |
| **text**          | Green      |         |           |        | copy, headline\*, hl, text\*, txt, typ?            |
| **artwork**       | Light Blue | no      | yes       | above  | aw, design, element?, layout\*                     |
| **bg**            | Red        |         |           | below  | back, \*background\*, bgg, fond, hg, hintergrund\* |
| **.reference**    | Black      | no      | no        | bottom | refer\*, template, vorlage                         |
| ...               |            |         |           |        |                                                    |

> **Name**: Layer name\
> **Color**: Layer color (defaults to `Light Blue`; see [**`UIColors.txt`**](misc/UIColors.txt) for color names)\
> **Visible**: `yes` or `no` (defaults to `yes`)\
> **Printable**: `yes` or `no` (defaults to `yes`)\
> **Order**: `above` or `below` existing layers, or `top`/`bottom` (defaults to `above`)\
> **Variants**: A list of layers that will be merged with the base layer; it's case insensitive and can take simple wildcards (`?` for exactly one character and `*` for zero or more characters)

**Additional features:**

A line may also contain a _statement_:

- `@includepath` `reference/path` – defines a folder to which subsequent relative paths will refer;
- `@include` `path/to/other.tsv` – includes another TSV file at this position; `path/to` may be absolute or relative – by default is relative to the data file folder, but if you defined a `reference/path`, it will be relative to that;
- `@defaults` – includes the global data file;

There's also some non-standard stuff that will confuse Excel et al.:

- Blank lines are ignored;
- Everything after a `#` is ignored (used for commenting);
- The fields can be visually aligned with spaces that will be ignored at processing (I use [VS Code](https://code.visualstudio.com) and [Rainbow CSV](https://marketplace.visualstudio.com/items?itemName=mechatroner.rainbow-csv));
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
> **Variants**: a list of swatches that will be replaced by the base swatch; it's case insensitive and can take simple wildcards (`?` for exactly one character and `*` for zero or more characters)

You can use [**`DumpSwatches.jsx`**](#dumpswatchesjsx) to save a tab delimited list of swatches from the active document.

<details><summary><strong>Additional features</strong></summary>

A line may also contain a _statement_:

- `@includepath` `reference/path` – defines a folder to which subsequent relative paths will refer;
- `@include` `path/to/other.tsv` – includes another TSV file at this position; `path/to` may be absolute or relative – by default is relative to the data file folder, but if you defined a `reference/path`, it will be relative to that;
- `@defaults` – includes the global data file;

There's also some non-standard stuff that will confuse Excel et al.:

- Blank lines are ignored;
- Everything after a `#` is ignored (used for commenting);
- The fields can be visually aligned with spaces that will be ignored at processing (I use [VS Code](https://code.visualstudio.com) and [Rainbow CSV](https://marketplace.visualstudio.com/items?itemName=mechatroner.rainbow-csv));
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
- `@include` `path/to/other.tsv` – includes another TSV file at this position; `path/to` may be absolute or relative – by default is relative to the data file folder, but if you defined a `reference/path`, it will be relative to that;
- `@defaults` – includes the global data file;

There's also some non-standard stuff that will confuse Excel et al.:

- Blank lines are ignored;
- Everything after a `#` is ignored (used for commenting);
- The fields can be visually aligned with spaces that will be ignored at processing (I use [VS Code](https://code.visualstudio.com) and [Rainbow CSV](https://marketplace.visualstudio.com/items?itemName=mechatroner.rainbow-csv));
- A very long line can be broken into multiple lines with a backslash (`\`) added at the end of each segment.

</details>

#### **`ReplaceLinks.jsx`**
Replaces document links using a TSV data file named **`links.tsv`** ([sample](samples/links.tsv)) saved _locally_ (meaning the active document folder or its parent), or as a _global default_ (on the desktop, next to the script, or in **`Indentz`** root); local files and those starting with `_` take precedence:

| Relink to                         | Document links               |
|:----------------------------------|:-----------------------------|
| **/absolute/path/to/img1.psd**    | img1_lowres.jpg, img1-rgb.\* |
| **img2.psd**                      | img2.\*                      |
| **`@includepath` reference/path** |                              |
| **img3.psd**                      |                              |
| **subfolder/img4.psd**            |                              |
| ...                               |                              |

> **Relink to** (also see **Additional features** below):
> - An absolute path of the form `/absolute/path/to/img1.psd`;
> - A relative path which is:
>   - relative (by default) to the document `Links` folder (`img2.psd`);
>   - relative to `reference/path` defined by a previous `@includepath` statement (`img3.psd` and `subfolder/img4.psd`).
> 
> **Document links:**
> - One or more document link names; it's case insensitive and can take simple wildcards (`?` for exactly one character and `*` for zero or more characters);
> - If empty, the _name_ from the first column will be used (so that if it's in the document, it will be replaced).

Quoting the paths is not required.\
You can use [**`DumpLinks.jsx`**](#dumplinksjsx) to save a list of links from the active document.

<details><summary><strong>Additional features</strong></summary>

A line may also contain a _statement_:

- `@includepath` `reference/path` – defines a folder to which subsequent relative paths will refer;
- `@include` `path/to/other.tsv` – includes another TSV file at this position; `path/to` may be absolute or relative – by default is relative to the data file folder, but if you defined a `reference/path`, it will be relative to that;
- `@defaults` – includes the global data file;

There's also some non-standard stuff that will confuse Excel et al.:

- Blank lines are ignored;
- Everything after a `#` is ignored (used for commenting);
- The fields can be visually aligned with spaces that will be ignored at processing (I use [VS Code](https://code.visualstudio.com) and [Rainbow CSV](https://marketplace.visualstudio.com/items?itemName=mechatroner.rainbow-csv));
- A very long line can be broken into multiple lines with a backslash (`\`) added at the end of each segment.

</details>

**Shortcut:** ⌥F8

#### **`ReplaceSnippets.jsx`**
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
- `@include` `path/to/other.tsv` – includes another TSV file at this position; `path/to` may be absolute or relative – by default is relative to the data file folder, but if you defined a `reference/path`, it will be relative to that;
- `@defaults` – includes the global data file;

There's also some non-standard stuff that will confuse Excel et al.:

- Blank lines are ignored;
- Everything after a `#` is ignored (used for commenting);
- The fields can be visually aligned with spaces that will be ignored at processing (I use [VS Code](https://code.visualstudio.com) and [Rainbow CSV](https://marketplace.visualstudio.com/items?itemName=mechatroner.rainbow-csv));
- A very long line can be broken into multiple lines with a backslash (`\`) added at the end of each segment.

</details>

**Shortcut:** ⌥F6

#### **`BreakLinkToStyles.jsx`**
Unnaplies paragraph/character/object styles from the selected objects or all objects in the document if nothing is selected.

#### **`DocCleanup.jsx`**
Performs a sequence of actions designed to bring the document to an approximately "clean" state:

- Sets some preferences (it runs [**`DefaultPrefs.jsx`**](#defaultprefsjsx));
- Unlocks all objects and resets their scaling to 100%;
- Deletes hidden objects (after confirmation);
- Deletes empty frames (after confirmation);
- Deletes unused swatches, layers and spreads;
- Converts empty text frames to generic frames;
- Converts empty frames to graphic frames;
- Resets default transparency effects;
- Resets visibility of some technical layers;
- Hides 'invisible' characters;
- Turns off URLs auto-updating;
- Sets the pasteboard margins.

**Shortcut:** F2

#### **`RemoveScriptLabels.jsx`**
Sometimes objects that have a script label attached are reused, which may create problems later. The script deletes the labels of the selected objects or all objects in the document if nothing is selected.

#### **`SwatchesCleanup.jsx`**
Converts process RGB swatches to CMYK and renames them to 'C= M= Y= K=' format. It also deletes unused swatches and removes duplicates. Spot colors are not changed.

**Shortcut:** ⇧F2

#### **`DumpLayers.jsx`**
Saves a TSV file (compatible with [**`DefaultLayers.jsx`**](#defaultlayersjsx)) containing the names and properties of the active document layers.

#### **`DumpLinks.jsx`**
Saves a TSV file (compatible with [**`ReplaceLinks.jsx`**](#replacelinksjsx-f8)) containing the links of the active document.

#### **`DumpSwatches.jsx`**
Saves a TSV file (compatible with [**`DefaultSwatches.jsx`**](#defaultswatchesjsx)) containing the names and properties of the active document swatches.

### Layout

<small>_**Document setup – page size, margins & columns, guides.**_</small>

#### **`PageSizeFromFilename.jsx`**
Sets the size of the page, the margins, and marks the _visible area_[^3], getting dimensions from the file name. It looks for pairs of numbers like `000x000` (where `000` means a group of at least one digit, followed or not by decimals, and optionally by `mm` or `cm`). If only one pair is found, it sets the size of the page. If two are found (e.g., `000x000_000x000`), the larger pair sets the page size, the smaller pair the visible area. If a one- or two-digit sequence follows, it sets the bleed. Example:

| File name                                       | Total size | Visible area | Bleed |
|:------------------------------------------------|:-----------|:-------------|:------|
| **Document1\_315x55\.indd**                     | 315×55     | –            | –     |
| **Document2\_1400x400\_700x137mm\.indd**        | 1400×400   | 700×137      | –     |
| **Document3\_597x517\_577x500.5\_3mm V4\.indd** | 597×517    | 577×500.5    | 3     |

**Shortcut:** F3

#### **`PageSizeFromMargins.jsx`**
Resizes the current page to its margins.

#### **`PageSizeFromSelection.jsx`**
Resizes the page to the selected objects.

**Shortcut:** ⇧F3

#### **`PageMarginsFromScriptName.jsx`**
Sets the page margins and optionally the HW area (expressed in percentage of the visible/page area), getting the values from the script name. It's designed to be duplicated and renamed to customize the values, using one or two numbers and the keyword `HW` – e.g., **`MG5HW10.jsx`** sets a value of 5% for the margins and 10% for the HW (`HW` can also be used alone, which sets it to 10%, or omitted, which sets it to 0).

#### **`PageMarginsFromSelection.jsx`**
Sets the page margins from the selected objects.

**Shortcut:** ⌥F3

#### **`GuidesAdd.jsx`**
If any page objects are selected, it adds guides around them. If nothing is selected, it adds guids on page edges and in the middle of margins; a second run deletes them.

#### **`GuidesDelete.jsx`**
Deletes all guides from the document.

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

#### **`ToggleAlignTo.jsx`**
Toggles **Align To** between selection, margins, page or spread (just run it repeatedly):

![Align Panel](img/alignto.png)

**Shortcut:** Num0

#### **`ResetAlignTo.jsx`**
Resets **Align To** to default (**Align to Selection**).

**Shortcut:** ⌃Num0

### Fit

<small>_**Reframe selected objects.**_</small>

#### **`FitTo*.jsx`**
These scripts reframe the selected objects to the target area specified in the script name (page/spread or their margins, bleed or _visible area_[^3]).

For example, running **`FitToPageBleed.jsx`** (⇧F11) on these two frames will expand the yellow one and shrink the red frame to the page bleed:

![Example](img/fit.png)

The refitting is done by:

- **Shrinking** the edges that hang outside the target area;

- **Extending** the edges that touch or are very close to a trigger zone (which is either the target or the visible area). By default this snap zone is 1% of the visible area[^4].

**Note:** Rectangular frames and straight lines are simply reframed; rotated objects, ovals, groups etc., are first inserted into a clipping frame. Only clipped objects, straight frames and lines are extended. Frames with an embedded object are only extended to the limits of that object.

The **`*Forced.jsx`** variants simply reframe the objects to the target area.

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

#### **`TextAutosize.jsx`**
Auto-sizes the selected text frames to their content.

It's designed to be run repeatedly. Each run increases the level with one step (from **None** to **Height Only**, and from **Height Only** to **Height and Width**), except single lines, which are always set **Height and Width**. The reference point is set by the first paragraph's alignment and the text frame's vertical justification:

| <small>Paragraph Alignment →<br>↓ Vertical Justification</small> | ![¶ Align left](img/paragraphalign-L.png) | ![¶ Align center](img/paragraphalign-C.png) | ![¶ Align right](img/paragraphalign-R.png) |
| :-: | :-: | :-: | :-: |
| ![Vertical Justification Top](img/verticaljustification-T.png) | ![top-left](img/textautosize-TL.png) | ![top-center](img/textautosize-TC.png) | ![top-right](img/textautosize-TR.png) |
| ![Vertical Justification Center](img/verticaljustification-C.png) | ![center-left](img/textautosize-CL.png) | ![center](img/textautosize-C.png) | ![center-right](img/textautosize-CR.png) |
| ![Vertical Justification Bottom](img/verticaljustification-B.png) | ![bottom-left](img/textautosize-BL.png) | ![bottom-center](img/textautosize-BC.png) | ![bottom-right](img/textautosize-BR.png) |

**Note:** A second run will preserve the current auto-sizing if only the alignment is changed.

**Shortcut:** F6

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

### File

#### **`FilesToSpreads.jsx`**
Combines the open documents, sorted alphabetically.

#### **`SpreadsToFiles.jsx`**
Saves each spread of the active document to a separate file.

If the file name ends with a _separator_ (space/dot/underline/hyphen) followed by _a sequence_ of digits or letters _equal_ to the number of spreads, each saved spread will have the letter corresponding to its index appended to its name – e.g., a document with three spreads named **`Document_ABC.indd`** will be split into **`Document_A.indd`** / **`Document_B.indd`** / **`Document_C.indd`**. If not autodetected, the script will prompt the user for a sequence.

By default the index will be appended at the end, but you can put a `#` in the file name to place the index at that particular position.

#### **`LayersToSpreads.jsx`**
Moves all layers of the active document to separate spreads (the document must have a single spread).

You may use **`SpreadsToFiles.jsx`** to split the result into separate documents.

### Export

#### **`QuickExport.jsx`**
My workflow requires frequent changes to export settings; the native export dialog has quite a few tabs and options, so I used to have a lot of Adobe PDF Presets with just a few differences. For many years I used Peter Kahrel's wonderful [Batch Convert](https://creativepro.com/files/kahrel/indesign/batch_convert.html), but I've always wanted a tool tailored to my needs. I made this script to have the frequently changed settings easily accessible and thus reduce the number of presets to the essential; I also added some other features that make my life easier.

There are two selectable workflows, with the options grouped into several categories. I will review the not self-explanatory ones:

![Quick export](img/script-quickexport.png)
![](img/script-quickexport-legend.svg)

**Source folder:**
- By default all open documents will be exported. If nothing is open, you can select a folder as the source.

**Preset options:**
- After selecting an Adobe PDF Preset you can override some of its options with just a few clicks: crop marks, page information, to include or not the slug area, to export as pages or as spreads, resolution, bleed etc.

**Document actions:**
- **Skip do-not-print layers** will not export layers with names beginning with a dot or a hyphen (e.g., **.safety area**); you can also define a custom list with **Edit list**.

- **Run a script** will run a JavaScript or AppleScript before exporting (e.g., one of the other scripts from this section).

**Output options:**
- **Export in a custom folder:** By default the files are exported in the same folder as the source document, but you can choose a custom one.

- **Add a suffix:** This text will be appended to the name of the exported files. **Note:** A preset can be 'paired' with a suffix by adding it to its name after the _last_ underscore: e.g., when you select `X4_350dpi_39L300_print`, the suffix will be automatically changed to `print`.

- **Sort files into subfolders by suffix**: Files will be exported in a subfolder named after the suffix, up to the first `+` character: e.g., for `print` the PDF will be exported as **`print/Document_print.pdf`**; for `print+diecut`, as **`print/Document_print+diecut.pdf`**.

- **Sort files into subfolders by date**: Files will be exported in a subfolder named **`MM.DD`** (current month/day).

- **Overwrite existing files:** The files will be overwritten _if_ the destination is the same. If unchecked, the files will get unique names by incrementing their index – for example, we'll export as `Document_preview3.pdf` if there is already a `Document_preview2.pdf` in the export folder or its subfolders.

**Updating source:**
- **Save modified:**: After export, modified documents can be updated (e.g., if you want to preserve changes made by a script).

- **Save all documents:** Documents will be saved regardless if modified or not. You can also enforce a **Save as** for all documents – this is useful for reducing the size of documents that have been modified many times (on each regular save the document grows with the latest changes).

**Global options:**
- **Upgrade [Converted] documents**: Upgrade or skip documents from previous versions of InDesign.

**Note:** If you keep the **Opt/Alt** key pressed while clicking **Start**, the script will run without saving the settings.

**Shortcut:** ⌃E

#### **`MarkVisibleArea.jsx`**
Creates a frame the size of the page margins that marks the _visible area_[^3]. It will use an existing **Visible area** swatch, or will create one with the values R=255 G=180 B=0.

#### **`PrepareForExport.jsx`**
Hides some _do-not-print_ layers: **covered area**, **visible area**, **safety area**, **segmentation**, and all layers starting with either a dot or a hyphen (for the full list see the script).

Moves all page objects from **varnish**, **uv**, **foil**, **silver** and **white** to separate spreads and labels them.

#### **`ShowDNPLayers.jsx`** / **`HideDNPLayers.jsx`**
Show or hide some _do-not-print_ layers: **covered area**, **visible area**, **safety area**, **segmentation**, and all layers starting with either a dot or a hyphen (for the full list see the script).

### View

#### **`TileAll.jsx`**
Invokes **Window ‣ Arrange ‣ Tile All Vertically**, **Tile All Horizontally**, or **Tile**, depending on the current spread orientation.

**Shortcut:** ⇧F4

#### **`ZoomTo300Percent.jsx`**
Zooms current layout window to 300%.

**Shortcut:** ⌘3

#### **`ZoomToSelection.jsx`**
It resembles **Fit Selection in Window** **<small>(⌥⌘=)</small>**, but with some changes:

- Brings the selection a little closer;
- If the cursor is in a text frame, zooms on the whole frame;
- Without anything selected zooms on the current spread.

**Shortcut:** F4

#### **`ZoomToSpreads.jsx`**
Zooms on the first 3 spreads.

**Shortcut:** ⌥F4

### Miscellaneous

#### **`Clip.jsx`**
To handle some objects, it may be useful to temporarily insert them into a container (clipping frame). The script inserts the selected objects into a clipping frame or restores them if they are already clipped.

**Note:** It uses the clipboard, so make sure you don't lose anything important.

**Shortcut:** Num\*

#### **`ClipUndo.jsx`**
Releases one or several objects from their clipping frames (you can select any objects, it will only release the clipped ones). If nothing is selected, it will release all clipped objects.

**Shortcut:** ⌃Num\*

#### **`EAN.jsx`**
This script is inspired by [**EAN Barcode Generator**](https://github.com/smorodsky/ean-barcode-generator) by Konstantin Smorodsky, that generates a document containing a user-provided sequence of barcodes. Occasionally, I work on flyers where I have dozens of barcodes to fill in, and I wanted to insert them semi-automatically instead of having to manually copy/paste and scale each one, so I made a simplified version that either inserted a single barcode directly into the selected object or created it in a new document. Later, however, I extended it to insert a sequence of barcodes in a multiple selection; eventually, I ended up reproducing much of the functionality of the original script. 🙂 The routine that generates the barcode is taken from the original script, refactored to make it standalone, and the rest of the code is original.

When nothing is selected, it creates a new document with each barcode on one page. If there are multiple frames (ideally rectangles) selected, the barcodes will be inserted in the order they were selected; if we have one barcode and multiple frames, the same barcode will be inserted into all of them.

Enter 8 or 13 digits for the code itself; if you have an add-on, add a hyphen and another 2 or 5 digits.

**Shortcut:** ⌥F9

#### **`LabelPage.jsx`**
Adds a custom label on the current page slug, on the **info** layer (Helvetica Regular 6 pt, fill **Registration**, stroke **Paper** 0.4 pt):

![Label Page](img/labelpage.png)

#### **`LabelPageRatios.jsx`**
Adds a label with the _visible area_[^3] ratio and page margins ratio on the slug of each page.

**Note:** If the visible area is not defined, it defaults to the page size.

#### **`OffsetPaths.jsx`**
This is a slightly modified version of [**OffsetPath**](https://creativepro.com/indesign-cad-tool/) by Olav Martin Kvern, which uses a clever method to create paths around selected objects at a custom offset distance:

> When you apply a Contour-type text wrap to an object, you’re creating a path around that object—and you can specify an offset distance. The text wrap path is accessible via scripting. That means that we could apply a text wrap with a given offset, then capture the path and path points of that path, turn off text wrap, and then create a new path from those geometric coordinates.

I fixed some bugs and added a default value, an option to join contours, and support for undoing.

#### **`QR.jsx`**
Adds a QR code on each spread of the active document (outside _visible area_[^3], if possible) or to separate PDF files:

|             On document             |             On file              |
|:-----------------------------------:|:--------------------------------:|
| ![QR on document](img/qr-ondoc.png) | ![QR on file](img/qr-onfile.png) |

If the document name ends with a _separator_ (space/dot/underline/hyphen) followed by a _sequence_ of digits or letters _equal_ to the number of spreads, the letter corresponding to the spread index will be appended to each code/file – e.g., for a document with three spreads named **`Document_ABC.indd`**, the script will generate **`Document_A_QR.pdf`**, **`Document_B_QR.pdf`** and **`Document_C_QR.pdf`**.

You can use `|` for manually splitting the label into several lines.

**Shortcut:** F9

#### **`QRBatch.jsx`**
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

The TSV file must be saved locally (in the active document folder); files starting with `_` take precedence.\
Blank lines are ignored; everything after a `#` (comments) is ignored.

You can use `|` for manually splitting the label into several lines.

**Shortcut:** ⇧F9

#### **`ShowFonts.jsx`**
Shows all fonts used in the active document.

#### **`ShowProfiles.jsx`**
Shows all color profiles available to InDesign.

#### **`ShowProperties.jsx`**
Shows properties and methods of a selected object (for debugging purposes).

**Shortcut:** F1

## Install

1. Clone or download from **Code ‣ Download ZIP**, or download the latest release.\
**Note:** The scripts from the repository recycle many bits of code, using dynamically linked libraries from **`lib/`**, meaning that the folder structure should be preserved if downloading the scripts in this way. If you prefer stand-alone scripts or just pick some as needed, download the latest [release](https://github.com/pchiorean/Indentz/releases), where they are statically linked[^5].
2. Open **Window ‣ Utilities ‣ Scripts**.
3. Right-click on folder **User** and select **Reveal in Finder/Explorer**.
4. Copy **Indentz** to this folder.

## About

All scripts are created by me unless otherwise noted.

© 2020-2023 Paul Chiorean \<jpeg AT basement.ro\>.\
The code is released under the MIT License (see [LICENSE.txt](LICENSE.txt)).

The code in this project would not have been possible without the InDesign ExtendScript API by [Theunis de Jong](http://jongware.mit.edu) and [Gregor Fellenz](https://www.indesignjs.de/extendscriptAPI/indesign-latest/), Mozilla's [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/About), and also blog posts, forum posts, tutorials or code by [Marc Autret](https://www.indiscripts.com), [Dave Saunders](http://jsid.blogspot.com), [Peter Kahrel](https://creativepro.com/files/kahrel/indesignscripts.html), [Gregor Fellenz](https://github.com/grefel/indesignjs), [Marijan Tompa](https://indisnip.wordpress.com), [Richard Harrington](https://github.com/richardharrington/indesign-scripts) and many others.

Thanks to Adrian Frigioiu for bug reports and feedback.

<small>Last updated: September 11, 2023</small>

[^1]: You can add shortcuts to scripts from **Edit ‣ Keyboard Shortcuts ‣ Product Area ‣ Scripts**.

[^2]: `DefaultLayers.jsx`, `DefaultSwatches.jsx`, `ReplaceFonts.jsx`, `ReplaceLinks.jsx`, `ReplaceSnippet.jsx`.

[^3]: A _visible area_ is a custom zone delimited by a frame named `<visible area>`, and it's used to mark the visible part of a poster, etc.; some scripts take it into account. When undefined, it fallbacks to the page/spread size.

[^4]: The value is configurable by editing the constant `SNAP_PCT` from `fitTo()`.

[^5]: Releases may be old, however. The latest version is in the [dev](https://github.com/pchiorean/Indentz/tree/dev) branch – this is what I actually use every day, so it's kind of tested, but… beware. ;)
