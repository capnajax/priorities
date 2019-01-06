'use strict';

module.exports = function(TaskModel) {

	/**
	 *	Import an individual project
	 */
	TaskModel.importModel = function(parentModel, modelType, dataObj) { return new Promise((resolve, reject) => {

		const 
			typesMap = {
				project : { relations: [ "epic", "task" ],
							model: TaskModel.app.models.Project
						  },
				epic	: { relations: [ "task" ],
							model: TaskModel.app.models.Epic
						  },
				task 	: { relations: [ "subtask" ],
							model: TaskModel.app.models.Task
						  },
				subtask : { relations: [],
						 	model: TaskModel.app.models.Subtask
						  }
			}

		typesMap[modelType].model.create({ name: dataObj.project })
		.then(parentModel => { return new Promise((res, rej) => {
			var promises=[];
			typesMap[modelType].relations.forEach(relation => {
				dataObj[typesMap[relation]+'s'].forEach(modelObj => { 
					promises.push(typesMap[relation].model.importModel(parentModel, relation, modelObj))
				})
			})
			Promise.all(promises)
			.then(() => {res(parentModel);})
			.catch(reason => {rej(reason);});
		})})
		.then(resolve)
		.catch(reject)

	})};

};
