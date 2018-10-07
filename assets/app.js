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
    $("#search").on("click",function(){
      // empty divs for fresh display
      $("#events").empty();
      $("#event-images").empty();
      // log to know clicked search button
      console.log("clicked search by date, location (1 pg, 3 events");
      // variables for eventful query url
      // ex. of format of date search string
      var dateStrFormat = "YYYYMMDD00-YYYYMMDD00";
      // eventful apikey
      const eventfulAPIKEY = "2Rx3KGp52ww5Z2s6";
      // for event titles
      var titles = [];
      // base of query url
      var eventfulBaseURL = "http://api.eventful.com/rest/events/search?";
      // api key header
      var authentication = "&app_key="+eventfulAPIKEY;
      // date header
      var searchByDateStr = "&date=";
      // location header
      var location = "&location=55414"
      // date header hardcode 
      var exampleDate = "2018102500-2018102800";
      // number of pages to return header
      var pageNum = "&page_number=1";
      // number of results per page to return header
      var pageSize = "&page_size=3";
      //  url to query
      var eventfulFinalURL = eventfulBaseURL+authentication+pageSize+pageNum+location+searchByDateStr+exampleDate;
      ////
      ////
      ////
      // variables for google maps query url
      var placeBaseURL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=AIzaSyCyzG2it5G1mxi_GPoa85F-ol0GdWx4rXs&location="; 
      var radius = "&radius=500";
      var name = "&name=";
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
            // loop through each of the events
            for (var i=1; i<eventTitles.length; i++) {
                // log i value
                console.log(">>>> i = "+i);
                // getting latitude of event venue 
                var latitude = eventLats[i].split('"')[0];
                console.log("eventLats[i]: "+eventLats[i]);
                // getting longitude of event venue
                var longitude = eventLongs[i].split('"')[0];
                console.log("eventLongs[i]: "+eventLongs[i]);
                // latitude, longitude coordinate pair
                var point = latitude+","+longitude;
                // log the point
                console.log("(lat, long) = "+point);
                // store event in variable
                var eventTitle = eventTitles[i];
                // get the title from the event string
                var titleText = eventTitle.split('",')[0];
                // push the title to the titles array
                titles.push(titleText);
                // get the url from the event string
                var eventURL = eventTitle.split('"url":"')[1].split('",')[0]; 
                // make link element
                var a = $("<a>");
                // add class event-a to a
                a.addClass("event-a");
                // set text to title string
                a.text(titleText);
                // add href url attribute
                a.attr("href", eventURL);
                // add newline element
                var newline = $("<p>");
                // append newline and a elements to events div
                $("#events").append(newline);
                $("#events").append(a);
                // log venueNames[i]
                console.log("===venue name[i]: "+venueNames[i]);
                // get venue name
                var venueNameStr = venueNames[i].split('",')[0];
                // log venueNameStr
                console.log("===venue name: "+venueNameStr);
                // replace spaces with pluses
                var venueNameTrimmed = venueNameStr.split(' ').join('+');
                // log venueNameTrimmed
                console.log("===venue name trimmed: "+venueNameTrimmed);
                // final url to search for place using lat, long + venue name
                var finalPlaceURL = placeBaseURL+point+radius+name+venueNameTrimmed;
                // log the venue name
                console.log("%%%%%url to get id: "+finalPlaceURL);
                // query to get specific place's place id 
                $.ajax({ 
                    url: finalPlaceURL,
                    method: 'GET'
                }).then(function(result){
                    // log the result
                    console.log("$$$$place: ");
                    console.log(result);
                    // log the first place id
                    console.log("***ID: "+result.results[0].place_id);
                    // put the place id in a variable
                    var place_id = result.results[0].place_id;
                    // use place id in place details api call to get photoreference 
                    var detailsURL = "https://maps.googleapis.com//maps/api/place/details/json?key=AIzaSyCyzG2it5G1mxi_GPoa85F-ol0GdWx4rXs&placeid="+place_id;
                    $.ajax({ 
                        url: detailsURL,
                        method: 'GET'
                    }).then(function(result){
                        // log the url
                        console.log("###url to get details: "+detailsURL);
                        // log the result
                        // need proper indent here
                        console.log("----reference: "+result.result.photos[0].photo_reference);
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
                        console.log("^^^^imgSrcURL: "+imgSrcURL);
                        // create img element
                        var photo = $("<img>");
                        // add event-image class to img
                        photo.addClass("event-image");
                        // make img src the photoreference
                        photo.attr("src", imgSrcURL);
                        // add the photo to the event-images div
                        $("#event-images").append(photo);
                        // });
                        // end the for loop
                        // i = result.results.length;
                            // }
                        // }
                        
                    })
                })
            }
        })
    }) 
});






     

 





