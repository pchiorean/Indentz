/*
    Page size from page margins v1.0.1
    © April 2020, Paul Chiorean
    This script sets the page size to the page margins.
*/

var doc = app.activeDocument;
app.scriptPreferences.measurementUnit = MeasurementUnits.MILLIMETERS;
doc.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.MILLIMETERS;
doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.MILLIMETERS;
doc.adjustLayoutPreferences.enableAdjustLayout = false;
doc.adjustLayoutPreferences.enableAutoAdjustMargins = false;
// app.generalPreferences.objectsMoveWithPage = false;

for (var i = 0; i < doc.pages.length; i++) {
    var page = doc.pages[i];
    var pageMargins = page.marginPreferences;
    if (pageMargins.top + pageMargins.left + pageMargins.bottom + pageMargins.right != 0) {
        // Reverse left and right margins if left-hand page
        if (page.side == PageSideOptions.LEFT_HAND) {
            pageMargins.left = page.marginPreferences.right;
            pageMargins.right = page.marginPreferences.left;
        }
        var m_y1 = (page.bounds[0] + pageMargins.top);
        var m_x1 = (page.bounds[1] + pageMargins.left);
        var m_y2 = (page.bounds[2] - pageMargins.bottom);
        var m_x2 = (page.bounds[3] - pageMargins.right);
        var pageTL = [m_x1 / 0.352777777777778, m_y1 / 0.352777777777778];
        var pageBR = [m_x2 / 0.352777777777778, m_y2 / 0.352777777777778];
        page.layoutRule = LayoutRuleOptions.OFF;
        page.reframe(CoordinateSpaces.INNER_COORDINATES, [pageTL, pageBR]);
        // Set margins to zero
        page.marginPreferences.properties = { top: 0, left: 0, bottom: 0, right: 0 };
    }
}

if (doc.pages.length == 1) {
    // Also set document size
    var pageSize = {
        width: (m_x2 - m_x1),
        height: (m_y2 - m_y1)
    };
    doc.documentPreferences.pageWidth = pageSize.width;
    doc.documentPreferences.pageHeight = pageSize.height;
}