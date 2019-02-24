'use strict';

const
	c = require('../../lib/constants'),
	debug = require('debug')('Priorities:Note'),
	sanitizeHtml = require('sanitize-html'),
	_ = require('lodash');

module.exports = function(Note) {

	/**
	 *	Observer to ensure that each note has a sequence number at the time it's created.
	 */
	Note.observe('before save', function updateSequence(ctx, next) {

		// only need to update sequence in this method if we have an instance.
		// console.log(ctx.instance);

		if (ctx.instance && !ctx.instance.sequence) {
			var filter = {where:{},fields:{sequence:true}};
			if (ctx.instance.subtaskId) {
				filter.where.subtaskId = ctx.instance.subtaskId;
			} else if(ctx.instance.taskId) {
				filter.where.taskId = ctx.instance.taskId;
			} else if(ctx.instance.epicId) {
				filter.where.epicId = ctx.instance.epicId;
			} else if(ctx.instance.projectId) {
				filter.where.projectId = ctx.instance.projectId;
			}
			Note.find(filter, (err, notes) => {
				if (err) {
					next(err);
					return;
				}
				var maxSequence = _.max(_.map(notes, note => {return (note.sequence || 0);}));
				ctx.instance.sequence = maxSequence + 1;
				next();
			});
	  	} else {
	  		next();
	  	}
	});

	/**
	 *	Observer to ensure that any HTML provided is safe
	 */
	Note.observe('before save', function sanitizeHtmlAction(ctx, next) {
		debug("html: ", ctx.instance.title);
		ctx.instance.title = sanitizeHtml(ctx.instance.title, c.NOTES_HTML);
		ctx.instance.detail = sanitizeHtml(ctx.instance.detail, c.NOTES_HTML);
		debug(" -->: ", ctx.instance.title);
		next();
	});
};
