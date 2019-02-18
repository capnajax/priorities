'use strict';

const
	c = require('../../lib/constants'),
	debug = require('debug')('Priorities:WorkItem'),
	_ = require('lodash');

module.exports = function(WorkItem) {

	var app = require('../../server/server'),
		importYaml = require('../../lib/import');

	importYaml(app.models);

	WorkItem.observe('before save', function setPriority(ctx, next) {
		// only need to update priority in this method if we have an instance.
		if (ctx.instance && !ctx.instance.priority) {
			var filter = {
				where: {
					parentId: ctx.instance.parentId},
					taskLevel: ctx.instance.taskLevel,
					fields: { priority: true }
				};
			WorkItem.find(filter, (_err, _items) => {
				if (_err) {
					next(err);
					return;
				}
				var maxPriorityNum = _items.length
					? _.max(_.map(_items, subtask => {return (subtask.priority || 0);}))
					: 0;
				ctx.instance.priority = maxPriorityNum + 1;
				next();
			});
	  	} else {
	  		next();
	  	}
	});

	WorkItem.getProjectDetail = function getProjectDetail(projectId, cb) {

		const NOTES = {relation:'notes',scope:{order:['sequence ASC','id DESC']}};

		var project, epics, tasks, errors = [];

		Promise.resolve()
			.then(() => {
				return WorkItem.find({
						where: {
							id: projectId,
							taskLevel: c.TASKLEVEL_PROJECT},
						include: [NOTES]
						})
					.then(_projects => {
						if(!_projects || _projects.length < 1) {
							errors.push({status: 404, message: "Cannot find project with given ID."})
							return Promise.reject(errors);
						} else if (_projects.length > 1) {
							errors.push({status: 500, message: "Error WI0019"});
							return Promise.reject(errors);
						} else {
							project = _projects[0];
						}
						if (debug.enabled) {
							if (errors.length > 0) {
								debug("Errors:");
								debug(errors);
							} else {
								debug("Project:");
								debug(project);
							}
						}
					})
			})
			.then(() => {
				return WorkItem.find({
						where: {
							parentId: projectId,
							taskLevel: c.TASKLEVEL_EPIC },
						include: [NOTES],
						order: ['priority ASC', 'id DESC']
					})
					.then(_epics => {
						epics = _epics;
						debug("epics:");
						debug(epics);
					})
			})
			.then(() => {
				var parentIds = [project.id],
					query;
				for (let i in epics) {
					parentIds.push(epics[i].id);
				}
				debug("parentIds ==", parentIds);
				query = {
						where: {
							parentId: { inq: parentIds },
							taskLevel: c.TASKLEVEL_TASK
						},
						order: ['priority ASC', 'id DESC'],
						include: [
							{
								relation: 'childItems',
								scope: {order:['priority ASC','id DESC']},
								include: [NOTES]
							}, 
							NOTES
						]
					};
				debug("query ==", JSON.stringify(query));
				return WorkItem.find(query)
					.then(_tasks => {
						_tasks = JSON.parse(JSON.stringify(_tasks));				
						// change subtasks to childItems
						for (let i in _tasks) {
							_tasks[i].subtasks = _tasks[i].childItems;
							delete _tasks[i].childItems;
						}
						tasks = _tasks;
						debug("tasks:");
						debug(tasks);
					});
			})
			.then(() => {
				// count children of tasks (we'll count epics later)
				for (let i in tasks) {
					let count = {
						complete: 0,
						incomplete: 0,
						total: 0
					}
					for (let j in tasks[i].subtasks) {
						let subtask = tasks[i].subtasks[j];
						if (subtask.isComplete) {
							count.complete++;
						} else {
							count.incomplete++;
						}
						count.total++;
					}
					tasks[i].count = count;
				}
				debug("tasks with counts:");
				debug(tasks);
				return Promise.resolve();
			})
			.then(() => {
				// collate epics and tasks
				project.epics = epics;
				project.tasks = [];
				debug("ok -2")
				for (let i in epics) {
					project.epics[i].tasks = [];
				}
				debug("ok -1")
				for (let i in tasks) {
					let task = tasks[i];
					if (task.parentId == projectId) {
						project.tasks.push(task);
						debug("ok", i, "1 with project parent");
					} else {
						let found = false;
						for (let j in project.epics) {
							debug("task.parentId ==", JSON.stringify(task.parentId), ", epic.id ==", JSON.stringify(project.epics[j].parentId));
							if (project.epics[j].id === task.parentId) {
								found = true;
								project.epics[j].tasks.push(task);
							}
						}
						found || errors.push({status: 500, message: "ERROR WI0132"});
						debug("ok", i, "1 with epic parent");
					}
				}
				debug("collated epics:");
				debug(epics);
				return;
			})
			.then(() => {
				// count epics
				for (let i in epics) {
					let count = {
						complete: 0,
						incomplete: 0,
						total: 0
					}
					for (let j in epics[i].tasks) {
						let task = epics[i].tasks[j];
						count.complete += task.count.complete + task.isComplete?1:0;
						count.incomplete += task.count.incomplete + task.isComplete?0:1;
						count.total += task.count.total + 1;
					}
					epics[i].count = count;
				}
				// count the project
				let count = {
					complete: 0,
					incomplete: 0,
					total: 0
				}
				for (let i in epics) {
					let epic = epics[i]
					count.complete += epic.count.complete + epic.isComplete?1:0;
					count.incomplete += epic.count.incomplete + epic.isComplete?0:1;
					count.total += epic.count.total + 1;
				}
				project.count = count;
				debug("project with counts:")
				debug(project);
				return;
			})
			.then(() => {
				// return data
				if (errors.length > 0) {
					return Promise.reject(errors)
				} else {
					cb && cb(null, project);
					return;
				}
			})
			.catch(_reason => {
				var errorResult = {};
				if (_.has(_.first(_reason), 'status')) {
					errorResult = {status:_.first(_reason).status,error: _reason};
				} else {
					errorResult = {status: 500, error: _reason};
				}
				cb && cb(errorResult);
			})
	}

	WorkItem.getProjectSummary = function getSummary() {

		return WorkItem.find({where:{taskLevel:c.TASKLEVEL_PROJECT}})
			.then(_projects => {
				debug("[getProjectSummary] _projects ==");
				debug(_projects);
				var promises = [];
				_projects.forEach(_project => {
					promises.push(
						WorkItem.getTaskCount(_project.id)
						.then(_count => {
							debug("[getProjectSummary] _count ==", _count);
							return Promise.resolve(
									{project: _project, count: _count}
								);
						}));
				})
				return Promise.all(promises);
			})
			.then(_result => {
				debug("[getProjectSummary] _result (project, count):");
				debug(_result);
				return _.map(_result, p => {
					return { id: p.project.id,
							 name: p.project.name,
							 isComplete: p.project.isComplete,
							 count: p.count };
				})
			})
			.catch(_reason => {
				return Promise.reject(_reason);
			});
	}

	WorkItem.getTaskCount = function getProjectTaskCount(_projectId, _cb) {

		var workItemIds = [],
			count = {
				complete: 0,
				incomplete: 0,
				total: 0
			},
			getChildren = function(_parentIds, _level) {
				debug("[getProjectTaskCount:getChildren] called on _parentIds", _parentIds);
				return WorkItem.find({
						where: {
							parentId: { inq: _parentIds}
						},
						fields: ['id', 'taskLevel', 'isComplete']
					})
					.then(_children => {
						var ids = [], stop = false, lowestLevel = Infinity;
						for (let i in _children) {
							let ci = _children[i];
							ids.push(ci.id);
							lowestLevel = Math.min(lowestLevel, ci.taskLevel);
							ci.isComplete
								? count.complete++
								: count.incomplete++;
							ci.total++;
						}
						if (lowestLevel <= _level || lowestLevel > c.TASKLEVEL_MAX) {
							stop = true; // circuit breaker in case of circular reference
						}
						if (!stop) {
							if (ids.length > 0) {
								return getChildren(ids, lowestLevel);
							} else {
								return Promise.resolve(count);
							}
						} else {
							return Promise.reject("Error WI0266");
						}
					})
			}
			return getChildren([_projectId])
				.then(_count => {
					debug("[getProjectTaskCount:getChildren] _count:", _count);
					_cb && _cb(null, _count);
					return Promise.resolve(_count);
				})
				.catch(_reason => {
					_cb && _cb(_reason);
					return Promise.reject(_reason);
				})
	}


};
