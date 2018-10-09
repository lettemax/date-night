$(document).ready(function(){
$("#submitForm").on("click", function() {
      const skApiKey = "XFK6hX8iZ4LjPg6l";
      console.log(skApiKey)
          //bring in locLat and locLng to get location;
      
          //bring in radius.  Intialize to 1.5KM
    //   let placesRadius = 1500;
    //   let placesType = "restaurant";
    //   let gPhone 
    //   let gWebsite
      var venueAddress
      var venueWebsite
      var queryURL = "https://api.songkick.com/api/3.0/metro_areas/35130-us-twin-cities/calendar.json?apikey="+skApiKey+"&min_date=2018-10-16&max_date=2018-10-16&per_page=50";
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
                
                $("#displayResults").append(
                  "<div class='row'>"+
                  "<div id='selectedE' class='card' style='width: 18rem;'>"+
                  "<div class='card-body'>"+
                  "<h5 class='card-title'>" + concertName + "</h5>"+
                  "<h6 class='card-subtitle mb-2 text-muted'>" + concertVenue + "</h6>" +
                  "<h6 class='card-subtitle mb-2 text-muted'>" + venueAddress + "</h6>" +
                  "<h6 class='card-subtitle mb-2 text-muted'><a href='"+venueWebsite+"'>"+ venueWebsite + "</a></h6>" +
                  
                //   "<img src=" + imageQueryUrl + ">" +
                  "</div>"+
                  "</div>" +
                  "</div>"
                )
            })
            
            // var imageQueryUrl= "https://maps.googleapis.com/maps/api/place/photo?maxwidth=250&photoreference=" + placesImageReference + "&key=AIzaSyCyzG2it5G1mxi_GPoa85F-ol0GdWx4rXs"
             
           

          
        }
      })
})
})