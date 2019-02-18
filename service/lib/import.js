
const
	c 	 	= require('./constants'),
	debug 	= require('debug')('Priorities:import'),
	fs 		= require('fs'),
	randomstring=require('randomstring'),
	YAML 	= require('yamljs'),
	_ 		= require('lodash'),

	MODEL_NOTE = 'note',
	MODEL_PROJECT = 'project',
	MODEL_EPIC = 'epic',
	MODEL_TASK = 'task',
	MODEL_SUBTASK = 'subtask';

var dependencyMap = {},
	models;

function collectPromises(promises) { return new Promise((resolve, reject) => {
	Promise.all(promises)
	.then(results => {
			resolve(results);
		})
	.catch(reason => {
			reject(reason);
		});
})}

function importNote (workItemId, sequence, noteData) { return new Promise((resolve, reject) => {

	debug("Importing note", JSON.stringify(noteData.note));

	Promise.resolve()
	.then(() => {
			return models.Note.create({title: noteData.note, workItemId, sequence});
		})
	.then(note => {
			resolve(note);
			debug("Imported Note:");
			debug(note);
		})
	.catch(reason => {
			var failure = {
					status: "Failure",
					message: "Failed to import note \"" + noteData.title + "\"",
					note: noteData.title,
					reason: reason
				};
			debug(failure);
			reject(failure);
		});
});}

function importSubtask (parentId, priority, subtaskData) { return new Promise((resolve, reject) => {

	var importedSubtask;

	debug("Importing subtask", JSON.stringify(subtaskData.subtask));

	Promise.resolve()
	.then(() => {
			return models.WorkItem.create({	
					name: subtaskData.subtask,
					taskLevel: c.TASKLEVEL_SUBTASK,
					parentId,
					priority,
					isComplete: subtaskData.complete || false
				});
		})
	.then(subtask => {
			importedSubtask = subtask;
			debug("Imported Subtask:");
			debug(importedSubtask);

			let notesPromises = subtaskData.notes 
					? _.map(subtaskData.notes, (s,i) => {return importNote(subtask.id,i+1,s)}) 
					: [];
			return collectPromises(notesPromises);
		})
	.then(notes => resolve(importedSubtask))
	.catch(reason => {
			var failure = {
					status: "Failure",
					message: "Failed to import subtask \"" + subtaskData.subtask + "\"",
					subtask: subtaskData,
					reason: reason
				};
			debug(failure);
			reject(failure);
		});
});}

function importTask (parentId, priority, taskData) { return new Promise((resolve, reject) => {

	let importedTask;

	debug("Importing task", JSON.stringify(taskData.task));

	Promise.resolve()
	.then(() => {
			return models.WorkItem.create({	
					name: taskData.task, 
					taskLevel: c.TASKLEVEL_TASK,
					parentId: parentId,
					priority,
					isComplete: taskData.complete || false
				});
		})
	.then(task => {
			importedTask = task;
			debug("Imported Task:");
			debug(importedTask);

			let subtaskPromises = taskData.subtasks 
					? _.map(taskData.subtasks, (s,i) => {return importSubtask(task.id,i+1,s)})
					: [], 
				notesPromises = taskData.notes 
					? _.map(taskData.notes, (n,i) => {return importNote(task.id,i+1,n)}) 
					: [];
			return collectPromises([ 
					collectPromises(subtaskPromises),
					collectPromises(notesPromises)
				]);
		})
	.then(dependencies => resolve(importedTask))
	.catch(reason => {
			var failure = {
					status: "Failure",
					message: "Failed to import task \"" + taskData.task + "\"",
					task: taskData,
					reason: reason
				};
			debug(failure);
			reject(failure);
		});
});}

function importEpic (parentId, priority, epicData) { return new Promise((resolve, reject) => {

	let importedEpic;

	debug("Importing Epic", JSON.stringify(epicData.epic));

	Promise.resolve()
	.then(() => {
			return models.WorkItem.create({ 
					name: epicData.epic,
					taskLevel: c.TASKLEVEL_EPIC,
					parentId,
					priority,
					isComplete: epicData.complete || false
				});
		})
	.then(epic => {
			importedEpic = epic;
			debug("Imported Epic:");
			debug(importedEpic);

			let taskPromises = epicData.tasks 
					? _.map(epicData.tasks, (e,i) => {return importTask(epic.id,i+1,e)})
					: [],
				notesPromises = epicData.notes 
					? _.map(epicData.notes, (n,i) => {return importNote(epic.id,i+1,n)})
					: [];

			return collectPromises([ 
					collectPromises(taskPromises),
					collectPromises(notesPromises)
				]);
		})
 	.then(tasksAndNotes => resolve(importedEpic))
	.catch(reason => {
			var failure = {
					status: "Failure",
					message: "Failed to import epic \"" + epicData.epic + "\"",
					epic: epicData,
					reason: reason
				};
			debug(failure);
			reject(failure);
		});
});}

function importProject (priority, projectData) { return new Promise((resolve, reject) => {

	let importedProject;

	debug("Importing Project", JSON.stringify(projectData.project), priority);

	Promise.resolve()
	.then(() => {
			var importData = { 
					name: projectData.project,
					taskLevel: c.TASKLEVEL_PROJECT,
					parentId: null,
					priority,
					isComplete: projectData.complete || false
				};
			debug("Importing Project with importData:" + JSON.stringify(importData));
			return models.WorkItem.create(importData);
		})
	.then(project => {
			importedProject = project;
			debug("Imported Project:");
			debug(importedProject);

			let taskPromises = projectData.tasks 
					? _.map(projectData.tasks, (t,i) => {return importTask(project.id, i+1, t)})
					: [],
				epicPromises = projectData.epics 
					? _.map(projectData.epics, (e,i) => {return importEpic(project.id, i+1, e)})
					: [];
				notePromises = projectData.notes 
					? _.map(projectData.notes, (n,i) => {return importNote(project.id, i+1, n)})
					: [];

			return collectPromises([
					collectPromises(taskPromises),
					collectPromises(epicPromises),
					collectPromises(notePromises)
				]);
		})
	.then(dependencies => resolve(importedProject))
	.catch(reason => {
			var failure = {
					status: "Failure",
					message: "Failed to import project \"" + projectData.project + "\"",
					epic: projectData,
					reason: reason
				};
			debug(failure);
			reject(failure);
		});
});}

function importProjects(projectsData) { return new Promise((resolve, reject) => {

	debug("importProjects started. projectsData:");
	debug(projectsData);

	let projectPromises = [],
		warnings = [],
		errors = [];

	// build a list of titles to match task dependencies against

	// projectsData.projects.forEach(project => {
	// 	let dm, 
	// 		taskModelsQueue = []; // makes sure all epics are processed before any tasks, and 
	// 							  // all tasks are processed before any subtasks.

	// 	dm = dependencyMap[project.project] = {};

	// 	// first gather all the names
	// 	project.epics && project.epics.forEach(epic => {
	// 		taskModelsQueue.push({type: MODEL_EPIC, taskModel: epic, name: epic.epic});
	// 	});
	// 	project.tasks && project.tasks.forEach(task => {
	// 		taskModelsQueue.push({type: MODEL_TASK, taskModel: task, name: task.task});
	// 	});
	// 	for (let i = 0; i < taskModelsQueue.length; i++) {
	// 		let tm = taskModelsQueue[i];
	// 		switch(tm.type) {
	// 		case MODEL_EPIC: 
	// 			tm.taskModel.tasks || (tm.taskModel.tasks = []);
	// 			tm.taskModel.tasks.forEach(task => {
	// 				taskModelsQueue.push({type: MODEL_TASK, taskModel: task, name: task.task});
	// 			})
	// 			break;
	// 		case MODEL_TASK:
	// 			tm.taskModel.subtasks && tm.taskModel.subtasks.forEach(subtask => {
	// 				taskModelsQueue.push({type: MODEL_SUBTASK, taskModel: subtask, name: subtask.subtask});
	// 			})
	// 			break;
	// 		default:
	// 			// subtask -- do nothing
	// 			break;
	// 		}

	// 		if (_.includes(dm, tm.name)) {
	// 			errors.push({	code: "DUPLICATE_NAME", 
	// 							message: "Two things have the same title. Assuming title " +
	// 									JSON.stringify(tm.name) +
	// 									" refers to the " + tm.type});
	// 		} else {
	// 			dm[tm.name] = {type: tm.type, dependants: []};
	// 		}
	// 	}

	// 	while (taskModelsQueue.length > 0) {
	// 		let tm = taskModelsQueue.shift();

	// 		if (debug.enabled) {
	// 			tm.taskModel.depends && debug(tm.taskModel.depends);
	// 		}

	// 		tm.taskModel.depends && tm.taskModel.depends.forEach(depend => {
	// 			if (dm[depend.depend]) {
	// 				debug("PUSH of tm", tm);
	// 				dm[depend.depend].dependants.push(tm);
	// 			} else {
	// 				errors.push({ code: "UNKNOWN_DEPENDENCY",
	// 							  message: "Uknown dependency of name" + JSON.stringify(depend.depend)});
	// 			}
	// 		});
	// 	}
	// });
	// debug("errors:");
	// debug(errors);

	// import

	debug("importing");
	projectPromises = projectsData.projects 
		? _.map(projectsData.projects, (p,i) => {return importProject(i+1, p)})
		: [];
	debug('projectPromises');
	debug(projectPromises);

	Promise.resolve()
	.then(() => {
			return errors.length ? Promise.reject(errors) : Promise.resolve();
		})
	.then(() => {
			return collectPromises(projectPromises);
		})
	.then(() => {
			result = {status: "imported"};
			warnings && _.extend(result, {warnings});
			errors   && _.extend(result, {errors});
			resolve(result);
		})
	.catch(reason => {
			debug("Error importing:", reason);
			reject({
				code: "ERRORS_ON_IMPORT",
				messages: "Failed to import project set",
				details: reason
			});
		});
})};

function importYaml(appModels) {

	var startTime = new Date().getTime();

	debug("importYaml called, appModels ==", appModels);
	debug("importTask.length ==", importTask.length);
	models = appModels;
	fs.readFile('lib/priorities.yaml', (err, dataYaml) => {
		if (err) {
			console.error("error reading import file:", err);
			process.exit(1);
		} else {
			var projectsData = YAML.parse(dataYaml.toString());

			importProjects(projectsData)
			.then(() => {
				let endTime = new Date().getTime();
				debug("Import completed in", (endTime-startTime)/1000 + "s");
			})
			.catch((reason) => {
				console.error("error importing:", reason)
			})
		}
	})
}

debug("module loaded");
module.exports = importYaml;
