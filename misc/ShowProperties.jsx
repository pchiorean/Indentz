/*
	Show properties 2.1.6 (2021-09-14)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Shows properties and methods of the selected object/active document/the application.

	Inspired by:
	https://github.com/grefel/indesignjs/blob/version2/Allgemeine_Skripte/EigenschaftenAnzeigen.jsx
	https://github.com/basiljs/basil.js/blob/master/src/includes/environment.js

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

var target = app;
if (app.documents.length > 0) target = app.documents[0];
if (app.documents.length > 0 && app.selection.length > 0) target = app.selection[0];
// if (target === app) if (!(confirm('Will show properties of the application, proceed?', false))) exit();

var methods;
var propsList = [];

// Properties
Inspect(target);
// Methods
propsList.push('\nMETHODS:');
methods = target.reflect.methods.sort();
for (var i = 0, n = methods.length; i < n; i++) {
	if (methods[i].toString() === '==' || methods[i].toString() === '===') continue;
	propsList.push(methods[i].name + '() (Method)');
}
report(propsList, target.reflect.name + ' | ' + target.toSource(), true);

function Inspect(obj, prefix, level, maxLevel) {
	var val, str;
	var props = obj.reflect.properties.sort();
	level = level || 1;
	maxLevel = maxLevel || 3;
	prefix = prefix || '';

	if (level > maxLevel) return;
	for (var i = 0, n = props.length; i < n; i++) {
		if (props[i].toString() === '__proto__' ||
			props[i].toString() === 'properties' ||
			props[i].toString() === 'isValid' ||
			(props[i].toString() === 'length' && obj[props[i]] === 0)
		) continue;
		try {
			val = obj[props[i]];
			str = '';
			if (val == null) continue;
			switch (val.constructor.name) {
				case 'Array':      str = '[ ' + val + ' ] (Array)'; break;
				case 'Boolean':    str = val + ' (Boolean)'; break;
				case 'Color':      str = '[ ' + val.colorValue + " ] '" + val.name + "' (Color)"; break;
				case 'Document':   str = "'" + val.name + "' (Document)"; break;
				case 'Enumerator': str = val + ' (' + (val).toString() + ') (Enumerator)'; break;
				case 'Font':       str = val.name.replace(/\t/g, ' ') + ' (Font)' ; break;
				case 'Layer':      str = "'" + val.name + "' (Layer)"; break;
				case 'Number':     str = val + ' (Number)' ; break;
				case 'Page':       str = val.index + ' (Page)'; break;
				case 'Spread':     str = val.index + ' (Spread)'; break;
				case 'String':     str = "'" + val + "' (String)"; break;
				case 'Swatch':     str = "'" + val.name + "' (Swatch)"; break;
				default: str = '[' + val.constructor.name + ']';
			}
		} catch (e) { str = 'N/A'; }
		propsList.push((level === 1 && propsList.length > 0 ? '\n' : '') + prefix + props[i] + ' = ' + str);
		if (val != null && str !== 'N/A' && val.reflect.properties.length > 1) {
			if (/^parent.*/gi.test(props[i].toString())) continue;
			Inspect(val, prefix + props[i] + '.', level + 1, maxLevel);
		}
	}
}

/**
 * Simple scrollable alert inspired by this snippet by Peter Kahrel:
 * http://web.archive.org/web/20100807190517/http://forums.adobe.com/message/2869250#2869250
 * @param {String|String[]} message - Message to be displayed (string or array)
 * @param {String} title - Dialog title
 * @param {Boolean} [showFilter] - Shows a filtering field; wildcards: '?' (any char), space and '*' (AND), '|' (OR)
 * @param {Boolean} [showCompact] - Sorts message and removes duplicates
 */
function report(message, title, showFilter, showCompact) {
	var search, list;
	var w = new Window('dialog', title);
	// Convert message to array
	if (message.constructor.name !== 'Array') message = message.split(/\r|\n/g);
	if (showCompact && message.length > 1) { // Sort and remove duplicates
		message = message.sort();
		for (var i = 1, l = message[0]; i < message.length; l = message[i], i++) {
			if (l === message[i]) { message.splice(i, 1); i--; }
			if (message[i] === '') { message.splice(i, 1); i--; }
		}
	}
	if (showFilter && message.length > 1) { // Add a filtering field
		search = w.add('edittext { characters: 40, helpTip: "Wildcards: \'?\' (any character), space and \'*\' (AND), \'|\' (OR)" }');
		search.onChanging = function () {
			var str, line, i, n;
			var result = [];
			if (this.text === '') {
				list.text = message.join('\n'); w.text = title; return;
			}
			str = this.text.replace(/[.[\]{+}]/g, '\\$&'); // Pass through '^*()|?'
			str = str.replace(/\?/g, '.'); // '?' -> any character
			if (/[ *]/g.test(str)) str = '(' + str.replace(/ +|\*/g, ').*(') + ')'; // space or '*' -> AND
			str = RegExp(str, 'gi');
			for (i = 0, n = message.length; i < n; i++) {
				line = message[i].toString().replace(/^\s+?/g, '');
				if (str.test(line)) result.push(line.replace(/\r|\n/g, '\u00b6').replace(/\t/g, '\\t'));
			}
			w.text = str + ' | ' + result.length + ' record' + (result.length === 1 ? '' : 's');
			if (result.length > 0) list.text = result.join('\n'); else list.text = '';
		};
	}
	list = w.add('edittext', undefined, message.join('\n'), { multiline: true, scrolling: true, readonly: true });
	list.characters = (function () {
		var width = 50;
		for (var i = 0, n = message.length; i < n; width = Math.max(width, message[i].toString().length), i++);
		return width;
	}());
	list.minimumSize.width  = 600; list.maximumSize.width  = 1024;
	list.minimumSize.height = 100; list.maximumSize.height = 1024;
	w.add('button { text: "Close", properties: { name: "ok" } }');
	w.ok.active = true;
	w.show();
}
