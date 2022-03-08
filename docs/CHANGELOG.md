## Changelog

##### [2022-03-08](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2022-03-08&type=commits)
- [`fix`](https://github.com/pchiorean/Indentz/commit/da98c89349cae6b159f8d9c8b20910064e1401ee)
  Don't resize (**PageSizeFromFilename) or don't split (**QuickExport**) documents with a mixture of sizes (e.g., 210x297 + 297x210)
- [`upd`](https://github.com/pchiorean/Indentz/commit/e8470e8aceaa8664e8c0d35c355c9dfb4c0a7a52)
  Added a progress bar

##### [2022-03-04](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2022-03-04&type=commits)
- [`upd`](https://github.com/pchiorean/Indentz/commit/4b100ce6490f374b8047d2cf9f9e5b239e6351bb)
  **ReplaceLinks**: Old links list now accepts '*' and '?' wildcards

##### [2022-02-23](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2022-02-23&type=commits)
- [`ref`](https://github.com/pchiorean/Indentz/commit/b804940a29d841ead53543b87acbf0f94424c6f9)
  Removed bounds fallback (it's done in the `GetBounds` lib now)

##### [2022-02-22](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2022-02-22&type=commits)
- [`fix`](https://github.com/pchiorean/Indentz/commit/667ad41564a566736e6b8433874287899367e593)
  Fixed suffix regexp matching nothing (bug from 01/27 commit)

##### [2022-02-13](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2022-02-13&type=commits)
- [`new`](https://github.com/pchiorean/Indentz/commit/ae70c878cc579c3a1714e67a5756e519597bb3ea)
  **MoveToLayers**: Move items to layers, optionally setting front/back order
- [`brk`](https://github.com/pchiorean/Indentz/commit/c7420f394c72661ca1f0f459fc8b882dae80576d)
  **FitTo, GetBounds**: The visible area will now fallback to page/spread size
- [`upd`](https://github.com/pchiorean/Indentz/commit/2cbdc230c18ec232078d4e61928640fae793e772)
  **DefaultLayers/Swatches/ReplaceFonts/Links**: Set verbosity to INFO when **Ctrl** is pressed
- [`upd`](https://github.com/pchiorean/Indentz/commit/41bc44c5e4c47cc25054f15d6be0f66af8470eda)
  **SwatchesCleanup**: Merged 'R=0 G=0 B=0' to the default Black swatch

##### [2022-02-10](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2022-02-10&type=commits)
- [`ref`](https://github.com/pchiorean/Indentz/commit/5fbd56abfeb7a46fd5e8bec0bb2e48d419573a90)
  Renamed **isIn** to **isInArray**

##### [2022-02-08](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2022-02-08&type=commits)
- [`ref`](https://github.com/pchiorean/Indentz/commit/99a3027821968396503e42a95e4d3e6a472ebfd9)
  Changed order & switched to calendar versioning

##### [2022-01-27](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2022-01-27&type=commits)
- [`brk`](https://github.com/pchiorean/Indentz/commit/3e49e0e84168940d265b77f541bb967f441c7d8e)
  **QR 4.0, QRBatch 3.0**: Added suffix support (see [`SpreadsToFiles`](README.md#file))
- [`ref`](https://github.com/pchiorean/Indentz/commit/1b87d73e8725849e2828e1381ed4e5aa97a9375e)
  **QuickExport 2.21**: Removed advanced mode 'Save prefs' button

##### [2021-12-19](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-12-19&type=commits)
- [`fix`](https://github.com/pchiorean/Indentz/commit/bdd052c38198a876b8682bc04f34e0da6bc2711c)
  **QRBatch 2.9.2**: Forgot to pass along the uppercase checkbox value (d'oh!)
- [`fix`](https://github.com/pchiorean/Indentz/commit/43439885e332b7b44e1b759c4e87b95eb9fe9799)
  **TextAutosize 2.5.2**: Hopefully fixed hyphenated lines breaking

##### [2021-12-13](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-12-13&type=commits)
- [`upd`](https://github.com/pchiorean/Indentz/commit/bcdc2ad7b12709b748396a9f0104b36c710953d1)
  **ProgressBar**: Added a second (optional) progress bar

##### [2021-12-08](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-12-08&type=commits)
- [`upd`](https://github.com/pchiorean/Indentz/commit/2b8e886f04ebaf4fb912540a2183fe1a941ba403)
  **QuickExport 2.20**: Added a second progress bar when exporting separate pages

##### [2021-11-23](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-11-23&type=commits)
- [`upd`](https://github.com/pchiorean/Indentz/commit/21e174597e2a5409f5536616be6ee7c6bebb9774)
  **QuickExport 2.19**: Cancel export if 'Esc' is kept pressed
- [`upd`](https://github.com/pchiorean/Indentz/commit/b0cec7208c5c08d82bd5efeb48850e01e2fc8677)
  **QuickExport 2.18**: Input files are now sorted in natural order
- [`upd`](https://github.com/pchiorean/Indentz/commit/0fc73f2d1574cd5cc5747276a3fd544e6028e103)
  **QuickExport 2.17**: Added a 'Save as…' option for removing cruft and reducing documents size
- [`fix`](https://github.com/pchiorean/Indentz/commit/c0a3cdb490067d57a54997ee4b702146223483c4)
  **QR 3.7.1, QRBatch 2.9.1**: Made the label uppercase by default

##### [2021-11-10](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-11-10&type=commits)
- [`fix`](https://github.com/pchiorean/Indentz/commit/a96c262e49cbd6bdd4c109d1babb5edf95b12baf)
  **QuickExport 2.16.1**: Fixed a bug when skipping page information on pages with small widths

##### [2021-11-09](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-11-09&type=commits)
- [`upd`](https://github.com/pchiorean/Indentz/commit/832e27f6050f82b3e52d7a901bfa40be93974077)
  **QR 3.6.1, QRBatch 2.8.1**: The on-page label now has insets on both left and right sides
- [`upd`](https://github.com/pchiorean/Indentz/commit/111a3d78ecd478439ae568d6d045e04ecaa6acfd)
  **QR 3.7, QRBatch 2.9**: Added a checkbox for uppercase text

##### [2021-11-04](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-11-04&type=commits)
- [`brk`](https://github.com/pchiorean/Indentz/commit/f27f115aef8e122a05eccb0720bd359dfc11fae8#diff-0e70c2dc31abbf14f06d436fe1ed2bef11090416ae8c43bbfc1c17e48e9dae3c)
  **FitTo 6.0**: Changed input to a page items array argument instead of the current document selection

##### [2021-11-02](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-11-02&type=commits)
- [`upd`](https://github.com/pchiorean/Indentz/commit/4442267f8e239e1721eeba8cbfb4513199d3761b)
  **DefaultLayers 3.4, DefaultSwatches 4.6, ReplaceFonts 2.3, ReplaceLinks 1.3**:
  Improved the error alert for missing data files; added a check for converted documents
- [`upd`](https://github.com/pchiorean/Indentz/commit/fd7aa42014aa30da5763db74ade92da2c66a7c33)
  **DefaultPrefs 1.5**: Disabled layout adjustment

##### [2021-10-29](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-10-29&type=commits)
- [`upd`](https://github.com/pchiorean/Indentz/commit/3926a97cf7225ee060e09e49e11778382ec0bd8e)
  **QR 3.6, QRBatch 2.8**: If it fits, the code will now be aligned outside visible area, instead of margins
- [`fix`](https://github.com/pchiorean/Indentz/commit/30f24d7d4e40d29c3f5af26d80e8a4c21baea8fe)
  **GetBounds 5.1.3**: Get the parent doc from the `page` argument, don't rely on the global `doc` variable (d'oh!)

##### [2021-10-27](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-10-27&type=commits)
- [`upd`](https://github.com/pchiorean/Indentz/commit/f512575295740bed67d12fe24210aefc77ab4f58)
  **ReplaceLinks 1.2**: Update out-of-date links

##### [2021-10-25](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-10-25&type=commits)
- [`fix`](https://github.com/pchiorean/Indentz/commit/2492a2f1c1dd3efc4c17172bf056f40613531401)
  **FitTo 5.5.6**: Relaxed 'object is transformed' rule to not clip 90°-rotated objects (fix regression from v5.5.4)

##### [2021-10-23](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-10-23&type=commits)
- [`fix`](https://github.com/pchiorean/Indentz/commit/ce1cf13f2750d04d9cf83fcd82e0759ef674309d)
  **FitTo 5.5.5**: Don't move forced-fit lines to `[0, 0]`
- [`fix`](https://github.com/pchiorean/Indentz/commit/f40cdc1e437a43f68b7e4ae3188d1ba8b5300c69)
  **FitTo 5.5.4**: Transformed containers and text frames are now clipped

##### [2021-10-18](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-10-18&type=commits)
- [`fix`](https://github.com/pchiorean/Indentz/commit/ba80564a179e9664f582efddd3fe132c8a07fb6b)
  **QuickExport 2.16**: Don't include page information when pages/spreads widths are less than 335 pt
- [`fix`](https://github.com/pchiorean/Indentz/commit/6895b3b0136908211a2a07983579916d4f4f00ac)
  **LabelPage 1.3.1, LabelPageRatios 2.2.1, PrepareForExport 2.3.1**: Added a white outline to labels

##### [2021-10-17](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-10-17&type=commits)
- [`upd`](https://github.com/pchiorean/Indentz/commit/614255fcf2c98b63fa22d2e4cb1ecef00162b796)
  **LabelPage 1.3, LabelPageRatios 2.2, PrepareForExport 2.3**: Aligned page label to crop marks
- [`fix`](https://github.com/pchiorean/Indentz/commit/70b7ac39278a7974143ce58516b140cb4d9f5930)
  **ShowFonts 1.4.6**: Fixed name reporting for missing fonts
- [`ref`](https://github.com/pchiorean/Indentz/commit/3b48f362a0b451f959da7bbea8ef83fb736e0e30)
  **Report 2.1.1**: Relaxed minimum window width for very small messages

##### [2021-10-16](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-10-16&type=commits)
- [`upd`](https://github.com/pchiorean/Indentz/commit/b8df97aaa527928efb83bdb3b5541632b5e275a9)
  **Debug 1.1**: Display `NL` and `CR` as paragraph marks
- [`upd`](https://github.com/pchiorean/Indentz/commit/04d1189abba4fbd8bc2202e048a685f7b71be878)
  **QuickExport 2.15**: Report overflowed text; don't report missing links from the pasteboard

##### [2021-10-13](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-10-13&type=commits)
- [`upd`](https://github.com/pchiorean/Indentz/commit/453707ad0ead37df7319644ea5435bc22a03d553)
  **QuickExport 2.14**: When exporting separate pages don't add a counter if doc has a single page/spread

##### [2021-10-12](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-10-12&type=commits)
- [`upd`](https://github.com/pchiorean/Indentz/commit/f42cda93e86b35d8874c6d7224ca960c88d815ba)
  **QuickExport 2.13**: When exporting files to subfolders, a '+' in the suffix will truncate the subfolder name
- [`fix`](https://github.com/pchiorean/Indentz/commit/5661ea64bf4dbdf14900448bcd68796fbbc55eae)
  **DefaultLayers 3.3.1, DefaultSwatches 4.5.1, ReplaceFonts 2.2.1, ReplaceLinks 1.1.1**:
  Changed 'No data file found' alert verbosity level to `info`

##### [2021-10-11](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-10-11&type=commits)
- [`upd`](https://github.com/pchiorean/Indentz/commit/3d884512a1fd6afb74691951486090cd49840cad)
  **DefaultLayers 3.3, DefaultSwatches 4.5, ReplaceFonts 2.2, ReplaceLinks 1.1**: Improved data parsing and error reporting
- [`fix`](https://github.com/pchiorean/Indentz/commit/611b773f2176621a1808ede3acfe874e3a2a9343)
  **ParseDataFile 2.2**: Fixed clash between general errors and record checking errors

##### [2021-10-10](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-10-10&type=commits)
- [`new`](https://github.com/pchiorean/Indentz/commit/3f151932a2dfe434649999dd97f91739e5f5e3be)
  Added **GuidesAdd**: Adds guides on pages' edges and inner centers or on selected objects' edges (mostly a template script)
- [`new`](https://github.com/pchiorean/Indentz/commit/3d4e0ad39ff33bf1da6adb89c222788a8b821086)
  Added **ReplaceLinks**: Replaces document links from a substitution list
- [`upd`](https://github.com/pchiorean/Indentz/commit/2813627388fe29db705688f4e942141d0e86d7f3)
  **ParseDataFile 2.1**: You can now use backslash at the end of a line to split long lines
- [`brk`](https://github.com/pchiorean/Indentz/commit/3151eda817f88cc2e83e97e3f3c2f4edc222f073)
  **ParseDataFile 2.0**: Extended reporting granularity (fatal, warning, info, etc)
- [`ref`](https://github.com/pchiorean/Indentz/commit/4d6fb7b23ef5f9fdd336d7534289a35a125a52aa)
  Renamed **DeleteGuides** to **GuidesDelete** and **CleanupSwatches** to **SwatchesCleanup**

##### [2021-10-09](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-10-09&type=commits)
- [`upd`](https://github.com/pchiorean/Indentz/commit/0a37098dd76b71f41e52b75e7898f637b92a60f2)
  **Report 2.1**: Updated sorting to ['natural ordering'](https://github.com/litejs/natural-compare-lite)

##### [2021-10-06](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-10-06&type=commits)
- [`fix`](https://github.com/pchiorean/Indentz/commit/a1fdedb3fedfb614c1c47abdaeb49c6c13f96684)
  **SpreadsToFiles 1.7.12**: Fixed separator validation (regex fuckup)

##### [2021-10-01](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-10-01&type=commits)
- [`upd`](https://github.com/pchiorean/Indentz/commit/7a1ef66fc2aabfffed3528bf83b41ba8f01c20eb)
  **ReplaceSwatch**: Return replacement status (boolean)
- [`fix`](https://github.com/pchiorean/Indentz/commit/0ba9127a29db63820b5e7e3fe85c73cb3e34a2cc)
  **ParseInfo**: Fixed reporting errors from included files
- [`ref`](https://github.com/pchiorean/Indentz/commit/0ba9127a29db63820b5e7e3fe85c73cb3e34a2cc)
  Renamed **ParseInfo** to **ParseDataFile**

##### [2021-09-30](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-09-30&type=commits)
- [`ref`](https://github.com/pchiorean/Indentz/commit/cf1a8a16434c728e0fc8ff9eda1eddb959ec296e)
  Renamed **ReplaceColors** to **ReplaceSwatch** and **ReplaceLinks** to **ReplaceLink**
- [`ref`](https://github.com/pchiorean/Indentz/commit/f54c8a108c1fa9e00d979dd12d8995b6e6f320fd)
  Linked helper functions by `#include` preprocessor directive
- [`doc`](https://github.com/pchiorean/Indentz/commit/b5d8404218f7f643052f5cab7e4da4b4f7d3ff67)
  Added a [`README.md`](../lib/README.md) for helper functions in `/lib`

##### [2021-09-29](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-09-29&type=commits)
- [`upd`](https://github.com/pchiorean/Indentz/commit/06f2e5c3dfa7ee2076c2373e7b7dc990c95f727f)
  **DocCleanup 2.9**: Added a step to clear default effects
- [`ref`](https://github.com/pchiorean/Indentz/commit/ba06d623062e3035f4d3a57d79533018cbd3614f)
  Updated helper functions

##### [2021-09-28](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-09-28&type=commits)
- [`new`](https://github.com/pchiorean/Indentz/commit/d4f8e98b9df3bcc142537be1d865804456d11ab7)
  Added **ScaleToSpreadBleed/H/W**
- [`ref`](https://github.com/pchiorean/Indentz/commit/80a4332a3d2b2abd59a5b58e63c8fc9da5fe82ea)
  **IsIn**: Refactored to regex matching
- [`doc`](https://github.com/pchiorean/Indentz/commit/3cea9b3575c7c3668339387a4c3606509f4550dc)
  **SpreadsToFiles 1.7.10**: Added an example to the prompt message
- [`doc`](https://github.com/pchiorean/Indentz/commit/1fde6d6ab06a5381d591e557e46dab0b8f11895c)
  Updated description for some of the stubs in `/lib`

##### [2021-09-24](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-09-24&type=commits)
- [`fix`](https://github.com/pchiorean/Indentz/commit/ec0903a428aa608a66acf8716b90ec94dd790ca6)
  **Bounds 5.1.1**: Fixed typo on `page.visible[3]`
- [`ref`](https://github.com/pchiorean/Indentz/commit/63d365a6b1931cbe2ba0d7b0d6009437acac4bd6)
  [`ref`](https://github.com/pchiorean/Indentz/commit/a4fe6767f5dc757fd8aa28173b90c32adb38fb0a)
  Renamed **Bounds** to **GetBounds** and **FindFile** to **GetDataFile**
- [`ref`](https://github.com/pchiorean/Indentz/commit/6cee3420533728fb3c117ba8928389edf3a5ed1e)
  **GetBounds 5.1.2, HW 2.7.1, PageSizeFromFilename 2.1.4, VisibleArea 3.2.1**: Renamed visible area regex
- [`ref`](https://github.com/pchiorean/Indentz/commit/6e897670752ff918136c540a57a4a46cd78ab786)
  **Debug 1.0.1**: Changed context separator to '::'

##### [2021-09-23](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-09-23&type=commits)
- [`upd`](https://github.com/pchiorean/Indentz/commit/2fd1abc1aaed806c20f40a4a8eb39a69e5882599)
  **QuickExport 2.12**: Moved crop marks at 1 mm from trimbox; don't include printer's marks if no bleed
- [`fix`](https://github.com/pchiorean/Indentz/commit/95c744efa420c35c41e966293bdac5b72fb059b8)
  **QuickExport 2.11.3**: Fixed clash with regex tokens when uniquifying filenames
- [`ref`](https://github.com/pchiorean/Indentz/commit/2da0f1ff8c6da4aa0508041674447df5ad558768)
  Renamed **OffsetPath** to **OffsetPaths**

##### [2021-09-22](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-09-22&type=commits)
- [`upd`](https://github.com/pchiorean/Indentz/commit/4e1e7021326a1afc48c2e40c9ce54c1279b3cdd2)
  **OffsetPath 2.0**: Fixed container-objects; added option to join contours; streamlined logic

##### [2021-09-21](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-09-21&type=commits)
- [`upd`](https://github.com/pchiorean/Indentz/commit/6dfd0aea063fe89f67fb228e73f0c6bc378e0619)
  **ProgressBar, QRBatch 2.7.1, QuickExport 2.11.2, SpreadsToFiles 1.7.9**: Centered progress bar in parent window
- [`fix`](https://github.com/pchiorean/Indentz/commit/c171770fc5ba3ca001ef43817d11055b8c6b95e4)
  **PrepareForExport 2.2.2**: Hidden layers are now ignored

##### [2021-09-20](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-09-20&type=commits)
- [`new`](https://github.com/pchiorean/Indentz/commit/dc2e515a744d3ace9beedbfb0362765088c31857)
  Added **OffsetPath 1.2** by [Olav Martin Kvern](https://www.siliconpublishing.com/blog/free-indesign-scripts/) 
  to `/misc` (it uses InDesign's text wrap feature to create offset/inset paths)
- [`new`](https://github.com/pchiorean/Indentz/commit/793b29ad840c757da623c7478c1151da8c02a4c0)
  Added **FindFile**, **IsIn** to `/lib`; renamed **Relink** to **ReplaceLinks**
- [`upd`](https://github.com/pchiorean/Indentz/commit/ad2434b3a0b1dd330ebea1f9f9a99f6eabcb432c)
  **Debug 1.0**: Updated description, simplified arguments parsing, updated `trunc/pad` function
- [`upd`](https://github.com/pchiorean/Indentz/commit/ad2434b3a0b1dd330ebea1f9f9a99f6eabcb432c)
  **HW 2.7**: Also match old `<safe area>` frames as visible area marks
- [`upd`](ShowProfiles)
  **ShowProfiles 1.5**: Profiles are only available with a document opened, so create a temporary one
- [`fix`](https://github.com/pchiorean/Indentz/commit/ad2434b3a0b1dd330ebea1f9f9a99f6eabcb432c)
  **Clip 2.7, ClipUndo 2.5**: Only clip objects directly on spread
- [`fix`](https://github.com/pchiorean/Indentz/commit/ad2434b3a0b1dd330ebea1f9f9a99f6eabcb432c)
  **QRBatch 2.7**: Converted documents are now skipped and reported
- [`ref`](https://github.com/pchiorean/Indentz/commit/51bb19d2d7074181c5acacc8dd52931bfd3263c5)
  [`upd`](https://github.com/pchiorean/Indentz/commit/8982a3fde7956ac83372ba140a773a05dff929e2)
  [`fix`](https://github.com/pchiorean/Indentz/commit/ad2434b3a0b1dd330ebea1f9f9a99f6eabcb432c)
  Autumn cleaning: added ESLint and refactored many scripts (hopefully, there are no new bugs)
- [`doc`](https://github.com/pchiorean/Indentz/commit/c8dd950b8167d4a30148c866da25e91694f9416c)
  Added a changelog

---

## Backlog

##### New features

- `new` **Debug**: Add a hires timer
- `new` **DefaultSwatches**: Add tints support
- `new` **DocCleanup**: Ask to delete empty frames
- `new` **DocCleanup**: Remove unused masters
- `new` **DocCleanup**: Remove unused styles and groups
  (see [this](https://community.adobe.com/t5/indesign/delete-unused-paragraph-styles/m-p/1089672#M165331) discussion)
- `new` **QuickExport**: Add a checkbox for 'Show report'
- `new` **QuickExport**: Add dropdown history (see page 43 of ScriptUI by PK)
- `new` **QuickExport**: Add JPG & `?`TIFF export profiles
- `new` **Report**: Add a button to save errors to file

##### Updates

- `brk` **DefaultLayers/Swatches/ReplaceFonts/Links**: Optional arguments: data file, verbosity level
- `upd` **FindFile**: Use relative paths for includes <!-- (VSC: Paths starting with `/` are resolved relative to the current workspace; paths starting with `./` or without any prefix are resolved relative to the current file.) -->
- `upd` **IsInArray**: Add regex matching to searchValue
- `upd` **LabelPageRatios**: Mark outer/inner ratios
- `brk` **MarkVisibleArea**: Mark the entire spread's visible area, not individual pages
- `upd` **MarkVisibleArea**: Use wildcards for layer names
- `brk` **MarkVisibleArea, PrepareForExport**: Read layer variants from `layers.txt`, fallback to defaults
- `upd` **PageMarginsFromSelection**: Set the margins of every page touched by the selection
- `upd` **PageSizeFromFilename**: Use real units (mm, cm, px)
- `upd` **PageSizeFromSelection**: Without selection fit all pages to their contents
- `upd` **ParseDataFile**: Keep the record index in the returned object
- `upd` **QuickExport**: JSONify preferences (see [this](https://stackoverflow.com/a/56391294) discussion)
- `upd` **ReplaceText**: Take an array of strings as input
- `upd` **ReplaceText**: Add a switch for grep matching
- `upd` **Report**: Add auto filtering mode (`true`|`false`|`auto`)
- `upd` **Report**: Improve filtering: `-` for none of these words, `"` for exact word or phrase (or use regex and be done with it)
- `brk` **ScaleTo...**: Scale to `alignDistributeBounds`
- `upd` **SpreadsToFiles**: Split '-ABBBCC' to '-A', '-BBB', '-CC'
- `upd` **SpreadsToFiles**: Placeholder character for custom positioning
- `upd` **TextAutoSize**: Check `baselineShift`
- `upd` Use a custom object style for 'Visible area' frame
- `ref` Fix UI static/edittext width (see Marc's [measureString()](https://twitter.com/indiscripts/status/1408788941550108674))

##### Bug fixes

- `fix` **DefaultSwatches**: Check values on parsing
- `fix` **PageSizeFromFilename**: Error on pages set to 1:X scale
- `fix` **PageSizeFromFilename**: Limit detected bleed to max values
- `fix` **PageSizeFromSelection**: For text frames use outlined text bounds
- `fix` **QR, QRBatch**: Improve line breaking
- `fix` **QuickExport**: Check if the PDF is writable before exporting
- `fix` `transform()` and `app.transformPreferences.whenScaling`

##### New scripts

- `new` **ActivateDoc1/2/3...**: Quickly activate document tabs with Ctrl + 1, 2, 3... <!-- (see [this](https://aiscripts.medium.com/showing-artboard-order-ef213c91b858)) -->
- `new` **LayersToFiles**
- `new` Convert **lib/ReplaceText** to standalone script <!-- (see [this](https://twitter.com/indiscripts/status/1463152851908276230)) -->
- `new` **SeparateSpreadPages**

---

##### Legend:

`new` - new features or first release\
`brk` - changes in existing functionality that break compatibility\
`upd` - changes in existing functionality\
`del` - removed features\
`fix` - bug fixes\
`ref` - code changes that neither fixes a bug or adds a feature\
`doc` - changes in documentation
