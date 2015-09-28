var mongoConnection = require('../connection.js'),
	db = mongoConnection.getDb(),
	Configuration = require('../models/configuration');

module.exports = {
	processRequest: function (req, res, userName, urlParts) {
		var configuration = new Configuration(),
			extraParam = urlParts[2],
			configurationId,
			sortBy;

		if (req.data && req.data.name && req.data.hostname && req.data.port) {
			configuration.name = req.data.name;
			configuration.userName = userName;
			configuration.hostname = req.data.hostname;
			configuration.port = req.data.port;
		}

		if (!isNaN(parseInt(extraParam))) {
			configurationId = extraParam;
		}
		else if (extraParam) {
			sortBy = urlParts[3];
		}

		switch(req.method) {
			case 'GET':
				configuration.list(extraParam, sortBy, function (list) {
					res.writeHead(200, {'Content-Type': 'application/json'});
					res.end(list);
				});
				break;
			case 'POST':
				configuration.save(userName, function (item) {
					if (item) {
						res.writeHead(200);
						res.end(item);
					}
					else {
						res.writeHead(200);
						res.end('An error while saving the configuration.');
					}
				});
				break;
			case 'PUT':
				configuration.update(configurationId, function (saved) {
					if (saved) {
						res.writeHead(200);
						res.end(saved);
					}
					else {
						res.writeHead(200);
						res.end('An error while updating the configuration.');
					}
				});
				break;
			case 'DELETE':
				configuration.delete(configurationId, function (deleted) {
					if (deleted) {
						res.writeHead(200);
						res.end(deleted);
					}
					else {
						res.writeHead(200);
						res.end('An error while deleting the configuration.');
					}
				});
				break;
		}
	}
};