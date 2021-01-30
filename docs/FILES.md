Name                              |    Fn  | Description
:---                              |   ---: | :---
**[ Alignment ]**                          |
**AlignToBL.jsx**                 |   Num1 | Aligns the selected objects to the bottom-left of the **Align To** setting
**AlignToB.jsx**                  |   Num2 | Aligns the selected objects to the bottom of the **Align To** setting
**AlignToBR.jsx**                 |   Num3 | Aligns the selected objects to the bottom-right of the **Align To** setting
**AlignToL.jsx**                  |   Num4 | Aligns the selected objects to the left of the **Align To** setting
**AlignToC.jsx**                  |   Num5 | Aligns the selected objects to the center of the **Align To** setting
**AlignToR.jsx**                  |   Num6 | Aligns the selected objects to the right of the **Align To** setting
**AlignToTL.jsx**                 |   Num7 | Aligns the selected objects to the top-left of the **Align To** setting
**AlignToT.jsx**                  |   Num8 | Aligns the selected objects to the top of the **Align To** setting
**AlignToTR.jsx**                 |   Num9 | Aligns the selected objects to the top-right of the **Align To** setting
**ResetAlignTo.jsx**              |  ⌃Num0 | Resets the **Align To** setting to default
**ToggleAlignTo.jsx**             |   Num0 | Toggles the **Align To** setting
**[ Proxy ]**                              |
**SetRefPointToBL.jsx**           |  ⌃Num1 | Sets **Transform Reference Point** to bottom-left
**SetRefPointToB.jsx**            |  ⌃Num2 | Sets **Transform Reference Point** to bottom
**SetRefPointToBR.jsx**           |  ⌃Num3 | Sets **Transform Reference Point** to bottom-right
**SetRefPointToL.jsx**            |  ⌃Num4 | Sets **Transform Reference Point** to left
**SetRefPointToC.jsx**            |  ⌃Num5 | Sets **Transform Reference Point** to center
**SetRefPointToR.jsx**            |  ⌃Num6 | Sets **Transform Reference Point** to right
**SetRefPointToTL.jsx**           |  ⌃Num7 | Sets **Transform Reference Point** to top-left
**SetRefPointToT.jsx**            |  ⌃Num8 | Sets **Transform Reference Point** to top
**SetRefPointToTR.jsx**           |  ⌃Num9 | Sets **Transform Reference Point** to top-right
**[ Fitting ]**                            |
**FitToPage.jsx**                 |    F11 | Resizes the selected objects to the page size
**FitToPageBleed.jsx**            |   ⇧F11 | Resizes the selected objects to the page bleed size
**FitToPageMargins.jsx**          |   ⌥F11 | Resizes the selected objects to the page margins
**FitToPageSafeArea.jsx**         |  ⌥⇧F11 | Resizes the selected objects to the page safe area
**FitToSpread.jsx**               |    F12 | Resizes the selected objects to the spread size
**FitToSpreadBleed.jsx**          |   ⇧F12 | Resizes the selected objects to the spread bleed size
**FitToSpreadMargins.jsx**        |   ⌥F12 | Resizes the selected objects to the spread margins
**FitToSpreadSafeArea.jsx**       |  ⌥⇧F12 | Resizes the selected objects to the spread safe area
**FitToPageForced.jsx**           |   ⌘F11 | Resizes the selected objects to the page size, forced
**FitToPageBleedForced.jsx**      |  ⇧⌘F11 | Resizes the selected objects to the page bleed size, forced
**FitToPageMarginsForced.jsx**    |  ⌥⌘F11 | Resizes the selected objects to the page margins, forced
**FitToPageSafeAreaForced.jsx**   | ⌥⇧⌘F11 | Resizes the selected objects to the page safe area, forced
**FitToSpreadForced.jsx**         |   ⌘F12 | Resizes the selected objects to the spread size, forced
**FitToSpreadBleedForced.jsx**    |  ⇧⌘F12 | Resizes the selected objects to the spread bleed size, forced
**FitToSpreadMarginsForced.jsx**  |  ⌥⌘F12 | Resizes the selected objects to the spread margins, forced
**FitToSpreadSafeAreaForced.jsx** | ⌥⇧⌘F12 | Resizes the selected objects to the spread safe area, forced
**TextAutosize.jsx**              |     F6 | Auto-sizes the text frame to the content
**[ Scaling ]**                            |
**ScaleToPageMargins.jsx**        |    ⌥F5 | Scales the selected objects to the page margins
**ScaleToPageMarginsH.jsx**       |        | Scales the selected objects to the page top/bottom margins
**ScaleToPageMarginsW.jsx**       |        | Scales the selected objects to the page left/right margins
**ScaleToPageSize.jsx**           |     F5 | Scales the selected objects to the page size
**ScaleToPageSizeH.jsx**          |        | Scales the selected objects to the page top/bottom size
**ScaleToPageSizeW.jsx**          |        | Scales the selected objects to the page left/right size
**[ Printing ]**                           |
**PrepareForPrint.jsx**           |        | Hides safe area layer and moves dielines to separate spreads
**SafeArea.jsx**                  |        | Creates a safe area frame the size of the page margins
**SafeAreaHideLayer.jsx**         |        | Hides the safe area layer (or equivalents)
**SafeAreaShowLayer.jsx**         |        | Shows the safe area layer (or equivalents)
**[ Setup ]**                              |
**DefaultPrefs.jsx**              |        | Sets default preferences
**DefaultLayers.jsx**             |        | Adds/merges layers from a list
**DefaultSwatches.jsx**           |        | Adds swatches from a list
**CleanupSwatches.jsx**           |    ⇧F2 | Converts RGB swatches to CMYK, renames them to C= M= Y= K=, deletes unused
**ReplaceFonts.jsx**              |        | Replaces fonts from a substitution list
**DocCleanup.jsx**                |     F2 | Changes some settings, cleans up swatches/layers/pages and resets scaling
**DocDefaults.jsx**               |    ⌥F2 | Adds swatches/layers, cleans up fonts and sets page dimensions from the filename
**PageMarginsFromSelection.jsx**  |        | Sets the page margins to the selected objects bounds
**PageSizeFromFilename.jsx**      |     F3 | Sets every page size and margins according to the filename
**PageSizeFromMargins.jsx**       |    ⌥F3 | Sets the page size to the page margins
**PageSizeFromSelection.jsx**     |    ⇧F3 | Sets the page size to the selected objects bounds
**[ Miscellaneous ]**                      |
**Clip.jsx**                      |   Num* | Clips selected objects in a '\<clip frame\>', or restores them
**ClipUndo.jsx**                  |  ⌃Num* | Restores objects clipped in a '\<clip group\>' by the 'FitTo' scripts
**CleanupLabels.jsx**             |        | Removes all labels from the document
**HW.jsx**                        |   ⇧F10 | Labels 'HW' selected objects; w/o selection, adds a 10% bottom guide
**PageRatios.jsx**                |        | Calculates the ratio of each page and displays it in the upper left corner
**PagesToFiles.jsx**              |        | Saves the pages of the active document in separate files
**QR.jsx**                        |     F9 | Adds a QR code to the current document or to a separate file
**TileAll.jsx**                   |    ⇧F4 | Invokes 'Tile All Vertically/Horizontally', depending on current spread orientation
**ZoomToSelection.jsx**           |     F4 | Zooms to the selected objects or, if nothing is selected, to the current spread
**ShowFonts.jsx**                 |        | Shows all fonts used in the current document
**ShowProfiles.jsx**              |        | Shows all color profiles available to the document
**ShowProperties.jsx**            |        | Shows all properties and methods of a selected object

<!-- ⌃⌥⇧⌘ -->