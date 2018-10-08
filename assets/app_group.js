// json2xml
/*	This work is licensed under Creative Commons GNU LGPL License.

	License: http://creativecommons.org/licenses/LGPL/2.1/
   Version: 0.9
	Author:  Stefan Goessner/2006
	Web:     http://goessner.net/ 
*/


function json2xml(o, tab) {
    var toXml = function(v, name, ind) {
       var xml = "";
       if (v instanceof Array) {
          for (var i=0, n=v.length; i<n; i++)
             xml += ind + toXml(v[i], name, ind+"\t") + "\n";
       }
       else if (typeof(v) == "object") {
          var hasChild = false;
          xml += ind + "<" + name;
          for (var m in v) {
             if (m.charAt(0) == "@")
                xml += " " + m.substr(1) + "=\"" + v[m].toString() + "\"";
             else
                hasChild = true;
          }
          xml += hasChild ? ">" : "/>";
          if (hasChild) {
             for (var m in v) {
                if (m == "#text")
                   xml += v[m];
                else if (m == "#cdata")
                   xml += "<![CDATA[" + v[m] + "]]>";
                else if (m.charAt(0) != "@")
                   xml += toXml(v[m], m, ind+"\t");
             }
             xml += (xml.charAt(xml.length-1)=="\n"?ind:"") + "</" + name + ">";
          }
       }
       else {
          xml += ind + "<" + name + ">" + v.toString() +  "</" + name + ">";
       }
       return xml;
    }, xml="";
    for (var m in o)
       xml += toXml(o[m], m, "");
    return tab ? xml.replace(/\t/g, tab) : xml.replace(/\t|\n/g, "");
 }

///
///
///

// xml2json
/*	This work is licensed under Creative Commons GNU LGPL License.

	License: http://creativecommons.org/licenses/LGPL/2.1/
   Version: 0.9
	Author:  Stefan Goessner/2006
	Web:     http://goessner.net/ 
*/
function xml2json(xml, tab) {
    var X = {
       toObj: function(xml) {
          var o = {};
          if (xml.nodeType==1) {   // element node ..
             if (xml.attributes.length)   // element with attributes  ..
                for (var i=0; i<xml.attributes.length; i++)
                   o["@"+xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue||"").toString();
             if (xml.firstChild) { // element has child nodes ..
                var textChild=0, cdataChild=0, hasElementChild=false;
                for (var n=xml.firstChild; n; n=n.nextSibling) {
                   if (n.nodeType==1) hasElementChild = true;
                   else if (n.nodeType==3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) textChild++; // non-whitespace text
                   else if (n.nodeType==4) cdataChild++; // cdata section node
                }
                if (hasElementChild) {
                   if (textChild < 2 && cdataChild < 2) { // structured element with evtl. a single text or/and cdata node ..
                      X.removeWhite(xml);
                      for (var n=xml.firstChild; n; n=n.nextSibling) {
                         if (n.nodeType == 3)  // text node
                            o["#text"] = X.escape(n.nodeValue);
                         else if (n.nodeType == 4)  // cdata node
                            o["#cdata"] = X.escape(n.nodeValue);
                         else if (o[n.nodeName]) {  // multiple occurence of element ..
                            if (o[n.nodeName] instanceof Array)
                               o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
                            else
                               o[n.nodeName] = [o[n.nodeName], X.toObj(n)];
                         }
                         else  // first occurence of element..
                            o[n.nodeName] = X.toObj(n);
                      }
                   }
                   else { // mixed content
                      if (!xml.attributes.length)
                         o = X.escape(X.innerXml(xml));
                      else
                         o["#text"] = X.escape(X.innerXml(xml));
                   }
                }
                else if (textChild) { // pure text
                   if (!xml.attributes.length)
                      o = X.escape(X.innerXml(xml));
                   else
                      o["#text"] = X.escape(X.innerXml(xml));
                }
                else if (cdataChild) { // cdata
                   if (cdataChild > 1)
                      o = X.escape(X.innerXml(xml));
                   else
                      for (var n=xml.firstChild; n; n=n.nextSibling)
                         o["#cdata"] = X.escape(n.nodeValue);
                }
             }
             if (!xml.attributes.length && !xml.firstChild) o = null;
          }
          else if (xml.nodeType==9) { // document.node
             o = X.toObj(xml.documentElement);
          }
          else
             alert("unhandled node type: " + xml.nodeType);
          return o;
       },
       toJson: function(o, name, ind) {
          var json = name ? ("\""+name+"\"") : "";
          if (o instanceof Array) {
             for (var i=0,n=o.length; i<n; i++)
                o[i] = X.toJson(o[i], "", ind+"\t");
             json += (name?":[":"[") + (o.length > 1 ? ("\n"+ind+"\t"+o.join(",\n"+ind+"\t")+"\n"+ind) : o.join("")) + "]";
          }
          else if (o == null)
             json += (name&&":") + "null";
          else if (typeof(o) == "object") {
             var arr = [];
             for (var m in o)
                arr[arr.length] = X.toJson(o[m], m, ind+"\t");
             json += (name?":{":"{") + (arr.length > 1 ? ("\n"+ind+"\t"+arr.join(",\n"+ind+"\t")+"\n"+ind) : arr.join("")) + "}";
          }
          else if (typeof(o) == "string")
             json += (name&&":") + "\"" + o.toString() + "\"";
          else
             json += (name&&":") + o.toString();
          return json;
       },
       innerXml: function(node) {
          var s = ""
          if ("innerHTML" in node)
             s = node.innerHTML;
          else {
             var asXml = function(n) {
                var s = "";
                if (n.nodeType == 1) {
                   s += "<" + n.nodeName;
                   for (var i=0; i<n.attributes.length;i++)
                      s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].nodeValue||"").toString() + "\"";
                   if (n.firstChild) {
                      s += ">";
                      for (var c=n.firstChild; c; c=c.nextSibling)
                         s += asXml(c);
                      s += "</"+n.nodeName+">";
                   }
                   else
                      s += "/>";
                }
                else if (n.nodeType == 3)
                   s += n.nodeValue;
                else if (n.nodeType == 4)
                   s += "<![CDATA[" + n.nodeValue + "]]>";
                return s;
             };
             for (var c=node.firstChild; c; c=c.nextSibling)
                s += asXml(c);
          }
          return s;
       },
       escape: function(txt) {
          return txt.replace(/[\\]/g, "\\\\")
                    .replace(/[\"]/g, '\\"')
                    .replace(/[\n]/g, '\\n')
                    .replace(/[\r]/g, '\\r');
       },
       removeWhite: function(e) {
          e.normalize();
          for (var n = e.firstChild; n; ) {
             if (n.nodeType == 3) {  // text node
                if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) { // pure whitespace text node
                   var nxt = n.nextSibling;
                   e.removeChild(n);
                   n = nxt;
                }
                else
                   n = n.nextSibling;
             }
             else if (n.nodeType == 1) {  // element node
                X.removeWhite(n);
                n = n.nextSibling;
             }
             else                      // any other node
                n = n.nextSibling;
          }
          return e;
       }
    };
    if (xml.nodeType == 9) // document node
       xml = xml.documentElement;
    var json = X.toJson(X.toObj(X.removeWhite(xml)), xml.nodeName, "\t");
    return "{\n" + tab + (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, "")) + "\n}";
 }

//
//
// 
//




//



//

$(document).ready(function(){

    ////
    ////
    //// Max's code: eventful + google places images
    ////
    ////
    $("#submitForm").on("click", function(){
      console.log("clicked submit");
      // empty divs for fresh display
      //   $("#events").empty();
      //   $("#event-images").empty();
      // declare date and location variables to be passed values from input
      var dateSubmitted;
      var locationSubmitted;
      // Pass input and log values
      // pass input into dateSubmitted variable
      dateSubmitted = $("#dateInput").val();
      // change date format for eventful api call
      dateSubmitted = dateSubmitted.split('-').join('')+"00";
      // pass input into locationSubmitted variable
      locationSubmitted = $("#locationInput").val().trim();
      console.log("date and location submission: "+dateSubmitted+", "+locationSubmitted);



      // if date and location submissions are valid, then do queries
    //   if ((parseInt(dateSubmitted) > 1008201800) && true) {

    //   }
    // log to know clicked submit button with certain parameters
    //   console.log("SUCCESSFUL SUBMISSION\nsearching date: "+dateSubmitted+", location: "+locationSubmitted);
      
      
      // variables for eventful query url
      // ex. of format of date search string
      // var dateStrFormat = "YYYYMMDD00-YYYYMMDD00";
      // eventful apikey
      const eventfulAPIKEY = "2Rx3KGp52ww5Z2s6";
      // for event titles
      var titles = [];
      // base of query url
      var eventfulBaseURL = "http://api.eventful.com/rest/events/search?&app_key="+eventfulAPIKEY;
      // date header
      var date = "&date="+dateSubmitted;
      // location header
      var location = "&location="+locationSubmitted;
      // date header hardcode 
      // var exampleDate = "2018102500-2018102800";
      // number of pages to return header
      var pageNum = "&page_number=1";
      // number of results per page to return header
      var pageSize = "&page_size=1";
      //  url to query
      var eventfulFinalURL = eventfulBaseURL+pageSize+pageNum+location+date;
      //
      //
      // ajax call to eventful api
        $.ajax({
        url: eventfulFinalURL,
        method: 'GET'
        }).then(function(result){
            // log the url
            console.log("$$$eventfulURL: "+eventfulFinalURL);
            // tab string to make converted json string look better
            var tab = "   ";
            // convert result xml to json
            var json = xml2json(result, 
                tab);
            // log the json
            console.log(json);
            // split the json up by title to eventually get event titles
            var eventTitles = json.split('"title":"');
            // split the json up by "latitude" to eventually get event venue latitude
            var eventLats = json.split('"latitude":"');
            // split the json up by "longitude" to eventually get event venue longitude
            var eventLongs = json.split('"longitude":"');
            // split the json up by "venue_name"
            var venueNames = json.split('"venue_name":"')
            // split the json up by "venue_address"
            var venueAddresses = json.split('"venue_address":"');
            // split the json up by "event_description"
            // var eventDescriptions = json.split('"description":" &lt;br&gt; ');
            // loop through each of the events
            // for (var i=1; i<eventTitles.length; i++) {
                // log i value
                // console.log(">>>> i = "+i);
                // getting latitude of event venue 
                var latitude = eventLats[1].split('"')[0];
                console.log("eventLats[1]: "+eventLats[1]);
                // getting longitude of event venue
                var longitude = eventLongs[1].split('"')[0];
                console.log("eventLongs[1]: "+eventLongs[1]);
                // latitude, longitude coordinate pair
                var point = latitude+","+longitude;
                // log the point
                console.log("(lat, long) = "+point);
                // store event in variable
                var eventTitle = eventTitles[1];
                // log eventTitle
                console.log("eventTitle: "+eventTitle);
                // get the title from the event string
                var titleText = eventTitle.split('",')[0];
                // log titleText
                console.log("titleText: "+titleText);
                // push the title to the titles array
                titles.push(titleText);
                // get the url from the event string
                var eventURL = eventTitle.split('"url":"')[1].split('",')[0]; 
                // log the eventurl and title
                console.log("eventURL: "+eventURL);
                console.log("title: "+titleText);


                // make link element
                var a = $("<a>");
                var a2 = $("<a>");
                // // add class event-a to a
                // a.addClass("event-a");
                // set text of element to title string
                a.text(titleText);
                a2.text(titleText);
                // add href attribute with value of event's url
                a.attr("href", eventURL);
                a2.attr("href", eventURL);
                // set event-name and event-name-2 to a element
                $("#event-name").empty();
                $("#event-name").append(a);
                $("#event-name-2").empty();
                $("#event-name-2").append(a2);

                // // add newline element (just a blank paragraph)
                // var newline = $("<p>");
                // // append newline and a elements to events div
                // $("#events").append(newline);
                // $("#events").append(a);

                // // get event description string from json
                // var description = eventDescriptions[1].split('.')[0];
                // // make p element to add to display card
                // var descriptionP = $("<p>");
                // // set element's text to event description
                // descriptionP.text(description);
                // // append element to card 
                // $("#event-description").append(descriptionP);

                // log venueNames[1]
                // console.log("--->venue name[1]: "+venueNames[1]);
                // get venue name
                var venueNameStr = venueNames[1].split('",')[0];
                // log venueNameStr
                console.log("--->venue name: "+venueNameStr);
                // replace spaces with pluses
                var venueNameEdited = venueNameStr.split(' ').join('+');
                // log venueNameEdited
                console.log("--->venue name edited for query: "+venueNameEdited);
                // get venue address 
                var address = venueAddresses[1].split('",')[0];
                // log venue address
                console.log("--->venue address: "+address);
                // variables for google maps query 
                var placeBaseURL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=AIzaSyCyzG2it5G1mxi_GPoa85F-ol0GdWx4rXs&location="; 
                var radius = "&radius=500";
                var name = "&name="+venueNameEdited;
                // final url to search for place using location point and venue name
                var finalPlaceURL = placeBaseURL+point+radius+name;
                // log the venue name
                console.log("--->url to get id: "+finalPlaceURL);
                // query to get specific place's place id 
                $.ajax({ 
                    url: finalPlaceURL,
                    method: 'GET'
                }).then(function(result){
                    // log the result
                    console.log("---->place: ");
                    console.log(result);
                    // log the first place id
                    console.log("---->ID: "+result.results[0].place_id);
                    // put the place id in a variable
                    var place_id = result.results[0].place_id;
                    // use place id in place details api call to get photoreference 
                    var detailsURL = "https://maps.googleapis.com//maps/api/place/details/json?key=AIzaSyCyzG2it5G1mxi_GPoa85F-ol0GdWx4rXs&placeid="+place_id;
                    $.ajax({ 
                        url: detailsURL,
                        method: 'GET'
                    }).then(function(result){
                        // log the url
                        console.log("--->url to get details: "+detailsURL);
                        // log the result
                        // need proper indent here
                        console.log("--->reference: "+result.result.photos[0].photo_reference);
                        // loop through each result and get a photo reference 
                        // for (var i=0; i<result.results.length; i++) {
                        // dig into results to get photo_reference value
                        var photo_reference = result.result.photos[0].photo_reference;
                        // if photo_reference exists
                        // if (photo_reference) {
                        // log the reference
                        console.log(photo_reference);
                        // set variables for google place photos api call
                        var imgSrcURL = "https://maps.googleapis.com/maps/api/place/photo?maxheight=200&maxwidth=200&photoreference="
                                       +photo_reference+"&key=AIzaSyCyzG2it5G1mxi_GPoa85F-ol0GdWx4rXs";
                        console.log("--->imgSrcURL: "+imgSrcURL);

                        // create p element for event address
                        var addressP = $("<p>");
                        // set text to event venue address
                        addressP.text(address);
                        // create second p element for event address
                        var addressP2 = $("<p>");
                        // set text to event venue address
                        addressP2.text(address);
                        // create img element
                        var photo = $("<img>");
                        var photo2 = $("<img>");
                        // // add event-image class to img
                        // photo.addClass("event-image");
                        // make img src the photoreference
                        photo.attr("src", imgSrcURL);
                        photo2.attr("src", imgSrcURL);
                        // add the img to the event-description and event-description-2 divs
                        $("#event-description").empty();
                        $("#event-description").append(addressP);
                        $("#event-description").append(photo);
                        $("#event-description-2").empty();
                        $("#event-description-2").append(addressP2);
                        $("#event-description-2").append(photo2);
                        // add the photo to the event-images div
                        // $("#event-images").append(photo);


                        //set variables to make google places call to get nearby restaurant of event
                        const placesApiKey = "AIzaSyCyzG2it5G1mxi_GPoa85F-ol0GdWx4rXs";
                        console.log(placesApiKey);
                        //bring in locLat and locLng to get location;
                        let placesLocation = point;
                        //bring in radius.  Intialize to 1.5KM
                        let placesRadius = 1500;
                        let placesType = "restaurant";
                        // concatenate variables to get queryURL 
                        var queryURL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?key="+placesApiKey+"&location="+placesLocation +"&radius="+placesRadius+"&type="+placesType;
                        // log the queryURL
                        console.log(queryURL);
                        // make ajax query
                        $.ajax({
                            url: queryURL,
                            method: "GET"
                        }).then(function(response){
                                // log results of query
                                console.log(response.results);
                                // put results data into variable  
                                var placesData = response.results; 

                                // for(let i = 0; i< 5; i++){ 

                                // put the name of the first place result in a variable     
                                var placesName = placesData[0].name;

                                // put place address in variable
                                var placesAddress =  placesData[0].vicinity;

                                // put the photo_reference of the first place result in a variable
                                var placesImageReference = placesData[0].photos[0].photo_reference;
                                // log the photo_reference
                                console.log(placesImageReference);
                                // concatenate photo_reference with rest of queryURL, use this for img src
                                var imageQueryUrl= "https://maps.googleapis.com/maps/api/place/photo?maxwidth=200&maxheight=200&photoreference=" + placesImageReference + "&key=AIzaSyCyzG2it5G1mxi_GPoa85F-ol0GdWx4rXs";
                                
                                // placesDiv = $('<div>');
                                // placesDiv.text(placesName);

                                // change text of html element to match place's name
                                $("#rest-name").text(placesName);

                                // create new img element
                                var placesImg = $("<img>");
                                // set src to place's photo_reference
                                placesImg.attr("src", imageQueryUrl);
                                // create new p element
                                var vicinityP = $("<p>");
                                // set text to placesAddress
                                vicinityP.text(placesAddress);
                                // change content of html element to contain address and img
                                $("#rest-description").empty();
                                $("#rest-description").append(vicinityP);
                                $("#rest-description").append(placesImg);

                                // addressP = $('<p>');
                                // addressP.text(placesAddress);
                                // placesDiv.append(addressP);
                                // placesDiv.append(placesImg);
                                // $("#body").append(placesDiv);
                                // }
                            })

                    });
                });
            });


    //                     ///
    //                     ///
    //                     /// ************************
    //                     /// STEVEN'S CODE STARTS HERE
    //                     /// ************************
    //                     ///
    //                     // set variables to make google places call to get nearby restaurant of event
    //                     // const placesApiKey = "AIzaSyCyzG2it5G1mxi_GPoa85F-ol0GdWx4rXs";
    //                     // console.log(placesApiKey)
    //                     // //bring in locLat and locLng to get location;
    //                     // let placesLocation = locLat+","+locLng;
    //                     // //bring in radius.  Intialize to 1.5KM
    //                     // let placesRadius = 1500;
    //                     // let placesType = "restaurant";

    //                     // var queryURL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?key="+placesApiKey+"&location="+placesLocation +"&radius="+placesRadius+"&type="+placesType;
    //                     // console.log(queryURL);
                        
    //                     // $.ajax({
    //                     //     url: queryURL,
    //                     //     method: "GET"
    //                     // }).then(function(response){
    //                     //         console.log(response.results);
    //                     //         var placesData = response.results;      
    //                     //     for(let i = 0; i< 5; i++){      
    //                     //         placesName = placesData[i].name;
    //                     //         placesAddress =  placesData[i].vicinity;
    //                     //         placesImageReference = placesData[i].photos[0].photo_reference;
    //                     //         console.log(placesImageReference);
    //                     //         var imageQueryUrl= "https://maps.googleapis.com/maps/api/place/photo?maxwidth=100&maxheight=100&photoreference=" + placesImageReference + "&key=AIzaSyCyzG2it5G1mxi_GPoa85F-ol0GdWx4rXs";
    //                     //         placesDiv = $('<div>');
    //                     //         placesDiv.text(placesName);
    //                     //         placesImg = $("<img>");
    //                     //         placesImg.attr("src", imageQueryUrl);
    //                     //         addressP = $('<p>');
    //                     //         addressP.text(placesAddress);
    //                     //         placesDiv.append(addressP);
    //                     //         placesDiv.append(placesImg);
    //                     //         $("#body").append(placesDiv);
    //                     //         }
    //                     //     })
                        
    //                 })
    //             })
    //         }
    //     })
    });
});






     

 











    //google maps location code.  Provides lat and long 
      // var map, infoWindow;
      // var locLat, locLng
    //   var placesName;
    //   var placesAddress;
    //   var placesImageReference;
    //   var placeImg;

    //   function initMap() {
    //     src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCyzG2it5G1mxi_GPoa85F-ol0GdWx4rXs&callback=initMap"
         
    //     // Try HTML5 geolocation.
    //     if (navigator.geolocation) {
    //       navigator.geolocation.getCurrentPosition(function(position) {
    //         var pos = {
    //           lat: position.coords.latitude,
    //           lng: position.coords.longitude
    //         };
    //         console.log(pos);
    //         locLat = pos.lat;
    //         locLng = pos.lng;
    //         console.log("lat is"+ locLat + "long is" + locLng);
    //       }, function() {
    //         handleLocationError(true, infoWindow, map.getCenter());
    //       });
    //     } else {
    //       // Browser doesn't support Geolocation
    //       handleLocationError(false, infoWindow, map.getCenter());
    //     }
        
        
    //   }
    //   initMap()

    
        // });