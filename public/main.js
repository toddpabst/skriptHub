angular.module("skriptHub", [])

angular.module("skriptHub").controller("shExploreController", ["$scope", function($scope) {
$scope.showMcc = false
$scope.showReporting = false
$scope.showContent = false
$scope.showShopping = false
$scope.viewMcc = function(){
	$scope.showMcc = true
	$scope.showReporting = false
	$scope.showContent = false
	$scope.showShopping = false
}

$scope.viewReporting = function(){
	$scope.showReporting = true
	$scope.showMcc = false
	$scope.showContent = false
	$scope.showShopping = false
}

$scope.viewContent = function(){
	$scope.showReporting = false
	$scope.showMcc = false
	$scope.showContent = true
	$scope.showShopping = false
}

$scope.viewShopping = function(){
	$scope.showReporting = false
	$scope.showMcc = false
	$scope.showContent = false
	$scope.showShopping = true
}



}]);