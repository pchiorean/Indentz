/*
    Page size from page margins v1.0.2
    © April 2020, Paul Chiorean
    This script sets the page size to the page margins.
*/

var doc = app.activeDocument;
app.scriptPreferences.measurementUnit = MeasurementUnits.MILLIMETERS;
doc.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.MILLIMETERS;
doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.MILLIMETERS;
app.generalPreferences.objectsMoveWithPage = false;
doc.adjustLayoutPreferences.enableAdjustLayout = false;
doc.adjustLayoutPreferences.enableAutoAdjustMargins = false;

// Save setting and set ruler origin to spread
var ro = doc.viewPreferences.rulerOrigin;
doc.viewPreferences.rulerOrigin = RulerOrigin.PAGE_ORIGIN;

for (var i = 0; i < doc.pages.length; i++) {
    var page = doc.pages[i];
    var pageMargins = page.marginPreferences; // Save original margins
    if (pageMargins.top + pageMargins.left + pageMargins.bottom + pageMargins.right != 0) {
        // Reverse left and right margins if left-hand page
        if (page.side == PageSideOptions.LEFT_HAND) {
            var m_x1 = page.bounds[1] + pageMargins.right;
            var m_x2 = page.bounds[3] - pageMargins.left;
        } else {
            var m_x1 = page.bounds[1] + pageMargins.left;
            var m_x2 = page.bounds[3] - pageMargins.right;
        }
        var m_y1 = page.bounds[0] + pageMargins.top;
        var m_y2 = page.bounds[2] - pageMargins.bottom;
        var pageTL = [m_x1 / 0.352777777777778, m_y1 / 0.352777777777778];
        var pageBR = [m_x2 / 0.352777777777778, m_y2 / 0.352777777777778];
        page.layoutRule = LayoutRuleOptions.OFF;
        page.reframe(CoordinateSpaces.PAGE_COORDINATES, [pageTL, pageBR]);
        // Restore original margins
        try { page.marginPreferences.properties = pageMargins } catch (e) {}; // ***TODO***
    }
}

// Also set document size
if (doc.pages.length == 1) {
    var pageSize = { width: (m_x2 - m_x1), height: (m_y2 - m_y1) };
    doc.documentPreferences.pageWidth = pageSize.width;
    doc.documentPreferences.pageHeight = pageSize.height;
}

// Restore ruler origin setting
doc.viewPreferences.rulerOrigin = ro;