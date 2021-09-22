## TODO

#### Global
- `upd` Make a custom object style for 'Visible area' frame [#123](https://github.com/pchiorean/Indentz/issues/123)
- `sty` Fix UI static/edittext width (see Marc's [measureString()](https://twitter.com/indiscripts/status/1408788941550108674))

#### Bounds
- `upd` `?` Convert to constructor

#### DefaultSwatches
- `fix` Check values on parsing
- `upd` Add tints support

#### DocCleanup
- `new` Ask to delete empty frames
- `new` Remove unused masters
- `new` Remove unused styles and groups [#](https://community.adobe.com/t5/indesign/delete-unused-paragraph-styles/m-p/1089672#M165331)

#### FindFile
- `upd` Use relative paths for includes

#### FitTo
- `fix` Check for transformations [#131](https://github.com/pchiorean/Indentz/issues/131) <!-- ItemTransform = [1 0 0 1 0 0] -->
- `ref` Refactor snapping (use delta)

#### LabelPageRatios
- `fix` Use spreads ratios

#### OffsetPath
- `fix` Image frames wrap to content...

#### PageMarginsFromSelection
- `upd` Set the margins of every page touched by the selection

#### PageSizeFromFilename
- `fix` Error on pages set to 1:X scale [#129](https://github.com/pchiorean/Indentz/issues/129)
- `fix` Limit detected bleed to max values

#### PageSizeFromSelection
- `fix` For text frames use outlined text bounds
- `upd` Without selection fit all pages to their contents

#### PrepareForExport
- `fix` Ignore hidden layers
- `upd` Read layer variants from `layers.txt`, fallback to defaults

#### QuickExport
- `fix` `split` Don't add a counter if doc has a single page/spread
- `fix` Don't report missing links on the pasteboard
- `fix` No crop marks if no bleed
- `upd` Put crop marks at 1 mm from trimbox
- `new` Add support for localized layers
- `new` Add history for dropdowns
- `new` JPG & `?`TIFF export profiles
- `upd` `?` Limit export subfolder to suffix's first word
- `upd` `?` JSONify preferences (see [JSON-js](https://github.com/douglascrockford/JSON-js))

#### QR, QRBatch
- `fix` Align to page > visible area > margins
- `fix` Improve line breaking
- `fix` Remove `preview` & `print` from filenames
- `fix` Remove `QR` from filenames for on-doc codes

#### Report
- `upd` Improve filtering: quotes for exact word or phrase
- `upd` Improve filtering: minus for none of these words
- `new` Add button to save errors to file

#### ScaleTo
- `upd` Scale to alignDistributeBounds

#### SpreadsToFiles
- `upd` ABBBCC -> A{1}, B{3}, C{2}

#### TextAutoSize
- `upd` Check `baselineShift` [#132](https://github.com/pchiorean/Indentz/issues/132)

#### VisibleArea*
- `brk` Mark spread's visible area
- `upd` Use wildcards for layers' names
- `upd` Read layer variants from `layers.txt`, fallback to defaults

#### New scripts
- `new` **Ctrl + digit**: Activate document #digit
- `new` `SeparateSpreadPages.jsx` [#136](https://github.com/pchiorean/Indentz/issues/136)
- `new` `LayersToFiles.jsx` [#94](https://github.com/pchiorean/Indentz/issues/94)

---

`fix` - bug fixes\
`new` - new features or first release\
`upd` - changes in existing functionality\
`brk` - changes in existing functionality that break compatibility\
`del` - removed features\
`ref` - code changes that neither fixes a bug or adds a feature\
`sty` - everything related to styling/formatting\
`doc` - changes in documentation