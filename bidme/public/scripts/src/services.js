define(['angular'], function (angular) {
    'use strict';

    var myAppServices = angular.module('myAppServices', []);
    myAppServices.service('Resolver',['$q', Resolver]);
    myAppServices.service('ResourceService',['$q', '$http', ResourceService]);
    myAppServices.service('TokenInterceptor',['$q','$location','localStorageService', TokenInterceptor]);
    myAppServices.service('CryptoJSService',[CryptoJSService]);
    myAppServices.service('AuthenticationService',['localStorageService', AuthenticationService]);


    function Resolver($q)
    {
        return function(promises){
            return $q.all(promises);
        }
    }

    function ResourceService($q,$http)
    {

        var _promises = {};

        var _genericCallback = function(key, data){
            _promises[key] = data;
        };

        var _promisesGetter = function(method, URL, data, key, refresh){
            if(!refresh && _promises[key]!== undefined){
                return $q.when(_promises[key]);
            }else{
                return _ajaxRequest(method, URL, data, key);
            }
        };

        var _ajaxRequest = function(method, URL, data, key){
            var deferred = $q.defer();
            $http({method: method, url: URL, data:data}).
                success(function(data) {
                    if(data.profile){
                        data[0] = data.profile;
                    }
                    deferred.resolve(data);
                    if(URL==="GET") _genericCallback(key,data);
                }).
                error(function(data) {
                    deferred.reject(data);
                }
            );
            return deferred.promise;
        };

        return {
            getPeople : function(refresh){
                return _promisesGetter('GET','/api/people', null, "people", refresh);
            },
            getBids : function(refresh, u_id){
                return _promisesGetter('GET','/api/bids/'+u_id, null, "bids", refresh);
            },
            getClientBids: function(refresh, u_id){
                return _promisesGetter('GET','/api/clientBids/'+u_id, null, "bids", refresh);
            },
            getRequests : function(refresh){
                return _promisesGetter('GET','/api/requests', null, "requests", refresh);
            },
            getClientRequests : function(refresh){
                return _promisesGetter('GET','/api/clientRequests', null, "clientRequests", refresh);
            },
            getPublicProfiles : function(refresh){
                return _promisesGetter('GET','/api/scoreRequest', null, "requests", refresh);
            },
            getInfoRequest : function(rid){
                return _promisesGetter('GET','/api/infoRequest/'+rid, null, "profile", true);
            },
            createRequest : function(request){
                return _ajaxRequest('POST', '/api/request', request, null);
            },
            createProfile : function(profile){
              return _ajaxRequest('POST', '/api/profile', profile, null);
            },
            placeBid : function(bid){
                return _ajaxRequest('POST', '/api/bid', bid, null);
            },
            createPerson : function(person){
                return _ajaxRequest('POST', '/api/person', person, null);
            },
            deletePerson : function(person){
                return _ajaxRequest('DELETE', '/api/person/'+person._id, null, null);
            },
            updateBid : function(bid){
                return _ajaxRequest('PUT', '/api/bid/'+bid._id, {bid : bid}, null);
            },
            updatePerson: function(person){
                return _ajaxRequest('PUT', '/api/person/'+person._id, {person : person}, null);
            },
            signup : function(user){
                console.log(user);
                return _ajaxRequest('POST', '/api/signup', user, null);
            },
            login : function(user){
                return _ajaxRequest('POST', '/api/login', user, null);
            }


        }
    }

    function TokenInterceptor($q, $location, localStorageService)
    {
        return {
            request: function (config) {
                config.headers = config.headers || {};

                if(localStorageService.get("auth_token")!==null)
                    config.headers.Authorization = 'Bearer '+localStorageService.get("auth_token");

                return config;
            },

            response: function (response) {
                return response || $q.when(response);
            },
            responseError : function (response) {

                if(response.config.url!=="/api/login" && response.status===401){
                    localStorageService.clearAll();
                    $location.path("/login");
                }

                return $q.reject(response);

            }
        };
    }


    function CryptoJSService(){
        return CryptoJS;
    }

    function AuthenticationService(localStorageService){
        return {
            isLogged: function()
            {
                var authenticated = false;
                if(localStorageService.get("auth_token")!==null)
                    authenticated = true;

                return authenticated;
            }
        }
    }

    return myAppServices;
});
