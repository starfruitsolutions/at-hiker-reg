Template.UserHomeLayout.onCreated(function () {	
		this.subscribe('settings');
});

Template.UserHomeLayout.helpers({
	connected: function(){
		return Meteor.status().connected;
	},
	registrationOpen: function(){
		if(Settings.findOne({'name': "PublicActive"}).value[0] == 0){
			return false;
		}
		else{
			return true;
		}
	}
}); 

AutoForm.hooks({
  insertHikerForm: {
	  onSubmit: function(insertDoc, updateDoc, currentDoc){
		  var self= this;
		  Meteor.call('insertHiker', insertDoc, function(error, result){
			  if(error){
				  alert(error.reason);
			  }else{
				  self.done();
			  }			  
		  });		  
		  return false;
	  },
	  onSuccess: function(formType, result) {
		FlowRouter.go('/success');
	  },
  }
});

Template.RegSuccessLayout.onCreated(function () {
	var self = this;
	self.buttonStateDisabled = new ReactiveVar(false);
	//get registration number
	Meteor.call("lastRegistration", function(error, result){
		Session.set("lastRegNum", result);
	});
});
Template.RegSuccessLayout.helpers({
	regNum: function() {
		return Session.get("lastRegNum");
	},
	buttonStateDisabled: function() { 
		return Template.instance().buttonStateDisabled.get(); 
	},
});
Template.RegSuccessLayout.events({
	'click .print'(event, instance) {
	  if (Meteor.isCordova) {
		  	//to stop button clicking
		  	instance.buttonStateDisabled.set(true);
			//printer initialization
			var macAddress= '0F:03:E0:C2:2C:72'
			document.addEventListener("deviceready", onDeviceReady, false); 
			function onDeviceReady() { 					
				window.initPrinter(macAddress, printerSuccess, printerFailed); 	
			}
			function printerSuccess(message){
				//send to print
				printTicket(Session.get("lastRegNum"));
			}
			function printerFailed(message){
				alert(message);
			}
			// print ticket	
			function printFailed(error){
				alert(error+" Please try again.");
				instance.buttonStateDisabled.set(false);
				//disconnect printer
				window.closePrinterConnection(false);
			}
			function printSuccess(data){
				alert('Take your slip. It will be required to recieve your card');
				instance.buttonStateDisabled.set(false);
				//disconnect printer
				window.closePrinterConnection(false);
			}
			function printTicket(num){
				var ticket ="\n \
					\n \
					\n \
					Baxter State Park \n \
					AT Hiker Registration \n \
					\n \
					Registration number: "+num+"\n \
					\n \
					Keep this slip safe. \n \
					It will be required to recieve your card. \n \
					\n \
					\n \
					\n \
					\n \
					\n \
					\n ";
					 
					window.printText(ticket,printSuccess, printFailed);							
			}
			
	  	}
	},
});
