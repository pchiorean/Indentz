## Helper functions

#### dbg([type], [context], message)

Appends a debugging line to a file saved on the desktop with the name of the running script (e.g. `active-script.log`).

```
2021-07-31 18:48:02.609 [INFO] ParseIF :: Open data file: "test.txt" | Records: 14 | Layouts: 0
└─────────────────────┘ └────┘ └────────┘ └────────────────────────┘   └─────────┘   └────────┘
       typestamp         type   context         message part1             part2         part3
```

| Parameters | Type                 | Description |
| ---------- | -------------------- | ----------- |
| [type]     | `string`             | A single character string: <ul> <li>`+` appends `MESSAGE` to the previous line;</li> <li>`I`, `W`, `E`, `F`, `M`, `N`, `T` or space outputs `[INFO]`, `[WARN]`, `[ERR]`, `[FAIL]`, `[MARK]`, `[NOTE]`, `[TODO]` or spacer. (Looks great with [Pragmata Pro Liga](https://fsd.it/shop/fonts/pragmatapro/).)</li> </ul> (Optional.) |
| [context]  | `string`             | A string enclosed in `<` `>`. (Optional.) |
| message    | `string`             | A comma-separated list of message parts (`part1`, `part2`, `part3`, ...). |

If no arguments are given, it just appends an empty line.

###### Example

```js
dbg('i', '<ParseIF>', 'Open data file: \'' + decodeURI(dataFile.name) + '\'');
// <snip>
if (errors.length === 0) dbg('+', 'Records: ' + data.length, 'Layouts: ' + layouts.length);
```

![Sample output](../docs/img/lib/debug.png)

---

#### fitTo(scope, target, [forced])

Reframes the selected objects to the page/spread's size/margins/visible area/bleed. If an object is larger than the target, it will be reduced; if it is smaller but inside a 1% 'snap' area, it will be enlarged. Rectangular frames are simply reframed; rotated objects, ovals, groups, etc. are inserted in a clipping frame that is reframed.

| Parameters | Type      | Default | Description                                                             |
| ---------- | --------- | ------- | ----------------------------------------------------------------------- |
| scope      | `string`  |         | `page` or `spread`.                                                     |
| target     | `string`  |         | `size`, `margins`, `visible` or `bleed`.                                |
| [forced]   | `boolean` | `false` | When `true` it just reframes the object without any checks. (Optional.) |

**Note:** 'Visible area' is an area marked by one or more frames named `<visible area>` or labeled `visible area`.

###### Example

```js
fitTo('page', 'bleed'); // Fits the selected objects to the page bleed
```

or

```js
app.doScript(
    fitTo, ScriptLanguage.JAVASCRIPT,
    [ 'page', 'bleed' ],
    UndoModes.ENTIRE_SCRIPT, 'Fit to page bleed'
);
```

---

#### getBounds(page) ⇒ `object`

| Parameters | Type     | Description      |
| ---------- | -------- | ---------------- |
| page       | `object` | The target page. |

Returns an object containing the geometric bounds of `page`, its parent spread, and miscellaneous page boxes, using the current measurement units:

```js
{
    page: {
        size:    [ top, left, bottom, right ],
        margins: [ t, l, b, r ],
        visible: [ t, l, b, r ] or undefined,
        bleed:   [ t, l, b, r ]
    },
    spread: {
        size:    [ t, l, b, r ],
        margins: [ t, l, b, r ],
        visible: [ t, l, b, r ] or undefined,
        bleed:   [ t, l, b, r ]
    }
};
```

**Note:** 'Visible area' is an area marked by one or more frames named `<visible area>` or labeled `visible area`.

###### Example

```js
var pageSize = getBounds(activePage).page.size;           // [ 0,0,297,210 ]
var spreadMargins = getBounds(activePage).spread.margins; // [ 20,20,277,400 ] (20 mm margins)
```

or

```js
var BOUNDS = getBounds(activePage);

BOUNDS.page.size;      // [ 0,0,297,210 ]
BOUNDS.spread.margins; // [ 20,20,277,400 ] (20 mm margins)
```

or

```js
var BOUNDS = getBounds(page);
var b = {
    size:   BOUNDS[SCOPE].size,
    target: BOUNDS[SCOPE][TARGET],
    vis:    BOUNDS[SCOPE].visible
};
```

---

#### getDataFile(filename, [skipLocal]) ⇒ `File` | `undefined`

Returns the first occurrence of `filename`, first searching for a local one (in the current folder or the parent folder of the active document), then a default one (on the desktop or next to the running script). It also matches files starting with `_`.

| Parameters  | Type      | Default | Description                               |
| ----------- | --------- | ------- | ----------------------------------------- |
| filename    | `string`  |         | The file name.                            |
| [skipLocal] | `boolean` | false   | If `true`, don't search for a local file. |

---

#### getScriptsFolder() ⇒ `'path/to/folder/'` | `undefined`

Detects the user scripts folder searching for the 'Scripts Panel' string in `$.includePath`, returning a string with the path followed by '/', or `undefined`.

###### Example

```js
$.evalFile(File(getScriptsFolder() + 'script.jsxinc'));
```

---

#### isIn(searchValue, array, [caseSensitive]) ⇒ `Boolean`

Matches the string `searchValue` against elements of an `array`, using wildcards and case sensitivity. Returns `true` for match, `false` for no match.

| Parameters      | Type      | Default | Description                                                                         |
| --------------- | --------- | ------- | ----------------------------------------------------------------------------------- |
| searchValue     | `string`  |         | String to be matched.                                                               |
| array           | `array`   |         | An array of strings; wildcards: `*` (zero or more characters), `?` (any character). |
| [caseSensitive] | `boolean` | `false` | If `true` the search is case sensitive. (Optional.)                                 |

###### Example

```js
var searchValue = 'codes';
var array = [ 'bar*code*', 'code*', 'EAN*' ];
isIn(searchValue, array) // Matches 2nd array element
```

---

#### parseInfo(dataFile) ⇒ `object`

Reads a TSV (tab-separated-values) file, returning an object containing found records and errors:

```js
{
    records: [{}],
    errors:  []
};
```

| Parameters | Type   | Description                         |
| ---------- | ------ | ----------------------------------- |
| dataFile   | `File` | Tab-separated-values file (object). |

It ignores blank lines and those prefixed with `#`.

`@path/to/include.txt` includes records from `include.txt`; `@default` includes the default data file (see `getDataFile()`).

###### Example

```js
// @include 'GetDataFile.jsxinc';
// @include 'Report.jsxinc';

var dataFile = getDataFile('data.txt');
if (!dataFile) { alert('No data file found.'); exit(); }
var data = parseInfo(dataFile);
// <snip>
if (data.errors.length > 0) { report(data.errors, decodeURI(dataFile.getRelativeURI(doc.filePath))); exit(); }
if (data.records.length === 0) exit();
```

Given a file `data.txt`:

```
Name        Color         Visible    Printable
dielines    Magenta       no         yes
# guides    Grid Green    yes        no
artwork     Light Blue    yes        yes
bg          Red           yes        yes
```

after validation it will return this object

```js
{
    records: [
        {
            name:        'dielines'
            color:       UIColors.MAGENTA
            isVisible:   false
            isPrintable: true
        },
        {
            name:        'artwork'
            color:       UIColors.LIGHT_BLUE
            isVisible:   true
            isPrintable: true
        },
        {
            name:        'bg'
            color:       UIColors.RED
            isVisible:   true
            isPrintable: true
        }
    ],
    errors: []
}
```
---

#### ProgressBar(title, maxValue, [maxWidth])

Creates a simple progress bar, setting it's width to accomodate a given message length. Initialized with `new ProgressBar(title, maxValue, [maxWidth])`, updated with `update(value, [message])`, closed with `close()`.

| Parameters | Type       | Description                                                                        |
| ---------- | ---------- | ---------------------------------------------------------------------------------- |
| title      | `string`   | Palette title (a counter will be appended).                                        |
| maxValue   | `number`   | Number of steps.                                                                   |
| [maxWidth] | `number`   | Maximum message length (characters); if ommitted, no message is shown (mini mode). |
| value      | `number`   | Updated progress bar value.                                                        |
| [message]  | `string`   | Updated message; if ommitted, the previous message is cleared.                     |
| update     | `function` | `update(value, [message])`: Updates the value and the message.                     |
| close      | `function` | `close()`: Closes the progress bar.                                                |

###### Example

```js
var progress = new ProgressBar('Progress bar demo', 100, 50);
progress.update(25, 'Progress bar value is 25.');
```

![](../docs/img/lib/progress-bar.png)

```js
var progress = new ProgressBar('Progress bar demo', 100);
progress.update(25);
```

![](../docs/img/lib/progress-bar-mini.png)

---

#### replaceLink(oldLinks, newLink) ⇒ `Boolean`

Replaces a link or a list of links with a new one. A selection limits the scope. Returns `true` if a replacement is made, `false` if not.

| Parameters | Type                   | Description                                            |
| ---------- | ---------------------- | ------------------------------------------------------ |
| oldLinks   | `string` \| `string[]` | A link name, or an array of link names to be replaced. |
| newLink    | `string`               | New link name (if same folder), or full link path.     |

###### Example

```js
replaceLink('link1.jpg', 'link1.psd'); // Both links are in the same folder
replaceLink('link1.jpg', 'path/to/link1.psd');
replaceLink([ 'link1.jpg', 'link1.png' ], 'link1.psd');
```

---

#### replaceSwatch(oldNames, newName, [newValues])

Replaces a swatch or a list of swatches with a different one. The new swatch is created only if values (CMYK) are provided and it doesn't already exist.

| Parameters  | Type                   | Description                                                |
| ----------- | ---------------------- | ---------------------------------------------------------- |
| oldNames    | `string` \| `string[]` | A swatch name, or an array of swatch names to be replaced. |
| newName     | `string`               | New swatch name.                                           |
| [newValues] | `number[]`             | Array of 4 values in 0-100 range (CMYK).                   |

###### Example

```js
replaceSwatch('Red', 'Blue'); // 'Blue' it's supposed to exist
replaceSwatch('Red', 'Blue', [ 100, 70, 0, 0 ]); // 'Blue' will be created if it doesn't exist
replaceSwatch([ 'Red', 'C=0 M=100 Y=100 K=0' ], 'Blue', [ 100, 70, 0, 0 ]);
```
---

#### replaceText(findWhat, changeTo, [wholeWord]) ⇒ `Boolean`

Replaces a text with another. Unicode characters must be escaped. Returns `true` if a replacement is made, `false` if not.

| Parameters  | Type      | Default | Description                    |
| ----------- | --------- | ------- | ------------------------------ |
| findWhat    | `string`  |         | Text to be replaced.           |
| changeTo    | `string`  |         | New text.                      |
| [wholeWord] | `boolean` | `true`  | Match whole words. (Optional.) |

###### Example

```js
replaceText('11.10.', '13.12.2021');
replaceText('\\\\', '\u000A', false); // Replace '\\' with Forced Line Break
```

---

#### report(message, title, [showFilter], [showCompact])

Displays a message in a scrollable list with optional filtering and/or compact mode.
Inspired by [this](http://web.archive.org/web/20100807190517/http://forums.adobe.com/message/2869250#2869250) snippet by Peter Kahrel.

| Parameters    | Type                   | Default | Description |
| ------------- | ---------------------- | ------- | ----------- |
| message       | `string` \| `string[]` |         | Message to be displayed. Can be a string or a strings array. |
| [title]       | `string`               | `''`    | Dialog title. (Optional.) |
| [showFilter]  | `boolean`              | `false` | If `true` it shows a filtering field; wildcards: `?` (any character), space and `*` (AND), `|` (OR). (Optional.) |
| [showCompact] | `boolean`              | `false` | If `true` duplicates are removed and the message is sorted. (Optional.) |

###### Example

```js
report(message, 'Sample alert');
```

![Standard alert](../docs/img/lib/report.png)

```js
report(message, 'Sample alert', true);
```

![Alert with filter](../docs/img/lib/report-filter.png)
