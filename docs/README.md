I wrote these scripts to help me with small repetitive tasks in InDesign. There are several categories:

## `FitToPage/Spread` series

These resize one or more selected objects, without scaling them. For each object, if its dimensions exceed the dimensions of the page size (`FitToPage`), the page margins (`FitToPageMargins`), or the page bleed (`FitToPageBleed`), it constrains them.

Before | FitToPage | FitToPageMargins | FitToPageBleed
:---: | :---: | :---: | :---:
![Before](img/fittopage-0.png) | ![FitToPage](img/fittopage-1.png) | ![FitToPageBleed](img/fittopage-2.png) | ![FitToPageMargins](img/fittopage-3.png)

* `FitToSpread...` do the same for pages grouped in a spread.

* `FitToPageBleedForced` and `FitToPageSpreadForced` always resize to the page or the spread bleed, regardless of the dimensions of the selected object. They are useful, for example, for the background image.

#### Undo

Ordinary rectangular frames are simply resized. Rotated objects, groups, etc. are encapsulated in a clipping frame and this is resized. If you run the script a second time on such an object, it will restore it. Alternatively, if you want to restore all objects at once, run the `FitUndo` script.

## `ScaleToPage` series

These scripts also work with a selection of one or more objects. Everything that is selected will be scaled proportionally as a group to the page size (`ScaleToPageSize`) or the page margins (`ScaleToPageMargins`).

The `H` (height) and `W` (width) variants scale to the height or width of the page margin/page.

Before | ScaleToPageSizeH | ScaleToPageMarginsH
:---: | :---: | :---:
![Before](img/scaletopage-0.png) | ![FitToPage](img/scaletopage-1.png) | ![FitToPageBleed](img/scaletopage-2.png)

## `PageSize` series

These resize the pages of the document based on the file name, page margins, or selected objects:

* `PageSizeFromFilename` searches the file name for pairs of numbers like `000x000`, where `000` means a group of at least one digit, followed or not by decimals, and optionally by `mm` or` cm`. If only one pair is found, it will be the size of the page. If two are found (e.g. `000x000_000x000`), the larger pair will be the page size, the smaller pair the visible area size. \
If followed by a one- or two-digit sequence, this is considered bleed.

	Example:

		VYPE_FR_MentholBan_Sticker_Vitrine_Phrase_1400x400_700x137_5mm.indd

* `PageSizeFromMargins` resizes each page to its edges.

* `PageSizeFromSelection` resizes the current page to the selected objects (similar to `Fit to Selected Art` in Illustrator).

* `PageMarginsFromSelection` sets the page margins to the selected objects.

## Text autosize

Sometimes, especially when I have short text on a line, I wish I could handle it easier, like in Illustrator. These scripts auto-fit the frame to the text and aligns it to the center (`TextAutosize`), left (`TextAutosizeL`), or right (`TextAutosizeR`). If the text has only one line, will set **Auto-Sizing** to **Height and Width**. If it has multiple lines, the first run will set it to **Height Only**, the second run to **Height and Width** (in which case care must be taken that the text is previously broken manually).

Before | TextAutosizeL (1st) | TextAutosizeL (2nd)
:---: | :---: | :---:
![Înainte](img/textautosize-0.png) | ![FitToPage](img/textautosize-1.png) | ![FitToPageBleed](img/textautosize-2.png)
