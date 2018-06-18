#!/usr/bin/env node

//this hook installs all your plugins

// add your plugins to this list--either
// the identifier, the filesystem location
// or the URL
var pluginlist = [
    "cordova-plugin-camera",
      "cordova-plugin-console",
      "cordova-plugin-device",
      "cordova-plugin-file",
      "cordova-plugin-file-transfer",
      "https://github.com/jcesarmobile/FilePicker-Phonegap-iOS-Plugin.git",
      "https://github.com/jessisena/MFileChooser.git",
      "https://github.com/apache/cordova-plugin-geolocation.git",
      "cordova-plugin-inappbrowser",
      "cordova-plugin-network-information",
      "cordova-plugin-x-socialsharing",
      "cordova-plugin-x-toast",
      "org.pbernasconi.progressindicator",
      "cordova-plugin-splashscreen",
      "cordova-plugin-statusbar",
      "cordova-plugin-whitelist",
      "ionic-plugin-keyboard",
    //ionic plugin add https://github.com/danwilson/google-analytics-plugin.git
    //Tret perque donava conflicte IDFA
      "cordova-plugin-google-analytics@1.0.0",
      "cordova-custom-config",
      "cordova.plugins.diagnostic",

    //iOS
    //  "cordova-sqlite-ext",
    //android
      "https://github.com/jessisena/my-cordova-sqlite-storage.git"
];

// no need to configure below

var fs = require('fs');
var path = require('path');
var sys = require('sys')
var exec = require('child_process').exec;

function puts(error, stdout, stderr) {
    sys.puts(stdout)
}

pluginlist.forEach(function(plug) {
    exec("ionic plugin add " + plug, puts);
});
