### What's new in [22.11.10](https://github.com/pchiorean/Indentz/releases/tag/22.11.10)

#### Cleanup
- Added **BreakLinkToStyles:** Unnaplies paragraph/character/object styles from all or selected objects.
- Added **DumpLayers:** Saves a TSV file with the properties of the active document layers (compatible with **DefaultLayers**).
- **DefaultPrefs:** Preferences are now applied in two steps: application/document.
- **DocCleanup:** Reinstated conversion of empty text frames to generic frames, but only when they are not auto-sized.
- Renamed **SwatchesSave** to **DumpSwatches**.

#### Export
- **QuickExport:**
  - Custom bleed is now imported when defined in the PDF preset.
  - Document layers will be restored to initial status after export.
  - Increased maximum bleed value to 152.4 mm.
  - Improved the PDF preset tooltip info.
  - Errors are now reported after running additional scripts.
  - When the PDF preset is set to preserve original resolution the DPI option is now disabled.

#### Misc
- Added **EAN:** Embeds an EAN code in the selected frame or adds it to a new page.
- **QR:**
  - Switched uppercase and white label options.
  - Set label leading to 100%.

#### Other
- Dialogs are centered in the InDesign window.

For other fixes and improvements not mentioned here see the full [changelog](CHANGELOG.md).
