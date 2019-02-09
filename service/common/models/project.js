'use strict';
const
	debug = require('debug')('Priorities:Project'),
	_ = require('lodash');

module.exports = function(Project) {

	var app = require('../../server/server'),
		importYaml = require('../../lib/import');

	importYaml(app.models);

	Project.taskCount = function taskCount(_projectId) {
		var contentsPromises = [], 
			projectId = _.isObject(_projectId) ? _projectId.id : _projectId,
			result = {
				complete: 0,
				incomplete: 0,
				total: 0
			};

		contentsPromises.push(Project.app.models.Epic.find({where:{projectId}}));
		contentsPromises.push(Project.app.models.Task.find({where:{projectId}}));

		return Promise.all(contentsPromises)
			.then(([epics, projectTasks]) => {

				debug("epics.length ==", epics.length);
				debug("projectTasks.length ==", projectTasks.length);
				debug("_.map(projectTasks, 'taskId') ==", _.map(projectTasks, 'taskId'));

				var promises = [];

				for (let i in epics) {
					promises.push(
						Project.app.models.Epic.taskCount(epics[i].id)
							.then(count => {
								debug("Epic[", epics[i].id, "] taskCount ==", count);
								result.complete += count.complete;
								result.incomplete += count.incomplete;
								result.total += count.total;
							})
						);
				};

				let	where = {where:{taskId:{inq:_.map(projectTasks, 'id')}}};
				promises.push(
					Project.app.models.Subtask.find(where)
					.then(subtasks => {
						for(let i in subtasks) {
							if (subtasks[i].isComplete) {
								result.complete ++;
							} else {
								result.incomplete ++;
							}
							result.total ++;
						}
					}));

				for (let i in projectTasks) {
					result.complete += projectTasks[i].isComplete ? 1 : 0; 
					result.incomplete += projectTasks[i].isComplete ? 0 : 1;
					result.total++; 
				};

				for (let i in epics) {
					result.complete += epics[i].isComplete ? 1 : 0; 
					result.incomplete += epics[i].isComplete ? 0 : 1;
					result.total++; 
				};

				return Promise.all(promises)
					.then(() => {
						return Promise.resolve(result);
					})
					.catch(reason => {return Promise.reject(reason);});
			})
			.catch(reason => {
				return Promise.reject(reason);
			});

	};

	Project.getSummary = function getSummary() {

		return Project.find({})
			.then(projects => {
				debug("[getSummary] projects ==");
				debug(projects);
				var promises = [];
				projects.forEach(project => {
					promises.push(
						Project.taskCount(project.id)
						.then(count => {
							return Promise.resolve({project, count});
						}));
				})
				return Promise.all(promises);
			})
			.then(projects => {
				debug("[getSummary] projects (with count) ==");
				debug(projects);
				return _.map(projects, p => {
					return { id: p.project.id,
							 name: p.project.name,
							 isComplete: p.project.isComplete,
							 count: p.count };
				})
			})
			.catch(reason => {
				return Promise.reject(reason);
			});
	}

	Project.getDetail = function getDetail(projectId) {

		// filters
	    const notes = {relation:'notes',scope:{order:['sequence ASC','id DESC']}},
	          subtasks = {relation:'subtasks',scope:{order:['priority ASC','id DESC'],include:[notes]}},
	          tasks = {relation:'tasks',scope:{order:['priority ASC','id DESC'],include:[subtasks,notes]}},
	          epics = {relation:'epics',scope:{order:['priority ASC','id DESC'],include:[tasks,notes]}};
	          
	    var project = {where:{id:projectId},scope:{order:['priority ASC','id DESC']},include:[epics,tasks,notes]};

		return Project.find(project)
			.then(projects => {

				var promises = []

				projects = {projects: [_.first(JSON.parse(JSON.stringify(projects)))]};

		        // preprocess response data to add some attributes useful for UI
		        var preproc = (item, type) => {

		                // recursive through the project tree.
		                const 
		                	descendants = {
			                    '': ['project'],
			                    project: ['epic', 'task'],
			                    epic: ['task'],
			                    task: ['subtask'],
			                    subtask: []
			                },
			                counts = {
			                	project: Project.app.models.Project.taskCount,
			                	epic: Project.app.models.Epic.taskCount,
			                	task: Project.app.models.Task.subtaskCount,
			                };
		                var recurse = (item, subtypes) => {
		                    subtypes.forEach(subtype => {
		                      let ists = item[subtype+'s'];
		                      ists && ists.forEach(s => preproc(s, subtype));
		                    });
		                };
		                recurse(item, descendants[type]);
		                if (counts[type]) {
		                	if (type !== 'task' || item.subtasks.length > 0) {
			                	promises.push(counts[type](item)
				                	.then(count => item.count = count));
			                }
		                }
		                item.type = type;
		            };
		        preproc(projects, '');
		        return Promise.all(promises).then(() => {return Promise.resolve(_.first(projects.projects))});
		    });
	}
};
