### What's new in [23.7.15](https://github.com/pchiorean/Indentz/releases/tag/23.7.15)

#### Cleanup

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

#### Fit

- **TextAutosize:** Fixed a bug that in certain circumstances reverted a frame's auto-sizing to height-only.

#### Export

- **QuickExport:**
  - Major UI refactoring: most of the common options have been moved to workflows to make them more independent (in the future it will be possible to create presets).
  - Added an option to create Acrobat layers.
  - Added an option to exclude any layer beginning with '.' or '-' (_do-not-print_ layers). You can also add a custom layer list or use the default one.
  - Added an option to automatically upgrade documents from previous versions of InDesign.
  - `hack` There is a hack that automatically appends the names of technical layers like 'dielines,' 'varnish,' etc., to the suffix; unfortunately it used to add them even if the layers were not actually exported. Fixed.
  - If you keep the **Opt/Alt** key pressed while clicking **Start**, the script will run without saving the settings.
- **Hide/ShowDNPLayers, PrepareForExport:** Tweaked the internal list of _do-not-print_ layers.
- **PrepareForExport:** No longer creates an 'info' layer if not actually needed.

#### View

- **TileAll:** Documents with square formats will use the generic **Window ‣ Arrange ‣ Tile**.

#### Misc

- **EAN:** The code will be inserted into all selected objects.

- **LabelPageRatios:** Now both outer (visible area, or page size if undefined) and inner ratios (margins) will be marked.

#### Other

- Added a dot prefix to _do-not-print_ layers (e.g., '.visible area').
- Replaced layer 'ID' with 'info' to simplify layer management.
- Increased stroke width when marking the visible area for large visuals.
- Improved feedback when the current document doesn't have a valid path.

For other changes not mentioned here see the full [changelog](CHANGELOG.md).
