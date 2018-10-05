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

var dateStrFormat = "YYYYMMDD00-YYYYMMDD00";
const eventfulAPIKEY = "2Rx3KGp52ww5Z2s6";
const pixabayAPIKEY = "10309063-bae375bbfc12120243955a4b0";
var titles = [];


//



//

$(document).ready(function(){
    $("#search").on("click",function(){
      console.log("clicked search by date, location (1 pg, 3 events");
      var eventfulBaseURL = "http://api.eventful.com/rest/events/search?";
      var authentication = "&app_key="+eventfulAPIKEY;
      var searchByDateStr = "&date=";
      var location = "&location=55414"
      var exampleDate = "2018101400-2018101400";
      var pageNum = "&page_number=1";
      var pageSize = "&page_size=3";
      var eventfulFinalURL = eventfulBaseURL+authentication+pageSize+pageNum+location+searchByDateStr+exampleDate;
      //
      // second call variables
      var googleBaseURL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=AIzaSyCyzG2it5G1mxi_GPoa85F-ol0GdWx4rXs&location="; 
      var radius = "&radius=100";
      //
      console.log(eventfulFinalURL);
        $.ajax({
        url: eventfulFinalURL,
        method: 'GET'
        }).then(function(result){
            $("#events").empty();
            var tab = "   ";
            var json = xml2json(result, 
                tab);
                console.log(json);
            var searchResults = json.split('"title":');
            var eventPoint1 = json.split('"latitude":"');
            var eventPoint2 = json.split('"longitude":"');
            
            for (var i=1; i<searchResults.length; i++) {
                var latitude = eventPoint1[1].split('"')[0];
                var longitude = eventPoint2[1].split('"')[0];
                var point = latitude+","+longitude;
                console.log(point);
                var event = searchResults[i];
                var titleText = event.split('",')[0].split('"')[1];
                titles.push(titleText);
                var eventURL = event.split('"url":"')[1].split('",')[0]; 
                var a = $("<a>");
                a.addClass("event-a");
                a.text(titleText);
                a.attr("href", eventURL);
                var nl = $("<p>");
                $("#events").append(nl);
                $("#events").append(a);
                $.ajax({ 
                    // url: "https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=AIzaSyCyzG2it5G1mxi_GPoa85F-ol0GdWx4rXs&location=44.9815,-93.2365&radius=10",
                    url: googleBaseURL+point+radius,
                    method: 'GET'
                }).then(function(result){
                    console.log(result);
                    if (result.results[0].photos[0].photo_reference) {
                        console.log(result.results[0].photos[0].photo_reference);
                    } else if (result.results[1].photos[0].photo_reference) {
                    console.log(result.results[1].photos[0].photo_reference);
                    }
                })
            }
        })
    }) 
});






            // for (var i=0; i<titles.length; i++) {
            //     var pixabayBaseURL = "https://pixabay.com/api/";
            //     var title = titles[i]; 
            //     var split = title.split(' ');
            //     var keywords = [];
            //     for (var i=0; i<2; i++) {
            //         var add = split[i].replace(/[^A-Za-z0-9]/g, '');
            //         // var add = split[i].replace(/[^A-Za-z]/g, '');
            //         keywords.push(add);
            //     }
            //     var keywordStr = keywords.toString();
            //     var trimmed = keywordStr.split(',').join('+');
            //     var pixabayFinalURL = pixabayBaseURL+"?key="+pixabayAPIKEY+"&q="+trimmed;
            //     console.log("-----"+pixabayFinalURL);
            //     $.ajax({
            //     url: pixabayFinalURL,
            //     // url: "https://pixabay.com/api/?key=10309063-bae375bbfc12120243955a4b0&q=Basketball",
            //     method: 'GET'
            //     }).then(function(result){
            //         var imgURL;
            //         if (result.hits[0].largeImageURL) {
            //             imgURL = result.hits[0].largeImageURL;
            //         }
            //         console.log("-----imgURL: "+imgURL);
            //         var img = $("<img>");
            //         img.attr("src", imgURL);
            //         img.attr("rel", "should be img");
            //         img.addClass("event-image");
            //         var row = $("<div>");
            //         row.addClass = $("row");
            //         row.append(img);
            //         $("#event-images").append(row);
            //     });
            // 
            // }

 





