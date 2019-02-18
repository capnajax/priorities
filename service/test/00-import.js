"use strict";

const
	axios = require('axios'),
	c = require('../lib/constants'),
	expect = require('chai').expect,
	fs = require('fs'),
	randomstring = require('randomstring').generate,
	YAML = require('yamljs'),
	_ = require('lodash');

var
	debug = require('debug')('test:import');

axios.defaults.baseURL = 'http://localhost:3030/api/';

describe("Import", function() {

	var testProject;

	before(function(done) {
		fs.readFile('lib/priorities.yaml', (_err, _dataYaml) => {
			if (_err) {
				console.error("error reading import file:", _err);
				done(1);
			} else {
				var projectsData = YAML.parse(_dataYaml.toString());
				debug("projectsData ==");
				debug(projectsData);
				for (let i = 0; i < projectsData.projects.length; i++) {
					if (projectsData.projects[i].project === "mocha test project") {
						testProject = projectsData.projects[i];
						debug("testProject:");
						debug(testProject);
						done();
						return;
					}
				}
				done("could not read file");
			}
		})
	}),

	it("Should keep parents of projects null", function(done) {

		axios.get('WorkItems?filter[where][taskLevel]=100')
		.then(function (_response) {
			try {
				_response.data.forEach(_item => {
					expect(_item).to.be.an('object');
					expect(_item.parentId).to.not.exist;
				});
				done();
			} catch(_e) {
				debug(e);
				done({error:e});
			}
		})
		.catch(function (_reason) {
			done(_reason);
		});
	});

	it("Should give projects only tasks or epics as children", function(done) {

		axios.get('WorkItems?filter[taskLevel]=100')
		.then(function (_response) {
			var filterTerms = [];
			_response.data.forEach(_item => {
				filterTerms.push('filter[where][parentId]='+_item.id);
			});
			axios.get('WorkItems?' + filterTerms.join(','))
			.then(_response => {
				try {
					for (let i in _response.data) {
						expect(_response.data[i]).to.be.an('object');
						expect(_response.data[i].taskLevel).to.be.oneOf([200,300]);
					}
					done()
				} catch(e) {
					done({error:e});
				}
			});
		})
		.catch(function (_reason) {
			done(_reason);
		});
	});

	it("Should give epics only tasks as children", function(done) {

		axios.get('WorkItems?filter[taskLevel]=200')
		.then(function (_response) {
			var filterTerms = [];
			_response.data.forEach(_item => {
				filterTerms.push('filter[where][parentId]='+_item.id);
			});
			axios.get('WorkItems?' + filterTerms.join(','))
			.then(_response => {
				try {
					for (let i in _response.data) {
						expect(_response.data[i]).to.be.an('object');
						expect(_response.data[i].taskLevel).to.be.equal(300);
					}
					done()
				} catch(e) {
					done({error:e});
				}
			});
		})
		.catch(function (_reason) {
			done(_reason);
		});
	});

	it("Should give tasks only subtasks as children", function(done) {

		axios.get('WorkItems?filter[taskLevel]=300')
		.then(function (_response) {
			var filterTerms = [];
			_response.data.forEach(_item => {
				filterTerms.push('filter[where][parentId]='+_item.id);
			});
			axios.get('WorkItems?' + filterTerms.join(','))
			.then(_response => {
				try {
					for (let i in _response.data) {
						expect(_response.data[i]).to.be.an('object');
						expect(_response.data[i].taskLevel).to.be.equal(400);
					}
					done();
				} catch(e) {
					done({error:e});
				}
			});
		})
		.catch(function (_reason) {
			done(_reason);
		});
	});

	it("Should give not give subtasks children", function(done) {

		axios.get('WorkItems?filter[taskLevel]=400')
		.then(function (_response) {
			var filterTerms = [];
			_response.data.forEach(_item => {
				filterTerms.push('filter[where][parentId]='+_item.id);
			});
			axios.get('WorkItems?' + filterTerms.join(','))
			.then(_response => {
				try {
					expect(_response.data).to.be.an('array').that.is.empty;
					done()
				} catch(e) {
					debug(_response);
					done({error:e});
				}
			});
		})
		.catch(function (_reason) {
			done(_reason);
		});
	});

	it("Should import all of a product's children", function(done) {

		axios.get('WorkItems?filter=' +
			JSON.stringify({
					where: {
						taskLevel: 100,
						name: "mocha test project"
					},
					include: [ { relation: "childItems" },
							   { relation: "notes", scope: { order: "sequence ASC" } }
					]
				}))
		.then(function (_response) {
			try {
				let rd0;
				expect(_response.data.length).to.be.equal(1);
				rd0 = _response.data[0];
				debug("rd0:");
				debug(rd0);
				expect(rd0.childItems).to.be.an('array');
				for (let i = 0; i < testProject.notes.length; i++) {
					expect(rd0.notes[i].title).to.be.equal(testProject.notes[i].note);
				}
				for (let i = 0, offset = 0; i < testProject.tasks.length; i++) {
					while (rd0.childItems[i+offset].taskLevel === c.TASKLEVEL_EPIC) { 
						offset++; 
						expect(rd0.childItems.length).to.be.above(i + offset);
					}
					expect(rd0.childItems[i+offset].taskLevel).to.be.equal(c.TASKLEVEL_TASK);
					expect(rd0.childItems[i+offset].name).to.be.equal(testProject.tasks[i].task);
				}
				for (let i = 0, offset = 0; i < testProject.epics.length; i++) {
					while (rd0.childItems[i+offset].taskLevel === c.TASKLEVEL_TASK) { 
						offset++; 
						expect(rd0.childItems.length).to.be.above(i + offset);
					}
					expect(rd0.childItems[i+offset].taskLevel).to.be.equal(c.TASKLEVEL_EPIC);
					expect(rd0.childItems[i+offset].name).to.be.equal(testProject.epics[i].epic);
				}
				done();

			} catch(e) {
				done({error:e});
			}
		})
		.catch(function (_reason) {
			done(_reason);
		});
	});

	it("Should import all of all epics' children", function(done) {

		Promise.resolve()
		.then(function () {

			return axios.get('WorkItems?filter=' +
				JSON.stringify({
						where: {
							taskLevel: 100,
							name: "mocha test project"
						}
					}));

		})
		.then(function (_response) {

			return axios.get('WorkItems?filter=' +
				JSON.stringify({
						where: {
							taskLevel: 200,
							parentId: _response.data[0].id
						},
						include: [ { relation: "childItems" },
								   { relation: "notes", scope: { order: ["parentId ASC", "sequence ASC"] } }
						]
					}));

		})
		.then(function (_response) {

			let rdj, epicName;
			debug(_response.data);
			expect(_response.data.length).to.be.equal(2);
			for (let j = 0; j < _response.data.length; j++) {
				rdj = _response.data[j];
				epicName = rdj.name
				expect(rdj.childItems).to.be.an('array');
				expect(epicName).to.be.equal("project epic "+j);
				expect(rdj.childItems.length).to.be.equal({
					"project epic 0" : 2,
					"project epic 1" : 0,
				}[epicName]);
				expect(rdj.notes.length).to.be.equal({
					"project epic 0" : 2,
					"project epic 1" : 0,
				}[epicName]);


				// TODO add specific tests

			}
			done();

		})
		.catch(function (_reason) {
			done({reason:_reason});
		});
	});

	it("Should import all of all tasks' children", function(done) {

		Promise.resolve()
		.then(function () {
			return axios.get('WorkItems?filter=' +
				JSON.stringify({
						where: {
							taskLevel: 100,
							name: "mocha test project"
						}
					}))
		})
		.then(function (_response) {
			var projectId = _response.data[0].id;
			return axios.get('WorkItems?filter=' +
				JSON.stringify({
						where: {
							taskLevel: 200,
							parentId: projectId
						},
						include: [ { relation: "childItems" },
								   { relation: "notes", scope: { order: ["parentId ASC", "sequence ASC"] } }
						]
					}))
				.then(_response => {
					var parentIds = [projectId];
					_response.data.forEach(_epic => {
						parentIds.push(_epic.id);
					});
					return _.uniq(parentIds);
				});
		})
		.then(function (_parentIds) {
			return axios.get('WorkItems?filter=' +
				JSON.stringify({
						where: {
							taskLevel: 300,
							parentId: {inq: _parentIds}
						},
						include: [ { relation: "childItems" },
								   { relation: "notes", scope: { order: ["parentId ASC", "sequence ASC"] } }
						]
					}))
		})
		.then(function (_response) {
			let rdj, taskName;
			debug(_response.data);
			expect(_response.data.length).to.be.equal(4);
			for (let j = 0; j < _response.data.length; j++) {
				rdj = _response.data[j];
				taskName = rdj.name
				debug(taskName);
				expect(rdj.childItems).to.be.an('array');
				expect(rdj.childItems.length).to.be.equal({
					"epic task 0" : 0,
					"epic task 1" : 0,
					"project task 0" : 3,
					"project task 1" : 0
				}[taskName]);
				expect(rdj.notes.length).to.be.equal({
					"epic task 0" : 0,
					"epic task 1" : 2,
					"project task 0" : 2,
					"project task 1" : 0
				}[taskName]);


				// TODO add specific tests

			}
			done();

		})
		.catch(function (_reason) {
			done(_reason);
		});
	});

	it("Should not give subtasks children", function(done) {

		Promise.resolve()
		.then(function () {
			return axios.get('WorkItems?filter=' +
				JSON.stringify({
						where: {
							taskLevel: 100,
							name: "mocha test project"
						}
					}))
		})
		.then(function (_response) {
			var projectId = _response.data[0].id;
			return axios.get('WorkItems?filter=' +
				JSON.stringify({
						where: {
							taskLevel: 200,
							parentId: projectId
						},
						include: [ { relation: "childItems" },
								   { relation: "notes", scope: { order: ["parentId ASC", "sequence ASC"] } }
						]
					}))
				.then(_response => {
					var parentIds = [projectId];
					_response.data.forEach(_epic => {
						parentIds.push(_epic.id);
					});
					return _.uniq(parentIds);
				});
		})
		.then(function (_parentIds) {
			return axios.get('WorkItems?filter=' +
				JSON.stringify({
						where: {
							taskLevel: 300,
							parentId: {inq: _parentIds}
						},
						include: [ { relation: "childItems" },
								   { relation: "notes", scope: { order: ["parentId ASC", "sequence ASC"] } }
						]
					}))
				.then(_response => {
					var parentIds = [];
					_response.data.forEach(_task => {
						parentIds.push(_task.id);
					});
					return _.uniq(parentIds);
				});
		})
		.then(function (_parentIds) {
			return axios.get('WorkItems?filter=' +
				JSON.stringify({
						where: {
							taskLevel: 400,
							parentId: {inq: _parentIds}
						},
						include: [ { relation: "childItems" },
								   { relation: "notes", scope: { order: ["parentId ASC", "sequence ASC"] } }
						]
					}))
		})
		.then(function (_response) {
			try {
				let rdj;
				for (let j = 0; j < _response.data.length; j++) {
					rdj = _response.data[j];
					expect(rdj.childItems).to.be.an('array').that.is.empty;
				}
				done();

			} catch(e) {
				done({error:e});
			}
		})
		.catch(function (_reason) {
			done(_reason);
		});
	});

})

