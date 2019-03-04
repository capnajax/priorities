
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

function importYaml(appModels) {

	var startTime = new Date().getTime(),
		idMap = {}, // maps titles or references to ids
		dependencies = {},
		models,

		importDependencies = () => { return new Promise((resolve, reject) => {

				debug("importDependencies called");
				debug("dependencies:");
				debug(dependencies);

				var unknownIds = [];

				// first scan the id map
				for (let i in dependencies) {
					for (let j in dependencies[i]) {
						if (!_.has(idMap, dependencies[i][j])) {
							console.log("Unknown ref in dependencies for", i, ":", j);
							unknownIds.push(j);
						}
					}
				}

				if (unknownIds.length) {

					reject({
						code: "ERROR_UNKNOWN_DEPENDENCY",
						message: "unknown dependencies: " + JSON.stringify(unknownIds) 
					});

				} else {

					// add the dependencies
					let importObjects = [];
					for (let i in dependencies) {
						for (let j in dependencies[i]) {
							importObjects.push({
								dependencyId: idMap[dependencies[i][j]],
								dependentId: idMap[i]
							});
						}
					}

					models.Dependency.create(importObjects)
					.then(() => {
						resolve();
					})
					.catch(reason => {
						reject({
							code: "ERROR_FAILED_DEPENDENCY",
							message: "Failed to import dependencies",
							details: reason
						});
					});
				}

			})},

		importItem = (_parentId, _priority, _taskLevel, _itemData) => { return new Promise((resolve, reject) => {

			var levelName = c.TASKLEVELS[_taskLevel].item;

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

							// map the name (or ref) in the yaml to an actual id
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
							debug("Mapping", levelName, key, "to", idMap[key]);

							// capture the dependencies this has.
							if (_.has(_itemData, "depends")) {
								dependencies[key] = _.map(
										_itemData.depends, 
										depend => { return depend.depend; }
									);
							}

							return _item;
						});
				})
			.then(_item => {
					debug("Imported", levelName+':');
					debug(_item);

					let children = c.TASKLEVELS[_taskLevel].children,
						childPromises = [];

					if (_itemData.notes) {
						_itemData.notes.forEach((_s,_i) => {
							childPromises.push(importNote(_item.id,_i+1,_s))
						});
					}

					for (let i in children) {
						let childLevel = c.TASKLEVELS[children[i]];
						if (_itemData[childLevel.list]) {
							_itemData[childLevel.list].forEach((_n,_i) => {
								childPromises.push(importItem(_item.id,_i+1,children[i],_n));
							});
						}
					}

					return Promise.all(childPromises);
				})
			.then(_promises => {
					// now we need to import the dependencies
					return _promises;
				})
			.then(() => {
					debug("importItem resolve");
					resolve();
				})
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
			});},

		importNote = (workItemId, sequence, noteData) => { return new Promise((resolve, reject) => {

			debug("Importing note", JSON.stringify(noteData.note));

			Promise.resolve()
			.then(() => {
					return models.Note.create({title: noteData.note, workItemId, sequence});
				})
			.then(note => {
					debug("Imported Note:");
					debug(note);
					debug("importNote resolve");
					resolve(note);
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
			});},

		importProjects = (projectsData) => { return new Promise((resolve, reject) => {

			debug("importProjects started. projectsData:");
			debug(projectsData);

			let projectPromises = [],
				warnings = [],
				errors = [];

			// import

			debug("importing");
			projectPromises = projectsData.projects 
				? _.map(projectsData.projects, (p,i) => {
						return importItem(null, i+1, c.TASKLEVEL_PROJECT, p);
					})
				: [];
			debug('projectPromises');
			debug(projectPromises);

			Promise.resolve()
			.then(() => {
					return errors.length ? Promise.reject(errors) : Promise.resolve();
				})
			.then(() => {
					debug("Collecting promises");
					return Promise.all(projectPromises).then(() => { 
							debug("all resolve");
						});
				})
			.then(() => {
					debug("Ready to import dependencies");
					return importDependencies();
				})
			.then(() => {
					debug("Dependencies imported");
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
