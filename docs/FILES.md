Legacy name                     | Name                             |   Fn  | Description
:---                            | :---                             |  ---: | :---
**Batch Resize**                                                           |
batch_resize.jsx                | **BatchResize**.jsx              |       | Automates the resizing of a master based on a size table.
**Cleanup**                                                                |
normalize_fonts.jsx             | **CleanupFonts**.jsx             |       | Replaces missing or unwanted fonts with equivalents from a list.
remove_all_labels.jsx           | **CleanupLabels**.jsx            |       | Removes all labels from the document.
remove_br_labels.jsx            | **CleanupLabelsBR**.jsx          |       | Removes all auto alignment labels used by BatchResize.jsx.
normalize_swatches.jsx          | **CleanupSwatches**.jsx          |       | Converts RGB swatches to CMYK, renames them to C= M= Y= K=, deletes unused.
delete_gremlins.jsx             | **DocCleanup**.jsx               |    F2 | Changes some settings, cleans up swatches/layers/pages/guides and resets scaling.
make_defaults.jsx               | **DocDefaults**.jsx              |   ⌥F2 | Makes default swatches/layers, cleans up fonts and sets page dimensions from the filename.
**Geometry**                                                               |
fit2page.jsx                    | **FitToPage**.jsx                |   F11 | Resizes the selected objects to the page size, if they exceed it.
fit2pagebleed.jsx               | **FitToPageBleed**.jsx           |  ⇧F11 | Resizes the selected objects to the page bleed size, if they exceed it.
fit2pagebleedF.jsx              | **FitToPageBleedForced**.jsx     | ⇧⌘F11 | Resizes the selected objects to the page bleed size.
fit2pagemargins.jsx             | **FitToPageMargins**.jsx         |  ⌥F11 | Resizes the selected objects to the page margins, if they exceed them.
fit2spread.jsx                  | **FitToSpread**.jsx              |   F12 | Resizes the selected objects to the spread size, if they exceed it.
fit2spreadbleed.jsx             | **FitToSpreadBleed**.jsx         |  ⇧F12 | Resizes the selected objects to the spread bleed size, if they exceed it.
fit2spreadbleedF.jsx            | **FitToSpreadBleedForced**.jsx   | ⇧⌘F12 | Resizes the selected objects to the spread bleed size.
fit2spreadmargins.jsx           | **FitToSpreadMargins**.jsx       |  ⌥F12 | Resizes the selected objects to the spread margins, if they exceed them.
undo_fitting.jsx                | **FitUndo**.jsx                  |       | Restores objects clipped in "\<clip group\>" by the "fit" scripts.
page_margins_from_selection.jsx | **PageMarginsFromSelection**.jsx |       | Sets the page margins to the selected objects bounds.
page_size_from_filename.jsx     | **PageSizeFromFilename**.jsx     |       | Sets every page size and margins based on the filename.
page_size_from_margins.jsx      | **PageSizeFromMargins**.jsx      |       | Sets the page size to the page margins.
page_size_from_selection.jsx    | **PageSizeFromSelection**.jsx    |       | Sets the page size to the selected objects bounds.
scale2pagemargins.jsx           | **ScaleToPageMargins**.jsx       |   ⌥F5 | Scales the selected objects to the page margins.
scale2pagemarginsH.jsx          | **ScaleToPageMarginsH**.jsx      |       | Scales the selected objects to the page top/bottom margins.
scale2pagemarginsW.jsx          | **ScaleToPageMarginsW**.jsx      |       | Scales the selected objects to the page left/right margins.
scale2pagesize.jsx              | **ScaleToPageSize**.jsx          |    F5 | Scales the selected objects to the page size.
scale2pagesizeH.jsx             | **ScaleToPageSizeH**.jsx         |       | Scales the selected objects to the page top/bottom size.
scale2pagesizeW.jsx             | **ScaleToPageSizeW**.jsx         |       | Scales the selected objects to the page left/right size.
fit2text.jsx                    | **TextAutosize**.jsx             |    F6 | Auto-sizes the text frame to the content, center aligned.
fit2textL.jsx                   | **TextAutosizeL**.jsx            |   ⌥F6 | Auto-sizes the text frame to the content, left aligned.
fit2textR.jsx                   | **TextAutosizeR**.jsx            |   ⌘F6 | Auto-sizes the text frame to the content, right aligned.
**Grid**                                                                   |
grid4epok.jsx                   | **GridEPOK**.jsx                 |       | Sets the page margins and columns to the EPOK grid system.
grid4lsbc.jsx                   | **GridLSBC**.jsx                 |       | Sets the page margins and puts in place some guides for the LS BC grid system.
**Print**                                                                  |
prepare4print.jsx               | **PrepareForPrint**.jsx          |       | Hides "safe area" layer and moves dielines to separate spreads.
safe_area.jsx                   | **SafeArea**.jsx                 |       | Creates a "safe area" frame, on every page/spread for which margins are defined.
safe_area_layer_hide.jsx        | **SafeAreaHideLayer**.jsx        |       | Hides the "safe area" layer (or equivalents).
safe_area_layer_show.jsx        | **SafeAreaShowLayer**.jsx        |       | Shows the "safe area" layer (or equivalents).
**Other**                                                                  |
zoom2selection.jsx              | **ZoomToSelection**.jsx          |    F4 | Zooms to the selected objects or, if nothing is selected, to the current spread.
**Miscellaneous**                                                          |
_playground.jsx                 | **_playground**.jsx              |   F10 | Used for testing.
finish.jsx                      | **_finish**.jsx                  |  ⌥F10 | Used for quick fixes.
hw.jsx                          | **HW**.jsx                       |       | WIP
page_ratios.jsx                 | **PageRatios**.jsx               |       | Calculates the ratio of each page and displays it in the upper left corner.
fonts_used.jsx                  | **ShowFonts**.jsx                |       | Shows all fonts used in the current document.
list_profiles.jsx               | **ShowProfiles**.jsx             |       | Shows all color profiles available to the document.
show_properties.jsx             | **ShowProperties**.jsx           |       | Shows all properties and methods of a selected object.

<!-- white_rama.jsx                  | **WhiteRama**.jsx                |       | -->

<!-- ⌃⌥⇧⌘ -->