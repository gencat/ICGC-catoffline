angular.module('catoffline').factory('authInterceptor',['$q', '$log', '$rootScope', 'AUTH_EVENTS',
function($q, $log, $rootScope, AUTH_EVENTS) {
  return {
    responseError: function (response) {
      $rootScope.$broadcast({
        401: AUTH_EVENTS.notAuthenticated,
        403: AUTH_EVENTS.notAuthorized
      }[response.status], response);
      return $q.reject(response);
    }
  };
}])
.config(function ($httpProvider) {
  $httpProvider.interceptors.push('authInterceptor');
});
