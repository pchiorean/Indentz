Name                               |    Fn  | Description
:-                                 |     -: | :-
**Alignment**                               |
`AlignToTL.jsx`                    |   Num7 | Aligns the selected objects to the top-left of the **Align To** setting
`AlignToT.jsx`                     |   Num8 | Aligns the selected objects to the top of the **Align To** setting
`AlignToTR.jsx`                    |   Num9 | Aligns the selected objects to the top-right of the **Align To** setting
`AlignToL.jsx`                     |   Num4 | Aligns the selected objects to the left of the **Align To** setting
`AlignToC.jsx`                     |   Num5 | Aligns the selected objects to the center of the **Align To** setting
`AlignToR.jsx`                     |   Num6 | Aligns the selected objects to the right of the **Align To** setting
`AlignToBL.jsx`                    |   Num1 | Aligns the selected objects to the bottom-left of the **Align To** setting
`AlignToB.jsx`                     |   Num2 | Aligns the selected objects to the bottom of the **Align To** setting
`AlignToBR.jsx`                    |   Num3 | Aligns the selected objects to the bottom-right of the **Align To** setting
`ResetAlignTo.jsx`                 |  ⌃Num0 | Resets the **Align To** setting to default
`ToggleAlignTo.jsx`                |   Num0 | Toggles the **Align To** setting
**Proxy**                                   |
`SetRefPointToTL.jsx`              |  ⌃Num7 | Sets **Transform Reference Point** to top-left
`SetRefPointToT.jsx`               |  ⌃Num8 | Sets **Transform Reference Point** to top
`SetRefPointToTR.jsx`              |  ⌃Num9 | Sets **Transform Reference Point** to top-right
`SetRefPointToL.jsx`               |  ⌃Num4 | Sets **Transform Reference Point** to left
`SetRefPointToC.jsx`               |  ⌃Num5 | Sets **Transform Reference Point** to center
`SetRefPointToR.jsx`               |  ⌃Num6 | Sets **Transform Reference Point** to right
`SetRefPointToBL.jsx`              |  ⌃Num1 | Sets **Transform Reference Point** to bottom-left
`SetRefPointToB.jsx`               |  ⌃Num2 | Sets **Transform Reference Point** to bottom
`SetRefPointToBR.jsx`              |  ⌃Num3 | Sets **Transform Reference Point** to bottom-right
**Export**                                  |
`PrepareForExport.jsx`             |        | Hides visible area layer and moves white, varnish & dielines to separate spreads
`QuickExport.jsx`                  |        | Exports two PDFs for each of the open documents, using hardcoded presets
`VisibleArea.jsx`                  |        | Creates on each page a 'visible area' frame the size of the page margins
`VisibleAreaHide.jsx`              |        | Hides the visible area layer (or equivalents)
`VisibleAreaShow.jsx`              |        | Shows the visible area layer (or equivalents)
**File**                                    |
`SpreadsToFiles.jsx`               |        | Saves the spreads of the active document in separate files
`FilesToSpreads.jsx`               |        | Combines the open documents, sorted alphabetically
**Fitting**                                 |
`FitToPage.jsx`                    |    F11 | Resizes the selected objects to the page size
`FitToPageBleed.jsx`               |   ⇧F11 | Resizes the selected objects to the page bleed
`FitToPageBleedForced.jsx`         |  ⇧⌘F11 | Resizes the selected objects to the page bleed, forced
`FitToPageForced.jsx`              |   ⌘F11 | Resizes the selected objects to the page size, forced
`FitToPageMargins.jsx`             |   ⌥F11 | Resizes the selected objects to the page margins
`FitToPageMarginsForced.jsx`       |  ⌥⌘F11 | Resizes the selected objects to the page margins, forced
`FitToPageVisibleArea.jsx`         |  ⌥⇧F11 | Resizes the selected objects to the page visible area
`FitToPageVisibleAreaForced.jsx`   | ⌥⇧⌘F11 | Resizes the selected objects to the page visible area, forced
`FitToSpread.jsx`                  |    F12 | Resizes the selected objects to the spread size
`FitToSpreadBleed.jsx`             |   ⇧F12 | Resizes the selected objects to the spread bleed
`FitToSpreadBleedForced.jsx`       |  ⇧⌘F12 | Resizes the selected objects to the spread bleed, forced
`FitToSpreadForced.jsx`            |   ⌘F12 | Resizes the selected objects to the spread size, forced
`FitToSpreadMargins.jsx`           |   ⌥F12 | Resizes the selected objects to the spread margins
`FitToSpreadMarginsForced.jsx`     |  ⌥⌘F12 | Resizes the selected objects to the spread margins, forced
`FitToSpreadVisibleArea.jsx`       |  ⌥⇧F12 | Resizes the selected objects to the spread visible area
`FitToSpreadVisibleAreaForced.jsx` | ⌥⇧⌘F12 | Resizes the selected objects to the spread visible area, forced
`TextAutosize.jsx`                 |     F6 | Auto-sizes the text frame to the content
**Scaling**                                 |
`ScaleToPageSize.jsx`              |     F5 | Scales the selected objects to the page size
`ScaleToPageSizeH.jsx`             |        | Scales the selected objects to the page top/bottom size
`ScaleToPageSizeW.jsx`             |        | Scales the selected objects to the page left/right size
`ScaleToPageMargins.jsx`           |    ⌥F5 | Scales the selected objects to the page margins
`ScaleToPageMarginsH.jsx`          |        | Scales the selected objects to the page top/bottom margins
`ScaleToPageMarginsW.jsx`          |        | Scales the selected objects to the page left/right margins
**Setup**                                   |
`DefaultPrefs.jsx`                 |        | Sets default preferences
`DefaultLayers.jsx`                |        | Adds/merges layers from a list
`DefaultSwatches.jsx`              |        | Adds swatches from a list
`SaveSwatches.jsx`                 |        | Saves document's swatches to a list
`CleanupSwatches.jsx`              |    ⇧F2 | Converts RGB swatches to CMYK, renames them to C= M= Y= K=, deletes unused
`ReplaceFonts.jsx`                 |        | Replaces fonts from a substitution list
`DocCleanup.jsx`                   |     F2 | Changes some settings, cleans up swatches/layers/pages and resets scaling
`DocDefaults.jsx`                  |    ⌥F2 | Adds swatches/layers, cleans up fonts and sets page dimensions from the filename
`PageMarginsFromSelection.jsx`     |        | Sets the page margins to the selected objects bounds
`PageSizeFromFilename.jsx`         |     F3 | Sets every page size and margins according to the filename
`PageSizeFromMargins.jsx`          |    ⌥F3 | Sets the page size to the page margins
`PageSizeFromSelection.jsx`        |    ⇧F3 | Sets the page size to the selected objects bounds
**View**                                    |
`TileAll.jsx`                      |    ⇧F4 | Invokes 'Tile All Vertically/Horizontally', depending on current spread orientation
`ZoomToSelection.jsx`              |     F4 | Zooms to the selected objects. If no selection, it zooms to the current spread
`ZoomToSpreads.jsx`                |    ⌥F4 | Zooms to the current spread or the first N spreads
**Miscellaneous**                           |
`Clip.jsx`                         |   Num* | Clips selected objects in a '\<clip frame\>', or restores them
`ClipUndo.jsx`                     |  ⌃Num* | Restores objects clipped in a '\<clip group\>' by the 'FitTo' scripts
`CleanupLabels.jsx`                |        | Removes all labels from the document
`HW.jsx`                           |   ⇧F10 | Labels 'HW' selected objects; w/o selection, adds a 10% bottom guide
`PageRatios.jsx`                   |        | Calculates the ratio of each page and displays it in the upper left corner
`QR.jsx`                           |     F9 | Adds a QR code to the current document or to a separate file
`QRBatch.jsx`                      |    ⇧F9 | Adds codes to existing documents or to separate files in batch mode, from a list
`ShowFonts.jsx`                    |        | Shows all fonts used in the current document
`ShowProfiles.jsx`                 |        | Shows all color profiles available to the document
`ShowProperties.jsx`               |        | Shows properties and methods of a selected object/the document/the application

<!-- ⌃⌥⇧⌘ -->