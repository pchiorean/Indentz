# Helper functions

Various functions used in many scripts from this project, linked using the `#include` directive (actually the `// @include` variant). Example:

    // @include '../lib/isInArray.jsxinc';

## addGuide(_target, [layer], HorV, location, [label], [type]_)

Adds a custom ruler guide. I use it to make grids for several brands, for which I have a hard time remembering the properties of the different guide lines. With the `preset` parameter I can group guides in several types: symmetry axes, sections and subsections, product alignment and so on.

**Parameters:**

|Name|Type|Default|Description|
|:--:|:--:|:--:|--|
|`target`|`object`||A `Document`, `Spread`, `Page` or a `MasterSpread`.|
|`[layer]`|`layer`|`activeLayer`|A target layer; defaults to the active layer. _(Optional)_|
|`HorV`|`string`||If the string begins with `v`, the guide is vertical, else horizontal.|
|`location`|`number`||The location at which to place the guide relative to the current ruler zero point.|
|`[label]`|`string`||The label of the guide. _(Optional)_|
|`[preset]`|`number`||A customized set of properties (see source). _(Optional)_|

---

## alignTextToBottom(_item_) ⇒ _item_

Sets a given text frame's vertical justification preference to align to bottom. Returns the text frame object.

**Parameters:**

|Name|Type|Description|
|:--:|:--:|--|
|`item`|`textFrame`|The text frame.|

---

## fitTo(_items, [scope], [target], [forced]_)

Reframes the given items to the page/spread's _(scope)_ size/margins/visible area/bleed _(target)_. If an item is larger than the target, it will be reduced; if it is smaller but inside a 1% 'snap' area, it will be enlarged. Rectangular frames are simply reframed; rotated items, ovals, groups, etc. are inserted in a clipping frame that is reframed.

**Note:** 'Visible area' is an area marked by one or more frames named `<visible area>` or labeled `visible area`. If margins or visible area are undefined, they fallback to page/spread size.

**Parameters:**

|Name|Type|Default|Description|
|:--:|:--:|:--:|--|
|`items`|`pageItem` \| `pageItem[]`||A page item, or an array of page items to be reframed.|
|`[scope]`|`string`|`page`|`page` or `spread`. _(Optional)_|
|`[target]`|`string`|`size`|`size`, `margins`, `visible` or `bleed`. _(Optional)_|
|`[forced]`|`boolean`|`false`|When `true` it just reframes the object without any checks. _(Optional)_|

**Example:**

```js
fitTo(doc.selection, 'page', 'bleed'); // Fits the selected objects to the page bleed
```

or

```js
app.doScript(
    "fitTo(doc.selection, 'page', 'bleed')",
    ScriptLanguage.JAVASCRIPT, undefined,
    UndoModes.ENTIRE_SCRIPT, 'Fit to page bleed'
);
```

## getBounds(_page_) ⇒ \{Object\}

Computes miscellaneous page boxes of a document page.

**Parameters:**

|Name|Type|Description|
|:--:|:--:|--|
|`page`|`object`|The target page.|

**Returns:**

An object containing the geometric bounds of `page` and its parent spread, and of their margins, visible/safety area and bleed, using the current measurement units:

```js
{
    page: {
        size:    [ t, l, b, r ], // page bounds
        margins: [ t, l, b, r ], // margins bounds
        visible: [ t, l, b, r ], // visible area bounds
        safety:  [ t, l, b, r ], // safety area bounds
        bleed:   [ t, l, b, r ]  // bleed bounds
    },
    spread: { // the same, but for the parent spread
        size:    [ t, l, b, r ],
        margins: [ t, l, b, r ],
        visible: [ t, l, b, r ],
        safety:  [ t, l, b, r ],
        bleed:   [ t, l, b, r ]
    }
};
```

**Note:** 'visible' and 'safety' are areas marked by one or more frames named `<visible area>` or `<safety area>` (or labeled `visible area` or `safety area`). If margins or visible/safety areas are undefined, they fallback to page/spread size.

**Example:**

```js
var pageSize      = getBounds(page).page.size;      // [ 0, 0, 297, 210 ]
var spreadMargins = getBounds(page).spread.margins; // [ 20, 20, 277, 400 ] (20 mm margins)
```

or

```js
var bounds = getBounds(page);
var scope  = 'spread';
var target = 'margins';

bounds.page.size;      // [ 0, 0, 297, 210 ]
bounds.spread.margins; // [ 20, 20, 277, 400 ]
bounds[scope][target]; // [ 20, 20, 277, 400 ]
```

---

## getFilesRecursively(_folder, [subfolders], [extension]_) ⇒ \{Array\}

Recursively get files from a folder and its subfolders.

**Parameters:**

|Name|Type|Default|Description|
|:--:|:--:|:--:|--|
|`folder`|`Folder`||The source folder (object).|
|`[subfolders]`|`boolean`|`false`|If `true`, include subfolders. _(Optional)_|
|`[extension]`|`string`|`any`|Extension to include; if undefined, will match any extension. You can combine multiple extensions with regex OR, i.e. `indd\|tif\|txt` _(Optional)_|

**Returns:**

An array of found folders (as objects).

**Example:**

```js
var files = getFilesRecursively(folder, true, 'indd');
for (var i = 0; i < files.length; i++) {
    // Do something with each file
}
```

Author: [William Campbell](https://community.adobe.com/t5/user/viewprofilepage/user-id/8505462) | 
[Source](https://community.adobe.com/t5/indesign-discussions/get-indd-files-from-folder-and-its-subfolders/m-p/12621330#M459355)

---

## getDropShadow(_item_) ⇒ \{Object\}

Gets a page item's drop shadow properties.

**Parameters:**

|Name|Type|Description|
|:--:|:--:|--|
|`item`|`pageItem`|The page item from which we take the properties.|

**Returns:**

The page item's drop shadow properties (`item.transparencySettings.dropShadowSettings`).

## setDropShadow(_item, set_)

Sets a page item's drop shadow properties from a set saved with `getDropShadow()`.

**Parameters:**

|Name|Type|Description|
|:--:|:--:|--|
|`item`|`pageItem`|The page item to which we apply properties.|
|`set`|`object`|A previously saved `transparencySettings.dropShadowSettings` properties set.|

**Example:**

```js
var shadow = getDropShadow(item1);
setDropShadow(item2, shadow);
```

---

## getPageItems(_name, [target], [layer]_) ⇒ \{Array\} of \{PageItems\} | false

Gets all page items with a specified name from a target (optional) and a layer (optional).

**Parameters:**

|Name|Type|Default|Description|
|:--:|:--:|:--:|--|
|`name`|`string`||The name of the page item to search for. `<*>` matches all items.|
|`[target]`|`object`|`app.activeDocument`|A container for page items. _(Optional)_|
|`[layer]`|`layer`||Look only for objects from this layer. _(Optional)_|

**Returns:**

An array of page items with the specified `name` (or all items) from the `target`, optionally on the specified `layer`, or `false` if nothing was found. If `target` is undefined, it fallbacks to the active document; if `layer` is undefined, it fallbacks to all layers.

**Example:**

```js
items = getPageItems('<EAN>'); // all items named '<EAN>' from the document
items = getPageItems('<EAN>', app.activeDocument.spreads[i]); // just from the spread `i`
items = getPageItems('<*>', app.activeDocument.spreads[i], 'codes'); // all items from spread `i` and layer 'codes'
```

## getTextFrames(_name, [target], [layer]_) ⇒ \{Array\} of \{TextFrames\} | false

Gets all text frames with a specified name from a target (optional) and a layer (optional).

**Parameters:**

|Name|Type|Default|Description|
|:--:|:--:|:--:|--|
|`name`|`string`||The name of the text frame to search for. `<*>` matches all items.|
|`[target]`|`object`|`app.activeDocument`|A container for text frames. _(Optional)_|
|`[layer]`|`layer`||Look only for objects from this layer. _(Optional)_|

**Returns:**

An array of text frames with the specified `name` (or all items) from the `target`, optionally on the specified `layer`, or `false` if nothing was found. If `target` is undefined, it fallbacks to the active document; if `layer` is undefined, it fallbacks to all layers.

**Example:**

```js
items = getTextFrames('<HL>'); // all text frames named '<HL>' from the document
items = getTextFrames('<HL>', app.activeDocument.spreads[i]); // just from the spread `i`
items = getTextFrames('<HL>', undefined, 'text & logos'); // just from layer 'text & logos'
items = getTextFrames('<HL>', app.activeDocument.spreads[i], 'text & logos'); // all text frames from spread `i` and layer 'text & logos'
```

---

## getScriptsFolder() ⇒ 'path/to/folder/' | undefined

Detects the user scripts folder searching for the string `Scripts Panel` in `$.includePath`, returning a string with the path followed by `/`, or `undefined`.

**Example:**

```js
$.evalFile(File(getScriptsFolder() + 'script.jsxinc'));
```

---

## isInArray(_searchValue, array, [isCaseSensitive]_) ⇒ \{Boolean\}

Matches a string against elements of an array, using wildcards.

**Parameters:**

|Name|Type|Default|Description|
|:--:|:--:|:--:|--|
|`searchValue`|`string`||The string to be matched.|
|`array`|`array`||An array of strings with optional wildcards: `*` (zero or more characters), `?` (any character).|
|`[isCaseSensitive]`|`boolean`|`false`|If `true` the search is case sensitive. _(Optional)_|

**Returns:**

Returns `true` for match, `false` for no match.

**Example:**

```js
var searchValue = 'codes';
var array = [ 'bar*code*', 'code*', 'EAN*' ];
isInArray(searchValue, array) // True: matches 2nd array element
```

---

## log(_[directive]_, _message_)

Appends a debugging line to a file saved on the desktop with the name of the running script (e.g., `active-script.log`), containing a timestamp, a stack trace, and a message.

**Parameters:**

|Name|Type|Description|
|:--:|:--:|--|
|`[directive]`|`char`|See description below.|
|`message`|`string`|A comma separated list of messages (`part1`, `part2`, `part3`, etc.) that will be displayed after a timestamp and the stack trace.|

Without arguments it just appends an empty line.

The first argument can also be a directive:
- `''` (empty string): appends `message` to the previous line, without separator;
- `+`: appends `message` to the previous line, with separator;
- `!` and `?`: starts a stopwatch or displays elapsed time (note: this is a simple, global timer);
- `[` and `]`: marks the start/end of a block.

**Example:**

```js
log('Data file: ' + decodeURI(dataFile.name));
// <snip>
log('+', 'Records: ' + data.length, 'Layouts: ' + layouts.length);
```

```
2021-07-31 18:48:02.609 parseDataFile:: | Data file: test.tsv | Records: 14 | Layouts: 2
└─────────────────────┘ └─────────────┘   └─────────────────┘   └─────────┘   └────────┘
       timestamp             stack            message part1        part2         part3
```

---

## moveToLayer(_item, layer, [position]_)

Moves an item to another layer, optionally sending it to the front or back.

**Parameters:**

|Name|Type|Description|
|:--:|:--:|--|
|`item`|`pageItem`|The page item to be moved.|
|`layer`|`object`|The target layer.|
|`[position]`|`string`|`front`/`top` or `back`/`bottom`: Sends the item to the front or back of its layer. _(Optional)_|

---

## naturalSorter(_str1, str2_) ⇒ \{Boolean\}

Used as a user-supplied function to `[].sort()`; it sorts a string array to a natural order, e.g.,

```
123asd
19asd
12345asd
asd123
asd12
```

turns into

```
19asd
123asd
12345asd
asd12
asd123
```

**Example:**

```js
sortedArray = array.sort(naturalSorter);
```

Author: [kennebec](https://stackoverflow.com/users/80860/kennebec) | [Source](https://stackoverflow.com/questions/2802341/javascript-natural-sort-of-alphanumerical-strings/2802804#2802804)

---

## parseDataFile(_dataFile_) ⇒ \{Object\}

Reads a TSV (tab-separated-values) file.

**Parameters:**

|Name|Type|Default|Description|
|:--:|:--:|:--:|--|
|`dataFile`|`File`||A tab-separated-values file (object).|
|`[defaultName]`|`string`\|`string[]`||The default data file name, or an array of file names (used by `@defaults`).|

These data files are regular TSVs with several non-standard features:

- Blank lines are ignored; everything after a `#` is ignored (comments);
- The fields can be visually aligned with spaces that will be ignored at processing (I use [VS Code](https://code.visualstudio.com) with [Rainbow CSV](https://marketplace.visualstudio.com/items?itemName=mechatroner.rainbow-csv) when creating/editing TSVs);
- A very long line can be broken into multiple lines with a backslash (`\`) added at the end of each segment.
- A line may also be a directive:
  - **`@includepath`** `reference/path/` – sets a reference path for subsequent **`@include`** directives with relative paths; it may be absolute or relative (if relative, it's always to the data file folder);
  - **`@include`** `path/to/another.tsv` – includes another TSV file at this position; the path may be absolute or relative (if relative and a `reference/path/` was not already defined, it also defaults to the data file folder);
  - **`@defaults`** – includes the global data file.

**Returns:**

An object containing the records found (strings) and parsing errors, built from the main file plus all included files, structured as follows:

```js
{
    header: [],
    data: [
        { record: [], source: [] },
        ...
    ],
    errors: []
}
```

**Example:**

```js
var file, d;
var parsed = { header: [], data: [], errors: [] };
var data = { records: [], status: { info: [], warn: [], error: [] } };

if (!(file = getDataFile('data.tsv'))) { alert('No data file found.'); exit(); }

// Get raw data from TSV
parsed = parseDataFile(file, 'default.tsv');
if (parsed.errors.length > 0) { report(parsed.errors, title); exit(); }

// Build structured data
for (var i = 0; i < parsed.data.length; i++) {
    if ((d = checkRecord(parsed.data[i].record))) data.records.push(d);
}
if (data.status.error.length > 0) { report(data.status.error, title); exit(); }

// Main processing
for (var i = 0; i < data.records.length; i++) {
    // Do something with data.records[i]
}

function checkRecord(/*array*/record) {
    var tmpData = {};
    tmpData.source = parsed.data[i].source.join(':');
    tmpData.name = record[0];
    tmpData.color = record[1] ? getUIColor(record[1]) : UIColors.LIGHT_BLUE;
    tmpData.isVisible = record[2] ? (record[2].toLowerCase() === 'yes') : true;
    tmpData.isPrintable = record[3] ? (record[3].toLowerCase() === 'yes') : true;

    if (tmpData.name.length === 0) stat(data.status, tmpData.source + ':1', 'Missing layer name.', -1);
    // ...
    if (data.status.error.length > 0) return false;
    return tmpData;
}

```

Given a file `data.tsv`:

```csv
Name        Color         Visible    Printable
dielines    Magenta       no         yes
# guides    Grid Green    yes        no
artwork     Light Blue    yes        yes
            Red           yes        yes
@include path/to/another.tsv
```

and `another.tsv`:

```csv
Name        Color         Visible    Printable
.reference  Black         no         no
@include path/to/missing.tsv
```

it will return an object like this:

```js
{
    header: [ "Name", "Color", "Visible", "Printable" ],
    data: [
        {
            record: [ "dielines", "Magenta", "no", "yes" ],
            source: [ "data.tsv", 2 ]
        },
            record: [ "artwork", "Light Blue", "yes", "yes" ],
            source: [ "data.tsv", 4 ]
        },
            record: [ "", "Red", "yes", "yes" ],
            source: [ "data.tsv", 5 ]
        },
            record: [ ".reference", "Black", "no", "no" ],
            source: [ "path/to/another.tsv", 2 ]
        }
    ],
    errors: [ "path/to/another.tsv:3 :: [ERROR] File 'path/to/missing.tsv' is not found." ]
}
```

See, for example, `DefaultSwatches.jsx` for an actual implementation.

There are some additional functions in this file, one being:

### getDataFile(_file, [skipLocal]_) ⇒ \{File\} | undefined

Gets the first occurrence of a file from a list of predefined folders.

**Parameters:**

|Name|Type|Default|Description|
|:--:|:--:|:--:|--|
|`file`|`string`||A file name.|
|`[skipLocal]`|`boolean`|false|If `true`, don't search locally. _(Optional)_|

**Returns:**

The first occurrence of `file`, first searching for a _local_ one (in the current folder or the parent folder of the active document), then a _default_ one (on the desktop or next to the running script). It also matches local files starting with `_`, which take precedence:

- Local file:

  1. `current/folder/_dataFile.tsv`
  2. `current/folder/dataFile.tsv`
  3. `current/folder/../_dataFile.tsv`
  4. `current/folder/../dataFile.tsv`

- Default file:

  5. `~/Desktop/dataFile.tsv`
  6. `script/folder/dataFile.tsv`
  7. `script/folder/../dataFile.tsv`

---

## progressBar

Creates a palette with two progress bars and a message; the second bar may be used for microsteps (optional).

### var pb = new ProgressBar(_title, maxValue, [maxWidth]_)

Initializes the palette. On creation you can set `maxWidth` to accomodate a given message length; if omitted, no message is shown (aka _mini mode_). The secondary progress bar is hidden by default.

**Parameters:**

|Name|Type|Description|
|:--:|:--:|--|
|`title`|`string`|The palette title.|
|`maxValue`|`number`|The number of steps for the main progress bar.|
|`[maxWidth]`|`number`|Maximum message length in characters. If omitted, no message is shown (mini mode). _(Optional)_|

### pb.msg(_[message]_) *(Optional)*

Updates the message. If omitted, the previous message is cleared.

**Parameters:**

|Name|Type|Description|
|:--:|:--:|--|
|`[message]`|`string`|The message. _(Optional)_|

### pb.update()

Increases the value of the main progress bar and updates the counter (not shown in _mini mode_). Also resets & hides the secondary progress bar.

### pb.init2(_maxValue2_) *(Optional)*

Sets the number of steps for the secondary progress bar (shown only if the number is greater than 2).

**Parameters:**

|Name|Type|Description|
|:--:|:--:|--|
|`maxValue2`|`number`|The number of steps for the secondary progress bar.|

### pb.update2() *(Optional)*

Increases the value of the secondary progress bar.

### pb.close()

Closes the progress bar.

**Example:**

**Mini progress bar:**

```js
var steps = 100;
var progressBar = new ProgressBar('Mini progress bar demo', steps);
for (var i = 0; i < steps; i++) {
    progressBar.update();
    if (i === 24) $.sleep(2500);
}
progressBar.close();
```

![](../docs/img/lib/progress-bar-mini.png)

**Simple progress bar:**

```js
var steps = 100;
var progressBar = new ProgressBar('Progress bar demo', steps, 50);
for (var i = 0; i < steps; i++) {
    progressBar.update();
    progressBar.msg('Progress bar value is ' + (i + 1) + '.');
    if (i === 24) $.sleep(2500);
}
progressBar.close();
```

![](../docs/img/lib/progress-bar.png)

**Dual progress bars:**

```js
var steps = 100;
var steps2 = 10;
var progressBar = new ProgressBar('Dual progress bar demo', steps, 50);
for (var i = 0; i < steps; i++) {
    progressBar.update();
    progressBar.init2(steps2);
    for (var j = 0; j < steps2; j++) {
        progressBar.update2();
        progressBar.msg('Main value is ' + (i + 1) + '. Secondary value is ' + (j + 1) + '/' + steps2 + '.');
        if (i === 24 && j === 5) $.sleep(2500);
    }
}
progressBar.close();
```

![](../docs/img/lib/progress-bar-dual.png)

---

## replaceLink(_oldLinks, newLink_) ⇒ \{Boolean\}

Replaces a link or a list of links with a new one. A selection limits the scope.

**Parameters:**

|Name|Type|Description|
|:--:|:--:|--|
|`oldLinks`|`string` \| `string[]`|A link name, or an array of link names to be replaced.|
|`newLink`|`string`|The new link full path (of just the name if it's in the same folder).|

**Returns:**

Returns `true` if a replacement was made, `false` if not.

**Example:**

```js
replaceLink('link1.jpg', 'link1.psd'); // Both links are in the same folder
replaceLink('link1.jpg', 'path/to/link1.psd');
replaceLink([ 'link1.jpg', 'link1.png' ], 'link1.psd');
```

---

## replaceSwatch(_oldNames, newName, \[CMYKvalues\]_) ⇒ \{Boolean\}

Replaces a swatch or a list of swatches with a new one. The new swatch is created only if values (CMYK) are provided and it doesn't already exist.

**Parameters:**

|Name|Type|Description|
|:--:|:--:|--|
|`oldNames`|`string` \| `string[]`|A swatch name, or an array of swatch names to be replaced.|
|`newName`|`string`|The new swatch name.|
|`[CMYKvalues]`|`number[]`|Array of 4 values in 0-100 range (CMYK).|

**Returns:**

Returns `true` if a replacement was made, `false` if not.

**Example:**

```js
replaceSwatch('Red', 'Blue'); // 'Blue' it's supposed to exist
replaceSwatch('Red', 'Blue', [ 100, 70, 0, 0 ]); // 'Blue' will be created if it doesn't exist
replaceSwatch([ 'Red', 'C=0 M=100 Y=100 K=0' ], 'Blue', [ 100, 70, 0, 0 ]);
```

---

## replaceText(_findWhat, changeTo, [caseSensitive], [wholeWord], [target]_) ⇒ \{Number\}

Replaces a text with a new one.

**Parameters:**

|Name|Type|Default|Description|
|:--:|:--:|:--:|--|
|`findWhat`|`string`||The text to be replaced. Unicode characters must be escaped.|
|`changeTo`|`string`||The new text.|
|`[caseSensitive]`|`boolean`|`true`|Case sensitive match. _(Optional)_|
|`[wholeWord]`|`boolean`|`true`|Match whole words. _(Optional)_|
|`[target]`|`object`|`app.activeDocument`|A target for the `changeText()` method. _(Optional)_|

**Returns:**

Returns the number of replacements.

**Example:**

```js
replaceText('11.10.', '13.12.2021');
replaceText('\\\\', '\u000A', false, false);
replaceText(TXT.EN.HL, TXT.LOC[i].HL, false, true, app.activeDocument.spreads[i]);
```

---

## report(_message, title, [showFilter], [showCompact]_)

Displays a message in a scrollable list with optional filtering and/or compact mode.
Inspired by [this](http://web.archive.org/web/20100807190517/http://forums.adobe.com/message/2869250#2869250) snippet by Peter Kahrel.

**Parameters:**

|Name|Type|Default|Description|
|:--:|:--:|:--:|--|
|`message`|`string` \| `string[]`||The message to be displayed. Can be a string or a strings array.|
|`[title]`|`string`|`''`|The dialog title. _(Optional)_|
|`[showFilter]`|`boolean` \| `'auto'`|`false`|If `true` it shows a filtering field; `auto` shows it automatically if there are more than 20 lines. Optional wildcards: `?` (any character), space and `*` (AND), `\|` (OR). _(Optional)_|
|`[showCompact]`|`boolean`|`false`|If `true` duplicates are removed and the message is sorted. _(Optional)_|

**Example:**

```js
report(message, 'Sample alert');
```

![Standard alert](../docs/img/lib/report.png)

```js
report(message, 'Sample alert', true);
```

![Alert with filter](../docs/img/lib/report-filter.png)

---

## saveLayersState() / restoreLayersState()

Saves/restores some properties ('locked', 'printable', 'visible') of all layers in the active document, using a `layersState` array.

---

## truncateString(_str_) ⇒ _str_

Truncates a string to a certain length, preserving it's end and replacing the first part with an ellipsis.

**Parameters:**

|Name|Type|Description|
|:--:|:--:|--|
|`str`|`string`|The string.|
|`length`|`number`|The desired length.|

---

## unique(_array_) ⇒ _array_

Returns an array containing only the unique elements of the original array.

Author: [Marc Autret](https://www.indiscripts.com) | [Source](http://indisnip.wordpress.com/2010/08/24/findchange-missing-font-with-scripting/)
