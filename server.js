var mongoConnection = require('./connection');

mongoConnection.connectToServer(function (err, db) {
	var http = require('http'),
		Session = require('./routes').Session,
		Configuration = require('./routes').Configuration,
		sessions = db.collection('session'),
		PORT = 8888;

	var checklogin = function (req, res, callback) {
		if (!req.headers.cookie) {
			callback('');
			return;
		}

		var sessionId = req.headers.cookie.replace("id=", "") || "";

		sessions.findOne({sessionId: sessionId}, function (err, session) {
			if (session && session.userName) {
				callback(session.userName);
				return;
			}

			callback('');
		});
	};

	var processRequest = function (req, res) {
		//Url should be /resource/:id which would give
		//["", "resource", "id"]
		var url = req.url.split('/'),
			method = req.method,
			extraParam = url[2];

		switch (req.method) {
			case 'POST':
			case 'PUT':
				if (!req.data) {
					res.writeHead(404);
					res.end('No data received.\n');
					return;
				}
		}

		switch (url[1]) {
			case 'login':
				Session.login(req, res);
				break;
			case 'register':
				Session.register(req, res);
				break;
			case 'logout':
				checklogin(req, res, function (userName) {
					Session.logout(req, res, userName);
				});
				break;
			case 'configuration':
				checklogin(req, res, function (userName) {
					if (userName) {
						Configuration.processRequest(req, res, userName, url);
					}
					else {
						res.writeHead(404);
						res.end('User is not authenticated.\n');
					}
				});
				break;
            default:
                res.writeHead(404);
                res.end('Hello person or robot.\n');
		}
	}

	var requestListener = function (req, res) {
		var queryData = '';

		req.on('data', function(data) {
			queryData += data;
			if (queryData.length > 1e6) {
				queryData = '';
				res.writeHead(413, {'Content-Type': 'text/plain'}).end();
				req.connection.destroy();
			}
			else {
				req.data = JSON.parse(queryData);
				processRequest(req, res);
			}
		});

		if (req.method === 'GET' || req.method === 'DELETE') {
			processRequest(req, res);
		}
	}

	var server = http.createServer(requestListener);
	server.listen(PORT);
	console.log('Server started at http://localhost:' + PORT);
});
