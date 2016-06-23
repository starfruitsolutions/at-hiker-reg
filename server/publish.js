Meteor.publish('hikers', function(){
	//add admin check
	return Hikers.find({});
});

Meteor.publish('settings', function(){
	//add admin check
	return Settings.find({});
});