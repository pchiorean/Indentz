if (!(doc = app.activeDocument)) exit();

// @include '../lib/FitTo.jsxinc';
// @include '../lib/MoveToLayer.jsxinc';

app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined,
	UndoModes.ENTIRE_SCRIPT, 'HW');

function main() {
	var page, pages, item, items, frm, frms, grp, grps, lnk, lnks;
	var visAreaRE = /^<?(visible|safe) area>?$/i;
	var hwLayerName = 'HW';
	var hwLayer = doc.layers.item(hwLayerName);
	var HW_PCT = 10; // HW size in percent of visible area
	var HW_RE = {
		txt: /(^rauchen (f\u00FCgt ihnen|(ist|kann) t\u00F6dlich))|(^dieses produkt enth\u00E4lt nikotin)/ig,
		lnk: /^hw_|hw_(pos|neg)/ig
	};
	app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;

	// Add HW layer
	if (!hwLayer.isValid) {
		doc.layers.add({ name: hwLayerName, layerColor: UIColors.LIGHT_GRAY });
		hwLayer.move(LocationOptions.AT_BEGINNING);
	}
	hwLayer.locked = false;
	doc.activeLayer = hwLayer;

	// Processing
	if (doc.selection.length > 0) {
		// Selected items
		items = doc.selection;
		while ((item = items.shift())) {
			processItem(item);
			if (item.parentPage) addGuide(item.parentPage);
		}
	} else {
		// All items/pages
		pages = doc.pages.everyItem().getElements();
		while ((page = pages.shift())) addGuide(page);
		// -- Labeled items
		items = doc.pageItems.everyItem().getElements();
		while ((item = items.shift())) if (/\bhw\b/gi.test(item.label)) processItem(item);
		// -- Text frames
		frms = doc.textFrames.everyItem().getElements();
		while ((frm = frms.shift())) if (HW_RE.txt.test(frm.contents)) processItem(frm);
		// -- Text frames in groups
		grps = doc.groups.everyItem().getElements();
		while ((grp = grps.shift())) {
			frms = grp.allPageItems;
			while ((frm = frms.shift())) {
				if (frm.constructor.name !== 'TextFrame') continue;
				if (HW_RE.txt.test(frm.contents)) { processItem(frm); break; }
			}
		}
		// -- Links
		lnks = doc.links.everyItem().getElements();
		while ((lnk = lnks.shift())) {
			if (HW_RE.lnk.test(lnk.name)) {
				frm = lnk.parent.parent;
				processItem(frm);
				frm.fit(FitOptions.CENTER_CONTENT);
			}
		}
		app.select(null);
	}

	function addGuide(page) {
		var top, bottom, frame, frames, guide, guides;
		top = page.bounds[0];
		bottom = page.bounds[2];
		frames = page/*.parent*/.pageItems.everyItem().getElements();
		// Look for a visible area and compensate
		while ((frame = frames.shift())) {
			if (visAreaRE.test(frame.label) || visAreaRE.test(frame.name)) {
				top = frame.geometricBounds[0];
				bottom = frame.geometricBounds[2];
				break;
			}
		}
		// Remove old HW guides and add new
		guides = page.guides.everyItem().getElements();
		while ((guide = guides.shift())) if (/hw/gi.test(guide.label)) guide.remove();
		page.guides.add(undefined, {
			itemLayer:   hwLayer,
			label:       'hw',
			guideColor:  UIColors.GREEN,
			orientation: HorizontalOrVertical.HORIZONTAL,
			location:    (bottom - (bottom - top) * (Number(HW_PCT) / 100))
		});
	}

	function processItem(item) {
		// Add HW label
		if (!/\bhw\b/gi.test(item.label)) item.label += ' hw';
		item.label = item.label.replace(/ +/g, ' ').replace(/^ +| +$/g, '');
		// Move to HW layer
		moveToLayer(item, hwLayerName);
		// If it's graphic, set hi-res rendering; if it's text, set properties and fit
		if (item.constructor.name === 'Rectangle') {
			if (item.graphics[0].isValid)
				item.graphics[0].localDisplaySetting = DisplaySettingOptions.HIGH_QUALITY;
		} else if (item.constructor.name === 'TextFrame') {
			item.fillColor = 'Paper';
			item.paragraphs.everyItem().justification = Justification.CENTER_ALIGN;
			item.textFramePreferences.properties = {
				firstBaselineOffset:          FirstBaseline.CAP_HEIGHT,
				verticalJustification:        VerticalJustification.CENTER_ALIGN,
				autoSizingReferencePoint:     AutoSizingReferenceEnum.CENTER_POINT,
				autoSizingType:               AutoSizingTypeEnum.OFF,
				useNoLineBreaksForAutoSizing: true,
				insetSpacing:                 0
			};
			fitTo(item, 'page', 'visible');
		}
	}
}
