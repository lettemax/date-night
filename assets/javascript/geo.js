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


      $("#submitForm").on("click", function() {
      const placesApiKey = "AIzaSyCyzG2it5G1mxi_GPoa85F-ol0GdWx4rXs";
      console.log(placesApiKey)
          //bring in locLat and locLng to get location;
      let placesLocation = locLat+","+locLng;
          //bring in radius.  Intialize to 1.5KM
      let placesRadius = 1500;
      let placesType = "restaurant";
      let gPhone 
      let gWebsite

      var queryURL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?key="+placesApiKey+"&location="+placesLocation +"&radius="+placesRadius+"&type="+placesType;
      console.log(queryURL);
      $.ajax({
        url: queryURL,
        method: "GET"
      }).then(function(response){
            console.log(response.results);
      
            var placesData = response.results;
            
            console.log("length of array returned: "+placesData.length);
          for(let i = 0; i< 10; i++){
              console.log(placesData[i].name);
              gPlace_id = placesData[i].place_id;
              let phoneWebsite = "https://maps.googleapis.com/maps/api/place/details/json?placeid="+gPlace_id+"&fields=website,formatted_phone_number&key=AIzaSyCyzG2it5G1mxi_GPoa85F-ol0GdWx4rXs"
                $.ajax({
                url: phoneWebsite,
                method: "GET"
              }).then(function(response){
                    // console.log(response2.results);
                    placesName = placesData[i].name;
              placesAddress =  placesData[i].vicinity;
              placesImageReference = placesData[i].photos[0].photo_reference;
              console.log(placesImageReference);
              
              console.log(phoneWebsite,i)
                gPhone = response.result.formatted_phone_number
                gWebsite = response.result.website
                var imageQueryUrl= "https://maps.googleapis.com/maps/api/place/photo?maxwidth=250&photoreference=" + placesImageReference + "&key=AIzaSyCyzG2it5G1mxi_GPoa85F-ol0GdWx4rXs"
                $("#displayResults").append(
                  "<div class='row'>"+
                  "<div id='selectedE' class='card' style='width: 18rem;'>"+
                  "<div class='card-body'>"+
                  "<h5 class='card-title'>" + placesName + "</h5>"+
                  "<h6 class='card-subtitle mb-2 text-muted'>" + placesAddress + "</h6>" +
                  "<h6 class='card-subtitle mb-2 text-muted'><a href='"+gWebsite+"'>"+ gWebsite + "</a></h6>" +
                  "<h6 class='card-subtitle mb-2 text-muted'><a href='tel:"+ gPhone +"'>" + gPhone + "</a></h6>" +
                  "<img src=" + imageQueryUrl + ">" +
                  "</div>"+
                  "</div>"
                )
            
              })
            // var imageQueryUrl= "https://maps.googleapis.com/maps/api/place/photo?maxwidth=250&photoreference=" + placesImageReference + "&key=AIzaSyCyzG2it5G1mxi_GPoa85F-ol0GdWx4rXs"
             
           

            // $("#displayResults").append(
            //   "<div class='row'>"+
            //   "<div id='selectedE' class='card' style='width: 18rem;'>"+
            //   "<div class='card-body'>"+
            //   "<h5 class='card-title'>" + placesName + "</h5>"+
            //   "<h6 class='card-subtitle mb-2 text-muted'>" + placesAddress + "</h6>" +
            //   "<h6 class='card-subtitle mb-2 text-muted'>" + gWebsite + "</h6>" +
            //   "<h6 class='card-subtitle mb-2 text-muted'>" + gPhone + "</h6>" +
            //   "<img src=" + imageQueryUrl + ">" +
            //   "</div>"+
            //   "</div>"
            // )
            
                
              // placesDiv = $('<div>');
              // placesDiv.text(placesName);
              // placesImg =$("<img>");
              // placesImg.attr("src", imageQueryUrl);
              // addressP = $('<p>');
              // addressP.text(placesAddress);
              // placesDiv.append(addressP);
              // placesDiv.append(placesImg);
              // $("#body").append(placesDiv);
            
      
          
      
          }
        })
      })
      // function handleLocationError(browserHasGeolocation, infoWindow, pos) {
      //   infoWindow.setPosition(pos);
      //   infoWindow.setContent(browserHasGeolocation ?
      //                         'Error: The Geolocation service failed.' :
      //                         'Error: Your browser doesn\'t support geolocation.');
      //   infoWindow.open(map);
      // }






  
});
