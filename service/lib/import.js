
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

var idMap = {}, // maps titles or references to ids
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

function importItem (_parentId, _priority, _taskLevel, _itemData) { return new Promise((resolve, reject) => {

	var importedItem,
		levelName = c.TASKLEVELS[_taskLevel].item;

	debug("Importing item _taskLevel", _taskLevel, "content:", JSON.stringify(_itemData.subtask));

	Promise.resolve()
	.then(() => {
			// check projects have no parent
			if (_taskLevel === c.TASKLEVEL_PROJECT) {
				if (_parentId) {
					return Promise.reject({
						code: "ERROR_PROJECT_WITH_PARENT",
						message: "projects should not have parents"
					});
				}
			}
		})
	.then(() => {
			return models.WorkItem.create({	
					name: _itemData[levelName],
					taskLevel: _taskLevel,
					parentId: _parentId,
					priority: _priority,
					isComplete: _itemData.complete || false
				})
				.then(_item => {
					let key = _itemData.ref || _itemData[levelName];
					if (_.has(idMap, key)) {
						return Promise.reject({
							code: "ERROR_DUPLICATE_REFERENCE",
							message: "more than one item with a title or ref " + key,
							details: {
									key,
									ids: [_item.id, idMap[key].id]
								}
						});
					}
					idMap[key] = _item.id;
					console.log("Mapping", levelName, key, "to", idMap[key]);
					return _item;
				});
		})
	.then(_item => {
			importedItem = _item;
			debug("Imported", levelName+':');
			debug(importedItem);

			let children = c.TASKLEVELS[_taskLevel].children,
				childPromises = [];

			childPromises.push(_itemData.notes 
				? _.map(_itemData.notes, (_s,_i) => {return importNote(_item.id,_i+1,_s)}) 
				: []);

			for (let i in children) {
				let childLevel = c.TASKLEVELS[children[i]];
				childPromises.push(_itemData[childLevel.list]
					? _.map(_itemData[childLevel.list], (_n,_i) => {
							return importItem(_item.id,_i+1,children[i],_n);
						})
					: []);
			}

			return collectPromises.apply(null, childPromises);
		})
	.then(_promises => resolve(importedItem))
	.catch(reason => {
			var failure = {
					status: "Failure",
					message: "Failed to import " + levelName + " \"" + _itemData[levelName] + "\"",
					subtask: _itemData,
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

	// import

	debug("importing");
	projectPromises = projectsData.projects 
		? _.map(projectsData.projects, (p,i) => {return importItem(null, i+1, c.TASKLEVEL_PROJECT, p)})
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
			debug.enabled && debug(JSON.stringify(reason));
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
				console.error("error importing:", reason);
				console.error(JSON.stringify(reason));
			})
		}
	})
}

debug("module loaded");
module.exports = importYaml;
