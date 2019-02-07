'use strict';

const
	_ = require('lodash');

module.exports = function(Subtask) {

	/**
	 *	Observer to ensure that each subtask has a priority number at the time it's created.
	 */
	Subtask.observe('before save', function setPriority(ctx, next) {
		// only need to update priority in this method if we have an instance.
		if (ctx.instance && !ctx.instance.priority) {
			var filter = {where:{taskId:ctx.instance.taskId},fields:{priority:true}};
			Subtask.find(filter, (err, subtasks) => {
				if (err) {
					next(err);
					return;
				}
				var maxPriorityNum = _.max(_.map(subtasks, subtask => {return (subtask.priority || 0);}));
				ctx.instance.priority = maxPriorityNum + 1;
				next();
			});
	  	} else {
	  		next();
	  	}
	});
};
