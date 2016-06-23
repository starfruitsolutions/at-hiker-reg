import { Accounts } from 'meteor/accounts-base';
Accounts.ui.config({
	passwordSignupFields: 'USERNAME_ONLY',
});

Template.AdminHomeLayout.onCreated(function () {
	var self = this;
	self.autorun(function(){
		self.subscribe('settings');
		self.subscribe('hikers');
	});
});

Template.SettingsFormLayout.onCreated(function () {
	var self = this;
	self.autorun(function(){
		self.subscribe('settings');
		self.subscribe('hikers');
	});
});

Template.AdminHomeLayout.helpers({
	hikers: ()=> {
		return Hikers.find();
	}
});

Template.RegistrationTableLayout.helpers({	
	hikers: function () {
        return Hikers;
    },
	fields: ()=> {
		return [
	           { key: 'first_name', label: 'First Name' },
	           { key: 'last_name', label: 'Last Name' },
	           { key: 'trail_name', label: 'Trail Name' },
	           { key: 'date', label: 'Date' },
	           { key: 'regNum', label: 'Registration Number' },
	           { key: 'timestamp', label: 'Timestamp' },
               { key: 'delete', label: '', fn: function () { return new Spacebars.SafeString('<button type="button" class="deletebtn">Delete</button>') } }
	       ]
	}
});

Template.SettingsFormLayout.helpers({
	publicActiveOptions: ()=> {
			return [{
			    value:"1",
			    label:"Yes",
			    selected: ((Settings.findOne({name: "PublicActive"}).value[0] === 1) ? 'selected' : '')
			  },{
			    value:"0",
			    label:"No",
			    selected:((Settings.findOne({name: "PublicActive"}).value[0] === 0) ? 'selected' : '')
			  }];
	    },
	regNumPool: ()=> {
			var pool = Settings.findOne({name: "RegNumPool"}).value.sort(function(a, b){return a-b});
			
			var ranges = [], rstart, rend;
			
			for (var i = 0; i < pool.length; i++) {
				rstart = pool[i];
				rend = rstart;
				while (pool[i + 1] - pool[i] == 1) {
					rend = pool[i + 1]; // increment the index if the numbers sequential
					i++;
				}
				ranges.push(rstart == rend ? {"start":rstart, "end":rstart} : {"start":rstart, "end":rend});
			}
			return ranges;
		},
	regNumPoolLength: ()=> {
		return Settings.findOne({name: "RegNumPool"}).value.sort(function(a, b){return a-b}).length;
	},
});

Template.AdminHomeLayout.events({
	  'change #publicActive'(event) {
		    // Prevent default browser form submit
		    event.preventDefault();
		    
		    // Update public active setting
		    Settings.update(Settings.findOne({name: "PublicActive"})._id, {
		    	$set: { 
		    		value: [$('#publicActive').val()],
		    	},
		    });
	  },
	  "submit #regPoolMod" (event) {
		  event.preventDefault();
	  },
	  'click .regPoolModbutton'(event) {
		    // Prevent default browser form submit
		    event.preventDefault();
		    
		    var start = $('#regPoolModStart').val();
		    var end = $('#regPoolModEnd').val();
		    var poolId = Settings.findOne({name: "RegNumPool"})._id;
		    
	        if ($(event.target).prop("name") == "addToPool") {
			    for (var i = start; i <= end; i++) {
			    	Settings.update(poolId, {
			    		$addToSet: {
			    			value: i,
			    		},
			    	});
			    }
	        } else if ($(event.target).prop("name") == "removeFromPool") {
	        	console.log("REMOVE");
				//generate registration number pool
			    for (var i = start; i <= end; i++) {
			    	Settings.update(poolId, {
			    		$pull: {
			    			value: i,
			    		},
			    	});
			    }
	        }
	        
	        /*//keep array sorted
	        var pool = Settings.findOne({name: "RegNumPool"}).value.sort(function(a, b){return a-b});
	        console.log("Supposed to be sorted: " + pool);
	    	Settings.update(poolId, {
	    		$set: {
	    			value: pool,
	    		},
	    	});*/
	  },
	  'click .reactive-table tbody tr': function (event) {
	    event.preventDefault();
	    var objToDelete = this;
	    // checks if the actual clicked element has the class `deletebtn `
	    if (event.target.className == "deletebtn") {
		    var poolId = Settings.findOne({name: "RegNumPool"})._id;
		    var recycleRegNum = Hikers.findOne({_id: objToDelete._id}).regNum;
			Settings.update(poolId, {
	    		$addToSet: {
	    			value: recycleRegNum,
	    		},
	    	});
	        /*var pool = Settings.findOne({name: "RegNumPool"}).value.sort(function(a, b){return a-b});
	        console.log("Supposed to be sorted: " + pool);
	    	Settings.update(poolId, {
	    		$set: {
	    			value: pool,
	    		},
	    	});*/
	    	Hikers.remove(objToDelete._id);
	    }
	  }
});