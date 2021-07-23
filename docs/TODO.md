# TODO

- [ ] `add` Add `@include` support when parsing TSVs [#137](https://github.com/pchiorean/Indentz/issues/137)
- [ ] `upd` Ignore columns starting with '#' when parsing TSVs
- [ ] `upd` Make a custom object style for 'Visible area' frame [#123](https://github.com/pchiorean/Indentz/issues/123)
- [ ] `add` Report: Add button to save errors to file

### DefaultSwatches
- [x] `add` Merge known swatch variants [#126](https://github.com/pchiorean/Indentz/issues/126)
- [ ] `fix` Check values on parsing

### DocCleanup
- [ ] `upd` For very large pages, set pasteboard ×50
- [ ] `add` Ask to delete empty frames
- [ ] `add` Remove unused masters
- [ ] `add` Remove unused styles and groups [#](https://community.adobe.com/t5/indesign/delete-unused-paragraph-styles/m-p/1089672#M165331)
- [ ] `fix` Fix 'sticky' unused swatches

### FilesToSpreads
- [x] `fix` Fix for namesake files in different folders

### FitTo
- [ ] `fix` Check for transformations [#131](https://github.com/pchiorean/Indentz/issues/131) <!-- ItemTransform = [1 0 0 1 0 0] -->
- [ ] `ref` Refactor snapping (use delta)

### PageSizeFromFilename
- [ ] `fix` Error on pages set to 1:X scale [#129](https://github.com/pchiorean/Indentz/issues/129)

### PrepareForExport
- [ ] `fix` Ignore hidden layers
- [ ] `upd` Read layer variants from `layers.txt`, fallback to defaults

### QuickExport
- [ ] `add` Include subfolders
- [ ] `add` History for dropdowns
- [ ] `add` JPG & ?TIFF export profiles
- [ ] `add` `?` 'View PDF after exporting' checkbox, alert if > 20 files
- [ ] `upd` `?` JSONify preferences (see 'hardwareConfig.json')

### QR, QRBatch
- [ ] `fix` Align to visible area
- [ ] `fix` Remove 'preview' & 'print' from filenames
- [ ] `fix` Improve line breaking
- [ ] `fix` `?` Don't break line on '-'

### SpreadsToFiles
- [ ] `doc` Explain suffix autodetection

### TextAutoSize
- [ ] `upd` Check `baselineShift` [#132](https://github.com/pchiorean/Indentz/issues/132)
- [ ] `upd` `?` Break paragraphs when multiple lines, on 2nd run

### New scripts
- [ ] `new` `SeparateSpreadPages.jsx` [#136](https://github.com/pchiorean/Indentz/issues/136)
- [ ] `new` `LayersToFiles.jsx` [#94](https://github.com/pchiorean/Indentz/issues/94)
