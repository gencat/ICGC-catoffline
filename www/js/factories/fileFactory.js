angular.module('catoffline').factory('fileFactory',
['$q',
'$log',
function(
    $q,
    $log
) {

    var self = this;

       self.getParentDirectory = function(path) {
            var deferred = $q.defer();
            window.resolveLocalFileSystemURL(path, function(fileSystem) {
                fileSystem.getParent(function(result) {
                    deferred.resolve(result);
                }, function(error) {
                    deferred.reject(error);
                });
            }, function(error) {
                deferred.reject(error);
            });
            return deferred.promise;
        };

        self.getEntriesAtRoot = function() {
            var deferred = $q.defer();
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
                var directoryReader = fileSystem.root.createReader();
                directoryReader.readEntries(function(entries) {
                    deferred.resolve(entries);
                }, function(error) {
                    deferred.reject(error);
                });
            }, function(error) {
                deferred.reject(error);
            });
            return deferred.promise;
        };

        self.getEntries = function(path) {
            var deferred = $q.defer();
            //$log.info("entra a get entries amb path:"+path);
            window.resolveLocalFileSystemURL(path, function(fileSystem) {
                var directoryReader = fileSystem.createReader();
                directoryReader.readEntries(function(entries) {
                    deferred.resolve(entries);
                }, function(error) {
                    deferred.reject(error);
                });
            }, function(error) {
                deferred.reject(error);
            });
            return deferred.promise;
        };

    return self;
}]);
