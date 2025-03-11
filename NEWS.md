## What's new in ...

(This is work in progress.)

Simplified the folder scheme to only three categories (**Document**, **Objects** and **Other**), making it easier to navigate. Some scripts were renamed as follows:

|Old name|New name|
|:-|:-|
|**DefaultPrefs**|**SetDefaultPrefs**|
|**SplitSpreadsByLayers**|**SplitSpreadsByOptions**|

### Document

#### Assets

- **SwatchesCleanup:**
  - Unnamed colors were added by calling the menu **Add Unnamed Colors** by name, and this name varies with application language; fixed.

#### Export

- **QuickExport:**
  - Changed default export profiles to `_LowRes` and `_HighRes`.
  - When the user folder can't be detected (OneDrive anyone?), the settings are saved next to the script.
  - The subfolder and date fields are now user editable.
  - Allow `\` in subfolder names so you can use relative paths.
  - Added an optionally file name prefix.
  - The index of exported files will be incremented regardless of the file format.
  - When manually inserting an out of bounds value for custom DPI or custom bleed the script will display an error message instead of resetting the value.
  - Manually entered suffixes were not processed to remove text after `+`; fixed.

#### Layout

- `new` **GuidesCollect:**
  - A new script that moves all document guides to the **.guides** layer

- **MarkSafety/VisibleArea**, **PageSizeFromFilename:**
  - By user request the visible and safety area markings will not overprint.

#### Pagination

- `new` **ShowOrHideOptions:**
  - A new script that shows or hides option-specific layers (see below).

- **SplitSpreadsByOptions:**
  - `brk` No more hardcoded default option-specific layers! When your document have multiple options (such as languages), you can now use a colon (`:`) in layer names to specify them using this format: `<layer name>:<option>` – for example, **language: de_CH**, **language: fr_CH**, **language: it_CH** for Swiss German, French, and Italian options. Any number of these option layers are supported.

### Objects

#### Fit

- **TextAutosize:**
  - Color-filled text frames are now skipped.

## What's new in [24.8.15](https://github.com/pchiorean/Indentz/releases/tag/24.8.15)

Long time no see – it's been over a year since the previous release. :( There are no major updates, though: there's one breaking change and three new scripts, some new features and many minor updates and bug fixes.

Also, since there are quite a lot of files, I've organized them into a new scheme related to their scope: document, page/spread, objects on page, and application environment. Some scripts were renamed as follows:

|Old name|New name|
|:-|:-|
|**BreakLinkToStyles**|**RemoveStyles**|
|**ClipUndo**|**ClipRelease**|
|**DefaultLayers**|**AddLayers**|
|**DefaultSwatches**|**AddSwatches**|
|**FilesToSpreads**|**JoinDocs**|
|**ReplaceSnippets**|**ReplaceTextSnippets**|
|**SpreadsToFiles**|**SplitDocBySpreads**|

### Document

#### Assets

- **AddLayers:**
  - `brk` Finally, I added a new column for the layers' locked state. When I originally made the script I didn't need this property, but later I discovered that I keep adding hacks to **DocCleanup** to lock certain layers. :) This is a breaking change, meaning that you will have to manually update all your `layers.tsv` files to 7 columns (see [README](https://github.com/pchiorean/Indentz/blob/a53f11ccf43ed31622d78a7d7a0f837a16924556/docs/README.md#addlayersjsx) for more info):

    |Name|Color|Visible|Printable|_Locked_|Order|Variants|
    |:-|:-|:-|:-|:-|:-|:-|
    |...|||||||

- **AddSwatches:**
  - Every swatch automatically gets two new implicit variants along its Color Value Name: its lowercase name (this also fixes case variations), and the alternative spelling of its Color Value Name ('cXmXyXkX' or 'rXgXbX' or 'lXaXbX'). So, if you have this line:

    |Name|Color Model|Color Space|Values|Variants|
    |:-|:-|:-|:-|:-|
    |**Rich Black**|process|cmyk|60 40 40 100||

    all document swatches named **rich black** (and other case variations), **C=60 M=40 Y=40 K=100**, or **c60m40y40k100** will be merged with **Rich Black**.

- **ReplaceLinks:**
  - Filenames containing commas are now properly recognized, but they must be quoted.

- `new` **ResetLayers:**
  - A new script that (re)sets the visible/printable/locked state of document layers to their state defined in `layers.tsv`.

#### Export

- **QuickExport:**
  - `new` Added an option to sort exported files in subfolders by date; the index added to the file names when **Overwrite existing files** is disabled takes these subfolders into account.
  - `new` Added an elapsed time report when the export takes longer than 9 seconds.
  - When you export with a preset whose name ends with '_print', the exported file name will have all visible and printable layers beginning with '+' appended to the suffix (for example, if there is a visible and printable layer named '+varnish', the exported file name will have the suffix '_print+varnish').
  - The options for updating documents were simplified to just **Save** and **Save as**.
  - When **Add a suffix** was disabled, it ignored **Sort files into subfolders by suffix**. This is fixed: you can sort by suffix without adding it to the file names.
  - Skip export when fonts are missing; skip export when links are set to be updated but are missing.
  - Fixed aborting the export when 'Escape' was detected.
  - Small additional fixes and some improvements to error reports.

#### Housekeeping

- **DocCleanup:**
  - When deleting empty frames, those having type on path are preserved.
  - When cleaning text frames skip threaded ones.
  - Replaced a hack used to lock certain layers with a proper solution that uses the layers' state from `layers.tsv`.
  - Simplified the logic that sets the pasteboard size.

- **RemoveStyles:**
  - In addition to breaking links to object/paragraph/character styles, it will remove orphaned styles and groups.

### Page

#### Guides

- **GuidesAdd:**
  - By default, it adds page guides; added an option to use spread guides if run while pressing **Opt/Alt**.
  - Changed guides view threshold to 100%.

- **LabelPageRatios:**
  - Improved label info to display the page ratio and the visible area ratio; if the visible area is not defined, it falls back to the margins ratio.

- `new` **MarkSafetyArea:**
  - A new script to mark the _safety area_ of a page by creating a frame around the page margins.

#### Layout

- **PageMarginsFromScriptName:**
  - When HW was zero it still added a HW guide; fixed.

- **PageSizeFromFilename:**
  - Improved detection of size pairs (e.g., 'Filename 000x000_000x000' is now recognized).
  - Added checks to ensure that page sizes and margins are within valid limits.

#### Spreads

- **SplitDocBySpreads:**
  - After merging documents the page numbering will be reset to start at 1.
  - The open documents are merged in a natural sorting order.

- `new` **SplitSpreadsByLayers:**
  - A new script that splits/combines the active document spreads using a list of predefined layers ('DE', 'FR', 'IT'): elements from these layers, depending on the initial number of document spreads, are either distributed into multiple spreads or combined into a single spread.

### Object

#### Clipping

- **Clip:**
  - Color-filled text frames were clipped ignoring their background; fixed.
  - Empty clipping frames are now ignored.

- **Clip, ClipRelease:**
  - When releasing objects from their clipping frames, only those released will remain selected.

#### Fit

- **TextAutoSize:**
  - Text frames labeled 'hw' will be processed regularly.
  - When trimming ending whitespaces sometimes the styling was affected; fixed by using native **Find/Change GREP**.
  - Items on the '.guides' layer are now ignored.

#### Other

- **OffsetPaths:**
  - `new` You can create an offset path around groups (it processes 1<sup>st</sup> level objects so we don't get a boring rectangle).

### Miscellaneous

- **EAN:**
  - `new` You can sequentially insert a list of barcodes into multiple objects (in the order they were selected).
  - List height was supposed to grow depending on selection; fixed.
  - Placing code failed when target frames were already populated; fixed.

- **QR:**
  - The code text now defaults to the file name.

- **QR, QRBatch:**
  - Fixed document path detection for '[Converted]' documents.
  - The fill and stroke were using document defaults; now are set explicitly.

### Other

- HW guides are now added to the '.guides' layer.
- Overprinting was attempted on pseudo-white when marking the _visible area_; fixed.

For other changes not mentioned here see the full [changelog](https://github.com/pchiorean/Indentz/blob/a53f11ccf43ed31622d78a7d7a0f837a16924556/docs/CHANGELOG.md).

## What's new in [23.7.18](https://github.com/pchiorean/Indentz/releases/tag/23.7.18)

### Cleanup

- **DefaultPrefs:**
  - The default text wrap mode is now off.
  - Removed color profile settings.
- **DocCleanup:**
  - Empty frames from '.guides' are protected from deletion.
  - Added '.segmentation' to 'Show/hide layers' list.
- Added **DumpLinks:** Saves document's links to a TSV file compatible with **ReplaceLinks**.
- **ReplaceLinks:** Improved reports (shown when run with **Ctrl** key pressed).
- **ReplaceSnippets:** **Find/Change** settings are now cleared when script finishes.
- **SwatchesCleanup:** Moved deletion of unused swatches as the last step.

### Fit

- **TextAutosize:** Fixed a bug that in certain circumstances reverted a frame's auto-sizing to height-only.

### Export

- **QuickExport:**
  - Major UI refactoring: most of the common options have been moved to workflows to make them more independent (in the future it will be possible to create presets).
  - Added an option to create Acrobat layers.
  - Added an option to exclude any layer beginning with '.' or '-' (_do-not-print_ layers). You can also add a custom layer list or use the default one.
  - Added an option to automatically upgrade documents from previous versions of InDesign.
  - `hack` There is a hack that automatically appends the names of technical layers like 'dielines,' 'varnish,' etc., to the suffix; unfortunately it used to add them even if the layers were not actually exported. Fixed.
  - If you keep the **Opt/Alt** key pressed while clicking **Start**, the script will run without saving the settings.
- **Hide/ShowDNPLayers, PrepareForExport:** Tweaked the internal list of _do-not-print_ layers.
- **PrepareForExport:** No longer creates an 'info' layer if not actually needed.

### View

- **TileAll:** Documents with square formats will use the generic **Window ‣ Arrange ‣ Tile**.

### Misc

- **EAN:** The code will be inserted into all selected objects.

- **LabelPageRatios:** Now both outer (visible area, or page size if undefined) and inner ratios (margins) will be marked.

### Other

- Added a dot prefix to _do-not-print_ layers (e.g., '.visible area').
- Replaced layer 'ID' with 'info' to simplify layer management.
- Increased stroke width when marking the visible area for large visuals.
- Improved feedback when the current document doesn't have a valid path.
- Added `MasterSpread` as a valid parent, thus scripts also work on the parent/master pages.

For other changes not mentioned here see the full [changelog](https://github.com/pchiorean/Indentz/blob/c2261e60b3c870333871e206d4ab520c79e439c9/docs/CHANGELOG.md).

## What's new in [23.2.1](https://github.com/pchiorean/Indentz/releases/tag/23.2.1)

### Cleanup

- **DefaultPrefs:** Changed **General ‣ Object Editing ‣ When Scaling** to **Apply to Content**.
- **DefaultLayers:** You can now order layers to `top` or `bottom` using these keywords.
- **DocCleanup:** Minor tweaks and fixes.
- **RemoveScriptLabels:** Renamed from **misc/LabelsCleanup**.

### Export

- **QuickExport:**
  - Preferences will be silently created on first run.
  - Added a fix for queued documents that disappear before the actual export.

### Layout

- Added **PageMarginsFromScriptName:** Sets the page margins and optionally the HW area (expressed in percentage of the visible/page area), getting the values from the script name. It's designed to be duplicated and renamed to customize the values, using one or two numbers and the keyword `HW`. Example: `MG5HW10.jsx` sets the margins to 5% and the HW to 10% (`HW` can also be used without a number, which sets it to 10%, or omitted, which sets it to 0).

### View

- **ZoomToSelection/Spreads:** When zooming to page include the slug if preview mode is off.
- Added **ZoomTo300Percent:** Zooms the current view to 300%.

### Misc

- **QR, QRBatch:** Minor tweaks and fixes.

For other changes not mentioned here see the full [changelog](https://github.com/pchiorean/Indentz/blob/c72488a189c6196489b2b28a3a071c8aa968c846/docs/CHANGELOG.md).

## What's new in [22.11.10](https://github.com/pchiorean/Indentz/releases/tag/22.11.10)

### Cleanup
- Added **BreakLinkToStyles:** Unnaplies paragraph/character/object styles from all or selected objects.
- Added **DumpLayers:** Saves a TSV file with the properties of the active document layers (compatible with **DefaultLayers**).
- **DefaultPrefs:** Preferences are now applied in two steps: application/document.
- **DocCleanup:** Reinstated conversion of empty text frames to generic frames, but only when they are not auto-sized.
- Renamed **SwatchesSave** to **DumpSwatches**.

### Export
- **QuickExport:**
  - Custom bleed is now imported when defined in the PDF preset.
  - Document layers will be restored to initial status after export.
  - Increased maximum bleed value to 152.4 mm.
  - Improved the PDF preset tooltip info.
  - Errors are now reported after running additional scripts.
  - When the PDF preset is set to preserve original resolution the DPI option is now disabled.

### Misc
- Added **EAN:** Embeds an EAN code in the selected frame or adds it to a new page.
- **QR:**
  - Switched uppercase and white label options.
  - Set label leading to 100%.

### Other
- Dialogs are centered in the InDesign window.

For other fixes and improvements not mentioned here see the full [changelog](https://github.com/pchiorean/Indentz/blob/d1655f41251d1bcf639b445e79fead3aff71f7bb/docs/CHANGELOG.md).

## What's new in [22.9.25](https://github.com/pchiorean/Indentz/releases/tag/22.9.25)

### Cleanup
- **DefaultSwatches:** You can now cancel by pressing 'Esc'.
- **DocCleanup:** No longer converts empty text frames to generic frames.
- **ReplaceLinks:**
  - Fixed an error for names containing `%`.
  - You can now cancel relinking by pressing 'Esc'.
- **SwatchesSave:** Changed the TSV encoding to UTF-8 to preseve swatch names using non-ASCII characters.

### Export
- **QuickExport:** Cosmetic tweaks to 'Export in subfolders' description.

### File
- **SpreadsToFiles:** Cosmetic tweaks to the prompt text.

### View
- **ZoomTo...:**
  - Tweaked the zoom factor (fits a square page to 90% of 'Fit Page in Window').
  - Refactored to use similar code.

### Other
- All scripts that use TSVs as input:
  - Added an `@includepath` statement which sets a reference path to which subsequent relative paths will refer.
  - You can now use relative paths for both `@include` and `@includepath`: thus, a path may be an absolute path, one relative to the current data file, or a path relative to a reference path, if defined by a previous `@includepath` statement.
  - Changed data files extension to `.tsv` (it still looks for `.txt` as fallback).
  - Added support for comments at the end of lines (everything after a `#` is ignored).
- Activated auto filtering to the status report for scripts that need it.

## What's new in [22.8.22](https://github.com/pchiorean/Indentz/releases/tag/22.8.22)

### Cleanup
- **DefaultPrefs:** Changed baseline grid color to a lighter grey (`230,230,230`).
- **DefaultSwatches:** Added `/` to the list of values separators (thus, you can write values as `34 42 23 5`, `34|42|23|5`, or `34/42/23/5`).
- **DocCleanup:**
  - Items on `dielines` layer will not be converted to graphic frames.
  - Also locked the `varnish` layer.
- **ReplaceSnippets:** Fixed a replacement quirk.
- **SwatchesSave:** Will no longer open the TSV file after export.
- Improved info/error reporting.

### Export
- **QuickExport:**
  - `new` Added a resolution field; bumped settings version.
  - Input/output folder fields are now editable (in a future version it will also create the output folder if it doesn't exist).
  - The titlebar and the 'Start' button help tip will display the errors that prevent the script from running.
  - Added a preset help tip that shows the selected preset settings.
  - `hack` Will show/hide layers starting with a dot when using a `preview`/`print` suffix (aka DNP layers).
  - `hack` When exporting with a `print` suffix, will append `+diecut` if documents have a `dielines` layer.

- **PrepareForExport:** Dielines are no longer moved to separate page.

### File
- **SpreadsToFiles:** `new` Added a custom positioning placeholder character – if the file name contains a `#`, the index will be placed in that position.

### Fit
- Protected the `<visible area>` frames and items on `dielines` layer from reframing (they *will* reframe in enforced mode).

### Other
- Added a button for saving the reports to file.
- Relaxed the list of invalid file name characters (`<` `>` `:` `"` `\` `/` `\` `|` `?` `*`).
- Enforced straight corners to new rectangles and text frames.
- Added an `#includepath` directive with a list of fallback folders.

