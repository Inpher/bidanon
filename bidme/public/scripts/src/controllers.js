define(['angular'], function (angular) {
	'use strict';

	var mainAppControllers = angular.module('mainAppControllers', []);
	mainAppControllers.controller('NavCtrl', ['$location', 'localStorageService', 'AuthenticationService', NavCtrl]);
	mainAppControllers.controller('LoginCtrl', ['$location', 'ResourceService' ,'CryptoJSService', 'localStorageService', 'toastr' ,LoginCtrl]);
	mainAppControllers.controller('RegistrationCtrl', ['ResourceService', 'CryptoJSService', 'toastr', RegistrationCtrl]);
	mainAppControllers.controller('HomeCtrl', ['$location', 'ResourceService', 'data',  'localStorageService', 'toastr', HomeCtrl]);
	mainAppControllers.controller('PersonCtrl', ['ResourceService', 'toastr', PersonCtrl]);
	mainAppControllers.controller('RequestCtrl', ['ResourceService', 'toastr', RequestCtrl]);
	mainAppControllers.controller('InfoRequestCtrl', ['ResourceService', 'data', 'toastr', InfoRequestCtrl]);
	mainAppControllers.controller('ProvaCtrl', [ProvaCtrl]);
	mainAppControllers.controller('ProfileCtrl', ['$location', 'ResourceService', 'toastr', ProfileCtrl]);

	function ProvaCtrl() {
		var vm = this;
		vm.user = "";
	}

	ProvaCtrl.prototype.printHello = function()
	{
		var vm = this;
		return "Hello World "+vm.user;
	};


	function NavCtrl($location, localStorageService, AuthenticationService)
	{
		var vm = this;
		vm.$location = $location;
		vm.localStorageService = localStorageService;
		vm.isAuthenticated = AuthenticationService.isLogged()
	}

	NavCtrl.prototype.logout = function ()
	{
		var vm = this;
		vm.localStorageService.clearAll();
		deleteKeyringFromTheSession();
		vm.$location.path("/login");
	};



	function LoginCtrl ($location, ResourceService, CryptoJS, localStorageService, toastr)
	{
		var vm = this;
		vm.$location = $location;
		vm.ResourceService = ResourceService;
		vm.CryptoJS = CryptoJS;
		vm.localStorageService = localStorageService;
		vm.toastr = toastr;

		vm.failed_login = "";
	}

	LoginCtrl.prototype.submit = function()
	{
		var vm = this;
	if(vm.username===undefined || vm.password ===undefined){
			return noty({text: 'Username and password are mandatory!',  timeout: 2000, type: 'error'});
	}

		deleteKeyringFromTheSession();
		var salt = vm.username;
		var enc_password = CryptoJS.PBKDF2(vm.password, salt, { keySize: 256/32 });
		var user = {"username": vm.username, "password": enc_password.toString()};

		vm.ResourceService.login(user).then(function(data){
			vm.localStorageService.set("auth_token",data.auth_token);
			vm.localStorageService.set("type", data.type);
			vm.localStorageService.set("u_id", data._id);
			importAndDecryptKeyring(data.encKeyRing, vm.password).then(function(kr) {
			    saveKeyringInTheSession(kr);
			    if((data.type == 'BANK') || 
				    (data.type == "CLIENT" && data.profile_id)){
				vm.$location.path("/home");
				window.location.href = "/#/home";
				return;
			    } else {
				vm.$location.path("/profile");
				window.location.href = "/#/profile";
				return;
			    }
			  // window.location.href="/#/home"; //TODO For some reason, the line below is not sufficient anymore
			  // return vm.$location.path("/home");
			}).catch(function(err) {
			  console.log(err);
			  return vm.toastr.error('Failed to decrypt the keyring (ignoring, for now [TODO])!');
			});
		},function(data, status) {
			if(status===401){
			  return vm.toastr.error('Wrong username and/or password!');
			}else{
			  return vm.toastr.error(data);
			}
		});
	};

	function RegistrationCtrl (ResourceService, CryptoJS, toastr)
	{
		var vm = this;
		vm.ResourceService = ResourceService;
		vm.CryptoJS = CryptoJS;
		vm.toastr = toastr;
	}

	RegistrationCtrl.prototype.signup = function()
	{
	var vm = this;
		if(vm.username===undefined || vm.password===undefined){
		return noty({text: 'Username and password are mandatory!',  timeout: 2000, type: 'warning'});
	}
	if(vm.password !== vm.check_password){
		return vm.toastr.warning('password and check_password must be the same!');
	}
	//generate a keyring
	generateEncryptAndExportKeyring(vm.password).then(function(ekr) {
		var salt = vm.username;
		var enc_password = CryptoJS.PBKDF2(vm.password, salt, { keySize: 256/32 });

		var user = {
		"username": vm.username,
		"password": enc_password.toString(),
		"type": "CLIENT",
		"encKeyRing": ekr,
		};

		return vm.ResourceService.signup(user);
	}).then(function() {
		vm.toastr.success('User successfully registered!');
		vm.username = null;
		vm.password = null;
		vm.check_password = null;
	},function(data) {
		console.log(data);
		vm.toastr.error(data.message);
	});
	};

	RegistrationCtrl.prototype.signupBank = function()
	{
	var vm = this;
		if(vm.username===undefined || vm.password===undefined){
		return noty({text: 'Username and password are mandatory!',  timeout: 2000, type: 'warning'});
	}
	if(vm.password !== vm.check_password){
		return vm.toastr.warning('password and check_password must be the same!');
	}
	//generate a keyring
	generateEncryptAndExportKeyring(vm.password).then(function(ekr) {
		var salt = vm.username;
		var enc_password = CryptoJS.PBKDF2(vm.password, salt, { keySize: 256/32 });

		var user = {
		"username": vm.username,
		"password": enc_password.toString(),
		"type": "BANK",
		"encKeyRing": ekr,
		};

		return vm.ResourceService.signup(user);
	}).then(function() {
		vm.toastr.success('User successfully registered!');
		vm.username = null;
		vm.password = null;
		vm.check_password = null;
	},function(data) {
		console.log(data);
		vm.toastr.error(data.message);
	});
	};


	function InfoRequestCtrl(ResourceService, data, toastr) {
		var vm = this;
		vm.bid = null;
		vm.data = data;
		vm.ResourceService = ResourceService;
		vm.toastr = toastr;
		vm.profile = data[0].profile;
	};

	InfoRequestCtrl.prototype.placeBid = function(index){
		var vm = this;
		var bid = {
			intRate: vm.interestRate, 
			maturity: vm.maturity,
			r_id: $('#thereqidishere').val()
	   	};
		vm.ResourceService.placeBid(bid).then(function(){
			vm.toastr.success("Bid Added!");
		},function(data, status) {
			if(status!==401){
				vm.toastr.error(data);
			}
		});
	};

	function HomeCtrl($location, ResourceService, data, localStorageService,toastr)
	{
		var vm = this;
		vm.ResourceService = ResourceService;
		vm.data = data;
		vm.toastr = toastr;
		vm.type = localStorageService.get('type');

		vm.requests = data[0].requests;
		vm.bids = data[1].bids;
		vm.clientRequests = data[2].clientRequests;
		vm.clientBids = data[3].clientBids;
		
		vm.$location = $location;
	}
	HomeCtrl.prototype.updatePerson = function(index, modify)
	{
		var vm = this;
		var person = vm.people[index];


		if(modify){
			vm.people[index].modify=true;
		}else{
			vm.ResourceService.updatePerson(person).then(function(){
				vm.people[index].modify=false;
				vm.toastr.success("Person successfully updated!");
			},function(data, status) {
				if(status!==401){
					vm.toastr.error(data);
				}
			});
		}
	};

	HomeCtrl.prototype.updateBid = function(index, modify)
	{
		var vm = this;
		var bid = vm.bids[index];

		if(modify){
			vm.bids[index].modify=true;
		}else{

			vm.ResourceService.updateBid(bid).then(function(){
				vm.bids[index].modify=false;
				vm.toastr.success("Bid successfully updated!");
			},function(data, status) {
				if(status!==401){
					vm.toastr.error(data);
				}
			});
		}
	};

	HomeCtrl.prototype.deleteBid = function(index)
	{
		var vm = this;
		var bid = vm.bids[index];

		vm.ResourceService.deleteBid(bid).then(function(){
			vm.bids.splice(index, 1);
			vm.toastr.success("Bid successfully deleted!");
		},function(data, status) {
			if(status!==401){
				vm.toastr.error(data);
			}
		});
	};

	HomeCtrl.prototype.deletePerson = function(index)
	{
		var vm = this;
		var person = vm.people[index];

		vm.ResourceService.deletePerson(person).then(function(){
			vm.people.splice(index, 1);
			vm.toastr.success("Person successfully deleted!");
		},function(data, status) {
			if(status!==401){
				vm.toastr.error(data);
			}
		});
	};

	HomeCtrl.prototype.showProfile = function(request)
	{
		var vm = this;
		var id = request._id;
		vm.$location.path('/infoRequest/' + id);
	}

	function PersonCtrl(ResourceService, toastr) {
		var vm = this;
		vm.person = null;
		vm.ResourceService = ResourceService;
		vm.toastr = toastr;
	}

	PersonCtrl.prototype.createPerson = function()
	{
		var vm = this;
		var person = {person: vm.person};

		vm.ResourceService.createPerson(person).then(function(data){
			vm.person = null;
			vm.toastr.success(data.message);
		},function(data, status) {
			if(status!==401){
				vm.toastr.error(data);
			}
		});
	};


	function RequestCtrl(ResourceService, toastr)
	{
		var vm = this;
		vm.request = null;
		vm.ResourceService = ResourceService;
		vm.toastr = toastr;
	}

	RequestCtrl.prototype.createRequest = function()
	{
		var vm = this;
		var Request = {request: vm.request};

		vm.ResourceService.createRequest(Request).then(function(data){
			vm.request = null;
			vm.toastr.success(data.message);
		},function(data, status) {
			if(status!==401){
				vm.toastr.error(data);
			}
		});

	};

	function ProfileCtrl($location, ResourceService, toastr)
	{
		var vm = this;
		vm.ResourceService = ResourceService;
		vm.toastr = toastr;
		vm.$location = $location;
		vm.dataSources = {
		  isFinancialOn : false,
		  isSocialOn : false,
		  isHealthOn : false,
		};
	}


	function computeFinScore(avgIncome,avgSpendings){
	// Heuristics: We could easily hook up census open data to
	// compute a meaningful statistical score
	  var score = 0.;
	  if((avgIncome != 0) || (avgSpendings != 0)){
		var score = avgIncome/(avgIncome - avgSpendings);
	  }
	  return score;
	}

	function computeFinProfile(text)
	{
	  // Parse JSON
	  var trans = $.parseJSON(text)

	  // I hope we get some bonus for some nice lambda function in javascript
	  // Get the sum of all positive transactions
	  var pos = trans.filter(function(current){return current.details.value.amount > 0})
		.reduce(function(sum,current){ return sum + parseFloat(current.details.value.amount)},0);
	  // Get the sum of all negative transactions
	  var neg = trans.filter(function(current){return current.details.value.amount < 0})
		.reduce(function(sum,current){ return sum + parseFloat(current.details.value.amount)},0);

	  // Git first and last timestamp
	  var firstTimestamp = trans.reduce(function(min, current){ return Math.min(min,Date.parse(current.details.completed)) }, Date.parse(trans[0].details.completed));
	  var lastTimestamp = trans.reduce(function(max, current){ return Math.max(max,Date.parse(current.details.completed)) }, Date.parse(trans[0].details.completed));
	  var timeSpan = (lastTimestamp - firstTimestamp)/(Date.parse("Sept 12 2016")-Date.parse("Aug 12 2016"));

	  return {
		score: computeFinScore(pos/timeSpan,neg/timeSpan),
		avgIncome: pos/timeSpan,
		avgSpendings: neg/timeSpan,
	  };
	}

	ProfileCtrl.prototype.createProfile = function()
	{
	  var vm = this;
	  var counter = 0;
	  var Profile = {
		profile : {
		  financial: null,
		  social: null,
		  health: null,
		}
	  };

	  console.log("Get the user profile");
	  console.log(vm.dataSources)
	  if (vm.dataSources.isFinancialOn) {
		//Profile.profile.financial = vm.updateFileList();
		var futureProfile = vm.updateFileList();
		futureProfile.then(function (res) {
		  Profile.profile.financial = res;
		  vm.ResourceService.createProfile(Profile);
		  gohome();
		});
	  } else { gohome(); }
	  if (vm.dataSources.isSocialOn) {
		console.log("social");
		gohome();
	  } else { gohome(); }
	  if (vm.dataSources.isHealthOn) {
		console.log("health");
		gohome();
	  } else { gohome(); }

	  function gohome() {
		  counter ++;
		  if (counter == 3) {
			vm.$location.path("/home");
			window.location.href = "/#/home";
		  }
	  };

	};

	ProfileCtrl.prototype.updateFileList = function(){
	  var vm = this;
	  var fileList = $('#dataFileList').prop('files');
	  var reader = new FileReader();

	  console.log("toto");

	  var file = fileList.item(0);
	  var promise = new Promise(function(resolve,reject){
		reader.onloadend = function(e) {
		  var text = reader.result;
		  vm.finProfile = computeFinProfile(text);
		  resolve(vm.finProfile);
		}

		reader.readAsText(file);
	  })

	  return promise;
	}

	return mainAppControllers;
});
