## Changelog

### [Current version](https://github.com/pchiorean/Indentz/compare/22.4.11...master)

- [`upd`](https://github.com/pchiorean/Indentz/commit/c7459d5d0044b30edb875af724d718671f249b74)
  ** ** Split step 3 into separate steps
- [`fix`](https://github.com/pchiorean/Indentz/commit/f06e68d91e8abab4e08933162f4676b8fceaafa6)
  **DefPrefs:** Added 'Coated FOGRA39' as CMYK profile fallback
- [`fix`](https://github.com/pchiorean/Indentz/commit/9858c669dc00ff0ec353796373935aae1c758faf)
  [`fix`](https://github.com/pchiorean/Indentz/commit/97bf0b591a66e7790c218477fcc388053e4fbdc8)
  **lib/ParseDataFile, DefaultLayers/Swatches/ReplaceFonts/Links:** Enforced UTF-8 encoding on opening the data file

### [Release 22.4.11](https://github.com/pchiorean/Indentz/releases/tag/22.4.11)

##### New features

- [`new`](https://github.com/pchiorean/Indentz/commit/880aa8ec0a66dbff191be1af103a493c4b7ce1d5)
  **DocCleanup**: Added a prompt to delete empty frames

##### Updates

- [`brk`](https://github.com/pchiorean/Indentz/commit/937f8db5656296e4dcee4d2261540252a7210173)
  **lib/ProgressBar**: Refactored methods – values are updated separately from messages (values are simpler to increment)
- [`upd`](https://github.com/pchiorean/Indentz/commit/2cc1c2aff82ac6c490b94a59a4f719f94a9b564b)
  **QuickExport**: Check cancel request more often (between each export instead of between documents)
- [`upd`](https://github.com/pchiorean/Indentz/commit/220c047ee848b37714094be138ec93e31e3a67cd)
  **DefaultLayers**: Layers get themselves as the first variant
- [`upd`](https://github.com/pchiorean/Indentz/commit/bcf0ca00315b766d7c366cd17d20ff0ea53a0f57)
  **DefaultSwatches**: Swatches get their 'Color Value Name' as the first variant
- [`upd`](https://github.com/pchiorean/Indentz/commit/8ab105997d7dbc64e3e1aaf485d463fc3939fa1c)
  **DocCleanup**: Improved pasteboard setting logic
- [`upd`](https://github.com/pchiorean/Indentz/commit/7e850f53bd693a7cf44fa3917e019f96f56dd282)
  **DefaultSwatches, ReplaceLinks**: Added progress bars
- [`upd`](https://github.com/pchiorean/Indentz/commit/880aa8ec0a66dbff191be1af103a493c4b7ce1d5)
  **DocCleanup**: Changed visibility and locked state of some technical layers (e.g., 'dielines')

##### Bug fixes
- [`fix`](https://github.com/pchiorean/Indentz/commit/a0278cdce29715ee9934266fde3e7a024e9c331c)
  **lib/ReplaceLink**: Removed `errors.push()`, we already return boolean status
- [`fix`](https://github.com/pchiorean/Indentz/commit/5b0f0f8c16283ab59765857efa9ff4e97ae4cf2a)
  **TextAutosize**: Added a check for overflown text when disabling hyphenation for one-liners
- [`fix`](https://github.com/pchiorean/Indentz/commit/bb12fb85da5f0a780b8962b379da86f4c8dc3ba9)
  **DefaultLayers/Swatches/ReplaceFonts/Links**: Don't skip error reporting when there are no records
- [`fix`](https://github.com/pchiorean/Indentz/commit/880aa8ec0a66dbff191be1af103a493c4b7ce1d5)
  **DocCleanup**: Fixed an overzealous trimming of overflowed text
- [`fix`](https://github.com/pchiorean/Indentz/commit/0d38de1cd6d3a6c42292f1d9fdb2b81220929e69)
  **DocCleanup**: Skip frames with strokes when converting empty frames to graphic frames

##### Miscellaneous
- [`del`](https://github.com/pchiorean/Indentz/commit/7b768b5f8cce9c6c975beed0c00977e1d8428122)
  Removed `DocDefaults` stub
- [`ref`](https://github.com/pchiorean/Indentz/commit/015098b840418e3700a3499df0d0fbd49243ef05)
  **QRBatch**: Processed lines are commented with just a '#', no space; works better when aligning columns with 'Rainbow CSV'
- [`ref`](https://github.com/pchiorean/Indentz/commit/98623ed89d2e82d4b138c071d3d33db659236345)
  **DefaultLayers/Swatches/ReplaceFonts/Links**: Tweaked messages for BigSur's vertical alerts
- [`doc`](https://github.com/pchiorean/Indentz/commit/14f7688731f5ba609c84530fee67600a55248e0b)
  **lib/ReplaceLink, ReplaceLinks**: Clarified/removed a mention about local links

### [Release 22.3.11](https://github.com/pchiorean/Indentz/releases/tag/22.3.11)

##### New features

- [`new`](https://github.com/pchiorean/Indentz/commit/ae70c878cc579c3a1714e67a5756e519597bb3ea)
  **lib/MoveToLayers**: Move items to layers, optionally setting front/back order
- [`new`](https://github.com/pchiorean/Indentz/commit/fd40557b6a81caa4342884132746c75120f64f52)
  **DocCleanup**: Empty non-text frames will be converted to graphic frames to make them visible on complex layouts
- [`new`](https://github.com/pchiorean/Indentz/commit/4b100ce6490f374b8047d2cf9f9e5b239e6351bb)
  **ReplaceLinks**: 'Document links' list now accepts '*' and '?' wildcards

##### Updates

- [`upd`](https://github.com/pchiorean/Indentz/commit/ca8bf04cc4561838f7cfa6ff0563a46d5a3cbacd)
  [`upd`](https://github.com/pchiorean/Indentz/commit/e8470e8aceaa8664e8c0d35c355c9dfb4c0a7a52)
  **DocCleanup, DocDefaults**: Added progress bars
- [`ref`](https://github.com/pchiorean/Indentz/commit/b804940a29d841ead53543b87acbf0f94424c6f9)
  **QRBatch**: Removed bounds fallback (it's done in the `GetBounds` lib now)
- [`brk`](https://github.com/pchiorean/Indentz/commit/c7420f394c72661ca1f0f459fc8b882dae80576d)
  **lib/FitTo, lib/GetBounds**: The visible area will now fallback to page/spread size
- [`upd`](https://github.com/pchiorean/Indentz/commit/2cbdc230c18ec232078d4e61928640fae793e772)
  **DefaultLayers/Swatches/ReplaceFonts/Links**: Set verbosity to INFO when **Ctrl** is pressed
- [`upd`](https://github.com/pchiorean/Indentz/commit/41bc44c5e4c47cc25054f15d6be0f66af8470eda)
  **SwatchesCleanup**: Merged 'R=0 G=0 B=0' to the default Black swatch

##### Bug fixes

- [`fix`](https://github.com/pchiorean/Indentz/commit/a9199d8ca043d2daee502979c0dbd54ab52f37b5)
  [`fix`](https://github.com/pchiorean/Indentz/commit/667ad41564a566736e6b8433874287899367e593)
  **QR, QRBatch**: Fixed some errors in suffix regexp matching (01/27 bugs)
- [`fix`](https://github.com/pchiorean/Indentz/commit/da98c89349cae6b159f8d9c8b20910064e1401ee)
  Don't resize (**PageSizeFromFilename**) or don't split (**QuickExport**) documents with a mixture of sizes (e.g., 210x297 + 297x210)

##### Miscellaneous

- [`doc`](https://github.com/pchiorean/Indentz/commit/71016890effb5e838d88e1d07a9551a018a064e6)
  Added a folder with sample data files
- [`ref`](https://github.com/pchiorean/Indentz/commit/5fbd56abfeb7a46fd5e8bec0bb2e48d419573a90)
  Renamed **lib/isIn** to **isInArray**

### [Release 22.2.9](https://github.com/pchiorean/Indentz/releases/tag/22.2.9)

##### New features

- [`brk`](https://github.com/pchiorean/Indentz/commit/3e49e0e84168940d265b77f541bb967f441c7d8e)
  **QR 4.0, QRBatch 3.0**: Added suffix support (see [`SpreadsToFiles`](README.md#file))
- [`upd`](https://github.com/pchiorean/Indentz/commit/bcdc2ad7b12709b748396a9f0104b36c710953d1)
  **lib/ProgressBar**: Added a second (optional) progress bar
- [`upd`](https://github.com/pchiorean/Indentz/commit/0fc73f2d1574cd5cc5747276a3fd544e6028e103)
  **QuickExport 2.19**: Cancel export if 'Esc' is kept pressed
- [`new`](https://github.com/pchiorean/Indentz/commit/b0cec7208c5c08d82bd5efeb48850e01e2fc8677)
  **QuickExport 2.17**: Added a 'Save as…' option for removing cruft and reducing documents size
- [`upd`](https://github.com/pchiorean/Indentz/commit/111a3d78ecd478439ae568d6d045e04ecaa6acfd)
  **QR 3.7, QRBatch 2.9**: Added a checkbox for uppercase text
- [`upd`](https://github.com/pchiorean/Indentz/commit/f42cda93e86b35d8874c6d7224ca960c88d815ba)
  **QuickExport 2.13**: When exporting files to subfolders, a '+' in the suffix will truncate the subfolder name
- [`upd`](https://github.com/pchiorean/Indentz/commit/2813627388fe29db705688f4e942141d0e86d7f3)
  **lib/ParseDataFile 2.1**: You can now use backslash at the end of a line to split long lines
- [`brk`](https://github.com/pchiorean/Indentz/commit/3151eda817f88cc2e83e97e3f3c2f4edc222f073)
  **lib/ParseDataFile 2.0**: Extended reporting granularity (fatal, warning, info, etc)
- [`new`](https://github.com/pchiorean/Indentz/commit/3f151932a2dfe434649999dd97f91739e5f5e3be)
  Added **GuidesAdd**: Adds guides on pages' edges and inner centers or on selected objects' edges (mostly a template script)
- [`new`](https://github.com/pchiorean/Indentz/commit/3d4e0ad39ff33bf1da6adb89c222788a8b821086)
  Added **ReplaceLinks**: Replaces document links from a substitution list
- [`upd`](https://github.com/pchiorean/Indentz/commit/06f2e5c3dfa7ee2076c2373e7b7dc990c95f727f)
  **DocCleanup 2.9**: Added a step to clear default effects
- [`new`](https://github.com/pchiorean/Indentz/commit/d4f8e98b9df3bcc142537be1d865804456d11ab7)
  Added **ScaleToSpreadBleed/H/W**
- [`upd`](https://github.com/pchiorean/Indentz/commit/80a4332a3d2b2abd59a5b58e63c8fc9da5fe82ea)
  **lib/IsIn**: Added wildcards support
- [`new`](https://github.com/pchiorean/Indentz/commit/dc2e515a744d3ace9beedbfb0362765088c31857)
  Added **OffsetPath 1.2** by [Olav Martin Kvern](https://www.siliconpublishing.com/blog/free-indesign-scripts/) 
  to `/misc` (it uses InDesign's text wrap feature to create offset/inset paths)
- [`new`](https://github.com/pchiorean/Indentz/commit/793b29ad840c757da623c7478c1151da8c02a4c0)
  Added **FindFile**, **IsIn** to `/lib`

##### Updates

- [`upd`](https://github.com/pchiorean/Indentz/commit/2b8e886f04ebaf4fb912540a2183fe1a941ba403)
  **QuickExport 2.20**: Added a second progress bar when exporting separate pages
- [`upd`](https://github.com/pchiorean/Indentz/commit/21e174597e2a5409f5536616be6ee7c6bebb9774)
  **QuickExport 2.18**: Input files are now sorted in natural order
- [`upd`](https://github.com/pchiorean/Indentz/commit/832e27f6050f82b3e52d7a901bfa40be93974077)
  **QR 3.6.1, QRBatch 2.8.1**: The on-page label now has insets on both left and right sides
- [`brk`](https://github.com/pchiorean/Indentz/commit/f27f115aef8e122a05eccb0720bd359dfc11fae8#diff-0e70c2dc31abbf14f06d436fe1ed2bef11090416ae8c43bbfc1c17e48e9dae3c)
  **lib/FitTo 6.0**: Changed input to a page items array argument instead of the current document selection
- [`upd`](https://github.com/pchiorean/Indentz/commit/4442267f8e239e1721eeba8cbfb4513199d3761b)
  **DefaultLayers 3.4, DefaultSwatches 4.6, ReplaceFonts 2.3, ReplaceLinks 1.3**:
  Improved the error alert for missing data files; added a check for converted documents
- [`upd`](https://github.com/pchiorean/Indentz/commit/fd7aa42014aa30da5763db74ade92da2c66a7c33)
  **DefaultPrefs 1.5**: Disabled layout adjustment
- [`upd`](https://github.com/pchiorean/Indentz/commit/3926a97cf7225ee060e09e49e11778382ec0bd8e)
  **QR 3.6, QRBatch 2.8**: If it fits, the code will now be aligned outside visible area, instead of margins
- [`upd`](https://github.com/pchiorean/Indentz/commit/f512575295740bed67d12fe24210aefc77ab4f58)
  **ReplaceLinks 1.2**: Update out-of-date links
- [`upd`](https://github.com/pchiorean/Indentz/commit/614255fcf2c98b63fa22d2e4cb1ecef00162b796)
  **LabelPage 1.3, LabelPageRatios 2.2, PrepareForExport 2.3**: Aligned page label to crop marks
- [`upd`](https://github.com/pchiorean/Indentz/commit/3b48f362a0b451f959da7bbea8ef83fb736e0e30)
  **lib/Report 2.1.1**: Relaxed minimum window width for very small messages
- [`upd`](https://github.com/pchiorean/Indentz/commit/b8df97aaa527928efb83bdb3b5541632b5e275a9)
  **lib/Debug 1.1**: Display `NL` and `CR` as paragraph marks
- [`upd`](https://github.com/pchiorean/Indentz/commit/04d1189abba4fbd8bc2202e048a685f7b71be878)
  **QuickExport 2.15**: Report overflowed text; don't report missing links from the pasteboard
- [`upd`](https://github.com/pchiorean/Indentz/commit/3d884512a1fd6afb74691951486090cd49840cad)
  **DefaultLayers 3.3, DefaultSwatches 4.5, ReplaceFonts 2.2, ReplaceLinks 1.1**: Improved data parsing and error reporting
- [`upd`](https://github.com/pchiorean/Indentz/commit/0a37098dd76b71f41e52b75e7898f637b92a60f2)
  **lib/Report 2.1**: Updated sorting to ['natural ordering'](https://github.com/litejs/natural-compare-lite)
- [`upd`](https://github.com/pchiorean/Indentz/commit/7a1ef66fc2aabfffed3528bf83b41ba8f01c20eb)
  **lib/ReplaceSwatch**: Return replacement status (boolean)
- [`upd`](https://github.com/pchiorean/Indentz/commit/2fd1abc1aaed806c20f40a4a8eb39a69e5882599)
  **QuickExport 2.12**: Moved crop marks at 1 mm from trimbox; don't include printer's marks if no bleed
- [`upd`](https://github.com/pchiorean/Indentz/commit/4e1e7021326a1afc48c2e40c9ce54c1279b3cdd2)
  **OffsetPath 2.0**: Fixed container-objects; added option to join contours; streamlined logic
- [`upd`](https://github.com/pchiorean/Indentz/commit/6dfd0aea063fe89f67fb228e73f0c6bc378e0619)
  **lib/ProgressBar, QRBatch 2.7.1, QuickExport 2.11.2, SpreadsToFiles 1.7.9**: Centered progress bar in parent window
- [`upd`](https://github.com/pchiorean/Indentz/commit/ad2434b3a0b1dd330ebea1f9f9a99f6eabcb432c)
  **Debug 1.0**: Updated description, simplified arguments parsing, updated `trunc/pad` function
- [`upd`](https://github.com/pchiorean/Indentz/commit/ad2434b3a0b1dd330ebea1f9f9a99f6eabcb432c)
  **HW 2.7**: Also match old `<safe area>` frames as visible area marks
- [`upd`](ShowProfiles)
  **ShowProfiles 1.5**: Profiles are only available with a document opened, so create a temporary one

##### Removed features

- [`ref`](https://github.com/pchiorean/Indentz/commit/1b87d73e8725849e2828e1381ed4e5aa97a9375e)
  **QuickExport 2.21**: Removed advanced mode 'Save prefs' button

##### Bug fixes

- [`fix`](https://github.com/pchiorean/Indentz/commit/bdd052c38198a876b8682bc04f34e0da6bc2711c)
  **QRBatch 2.9.2**: Forgot to pass along the uppercase checkbox value (d'oh!)
- [`fix`](https://github.com/pchiorean/Indentz/commit/43439885e332b7b44e1b759c4e87b95eb9fe9799)
  **TextAutosize 2.5.2**: Hopefully fixed hyphenated lines breaking
- [`fix`](https://github.com/pchiorean/Indentz/commit/a96c262e49cbd6bdd4c109d1babb5edf95b12baf)
  **QuickExport 2.16.1**: Fixed a bug when skipping page information on pages with small widths
- [`fix`](https://github.com/pchiorean/Indentz/commit/c0a3cdb490067d57a54997ee4b702146223483c4)
  **QR 3.7.1, QRBatch 2.9.1**: Made the label uppercase by default
- [`fix`](https://github.com/pchiorean/Indentz/commit/30f24d7d4e40d29c3f5af26d80e8a4c21baea8fe)
  **lib/GetBounds 5.1.3**: Get the parent doc from the `page` argument, don't rely on the global `doc` variable (d'oh!)
- [`fix`](https://github.com/pchiorean/Indentz/commit/2492a2f1c1dd3efc4c17172bf056f40613531401)
  **lib/FitTo 5.5.6**: Relaxed 'object is transformed' rule to not clip 90°-rotated objects (fix regression from v5.5.4)
- [`fix`](https://github.com/pchiorean/Indentz/commit/ce1cf13f2750d04d9cf83fcd82e0759ef674309d)
  **lib/FitTo 5.5.5**: Don't move forced-fit lines to `[0, 0]`
- [`fix`](https://github.com/pchiorean/Indentz/commit/f40cdc1e437a43f68b7e4ae3188d1ba8b5300c69)
  **lib/FitTo 5.5.4**: Transformed containers and text frames are now clipped
- [`fix`](https://github.com/pchiorean/Indentz/commit/ba80564a179e9664f582efddd3fe132c8a07fb6b)
  **QuickExport 2.16**: Don't include page information when pages/spreads widths are less than 335 pt
- [`fix`](https://github.com/pchiorean/Indentz/commit/6895b3b0136908211a2a07983579916d4f4f00ac)
  **LabelPage 1.3.1, LabelPageRatios 2.2.1, PrepareForExport 2.3.1**: Added a white outline to labels
- [`fix`](https://github.com/pchiorean/Indentz/commit/70b7ac39278a7974143ce58516b140cb4d9f5930)
  **ShowFonts 1.4.6**: Fixed name reporting for missing fonts
- [`upd`](https://github.com/pchiorean/Indentz/commit/453707ad0ead37df7319644ea5435bc22a03d553)
  **QuickExport 2.14**: When exporting separate pages don't add a counter if doc has a single page/spread
- [`fix`](https://github.com/pchiorean/Indentz/commit/5661ea64bf4dbdf14900448bcd68796fbbc55eae)
  **DefaultLayers 3.3.1, DefaultSwatches 4.5.1, ReplaceFonts 2.2.1, ReplaceLinks 1.1.1**:
  Changed 'No data file found' alert verbosity level to `info`
- [`fix`](https://github.com/pchiorean/Indentz/commit/611b773f2176621a1808ede3acfe874e3a2a9343)
  **lib/ParseDataFile 2.2**: Fixed clash between general errors and record checking errors
- [`fix`](https://github.com/pchiorean/Indentz/commit/a1fdedb3fedfb614c1c47abdaeb49c6c13f96684)
  **SpreadsToFiles 1.7.12**: Fixed separator validation (regex fuckup)
- [`fix`](https://github.com/pchiorean/Indentz/commit/0ba9127a29db63820b5e7e3fe85c73cb3e34a2cc)
  **lib/ParseInfo**: Fixed reporting errors from included files
- [`fix`](https://github.com/pchiorean/Indentz/commit/ec0903a428aa608a66acf8716b90ec94dd790ca6)
  **lib/Bounds 5.1.1**: Fixed typo on `page.visible[3]`
- [`fix`](https://github.com/pchiorean/Indentz/commit/95c744efa420c35c41e966293bdac5b72fb059b8)
  **QuickExport 2.11.3**: Fixed clash with regex tokens when uniquifying filenames
- [`fix`](https://github.com/pchiorean/Indentz/commit/c171770fc5ba3ca001ef43817d11055b8c6b95e4)
  **PrepareForExport 2.2.2**: Hidden layers are now ignored
- [`fix`](https://github.com/pchiorean/Indentz/commit/ad2434b3a0b1dd330ebea1f9f9a99f6eabcb432c)
  **Clip 2.7, ClipUndo 2.5**: Only clip objects directly on spread
- [`fix`](https://github.com/pchiorean/Indentz/commit/ad2434b3a0b1dd330ebea1f9f9a99f6eabcb432c)
  **QRBatch 2.7**: Converted documents are now skipped and reported

##### Miscellaneous

- [`ref`](https://github.com/pchiorean/Indentz/commit/99a3027821968396503e42a95e4d3e6a472ebfd9)
  Changed scripts grouping & switched to calendar versioning
- [`ref`](https://github.com/pchiorean/Indentz/commit/4d6fb7b23ef5f9fdd336d7534289a35a125a52aa)
  Renamed **DeleteGuides** to **GuidesDelete** and **CleanupSwatches** to **SwatchesCleanup**
- [`ref`](https://github.com/pchiorean/Indentz/commit/0ba9127a29db63820b5e7e3fe85c73cb3e34a2cc)
  Renamed **lib/ParseInfo** to **ParseDataFile**
- [`ref`](https://github.com/pchiorean/Indentz/commit/cf1a8a16434c728e0fc8ff9eda1eddb959ec296e)
  Renamed **lib/ReplaceColors** to **ReplaceSwatch** and **lib/ReplaceLinks** to **ReplaceLink**
- [`ref`](https://github.com/pchiorean/Indentz/commit/f54c8a108c1fa9e00d979dd12d8995b6e6f320fd)
  Linked helper functions by `#include` preprocessor directive
- [`doc`](https://github.com/pchiorean/Indentz/commit/b5d8404218f7f643052f5cab7e4da4b4f7d3ff67)
  Added a [`README.md`](../lib/README.md) for helper functions in `/lib`
- [`ref`](https://github.com/pchiorean/Indentz/commit/ba06d623062e3035f4d3a57d79533018cbd3614f)
  Updated helper functions
- [`doc`](https://github.com/pchiorean/Indentz/commit/3cea9b3575c7c3668339387a4c3606509f4550dc)
  **SpreadsToFiles 1.7.10**: Added an example to the prompt message
- [`doc`](https://github.com/pchiorean/Indentz/commit/1fde6d6ab06a5381d591e557e46dab0b8f11895c)
  Updated description for some of the stubs in `/lib`
- [`ref`](https://github.com/pchiorean/Indentz/commit/63d365a6b1931cbe2ba0d7b0d6009437acac4bd6)
  [`ref`](https://github.com/pchiorean/Indentz/commit/a4fe6767f5dc757fd8aa28173b90c32adb38fb0a)
  Renamed **lib/Bounds** to **GetBounds** and **lib/FindFile** to **GetDataFile**
- [`ref`](https://github.com/pchiorean/Indentz/commit/6cee3420533728fb3c117ba8928389edf3a5ed1e)
  **lib/GetBounds 5.1.2, HW 2.7.1, PageSizeFromFilename 2.1.4, VisibleArea 3.2.1**: Renamed visible area regex
- [`ref`](https://github.com/pchiorean/Indentz/commit/6e897670752ff918136c540a57a4a46cd78ab786)
  **lib/Debug 1.0.1**: Changed context separator to '::'
- [`ref`](https://github.com/pchiorean/Indentz/commit/2da0f1ff8c6da4aa0508041674447df5ad558768)
  Renamed **OffsetPath** to **OffsetPaths**
- [`ref`](https://github.com/pchiorean/Indentz/commit/793b29ad840c757da623c7478c1151da8c02a4c0)
  Renamed **lib/Relink** to **ReplaceLinks**
- [`doc`](https://github.com/pchiorean/Indentz/commit/c8dd950b8167d4a30148c866da25e91694f9416c)
  Added a changelog

### [21.9.20](https://github.com/pchiorean/Indentz/tree/723c2fe6c71c9d5a4586f2b7685628fe0d788258)

- [`ref`](https://github.com/pchiorean/Indentz/commit/51bb19d2d7074181c5acacc8dd52931bfd3263c5)
  [`upd`](https://github.com/pchiorean/Indentz/commit/8982a3fde7956ac83372ba140a773a05dff929e2)
  [`fix`](https://github.com/pchiorean/Indentz/commit/ad2434b3a0b1dd330ebea1f9f9a99f6eabcb432c)
  Autumn cleaning: added ESLint and refactored many scripts (hopefully, there are no new bugs)

## Backlog

##### New features

- `new` **Debug**: Add a hires timer
- `new` **DefaultSwatches**: Add tints support
- `new` **QuickExport**: Add dropdown history (see page 43 of **ScriptUI** by PK)
- `new` **QuickExport**: Add JPG & `?`TIFF export profiles
- `new` **Report**: Add a button to save report to file

##### Updates

- `brk` **DefaultLayers/Swatches/ReplaceFonts/Links**: Optional arguments: data file, verbosity level
- `upd` **GetDataFile**: Use relative paths for `@include` <!-- (VSC: Paths starting with `/` are resolved relative to the current workspace; paths starting with `./` or without any prefix are resolved relative to the current file.) -->
- `upd` `?` **IsInArray**: Add regex matching to `searchValue`
- `upd` **LabelPageRatios**: Mark outer/inner ratios
- `brk` **MarkVisibleArea**: Mark the entire spread's visible area, not individual pages
- `upd` **MarkVisibleArea**: Use wildcards for layer names
- `brk` **MarkVisibleArea, PrepareForExport**: Read layer variants from `layers.txt`, fallback to defaults
- `upd` **PageMarginsFromSelection**: Set the margins of every page touched by the selection
- `upd` **PageSizeFromFilename**: Use real units (mm, cm, px) if detected
- `upd` **PageSizeFromSelection**: Without selection fit all pages to their contents
- `upd` **ParseDataFile**: Keep the record index in the returned object
- `upd` `?` **QuickExport**: JSONify preferences (see [this](https://stackoverflow.com/a/56391294) discussion)
- `upd` **ReplaceText**: Take an array of strings as input
- `upd` **ReplaceText**: Add a switch for grep matching
- `upd` **Report**: Add auto filtering mode (`true`|`false`|`auto`, default `false`)
- `upd` **Report**: Improve filtering: `-` for none of these words, `"` for exact word or phrase (or pass regex and be done with it)
- `brk` `?` **ScaleTo...**: Scale to `alignDistributeBounds`
- `upd` **SpreadsToFiles**: Split `-ABBBCC` to `-A`, `-BBB`, `-CC`
- `upd` **SpreadsToFiles**: Add a placeholder character for custom positioning
- `upd` **TextAutoSize**: Check `baselineShift`
- `upd` Use a custom object style for visible area frame
- `ref` Add `#include` fallback paths ('#includepath')
- `ref` Fix UI static/edittext width (see Marc's [measureString()](https://twitter.com/indiscripts/status/1408788941550108674))

##### Bug fixes

- `fix` **DefaultSwatches**: Check color values on parsing
- `fix` **PageSizeFromFilename**: Error on pages set to 1:X scale
- `fix` **PageSizeFromFilename**: Limit detected bleed to max values
- `fix` **PageSizeFromSelection**: Use outlined text bounds for text frames
- `fix` `transform()` and `app.transformPreferences.whenScaling`

##### New scripts

- `new` **LayersToFiles**
- `new` Convert **lib/ReplaceText** to standalone script <!-- (see [this](https://twitter.com/indiscripts/status/1463152851908276230)) -->

---

##### Legend:

`new` - new features or first release\
`brk` - changes in existing functionality that break compatibility\
`upd` - changes in existing functionality\
`del` - removed features\
`fix` - bug fixes\
`ref` - code changes that neither fixes a bug or adds a feature\
`doc` - changes in documentation
