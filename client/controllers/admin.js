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
	//load the export stuff
	$.getScript('js/tableExport.js', function(){
        // script should be loaded and do something with it. 

    });
	$.getScript('js/jquery.base64.js', function(){
        // script should be loaded and do something with it. 

    });
	$.getScript('js/jspdf/libs/sprintf.js', function(){
        // script should be loaded and do something with it. 

    });
	$.getScript('js/jspdf/jspdf.js', function(){
        // script should be loaded and do something with it. 

    });
	$.getScript('js/jspdf/libs/base64.js', function(){
        // script should be loaded and do something with it. 

    });
	Session.set('min','0')
	
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

//datatable
dataTableData = function () {
	if (Session.get('min') && Session.get('max')){ 
		//filter between 2 numbers
		var min = Session.get( "min" );
		var max = Session.get( "max" );
		console.log('session set');
		var filter ={ 
				regNum: { $gte: min, $lte: max }
		}
		return Hikers.find(filter).fetch();
	}
	else{
		return Hikers.find().fetch();
	}
};

Template.RegistrationTableLayout.helpers({
	reactiveDataFunction: function () {
        return dataTableData;
    },
    optionsObject: {
    	columns: [
    	          { data: 'first_name', title: 'First Name' },
    	          { data: 'last_name', title: 'Last Name' },
    	          { data: 'trail_name', title: 'Trail Name' },    	          
    	          { data: 'regNum', title: 'Registration Number' },
    	          { data: 'date', title: 'Estimated Arrival' },
    	          { data: 'timestamp', title: 'Timestamp' },
    	          { data: '_id', title: 'Delete', render: deleteButton }
    	        ],
    	dom: 'lftp', 
    	// ... see jquery.dataTables docs for more
    }
});

function deleteButton(cellData, renderType, currentRow) {
    // You can return html strings, change sort order etc. here
    // Again, see jquery.dataTables docs
	return new Spacebars.SafeString('<button _id='+cellData+' type="button" class="deletebtn">Delete</button>');
}
////old table
//Template.RegistrationTableLayout.helpers({	
//	hikers: function () {
//        return Hikers;
//    },
//	fields: ()=> {
//		return [
//	           { key: 'first_name', label: 'First Name' },
//	           { key: 'last_name', label: 'Last Name' },
//	           { key: 'trail_name', label: 'Trail Name' },
//	           { key: 'date', label: 'Date' },
//	           { key: 'regNum', label: 'Registration Number' },
//	           { key: 'timestamp', label: 'Timestamp' },
//               { key: 'delete', label: '', fn: function () { return new Spacebars.SafeString('<button type="button" class="deletebtn">Delete</button>') } }
//	       ]
//	}
//});

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
	  'change #min': function (event) {
		  Session.set( "min", parseInt($('#min').val()));
	  },
	  'change #max': function (event) {
		  Session.set( "max", parseInt($('#max').val()));
	  },
	  'click .deletebtn': function (event) {
	    event.preventDefault();
	    var objToDelete=$(event.currentTarget).attr("_id");	    	  	   
    	console.log('delete:'+objToDelete);
	    var poolId = Settings.findOne({name: "RegNumPool"})._id;
	    var recycleRegNum = Hikers.findOne({_id: objToDelete}).regNum;
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
    	Hikers.remove(objToDelete);
	    
	  }
});