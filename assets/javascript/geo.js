$(document).ready(function(){      
      // google maps location code.  Provides lat and long 
      var map, infoWindow;
      var locLat, locLng

    
      function initMap(callBack) {
        src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCyzG2it5G1mxi_GPoa85F-ol0GdWx4rXs&callback=initMap"
         
        // Try HTML5 geolocation.
        if (navigator.geolocation) {
          return navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            console.log(pos);
            locLat = pos.lat;
            locLng = pos.lng;
            console.log("lat is"+ locLat + "long is" + locLng);
            callBack();
          }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
          });
        } else {
          // Browser doesn't support Geolocation
          handleLocationError(false, infoWindow, map.getCenter());
        }
      }

      $("#locId").on("click", function(){
        initMap(function() {
          console.log()
          var locationApiUrl = "https://api.songkick.com/api/3.0/search/locations.json?location=geo:"+locLat+","+locLng+"&apikey=XFK6hX8iZ4LjPg6l"
          var metroID
          $.ajax({
            url: locationApiUrl,
            method: "GET"
          }).then(function(response){
            console.log(response.resultsPage.results)
            metroID = response.resultsPage.results.location[0].metroArea.displayNamels;
            console.log(metroID)
            
    
            $("#locationInput").val(metroID);
    
          })
        
    })
  })
         
      
      function location2(x){
        var locationApiUrl = "https://api.songkick.com/api/3.0/search/locations.json?query="+x+"&apikey=XFK6hX8iZ4LjPg6l"
        var metroID
        return $.ajax({
          url: locationApiUrl,
          method: "GET"
        }).then(function(response){
          console.log(response.resultsPage.results)
          metroID = response.resultsPage.results.location[0].metroArea.id;
          console.log(metroID)
          return metroID
        })
        
      }
      // location2("minneapolis").then((res) => console.log(res));
      // location2("geo=lat'44.983753',lng'-93.1803827'");

      $("#submitForm").on("click", function() {  
      // }
      // initMap()
      const skApiKey = "XFK6hX8iZ4LjPg6l";
      console.log(skApiKey)
      var dateSubmittedUnedited;
      var locationSubmitted;
      
      // apiID = location2(locationSubmitted);
      
      // Pass input and log values
      // pass input into dateSubmitted variable
      dateSubmittedUnedited = $("#dateInput").val();
      // change date format for eventful api call
      dateSubmittedEdited = dateSubmittedUnedited.split('-').join('')+"00";
      // pass input into locationSubmitted variable
      locationSubmitted = $("#locationInput").val().trim();
      // log to know that submission went through
      console.log("-------");
      console.log("date and location submission: "+dateSubmittedEdited+", "+locationSubmitted);
      console.log("-------");
          //bring in locLat and locLng to get location;
      
          //bring in radius.  Intialize to 1.5KM
    //   let placesRadius = 1500;
    //   let placesType = "restaurant";
    //   let gPhone 
    //   let gWebsite
      var venueAddress
      var venueWebsite

      location2(locationSubmitted).then(function(res) {
        metroID = res;
        var queryURL = "https://api.songkick.com/api/3.0/metro_areas/" + metroID + "/calendar.json?apikey="+skApiKey+"&min_date="+dateSubmittedUnedited+"&max_date="+dateSubmittedUnedited+"&per_page=50";
        console.log(queryURL);
        $.ajax({
          url: queryURL,
          method: "GET"
        }).then(function(response){
              console.log(response.resultsPage.results);
        
              var concertData = response.resultsPage.results.event;
              
              console.log("length of array returned: "+concertData.length);
            for(let i = 0; i< 10; i++){
                console.log(concertData[i].displayName);                
                let concertVenue =  concertData[i].venue.id;
                let venueInfoURL = "https://api.songkick.com/api/3.0/venues/"+concertVenue+".json?apikey=XFK6hX8iZ4LjPg6l"
                console.log(venueInfoURL)
                  $.ajax({
                  url: venueInfoURL,
                  method: "GET"
                   }).then(function(response2){
                  console.log(response2.resultsPage.results);
                  let locLat = concertData[i].venue.lat;
                  let locLng = concertData[i].venue.lng;
                  console.log(locLat)
                  console.log(locLng)
                  var venueData = response2.resultsPage.results.venue;
                  console.log(venueData.street)
                  concertName = concertData[i].displayName;       
                  venueWebsite = venueData.website;
                  venueAddress = venueData.street;
                  
                  console.log(venueAddress)
              //   console.log(placesImageReference);
                
              //   console.log(phoneWebsite,i)
              //     gPhone = response.result.formatted_phone_number
              //     gWebsite = response.result.website
                  
                  $("#eventResults").append(
                    // "<div class='row'>"+
                    "<div id='selectedE' class='card' style='width: 18rem;'>"+
                    "<div class='card-body'>"+
                    "<h5 class='card-title'>" + concertName + "</h5>"+
                    "<h6 class='card-subtitle mb-2 text-muted'>" + concertVenue + "</h6>" +
                    "<h6 class='card-subtitle mb-2 text-muted'>" + venueAddress + "</h6>" +
                    "<h6 class='card-subtitle mb-2 text-muted'><a href='"+venueWebsite+"'>"+ venueWebsite + "</a></h6>" +
                    "<button id='nearbyOptions' type='button' class='btn btn-success' value='"+locLat+","+locLng+"'>Find a restaurant nearby!</button>"+
                  //   "<img src=" + imageQueryUrl + ">" +
                    "</div>"+
                    // "</div>" +
                    "</div>"
                  )
              })
          }})
        })
      })

      


      $(document).on("click", "#nearbyOptions", function() {
        $("#restResults").html("");
        let placesApiKey = "AIzaSyCyzG2it5G1mxi_GPoa85F-ol0GdWx4rXs";
      console.log(placesApiKey)
          //bring in locLat and locLng to get location;
      let placesLocation = this.value;
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
                
                $("#restResults").append(
                  // "<div class='row'>"+
                  "<div id='selectedE' class='card' style='width: 18rem;'>"+
                  "<div class='card-body'>"+
                  "<h5 class='card-title'>" + placesName + "</h5>"+
                  "<h6 class='card-subtitle mb-2 text-muted'>" + placesAddress + "</h6>" +
                  "<h6 class='card-subtitle mb-2 text-muted'><a href='"+gWebsite+"'>"+ gWebsite + "</a></h6>" +
                  "<h6 class='card-subtitle mb-2 text-muted'><a href='tel:"+ gPhone +"'>" + gPhone + "</a></h6>" +
                  "<img src=" + imageQueryUrl + ">" +
                  "</div>"
                  // "</div>"
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
