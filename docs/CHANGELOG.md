## Changelog

#### [2021-09-21](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-09-21&type=commits)
- `fix` **PrepareForExport** -- Ignore hidden layers
- `upd` **ProgressBar, QRBatch, QuickExport, SpreadsToFiles** -- Center progress bar in parent window
- `doc` Added changelog

#### [2021-09-20](https://github.com/pchiorean/Indentz/search?q=committer-date%3A2021-09-20&type=commits)
- `fix` **Clip, ClipUndo** -- Only clip objects directly on spread
- `fix` **QRBatch** -- Now converted documents are skipped and reported
- `new` Added **OffsetPath** by [Olav Martin Kvern](https://www.siliconpublishing.com/blog/free-indesign-scripts/) to `/misc` (it uses InDesign's text wrap feature to create offset/inset paths)
- `new` Added **FindFile**, **IsIn** to `/lib`; renamed **Relink** to **ReplaceLinks**
- `upd` **Debug** -- Updated description, simplified arguments parsing, updated `trunc/pad` function
- `upd` **HW** -- Also match old `<safe area>` frames as visible area marks
- `upd` **ShowProfiles** -- Profiles are only available with a document opened, so create a temporary one
- `upd` **layers.txt** -- Added new variant 'cutcontour' for 'dielines' layer
- `upd` **swatches.txt** -- Added new variant 'FOLD' for 'Fold' swatch
- `sty` `upd` `fix` Autumn cleaning: added ESLint and refactored many scripts (hopefully, there are no new bugs)

---

`fix` - bug fixes\
`new` - new features or first release\
`upd` - changes in existing functionality\
`brk` - changes in existing functionality that break compatibility\
`del` - removed features\
`ref` - code changes that neither fixes a bug or adds a feature\
`sty` - everything related to styling/formatting\
`doc` - changes in documentation