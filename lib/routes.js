FlowRouter.route('/', {
	name:'main',
	action(){
		BlazeLayout.render('MainLayout', {main:'UserHomeLayout'});
	}
});

FlowRouter.route('/admin', {
	name:'admin',
	action(){
		BlazeLayout.render('AdminHomeLayout');
	}
});

FlowRouter.route('/registration', {
	name:'registration',
	action(){
		BlazeLayout.render('MainLayout', {main:'NewHikerLayout'});
	}
});

FlowRouter.route('/success', {
	name:'success',
	action(){
		BlazeLayout.render('MainLayout', {main:'RegSuccessLayout'});
	}
});