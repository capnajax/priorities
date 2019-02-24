
const
	sanitizeHtml = require('sanitize-html'),
	_ = require('lodash'),

	fc = { // fc == fundamental constants
		NOTES_HTML 	: {
			allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'span' ]),
			allowedAttributes: false,
			allowedStyles: false
		},

		TASKLEVEL_PROJECT	: 100,
		TASKLEVEL_EPIC		: 200,
		TASKLEVEL_TASK 		: 300,
		TASKLEVEL_SUBTASK 	: 400,

		TASKLEVELS: {
			100: 'project',
			200: 'epic',
			300: 'task',
			400: 'subtask'
		}
	};
	
var dc = {}; // derived constants

dc.TASKLEVEL_MAX = Math.max(_.keys(fc.TASKLEVELS));

module.exports = Object.freeze(_.extend({}, fc, dc));