import { Accounts } from 'meteor/accounts-base';
Accounts.ui.config({
	passwordSignupFields: 'USERNAME_ONLY',
});

Template.AdminHomeLayout.onCreated(function () {
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
	
});

Template.SettingsFormLayout.onCreated(function () {
	this.subscribe('settings');
});

Template.SettingsFormLayout.helpers({
	publicActiveOptions: ()=> {
			var publicActive= Settings.findOne({'name': "PublicActive"});
				return [{
				    value:"1",
				    label:"Yes",
				    selected: ((publicActive.value[0] == 1) ? 'selected' : '')
				  },{
				    value:"0",
				    label:"No",
				    selected: ((publicActive.value[0] == 0) ? 'selected' : '')
				  }];
	    },
	regNumPool: ()=> {
			var regNumPool = Settings.findOne({name: "RegNumPool"});
			var pool = regNumPool.value.sort(function(a, b){return a-b});
			
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
		var regNumPool=Settings.findOne({name: "RegNumPool"});
			return regNumPool.value.sort(function(a, b){return a-b}).length;
	},
});

Template.SettingsFormLayout.events({
	  'change #publicActive'(event) {		   
		    var publicActiveId =Settings.findOne({name: "PublicActive"})._id;
		    var value =[$('#publicActive').val()];
		    // Update public active setting
		    Settings.update(publicActiveId, {$set: { value: value},});
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
});
Template.RegistrationTableLayout.onCreated(function () {
	this.subscribe('hikers');	
});

Template.dateRangePicker.rendered=function () {
	$('.datetimepicker').each(function(){
        $(this).datetimepicker(); 
   });	
}

//get hiker data within registration range if set
registrationTableData = function () {
	if (Session.get('min') && Session.get('max')){ 
		//filter between 2 numbers
		var min = Session.get( "min" );
		var max = Session.get( "max" );
		console.log('session set');
		var filter ={ 
				timestamp: { $gte: min, $lte: max }
		}
		return Hikers.find(filter).fetch();
	}
	else{
		return Hikers.find().fetch();
	}
};

Template.RegistrationTableLayout.helpers({
	reactiveDataFunction: function () {
        return registrationTableData;
    },
    optionsObject: {
    	columns: [
    	          { data: 'first_name', title: 'First Name <i class="fa fa-arrows-v" aria-hidden="true"></i>' },
    	          { data: 'last_name', title: 'Last Name <i class="fa fa-arrows-v" aria-hidden="true"></i>' },
    	          { data: 'trail_name', title: 'Trail Name <i class="fa fa-arrows-v" aria-hidden="true"></i>' },    	          
    	          { data: 'regNum', title: 'Registration Number <i class="fa fa-arrows-v" aria-hidden="true"></i>' },
    	          { data: 'date', title: 'Estimated Arrival <i class="fa fa-arrows-v" aria-hidden="true"></i>' },
    	          { data: 'timestamp', title: 'Timestamp <i class="fa fa-arrows-v" aria-hidden="true"></i>' },
    	          { data: '_id', title: 'Delete', render: deleteButton }
    	        ],
    	tableClasses: 'table-striped table-bordered table-condensed',
    	// ... see jquery.dataTables docs for more
    }
});

function deleteButton(cellData, renderType, currentRow) {
    // You can return html strings, change sort order etc. here
    // Again, see jquery.dataTables docs
	return new Spacebars.SafeString('<button _id='+cellData+' type="button" class="deletebtn">Delete</button>');
}

Template.dateRangePicker.events({
	  'click #date-filter': function (event) {
		  Session.set( "min", new Date($('#min').val()));
		  Session.set( "max", new Date($('#max').val()));
	  },
});
Template.RegistrationTableLayout.events({
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
       
    	Hikers.remove(objToDelete);
	    
	  }
});