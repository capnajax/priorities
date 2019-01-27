'use strict';

const
	debug = require('debug')('Priorities:Task'),
	_ = require('lodash');

module.exports = function(Task) {

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
