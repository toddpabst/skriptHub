angular.module("skriptHub", [])

angular.module("skriptHub").controller("shMainController", ["$scope", function($scope) {
$scope.signUpForm = true
$scope.signIn = function(){
	$scope.signInForm = true
	$scope.signUpForm = false
}

}]);