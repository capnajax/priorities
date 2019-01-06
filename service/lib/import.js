
const
	debug=require('debug')('priorities:import'),
	fs=require('fs'),
	YAML=require('yamljs'),
	_=require('lodash');

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

function importNote (reference, noteData) { return new Promise((resolve, reject) => {

	debug("Importing note", JSON.stringify(noteData.note));

	Promise.resolve()
	.then(() => {
			return models.Note.create(_.extend({}, reference, {title: noteData.note}));
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

function importSubtask (reference, subtaskData) { return new Promise((resolve, reject) => {

	var importedSubtask;

	debug("Importing subtask", JSON.stringify(subtaskData.subtask));

	Promise.resolve()
	.then(() => {
			return models.Subtask.create(_.extend({}, reference, {	
					name: subtaskData.subtask,
					isComplete: subtaskData.complete || false
				}));
		})
	.then(subtask => {
			importedSubtask = subtask;
			debug("Imported Subtask:");
			debug(importedSubtask);

			let notesPromises = subtaskData.notes 
					? _.map(subtaskData.notes, _.curry(importNote)({subtaskId: subtask.id})) 
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

function importTask (reference, taskData) { return new Promise((resolve, reject) => {

	let importedTask;

	debug("Importing task", JSON.stringify(taskData.task));

	Promise.resolve()
	.then(() => {
			return models.Task.create(_.extend({}, reference, {	
					name: taskData.task, 
					isComplete: taskData.complete || false
				}));
		})
	.then(task => {
			importedTask = task;
			debug("Imported Task:");
			debug(importedTask);

			let subtaskPromises = taskData.subtasks 
					? _.map(taskData.subtasks, _.curry(importSubtask)({taskId: task.id}))
					: [], 
				notesPromises = taskData.notes 
					? _.map(taskData.notes, _.curry(importNote)({taskId: task.id})) 
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

function importEpic (reference, epicData) { return new Promise((resolve, reject) => {

	let importedEpic;

	debug("Importing Epic", JSON.stringify(epicData.epic));

	Promise.resolve()
	.then(() => {
			return models.Epic.create(_.extend({}, reference, { 
					name: epicData.epic,
					isComplete: epicData.complete || false
				}));
		})
	.then(epic => {
			importedEpic = epic;
			debug("Imported Epic:");
			debug(importedEpic);

			let taskPromises = epicData.tasks 
					? _.map(epicData.tasks, _.curry(importTask)({epicId: epic.id}))
					: [],
				notesPromises = epicData.notes 
					? _.map(epicData.notes, _.curry(importNote)({epicId: epic.id}))
					: [];

			return collectPromises([ 
					collectPromises(taskPromises),
					collectPromises(notesPromises)
				]);
		})
	.then(dependencies => resolve(importedEpic))
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

function importProject (projectData) { return new Promise((resolve, reject) => {

	let importedProject;

	debug("Importing Project", JSON.stringify(projectData.project));

	Promise.resolve()
	.then(() => {
			return models.Project.create({ 
					name: projectData.project,
					isComplete: projectData.complete || false
				});
		})
	.then(project => {
			importedProject = project;
			debug("Imported Project:");
			debug(importedProject);

			let taskPromises = projectData.tasks 
					? _.map(projectData.tasks, _.curry(importTask)({projectId: project.id}))
					: [],
				epicPromises = projectData.epics 
					? _.map(projectData.epics, _.curry(importEpic)({projectId: project.id}))
					: [];
				notePromises = projectData.notes 
					? _.map(projectData.notes, _.curry(importNote)({projectId: project.id}))
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

	let projectPromises = [];

	projectsData.projects.forEach(project => projectPromises.push(importProject(project)));

	collectPromises(projectPromises)
	.then(() => {
			resolve({status: "ok"});
		})
	.catch(reason => {
			debug("Error importing:", reason);
		});
})};

/**
 *	Validates the data and maps the dependencies
 *	@param {Object} project - the project data
 *	@return promise that resolves with updated projectData 
 *		if valid, rejects if not valid
 */
function preImportProject(projectData) { return new Promise((resolve, reject) => {



})}


function importYaml(appModels) {

	var startTime = new Date().getTime();

	debug("importYaml called, appModels ==", appModels);
	debug("importTask.length ==", importTask.length);
	models = appModels;
	fs.readFile('lib/priorities.yaml', (err, dataYaml) => {
		if (err) {
			console.log("error reading import file:", err);
			process.exit(1);
		} else {
			var projectsData = YAML.parse(dataYaml.toString());

			importProjects(projectsData)
			.then(() => {
				let endTime = new Date().getTime();
				console.log("Import completed in", (endTime-startTime)/1000 + "s");
			})
			.catch((reason) => {
				console.log("error importing:", reason)
			})
		}
	})
}

debug("module loaded");
module.exports = importYaml;
