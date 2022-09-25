### What's new in release [22.9.25](https://github.com/pchiorean/Indentz/releases/tag/22.9.25)

#### Cleanup
- **`DefaultSwatches`** You can now cancel adding swatches by pressing 'Esc'.
- **`DocCleanup`** No longer converts empty text frames to generic frames.
- **`ReplaceLinks`**
  - Fixed an error for names containing `%`.
  - You can now cancel relinking by pressing 'Esc'.
- **`SwatchesSave`** Changed the TSV encoding to UTF-8 to preseve swatch names using non-ASCII characters.

#### Export
- **`QuickExport`** Cosmetic tweaks to 'Export in subfolders' description.

#### File
- **`SpreadsToFiles`** Cosmetic tweaks to the prompt text.

#### View
- **`ZoomTo...`**
  - Refactored to use similar code to its twin.
  - Tweaked the zoom factor (fits a square page to 90% of 'Fit Page in Window').

#### Lib
**Note:** In the release version, the `jsxinc` stubs are statically-linked, so the scripts are stand-alone, and the **`lib`** folder is not included. Also, some stubs are used elsewhere but kept here for convenience.

- **`getDataFile`** Updated to take as argument a list of files; returns the first one found.
- **`parseDataFile`** (and all scripts that use TSVs as input)
  - `new` Added `@includepath` statement which sets a reference path to which subsequent relative paths will refer.
  - `new` You can now use relative paths for both `@include` and `@includepath`: thus, a path may be an absolute path, one relative to the current data file, or a path relative to a reference path, if defined by a previous `@includepath` statement.
  - Changed data files extension to `.tsv` (it still looks for `.txt` as fallback).
  - Added support for comments at the end of lines (everything after a `#` is ignored).
- **`report`** `new` Added `auto` to filtering mode – automatically shows filtering if there are more than 20 lines.

#### Other
- Activated auto filtering to the status report for scripts that need it.
