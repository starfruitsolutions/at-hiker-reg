Hikers.allow({
	insert: function(userId, doc){
		return userId;
	},
	remove: function(userId, doc){
		return userId;
	}
});

RegistrationSchema = new SimpleSchema({
	first_name : {
		type: String,
		label: "First Name"
	},
	last_name : {
		type: String,
		label: "Last Name"
	},
	trail_name : {
		type: String,
		label: "Trail Name"
	},
	date : {
		type: Date,
		label: "Estimated Arrival Date",
		autoform: {
		      type: "bootstrap-datepicker"
		    }
	},
	regNum : {
		type: Number,
		label: "Registration Num",
		autoValue: function() {
			return 0;
		},
		autoform: {
			type: "hidden"
		}
	},
	timestamp : {
		type: Date, 
		label: "Timestamp",
		autoValue: function() {
			return new Date();
		},
		autoform: {
			type: "hidden"
		}
	},
});

Hikers.attachSchema(RegistrationSchema);
