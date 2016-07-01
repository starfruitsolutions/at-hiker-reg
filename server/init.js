import { Meteor } from 'meteor/meteor';
Meteor.startup(() => {
	// code to run on server at startup
	
	//if database is empty, insert default values
	if (Settings.find().count() === 0) {
		Settings.insert({name: "RegNumPool", value: []});
		Settings.insert({name: "PublicActive", value: [0]});
	}
});

import { Accounts } from 'meteor/accounts-base';
Accounts.config({
	forbidClientAccountCreation : false,
});

Hikers.before.insert(function (userId, doc) {
	  doc.regNum = Settings.findOne({name: "RegNumPool"}).value.sort(function(a, b){return a-b})[0];
});

Hikers.after.insert(function (userId, doc) {
	var pool = Settings.findOne({name: "RegNumPool"})._id;
	//pull used number from pool
	Settings.update(pool, {
		$pull: {
			value: doc.regNum,
		},
	});
});

Meteor.methods({
	insertHiker: function (insertDoc) {
		console.log(insertDoc);
		Hikers.insert(insertDoc, function(error, docInserted){
			console.log(docInserted);
		});
	},
	lastRegistration: function(){
		return Hikers.findOne({}, { sort: { timestamp: -1 }}).regNum;
	}
})