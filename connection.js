var MongoClient = require('mongodb').MongoClient,
	_db,
	dbCollections = [
		'configuration',
		'sessions',
		'user',
	];

module.exports = {
  connectToServer: function( callback ) {
  	MongoClient.connect("mongodb://localhost:27017/tenabletest", function (err, db) {
		if (!err) {
			console.log("Connected to MongoDB.");

			for (var i = 0; i < dbCollections.length; i++) {
				var collectionName = dbCollections[i];
				db.createCollection(collectionName, function(err, collection) {
					if(!err) {
						console.log('Created collection ' + collection.collectionName);
					}
				});
			}

			_db = db;
      		return callback( err, db );
		}
		else {
			console.log(err);
		}
	});
  },

  getDb: function() {
    return _db;
  }
};