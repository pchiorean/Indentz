# TO DO

- [ ] `upd` ParseInfo: Use relative paths for includes
- [ ] `upd` ParseInfo: Ignore columns starting with `#`
- [ ] `upd` Make a custom object style for 'Visible area' frame [#123](https://github.com/pchiorean/Indentz/issues/123)
- [ ] `add` `Report()`: Add button to save errors to file
- [ ] `fix` Check for converted documents

### DefaultSwatches
- [ ] `fix` Check values on parsing

### DocCleanup
- [ ] `add` Ask to delete empty frames
- [ ] `add` Remove unused masters
- [ ] `add` Remove unused styles and groups [#](https://community.adobe.com/t5/indesign/delete-unused-paragraph-styles/m-p/1089672#M165331)
- [ ] `fix` Fix 'sticky' unused swatches

### FitTo
- [ ] `fix` Check for transformations [#131](https://github.com/pchiorean/Indentz/issues/131) <!-- ItemTransform = [1 0 0 1 0 0] -->
- [ ] `ref` Refactor snapping (use delta)

### PageSizeFromFilename
- [ ] `fix` Error on pages set to 1:X scale [#129](https://github.com/pchiorean/Indentz/issues/129)

### PrepareForExport
- [ ] `fix` Ignore hidden layers
- [ ] `upd` Read layer variants from `layers.txt`, fallback to defaults

### QuickExport
- [ ] `add` Add history for dropdowns
- [ ] `add` JPG & `?`TIFF export profiles
- [ ] `add` `?` 'View PDF after exporting' checkbox, alert if > 20 files
- [ ] `upd` `?` JSONify preferences (see `hardwareConfig.json`, `Export_Multiple_PDF_JPG.jsx`)
- [ ] `upd` `?` Limit export subfolder to suffix's first word

### QR, QRBatch
- [ ] `fix` Align to page > visible area > margins
- [ ] `fix` Remove `preview` & `print` from filenames
- [ ] `fix` Improve line breaking

### TextAutoSize
- [ ] `upd` Check `baselineShift` [#132](https://github.com/pchiorean/Indentz/issues/132)
- [ ] `upd` `?` Multiple lines: break paragraphs on 2nd run

### New scripts
- [ ] `new` `SeparateSpreadPages.jsx` [#136](https://github.com/pchiorean/Indentz/issues/136)
- [ ] `new` `LayersToFiles.jsx` [#94](https://github.com/pchiorean/Indentz/issues/94)

---

###### Legend:

`add` - new features\
`upd` - changes in existing functionality\
`brk` - changes in existing functionality that break compatibility\
`ref` - code changes that neither fixes a bug or adds a feature\
`sty` - everything related to styling/formatting\
`del` - removed features\
`fix` - bug fixes\
`doc` - changes in documentation\
`new` - first release