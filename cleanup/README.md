## CleanupFonts

Replaces some missing or unwanted fonts with equivalents from a list. The list is a 4 column TSV *(tab-separated values)* file with the same name as the script. The first line (the header) is ignored. The current list is as follows:

Old Name | Style | New Name | Style
:--- | :--- | :--- | :---
Akzidenz Grotesk | Bold | **AkzidenzGrotesk** | **Bold**
Arial | Bold | **Helvetica Neue** | **Bold**
FoundryGridnik | Regular | **Foundry Gridnik** | **Regular**
FoundryGridnik | Bold | **Foundry Gridnik** | **Bold**
FoundryGridnik | Medium | **Foundry Gridnik** | **Medium**
Gotham Light | Regular | **Gotham** | **Light**
Gotham Book | Regular | **Gotham** | **Book**
Gotham Medium | Regular | **Gotham** | **Medium**
Gotham Bold | Regular | **Gotham** | **Bold**
Gotham Black | Regular | **Gotham** | **Black**
Helvetica Neue LT Std | 65 Medium | **Helvetica Neue** | **Medium**
Helvetica Neue LT Std | 75 Bold | **Helvetica Neue** | **Bold**
Trade Gothic LT Std | Bold Condensed No. 20 | **Trade Gothic for LS** | **Bold Condensed No. 20**
Trade Gothic LT Std | Condensed No. 18 | **Trade Gothic for LS** | **Condensed No. 18**

You can use **ShowFonts** to get a tab delimited list of used fonts.

## CleanupLabels

Sometimes objects that have a label attached _(Script Label)_ are reused, which potentially creates problems later.

* **CleanupLabels** deletes all labels from a document.

* **CleanupLabelsBR** deletes only the tags used by the **BatchResize** script:
  > `alignL`, `alignR`, `alignT`, `alignB`, `alignTL`, `alignBL`, `alignTR`, `alignBR`, `alignC`, `alignCh`, `alignCv`, `fit`, `bleed`.

## CleanupSwatches

Converts RGB process colors to CMYK, removes duplicates, sets every name in "C= M= Y= K=" form and deletes unused swatches. Spot colors remain unchanged.

## DocCleanup/DocDefaults

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

  ![Swatches & layers](../docs/img/docdefaults.png)

  The script merges several similar layers, as follows:

  Layer | Merged to
  :--- | :---
  Visible, visible, Vizibil, vizibil, Vis. area, vis. area, visible area, Visible area | `safe area`
  Cut, diecut, die cut, Die Cut, cut lines, stanze, Stanze, decoupe | `dielines`
  UV, Varnish | `varnish`
  WHW, WH, wh, hw, Hw Logo | `HW`
  Type, TEXT, TEXTES, Text, text, txt, copy | `type`
  Ebene 1, Calque 1, Artwork, AW, Layouts, Layout, layout, Layer_lucru | `artwork`
  background, BACKGROUND, BG, HG, Hintergrund | `bg`