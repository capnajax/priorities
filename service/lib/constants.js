
const
	sanitizeHtml = require('sanitize-html'),
	_ = require('lodash'),

	fc = { // fc == fundamental constants
		NOTES_HTML 	: {
			allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'span' ]),
			allowedAttributes: false,
			allowedStyles: false
		},

		TASKLEVELS: {
			100 : {	item: 'project',
					list: 'projects',
					children: [200, 300]
				  },
			200 : {	item: 'epic',
					list: 'epics',
					children: [300]
				  },
			300 : {	item: 'task',
					list: 'tasks',
					children: [400]
				  },
			400 : {	item: 'subtask',
					list: 'subtasks',
					children: []
				  }
		},

		TASKLEVEL_PROJECT	: 100,
		TASKLEVEL_EPIC		: 200,
		TASKLEVEL_TASK 		: 300,
		TASKLEVEL_SUBTASK 	: 400

	};
	
var dc = { // derived constants
	};

dc.TASKLEVEL_MAX = Math.max(_.keys(fc.TASKLEVELS));

module.exports = Object.freeze(_.extend({}, fc, dc));