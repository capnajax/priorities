'use strict';

const
	debug = require('debug')('Priorities:Task'),
	_ = require('lodash');

module.exports = function(Task) {

	/**
	 *	Observer to ensure that each note has a sequence number at the time it's created.
	 */
	Task.observe('before save', function updateSequence(ctx, next) {

		// only need to update sequence in this method if we have an instance.
		if (ctx.instance && !ctx.instance.sequence) {
			var filter = {where:{},fields:{sequence:true}};
			if(ctx.instance.epicId) {
				filter.where.epicId = ctx.instance.epicId;
			} else if(ctx.instance.projectId) {
				filter.where.projectId = ctx.instance.projectId;
			}
			Task.find(filter, (err, tasks) => {
				if (err) {
					next(err);
					return;
				}
				var maxSequence = _.max(_.map(tasks, note => {return (task.sequence || 0);}));
				ctx.instance.sequence = maxSequence + 1;
				next();
			});
	  	} else {
	  		next();
	  	}
	});


	Task.subtaskCount = function subtaskCount(_taskId) {

		debug("Task.subtaskCount(", taskId, ") called");

		var subtaskPromises = [],
			taskId = _.isObject(_taskId) ? _taskId.id : _taskId,
			result = {
				complete: 0,
				incomplete: 0,
				total: 0
			};

		subtaskPromises.push();

		return Task.app.models.Subtask.find({where:{taskId}})
			.then(subtasks => {

				debug("subtasks for taskId", taskId, ":");
				debug(subtasks);

				for(let i in subtasks) {
					debug("subtasks[", i, "] == ", subtasks[i]);

					if (subtasks[i].isComplete) {
						result.complete++;
					} else {
						result.incomplete++;
					}
					result.total++
				}

				debug("done tallying subtasks", result);

				return Promise.resolve(result);
			})
			.catch(reason => {
				debug("caught reason", reason);
				return Promise.reject(reason);
			});

	};
};
