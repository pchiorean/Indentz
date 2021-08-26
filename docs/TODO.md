# TO DO

- `new` `Report()`: Add button to save errors to file
- `upd` `FindFile()`: Use relative paths for includes
- `upd` Make a custom object style for 'Visible area' frame [#123](https://github.com/pchiorean/Indentz/issues/123)
- `fix` Check for converted documents
- `fix` Fix static/edittext width (see [#](https://twitter.com/indiscripts/status/1408788941550108674))
- `ref` Use `===` instead of `==`
- `ref` `?` K&R, 2 spaces
- `ref` `?` `/.*/[ig]\.`

### DefaultSwatches
- `upd` Add tints support
- `fix` Check values on parsing

### DocCleanup
- `new` Ask to delete empty frames
- `new` Remove unused masters
- `new` Remove unused styles and groups [#](https://community.adobe.com/t5/indesign/delete-unused-paragraph-styles/m-p/1089672#M165331)

### FitTo
- `fix` Check for transformations [#131](https://github.com/pchiorean/Indentz/issues/131) <!-- ItemTransform = [1 0 0 1 0 0] -->
- `ref` Refactor snapping (use delta)

### PageSizeFromFilename
- `fix` Error on pages set to 1:X scale [#129](https://github.com/pchiorean/Indentz/issues/129)
- `fix` Limit detected bleed to max values

### PageSizeFromSelection
- `upd` Without selection fit all pages to their contents
- `fix` For text frames use outlined text bounds

### PrepareForExport
- `fix` Ignore hidden layers
- `upd` Read layer variants from `layers.txt`, fallback to defaults

### QuickExport
- `new` Add support for localized layers
- `new` Add history for dropdowns
- `new` JPG & `?`TIFF export profiles
- `upd` `?` Limit export subfolder to suffix's first word
- `upd` `?` JSONify preferences (see `hardwareConfig.json`, `Export_Multiple_PDF_JPG.jsx`)

### QR, QRBatch
- `fix` Align to page > visible area > margins
- `fix` Improve line breaking
- `fix` Remove `preview` & `print` from filenames

### SpreadsToFiles
- upd` ABBBCC -> A{1}, B{3}, C{2}

### TextAutoSize
- `upd` Check `baselineShift` [#132](https://github.com/pchiorean/Indentz/issues/132)
- `upd` `?` Multiple lines: break paragraphs on 2nd run

### New scripts
- `new` Ctrl+digit: Activate document #digit
- `new` `SeparateSpreadPages.jsx` [#136](https://github.com/pchiorean/Indentz/issues/136)
- `new` `LayersToFiles.jsx` [#94](https://github.com/pchiorean/Indentz/issues/94)

---

###### Legend:

`new` - new features or first release\
`upd` - changes in existing functionality\
`brk` - changes in existing functionality that break compatibility\
`ref` - code changes that neither fixes a bug or adds a feature\
`sty` - everything related to styling/formatting\
`del` - removed features\
`fix` - bug fixes\
`doc` - changes in documentation