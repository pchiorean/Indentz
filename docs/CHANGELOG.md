## Changelog

#### [2021-09-28](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-09-28&type=commits)

- `new` Added **ScaleToSpreadBleed/H/W**
- `ref` **IsIn** -- Refactored to full regex matching
- `doc` **SpreadsToFiles v1.7.10** -- Added an example to the prompt message
- `doc` Updated description for some of the stubs in `/lib`

#### [2021-09-24](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-09-24&type=commits)

- `fix` **Bounds v5.1.1** -- Fixed typo on `page.visible[3]`
- `ref` **GetBounds v5.1.2, HW 2.7.1, PageSizeFromFilename v2.1.4, VisibleArea v3.2.1** -- Renamed visible area regex
- `ref` Renamed **Bounds** to **GetBounds** and **FindFile** to **GetDataFile**
- `sty` **Debug v1.0.1** -- Changed context separator to `::`

#### [2021-09-23](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-09-23&type=commits)

- `upd` **QuickExport v2.12** -- Moved crop marks at 1 mm from trimbox; don't include printer's marks if no bleed
- `fix` **QuickExport v2.11.3** -- Fixed clash with regex tokens when uniquifying filenames
- `ref` Renamed **OffsetPath** to **OffsetPaths**

#### [2021-09-22](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-09-22&type=commits)

- `upd` **OffsetPath v2.0** -- Fixed container-objects; added option to join contours; streamlined logic

#### [2021-09-21](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-09-21&type=commits)

- `upd` **ProgressBar, QRBatch v2.7.1, QuickExport v2.11.2, SpreadsToFiles v1.7.9** -- Centered progress bar in parent window
- `fix` **PrepareForExport v2.2.2** -- Hidden layers are now ignored

#### [2021-09-20](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-09-20&type=commits)

- `new` Added **OffsetPath v1.2** by [Olav Martin Kvern](https://www.siliconpublishing.com/blog/free-indesign-scripts/) to `/misc` (it uses InDesign's text wrap feature to create offset/inset paths)
- `new` Added **FindFile**, **IsIn** to `/lib`; renamed **Relink** to **ReplaceLinks**
- `upd` **Debug v1.0** -- Updated description, simplified arguments parsing, updated `trunc/pad` function
- `upd` **HW v2.7** -- Also match old `<safe area>` frames as visible area marks
- `upd` **ShowProfiles v1.5** -- Profiles are only available with a document opened, so create a temporary one
- `upd` **layers.txt** -- Added new variant 'cutcontour' for 'dielines' layer
- `upd` **swatches.txt** -- Added new variant 'FOLD' for 'Fold' swatch
- `fix` **Clip v2.7, ClipUndo v2.5** -- Only clip objects directly on spread
- `fix` **QRBatch v2.7** -- Converted documents are now skipped and reported
- `sty` `upd` `fix` Autumn cleaning: added ESLint and refactored many scripts (hopefully, there are no new bugs)
- `doc` Added a changelog

---

<details><summary><strong>Backlog</strong></summary>

##### New features

- `new` **DocCleanup** -- Ask to delete empty frames
- `new` **DocCleanup** -- Remove unused masters
- `new` **DocCleanup** -- Remove unused styles and groups [#](https://community.adobe.com/t5/indesign/delete-unused-paragraph-styles/m-p/1089672#M165331)
- `new` **QuickExport** -- Add history for dropdowns
- `new` **QuickExport** -- Add JPG & `?`TIFF export profiles
- `new` **Report** -- Add a button to save errors to file

##### Updates

- `brk` **VisibleArea** -- Mark the entire spread's visible area instead of individual pages
- `upd` **DefaultSwatches** -- Add tints support
- `upd` **FindFile** -- Use relative paths for includes
- `upd` **PageMarginsFromSelection** -- Set the margins of every page touched by the selection
- `upd` **PageSizeFromSelection** -- Without selection fit all pages to their contents
- `upd` **PrepareForExport, VisibleArea** -- Read layer variants from `layers.txt`, fallback to defaults
- `upd` **Report** -- Improve filtering: minus for none of these words; quotes for exact word or phrase
- `upd` **ScaleTo...** -- Scale to `alignDistributeBounds`
- `upd` **SpreadsToFiles** -- ABBBCC -> A{1}, B{3}, C{2}
- `upd` **TextAutoSize** -- Check `baselineShift` [#132](https://github.com/pchiorean/Indentz/issues/132)
- `upd` **VisibleArea** -- Use wildcards for layers' names
- `upd` Make a custom object style for 'Visible area' frame [#123](https://github.com/pchiorean/Indentz/issues/123)
- `ref` **FitTo** -- Refactor snapping to use delta
- `sty` Fix UI static/edittext width (see Marc's [measureString()](https://twitter.com/indiscripts/status/1408788941550108674))
- `?` `brk` **Bounds** -- Convert to pseudo-class (see [Overflow.js](https://github.com/rendertom/Overflow/blob/dce56e9bb82db9a7e0d3864ce1e98afb5c00b586/src/Overflow.js))
- `?` `upd` **QuickExport** -- Limit export subfolder to suffix's first word
- `?` `upd` **QuickExport** -- JSONify preferences (see [JSON-js](https://github.com/douglascrockford/JSON-js))

##### Bug fixes

- `fix` **DefaultSwatches** -- Check values on parsing
- `fix` **FitTo** -- Check for transformations [#131](https://github.com/pchiorean/Indentz/issues/131) <!-- ItemTransform = [1 0 0 1 0 0] -->
- `fix` **FitTo** -- Forced-fit lines are moved to [0,0]
- `fix` **LabelPageRatios** -- Use spreads' ratio
- `fix` **PageSizeFromFilename** -- Error on pages set to 1:X scale [#129](https://github.com/pchiorean/Indentz/issues/129)
- `fix` **PageSizeFromFilename** -- Limit detected bleed to max values
- `fix` **PageSizeFromSelection** -- For text frames use outlined text bounds
- `fix` **QR, QRBatch** -- Align to page > visible area > margins
- `fix` **QR, QRBatch** -- Improve line breaking
- `fix` **QRBatch** -- Remove `preview` & `print` from filenames for separate codes
- `fix` **QRBatch** -- Remove `QR` from filenames for on-doc codes
- `fix` **QuickExport** -- Check for overset text
- `fix` **QuickExport** -- Don't report missing links from the pasteboard
- `fix` **QuickExport** -- Export separate pages: Don't add a counter if doc has a single page/spread
- `fix` **ShowFonts** -- Font info not available for missing fonts

##### New scripts

- `new` **ActivateDoc1/2/3...** -- Quickly activate documents with Ctrl +  #1, 2, 3...
- `new` **SeparateSpreadPages** [#136](https://github.com/pchiorean/Indentz/issues/136)
- `new` **LayersToFiles** [#94](https://github.com/pchiorean/Indentz/issues/94)

</details>

---

###### Legend:

`new` - new features or first release\
`brk` - changes in existing functionality that break compatibility\
`upd` - changes in existing functionality\
`del` - removed features\
`fix` - bug fixes\
`ref` - code changes that neither fixes a bug or adds a feature\
`sty` - everything related to styling/formatting\
`doc` - changes in documentation
