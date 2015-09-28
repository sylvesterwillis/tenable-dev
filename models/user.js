var mongoConnection = require('../connection.js'),
	db = mongoConnection.getDb(),
	users = db.collection('user');

function User(userName, password) {
    //constructor for user object
    this.userName = userName;
    this.password = password;
}

User.prototype.save = function () {
	var userQuery = {userName: this.userName, password: this.password},
		user = users.findOne(userQuery, function(err, item) {});

	if (!this.userName || !this.password) {
		return {'message': 'Username or password is incorrect.'};
	}

	if (!user) {
		users.insert(userQuery, {w:1}, function(err, result) {
			if (err) {
				console.log('Could not insert user due to:\n' + err);
				return {'message': 'Username or password is incorrect.'};
			}
			else {
				return;
			}
		});
	}
}

module.exports = User;