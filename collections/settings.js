Settings.allow({
	insert: function(userId, doc){
		return userId;
	},
	update: function(userId, doc){
		return userId;
	}
});

SettingsSchema = new SimpleSchema({
	name : {
		type: String,
		label: "Name"
	},
	value : {
		type: [Number],
		label: "Value"
	},
});

Settings.attachSchema(SettingsSchema);