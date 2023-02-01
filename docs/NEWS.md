### What's new in [23.2.1](https://github.com/pchiorean/Indentz/releases/tag/23.2.1)

#### Cleanup

- **DefaultPrefs:** Changed **General ‣ Object Editing ‣ When Scaling** to **Apply to Content**.
- **DefaultLayers:** You can now order layers to `top` or `bottom` using these keywords.
- **DocCleanup:** Minor tweaks and fixes.
- **RemoveScriptLabels:** Renamed from **misc/LabelsCleanup**.

#### Export

- **QuickExport:**
  - Preferences will be silently created on first run.
  - Added a fix for queued documents that disappear before the actual export.

#### Layout

- Added **PageMarginsFromScriptName:** Sets the page margins and optionally the HW area (expressed in percentage of the visible/page area), getting the values from the script name. It's designed to be duplicated and renamed to customize the values, using one or two numbers and the keyword `HW`. Example: `MG5HW10.jsx` sets a value of 5% for the margins and 10% for the HW (`HW` can also be used alone, which sets it to 10%, or omitted, which sets it to 0).

#### View

- **ZoomToSelection/Spreads:** When zooming to page include the slug if preview mode is off.
- Added **ZoomTo300Percent:** Zooms the current view to 300%.

#### Misc

- **QR, QRBatch:** Minor tweaks and fixes.

For other changes not mentioned here see the full [changelog](CHANGELOG.md).
