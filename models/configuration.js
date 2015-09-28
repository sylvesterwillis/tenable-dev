var mongoConnection = require('../connection.js'),
	db = mongoConnection.getDb(),
	configurations = db.collection('configuration'),
	ObjectId = require('mongodb').ObjectID;

function Configuration(name, hostname, userName, port) {
	this.name = name;
    this.hostname = hostname;
    this.userName = userName;
    this.port = port;
}

Configuration.prototype.list = function (operation, value, callback) {
	if (operation && operation.search(/[^a-zA-Z]+/) === -1) {
		if (operation.toLowerCase() === 'sortby') {
			//Mongo may treat the {value: -1} syntax literally 
			//so we use an object instead in order to get the value of
			//value.
			var sortObj = {sort: {}};
			sortObj.sort[value] = 1;
			configurations.find({}, sortObj).toArray(function (items) {
				callback(JSON.stringify(items || []));
			});
			return;
		}
		else if (operation.toLowerCase() === 'page' && !isNaN(parseInt(value))) {
			var options = {skip: 10 * (value-1), limit: 10};
			configurations.find({}, options).toArray(function (items) {
				callback(JSON.stringify(items || []));
			});
			return;
		}
	}

	configurations.find().toArray(function (items) {
		callback(JSON.stringify(items));
	});
}

Configuration.prototype.save = function (userName, callback) {
	var configQuery = {
			name: this.name,
			hostname: this.hostname,
			userName: this.userName,
			port: this.port
	};

	configurations.insert(configQuery, {w:1}, function (err, result) {
		if (err) {
			callback('');
		}
		else {
			callback(JSON.stringify(result));
		}
	});
}

Configuration.prototype.update = function (configurationId, callback) {
	var configIdQuery = {_id: ObjectId(configurationId)},
		configDataQuery = {
			$set: {
				name: this.name,
				hostname: this.hostname,
				port: this.port,
			}
		};


	configurations.update(configIdQuery, configDataQuery, function (err, result) {
		if (err) {
			callback('Could not update configuration due to:\n' + err);
		}
		else {
			callback(JSON.stringify(result));
		}
	});
}

Configuration.prototype.delete = function (configurationId, callback) {
	var configIdQuery = {_id: ObjectId(configurationId)};

	configurations.remove(configIdQuery, function (err, result) {
		if (err) {
			callback('Could not delete configuration due to:\n' + err);
		}
		else {
			callback(JSON.stringify(result));
		}
	});
}

module.exports = Configuration;