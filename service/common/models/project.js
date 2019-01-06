'use strict';
const
	debug = require('debug');

module.exports = function(Project) {

	var app = require('../../server/server'),
		importYaml = require('../../lib/import');

	importYaml(app.models);
};
