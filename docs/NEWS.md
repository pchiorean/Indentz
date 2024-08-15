## What's new in [24.8.15](https://github.com/pchiorean/Indentz/releases/tag/24.8.15)

Long time no see – it's been over a year since the previous release. :( There are no major updates, though: there's one breaking change and three new scripts, some new features and many minor updates and bug fixes.

Also, since there are quite a lot of files, I've organized them into a new scheme related to their scope: document, page/spread, objects on page, and application environment. Some scripts were renamed as follows:

|Old name|New name|
|:-|:-|
|BreakLinkToStyles|RemoveStyles|
|ClipUndo|ClipRelease|
|DefaultLayers|AddLayers|
|DefaultSwatches|AddSwatches|
|FilesToSpreads|JoinDocs|
|ReplaceSnippets|ReplaceTextSnippets|
|SpreadsToFiles|SplitDocBySpreads|

### Document

#### Assets

- **AddLayers:**
  - `brk` Finally, I added a new column for the layers' locked state. When I originally made the script I didn't need this property, but later I discovered that I keep adding hacks to **DocCleanup** to lock certain layers. :) This is a breaking change, meaning that you will have to manually update all your `layers.tsv` files to 7 columns (see [README](README.html) for more info):

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
  - When you export with a preset whose name ends with '_print', the exported filename will have all visible and printable layers beginning with '+' appended to the suffix (for example, if there is a visible and printable layer named '+varnish', the exported filename will have the suffix '_print+varnish').
  - The options for updating documents were simplified to just 'Save' and 'Save as'.
  - When **Add a suffix** was disabled, it ignored **Sort files into subfolders by suffix**. This is fixed: you can sort by suffix without adding it to the file names.
  - Skip export when fonts are missing; skip export when links are set to be updated but are missing.
  - Fixed aborting the export when 'Escape' was detected.
  - Small additional fixes and some improvements to error reports.

#### Housekeeping

- **DocCleanup:**
  - When deleting empty frames, those having type on path are preserved.
  - Replaced a hack used to lock certain layers with a proper solution that uses the layers' state from `layers.tsv`.
  - When cleaning text frames skip threaded ones.
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
  - Added a script that splits/combines the active document spreads using a list of predefined layers ('DE', 'FR', 'IT'): elements from these layers, depending on the initial number of document spreads, are either distributed into multiple spreads or combined into a single spread.

### Object

#### Clipping

- **Clip:**
  - Color-filled text frames were clipped ignoring their background; fixed.
  - Empty clipping frames are now ignored.

- **Clip, ClipUndo:**
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

For other changes not mentioned here see the full [changelog](CHANGELOG.md).
