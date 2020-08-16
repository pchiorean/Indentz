Name                               |   Fn  | Description
:---                               |  ---: | :---
**Align**                                  |
**`AlignToB.jsx`**                 |  Num2 | Aligns the selected objects to the bottom of the "Align To" setting
**`AlignToBL.jsx`**                |  Num1 | Aligns the selected objects to the bottom-left of the "Align To" setting
**`AlignToBR.jsx`**                |  Num3 | Aligns the selected objects to the bottom-right of the "Align To" setting
**`AlignToC.jsx`**                 |  Num5 | Aligns the selected objects to the center of the "Align To" setting
**`AlignToL.jsx`**                 |  Num4 | Aligns the selected objects to the left of the "Align To" setting
**`AlignToR.jsx`**                 |  Num6 | Aligns the selected objects to the right of the "Align To" setting
**`AlignToT.jsx`**                 |  Num8 | Aligns the selected objects to the top of the "Align To" setting
**`AlignToTL.jsx`**                |  Num7 | Aligns the selected objects to the top-left of the "Align To" setting
**`AlignToTR.jsx`**                |  Num9 | Aligns the selected objects to the top-right of the "Align To" setting
**`ResetAlignTo.jsx`**             | ⌃Num0 | Resets "Align To" setting to default
**`ToggleAlignTo.jsx`**            |  Num0 | Toggles "Align To" setting
**Cleanup**                                |
**`CleanupFonts.jsx`**             |       | Replaces missing or unwanted fonts with equivalents from a list
**`CleanupLabels.jsx`**            |       | Removes all labels from the document
**`CleanupSwatches.jsx`**          |   ⇧F2 | Converts RGB swatches to CMYK, renames them to C= M= Y= K=, deletes unused
**`DocCleanup.jsx`**               |    F2 | Changes some settings, cleans up swatches/layers/pages/guides and resets scaling
**`DocDefaults.jsx`**              |   ⌥F2 | Makes default swatches/layers, cleans up fonts and sets page dimensions from the filename
**Geometry**                               |
**`FitToPage.jsx`**                |   F11 | Resizes the selected objects to the page size, if they exceed it
**`FitToPageBleed.jsx`**           |  ⇧F11 | Resizes the selected objects to the page bleed size, if they exceed it
**`FitToPageBleedForced.jsx`**     | ⇧⌘F11 | Resizes the selected objects to the page bleed size
**`FitToPageMargins.jsx`**         |  ⌥F11 | Resizes the selected objects to the page margins, if they exceed them
**`FitToSpread.jsx`**              |   F12 | Resizes the selected objects to the spread size, if they exceed it
**`FitToSpreadBleed.jsx`**         |  ⇧F12 | Resizes the selected objects to the spread bleed size, if they exceed it
**`FitToSpreadBleedForced.jsx`**   | ⇧⌘F12 | Resizes the selected objects to the spread bleed size
**`FitToSpreadMargins.jsx`**       |  ⌥F12 | Resizes the selected objects to the spread margins, if they exceed them
**`FitUndo.jsx`**                  |       | Restores objects clipped in "\<clip group\>" by the "fit" scripts
**`PageMarginsFromSelection.jsx`** |       | Sets the page margins to the selected objects bounds
**`PageSizeFromFilename.jsx`**     |       | Sets every page size and margins based on the filename
**`PageSizeFromMargins.jsx`**      |       | Sets the page size to the page margins
**`PageSizeFromSelection.jsx`**    |       | Sets the page size to the selected objects bounds
**`ScaleToPageMargins.jsx`**       |   ⌥F5 | Scales the selected objects to the page margins
**`ScaleToPageMarginsH.jsx`**      |       | Scales the selected objects to the page top/bottom margins
**`ScaleToPageMarginsW.jsx`**      |       | Scales the selected objects to the page left/right margins
**`ScaleToPageSize.jsx`**          |    F5 | Scales the selected objects to the page size
**`ScaleToPageSizeH.jsx`**         |       | Scales the selected objects to the page top/bottom size
**`ScaleToPageSizeW.jsx`**         |       | Scales the selected objects to the page left/right size
**`TextAutosize.jsx`**             |    F6 | Auto-sizes the text frame to the content
**Print**                                  |
**`PrepareForPrint.jsx`**          |       | Hides "safe area" layer and moves dielines to separate spreads
**`SafeArea.jsx`**                 |       | Creates a "safe area" frame, on every page/spread for which margins are defined
**`SafeAreaHideLayer.jsx`**        |       | Hides the "safe area" layer (or equivalents)
**`SafeAreaShowLayer.jsx`**        |       | Shows the "safe area" layer (or equivalents)
**Other**                                  |
**`QR.jsx`**                       |       | Adds a QR code to the current document or to a separate file
**`ZoomToSelection.jsx`**          |    F4 | Zooms to the selected objects or, if nothing is selected, to the current spread
**Miscellaneous**                          |
**`_playground.jsx`**              |   F10 | Used for testing
**`_finish.jsx`**                  |  ⌥F10 | Used for quick fixes
**`HW.jsx`**                       |       | WIP
**`PageRatios.jsx`**               |       | Calculates the ratio of each page and displays it in the upper left corner
**`ShowFonts.jsx`**                |       | Shows all fonts used in the current document
**`ShowProfiles.jsx`**             |       | Shows all color profiles available to the document
**`ShowProperties.jsx`**           |       | Shows all properties and methods of a selected object

<!-- ⌃⌥⇧⌘ -->