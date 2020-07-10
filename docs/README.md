Collection of InDesign scripts for simple and repetitive tasks: resizing objects to the page geometry or modifying it; creating positioning grids for certain brands; cleaning up the document and making default layers and special colors; preparing for print; better zooming.

Many of them are designed to be run through a shortcut. You can found a configuration suggestion in the [Shortcuts](#shortcuts) section. Some are intended to be run in the [**batch_convert.jsx**](https://creativepro.com/files/kahrel/indesign/batch_convert.html) script by Peter Kahrel.

## Description

### DocCleanup/DocDefaults

These are two scripts meant to be used together – one "cleans", the other "prepares the ground".

First, they change some settings according to my preferences, as follows:

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
> **Layers:** Ungroup Remembers Layers \
> **Layers:** Paste Remembers Layers \
> **Transform Reference Point:** Center \
> **Type Options:** Use Typographer's Quotes \
> **Type Options:** Apply Leading to Entire Paragraphs

After which:

* **DocCleanup** cleans up unused swatches/layers/pages, unlocks all items, resets their scaling to 100%, removes all guides.

* **DocDefaults** creates some swatches & layers, merges similar layers, replaces some missing or unwanted fonts, and sets the page geometry from the filename.

  ![Swatches & layers](img/docdefaults.png)

  The script detects and merges several similar layers, as follows:

  Before | After
  :--- | :---
  Visible, visible, Vizibil, vizibil, Vis. area, vis. area, visible area, Visible area | `safe area`
  Cut, diecut, die cut, Die Cut, cut lines, stanze, Stanze, decoupe | `dielines`
  UV, Varnish | `varnish`
  WHW, WH, wh, hw, Hw Logo | `HW`
  Type, TEXT, TEXTES, Text, text, txt, copy | `type`
  Ebene 1, Calque 1, Artwork, AW, Layouts, Layout, layout, Layer_lucru | `artwork`
  background, BACKGROUND, BG, HG, Hintergrund | `bg`

### CleanupFonts

Replaces some missing or unwanted fonts with equivalents. For now, the list is hardcoded in the script, but can be edited with a text editor:

Before | After
:--- | :---
Akzidenz Grotesk Bold | **AkzidenzGrotesk Bold**
Arial Bold | **Helvetica Neue Bold**
FoundryGridnik Regular | **Foundry Gridnik Regular**
FoundryGridnik Bold | **Foundry Gridnik Bold**
FoundryGridnik Medium | **Foundry Gridnik Medium**
Gotham Light Regular | **Gotham Light**
Gotham Book Regular | **Gotham Book**
Gotham Medium Regular | **Gotham Medium**
Gotham Bold Regular | **Gotham Bold**
Gotham Black Regular | **Gotham Black**
Helvetica Neue LT Std 65 Medium | **Helvetica Neue Medium**
Helvetica Neue LT Std 75 Bold | **Helvetica Neue Bold**
Trade Gothic LT Std Bold Condensed No. 20 | **Trade Gothic for LS Bold Condensed No. 20**
Trade Gothic LT Std Condensed No. 18 | **Trade Gothic for LS Condensed No. 18**

### CleanupLabels

Sometimes objects that have a label attached _(Script Label)_ are reused, which potentially creates problems later.

* **CleanupLabels** deletes all labels from a document.

* **CleanupLabelsBR** deletes only the tags used by the **BatchResize** script:
  > `alignL`, `alignR`, `alignT`, `alignB`, `alignTL`, `alignBL`, `alignTR`, `alignBR`, `alignC`, `alignCh`, `alignCv`, `fit`, `bleed`.

### CleanupSwatches

Converts RGB process colors to CMYK, removes duplicates, sets every name in "C= M= Y= K=" form and deletes unused swatches. Spot colors remain unchanged.

<!-- ![Clean swatches](img/cleanupswatches.gif) -->

### FitToPage/FitToSpread series

Resize one or more selected objects, without scaling them. Ordinary frames are simply resized. In order not to deform them, rotated objects, ovals, groups, etc. are clipped in a frame and this is resized. If you run the script a second time on such an object, it will restore it.

* **FitToPage/Margins/Bleed** constrain the size of an object to the size of the page, the page margins, or the page bleed.

* **FitToSpread/Margins/Bleed** do the same for pages grouped in a spread.

* **FitToPageBleedForced** and **FitToPageSpreadForced** resize exactly to the page or the spread bleed. They are useful, for example, for the background image.

* **FitUndo**: if you want to restore all objects at once.

<!-- ![Înainte](img/fittopage.gif) -->

### ScaleToPage series

These also work with one or more objects, but scale them proportionally, as a block.

* **ScaleToPageSize** and **ScaleToPageMargins** scale to the page size or page margins.

* The **H** (height) and **W** (width) variants scale to the height or width of the page or page margins.

<!-- ![Înainte](img/scaletopage.gif) -->

### PageSize series

Resize the pages of the document based on the file name, page margins, or selected objects.

* **PageSizeFromFilename** searches the file name for pairs of numbers like "000x000" (where "000" means a group of at least one digit, followed or not by decimals, and optionally by "mm" or "cm"). If only one pair is found, it will be the size of the page. If two are found (e.g. "000x000_000x000"), the larger pair will be the page size, the smaller pair the visible/safe area size. If followed by a one- or two-digit sequence, this is considered bleed.

  Example:
  > VYPE_FR_MentholBan_Sticker_Vitrine_Phrase_**1400x400_700x137_5**mm.indd

* **PageSizeFromMargins** resizes each page to its margins.

* **PageSizeFromSelection** resizes the current page to the selected objects (similar to **Artboards > Fit to Selected Art** in Illustrator).

### PageMarginsFromSelection

Sets the page margins to the selected objects.

### TextAutosize series

Fit the frame to the text and sets auto-sizing, vertical justification and paragraph alignment:

* **TextAutosize**: _Auto-Sizing: center. Vertical Justification: center. Paragraph: align center._

* **TextAutosizeL**: _Auto-Sizing: top-left. Vertical Justification: top. Paragraph: align left._

* **TextAutosizeR**: _Auto-Sizing: top-right. Vertical Justification: top. Paragraph: align right._

_Auto-Sizing Type_ will be set to _Height and width_ if the text has only one line. If it has multiple lines, the first run will set to _Height only_, the second run _Height and width_ (in which case care must be taken that the text is broken manually).

<!-- ![Înainte](img/textautosize.gif) -->

### Grid series

Create positioning grids for certain brands.

* **GridEPOK** sets the page margins and the number of columns according to the EPOK grid system.

* **GridLSBC** sets the page margins and some guides according to Lucky Strike BC guidelines.

### Print series

These are making some preparations for export and can be run in **batch_convert.jsx**.

* **PrepareForPrint** hides the `safe area` layer and moves the dielines from `dielines` layer to separate spreads.

* **SafeArea** creates a frame the size of the page margins on the `safe area`.

* **SafeAreaHideLayer** and **SafeAreaShowLayer** hide or show `safe area`.

The scripts detect similar layers like `visible`, `vizibil`, `vis. area` or `diecut`, `die cut`, `cut lines`, `stanze`.

### ZoomToSelection

Similar to **Fit Selection in Window** (⌥⌘=), but with some improvements:

* brings the selection a little closer;
* if the cursor is in the text, zooms on the whole frame;
* without anything selected zooms on the spread.

## Shortcuts

Script | Fn | Script | Fn | Script | Fn
:--- | ---: | :--- | ---: | :--- | ---:
**DocCleanup** | F2 | **DocDefaults** | ⌥F2
**FitToPage** | F11 | **FitToPageMargins** | ⌥F11 | **FitToPageBleed** | ⇧F11
||||| **FitToPageBleedForced** | ⌘F11
**FitToSpread** | F12 | **FitToSpreadMargins** | ⌥F12 | **FitToSpreadBleed** | ⇧F12
||||| **FitToSpreadBleedForced** | ⌘F12
**ScaleToPageSize** | F5 | **ScaleToPageMargins** | ⌥F5
**TextAutosize** | F6 | **TextAutosizeL** | ⌥F6 | **TextAutosizeR** | ⌘F6
**ZoomToSelection** | F4

<!-- ![Shortcuts](img/shortcuts.png) -->

## Installing

1. Open Adobe InDesign.
2. Choose **Window > Utilities > Scripts**.
3. In the _Scripts panel_, right click on **User** and choose **Reveal in Finder** (Mac) or **Reveal in Explorer** (PC).
4. Copy the files inside the **Scripts Panel** folder.
