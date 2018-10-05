$(document).ready(function(){      
      //google maps location code.  Provides lat and long 
      // var map, infoWindow;
      // var locLat, locLng


      function initMap() {
        src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCyzG2it5G1mxi_GPoa85F-ol0GdWx4rXs&callback=initMap"
         
        // Try HTML5 geolocation.
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            console.log(pos);
            locLat = pos.lat;
            locLng = pos.lng;
            console.log("lat is"+ locLat + "long is" + locLng);
          }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
          });
        } else {
          // Browser doesn't support Geolocation
          handleLocationError(false, infoWindow, map.getCenter());
        }
        
        
      }
      initMap()


      $("#eventButton").on("click", function() {
      const placesApiKey = "AIzaSyCyzG2it5G1mxi_GPoa85F-ol0GdWx4rXs";
      console.log(placesApiKey)
          //bring in locLat and locLng to get location;
      let placesLocation = locLat+","+locLng;
          //bring in radius.  Intialize to 1.5KM
      let placesRadius = 1500;
      let placesType = "restaurant";

      var queryURL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?key="+placesApiKey+"&location="+placesLocation +"&radius="+placesRadius+"&type="+placesType;
      console.log(queryURL);
      $.ajax({
        url: queryURL,
        method: "GET"
      }).then(function(response){
            console.log(response.results);
      
            var placesData = response.results;
            
            console.log("length of array returned: "+placesData.length);
          for(let i = 0; i< 5; i++){
              console.log(placesData[i].name);
            }
      
      
      
          })
        });
      // function handleLocationError(browserHasGeolocation, infoWindow, pos) {
      //   infoWindow.setPosition(pos);
      //   infoWindow.setContent(browserHasGeolocation ?
      //                         'Error: The Geolocation service failed.' :
      //                         'Error: Your browser doesn\'t support geolocation.');
      //   infoWindow.open(map);
      // }






  
});
