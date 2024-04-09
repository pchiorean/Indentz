Name                           |       Fn | Description
:-                             |       -: | :-
**Align**                      |          | **Align objects with ease using the numeric keypad**
`AlignToB`                     |   `Num2` | Aligns the selected objects to the bottom of the 'Align To' setting
`AlignToBL`                    |   `Num1` | Aligns the selected objects to the bottom-left of the 'Align To' setting
`AlignToBR`                    |   `Num3` | Aligns the selected objects to the bottom-right of the 'Align To' setting
`AlignToC`                     |   `Num5` | Aligns the selected objects to the center of the 'Align To' setting
`AlignToL`                     |   `Num4` | Aligns the selected objects to the left of the 'Align To' setting
`AlignToR`                     |   `Num6` | Aligns the selected objects to the right of the 'Align To' setting
`AlignToT`                     |   `Num8` | Aligns the selected objects to the top of the 'Align To' setting
`AlignToTL`                    |   `Num7` | Aligns the selected objects to the top-left of the 'Align To' setting
`AlignToTR`                    |   `Num9` | Aligns the selected objects to the top-right of the 'Align To' setting
`ResetAlignTo`                 |  `⌃Num0` | Resets the 'Align To' setting to default
`ToggleAlignTo`                |   `Num0` | Toggles the 'Align To' setting
**Cleanup**                    |          | **Defaults and cleanup**
`BreakLinkToStyles`            |          | Unnaplies paragraph/character/object styles from all or selected objects
`DefaultLayers`                |          | Adds/merges layers from a list
`DefaultPrefs`                 |          | Sets default preferences
`DefaultSwatches`              |          | Adds swatches from a list
`DocCleanup`                   |     `F2` | Changes some settings, cleans up swatches/layers/pages and other things
`DumpLayers`                   |          | Saves document's layers to a TSV file compatible with `DefaultLayers`
`DumpLinks`                    |          | Saves document's links to a TSV file compatible with `ReplaceLinks`
`DumpSwatches`                 |          | Saves document's swatches to a TSV file compatible with `DefaultSwatches`
`RemoveScriptLabels`           |          | Removes all script labels from all or selected objects
`ReplaceFonts`                 |          | Replaces fonts from a substitution list
`ReplaceLinks`                 |    `⌥F8` | Replaces document links from a substitution list
`ReplaceSnippets`              |    `⌥F6` | Replaces text snippets from a substitution list
`ResetLayers`                  |          | Resets the visible/printable/locked state of document layers
`SwatchesCleanup`              |    `⇧F2` | Converts RGB swatches to CMYK, renames them to 'C= M= Y= K=' format, deletes unused
**Export**                     |          | **Document export and related**
`HideDNPLayers`                |          | Hides DO-NOT-PRINT layers
`MarkSafetyArea`               |          | Creates on each page a 'safety area' frame the size of the page margins
`MarkVisibleArea`              |          | Creates on each page a 'visible area' frame the size of the page margins
`PrepareForExport`             |          | Hides some layers and moves objects with special colors to separate spreads
`QuickExport`                  |          | Exports open .indd documents or a folder with several configurable PDF presets
`ShowDNPLayers`                |          | Shows DO-NOT-PRINT layers
**File**                       |          | **File management**
`FilesToSpreads`               |          | Combines the open documents, sorted alphabetically
`LayersToSpreads`              |          | Moves layers of the active document to separate spreads
`SpreadsToFiles`               |          | Saves the spreads of the active document in separate files
**Fit**                        |          | **Reframe selected objects**
`FitToPage`                    |    `F11` | Reframes the selected objects to the page size
`FitToPageBleed`               |   `⇧F11` | Reframes the selected objects to the page bleed
`FitToPageBleedForced`         |  `⇧⌘F11` | Reframes the selected objects to the page bleed, forced
`FitToPageForced`              |   `⌘F11` | Reframes the selected objects to the page size, forced
`FitToPageMargins`             |   `⌥F11` | Reframes the selected objects to the page margins
`FitToPageMarginsForced`       |  `⌥⌘F11` | Reframes the selected objects to the page margins, forced
`FitToPageVisibleArea`         |  `⌥⇧F11` | Reframes the selected objects to the page visible area
`FitToPageVisibleAreaForced`   | `⌥⇧⌘F11` | Reframes the selected objects to the page visible area, forced
`FitToSpread`                  |    `F12` | Reframes the selected objects to the spread size
`FitToSpreadBleed`             |   `⇧F12` | Reframes the selected objects to the spread bleed
`FitToSpreadBleedForced`       |  `⇧⌘F12` | Reframes the selected objects to the spread bleed, forced
`FitToSpreadForced`            |   `⌘F12` | Reframes the selected objects to the spread size, forced
`FitToSpreadMargins`           |   `⌥F12` | Reframes the selected objects to the spread margins
`FitToSpreadMarginsForced`     |  `⌥⌘F12` | Reframes the selected objects to the spread margins, forced
`FitToSpreadVisibleArea`       |  `⌥⇧F12` | Reframes the selected objects to the spread visible area
`FitToSpreadVisibleAreaForced` | `⌥⇧⌘F12` | Reframes the selected objects to the spread visible area, forced
`TextAutosize`                 |     `F6` | Auto-sizes the text frame to the content
**Layout**                     |          | **Document setup: page size, margins & columns, guides**
`GuidesAdd`                    |          | Adds guides on pages' edges and inner centers or selected objects' edges
`GuidesDelete`                 |          | Deletes all guides from the document
`PageMarginsFromScriptName`    |          | Sets page margins and HW from the script name
`PageMarginsFromSelection`     |    `⌥F3` | Sets the page margins to the selected objects bounds
`PageSizeFromFilename`         |     `F3` | Sets every page size and margins according to the file name
`PageSizeFromMargins`          |          | Sets the page size to the page margins
`PageSizeFromSelection`        |    `⇧F3` | Sets the page size to the selected objects bounds
**Miscellaneous**              |          | **Scripts that do not fall into the other categories**
`Clip`                         |   `Num*` | Clips selected objects in a clipping frame (or releases them if already clipped)
`ClipUndo`                     |  `⌃Num*` | Releases selected objects from their clipping frames
`EAN`                          |    `⌥F9` | Inserts EAN codes into the selected frames or in a new document
`LabelPage`                    |          | Adds a custom label on the current page's slug
`LabelPageRatios`              |          | Adds a label with the page/visible area/margins' ratios on each page's slug
`OffsetPaths`                  |          | Uses InDesign's text wrap feature to create offset/inset paths
`QR`                           |     `F9` | Adds a QR code to the current document or to a separate file
`QRBatch`                      |    `⇧F9` | Adds codes from a list to existing documents or to separate files, in batch mode
`ShowFonts`                    |          | Shows all fonts used in the current document
`ShowProfiles`                 |          | Shows all color profiles available to a document
`ShowProperties`               |     `F1` | Shows properties and methods of the selected object/active document/the application
**Proxy**                      |          | **Easily control the reference point used for transformations**
`SetRefPointToB`               |  `⌃Num2` | Sets 'Transform Reference Point' to bottom
`SetRefPointToBL`              |  `⌃Num1` | Sets 'Transform Reference Point' to bottom-left
`SetRefPointToBR`              |  `⌃Num3` | Sets 'Transform Reference Point' to bottom-right
`SetRefPointToC`               |  `⌃Num5` | Sets 'Transform Reference Point' to center
`SetRefPointToL`               |  `⌃Num4` | Sets 'Transform Reference Point' to left
`SetRefPointToR`               |  `⌃Num6` | Sets 'Transform Reference Point' to right
`SetRefPointToT`               |  `⌃Num8` | Sets 'Transform Reference Point' to top
`SetRefPointToTL`              |  `⌃Num7` | Sets 'Transform Reference Point' to top-left
`SetRefPointToTR`              |  `⌃Num9` | Sets 'Transform Reference Point' to top-right
**Scale**                      |          | **Resize selected objects**
`ScaleToPageMargins`           |    `⌥F5` | Scales the selected objects to the page margins
`ScaleToPageMarginsH`          |   `⌃⌥F5` | Scales the selected objects to the page top/bottom margins
`ScaleToPageMarginsW`          |          | Scales the selected objects to the page left/right margins
`ScaleToPageSize`              |     `F5` | Scales the selected objects to the page size
`ScaleToPageSizeH`             |    ^`F5` | Scales the selected objects to the page top/bottom size
`ScaleToPageSizeW`             |          | Scales the selected objects to the page left/right size
`ScaleToSpreadBleed`           |    `⇧F5` | Scales the selected objects to the spread bleed
`ScaleToSpreadBleedH`          |   `⌃⇧F5` | Scales the selected objects to the spread bleed top/bottom size
`ScaleToSpreadBleedW`          |          | Scales the selected objects to the spread bleed left/right size
**View**                       |          | **Document display**
`TileAll`                      |    `⇧F4` | Invokes different window tiling options, depending on the current spread orientation
`ZoomTo300Percent`             |     `⌘3` | Zooms to 300%
`ZoomToSelection`              |     `F4` | Zooms to the selected objects. If no selection, it zooms to the current spread
`ZoomToSpreads`                |    `⌥F4` | Zooms to the current spread or the first 3 spreads
