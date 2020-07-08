Legacy name                     | Name                             |  Fn  | Description
---                             | ---                              | ---: | ---
**Batch Resize**                                                          |
batch_resize.jsx                | **BatchResize**.jsx              |      | This script automates the resizing of a master based on a size table.
**Geometry**                                                              |
fit2page.jsx                    | **FitToPage**.jsx                |  F11 | This script resizes the selected objects to the page size, if they exceed it.
fit2pagebleed.jsx               | **FitToPageBleed**.jsx           | ⇧F11 | This script resizes the selected objects to the page bleed size, if they exceed it.
fit2pagebleedF.jsx              | **FitToPageBleedForced**.jsx     | ⌘F11 | This script resizes the selected objects to the page bleed size.
fit2pagemargins.jsx             | **FitToPageMargins**.jsx         | ⌥F11 | This script resizes the selected objects to the page margins, if they exceed them.
fit2spread.jsx                  | **FitToSpread**.jsx              |  F12 | This script resizes the selected objects to the spread size, if they exceed it.
fit2spreadbleed.jsx             | **FitToSpreadBleed**.jsx         | ⇧F12 | This script resizes the selected objects to the spread bleed size, if they exceed it.
fit2spreadbleedF.jsx            | **FitToSpreadBleedForced**.jsx   | ⌘F12 | This script resizes the selected objects to the spread bleed size.
fit2spreadmargins.jsx           | **FitToSpreadMargins**.jsx       | ⌥F12 | This script resizes the selected objects to the spread margins, if they exceed them.
undo_fitting.jsx                | **FitUndo**.jsx                  |      | This script restores objects clipped in "\<clip group\>" by the "fit" scripts.
page_margins_from_selection.jsx | **PageMarginsFromSelection**.jsx |      | This script sets the page margins to the selected objects bounds.
page_size_from_filename.jsx     | **PageSizeFromFilename**.jsx     |      | This script sets every page size and margins based on the filename.
page_size_from_margins.jsx      | **PageSizeFromMargins**.jsx      |      | This script sets the page size to the page margins.
page_size_from_selection.jsx    | **PageSizeFromSelection**.jsx    |      | This script sets the page size to the selected objects bounds.
scale2pagemargins.jsx           | **ScaleToPageMargins**.jsx       |  ⌥F5 | This script scales the selected objects to the page margins.
scale2pagemarginsH.jsx          | **ScaleToPageMarginsH**.jsx      |      | This script scales the selected objects to the page top/bottom margins.
scale2pagemarginsW.jsx          | **ScaleToPageMarginsW**.jsx      |      | This script scales the selected objects to the page left/right margins.
scale2pagesize.jsx              | **ScaleToPageSize**.jsx          |   F5 | This script scales the selected objects to the page size.
scale2pagesizeH.jsx             | **ScaleToPageSizeH**.jsx         |      | This script scales the selected objects to the page top/bottom size.
scale2pagesizeW.jsx             | **ScaleToPageSizeW**.jsx         |      | This script scales the selected objects to the page left/right size.
fit2text.jsx                    | **TextAutosize**.jsx             |   F6 | This script auto-sizes the text frame to the content, center aligned.
fit2textL.jsx                   | **TextAutosizeL**.jsx            |  ⇧F6 | This script auto-sizes the text frame to the content, left aligned.
fit2textR.jsx                   | **TextAutosizeR**.jsx            |  ⌘F6 | This script auto-sizes the text frame to the content, right aligned.
**Miscellaneous**                                                         |
_playground.jsx                 | **_playground**.jsx              |  F10 | Used for testing.
finish.jsx                      | **Finish**.jsx                   | ⇧F10 | Used for quick fixes.
fonts_used.jsx                  | **FontsUsed**.jsx                |      | This script makes a list of the fonts used in the current document.
hw.jsx                          | **HW**.jsx                       |      | WIP
list_profiles.jsx               | **ListProfiles**.jsx             |      | This script shows all color profiles available to the document.
show_properties.jsx             | **ShowProperties**.jsx           |      | This script shows all properties and methods of a selected object.
white_rama.jsx                  | **WhiteRama**.jsx                       |
**Other**                                                                 |
normalize_fonts.jsx             | **CleanupFonts**.jsx             |      | This script replaces missing or unwanted fonts with their equivalents.
remove_all_labels.jsx           | **CleanupLabels**.jsx            |      | This script removes all labels from the document.
remove_br_labels.jsx            | **CleanupLabelsBR**.jsx          |      | This script removes all auto alignment labels used by BatchResize.jsx.
normalize_swatches.jsx          | **CleanupSwatches**.jsx          |      | This script converts swatches to CMYK, renames them to C= M= Y= K=, deletes unused.
delete_gremlins.jsx             | **DocCleanup**.jsx               |   F2 | This script sets default settings, cleans up swatches/layers/pages/guides and resets scaling.
make_defaults.jsx               | **DocDefaults**.jsx              |  ⇧F2 | This script makes default swatches/layers, cleans up fonts and sets page dimensions from the filename.
grid4epok.jsx                   | **GridEPOK**.jsx                 |      | This script sets the page margins and columns to the EPOK grid system.
grid4lsbc.jsx                   | **GridLSBC**.jsx                 |      | This script sets the page margins and puts in place some guides for the LS BC grid system.
page_ratios.jsx                 | **PageRatios**.jsx               |      | This script calculates the ratio of each page and displays it in the upper left corner.
prepare4print.jsx               | **PrepareForPrint**.jsx          |      | This script hides "safe area" layer and moves dielines to separate spreads.
safe_area.jsx                   | **SafeArea**.jsx                 |      | This script creates a "safe area" frame, on every page/spread for which margins are defined.
safe_area_layer_hide.jsx        | **SafeAreaHideLayer**.jsx        |      | This script hides the "safe area" layer (or equivalents).
safe_area_layer_show.jsx        | **SafeAreaShowLayer**.jsx        |      | This script shows the "safe area" layer (or equivalents).
zoom2selection.jsx              | **ZoomToSelection**.jsx          |   F4 | This script zooms to the selected objects or, if nothing is selected, to the current spread.

<!-- ⌃⌥⇧⌘ -->