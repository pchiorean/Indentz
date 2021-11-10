## Changelog

- [`fix`](https://github.com/pchiorean/Indentz/commit/a96c262e49cbd6bdd4c109d1babb5edf95b12baf)
  **QuickExport v2.16.1**: Fixed a bug when skipping page information on pages with small widths

#### [2021-11-09](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-11-09&type=commits)
- [`upd`](https://github.com/pchiorean/Indentz/commit/832e27f6050f82b3e52d7a901bfa40be93974077)
  **QR v3.6.1, QRBatch v2.8.1**: The on-page label now has insets on both left and right sides
- [`upd`](https://github.com/pchiorean/Indentz/commit/111a3d78ecd478439ae568d6d045e04ecaa6acfd)
  **QR v3.7, QRBatch v2.9**: Added a checkbox for uppercase text

#### [2021-11-04](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-11-04&type=commits)
- [`brk`](https://github.com/pchiorean/Indentz/commit/f27f115aef8e122a05eccb0720bd359dfc11fae8#diff-0e70c2dc31abbf14f06d436fe1ed2bef11090416ae8c43bbfc1c17e48e9dae3c)
  **FitTo v6.0**: Changed input (the objects to fit) to a page items array argument instead of the current document selection

#### [2021-11-02](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-11-02&type=commits)
- [`upd`](https://github.com/pchiorean/Indentz/commit/4442267f8e239e1721eeba8cbfb4513199d3761b)
  **DefaultLayers v3.4, DefaultSwatches v4.6, ReplaceFonts v2.3, ReplaceLinks v1.3**:
  Improved the error alert for missing data files; added a check for converted documents
- [`upd`](https://github.com/pchiorean/Indentz/commit/fd7aa42014aa30da5763db74ade92da2c66a7c33)
  **DefaultPrefs v1.5**: Disabled layout adjustment

#### [2021-10-29](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-10-29&type=commits)
- [`fix`](https://github.com/pchiorean/Indentz/commit/30f24d7d4e40d29c3f5af26d80e8a4c21baea8fe)
  **GetBounds v5.1.3**: Get the parent doc from the `page` argument, don't rely on the global `doc` variable (d'oh!)
- [`upd`](https://github.com/pchiorean/Indentz/commit/3926a97cf7225ee060e09e49e11778382ec0bd8e)
  **QR v3.6, QRBatch v2.8**: If it fits, the code will now be aligned outside visible area, instead of margins

#### [2021-10-27](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-10-27&type=commits)
- [`upd`](https://github.com/pchiorean/Indentz/commit/f512575295740bed67d12fe24210aefc77ab4f58)
  **ReplaceLinks v1.2**: Update out-of-date links

#### [2021-10-25](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-10-25&type=commits)
- [`fix`](https://github.com/pchiorean/Indentz/commit/2492a2f1c1dd3efc4c17172bf056f40613531401)
  **FitTo v5.5.6**: Relaxed 'object is transformed' rule to not clip 90°-rotated objects (fix regression from v5.5.4)

#### [2021-10-23](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-10-23&type=commits)
- [`fix`](https://github.com/pchiorean/Indentz/commit/f40cdc1e437a43f68b7e4ae3188d1ba8b5300c69)
  **FitTo v5.5.4**: Transformed containers and text frames are now clipped
- [`fix`](https://github.com/pchiorean/Indentz/commit/ce1cf13f2750d04d9cf83fcd82e0759ef674309d)
  **FitTo v5.5.5**: Don't move forced-fit lines to [0, 0]

#### [2021-10-18](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-10-18&type=commits)
- [`fix`](https://github.com/pchiorean/Indentz/commit/ba80564a179e9664f582efddd3fe132c8a07fb6b)
  **QuickExport v2.16**: Don't include page information when pages/spreads widths are less than 335 pt
- [`fix`](https://github.com/pchiorean/Indentz/commit/6895b3b0136908211a2a07983579916d4f4f00ac)
  **LabelPage v1.3.1, LabelPageRatios v2.2.1, PrepareForExport v2.3.1**: Added a white outline to labels

#### [2021-10-17](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-10-17&type=commits)
- [`fix`](https://github.com/pchiorean/Indentz/commit/70b7ac39278a7974143ce58516b140cb4d9f5930)
  **ShowFonts v1.4.6**: Fixed name reporting for missing fonts
- [`upd`](https://github.com/pchiorean/Indentz/commit/614255fcf2c98b63fa22d2e4cb1ecef00162b796)
  **LabelPage v1.3, LabelPageRatios v2.2, PrepareForExport v2.3**: Aligned page label to crop marks
- [`sty`](https://github.com/pchiorean/Indentz/commit/3b48f362a0b451f959da7bbea8ef83fb736e0e30)
  **Report v2.1.1**: Relaxed minimum window width for very small messages

#### [2021-10-16](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-10-16&type=commits)
- [`upd`](https://github.com/pchiorean/Indentz/commit/b8df97aaa527928efb83bdb3b5541632b5e275a9)
  **Debug v1.1**: Display NL/CRs as paragraph marks
- [`upd`](https://github.com/pchiorean/Indentz/commit/04d1189abba4fbd8bc2202e048a685f7b71be878)
  **QuickExport v2.15**: Report overflowed text; don't report missing links from the pasteboard

#### [2021-10-13](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-10-13&type=commits)
- [`upd`](https://github.com/pchiorean/Indentz/commit/453707ad0ead37df7319644ea5435bc22a03d553)
  **QuickExport v2.14**: When exporting separate pages don't add a counter if doc has a single page/spread

#### [2021-10-12](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-10-12&type=commits)
- [`fix`](https://github.com/pchiorean/Indentz/commit/5661ea64bf4dbdf14900448bcd68796fbbc55eae)
  **DefaultLayers v3.3.1, DefaultSwatches v4.5.1, ReplaceFonts v2.2.1, ReplaceLinks v1.1.1**:
  Change 'No data file found' alert verbosity level to `info`
- [`upd`](https://github.com/pchiorean/Indentz/commit/f42cda93e86b35d8874c6d7224ca960c88d815ba)
  **QuickExport v2.13**: When exporting files to subfolders, a `+` in the suffix will truncate the subfolder name

#### [2021-10-11](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-10-11&type=commits)
- [`fix`](https://github.com/pchiorean/Indentz/commit/611b773f2176621a1808ede3acfe874e3a2a9343)
  **ParseDataFile v2.2**: Fixed clash between general errors and record checking errors
- [`upd`](https://github.com/pchiorean/Indentz/commit/3d884512a1fd6afb74691951486090cd49840cad)
  **DefaultLayers v3.3, DefaultSwatches v4.5, ReplaceFonts v2.2, ReplaceLinks v1.1**: Improved data parsing and error reporting

#### [2021-10-10](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-10-10&type=commits)
- [`new`](https://github.com/pchiorean/Indentz/commit/3f151932a2dfe434649999dd97f91739e5f5e3be)
  Added **GuidesAdd**: Adds guides on pages' edges and inner centers or on selected objects' edges (mostly a template script)
- [`new`](https://github.com/pchiorean/Indentz/commit/3d4e0ad39ff33bf1da6adb89c222788a8b821086)
  Added **ReplaceLinks**: Replaces document links from a substitution list
- [`brk`](https://github.com/pchiorean/Indentz/commit/3151eda817f88cc2e83e97e3f3c2f4edc222f073)
  **ParseDataFile v2.0**: Extended reporting granularity (fatal, warning, info, etc)
- [`upd`](https://github.com/pchiorean/Indentz/commit/2813627388fe29db705688f4e942141d0e86d7f3)
  **ParseDataFile v2.1**: You can now use backslash at the end of a line to split long lines
- [`ref`](https://github.com/pchiorean/Indentz/commit/4d6fb7b23ef5f9fdd336d7534289a35a125a52aa)
  Renamed **DeleteGuides** to **GuidesDelete** and **CleanupSwatches** to **SwatchesCleanup**

#### [2021-10-09](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-10-09&type=commits)
- [`upd`](https://github.com/pchiorean/Indentz/commit/0a37098dd76b71f41e52b75e7898f637b92a60f2)
  **Report v2.1**: Updated sorting to ['natural ordering'](https://github.com/litejs/natural-compare-lite)

#### [2021-10-06](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-10-06&type=commits)
- [`fix`](https://github.com/pchiorean/Indentz/commit/a1fdedb3fedfb614c1c47abdaeb49c6c13f96684)
  **SpreadsToFiles v1.7.12**: Fixed separator validation (regex fuckup)

#### [2021-10-01](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-10-01&type=commits)
- [`upd`](https://github.com/pchiorean/Indentz/commit/7a1ef66fc2aabfffed3528bf83b41ba8f01c20eb)
  **ReplaceSwatch**: Return replacement status (boolean)
- [`fix`](https://github.com/pchiorean/Indentz/commit/0ba9127a29db63820b5e7e3fe85c73cb3e34a2cc)
  **ParseInfo**: Fixed reporting errors from included files
- [`ref`](https://github.com/pchiorean/Indentz/commit/0ba9127a29db63820b5e7e3fe85c73cb3e34a2cc)
  Renamed **ParseInfo** to **ParseDataFile**

#### [2021-09-30](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-09-30&type=commits)
- [`ref`](https://github.com/pchiorean/Indentz/commit/cf1a8a16434c728e0fc8ff9eda1eddb959ec296e)
  Renamed **ReplaceColors** to **ReplaceSwatch** and **ReplaceLinks** to **ReplaceLink**
- [`ref`](https://github.com/pchiorean/Indentz/commit/f54c8a108c1fa9e00d979dd12d8995b6e6f320fd)
  Linked helper functions by `#include` preprocessor directive
- [`doc`](https://github.com/pchiorean/Indentz/commit/b5d8404218f7f643052f5cab7e4da4b4f7d3ff67)
  Added a `README.md` for helper functions in `/lib`

#### [2021-09-29](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-09-29&type=commits)
- [`upd`](https://github.com/pchiorean/Indentz/commit/06f2e5c3dfa7ee2076c2373e7b7dc990c95f727f)
  **DocCleanup v2.9**: Added a step to clear default effects
- [`ref`](https://github.com/pchiorean/Indentz/commit/ba06d623062e3035f4d3a57d79533018cbd3614f)
  Updated helper functions

#### [2021-09-28](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-09-28&type=commits)
- [`new`](https://github.com/pchiorean/Indentz/commit/d4f8e98b9df3bcc142537be1d865804456d11ab7)
  Added **ScaleToSpreadBleed/H/W**
- [`ref`](https://github.com/pchiorean/Indentz/commit/80a4332a3d2b2abd59a5b58e63c8fc9da5fe82ea)
  **IsIn**: Refactored to regex matching
- [`doc`](https://github.com/pchiorean/Indentz/commit/3cea9b3575c7c3668339387a4c3606509f4550dc)
  **SpreadsToFiles v1.7.10**: Added an example to the prompt message
- [`doc`](https://github.com/pchiorean/Indentz/commit/1fde6d6ab06a5381d591e557e46dab0b8f11895c)
  Updated description for some of the stubs in `/lib`

#### [2021-09-24](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-09-24&type=commits)
- [`fix`](https://github.com/pchiorean/Indentz/commit/ec0903a428aa608a66acf8716b90ec94dd790ca6)
  **Bounds v5.1.1**: Fixed typo on `page.visible[3]`
- [`ref`](https://github.com/pchiorean/Indentz/commit/6cee3420533728fb3c117ba8928389edf3a5ed1e)
  **GetBounds v5.1.2, HW 2.7.1, PageSizeFromFilename v2.1.4, VisibleArea v3.2.1**: Renamed visible area regex
- [`ref`](https://github.com/pchiorean/Indentz/commit/63d365a6b1931cbe2ba0d7b0d6009437acac4bd6)
  [`ref`](https://github.com/pchiorean/Indentz/commit/a4fe6767f5dc757fd8aa28173b90c32adb38fb0a)
  Renamed **Bounds** to **GetBounds** and **FindFile** to **GetDataFile**
- [`sty`](https://github.com/pchiorean/Indentz/commit/6e897670752ff918136c540a57a4a46cd78ab786)
  **Debug v1.0.1**: Changed context separator to `::`

#### [2021-09-23](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-09-23&type=commits)
- [`upd`](https://github.com/pchiorean/Indentz/commit/2fd1abc1aaed806c20f40a4a8eb39a69e5882599)
  **QuickExport v2.12**: Moved crop marks at 1 mm from trimbox; don't include printer's marks if no bleed
- [`fix`](https://github.com/pchiorean/Indentz/commit/95c744efa420c35c41e966293bdac5b72fb059b8)
  **QuickExport v2.11.3**: Fixed clash with regex tokens when uniquifying filenames
- [`ref`](https://github.com/pchiorean/Indentz/commit/2da0f1ff8c6da4aa0508041674447df5ad558768)
  Renamed **OffsetPath** to **OffsetPaths**

#### [2021-09-22](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-09-22&type=commits)
- [`upd`](https://github.com/pchiorean/Indentz/commit/4e1e7021326a1afc48c2e40c9ce54c1279b3cdd2)
  **OffsetPath v2.0**: Fixed container-objects; added option to join contours; streamlined logic

#### [2021-09-21](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-09-21&type=commits)
- [`upd`](https://github.com/pchiorean/Indentz/commit/6dfd0aea063fe89f67fb228e73f0c6bc378e0619)
  **ProgressBar, QRBatch v2.7.1, QuickExport v2.11.2, SpreadsToFiles v1.7.9**: Centered progress bar in parent window
- [`fix`](https://github.com/pchiorean/Indentz/commit/c171770fc5ba3ca001ef43817d11055b8c6b95e4)
  **PrepareForExport v2.2.2**: Hidden layers are now ignored

#### [2021-09-20](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-09-20&type=commits)
- [`new`](https://github.com/pchiorean/Indentz/commit/dc2e515a744d3ace9beedbfb0362765088c31857)
  Added **OffsetPath v1.2** by [Olav Martin Kvern](https://www.siliconpublishing.com/blog/free-indesign-scripts/) 
  to `/misc` (it uses InDesign's text wrap feature to create offset/inset paths)
- [`new`](https://github.com/pchiorean/Indentz/commit/793b29ad840c757da623c7478c1151da8c02a4c0)
  Added **FindFile**, **IsIn** to `/lib`; renamed **Relink** to **ReplaceLinks**
- [`upd`](https://github.com/pchiorean/Indentz/commit/ad2434b3a0b1dd330ebea1f9f9a99f6eabcb432c)
  **Debug v1.0**: Updated description, simplified arguments parsing, updated `trunc/pad` function
- [`upd`](https://github.com/pchiorean/Indentz/commit/ad2434b3a0b1dd330ebea1f9f9a99f6eabcb432c)
  **HW v2.7**: Also match old `<safe area>` frames as visible area marks
- [`upd`](ShowProfiles)
  **ShowProfiles v1.5**: Profiles are only available with a document opened, so create a temporary one
- [`upd`](https://github.com/pchiorean/Indentz/commit/13983402a1604f0587bf1a9d44eaf6063b613b19)
  **layers.txt**: Added new variant 'cutcontour' for 'dielines' layer
- [`upd`](https://github.com/pchiorean/Indentz/commit/f72c9057b9748a4f3ef9bed87c84d6f5d1be33bd)
  **swatches.txt**: Added new variant 'FOLD' for 'Fold' swatch
- [`fix`](https://github.com/pchiorean/Indentz/commit/ad2434b3a0b1dd330ebea1f9f9a99f6eabcb432c)
  **Clip v2.7, ClipUndo v2.5**: Only clip objects directly on spread
- [`fix`](https://github.com/pchiorean/Indentz/commit/ad2434b3a0b1dd330ebea1f9f9a99f6eabcb432c)
  **QRBatch v2.7**: Converted documents are now skipped and reported
- [`sty`](https://github.com/pchiorean/Indentz/commit/51bb19d2d7074181c5acacc8dd52931bfd3263c5)
  [`upd`](https://github.com/pchiorean/Indentz/commit/8982a3fde7956ac83372ba140a773a05dff929e2)
  [`fix`](https://github.com/pchiorean/Indentz/commit/ad2434b3a0b1dd330ebea1f9f9a99f6eabcb432c)
  Autumn cleaning: added ESLint and refactored many scripts (hopefully, there are no new bugs)
- [`doc`](https://github.com/pchiorean/Indentz/commit/c8dd950b8167d4a30148c866da25e91694f9416c)
  Added a changelog

---

<details><summary><strong>Backlog</strong></summary>

##### New features

- `new` **DocCleanup**: Ask to delete empty frames
- `new` **DocCleanup**: Remove unused masters
- `new` **DocCleanup**: Remove unused styles and groups
  (see [this](https://community.adobe.com/t5/indesign/delete-unused-paragraph-styles/m-p/1089672#M165331) discussion)
- `new` **QuickExport**: Add history for dropdowns
- `new` **QuickExport**: Add JPG & `?`TIFF export profiles
- `new` **Report**: Add a button to save errors to file

##### Updates

<!-- - `brk` **Debug**: LOG.debug / LOG.info / LOG.error etc -->
- `upd` **Debug**: Add a hires timer
- `upd` **DefaultSwatches**: Add tints support
- `upd` **FindFile**: Use relative paths for includes
- `upd` **IsIn**: Add regex matching to searchValue
- `ref` Rename **isIn** to **isInArray**
- `upd` **PageMarginsFromSelection**: Set the margins of every page touched by the selection
- `upd` **PageSizeFromSelection**: Without selection fit all pages to their contents
- `upd` **ParseDataFile**: Keep the record index in the returned object
- `brk` **PrepareForExport, VisibleArea**: Read layer variants from `layers.txt`, fallback to defaults
- `upd` **QuickExport**: Add 'Save as' checkbox
- `upd` **QuickExport**: JSONify preferences (see [this](https://stackoverflow.com/a/56391294) discussion)
- `upd` **ReplaceLinks**: Use wildcards for old links
- `upd` **ReplaceText**: Take an array of strings as input
- `upd` **ReplaceText**: Add a switch for grep matching
- `upd` **Report**: Add auto filtering mode (`true`|`false`|`auto`)
- `upd` **Report**: Improve filtering: `-` for none of these words, `"` for exact word or phrase
  (or use regex and be done with it)
- `brk` **ScaleTo...**: Scale to `alignDistributeBounds`
- `upd` **SpreadsToFiles**: Use a template for custom positioning
- `upd` **SpreadsToFiles**: Split '-ABBBCC' to '-A', '-BBB', '-CC'
- `upd` **TextAutoSize**: Check `baselineShift` ([#132](https://github.com/pchiorean/Indentz/issues/132))
- `brk` **VisibleArea**: Mark the entire spread's visible area, not individual pages
- `upd` **VisibleArea**: Use wildcards for layer names
- `upd` **DefaultLayers/Swatches/ReplaceFonts/Links**: Optional arguments: data file, verbosity level
- `upd` Use a custom object style for 'Visible area' frame ([#123](https://github.com/pchiorean/Indentz/issues/123))
- `sty` Fix UI static/edittext width (see Marc's [measureString()](https://twitter.com/indiscripts/status/1408788941550108674))

##### Bug fixes

- `fix` **DefaultSwatches**: Check values on parsing
- `fix` **LabelPageRatios**: Use spreads' ratio
- `fix` **PageSizeFromFilename**: Error on pages set to 1:X scale ([#129](https://github.com/pchiorean/Indentz/issues/129))
- `fix` **PageSizeFromFilename**: Limit detected bleed to max values
- `fix` **PageSizeFromFilename**: Dimensions in pixels
- `fix` **PageSizeFromSelection**: For text frames use outlined text bounds
- `fix` **QuickExport**: Link '\[As\] Spreads' and 'Export separate pages' checkboxes
- `fix` **QR, QRBatch**: Improve line breaking
- `fix` **QRBatch**: Check for converted documents
- `fix` **QRBatch**: Remove `preview` & `print` from filenames for separate codes
- `fix` **QRBatch**: Remove `QR` from filenames for on-doc codes
- `fix` `transform()` and `app.transformPreferences.whenScaling`

##### New scripts

- `new` **ActivateDoc1/2/3...**: Quickly activate document tabs with Ctrl + #1, 2, 3...
- `new` **SeparateSpreadPages** ([#136](https://github.com/pchiorean/Indentz/issues/136))
- `new` **LayersToFiles** ([#94](https://github.com/pchiorean/Indentz/issues/94))

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
