define(['angular'], function (angular) {
    'use strict';

    var mainAppControllers = angular.module('mainAppControllers', []);
    mainAppControllers.controller('NavCtrl', ['$location', 'localStorageService', 'AuthenticationService', NavCtrl]);
    mainAppControllers.controller('LoginCtrl', ['$location', 'ResourceService' ,'CryptoJSService', 'localStorageService', 'toastr' ,LoginCtrl]);
    mainAppControllers.controller('RegistrationCtrl', ['ResourceService', 'CryptoJSService', 'toastr', RegistrationCtrl]);
    mainAppControllers.controller('HomeCtrl', ['ResourceService', 'data', 'toastr', HomeCtrl]);
    mainAppControllers.controller('PersonCtrl', ['ResourceService', 'toastr', PersonCtrl]);
    mainAppControllers.controller('BidCtrl', ['ResourceService', 'toastr', BidCtrl]);
    mainAppControllers.controller('ProvaCtrl', [ProvaCtrl]);
    mainAppControllers.controller('ProfileCtrl', ['ResourceService', 'toastr', ProfileCtrl]);
    mainAppControllers.controller('ComputeFinDataScoreCtrl', ['ResourceService', 'toastr', ComputeFinDataScoreCtrl]);

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
        var salt = vm.username;
        var enc_password = CryptoJS.PBKDF2(vm.password, salt, { keySize: 256/32 });

        var user = {"username": vm.username, "password": enc_password.toString()};

        if(vm.username!==undefined || vm.password !==undefined){

            vm.ResourceService.login(user).then(function(data){
                vm.localStorageService.set("auth_token",data.auth_token);
                vm.$location.path("/home");
            },function(data, status) {
                if(status===401){
                    vm.toastr.error('Wrong username and/or password!');
                }else{
                    vm.toastr.error(data);
                }
            });

        }else{
            noty({text: 'Username and password are mandatory!',  timeout: 2000, type: 'error'});
        }
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
        var salt = vm.username;

        var enc_password = CryptoJS.PBKDF2(vm.password, salt, { keySize: 256/32 });
        var enc_check_password = CryptoJS.PBKDF2(vm.check_password, salt, { keySize: 256/32 });

        var user = {"username": vm.username, "password": enc_password.toString(), "check_password" : enc_check_password.toString() };

        if(vm.username!==undefined || vm.password !==undefined || vm.check_password !==undefined){
            if(vm.password !== vm.check_password){
                vm.toastr.warning('password and check_password must be the same!');
            }else{
                vm.ResourceService.signup(user).then(function(){
                    vm.toastr.success('User successfully registered!');
                    vm.username = null;
                    vm.password = null;
                    vm.check_password = null;
                },function(data) {
                    vm.toastr.error(data.message);
                });
            }
        }else{
            noty({text: 'Username and password are mandatory!',  timeout: 2000, type: 'warning'});
        }
    };


    function HomeCtrl(ResourceService, data, toastr)
    {
        var vm = this;
        vm.ResourceService = ResourceService;
        vm.data = data;
        vm.toastr = toastr;

        vm.people = data[0].people;
        vm.bids = data[1].bids;
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


    function BidCtrl(ResourceService, toastr)
    {
        var vm = this;
        vm.bid = null;
        vm.ResourceService = ResourceService;
        vm.toastr = toastr;
    }

    BidCtrl.prototype.createBid = function()
    {
        var vm = this;
        var Bid = {bid: vm.bid};

        vm.ResourceService.createBid(Bid).then(function(data){
            vm.bid = null;
            vm.toastr.success(data.message);
        },function(data, status) {
            if(status!==401){
                vm.toastr.error(data);
            }
        });

    };

    function ProfileCtrl(ResourceService, toastr)
    {
        var vm = this;
        vm.ResourceService = ResourceService;
        vm.toastr = toastr;
        vm.dataSources = {
          isFinancialOn : false,
          isSocialOn : false,
          isHealthOn : false,
        };
        var profile = null;
    }

    ProfileCtrl.prototype.createProfile = function()
    {
      var vm = this;

      console.log("Get the user profile");
      console.log(vm.dataSources)
      if (vm.dataSources.isFinancialOn) {
        //TODO: call computeFinProfile
        console.log("financial");
      }
      if (vm.dataSources.isSocialOn) {
        console.log("social");
      }
      if (vm.dataSources.isHealthOn) {
        console.log("health");
      }

      //vm.ResourceService.createProfile(profile);
    };

    function ComputeFinDataScoreCtrl(ResourceService, toastr)
    {
	   var vm = this;
	   vm.hello='HelloWorld';

    }

    ComputeFinDataScoreCtrl.prototype.updateFileList = function(files){
      vm.finProfile = {
        score : 94 ,
        avgIncome : 9000,
        avgSpendings : 3000,
      };

      console.log("test");
      var vm = this;
      var reader = new FileReader();

      reader.onload = function(e) {
       var text = reader.result;
      }

      for (var i = 0; i < files.files.length; i++) {
        var file = files.files[i];
        reader.readAsText(file);
        console.log(file);
        console.log(reader);
      }
    }



    return mainAppControllers;

});
