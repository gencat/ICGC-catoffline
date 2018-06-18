// Courtesy of https://github.com/igreulich/angular-truncate/blob/master/src/igTruncate.js

angular.module('igTruncate', []).filter('truncate', function (){
  return function (text, length, end){

    if (text !== undefined){

        if(angular.isString(text)){
          var valorNumerico = Number(text);
          return valorNumerico.toFixed(length);
        }else{
          return text.toFixed(length);
        }


    }
  };
});
