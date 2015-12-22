angular.module('trip', [])

.factory('googleMapsService', ['$http', 'GMAPS_KEY',
  function($http, GMAPS_KEY){
    // Used to query Google Maps API
    var data = {};

    var obj = {};
    obj.getDistance = function(opts) {
      var origin = opts.origin;
      var destination = opts.destination;
      var units = typeof opts.units !== 'undefined' ? opts.units : 'imperial'
      var url = 'https://maps.googleapis.com/maps/api/distancematrix/json?' +
                'origins=' + origin + '&destinations=' + destination +
                '&units=' + units + '&key=' + GMAPS_KEY;
      console.log('GETting', url)
      $http.get(url).then(function successCallback(res) {
        data.origin = res.data.origin_addresses[0];
        data.destination = res.data.destination_addresses[0];
        data.distance = res.data.rows[0].elements[0].distance;
        data.duration = res.data.rows[0].elements[0].duration;
        data.status = res.data.rows[0].elements[0].status;
        $rootScope.$broadcast('MAPS_DATA_CHANGED');
      }, function errorCallback(res) {
        console.log('response error:', res.status, res.statusText);
      });
    };
    obj.getData = function() {return data;};

    return obj;
  }
])

.controller('TripCtrl', ['$scope', 'googleMapsService', function($scope, googleMapsService) {
  $scope.something = 'a string';
  $scope.callGetDistance = function () {
    console.log('callGetDistance');
    var opts = {
      origin: $scope.origin,
      destination: $scope.destination,
    }
    console.log(opts)
    googleMapsService.getDistance(opts)
  };

  $scope.$on('MAPS_DATA_CHANGED', function(response) {
    $scope.mapsData = googleMapsService.getData();
    console.log('loaded data into controller:', $scope.mapsData);
  })
}])
;
