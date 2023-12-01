## [Development version](https://github.com/pchiorean/Indentz/compare/23.7.18...dev)

- `07/21` [`upd`](https://github.com/pchiorean/Indentz/commit/4bfef0ec89bd1b19e0b7b06e1825efb1a8048c12)
  **misc/LabelPageRatios:** Improved label info: page ‣ visible ‣ margins: displays the page ratio and the visible area ratio;
  if the visible area is not defined, it fallbacks to the margins ratio.
- `07/27` [`upd`](https://github.com/pchiorean/Indentz/commit/ff18eeb9c5efa4621ab3aca1887f4f731712d54f)
  **export/QuickExport:** Added error levels to reports
- `07/31` [`upd`](https://github.com/pchiorean/Indentz/commit/d77f2257d3e278fa5ad2db270cf33da8ffc73f05)
  **export/QuickExport:** Now it gets the last exported file index from all subfolders
- `07/31` [`upd`](https://github.com/pchiorean/Indentz/commit/f721aab40c27fd774c25423ffff2b1a0824e3b4d)
  **export/QuickExport:** Switched `getFilesRecursively()` to an external lib

- `08/05` [`new`](https://github.com/pchiorean/Indentz/commit/868944d0557d7c199cf080107569eba6ebc6105a)
  **export/QuickExport:** Added sorting by date (`MM.DD`) and miscellaneous fixes
- `08/05` [`fix`](https://github.com/pchiorean/Indentz/commit/632950b79926381ae88076bd94eac591bb551799)
  **lib/getFilesRecursively:** Fixed a missing backslash in the regex expression
- `08/05` [`new`](https://github.com/pchiorean/Indentz/commit/f2ecc11eb80cf50bdd50ca7cc79730e03bf6ea5e)
  **lib/log:** Added directives for start/end of blocks (`^` and `$`)
- `08/06` [`ref`](https://github.com/pchiorean/Indentz/commit/0f5e5c46bf55272edcd10a28a890f7c4f8fb3736)
  **export/QuickExport:** Tidy up; add some comments
- `08/17` [`fix`](https://github.com/pchiorean/Indentz/commit/bbc94446bcbaded81ec592042e4398f6385b97b0)
  **misc/Clip:** Text frames are width-fitted by temporarily outlining the text; this fix skips color-filled frames
- `08/21` [`new`](https://github.com/pchiorean/Indentz/commit/9dfb241366dfa79765ff5db67b9775d1f1dab15c)
  **lib/parseDataFile, stat:** Moved `stat()` to a separate file
- `08/21` [`upd`](https://github.com/pchiorean/Indentz/commit/ecc6a3c37c8615f5219728b375ff28b28ef289c0)
  **cleanup/DefaultLayers; export/QuickExport; misc/QR, QRBatch:** Switched to `stat()` for error reporting
- `08/29` [`upd`](https://github.com/pchiorean/Indentz/commit/a223444bf91c64ba5eeab2e41f38b3c1e03d196a)
  **export/QuickExport:** Improved persistence of output folder when saving settings
- `08/29` [`upd`](https://github.com/pchiorean/Indentz/commit/6103d8cd5c77b0cc0507b287f5d28fba987882ba)
  **lib/log:** Improved folding block presentation

- `09/04` [`fix`](https://github.com/pchiorean/Indentz/commit/ff5328e8772aec7258219ffd23c5235d7058cc51)
  **export/QuickExport:** When 'Escape' was detected, we performed the cleanup but not the exit; fixed
- `09/04` [`new`](https://github.com/pchiorean/Indentz/commit/06b495d58ee34da17157e631311becd45f54e9b0)
          [`fix`](https://github.com/pchiorean/Indentz/commit/ddd2dedf4c73c89145692dddec285fed60dbb24e)
  **export/QuickExport:** Added an elapsed time alert at the end (for durations longer than 9 seconds)
- `09/04` [`ref`](https://github.com/pchiorean/Indentz/commit/ddd2dedf4c73c89145692dddec285fed60dbb24e)
  **export/QuickExport:** Added `beautifyPath()` to simplify platform-dependent path display
- `09/06` [`fix`](https://github.com/pchiorean/Indentz/commit/fe6dc8d64277a367c86f9d63feca006531eebf10)
  **export/QuickExport:** Do cleanup before displaying the report
- `09/11` [`new`](https://github.com/pchiorean/Indentz/commit/a1500c1b6ee88e04ea79e57fa6420e966da0108c)
  **misc/EAN:** Sequentially insert a list of barcodes into all selected objects;
  embedding is done by `contentPlace()` method, so the clipboard is no longer modified
- `09/11` [`fix`](https://github.com/pchiorean/Indentz/commit/473ef02662d0f51dcd8f9c30d736c70719d23781)
  **view/ZoomToSelection, ZoomToSpreads:** Fixed the acceptable zoom range
- `09/12` [`upd`](https://github.com/pchiorean/Indentz/commit/d58f5c3bf2a3dedef7e136fc800bedc85bfb0dd1)
  **export/QuickExport:** Improved timer display: 'Xh Xm Xs'
- `09/23` [`upd`](https://github.com/pchiorean/Indentz/commit/992ab910c86dae5a10895e187950d793e7a91c29)
  **cleanup/DefaultSwatches:** Added 'cXXmXXyXXkXX' as a default variant
- `09/23` [`upd`](https://github.com/pchiorean/Indentz/commit/1cad44d2b866aa7f81a4e0646a9f3016914fa4fc)
          [`ref`](https://github.com/pchiorean/Indentz/commit/1f9cbe80447a5187c8c1425a223aef82bc6a5f3b)
  **lib/isInArray:** Skip regex matching when no wildcards
- `09/23` [`new`](https://github.com/pchiorean/Indentz/commit/5a41bd99dea26be6bd649511fc42a65c358b801b)
  **lib/log:** Added a stopwatch (`!`/`?`); changed directives for blocks to `[`/`]`
- `09/23` [`upd`](https://github.com/pchiorean/Indentz/commit/772c7aaeda9d637ee31039de5d28c353d02eee1e)
  **file/FilesToSpreads:** Used natural sorting for files
- `09/23` [`fix`](https://github.com/pchiorean/Indentz/commit/c27c6887e2ea1d295e10193bfdae4122208eaab8)
  **layout/PageMarginsFromScriptName:** Included missing `getBounds()` (d'oh!)
- `09/25` [`upd`](https://github.com/pchiorean/Indentz/commit/f988b4860386a48702971d4587fcd78203d32048)
  **cleanup/DefaultSwatches:** Added lowercase self as a default variant; this fixes case variations
- `09/26` [`fix`](https://github.com/pchiorean/Indentz/commit/5e64db84026be92536d5e1c5363380641aa69ff3)
  **cleanup/ReplaceLinks:** Included missing `stat()` (d'oh!)
- `09/29` [`fix`](https://github.com/pchiorean/Indentz/commit/0bc45eac1631ef28c131215d5422f275b9b6b3ff)
  **export/QuickExport:** When checking for the last exported file index limit search to the base folder + destination subfolders
- `09/29` [`ref`](https://github.com/pchiorean/Indentz/commit/ba1f2d72ef172c67632b8e117a003dd8cbb6a21c)
  **cleanup/DocCleanup, ReplaceLinks; misc/EAN, QR, QRBatch:** Tweaked progress bar titles
- `09/29` [`fix`](https://github.com/pchiorean/Indentz/commit/fbde0d900d87d2cfcbacb3b8ebd367cfa245ac07)
  **misc/EAN.jsx:** List height was supposed to grow depending on selection; fixed
- `09/29` [`fix`](https://github.com/pchiorean/Indentz/commit/d54a2281a9b13128d765038a52c09dddca0ec9aa)
  **export/QuickExport:** Skip export when fonts are missing; skip when links are to be updated but are missing
- `09/30` [`upd`](https://github.com/pchiorean/Indentz/commit/a0741e03051dd7bdd1e3a346e2f52117b4f94077)
  **export/QuickExport:** Simplifies source updating to just 'Save' and 'Save as...' options; also fit spread in view

- `10/05` [`fix`](https://github.com/pchiorean/Indentz/commit/9a329ffaf729895085ded630de446224028b1ff3)
  **misc/EAN:** Placing code fails when target frames are already populated; fixed
- `10/06` [`fix`](https://github.com/pchiorean/Indentz/commit/d11e48a234812aa479c80d81b3c104231e08cf24)
  **cleanup/DefaultLayers/Swatches/ReplaceFonts/Links/Snippets:**
  Fixed a reporting bug caused by a previous change in `stat()` ('fail' ‣ 'error') which was not mirrored in `data.status` (`9dfb241`)
- `10/08` [`fix`](https://github.com/pchiorean/Indentz/commit/7cfb2abc8d277da5fc9388aeae065a60586fbf04)
  **misc/QR, QRBatch:** Set fill/stroke explicitly, don't use defaults
- `10/13` [`fix`](https://github.com/pchiorean/Indentz/commit/d19a9e1a2cb3c0888b3ac66dd50b6f77a8f2487a)
  **fit/TextAutosize:** Removed exception for auto-resizing 'hw' text frames
- `10/13` [`fix`](https://github.com/pchiorean/Indentz/commit/dca267531e311ff3a891e8d677a3831f52deb168)
  **misc/Clip.jsx:** Fixed a typo from commit `bbc9444` that affected text frames clipping
- `10/25` [`fix`](https://github.com/pchiorean/Indentz/commit/0609efb24379ac9d772aa37438039162088aeb41)
  **layout/Grid\*:** 'HW' layer and guide were created even when HW=0; fixed
- `10/26` [`fix`](https://github.com/pchiorean/Indentz/commit/893672b79fd99ea654e49f0297e1f840b6bc0675)
  **cleanup/DocCleanup:** Don't delete text paths on empty frames
- `10/27` [`ref`](https://github.com/pchiorean/Indentz/commit/0cd95a9e13072b7c9046ea46e3680960a6f2c5d2)
  UI: Changed button labels from 'Ok' to 'OK'
- `10/31` [`new`](https://github.com/pchiorean/Indentz/commit/1574bc6fbd3dfba3af8b098f6d3f22c0f613b71c)
  **misc/OffsetPaths:** Added support for groups; in fact we also process each member of 1st level groups so we don't get a boring rectangle

- `11/04` [`fix`](https://github.com/pchiorean/Indentz/commit/1c519c6d425ebc25bd4fbb3568e22508602c8454)
  **fit/TextAutoSize:** Trimming ending whitespace also affected styling; fixed
- `11/05` [`upd`](https://github.com/pchiorean/Indentz/commit/096a21a78db9d3376d129dc3a0507286750e2068)
  **cleanup/DocCleanup:** Added some layers to 'Show/hide layers'
- `11/05` [`fix`](https://github.com/pchiorean/Indentz/commit/23066775d5e5f7077d5c5ee742e826fe1df46b61)
  **cleanup/ReplaceLinks:** Filenames with commas are now actually recognized, but must be properly quoted
- `11/05` [`new`](https://github.com/pchiorean/Indentz/commit/24bdbc580b13a4133a9f7bb2d3704eec53d7407f)
  **lib/trim:** Added a helper function for trimming whitespace in strings (borrowed from [IdExtenso](https://github.com/indiscripts/IdExtenso/blob/master/core/Ext/%24%24.string.jsxinc) by [Marc Autret](https://indiscripts.com))
- `11/06` [`fix`](https://github.com/pchiorean/Indentz/commit/49111cc6e23519acb4fcca86c33629e086e3f6a0)
  **misc/QR, QRBatch:** Fixed document path detection for '[Converted]' docs
- `11/14` [`upd`](https://github.com/pchiorean/Indentz/commit/0e04f2861b51407d62758f68bd92c3d160862a10)
  **export/QuickExport:** Automatically add to the suffix all visible & printable layers named '+xxxxxxx' if exporting with a 'print' preset
- `11/25` [`upd`](https://github.com/pchiorean/Indentz/commit/b32fe3689e7f0e117bb32a8c4843406ddb95a057)
  **file/FilesToSpreads:** Resets page numbering after merging files
- `11/25` [`upd`](https://github.com/pchiorean/Indentz/commit/f6b1b3c47f6900088a0bc8a6b690ef3efae21014)
  **misc/Clip, ClipUndo:** Selects all released objects
- `11/25` [`upd`](https://github.com/pchiorean/Indentz/commit/d8831ee76da1a74236639a3a74441bc8c350c7e3)
  **cleanup/DocCleanup; export/MarkVisibleArea, PrepareForExport; layout/PageSizeFromFilename:** Updated internal layers list (added the prefix '+' to some technical layers)
- `11/25` [`ref`](https://github.com/pchiorean/Indentz/commit/ff3a50a5f395e77c28ffb1a55a9724bf6eaeb28b)
  **export/QuickExport; file/SpreadsToFiles; lib/fitTo; misc/QRBatch:** Renamed several variables
- `11/25` [`fix`](https://github.com/pchiorean/Indentz/commit/971dc3bc2eed9b7b3bb9e3d2d4f78f30eff484db)
  **lib/getPageItem:** Fixed a typo in a variable name
- `11/25` [`upd`](https://github.com/pchiorean/Indentz/commit/49fafb20f8cb3fa6ab14b7cb610d8197ac9e50d7)
  **lib/replaceText:** Added a target for `changeText()`
- `11/25` [`upd`](https://github.com/pchiorean/Indentz/commit/960714cabf14ac2b2297d26b4902c0c11a6c5ec9)
  **lib/log:** Simplified block markers
- `12/01` [`brk`](https://github.com/pchiorean/Indentz/commit/d9bb8c1ac09820b0488cbbefc03bf2cea3bcf680)
  **lib/getPageItems:** Now it returns an array of found items, or `false` if nothing was found
- `12/01` [`brk`](https://github.com/pchiorean/Indentz/commit/69ba851c3fe4972951ad3b92b2cd19f5670dd3b5)
  **lib/replaceText:** Added an argument for case sensitivity; extended `target` to page/spread/layer; returns the number of replacements

##### Queued

- `fix` **file/SpreadsToFiles:** Don't append separators if already exist
- `fix` **fit/TextAutoSize:** Check `baselineShift`
- `upd` **cleanup/ReplaceLinks, export/QuickExport:** Restore cropping mode when relinking files
- `upd` **cleanup/ReplaceLinks, export/QuickExport:** When relinking layered files, try to restore layers' visibility (respect **Preferences ‣ File Handling ‣ Links ‣ Hide New layers When Updating or Relinking**); inhibit alert and report culprits at finish
- `upd` **export/QuickExport:** Add a checkbox for `0e04f28`
- `new` **export/QuickExport:** Add JPG, PNG & INDD export profiles
- `new` **export/QuickExport:** Add package option

## [Releases](https://github.com/pchiorean/Indentz/releases)

#### [23.7.18](https://github.com/pchiorean/Indentz/releases/tag/23.7.18)

##### New features

- `02/22` [`upd`](https://github.com/pchiorean/Indentz/commit/ce11e9620ea2ca1ed62b9fa4c9ce73a4430e9801)
  **view/TileAll:** Added generic tiling for square formats
- `03/23` [`upd`](https://github.com/pchiorean/Indentz/commit/26d261d09d2a2c3a65bcff7a24a65a3a047c31b3)
  **misc/EAN:** If multiple objects are selected, the code will be inserted into all of them
- `05/03` [`upd`](https://github.com/pchiorean/Indentz/commit/66e77c839e9de0fc06a6f67988fbf02041f7acaf)
  **export/QuickExport:** Added an option to exclude do-not-print layers (any layer beginning with '.' or '-')
- `05/03` [`upd`](https://github.com/pchiorean/Indentz/commit/7210d51f060231925cecf794ee8d2ebd685e1fc2)
  **misc/LabelPageRatios:** Now marks outer (visible area, or page size if undefined) and inner (margins) ratios
- `05/27` [`new`](https://github.com/pchiorean/Indentz/commit/9dc9097d630145156f6595e8a3048a368cf28a74)
  **lib/alignTextToBottom:** Added a helper function to align text to bottom of frame
- `05/27` [`new`](https://github.com/pchiorean/Indentz/commit/2c1828316dbeabf66558a0104a5e2fa9e5766666)
  **lib/getPageItem:** Added a helper function to get a text frame with a specified name
- `05/27` [`new`](https://github.com/pchiorean/Indentz/commit/5bc6aa2d7b653a485eba194eb2e1dd303f01f035)
  **lib/saveLayersState:** Added a helper function to save/restore layers state (TO DO: refactor to a proper function expression)
- `07/12` [`new`](https://github.com/pchiorean/Indentz/commit/bb1a25a3dda439b572537e54a8d0dbf3b3ee8dbb)
  **cleanup/DumpLinks:** Added a script to dump document links to a TSV file

##### Updates

- `02/03` [`upd`](https://github.com/pchiorean/Indentz/commit/bdd9d16c1a28598a7461c4f429d1c591728caff9)
  **cleanup/DumpLayers, DumpSwatches, export/QuickExport, lib/log, report:** Set linefeed to Unix
- `02/03` [`upd`](https://github.com/pchiorean/Indentz/commit/6d294984e6df49ca1d80c363e249d65304acdb9f)
  **export/Hide/ShowDNPLayers, PrepareForExport:** Renamed 'Safety margins' to 'Safety area'
- `02/07` [`upd`](https://github.com/pchiorean/Indentz/commit/73ca242a907c01f14b2f61dc1ea6953a8f6cfab5)
  **lib/fitTo:** Bump priority of enforced fitting
- `02/22` [`upd`](https://github.com/pchiorean/Indentz/commit/eb0a3cdb3a61480d2aa8381b7141dac49840aae3)
  **cleanup/ReplaceLinks:** Skipped reporting status for unused links
- `02/23` [`upd`](https://github.com/pchiorean/Indentz/commit/def4661ad77f65261b2c0e4ac40cbb21b1d5bf5f)
  **export/MarkVisibleArea, layout/PageSizeFromFilename:** Increased stroke width for large visuals
- `03/07` [`upd`](https://github.com/pchiorean/Indentz/commit/981fede9a4cb658051a5e2e1fb8eb496288ca77d)
  **export/QuickExport:** Improved speed when checking for text overflow (changed the loop from `for` to `while`)
- `03/10` [`upd`](https://github.com/pchiorean/Indentz/commit/4d519e29485e8a2f0376dbfe4e6a0153949209d8)
  **lib/fitTo:** Tweaked debug section; renamed some variables for clarity
- `04/02` [`upd`](https://github.com/pchiorean/Indentz/commit/c68da2a712c6a67686329f28b80bea9fdff1b985)
  **export/QuickExport:** Don't display preferences reset warning on first run (revisited)
- `05/03` [`upd`](https://github.com/pchiorean/Indentz/commit/7e2f37b856cf4879d89f43934fbc33702559e4ba)
  **cleanup/SwatchesCleanup:** Delete unused swatches was moved as the last step
- `05/10` [`brk`](https://github.com/pchiorean/Indentz/commit/10a48905bb36fe79677fc186bf06bebe3635719b)
  **cleanup/DocCleanup; export/MarkVisibleArea; layout/GuidesAdd, PageMarginsFromScriptName, PageSizeFromFilename:**
  Renamed do-not-print layers to '.layername' (e.g., `.visible area`)
- `05/10` [`upd`](https://github.com/pchiorean/Indentz/commit/cc9732494dc69e9f4accc66b44dcf0c151a14362)
  **export/Hide/ShowDNPLayers, PrepareForExport:** Tweaked the layers names wildcards
- `05/23` [`upd`](https://github.com/pchiorean/Indentz/commit/b32837ef7bff11de28a49c20d69cf330ed321630)
  **export/Hide/ShowDNPLayers, PrepareForExport:** Added 'fold' to do-not-print layers
- `05/28` [`upd`](https://github.com/pchiorean/Indentz/commit/dd89d4e85fe7be5ace18cede1b41cc1b5e8dffaf)
  **misc/LabelPage\*, QR\*:** Replaced 'ID' with 'info' to simplify layer management
- `05/29` [`upd`](https://github.com/pchiorean/Indentz/commit/73acffe8774ab3d1fd523ec4249798f2c9ec1ced)
  **cleanup/DocCleanup:** Empty frames from '.guides' layer are protected from deletion
- `06/20` [`upd`](https://github.com/pchiorean/Indentz/commit/5d553fa94bdf1049a91fc14109fc8dc9151e2de1)
  **cleanup/DefaultLayers, DefaultSwatches, ReplaceFonts, ReplaceLinks, ReplaceSnippets:**
  Increased verbosity level for 'document has no path' alert, so it's now muted by default
- `07/12` [`upd`](https://github.com/pchiorean/Indentz/commit/9bc31b1b6596278e2e52ecfe69deb8f5ae039aa5)
  **cleanup/DefaultPrefs:** Reset default text wrap mode
- `07/12` [`upd`](https://github.com/pchiorean/Indentz/commit/486f5642680bb06f4480d8f761164d0b42846713)
  **cleanup/DocCleanup:** Added '.segmentation' to 'Show/hide layers'
- `07/12` [`upd`](https://github.com/pchiorean/Indentz/commit/00293f306215e4fc31e6d1667c7ce07428612b11)
  **cleanup/DumpLayers, DumpSwatches:** Display an alert if document has no valid path; update header
- `07/18` [`upd`](https://github.com/pchiorean/Indentz/commit/831c9ad4cd64e27ec607f0c7dd4a5ecbf31fd409)
  **lib/fitTo, moveToLayer, misc/Clip, ClipUndo:** Added `MasterSpread` as a valid parent, thus scripts also work on the parent/master pages

##### Removed features

- `05/03` [`upd`](https://github.com/pchiorean/Indentz/commit/29e40eae2bc22bc6dc6ceca9ceba9733eb9f00a7)
  **cleanup/DefaultPrefs:** Removed color profile settings

##### Bug fixes

- `02/24` [`fix`](https://github.com/pchiorean/Indentz/commit/fd5a40a300cb56bcc4df54a19a1d780c550cecce)
  **export/PrepareForExport:** Don't add 'info' layer if not actually needed
- `03/11` [`fix`](https://github.com/pchiorean/Indentz/commit/84214f8a1cdc09d3f493188bdc1f8773404a2e3b)
  **fit/TextAutosize:** Fixed a bug that in certain circumstances reverted a frame's auto-sizing to height-only
- `04/02` [`fix`](https://github.com/pchiorean/Indentz/commit/04edf0d97127b5472c4217d52354ff8cb16fd236)
  **lib/ParseDataFile and related:** '[Converted]' documents actually have a path (d'oh!), so don't skip looking for the local data file
- `04/03` [`fix`](https://github.com/pchiorean/Indentz/commit/2e8d29bdc4fecffdfd75a530a3666169be7b236c)
  **cleanup/ReplaceLinks:** Forgot to update `getDataFile()` (this script has the libs included)
- `04/03` [`fix`](https://github.com/pchiorean/Indentz/commit/55383fbc2c2805849c41355e2a27276b1bcdeb00)
  **cleanup/ReplaceLinks:** Properly URI-decode the file names when reporting replaced links
- `04/06` [`fix`](https://github.com/pchiorean/Indentz/commit/7598eca8e4e99ca41dcf268439d79252a363e667)
  **misc/EAN:** Fixed a regression from commit `26d261d` (03/23) that made some naive assumptions about the active document and/or selection
- `05/04` [`fix`](https://github.com/pchiorean/Indentz/commit/3b27e37768aaf98c6d31adb6c8b27a953b9f531c)
  **export/QuickExport:** Fixed a regression from commit `66e77c8` (05/03): it was not actually checking 'Exclude do-not-print layers' value
- `05/27` [`fix`](https://github.com/pchiorean/Indentz/commit/fd588e8f4a05526caa2412e18c6021daa3ecb5fd)
  **cleanup/ReplaceSnippets:** F/R settings were not cleared when script finished; fixed
- `05/29` [`fix`](https://github.com/pchiorean/Indentz/commit/cb97111206e3af1d138f9383dc0d09d5dfd2c743)
          [`fix`](https://github.com/pchiorean/Indentz/commit/4a10ac84f46f1c5cb71ecb5c21bb5d4e49c9b7b7)
  **lib/report:** Saving the report was not possible when there are no open documents; fixed
- `06/30` [`fix`](https://github.com/pchiorean/Indentz/commit/4fc58cd0a599202f1d322ffc8cd45434e7b836e9)
  **lib/isInArray:** Ensure that arguments are always treated as strings
- `07/17` [`fix`](https://github.com/pchiorean/Indentz/commit/b68d06f7a3b083ebaeabffa8726ba4c688112f15)
  **export/QuickExport:** Fixed a typo in the preset help tip
- `07/17` [`fix`](https://github.com/pchiorean/Indentz/commit/1f15b2fd4a59251057ce847b53b6756f73c98f06)
  **export/QuickExport:** 'Create Acrobat layers' checkbox was ignored on export; fixed

##### Miscellaneous

- `02/03` [`ref`](https://github.com/pchiorean/Indentz/commit/43a0c4fc7329de94f8b13a07bcec21b8c377e16a)
  **export/MarkVisibleArea, layout/PageSizeFromFilename:** Renamed 'findLayer' to 'getLayer'
- `05/11` [`doc`](https://github.com/pchiorean/Indentz/commit/56219100cbc7318f41153419930abc422f384548)
  Updated TSV samples
- `05/27` [`doc`](https://github.com/pchiorean/Indentz/commit/2202825cd4265fcfa6d251a04c730991d51e3054)
  Updated TSV samples
- `05/29` [`ref`](https://github.com/pchiorean/Indentz/commit/52b7ffb2057fa3033801d851cfe8cb104dba3afa)
  **align/AlignToC:** Renamed the HW vertical alignment label to something more generic
- `06/30` [`ref`](https://github.com/pchiorean/Indentz/commit/70a977ea8c011194c9078231965eba09889be620)
  **export/QuickExport:** Removed main panel label

#### [23.2.1](https://github.com/pchiorean/Indentz/releases/tag/23.2.1)

##### New features

- `11/12` [`new`](https://github.com/pchiorean/Indentz/commit/bd152afa2fa862875036a6e02eb8717a16586428)
  **view/ZoomTo300Percent:** Zooms current layout window to 300%
- `11/14` [`upd`](https://github.com/pchiorean/Indentz/commit/3fe118dc578d8559feb46282d9efb9ac39f9ebef)
  **clean/DefaultPrefs:** Added scaling options
- `11/14` [`new`](https://github.com/pchiorean/Indentz/commit/04d7b2c3442753a6f87f8ab9b28943f7012e0777)
  **layout/PageMarginsTo5Percent:** Sets margins to 5% of the visible area for all document pages
- `11/17` [`new`](https://github.com/pchiorean/Indentz/commit/0322f41787496ad351226c2c066b9cb13478d7e9)
  **layout/PageMarginsTo5Percent:** Now it also detects the HW value; renamed to **PageMarginsFromScriptName**
- `11/21` [`new`](https://github.com/pchiorean/Indentz/commit/5a3c6fb308e12a114910b70df79ed220d7491981)
  **cleanup/DefaultLayers:** Added `top`/`bottom` keywords for layers order
- `12/04` [`new`](https://github.com/pchiorean/Indentz/commit/0199b29a56e98d68b3b876f44f826f8076e68937)
  **lib/unique:** Added a helper function to get unique array elements
- `12/17` [`upd`](https://github.com/pchiorean/Indentz/commit/a78169b6f0f8b0789e6b956560078b75198d071b)
  **lib/getBounds:** Added safety area
- `12/17` [`new`](https://github.com/pchiorean/Indentz/commit/421c8ca6e46f9efdbe3a3cd52aefc67ab29ea250)
  **lib/naturalSorter:** Natural sorting of string arrays

##### Updates

- `11/15` [`upd`](https://github.com/pchiorean/Indentz/commit/401233e7256283a1c3ed1df67ec4bcd9a6af9599)
  **misc/QRBatch:** Filterd list to display only queueable lines
- `11/19` [`upd`](https://github.com/pchiorean/Indentz/commit/2961ecb72ab657443d8813d13e0edd7d7217b764)
  **cleanup/DocCleanup:** Convert empty frames to generic frames only when they have no fill/stroke
- `11/24` [`ref`](https://github.com/pchiorean/Indentz/commit/39e2f11a3497ec752640a6cbb541473c60581675)
  **misc/QRBatch:** Moved 'Refresh' before 'Browse'
- `11/24` [`upd`](https://github.com/pchiorean/Indentz/commit/87905c2091bb62b6b103c5607fd063d20af498ea)
  **misc/QR, QRBatch:** Slightly increased the distance between the code and the edge of the page (4 mm left, 3 mm below)
- `11/25` [`upd`](https://github.com/pchiorean/Indentz/commit/184055a8b55309406a2de7793b6f2f5fdc82d9ae)
  **lib/debug:** Replaced the context argument with an auto call stack; renamed to **dbg**
- `12/04` [`brk`](https://github.com/pchiorean/Indentz/commit/53e753a54223d6e78d7854a47dabd7a98bbf0704)
  **lib/ParseDataFile and related:** Refactored to return parsed records as raw strings; moved data validation/converting to native objects to a separate step; see `lib/README.md` for details
- `12/09` [`upd`](https://github.com/pchiorean/Indentz/commit/253b6b0b4e7d94485ed40aecd4219db8ce7dfa0a)
  **layout/PageSizeFromFilename, export/MarkVisibleArea:** Added support for wildcards in layer names
- `12/09` [`upd`](https://github.com/pchiorean/Indentz/commit/23f5801e89f727d89af87f009abab8791ab3e6fc)
  **lib/dbg:** Reduced types to just one: appending the message; also, renamed to **log**
- `12/23` [`upd`](https://github.com/pchiorean/Indentz/commit/11abfc2b81ba995123cd6d010b9889ae305c6f16)
  **view/ZoomTo...:** Include slug when preview mode is off
- `12/23` [`upd`](https://github.com/pchiorean/Indentz/commit/d6c2fd31ed140d8fecd2e80d88f1a81b92402585)
  **lib/getPageItem:** Include all page items
- `12/23` [`upd`](https://github.com/pchiorean/Indentz/commit/f1648666a4547d82b25f50f973e8c86fcf7c037d)
  **lib/log:** Shorten display of anonymous functions to 'anon'
- `12/23` [`upd`](https://github.com/pchiorean/Indentz/commit/9bbfa9e9fd5aec3278933369b13467e147f2adcd)
   **export/QuickExport:** Don't display preferences reset warning on first run
- `01/31` [`upd`](https://github.com/pchiorean/Indentz/commit/258f503abef1d504a27219ca7519c2a3abb9b8df)
  **lib/fitTo:** Swapped checks with exceptions; other minor fixes

##### Bug fixes
- `11/17` [`fix`](https://github.com/pchiorean/Indentz/commit/6b70b11e3638bdac0e8b1d849a68c7475e9edc0a)
  **export/QuickExport:** Fixed auto-suffix hack to chain layer names (d'oh!)
- `11/19` [`fix`](https://github.com/pchiorean/Indentz/commit/f0e94cd7a5d557630ab103302511fba655c7f3ff)
  **cleanup/DocCleanup:** Trimming ending spaces for center- or bottom-aligned text frames inadvertently moved the text; fixed
- `12/09` [`fix`](https://github.com/pchiorean/Indentz/commit/beed82b8579730cad9145ea671d992bce471ed0d)
  **cleanup/DefaultLayers:** Don't move a layer to top/bottom if it's already there
- `12/13` [`fix`](https://github.com/pchiorean/Indentz/commit/0c007500882fb4709bcc173590bfabb3983a5a35)
  **export/QuickExport:** Added a check for missing queued documents
- `12/13` [`fix`](https://github.com/pchiorean/Indentz/commit/4d40417e6452ede53010140b3d314a704137369f)
  **lib/moveToLayer:** Fixed an infinite loop when resolving item's parent spread
- `12/17` [`fix`](https://github.com/pchiorean/Indentz/commit/4291b7f49739ede895d9145ad0c0f1a7a2409d8d)
  **misc/QR, QRBatch:** Also set left justification on label
- `01/05` [`fix`](https://github.com/pchiorean/Indentz/commit/ce88cb02b9b680a6ae4b4c7b2b32fb2403de0be1)
          [`fix`](https://github.com/pchiorean/Indentz/commit/78a9adfcacdbaf7ca5a826f704479222f20320de)
  **lib/parseDataFile:compactRelPath:** Resolve multiple `/../` segments by recursion
- `01/29` [`fix`](https://github.com/pchiorean/Indentz/commit/11ec889ffe04714404d425947c1bd739e753c5ca)
  **cleanup/DocCleanup:** Show/hide layers: updated `safety area` name

##### Miscellaneous

- `11/11` [`ref`](https://github.com/pchiorean/Indentz/commit/aeede5af80fb77de0193a45b9d2d277e717503ab)
  **misc/LabelsCleanup:** Renamed and moved to **cleanup/RemoveScriptLabels**
- `11/12` [`ref`](https://github.com/pchiorean/Indentz/commit/416073f9e74ef2d3e7a0718a37044e07cb0a366a)
  **export/QuickExport:** Updated help tip for 'Sort files by suffix into subfolders'
- `11/19` [`doc`](https://github.com/pchiorean/Indentz/commit/c3c8e2313aba93b3eee35a71b9b47c31945b1fa9)
  **lib/moveToLayer:** Updated description
- `12/17` [`org`](https://github.com/pchiorean/Indentz/commit/695621afbccffbd37293e6186501d6f4b459d31d)
  **layout/AdjustLayout:** Moved from **misc**
- `01/25` [`ref`](https://github.com/pchiorean/Indentz/commit/13d8487dff6a20cce54aad233d967ccd30c2f16b)
  **export/QuickExport:** Removed redundant brackets
- `01/29` [`doc`](https://github.com/pchiorean/Indentz/commit/4f09cbba4913f036f2d56a093b6a6fbf6a8feb84)
  **lib/getBounds:** Fixed a whitespace typo
- `01/29` [`ref`](https://github.com/pchiorean/Indentz/commit/a6049074c5ece2b8115eeaaae9a0a734b456b4cf)
  **lib/fitTo:** Small improvements to the code legibility

#### [22.11.10](https://github.com/pchiorean/Indentz/releases/tag/22.11.10)

##### New features

- `10/15` [`new`](https://github.com/pchiorean/Indentz/commit/5cc09303da1e0a72e4f4ba673319e17e449e9c12)
  Added **lib/getPageItem:** Helper function to get a page item with a specified name, optionally from a specified layer
- `10/15` [`new`](https://github.com/pchiorean/Indentz/commit/d481571827839793fb208b8ac93a6cdfb3f0d8a2)
  Added **lib/setDropShadow:** Set of helper functions to get/set a page item's drop shadow properties
- `10/24` [`new`](https://github.com/pchiorean/Indentz/commit/8c5af98faefbd3f1e10c6849a7332904923b8d5c)
  Added **cleanup/DumpLayers:** Dump layer properties to TSV
- `11/06` [`new`](https://github.com/pchiorean/Indentz/commit/0f956b6c3fb7f6e9488c374c0deaa46dc8086380)
  Added **misc/EAN:** Embeds an EAN code in the selected frame or adds it to a new page
- `11/09` [`upd`](https://github.com/pchiorean/Indentz/commit/1b9a61edfed56f9dcb4bc413c9e008d70eb3ceaf)
  **export/QuickExport:** Restore document layer status after export; report script errors

##### Updates

- `10/06` [`upd`](https://github.com/pchiorean/Indentz/commit/852844f62ea6ae58d8e83b7d78e6ef9c654b454c)
  **misc/QR:** Changed default code placement to separate files & streamlined actions
- `10/06` [`upd`](https://github.com/pchiorean/Indentz/commit/0b51957f90170f291519d90eb7e8e575f475a620)
  **misc/QR, QRBatch:** Switched white and uppercase options
- `10/15` [`upd`](https://github.com/pchiorean/Indentz/commit/2ff55013a414b28198796867cd01a4bfb0ec0838)
  **lib/progressBar:** Improved centering in current window
- `10/15` [`upd`](https://github.com/pchiorean/Indentz/commit/d32729cb1f119c5c37ee42461b195baff5446a1c)
  **cleanup/DocCleanup:** Reinstated the conversion of empty text frames to generic frames, but only when not auto-sized
- `10/24` [`upd`](https://github.com/pchiorean/Indentz/commit/ef626a01f068a09a2520f082b6ef22c8f32b3803)
  `hack` **export/QuickExport:** Updated auto suffix hack for two additional layers: `varnish` and `white`
- `10/24` [`upd`](https://github.com/pchiorean/Indentz/commit/97f141fc24410515a394786f59977471974abd0b)
  `hack` **export/QuickExport:** Updated dot-layers hack to only hide them when exporting with a 'print' suffix
- `10/24` [`upd`](https://github.com/pchiorean/Indentz/commit/78ee6a53fe7ceb8deeaf48f4a3742dcf6ede4788)
  **misc/QR:** Reverted to on-document placement by default
- `10/24` [`upd`](https://github.com/pchiorean/Indentz/commit/9a3703e92e372c00e904a97195627400f64520a6)
  **cleanup/DefaultPrefs:** Apply preferences in two steps: application/document
- `10/28` [`upd`](https://github.com/pchiorean/Indentz/commit/759925ace01b33a5d314c2ed6576a853e76c9354)
  **align/AlignToC, export/QuickExport, lib/report, misc/LabelPage, misc/QR:** Centered UI in app window
- `10/28` [`upd`](https://github.com/pchiorean/Indentz/commit/0f237cd67fb0582f22e2ce45c147b14e0bc747e8)
  **cleanup/ReplaceSnippets:** Improved error messages
- `10/30` [`upd`](https://github.com/pchiorean/Indentz/commit/5ab283e31220561083c19954ece6f15dc1f34ddc)
  **export/QuickExport:** Increased max bleed value to 152.4 mm
- `11/06` [`upd`](https://github.com/pchiorean/Indentz/commit/28b673210950d68ce3af764621ea79578b8749b9)
  **misc/QR:** Centered UI in app window

##### Bug fixes

- `09/28` [`fix`](https://github.com/pchiorean/Indentz/commit/58c79e5872b1d575dc2fa235ff8c8721d682a07c)
  **lib/getDataFile:** Fix regression from commit [d0ff5ea](https://github.com/pchiorean/Indentz/commit/d0ff5ea8c67ab914fcc116f5e4a3a26660026c96#diff-eee3f6feb9e5285db1b70d8d6f1786d3b6a87a4f89b81aa054a5f5cd341dedb5R16-R20)
- `10/04` [`fix`](https://github.com/pchiorean/Indentz/commit/f333157f099182fe1c4e767128be7fc24e61e5bf)
  **export/QuickExport:** Improved titlebar message logic and fixed a quirk
- `10/24` [`fix`](https://github.com/pchiorean/Indentz/commit/8b7e6fb78ab1e3de2a5acfb864d6437a5b3bd354)
  **cleanup/DefaultLayers:** Matching layer colors to `UIColors` is now case insensitive
- `10/28` [`fix`](https://github.com/pchiorean/Indentz/commit/1d46af91cde7a0d5b80148e0729a2adb0a2b4b66)
  **cleanup/DefaultSwatches:** Removed some debugging leftovers
- `11/06` [`fix`](https://github.com/pchiorean/Indentz/commit/0710d21d149e102191e29177ec78acfb89ba8903)
  **misc/QR, QRBatch:** Enforced label's leading to auto, 100%
- `11/07` [`fix`](https://github.com/pchiorean/Indentz/commit/87870d075dd1c58644cbcb25828a20d08b49ca5b)
  **export/QuickExport:** Fixed and improved the preset helptip info; linked DPI availability to the profile sampling setting (on loading profile)
- `11/07` [`fix`](https://github.com/pchiorean/Indentz/commit/8dcdbb5b5f8451765800ea0c5c69568fcd367183)
  **export/QuickExport:** Preserved custom bleed from the PDF preset
- `11/08` [`fix`](https://github.com/pchiorean/Indentz/commit/972742b3976d0261e59b6a94a440632444e1dd9e)
  **export/QuickExport:** Linked DPI availability to the profile sampling setting (on export)

##### Miscellaneous

- `10/24` [`ref`](https://github.com/pchiorean/Indentz/commit/6ecde9e6a0bd2394dd20b442cf1943c561607246)
  **cleanup/SwatchesSave:** Renamed to **DumpSwatches**
- `10/27` [`ref`](https://github.com/pchiorean/Indentz/commit/f0c224716706dd4809204484bb001cfb090a6bdc)
  [`ref`](https://github.com/pchiorean/Indentz/commit/c83eb0de0362924eb77196df62fb04e31bdd7b89)
  **lib/parseDataFile and related:** Tweaked whitespace trimming
- `11/09` [`ref`](https://github.com/pchiorean/Indentz/commit/2e2d69a432ab215f0a840f8ccd56ac17a3abb0e9)
  **lib/fitTo:** Simplified `isStraight` flag
- `11/09` [`ref`](https://github.com/pchiorean/Indentz/commit/f1940a37cdf5cf5588e53fa57afe70f3bf52f2fc)
  **scale/ScaleTo...:** Minor changes to scaling function

#### [22.9.25](https://github.com/pchiorean/Indentz/releases/tag/22.9.25)

##### New features

- [`brk`](https://github.com/pchiorean/Indentz/commit/ea713c47c39dea36f7460d26b50541e700df9646)
  **lib/parseDataFile and related:** Added `@includepath` directive and support for relative paths
- [`upd`](https://github.com/pchiorean/Indentz/commit/79c49c60f63de6797ee2935cf9a9251d926085e8)
  **lib/parseDataFile and related:** Added support for comments at the end of lines
- [`upd`](https://github.com/pchiorean/Indentz/commit/b9f79dedb8cc7d298a4941bb4c5eff3312c33c51)
  **cleanup/DefaultSwatches, ReplaceLinks:** Cancel if 'Esc' is pressed
- [`upd`](https://github.com/pchiorean/Indentz/commit/c24e8506b98019d47314fe6d6f968e7c91303ce3)
  **lib/report:** Added `auto` to filtering mode – automatically shows filtering if there are more than 20 lines

##### Updates

- [`brk`](https://github.com/pchiorean/Indentz/commit/30fb0d34a8e929cf432a7dc0583ad9f263bb5ef2)
  **lib/parseDataFile and related:** Changed data files extension to `tsv`
- [`upd`](https://github.com/pchiorean/Indentz/commit/646e7acad396b5013e03a0e5ca3963076989eb54)
  Activated auto filtering to the status report for scripts that need it
- [`brk`](https://github.com/pchiorean/Indentz/commit/d0ff5ea8c67ab914fcc116f5e4a3a26660026c96)
  **lib/getDataFile:** Updated to take as argument a list of files; returns the first one found
- [`upd`](https://github.com/pchiorean/Indentz/commit/3b4cd59358981aa6643d2161880a567c9591b1a8)
  [`upd`](https://github.com/pchiorean/Indentz/commit/d3f2ccdbffbeeb3bfde6085538ee82a74e13a172)
  **lib/parseDataFile and related:** Added '.txt' fallback to the data files
- [`upd`](https://github.com/pchiorean/Indentz/commit/ddf8abe1df84e6f4f469ba103b6e26ade644108a)
  **cleanup/DocCleanup:** Preserve empty text frames (don't convert them to generic frames)
- [`upd`](https://github.com/pchiorean/Indentz/commit/f03373821bd4f60b31f8cfb404394d30e6d2a587)
  **view/ZoomTo...:** Updated the zoom factor (fits a square page to 90% of 'Fit Page in Window')

##### Bug fixes

- [`fix`](https://github.com/pchiorean/Indentz/commit/1214ec3da12b17c4ac8b8227dfa76a28183b63af)
  **cleanup/SwatchesSave:** Fixed file encoding (UTF-8)
- [`fix`](https://github.com/pchiorean/Indentz/commit/5e54d86d82a1ce06836361c8d50045e5c6e7774a)
  **cleanup/ReplaceLinks:** Fixed an error for names containing `%`
- [`fix`](https://github.com/pchiorean/Indentz/commit/d45bba8046dfbea4171fe208126b77642012dcff)
  **lib/parseDataFile and related:** Fixed `@includepath` to be always relative to the data folder
- [`fix`](https://github.com/pchiorean/Indentz/commit/5878d14e2650871d4d1147eefbd245684d7df690)
  [`fix`](https://github.com/pchiorean/Indentz/commit/142d7fc830f4c7ad3eea03fbfe8d0df94fb51590)
  [`fix`](https://github.com/pchiorean/Indentz/commit/d0774f9aa75ac11f2adf554e9931f088493c8ffe)
  **cleanup/ReplaceLinks:** Because we are dealing with document links, changed `@includepath` default to the document `Links` folder (and fixed `@include` to fall back to the data folder in this situation)
- [`fix`](https://github.com/pchiorean/Indentz/commit/fbe49efe36d5907cc30c09d50c064f02c79b94d9)
  **lib/parseDataFile and related:** Don't try to `@include` non-`.tsv` files
- [`fix`](https://github.com/pchiorean/Indentz/commit/0dd4c38bf391b441d4f2ee251efc5298cbf47061)
  **lib/report:** Fixed enabling auto filtering only when `auto` keyword is used (d'oh)
- [`fix`](https://github.com/pchiorean/Indentz/commit/3f88f2499e852ad5b022a85f446f105f493bde61)
  **lib/report:** Fixed borked midnight patch to auto filtering (d'oh)
- [`fix`](https://github.com/pchiorean/Indentz/commit/80ba0dca551362a5587c46ea48e39e860172a1bc)
  **lib/parseDataFile and related:** Fixed an excessive cleaning of quotes in `@include` paths

##### Miscellaneous

- [`ref`](https://github.com/pchiorean/Indentz/commit/e55692ccbf9d85bc0b2495dc4321451e1514d05d)
  **export/QuickExport:** Minor (cosmetic) options tweaks
- [`ref`](https://github.com/pchiorean/Indentz/commit/5fbb288a359358459c5f4d36004f41fd70e8802f)
  **file/SpreadsToFiles:** Updated prompt text
- [`ref`](https://github.com/pchiorean/Indentz/commit/73f201a2ac2ba1fce93d8a558b376ab603d01371)
  **lib/fitTo:** Updated linting settings
- [`ref`](https://github.com/pchiorean/Indentz/commit/17d5cb5ee2483fb73ec522f907b469f74bb65ca8)
  **view/ZoomTo...:** Refactored to use similar code to its twin
- [`doc`](https://github.com/pchiorean/Indentz/commit/c6559f2827361c20aa3f172a0743a9e8549f73ea)
  **lib/parseDataFile and related:** Changed 'prefixed' to 'starting'

#### [22.8.22](https://github.com/pchiorean/Indentz/releases/tag/22.8.22)

##### New features

- [`new`](https://github.com/pchiorean/Indentz/commit/d5f2a4c5f3cc42a26a8b63bd90539645f60ba464)
  [`fix`](https://github.com/pchiorean/Indentz/commit/65d864208e26d670c182c3996dcf300eb9ffeac4)
  **SpreadsToFiles:** Added a custom positioning placeholder character – if the file name contains a `#`, the index will be placed in that position
- [`new`](https://github.com/pchiorean/Indentz/commit/0de1e18e859d5737938d345ab554fd1fe5eb2608)
  `hack` **QuickExport:** Show/hide layers starting with a dot when using a 'preview'/'print' suffix (aka DNP layers)
- [`new`](https://github.com/pchiorean/Indentz/commit/255f33547fcfc560208cf70f3af7d26728d8c5fb)
  Added **lib/addGuide:** Helper function for creating standard ruler guides
- [`new`](https://github.com/pchiorean/Indentz/commit/e602c5232006a10b3b06fcaee718f22cb7aa449f)
  Added **lib/truncateString:** Helper function for truncating strings
- [`new`](https://github.com/pchiorean/Indentz/commit/ecaeb2560026487080c36286215d83e0ee34d597)
  **lib/report:** Added a button for saving the report to file

##### Updates

- [`upd`](https://github.com/pchiorean/Indentz/commit/17a1faec009dbf69e301196defe8c454ddbbbd97)
  **QuickExport, QRBatch:** Relaxed the list of invalid file name characters (`<` `>` `:` `"` `\` `/` `\` `|` `?` `*`)
- [`upd`](https://github.com/pchiorean/Indentz/commit/aa98b48ac3e848dcf3ebfe220abd037840c9bc1a)
  **DefaultPrefs:** Changed baseline grid color to a lighter grey (`230,230,230`)
- [`brk`](https://github.com/pchiorean/Indentz/commit/b8acc4c788519dc993a64d761cd12e9241af6ab7)
  **lib/addGuide:** Changed the `color` argument to `preset`: symmetry axes, sections/subsections, product alignment guides and so on
- [`upd`](https://github.com/pchiorean/Indentz/commit/c44522729df1d402ab5129ac020e735202e435e4)
  **GuidesAdd:** Updated to use **lib/addGuide**
- [`brk`](https://github.com/pchiorean/Indentz/commit/87fb29b96d0f1440214d43ba1145f272a543ff53)
  **QuickExport:** Added a resolution field; bumped settings version
- [`upd`](https://github.com/pchiorean/Indentz/commit/a72b71d91c76cdb4d770737060b328af5a43eb1b)
  **QuickExport:** Added a preset description help tip
- [`upd`](https://github.com/pchiorean/Indentz/commit/135b8848c3ac232f75a1a636d4259692f23b90ab)
  `hack` **QuickExport:** When exporting with a `print` suffix, append `+diecut` if documents have a `dielines` layer
- [`upd`](https://github.com/pchiorean/Indentz/commit/1236ae8072b4c018eb366fd8fbc6999b4dafec03)
  **QuickExport:** Input/output folder fields are now editable
- [`upd`](https://github.com/pchiorean/Indentz/commit/14f8af0c6b2bb7d070cb3d66537f7874e7c435f7)
  **lib/addGuide:** Tweaked zoom threshold for several guide types
- [`upd`](https://github.com/pchiorean/Indentz/commit/47041cd8d8181f6c655cc4ce22de670ce83ad6d6)
  [`upd`](https://github.com/pchiorean/Indentz/commit/958b5015d51e82b0720dc68e5eec6be48302ad23)
  **lib/fitTo:** Protect `<visible area>` frames and items on `dielines` layer
- [`upd`](https://github.com/pchiorean/Indentz/commit/3832bceeefb330818331e427d47d47b2ce7edac4)
  **QuickExport:** Error messages are now displayed on the titlebar and the 'Start' button help tip
- [`upd`](https://github.com/pchiorean/Indentz/commit/0dfb394a2db28a3a8654b7588f401ac6b909d45e)
  **DefaultSwatches:** Added `/` to the list of values separators (thus, you can write values as `34 42 23 5`, `34|42|23|5`, or `34/42/23/5`)
- [`upd`](https://github.com/pchiorean/Indentz/commit/747f936d7c80c3954fd749b59dfae8091459e0fd)
  **DocCleanup:** Items on `dielines` layer will not be converted to graphic frames; lock `varnish` layer
- [`upd`](https://github.com/pchiorean/Indentz/commit/18320f0e4f543a75ca876090f49b4cb2c825e25f)
  **SwatchesSave:** Don't open the TSV file after exporting it
- [`upd`](https://github.com/pchiorean/Indentz/commit/83596d0de9b7e986e1691d8a9f283b4f91af36c3)
  **PrepareForExport:** Dielines are no longer moved to separate page
- [`upd`](https://github.com/pchiorean/Indentz/commit/eb4f65ce2704525ef692343ba573d1e36a09447e)
  **lib/moveToLayer:** Added `top`/`bottom` keywords
- [`upd`](https://github.com/pchiorean/Indentz/commit/02f545411e21f7b6e0cdbca19d5720f774745fbf)
  **DefaultLayers/Swatches/ReplaceFonts/Links/Snippets:** Improved info/error reporting

##### Bug fixes

- [`fix`](https://github.com/pchiorean/Indentz/commit/bf0173fd6c2f4c264c202e7a3a6ac8411609e3b1)
  [`fix`](https://github.com/pchiorean/Indentz/commit/6aecbbe07748946fb3b097dceac49ee609479a5e)
  Enforced straight corners to new rectangles and text frames
- [`fix`](https://github.com/pchiorean/Indentz/commit/9cb2db6c9a113e8008122993fadb62e57424c2d9)
  **ReplaceSnippets:** Embedded the helper function into the main script and fixed a replacement quirk

##### Miscellaneous

- [`ref`](https://github.com/pchiorean/Indentz/commit/52e0959dec7e4e321ddf13b2b0f7f528f6f96b25)
   **lib/\*:** Renamed libs to match their function name and updated `#include` directives
- [`ref`](https://github.com/pchiorean/Indentz/commit/a566a05c57e50d13b86053db7a2f9674ecda3d9e)
  Changed spelling of 'filename' to 'file name' ;)
- [`ref`](https://github.com/pchiorean/Indentz/commit/f60476d2d2adfd61590b744b4ddaea27f8cfb0f6)
  **ZoomTo...:** Updated the zoom coeficient description with a monitor list
- [`ref`](https://github.com/pchiorean/Indentz/commit/00415e83ac739a5c3c0328358f0d38a6af1185c0)
  Added an `#includepath` directive with a list of fallback folders

#### [22.6.11](https://github.com/pchiorean/Indentz/releases/tag/22.6.11)

##### New features

- [`new`](https://github.com/pchiorean/Indentz/commit/e9012199d92ba0bef97acdbc9720a85de0ae07ab)
  **ReplaceSnippets:** Converted **lib/ReplaceText** to a standalone script
- [`new`](https://github.com/pchiorean/Indentz/commit/a5104648fd99949bef989d579bbaceabcffc802a)
  Added **LayersToSpreads:** Moves layers of the active document to separate spreads

##### Updates

- [`upd`](https://github.com/pchiorean/Indentz/commit/c7459d5d0044b30edb875af724d718671f249b74)
  **DocCleanup:** Split step 3 into separate steps
- [`upd`](https://github.com/pchiorean/Indentz/commit/f82d55a4d1c7b17d6c8b00e9669770e04aac441b)
  **MarkVisibleArea, PageSizeFromFilename:** Updated 'Visible area' swatch
- [`upd`](https://github.com/pchiorean/Indentz/commit/41af4aafd86e5137f2764d6ca34476bd79bcec9d)
  [`upd`](https://github.com/pchiorean/Indentz/commit/2783324ef151b8416c7ea306886b17e6f69b73be)
  **lib/ParseDataFile, DefaultLayers/Swatches/ReplaceFonts/Links, QRBatch:** Trimmed trailing whitespace on import
- [`upd`](https://github.com/pchiorean/Indentz/commit/01003af9e7d6a59f6b8a59c4626c4bf85a3db6f1)
  **ReplaceSnippets:** Added a scope limiting column – replacement will only be done if a string appears in the file name (regex)
- [`upd`](https://github.com/pchiorean/Indentz/commit/46c84c90a44341c32226db552eb246ffa55bdc70)
  [`upd`](https://github.com/pchiorean/Indentz/commit/820c66f426c004b1a0fbf5faf54bce502b3d7d39)
  **PrepareForExport, Show/HideDNPLayers:** All layers starting with hyphen or dot are now included in the 'do-not-print' list
- [`upd`](https://github.com/pchiorean/Indentz/commit/9b2af349305547bf016d77372cf744445f3617e1)
  **ScaleTo:** Scaling now takes into account the transformations reference point

##### Bug fixes

- [`fix`](https://github.com/pchiorean/Indentz/commit/9858c669dc00ff0ec353796373935aae1c758faf)
  [`fix`](https://github.com/pchiorean/Indentz/commit/97bf0b591a66e7790c218477fcc388053e4fbdc8)
  **lib/ParseDataFile, DefaultLayers/Swatches/ReplaceFonts/Links:** Enforced UTF-8 encoding on opening the data file
- [`fix`](https://github.com/pchiorean/Indentz/commit/f06e68d91e8abab4e08933162f4676b8fceaafa6)
  **DefPrefs:** Added 'Coated FOGRA39' as CMYK profile fallback
- [`fix`](https://github.com/pchiorean/Indentz/commit/7e34318775191b4c6256e6f43711bcd4a3687bab)
  **lib/ReplaceText:** Skip locked layers & stories

##### Miscellaneous

- [`upd`](https://github.com/pchiorean/Indentz/commit/2d43649c6fcb012b8ab4ed28901059245415829a)
  **lib/Report:** Increased maximum width

#### [22.4.11](https://github.com/pchiorean/Indentz/releases/tag/22.4.11)

##### New features

- [`new`](https://github.com/pchiorean/Indentz/commit/880aa8ec0a66dbff191be1af103a493c4b7ce1d5)
  **DocCleanup:** Added a prompt to delete empty frames

##### Updates

- [`brk`](https://github.com/pchiorean/Indentz/commit/937f8db5656296e4dcee4d2261540252a7210173)
  **lib/ProgressBar:** Refactored methods – values are updated separately from messages (values are simpler to increment)
- [`upd`](https://github.com/pchiorean/Indentz/commit/2cc1c2aff82ac6c490b94a59a4f719f94a9b564b)
  **QuickExport:** Check cancel request more often (between each export instead of between documents)
- [`upd`](https://github.com/pchiorean/Indentz/commit/220c047ee848b37714094be138ec93e31e3a67cd)
  **DefaultLayers:** Layers get themselves as the first variant
- [`upd`](https://github.com/pchiorean/Indentz/commit/bcf0ca00315b766d7c366cd17d20ff0ea53a0f57)
  **DefaultSwatches:** Swatches get their 'Color Value Name' as the first variant
- [`upd`](https://github.com/pchiorean/Indentz/commit/8ab105997d7dbc64e3e1aaf485d463fc3939fa1c)
  **DocCleanup:** Improved pasteboard setting logic
- [`upd`](https://github.com/pchiorean/Indentz/commit/7e850f53bd693a7cf44fa3917e019f96f56dd282)
  **DefaultSwatches, ReplaceLinks:** Added progress bars
- [`upd`](https://github.com/pchiorean/Indentz/commit/880aa8ec0a66dbff191be1af103a493c4b7ce1d5)
  **DocCleanup:** Changed visibility and locked state of some technical layers (e.g., 'dielines')

##### Removed features

- [`del`](https://github.com/pchiorean/Indentz/commit/7b768b5f8cce9c6c975beed0c00977e1d8428122)
  Removed `DocDefaults` stub

##### Bug fixes

- [`fix`](https://github.com/pchiorean/Indentz/commit/a0278cdce29715ee9934266fde3e7a024e9c331c)
  **lib/ReplaceLink:** Removed `errors.push()`, we already return boolean status
- [`fix`](https://github.com/pchiorean/Indentz/commit/5b0f0f8c16283ab59765857efa9ff4e97ae4cf2a)
  **TextAutosize:** Added a check for overflown text when disabling hyphenation for one-liners
- [`fix`](https://github.com/pchiorean/Indentz/commit/bb12fb85da5f0a780b8962b379da86f4c8dc3ba9)
  **DefaultLayers/Swatches/ReplaceFonts/Links:** Don't skip error reporting when there are no records
- [`fix`](https://github.com/pchiorean/Indentz/commit/880aa8ec0a66dbff191be1af103a493c4b7ce1d5)
  **DocCleanup:** Fixed an overzealous trimming of overflowed text
- [`fix`](https://github.com/pchiorean/Indentz/commit/0d38de1cd6d3a6c42292f1d9fdb2b81220929e69)
  **DocCleanup:** Skip frames with strokes when converting empty frames to graphic frames

##### Miscellaneous

- [`ref`](https://github.com/pchiorean/Indentz/commit/015098b840418e3700a3499df0d0fbd49243ef05)
  **QRBatch:** Processed lines are commented with just a '#', no space; works better when aligning columns with 'Rainbow CSV'
- [`ref`](https://github.com/pchiorean/Indentz/commit/98623ed89d2e82d4b138c071d3d33db659236345)
  **DefaultLayers/Swatches/ReplaceFonts/Links:** Tweaked messages for BigSur's vertical alerts
- [`doc`](https://github.com/pchiorean/Indentz/commit/14f7688731f5ba609c84530fee67600a55248e0b)
  **lib/ReplaceLink, ReplaceLinks:** Clarified/removed a mention about local links

#### [22.3.11](https://github.com/pchiorean/Indentz/releases/tag/22.3.11)

##### New features

- [`new`](https://github.com/pchiorean/Indentz/commit/ae70c878cc579c3a1714e67a5756e519597bb3ea)
  Added **lib/MoveToLayers:** Moves items to layers, optionally setting front/back order
- [`new`](https://github.com/pchiorean/Indentz/commit/fd40557b6a81caa4342884132746c75120f64f52)
  **DocCleanup:** Empty non-text frames will be converted to graphic frames to make them visible on complex layouts
- [`new`](https://github.com/pchiorean/Indentz/commit/4b100ce6490f374b8047d2cf9f9e5b239e6351bb)
  **ReplaceLinks:** 'Document links' list now accepts '*' and '?' wildcards

##### Updates

- [`upd`](https://github.com/pchiorean/Indentz/commit/ca8bf04cc4561838f7cfa6ff0563a46d5a3cbacd)
  [`upd`](https://github.com/pchiorean/Indentz/commit/e8470e8aceaa8664e8c0d35c355c9dfb4c0a7a52)
  **DocCleanup, DocDefaults:** Added progress bars
- [`brk`](https://github.com/pchiorean/Indentz/commit/c7420f394c72661ca1f0f459fc8b882dae80576d)
  **lib/FitTo, lib/GetBounds:** The visible area will now fallback to page/spread size
- [`upd`](https://github.com/pchiorean/Indentz/commit/2cbdc230c18ec232078d4e61928640fae793e772)
  **DefaultLayers/Swatches/ReplaceFonts/Links:** Set verbosity to INFO when **Ctrl** is pressed
- [`upd`](https://github.com/pchiorean/Indentz/commit/41bc44c5e4c47cc25054f15d6be0f66af8470eda)
  **SwatchesCleanup:** Merged 'R=0 G=0 B=0' to the default Black swatch

##### Removed features

- [`ref`](https://github.com/pchiorean/Indentz/commit/b804940a29d841ead53543b87acbf0f94424c6f9)
  **QRBatch:** Removed bounds fallback (it's done in the `GetBounds` lib now)

##### Bug fixes

- [`fix`](https://github.com/pchiorean/Indentz/commit/a9199d8ca043d2daee502979c0dbd54ab52f37b5)
  [`fix`](https://github.com/pchiorean/Indentz/commit/667ad41564a566736e6b8433874287899367e593)
  **QR, QRBatch:** Fixed some errors in suffix regexp matching (01/27 bugs)
- [`fix`](https://github.com/pchiorean/Indentz/commit/da98c89349cae6b159f8d9c8b20910064e1401ee)
  Don't resize (**PageSizeFromFilename**) or don't split (**QuickExport**) documents with a mixture of sizes (e.g., 210x297 + 297x210)

##### Miscellaneous

- [`doc`](https://github.com/pchiorean/Indentz/commit/71016890effb5e838d88e1d07a9551a018a064e6)
  Added a folder with sample data files
- [`ref`](https://github.com/pchiorean/Indentz/commit/5fbd56abfeb7a46fd5e8bec0bb2e48d419573a90)
  Renamed **lib/isIn** to **isInArray**

#### [22.2.9](https://github.com/pchiorean/Indentz/releases/tag/22.2.9)

##### New features

- [`brk`](https://github.com/pchiorean/Indentz/commit/3e49e0e84168940d265b77f541bb967f441c7d8e)
  **QR 4.0, QRBatch 3.0:** Added suffix support (see [`SpreadsToFiles`](README.md#file))
- [`upd`](https://github.com/pchiorean/Indentz/commit/bcdc2ad7b12709b748396a9f0104b36c710953d1)
  **lib/ProgressBar:** Added a second (optional) progress bar
- [`upd`](https://github.com/pchiorean/Indentz/commit/0fc73f2d1574cd5cc5747276a3fd544e6028e103)
  **QuickExport 2.19:** Cancel exporting if 'Esc' is pressed
- [`new`](https://github.com/pchiorean/Indentz/commit/b0cec7208c5c08d82bd5efeb48850e01e2fc8677)
  **QuickExport 2.17:** Added a 'Save as…' option for removing cruft and reducing documents size
- [`upd`](https://github.com/pchiorean/Indentz/commit/111a3d78ecd478439ae568d6d045e04ecaa6acfd)
  **QR 3.7, QRBatch 2.9:** Added a checkbox for uppercase text
- [`upd`](https://github.com/pchiorean/Indentz/commit/f42cda93e86b35d8874c6d7224ca960c88d815ba)
  **QuickExport 2.13:** When exporting files to subfolders, a '+' in the suffix will truncate the subfolder name
- [`upd`](https://github.com/pchiorean/Indentz/commit/2813627388fe29db705688f4e942141d0e86d7f3)
  **lib/ParseDataFile 2.1:** You can now use backslash at the end of a line to split long lines
- [`brk`](https://github.com/pchiorean/Indentz/commit/3151eda817f88cc2e83e97e3f3c2f4edc222f073)
  **lib/ParseDataFile 2.0:** Extended reporting granularity (fatal, warning, info, etc)
- [`new`](https://github.com/pchiorean/Indentz/commit/3f151932a2dfe434649999dd97f91739e5f5e3be)
  Added **GuidesAdd:** Adds guides on pages' edges and inner centers or on selected objects' edges (mostly a template script)
- [`new`](https://github.com/pchiorean/Indentz/commit/3d4e0ad39ff33bf1da6adb89c222788a8b821086)
  Added **ReplaceLinks:** Replaces document links from a substitution list
- [`upd`](https://github.com/pchiorean/Indentz/commit/06f2e5c3dfa7ee2076c2373e7b7dc990c95f727f)
  **DocCleanup 2.9:** Added a step to clear default effects
- [`new`](https://github.com/pchiorean/Indentz/commit/d4f8e98b9df3bcc142537be1d865804456d11ab7)
  Added **ScaleToSpreadBleed/H/W**
- [`upd`](https://github.com/pchiorean/Indentz/commit/80a4332a3d2b2abd59a5b58e63c8fc9da5fe82ea)
  **lib/IsIn:** Added wildcards support
- [`new`](https://github.com/pchiorean/Indentz/commit/dc2e515a744d3ace9beedbfb0362765088c31857)
  Added **OffsetPath 1.2** by [Olav Martin Kvern](https://www.siliconpublishing.com/blog/free-indesign-scripts/) 
  to `/misc` (it uses InDesign's text wrap feature to create offset/inset paths)
- [`new`](https://github.com/pchiorean/Indentz/commit/793b29ad840c757da623c7478c1151da8c02a4c0)
  Added **FindFile**, **IsIn** to `/lib`

##### Updates

- [`upd`](https://github.com/pchiorean/Indentz/commit/2b8e886f04ebaf4fb912540a2183fe1a941ba403)
  **QuickExport 2.20:** Added a second progress bar when exporting separate pages
- [`upd`](https://github.com/pchiorean/Indentz/commit/21e174597e2a5409f5536616be6ee7c6bebb9774)
  **QuickExport 2.18:** Input files are now sorted in natural order
- [`upd`](https://github.com/pchiorean/Indentz/commit/832e27f6050f82b3e52d7a901bfa40be93974077)
  **QR 3.6.1, QRBatch 2.8.1:** The on-page label now has insets on both left and right sides
- [`brk`](https://github.com/pchiorean/Indentz/commit/f27f115aef8e122a05eccb0720bd359dfc11fae8#diff-0e70c2dc31abbf14f06d436fe1ed2bef11090416ae8c43bbfc1c17e48e9dae3c)
  **lib/FitTo 6.0:** Changed input to a page items array argument instead of the current document selection
- [`upd`](https://github.com/pchiorean/Indentz/commit/4442267f8e239e1721eeba8cbfb4513199d3761b)
  **DefaultLayers 3.4, DefaultSwatches 4.6, ReplaceFonts 2.3, ReplaceLinks 1.3:**
  Improved the error alert for missing data files; added a check for converted documents
- [`upd`](https://github.com/pchiorean/Indentz/commit/fd7aa42014aa30da5763db74ade92da2c66a7c33)
  **DefaultPrefs 1.5:** Disabled layout adjustment
- [`upd`](https://github.com/pchiorean/Indentz/commit/3926a97cf7225ee060e09e49e11778382ec0bd8e)
  **QR 3.6, QRBatch 2.8:** If it fits, the code will now be aligned outside visible area, instead of margins
- [`upd`](https://github.com/pchiorean/Indentz/commit/f512575295740bed67d12fe24210aefc77ab4f58)
  **ReplaceLinks 1.2:** Update out-of-date links
- [`upd`](https://github.com/pchiorean/Indentz/commit/614255fcf2c98b63fa22d2e4cb1ecef00162b796)
  **LabelPage 1.3, LabelPageRatios 2.2, PrepareForExport 2.3:** Aligned page label to crop marks
- [`upd`](https://github.com/pchiorean/Indentz/commit/3b48f362a0b451f959da7bbea8ef83fb736e0e30)
  **lib/Report 2.1.1:** Relaxed minimum window width for very small messages
- [`upd`](https://github.com/pchiorean/Indentz/commit/b8df97aaa527928efb83bdb3b5541632b5e275a9)
  **lib/Debug 1.1:** Display `NL` and `CR` as paragraph marks
- [`upd`](https://github.com/pchiorean/Indentz/commit/04d1189abba4fbd8bc2202e048a685f7b71be878)
  **QuickExport 2.15:** Report overflowed text; don't report missing links from the pasteboard
- [`upd`](https://github.com/pchiorean/Indentz/commit/3d884512a1fd6afb74691951486090cd49840cad)
  **DefaultLayers 3.3, DefaultSwatches 4.5, ReplaceFonts 2.2, ReplaceLinks 1.1:** Improved data parsing and error reporting
- [`upd`](https://github.com/pchiorean/Indentz/commit/0a37098dd76b71f41e52b75e7898f637b92a60f2)
  **lib/Report 2.1:** Updated sorting to ['natural ordering'](https://github.com/litejs/natural-compare-lite)
- [`upd`](https://github.com/pchiorean/Indentz/commit/7a1ef66fc2aabfffed3528bf83b41ba8f01c20eb)
  **lib/ReplaceSwatch:** Return replacement status (boolean)
- [`upd`](https://github.com/pchiorean/Indentz/commit/2fd1abc1aaed806c20f40a4a8eb39a69e5882599)
  **QuickExport 2.12:** Moved crop marks at 1 mm from trimbox; don't include printer's marks if no bleed
- [`upd`](https://github.com/pchiorean/Indentz/commit/4e1e7021326a1afc48c2e40c9ce54c1279b3cdd2)
  **OffsetPath 2.0:** Fixed container-objects; added option to join contours; streamlined logic
- [`upd`](https://github.com/pchiorean/Indentz/commit/6dfd0aea063fe89f67fb228e73f0c6bc378e0619)
  **lib/ProgressBar, QRBatch 2.7.1, QuickExport 2.11.2, SpreadsToFiles 1.7.9:** Centered progress bar in parent window
- [`upd`](https://github.com/pchiorean/Indentz/commit/ad2434b3a0b1dd330ebea1f9f9a99f6eabcb432c)
  **Debug 1.0:** Updated description, simplified arguments parsing, updated `trunc/pad` function
- [`upd`](https://github.com/pchiorean/Indentz/commit/ad2434b3a0b1dd330ebea1f9f9a99f6eabcb432c)
  **HW 2.7:** Also match old `<safe area>` frames as visible area marks
- [`upd`](https://github.com/pchiorean/Indentz/commit/ad2434b3a0b1dd330ebea1f9f9a99f6eabcb432c#diff-88f86d8b713ae55352e6f1412b825214bd1c2a159f50d5f73a8c1a705d20bbca)
  **ShowProfiles 1.5:** Profiles are only available with a document opened, so create a temporary one

##### Removed features

- [`ref`](https://github.com/pchiorean/Indentz/commit/1b87d73e8725849e2828e1381ed4e5aa97a9375e)
  **QuickExport 2.21:** Removed advanced mode 'Save prefs' button

##### Bug fixes

- [`fix`](https://github.com/pchiorean/Indentz/commit/bdd052c38198a876b8682bc04f34e0da6bc2711c)
  **QRBatch 2.9.2:** Forgot to pass along the uppercase checkbox value (d'oh!)
- [`fix`](https://github.com/pchiorean/Indentz/commit/43439885e332b7b44e1b759c4e87b95eb9fe9799)
  **TextAutosize 2.5.2:** Hopefully fixed hyphenated lines breaking
- [`fix`](https://github.com/pchiorean/Indentz/commit/a96c262e49cbd6bdd4c109d1babb5edf95b12baf)
  **QuickExport 2.16.1:** Fixed a bug when skipping page information on pages with small widths
- [`fix`](https://github.com/pchiorean/Indentz/commit/c0a3cdb490067d57a54997ee4b702146223483c4)
  **QR 3.7.1, QRBatch 2.9.1:** Made the label uppercase by default
- [`fix`](https://github.com/pchiorean/Indentz/commit/30f24d7d4e40d29c3f5af26d80e8a4c21baea8fe)
  **lib/GetBounds 5.1.3:** Get the parent doc from the `page` argument, don't rely on the global `doc` variable (d'oh!)
- [`fix`](https://github.com/pchiorean/Indentz/commit/2492a2f1c1dd3efc4c17172bf056f40613531401)
  **lib/FitTo 5.5.6:** Relaxed 'object is transformed' rule to not clip 90°-rotated objects (fix regression from v5.5.4)
- [`fix`](https://github.com/pchiorean/Indentz/commit/ce1cf13f2750d04d9cf83fcd82e0759ef674309d)
  **lib/FitTo 5.5.5:** Don't move forced-fit lines to `[0, 0]`
- [`fix`](https://github.com/pchiorean/Indentz/commit/f40cdc1e437a43f68b7e4ae3188d1ba8b5300c69)
  **lib/FitTo 5.5.4:** Transformed containers and text frames are now clipped
- [`fix`](https://github.com/pchiorean/Indentz/commit/ba80564a179e9664f582efddd3fe132c8a07fb6b)
  **QuickExport 2.16:** Don't include page information when pages/spreads widths are less than 335 pt
- [`fix`](https://github.com/pchiorean/Indentz/commit/6895b3b0136908211a2a07983579916d4f4f00ac)
  **LabelPage 1.3.1, LabelPageRatios 2.2.1, PrepareForExport 2.3.1:** Added a white outline to labels
- [`fix`](https://github.com/pchiorean/Indentz/commit/70b7ac39278a7974143ce58516b140cb4d9f5930)
  **ShowFonts 1.4.6:** Fixed name reporting for missing fonts
- [`upd`](https://github.com/pchiorean/Indentz/commit/453707ad0ead37df7319644ea5435bc22a03d553)
  **QuickExport 2.14:** When exporting separate pages don't add a counter if doc has a single page/spread
- [`fix`](https://github.com/pchiorean/Indentz/commit/5661ea64bf4dbdf14900448bcd68796fbbc55eae)
  **DefaultLayers 3.3.1, DefaultSwatches 4.5.1, ReplaceFonts 2.2.1, ReplaceLinks 1.1.1:**
  Changed 'No data file found' alert verbosity level to `info`
- [`fix`](https://github.com/pchiorean/Indentz/commit/611b773f2176621a1808ede3acfe874e3a2a9343)
  **lib/ParseDataFile 2.2:** Fixed clash between general errors and record checking errors
- [`fix`](https://github.com/pchiorean/Indentz/commit/a1fdedb3fedfb614c1c47abdaeb49c6c13f96684)
  **SpreadsToFiles 1.7.12:** Fixed separator validation (regex fuckup)
- [`fix`](https://github.com/pchiorean/Indentz/commit/0ba9127a29db63820b5e7e3fe85c73cb3e34a2cc)
  **lib/ParseInfo:** Fixed reporting errors from included files
- [`fix`](https://github.com/pchiorean/Indentz/commit/ec0903a428aa608a66acf8716b90ec94dd790ca6)
  **lib/Bounds 5.1.1:** Fixed typo on `page.visible[3]`
- [`fix`](https://github.com/pchiorean/Indentz/commit/95c744efa420c35c41e966293bdac5b72fb059b8)
  **QuickExport 2.11.3:** Fixed clash with regex tokens when uniquifying filenames
- [`fix`](https://github.com/pchiorean/Indentz/commit/c171770fc5ba3ca001ef43817d11055b8c6b95e4)
  **PrepareForExport 2.2.2:** Hidden layers are now ignored
- [`fix`](https://github.com/pchiorean/Indentz/commit/ad2434b3a0b1dd330ebea1f9f9a99f6eabcb432c)
  **Clip 2.7, ClipUndo 2.5:** Only clip objects directly on spread
- [`fix`](https://github.com/pchiorean/Indentz/commit/ad2434b3a0b1dd330ebea1f9f9a99f6eabcb432c)
  **QRBatch 2.7:** Converted documents are now skipped and reported

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
  **SpreadsToFiles 1.7.10:** Added an example to the prompt message
- [`doc`](https://github.com/pchiorean/Indentz/commit/1fde6d6ab06a5381d591e557e46dab0b8f11895c)
  Updated description for some of the stubs in `/lib`
- [`ref`](https://github.com/pchiorean/Indentz/commit/63d365a6b1931cbe2ba0d7b0d6009437acac4bd6)
  [`ref`](https://github.com/pchiorean/Indentz/commit/a4fe6767f5dc757fd8aa28173b90c32adb38fb0a)
  Renamed **lib/Bounds** to **GetBounds** and **lib/FindFile** to **GetDataFile**
- [`ref`](https://github.com/pchiorean/Indentz/commit/6cee3420533728fb3c117ba8928389edf3a5ed1e)
  **lib/GetBounds 5.1.2, HW 2.7.1, PageSizeFromFilename 2.1.4, VisibleArea 3.2.1:** Renamed visible area regex
- [`ref`](https://github.com/pchiorean/Indentz/commit/6e897670752ff918136c540a57a4a46cd78ab786)
  **lib/Debug 1.0.1:** Changed context separator to '::'
- [`ref`](https://github.com/pchiorean/Indentz/commit/2da0f1ff8c6da4aa0508041674447df5ad558768)
  Renamed **OffsetPath** to **OffsetPaths**
- [`ref`](https://github.com/pchiorean/Indentz/commit/793b29ad840c757da623c7478c1151da8c02a4c0)
  Renamed **lib/Relink** to **ReplaceLinks**
- [`doc`](https://github.com/pchiorean/Indentz/commit/c8dd950b8167d4a30148c866da25e91694f9416c)
  Added a changelog

#### [21.9.20](https://github.com/pchiorean/Indentz/tree/723c2fe6c71c9d5a4586f2b7685628fe0d788258)

- [`ref`](https://github.com/pchiorean/Indentz/commit/51bb19d2d7074181c5acacc8dd52931bfd3263c5)
  [`upd`](https://github.com/pchiorean/Indentz/commit/8982a3fde7956ac83372ba140a773a05dff929e2)
  [`fix`](https://github.com/pchiorean/Indentz/commit/ad2434b3a0b1dd330ebea1f9f9a99f6eabcb432c)
  Autumn cleaning: added ESLint and refactored many scripts (hopefully, there are no new bugs)

## Backlog

##### New features

- `brk` `?` **cleanup/DefaultLayers:** Add column for locked status
- `new` **cleanup/DefaultSwatches:** Add groups support
- `new` **cleanup/DefaultSwatches:** Add gradients support
- `new` **cleanup/DefaultSwatches:** Add tints support
- `new` **export/QuickExport:** Add a preflight option
- `new` **export/QuickExport:** Add history to inputs (see page 43 of **ScriptUI** by PK)
- `new` **file/SpreadsToLayers**
- `new` **lib/replaceLink:** Add page parameter
- `new` **misc/ShowFonts** → **cleanup/DumpFonts**
- `new` Add an '.ini' file for user global settings
- `new` 'Send selection to layer...'
- `new` `?` **file/LayersToFiles**

##### Updates

- `brk` **cleanup/DefaultLayers/Swatches/ReplaceFonts/Links:** Optional arguments: data file, verbosity level
- `upd` **cleanup/DefaultSwatches:** `checkRecord()`: 'Values' ‣ 'Color Space' ‣ 'Color Model' ‣ 'Variants' ‣ 'Name'.\
  If swatch name is missing, generate a Color Value Name. If color space is missing, use a default depending on color values number and range
- `upd` **cleanup/DefaultSwatches:** `checkRecord()`: Validate color values (number and range) depending on color space
- `upd` **cleanup/DocCleanup:** Delete empty color groups
- `upd` **cleanup/ReplaceFonts:** Borrow the good stuff from `font-substitution.jsx` by PK
- `brk` **cleanup/ReplaceSnippets:** Add regexp/grep suport
- `brk` **cleanup/ReplaceSnippets:** Extend Scope to layers/pages etc
- `brk` **export/MarkVisibleArea, PrepareForExport:** Read layer variants from `layers.tsv`, fallback to defaults
- `brk` **export/MarkVisibleArea:** Mark the entire spread's visible area, not individual pages
- `upd` **export/QuickExport:** Create destination folder if it doesn't exist
- `upd` **export/QuickExport:** Move hacks to advanced options, saved in settings
- `upd` **export/Show/HideDNPLayers:** Take layers from a TSV
- `upd` **file/FilesToSpreads:** Also bring along the attached master pages
- `upd` **file/SpreadsToFiles:** Split `-ABBBCC` to `-A`, `-BBB`, `-CC`
- `upd` **layout/PageMarginsFromSelection:** Set the margins of every page touched by the selection
- `upd` **layout/PageSizeFromFilename:** Use real units (mm, cm, px) when detected
- `upd` **layout/PageSizeFromSelection:** Use outlined text bounds for text frames
- `upd` **layout/PageSizeFromSelection:** Without selection fit all pages to their contents
- `upd` **lib/log:** Update string formatting (see [this](https://github.com/SerenityOS/serenity/blob/c61bb1706f4fd4bdc6363df93e0d8f31709123ff/Documentation/StringFormatting.md) spec)
- `upd` **lib/replaceText:** Add grep matching
- `upd` **lib/replaceText:** Take an array of strings as input
- `upd` **lib/report:** Improve filtering: `-` for none of these words, `"` for exact word or phrase (or pass regex and be done with it)
- `upd` **lib/report:** Make window resizable
- `upd` Change title to 'Canceling, please wait...' when canceling batch processes
- `upd` Use a custom object style for `<visible area>` frame
- `upd` `?` JSONify preferences (see [this](https://stackoverflow.com/a/56391294) discussion)

##### Removed features

##### Bug fixes
- `fix` **misc/Clip:** Don't cut drop/inner shadows, outer glows and bevel and emboss
- `fix` **layout/PageSizeFromFilename:** Fix errors on pages set to 1:X scale
- `fix` **layout/PageSizeFromFilename:** Limit detected bleed to max values
- `fix` `transform()` and `app.transformPreferences.whenScaling`
- `fix` Fix `ui.onShow()` vertical dialog positioning
- `fix` Nullify large variables on exit

##### Miscellaneous

- `doc` Add a mention about canceling the ongoing operation with 'Esc'

---

## Legend

`new` - new features or first release\
`brk` - changes in existing functionality that break compatibility\
`upd` - changes in existing functionality\
`del` - removed features\
`fix` - bug fixes\
`ref` - changes that neither fixes a bug or adds a feature\
`doc` - changes in documentation\
`org` - file management
