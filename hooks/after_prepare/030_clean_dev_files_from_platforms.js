#!/usr/bin/env node

/**
 * After prepare, files are copied to the platforms/ios and platforms/android folders.
 * Lets clean up some of those files that arent needed with this hook.
 */
 var fs = require('fs');
 var path = require('path');
 var isAndroid = true;


var deleteFolderRecursive = function(removePath) {
  if( fs.existsSync(removePath) ) {
    fs.readdirSync(removePath).forEach(function(file,index){
      var curPath = path.join(removePath, file);
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(removePath);
  }
};

var deleteFile = function(removeFile) {
  if( fs.existsSync(removeFile) ) {
    fs.unlinkSync(removeFile);
  }
};

var deleteFolderContent = function(removePath) {
  if( fs.existsSync(removePath) ) {
    fs.readdirSync(removePath).forEach(function(file,index){
      var curPath = path.join(removePath, file);
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        //deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    //fs.rmdirSync(removePath);
  }
};

if(isAndroid){
  /**************************** ANDROID *************************************/
  var androidPlatformsDir_css = path.resolve(__dirname, '../../platforms/android/assets/www/css');
  var androidPlatformsDir_js = path.resolve(__dirname, '../../platforms/android/assets/www/js');
  var androidPlatformsDir_templates = path.resolve(__dirname, '../../platforms/android/assets/www/templates');
  var androidPlatformsDir_distjsapp = path.resolve(__dirname, '../../platforms/android/assets/www/dist/dist_js/app');
  var androidPlatformsDir_libleaflet = path.resolve(__dirname, '../../platforms/android/assets/www/lib/leaflet');

  deleteFolderRecursive(androidPlatformsDir_css);
  deleteFolderRecursive(androidPlatformsDir_js);
  deleteFolderRecursive(androidPlatformsDir_templates);
  deleteFolderRecursive(androidPlatformsDir_distjsapp);
  deleteFolderRecursive(androidPlatformsDir_libleaflet);

var androidPlatformsFile_1 = path.resolve(__dirname, '../../platforms/android/assets/www/css/ionic.app.css');
var androidPlatformsFile_2 = path.resolve(__dirname, '../../platforms/android/assets/www/css/ionic.app.min.css');

deleteFile(androidPlatformsFile_1);
deleteFile(androidPlatformsFile_2);  

var androidPlatformsDir_2 = path.resolve(__dirname, '../../platforms/android/assets/www/js');
// var androidPlatformsDir_3 = path.resolve(__dirname, '../../platforms/android/assets/www/lib');
var androidPlatformsDir_4 = path.resolve(__dirname, '../../platforms/android/assets/www/templates');
var androidPlatformsDir_5 = path.resolve(__dirname, '../../platforms/android/assets/www/dist/dist_js/app');

}else{
  /**************************** IOS *************************************/

  var iosPlatformsDir_css = path.resolve(__dirname, '../../platforms/ios/www/css');
  var iosPlatformsDir_js = path.resolve(__dirname, '../../platforms/ios/www/js');
  var iosPlatformsDir_templates = path.resolve(__dirname, '../../platforms/ios/www/templates');
  var iosPlatformsDir_distjsapp = path.resolve(__dirname, '../../platforms/ios/www/dist/dist_js/app');
  var iosPlatformsDir_libleaflet = path.resolve(__dirname, '../../platforms/ios/www/lib/leaflet');

    deleteFolderRecursive(iosPlatformsDir_css);
  deleteFolderRecursive(iosPlatformsDir_js);
  deleteFolderRecursive(iosPlatformsDir_templates);
  deleteFolderRecursive(iosPlatformsDir_distjsapp);
  deleteFolderRecursive(iosPlatformsDir_libleaflet);

  var iosPlatformsDir_1 = path.resolve(__dirname, '../../platforms/ios/www/css');
var iosPlatformsDir_2 = path.resolve(__dirname, '../../platforms/ios/www/js');
// var iosPlatformsDir_3 = path.resolve(__dirname, '../../platforms/ios/www/lib');
var iosPlatformsDir_4 = path.resolve(__dirname, '../../platforms/ios/www/templates');
var iosPlatformsDir_5 = path.resolve(__dirname, '../../platforms/ios/www/dist/dist_js/app');

//
//
deleteFolderRecursive(iosPlatformsDir_1);
// deleteFolderRecursive(iosPlatformsDir_2);
// // deleteFolderRecursive(iosPlatformsDir_3);
// deleteFolderRecursive(iosPlatformsDir_4);
// deleteFolderRecursive(iosPlatformsDir_5);
// deleteFolderRecursive(androidPlatformsDir_1);
 deleteFolderRecursive(androidPlatformsDir_2);
// // deleteFolderRecursive(androidPlatformsDir_3);
 deleteFolderRecursive(androidPlatformsDir_4);
 deleteFolderRecursive(androidPlatformsDir_5);
}


















