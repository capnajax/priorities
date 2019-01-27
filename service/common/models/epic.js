'use strict';

const
	debug = require('debug')('Priorities:Epic'),
	_ = require('lodash');

module.exports = function(Epic) {

	Epic.taskCount = function taskCount(_epicId, cb) {
		var epicId = _.isObject(_epicId) ? _epicId.id : _epicId,
			result = {
				complete: 0,
				incomplete: 0,
				total: 0
			};

		return Epic.app.models.Task.find({where:{epicId}})
			.then(tasks => { 

				debug(tasks);

				var promises = [];

				for (let i in tasks) {
					debug("Getting subtaskCount for task", tasks[i].id);
					promises.push(
						Epic.app.models.Task.subtaskCount(tasks[i].id)
							.then(count => {
								debug("subtask count for task", tasks[i].taskId, tasks[i].name, '==', count);
								result.complete += count.complete;
								result.incomplete += count.incomplete;
								result.total += count.total;
							})
						);
					debug("task", tasks[i].taskId, tasks[i].name, "isComplete ==", tasks[i].isComplete)
					if (tasks[i].isComplete) {
						result.complete ++;
					} else {
						result.incomplete ++;
					}
					result.total ++;
				}

				return Promise.all(promises)
					.then(() => {
						return Promise.resolve(result);
					})
					.catch(reason => {
						return Promise.reject(reason);
					});
			})
			.catch(reason => {
				return Promise.reject(reason);
			});

	};

};
