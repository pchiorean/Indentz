# TODO

### Global
- [x] [docs] Update documentation
  - [x] [`f566451`](https://github.com/pchiorean/Indentz/commit/f558c7530239c8a8acaa6e591db7553b6819d78e) [style] `CleanupLabels.jsx` -> `ClearLabels.jsx`
  - [x] [`da984c1`](https://github.com/pchiorean/Indentz/commit/da984c163e88f568bf72eb291ccf52e651792324) [new] `DeleteGuides.jsx`
  - [x] [`5e2d6b5`](https://github.com/pchiorean/Indentz/commit/5e2d6b51b5d5045bc6e4bb6542bfb92bba042d06) `PrepareForExport.jsx`: [update] Add 'foil' layer
  - [x] [`06ab3d5`](https://github.com/pchiorean/Indentz/commit/06ab3d5ea7868698c6f814b3106646f61b4901a5) `PageRatios.jsx`: [update] Put info on slug
  - [x] [`ee96520`](https://github.com/pchiorean/Indentz/commit/ee9652084bafac7bef2a1cd76bb501bf2ca09523) [style] `PageRatios.jsx` -> `LabelPageRatios.jsx`
  - [x] [docs] Add documentation for `QuickExport.jsx`
- [x] [fix] Remove '&' from `forbiddenFilenameChars`
- [ ] [update] ? `selectDialog`/`selectDlg`
- [ ] [feature] Add `@include` support when parsing TSVs [#137](https://github.com/pchiorean/Indentz/issues/137)
- [ ] [update] Make a custom object style for 'Visible area' frame [#123](https://github.com/pchiorean/Indentz/issues/123)

---

### Clip/ClipUndo
- [ ] [update] Keep original label [#135](https://github.com/pchiorean/Indentz/issues/135)

### DefaultSwatches
- [ ] [fix] Check values on parsing
- [ ] [feature] Merge known swatch variants [#126](https://github.com/pchiorean/Indentz/issues/126)

### DocCleanup
- [x] [feature] Convert all empty text frames to unassigned
- [ ] [feature] Remove unused masters
- [ ] [feature] Remove unused styles and groups (https://community.adobe.com/t5/indesign/delete-unused-paragraph-styles/m-p/1089672#M165331)

### FitTo
- [ ] [fix] Check item's parent [#130](https://github.com/pchiorean/Indentz/issues/130)
- [ ] [fix] Check for transformations [#131](https://github.com/pchiorean/Indentz/issues/131)

### PageRatios
- [x] [update] Put text on slug (name: `<page label>`)
- [x] [style] Rename to `LabelPageRatios.jsx`

### PageSizeFromFilename
- [ ] [fix] Error on pages set to 1:X scale [#129](https://github.com/pchiorean/Indentz/issues/129)

### PrepareForExport
- [ ] [fix] Ignore hidden items

### QuickExport
- [ ] [fix] Don't save 'Overwrite files' state
- [ ] [feature] Export separate pages (see `SpreadToFiles.jsx`)
- [ ] [feature] Include subfolders
- [ ] [feature] ? 'View PDF after exporting' checkbox, alert if > 20 files
- [ ] [feature] ? 'Advanced mode' checkbox
- [ ] [feature] History for dropdowns
- [ ] [feature] JPG & TIFF export profiles

### QR, QRBatch
- [ ] [fix] Don't break line on '-'
- [ ] [update] Remove 'preview', 'print' et al from filenames
- [ ] [fix] Check for visible area frame
- [ ] [fix] Improve line breaking

### TextAutoSize
- [ ] [update] ? Break paragraph for frames with multiple lines
- [ ] [update] Check `baselineShift` [#132](https://github.com/pchiorean/Indentz/issues/132)

### ZoomTo
- [ ] [update] When zooming to whole page/spread, include the bleed [#125](https://github.com/pchiorean/Indentz/issues/125)

---

### New scripts
- [ ] [new] `SeparateSpreadPages.jsx` [#136](https://github.com/pchiorean/Indentz/issues/136)
- [ ] [new] `LayersToFiles.jsx` [#94](https://github.com/pchiorean/Indentz/issues/94)
