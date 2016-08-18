app.controller('MainController', ['$scope', function($scope) {

  $scope.init = function(){

    $scope.birthday = {
      day: null,
      month: null,
      year: null
    };

    createData();
  };

  $scope.dobFieldChange = function(fld){
    var birthday = $scope.birthday;

    switch(fld){
      case "day":
        if(birthday.day && birthday.day.length === 2) $('#monthField').focus();
        break;
      case "month":
        if(birthday.month && birthday.month.length === 2) $('#yearField').focus();
        break;
      default:
        break;
    }
  };

  $scope.submitBirthday = function(){
    var birthday = $scope.birthday;
    var isValid = (!isNaN(birthday.year) && !isNaN(birthday.month) && !isNaN(birthday.day));

    if(isValid){
      var day = parseInt(birthday.day);
      var month = parseInt(birthday.month);
      var year = parseInt(birthday.year);

      var thisYear = new Date().getFullYear();
      var isValid = year > (thisYear - 130) && year < (thisYear + 1);

      var getDaysInMonth = function(month){
        if([1,3,5,7,8,10,12].indexOf(month) !== -1){
          return 31;
        } else if([4,6,9,11].indexOf(month) !== -1){
          return 30;
        } else{
          //feb
          var leapYear = (year % 4 === 0) && ((year % 400 === 0) || (year % 100 !== 0));
          return leapYear ? 29 : 28;
        }
      };

      isValid = month <= 12 && month> 0 && day <= getDaysInMonth(month) && day > 0;
    }

    if(isValid){
      var bdayDate = new Date(year, month, day);

      //this.createCookie('birthday', bdayDate, 1000)
      //this.createCookie('postcode', birthday.postcode, 1000)
      $scope.dob = bdayDate;
    }
  };

  function createData(){

  };

  $scope.init();

}]);