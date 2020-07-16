## FitToPage/FitToSpread series

Resize one or more selected objects, without scaling them. Ordinary frames are simply resized. In order not to deform them, rotated objects, ovals, groups, etc. are clipped in a frame and this is resized. If you run the script a second time on such an object, it will restore it.

* **FitToPage/Margins/Bleed** constrain the size of an object to the size of the page, the page margins, or the page bleed.

* **FitToSpread/Margins/Bleed** do the same for pages grouped in a spread.

* **FitToPageBleedForced** and **FitToPageSpreadForced** resize exactly to the page or the spread bleed. They are useful, for example, for the background image.

* **FitUndo**: if you want to restore all objects at once.

## ScaleToPage series

These also work with one or more objects, but scale them proportionally, as a block.

* **ScaleToPageSize** and **ScaleToPageMargins** scale to the page size or page margins.

* The **H** (height) and **W** (width) variants scale to the height or width of the page or page margins.

## PageSize series

Resize the pages of the document based on the file name, page margins, or selected objects.

* **PageSizeFromFilename** searches the file name for pairs of numbers like "000x000" (where "000" means a group of at least one digit, followed or not by decimals, and optionally by "mm" or "cm"). If only one pair is found, it will be the size of the page. If two are found (e.g., "000x000_000x000"), the larger pair will be the page size, the smaller pair the visible/safe area size. If followed by a one- or two-digit sequence, this is considered bleed.

  Examples:
  > VYPE_FR_MentholBan_Sticker_Vitrine_**1400x400_700x137_5**mm.indd \
  > LS_AT_MEXIT_Automateneinleger_**597x517_577x500.5_3**mm V4.indd

* **PageSizeFromMargins** resizes each page to its margins.

* **PageSizeFromSelection** resizes the current page to the selected objects (similar to **Artboards > Fit to Selected Art** in Illustrator).

## PageMarginsFromSelection

Sets the page margins to the selected objects.

## TextAutosize series

Fit the frame to the text and set auto-sizing, vertical justification and paragraph alignment:

* **TextAutosize**: _Auto-Sizing: center. Vertical Justification: center. Paragraph: align center._

* **TextAutosizeL**: _Auto-Sizing: top-left. Vertical Justification: top. Paragraph: align left._

* **TextAutosizeR**: _Auto-Sizing: top-right. Vertical Justification: top. Paragraph: align right._

_Auto-Sizing Type_ will be set to _Height and width_ if the text has only one line. If it has multiple lines, the first run will set it to _Height only_, the second run to _Height and width_ (in which case care must be taken that the text is broken manually).