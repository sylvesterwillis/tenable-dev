var crypto = require('crypto'),
	mongoConnection = require('../connection.js'),
	db = mongoConnection.getDb(),
	users = db.collection('user'),
	sessions = db.collection('session'),
	User = require('../models/user.js'),
	HASHTYPE = 'sha256',
	//Not ideal, we should store in environment variable instead.
	SECRET_KEY = '1c55f626bb52e110e57b9fecff3059945547297ede0d2e2f23d94b9b86268e80';

module.exports = {
	login: function (req, res) {
		if (req.method === 'POST') {
			var ph = crypto.createHash(HASHTYPE).update(req.data.password),
				passwordHash = ph.digest('hex'),
				userQuery = {userName: req.data.userName, password: passwordHash},
				user;

			users.findOne(userQuery, function (err, item) {
				user = item;

				if (!req.data.userName || !req.data.password || !user) {
					res.writeHead(404);
					res.end('Username or password is incorrect.');
				}
				else {
					var randHex = crypto.randomBytes(64).toString('hex'),
						sh = crypto.createHmac(HASHTYPE, SECRET_KEY).update(randHex),
						sessionHash = sh.digest('hex'),
						sessionQuery = {userName: user.userName, sessionId: sessionHash};

					sessions.remove({userName: user.userName});
					sessions.insert(sessionQuery, {w:1}, function(err, result) {
						if (err) {
							console.log('Could not insert session due to:\n' + err);
							res.writeHead(404);
							res.end('Error creating session.');
						}

						res.setHeader("Set-Cookie", "id=" + result.ops[0].sessionId);
						res.writeHead(200);
						res.end();
					});
				}
			});
		}
		else {
			res.writeHead(404);
			res.end('This method is not allowed on this resource.');
		}
	},

	logout: function (req, res, userName) {
		if (req.method === 'GET') {
				sessions.remove({userName: userName});
				res.setHeader("Set-Cookie", "");
				res.writeHead(200);
				res.end();
		}
		else {
			res.writeHead(404);
			res.end('This method is not allowed on this resource.');
		}
	},

	register: function (req, res) {
		if (req.method === 'POST') {
			var h = crypto.createHash(HASHTYPE).update(req.data.password),
				passwordHash = h.digest('hex'),
				userQuery = {userName: this.userName, password: passwordHash},
				userCollection = users.findOne(userQuery, function(err, item) {}),
				user;

			if (!req.data.userName || !req.data.password || userCollection) {
				res.writeHead(404);
				res.end('An error occurred while registering user.');
			}
			else {
				//We could send off a registration email to user to allow user to verify
				//registration here.
				user = new User(req.data.userName, passwordHash);
				var err = user.save();
				if (err) {
					res.writeHead(404);
					res.end('An error occurred while registering user.');
				}
				res.writeHead(201);
				res.end('Created');
			}
		}
		else {
			res.writeHead(404);
			res.end('This method is not allowed on this resource.');
		}
	}
};