# TODO

- [ ] [update] Make a custom object style for 'Visible area' frame [#123](https://github.com/pchiorean/Indentz/issues/123)
- [ ] [feature] Add `@include` support when parsing TSVs [#137](https://github.com/pchiorean/Indentz/issues/137)

### DefaultSwatches
- [ ] [fix] Check values on parsing
- [ ] [feature] Merge known swatch variants [#126](https://github.com/pchiorean/Indentz/issues/126)

### DocCleanup
- [ ] [fix] Fix 'sticky' unused swatches
- [ ] [update] For very large pages, set pasteboard ×50
- [ ] [feature] Ask to delete empty frames
- [ ] [feature] Remove unused masters
- [ ] [feature] Remove unused styles and groups [#](https://community.adobe.com/t5/indesign/delete-unused-paragraph-styles/m-p/1089672#M165331)

### FilesToSpreads
- [ ] [fix] Fix for files in different folders but same name

### FitTo
- [ ] [fix] Check for transformations [#131](https://github.com/pchiorean/Indentz/issues/131) <!-- ItemTransform = [1 0 0 1 0 0] -->
- [ ] [refactor] Refactor snapping (use delta)

### PageSizeFromFilename
- [ ] [fix] Error on pages set to 1:X scale [#129](https://github.com/pchiorean/Indentz/issues/129)

### PrepareForExport
- [ ] [fix] Ignore hidden layers
- [ ] [update] Read layer variants from `layers.txt`

### QuickExport
- [ ] [update] ? JSONify preferences (see 'hardwareConfig.json')
- [ ] [feature] Include subfolders
- [ ] [feature] History for dropdowns
- [ ] [feature] JPG & ?TIFF export profiles
- [ ] [feature] ? 'View PDF after exporting' checkbox, alert if > 20 files

### QR, QRBatch
- [ ] [fix] Align to visible area
- [ ] [fix] Remove 'preview' & 'print' from filenames
- [ ] [fix] Improve line breaking
- [ ] [fix] ? Don't break line on '-'

### SpreadsToFiles
- [ ] [docs] Explain suffix autodetection

### TextAutoSize
- [ ] [update] Check `baselineShift` [#132](https://github.com/pchiorean/Indentz/issues/132)
- [ ] [update] ? Break paragraphs when multiple lines, on 2nd run

### New scripts
- [ ] [new] `SeparateSpreadPages.jsx` [#136](https://github.com/pchiorean/Indentz/issues/136)
- [ ] [new] `LayersToFiles.jsx` [#94](https://github.com/pchiorean/Indentz/issues/94)
