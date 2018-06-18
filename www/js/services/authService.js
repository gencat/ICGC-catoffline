angular.module('catoffline').service('authService',
['$q', '$log', '$http', '$localstorage', 'INSTAMAPS_ACTIONS', 'CommonFunctionFactory',
function($q, $log, $http, $localstorage, INSTAMAPS_ACTIONS, CommonFunctionFactory) {

    var self = this;

    var LOCAL_TOKEN_KEY = 'instamapsToken';
    var LOCAL_UID = 'uid';

    self.uid = '';
    self.authToken = "";
    self.isAuthenticated = false;

    self.loadUserCredentials = function() {
      //$log.info("JESS loadcredentials......");
      var token = $localstorage.get(LOCAL_TOKEN_KEY, '');
      if (token && token!=='') {
        self.isAuthenticated = true;
        self.authToken = token;
        self.uid = $localstorage.get(LOCAL_UID, '');
      }
    };
    self.loadUserCredentials();

    function storeUserCredentials(token, username) {

      //$log.info("JESS storeUserCredentials......");
      $localstorage.set(LOCAL_TOKEN_KEY, token);
      $localstorage.set(LOCAL_UID, username);

      self.isAuthenticated = true;
      self.authToken = token;
      self.uid = username;
    }

    self.login = function(username, pw) {

      var def = $q.defer();
      $http({method: 'GET',
            url: INSTAMAPS_ACTIONS.host_app + INSTAMAPS_ACTIONS.loginUser + 'user='+username+'&password='+pw+'&'
      }).then(function successCallback(response) {
          $log.info("OK: "+JSON.stringify(response));
          if(response.data.status == "ERROR"){
              def.resolve(false);
          }else{
              //$log.info("token:"+response.data.token);
              storeUserCredentials(response.data.token, response.data.uid);
              def.resolve(true);
          }
        }, function errorCallback(response) {
          CommonFunctionFactory.recordError("KO: "+JSON.stringify(response));
          def.reject();
      });
      return def.promise;
    };

    self.loginSocialGoogle = function(socialId) {
        var def = $q.defer();
        $log.info("loginSocialGoogle");
        $log.info("URL login social:"+ INSTAMAPS_ACTIONS.host_app + INSTAMAPS_ACTIONS.socialAuth + 'id=googleplus&');

        $http({method: 'GET',
              url: INSTAMAPS_ACTIONS.host_app + INSTAMAPS_ACTIONS.socialAuth + 'id=googleplus&'
        }).then(
            function successCallback(response) {
                $log.info("OK: "+JSON.stringify(response));
                if(response.data.status == "ERROR"){
                    def.resolve(false);
                }else{
                    //$log.info("token:"+response.data.token);
                    //storeUserCredentials(response.data.token, username);
                    $log.info(JSON.stringify(response.data));
                    def.resolve(response.data);
                }
            }, function errorCallback(response) {
                CommonFunctionFactory.recordError("KO: "+JSON.stringify(response));
        });

        return def.promise;
    };

    self.loginSocial = function(socialId) {

        var def = $q.defer();

       $log.info("loginSocial!");

       $http({method: 'GET',
             url: INSTAMAPS_ACTIONS.host_app + INSTAMAPS_ACTIONS.loginSocial + 'id='+socialId+'&'
       }).then(function successCallback(response) {
           $log.info("OK: "+JSON.stringify(response));
           if(response.data.status == "ERROR"){
               def.resolve(false);
           }else{
               $log.info("token:"+response.data.token);
               storeUserCredentials(response.data.token, username);
               def.resolve(true);
           }
         }, function errorCallback(response) {
           CommonFunctionFactory.recordError("KO: "+response);
       });
       return def.promise;

    };

    self.logout = function() {
      destroyUserCredentials();
    };

    function destroyUserCredentials() {
      self.authToken = '';
      self.isAuthenticated = false;
      $localstorage.set(LOCAL_TOKEN_KEY, '');
      $localstorage.set(LOCAL_UID, '');
    }

    self.loginSocial = function(token, username){
      storeUserCredentials(token, username);
    };

    return self;

}]);

