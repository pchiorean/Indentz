Name                               |     Fn | Description
:-                                 |     -: | :-
**Cleanup**                        |        | **Preferences, defaults, cleanup**
`DefaultPrefs.jsx`                 |        | Sets default preferences
`DefaultLayers.jsx`                |        | Adds/merges layers from a list
`DefaultSwatches.jsx`              |        | Adds swatches from a list
`ReplaceFonts.jsx`                 |        | Replaces fonts from a substitution list
`ReplaceLinks.jsx`                 |        | Replaces document links from a substitution list
`ReplaceSnippets.jsx`              |        | Replaces text snippets from a substitution list
`DocCleanup.jsx`                   |     F2 | Changes some settings, cleans up swatches/layers/pages and resets scaling
`SwatchesCleanup.jsx`              |    ⇧F2 | Converts RGB swatches to CMYK, renames them to C= M= Y= K=, deletes unused
`SwatchesSave.jsx`                 |        | Saves document's swatches to a list
**Layout**                         |        | **Document setup - page size, margins & columns, guides**
`PageSizeFromFilename.jsx`         |     F3 | Sets every page size and margins according to the filename
`PageSizeFromMargins.jsx`          |        | Sets the page size to the page margins
`PageSizeFromSelection.jsx`        |    ⇧F3 | Sets the page size to the selected objects bounds
`PageMarginsFromSelection.jsx`     |    ⌥F3 | Sets the page margins to the selected objects bounds
`GuidesAdd.jsx`                    |        | Adds guides on pages' edges and inner centers or selected objects' edges
`GuidesDelete.jsx`                 |        | Deletes all guides from the document
**Align**                          |        | **Easily align objects using the numeric keypad**
`AlignToTL.jsx`                    |   Num7 | Aligns the selected objects to the top-left of the 'Align To' setting
`AlignToT.jsx`                     |   Num8 | Aligns the selected objects to the top of the 'Align To' setting
`AlignToTR.jsx`                    |   Num9 | Aligns the selected objects to the top-right of the 'Align To' setting
`AlignToL.jsx`                     |   Num4 | Aligns the selected objects to the left of the 'Align To' setting
`AlignToC.jsx`                     |   Num5 | Aligns the selected objects to the center of the 'Align To' setting
`AlignToR.jsx`                     |   Num6 | Aligns the selected objects to the right of the 'Align To' setting
`AlignToBL.jsx`                    |   Num1 | Aligns the selected objects to the bottom-left of the 'Align To' setting
`AlignToB.jsx`                     |   Num2 | Aligns the selected objects to the bottom of the 'Align To' setting
`AlignToBR.jsx`                    |   Num3 | Aligns the selected objects to the bottom-right of the 'Align To' setting
`ResetAlignTo.jsx`                 |  ⌃Num0 | Resets the 'Align To' setting to default
`ToggleAlignTo.jsx`                |   Num0 | Toggles the 'Align To' setting
**Fit**                            |        | **Reframe objects to the page/spread or their margins/bleed**
`FitToPage.jsx`                    |    F11 | Reframes the selected objects to the page size
`FitToPageBleed.jsx`               |   ⇧F11 | Reframes the selected objects to the page bleed
`FitToPageBleedForced.jsx`         |  ⇧⌘F11 | Reframes the selected objects to the page bleed, forced
`FitToPageForced.jsx`              |   ⌘F11 | Reframes the selected objects to the page size, forced
`FitToPageMargins.jsx`             |   ⌥F11 | Reframes the selected objects to the page margins
`FitToPageMarginsForced.jsx`       |  ⌥⌘F11 | Reframes the selected objects to the page margins, forced
`FitToPageVisibleArea.jsx`         |  ⌥⇧F11 | Reframes the selected objects to the page visible area
`FitToPageVisibleAreaForced.jsx`   | ⌥⇧⌘F11 | Reframes the selected objects to the page visible area, forced
`FitToSpread.jsx`                  |    F12 | Reframes the selected objects to the spread size
`FitToSpreadBleed.jsx`             |   ⇧F12 | Reframes the selected objects to the spread bleed
`FitToSpreadBleedForced.jsx`       |  ⇧⌘F12 | Reframes the selected objects to the spread bleed, forced
`FitToSpreadForced.jsx`            |   ⌘F12 | Reframes the selected objects to the spread size, forced
`FitToSpreadMargins.jsx`           |   ⌥F12 | Reframes the selected objects to the spread margins
`FitToSpreadMarginsForced.jsx`     |  ⌥⌘F12 | Reframes the selected objects to the spread margins, forced
`FitToSpreadVisibleArea.jsx`       |  ⌥⇧F12 | Reframes the selected objects to the spread visible area
`FitToSpreadVisibleAreaForced.jsx` | ⌥⇧⌘F12 | Reframes the selected objects to the spread visible area, forced
`TextAutosize.jsx`                 |     F6 | Auto-sizes the text frame to the content
**Scale**                          |        | **Scale objects to the page size, page margins, or spread bleed**
`ScaleToPageSize.jsx`              |     F5 | Scales the selected objects to the page size
`ScaleToPageSizeH.jsx`             |    ^F5 | Scales the selected objects to the page top/bottom size
`ScaleToPageSizeW.jsx`             |        | Scales the selected objects to the page left/right size
`ScaleToPageMargins.jsx`           |    ⌥F5 | Scales the selected objects to the page margins
`ScaleToPageMarginsH.jsx`          |   ⌃⌥F5 | Scales the selected objects to the page top/bottom margins
`ScaleToPageMarginsW.jsx`          |        | Scales the selected objects to the page left/right margins
`ScaleToSpreadBleed.jsx`           |    ⇧F5 | Scales the selected objects to the spread bleed
`ScaleToSpreadBleedH.jsx`          |   ⌃⇧F5 | Scales the selected objects to the spread bleed top/bottom size
`ScaleToSpreadBleedW.jsx`          |        | Scales the selected objects to the spread bleed left/right size
**Proxy**                          |        | **Easily control the reference point used for transformations**
`SetRefPointToTL.jsx`              |  ⌃Num7 | Sets 'Transform Reference Point' to top-left
`SetRefPointToT.jsx`               |  ⌃Num8 | Sets 'Transform Reference Point' to top
`SetRefPointToTR.jsx`              |  ⌃Num9 | Sets 'Transform Reference Point' to top-right
`SetRefPointToL.jsx`               |  ⌃Num4 | Sets 'Transform Reference Point' to left
`SetRefPointToC.jsx`               |  ⌃Num5 | Sets 'Transform Reference Point' to center
`SetRefPointToR.jsx`               |  ⌃Num6 | Sets 'Transform Reference Point' to right
`SetRefPointToBL.jsx`              |  ⌃Num1 | Sets 'Transform Reference Point' to bottom-left
`SetRefPointToB.jsx`               |  ⌃Num2 | Sets 'Transform Reference Point' to bottom
`SetRefPointToBR.jsx`              |  ⌃Num3 | Sets 'Transform Reference Point' to bottom-right
**File**                           |        | **File management**
`FilesToSpreads.jsx`               |        | Combines the open documents, sorted alphabetically
`SpreadsToFiles.jsx`               |        | Saves the spreads of the active document in separate files
`LayersToSpreads.jsx`              |        | Moves layers of the active document to separate spreads
**Export**                         |        | **Document export and related**
`QuickExport.jsx`                  |        | Exports open .indd documents or a folder with several configurable PDF presets
`PrepareForExport.jsx`             |        | Hides some layers and moves objects with special colors to separate spreads
`MarkVisibleArea.jsx`              |        | Creates on each page a 'visible area' frame the size of the page margins
`HideDNPLayers.jsx`                |        | Hides DO-NOT-PRINT layers
`ShowDNPLayers.jsx`                |        | Shows DO-NOT-PRINT layers
**View**                           |        | **Document display**
`TileAll.jsx`                      |    ⇧F4 | Invokes 'Tile All Vertically/Horizontally', depending on current spread orientation
`ZoomToSelection.jsx`              |     F4 | Zooms to the selected objects. If no selection, it zooms to the current spread
`ZoomToSpreads.jsx`                |    ⌥F4 | Zooms to the current spread or the first N spreads
**Miscellaneous**                  |        | **Scripts that do not fall into the other categories**
`Clip.jsx`                         |   Num* | Clips selected objects in a clipping frame (or releases them if already clipped)
`ClipUndo.jsx`                     |  ⌃Num* | Releases selected objects from their clipping frames
`LabelPage.jsx`                    |        | Adds a custom label on the current page's slug
`LabelPageRatios.jsx`              |        | Adds a label (ratio) on each page's slug
`LabelsCleanup.jsx`                |        | Removes all labels from the document
`OffsetPaths.jsx`                  |        | Uses InDesign's text wrap feature to create offset/inset paths
`QR.jsx`                           |     F9 | Adds a QR code to the current document or to a separate file
`QRBatch.jsx`                      |    ⇧F9 | Adds codes to existing documents or to separate files in batch mode, from a list
`ShowFonts.jsx`                    |        | Shows all fonts used in the current document
`ShowProfiles.jsx`                 |        | Shows all color profiles available to a document
`ShowProperties.jsx`               |     F1 | Shows properties and methods of the selected object/active document/the application

<!-- ⌃⌥⇧⌘ -->
