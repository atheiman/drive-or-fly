angular.module('trip', [])

.factory('googleMapsService', ['$http', '$rootScope', '$timeout',
  function($http, $rootScope, $timeout){
    // Used to query Google Maps API
    var data = {
      origin: {},
      destination: {},
      distance: {},
      duration: {},
    };

    // Some google maps vars
    var distMatService = new google.maps.DistanceMatrixService;
    var geocoder = new google.maps.Geocoder;
    var bounds = new google.maps.LatLngBounds;
    var map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 38.9822, lng: -94.6708},
      zoom: 4,
    });
    var destinationIcon = 'https://chart.googleapis.com/chart?' +
        'chst=d_map_pin_letter&chld=D|FF0000|000000';
    var originIcon = 'https://chart.googleapis.com/chart?' +
        'chst=d_map_pin_letter&chld=O|FFFF00|000000';
    var markersArray = [];

    var obj = {};
    obj.getDistance = function(origin, destination) {
      distMatService.getDistanceMatrix(
        {
          origins: [origin],
          destinations: [destination],
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.IMPERIAL,
        }, getDistanceMatrixCallback
      );

      // set service data, show markers on map
      function getDistanceMatrixCallback(res, status) {
        if (status == google.maps.DistanceMatrixStatus.OK) {

          data.origin.text = res.originAddresses[0];
          data.destination.text = res.destinationAddresses[0];
          data.distance = res.rows[0].elements[0].distance;
          data.duration = res.rows[0].elements[0].duration;
          data.status = res.rows[0].elements[0].status;

          // clear markers from map
          deleteMarkers(markersArray);

          // returns origin or destination callback for geocode request
          var showGeocodedAddressOnMap = function(asDestination) {
            var icon = asDestination ? destinationIcon : originIcon;
            return function(results, status) {
              if (status === google.maps.GeocoderStatus.OK) {
                // add lat, lng to data.origin or data.destination
                if (asDestination) {
                  data.destination.lat = results[0].geometry.location.lat();
                  data.destination.lng = results[0].geometry.location.lng();
                } else {
                  data.origin.lat = results[0].geometry.location.lat();
                  data.origin.lng = results[0].geometry.location.lng();
                }
                map.fitBounds(bounds.extend(results[0].geometry.location));
                markersArray.push(new google.maps.Marker({
                  map: map,
                  position: results[0].geometry.location,
                  icon: icon,
                }));
              } else {
                console.log("Geocode error:", status);
              }
            };
          };

          // geocode origin and destination and mark on map
          geocoder.geocode({address: data.origin.text},
                           showGeocodedAddressOnMap(false));
          geocoder.geocode({address: data.destination.text},
                           showGeocodedAddressOnMap(true));

          // broadcast the map data change
          $timeout(function() {$rootScope.$broadcast('MAPS_DATA_CHANGED');}, 200);
        } else {
          console.log('getDistanceMatrix error:', res, status);
        }
      }

      function deleteMarkers(markersArray) {
        for (var i = 0; i < markersArray.length; i++) {
          markersArray[i].setMap(null);
        }
        markersArray = [];
      }
    }

    obj.getData = function() {
      return data;
    };

    return obj;
  }
])

.controller('TripCtrl', ['$scope', 'googleMapsService',
  function($scope, googleMapsService) {
    $scope.callGetDistance = function() {
      googleMapsService.getDistance($scope.origin, $scope.destination)
    };

    $scope.$on('MAPS_DATA_CHANGED', function() {
      $scope.mapsData = googleMapsService.getData();
    })
  }
])
;
