angular.module('catoffline').controller('InformationController',
['$scope',
'$log',
'$cordovaSocialSharing',
'$cordovaInAppBrowser',
'CATOFFLINE_INFO',
'CommonFunctionFactory',
function(
  $scope,
  $log,
  $cordovaSocialSharing,
  $cordovaInAppBrowser,
  CATOFFLINE_INFO,
  CommonFunctionFactory
) {

  $scope.app = {
    name: CATOFFLINE_INFO.app_name,
    version : CATOFFLINE_INFO.app_version
  };

  $scope.sendEmail = function(){

    var message = "";
    var subject = "Comentaris Catalunya Offline";
    var toArr = ["icgc@icgc.cat"];

    $cordovaSocialSharing.shareViaEmail(message, subject, toArr, null, null, null)
              .then(function(){

              }, function(err){
                CommonFunctionFactory.recordError("Send email KO");
              });
  };

  $scope.openWebICC = function(){

        $cordovaInAppBrowser.open(
            'http://icgc.cat/',
            '_blank',
            {location: 'yes'}).then(
        function(event) {

        }).catch(function(event) {
            CommonFunctionFactory.recordError("cordovaInApp browser openWebICC");
        });

    };



}]);
