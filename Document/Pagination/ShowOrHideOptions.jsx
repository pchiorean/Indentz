/*
	Show/hide options 25.3.9
	(c) 2025 Paul Chiorean <jpeg@basement.ro>

	Shows or hides option-specific layers.

	Add a colon in the layer name to specify the option, using the format:
	'<layer name>: <option>'. For example, 'copy: de_CH'.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument)) exit();

app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, 'Show/Hide Options');

function main() {
	var layer, option, i, l;
	var optionRE = /^.*:\s*(.+)\s*$/; // Match layers containing ':<option>'
	var optionLayers = {};
	var optionNames = [];
	var optionVisibility = {};

	app.scriptPreferences.enableRedraw = false;

	// Build a list of options
	for (i = 0; i < doc.layers.length; i++) {
		layer = doc.layers[i];
		if (optionRE.test(layer.name)) {
			optionLayers[layer.name.match(optionRE)[1]] = [];
			optionVisibility[layer.name.match(optionRE)[1]] = true;
		}
	}
	for (var key in optionLayers) if (Object.prototype.hasOwnProperty.call(optionLayers, key)) optionNames.push(key);
	if (optionNames.length === 0) exit(); // Exit if no option-specific layers exist

	// Build a list of corresponding layers and get each option's visibility
	for (i = 0; i < doc.layers.length; i++) {
		layer = doc.layers[i];
		if (optionRE.test(layer.name)) {
			option = layer.name.match(optionRE)[1];
			optionLayers[option].push(layer);
			optionVisibility[option] = optionVisibility[option] && layer.visible;
		}
	}

	if (showDialog() !== 1) exit();

	for (i = 0; i < optionNames.length; i++) {
		option = optionNames[i];
		for (l = 0; l < optionLayers[option].length; l++) {
			layer = optionLayers[option][l];
			layer.visible = optionVisibility[option];
		}
	}

	function showDialog() {
		var i;
		var ui = new Window('dialog { orientation: "column", margins: 16, spacing: 10, alignChildren: [ "fill", "top" ] }');
		ui.text = 'Show/Hide Options';

		ui.main = ui.add('panel { orientation: "column", margins: 10, preferredSize: [ 170, -1 ] }');
		ui.main.alignChildren = [ 'fill', 'top' ];

		for (i = 0; i < optionNames.length; i++) {
			ui.main.layout[i] = ui.main.add('group { orientation: "row", preferredSize: [ -1, 24 ] }');
			ui.main.layout[i].cb
				= ui.main.layout[i].add('checkbox { alignment: "bottom", preferredSize: [ 15, -1 ] }');
			ui.main.layout[i].cb.value = optionVisibility[optionNames[i]];
			ui.main.layout[i].label
				= ui.main.layout[i].add('edittext { text: "' + optionNames[i] + '", preferredSize: [ 120, -1 ], properties: { readonly: true } }');
		}

		ui.actions = ui.add('group { orientation: "row", margins: [ -1, 4, -1, -1 ], alignChildren: [ "center", "center" ] }');
		ui.actions.cancel = ui.actions.add('button { text: "Cancel", preferredSize: [ 80, 24 ], properties: { name: "cancel" } }');
		ui.actions.ok = ui.actions.add('button { text: "OK", preferredSize: [ 80, 24 ], properties: { name: "ok" } }');

		// Callbacks
		ui.actions.cancel.onClick = function () { ui.close(false); };
		ui.actions.ok.onClick = function () {
			for (i = 0; i < optionNames.length; i++) optionVisibility[optionNames[i]] = ui.main.layout[i].cb.value;
			ui.close(true);
		};

		ui.onShow = function () {
			// Center in current window
			if (app.windows.length > 0) {
				ui.frameLocation = [
					(app.activeWindow.bounds[1] + app.activeWindow.bounds[3] - ui.frameSize.width) / 2,
					app.activeWindow.bounds[0]
						+ (app.activeWindow.bounds[0] + app.activeWindow.bounds[2] - ui.frameSize.height) / 2
				];
			}
		};

		return ui.show();
	}
}
