//replace the url for the spreadsheet being mapped here
window.onload=function(){
	getSpreadsheet('https://docs.google.com/spreadsheets/d/1RnULjaAdDZ8VUCgwO61eItVujAbpSZuEnK0hIBLVGns/pubhtml');
}

//all of this is happening asynchronously; the callback is telling Tabletop to build the map using the spreadsheet
function getSpreadsheet(key){
  Tabletop.init( { 
    key: key,
    callback: buildMap,
    simpleSheet: true
  });
}

function buildMap(data, tabletop) {

L.mapbox.accessToken = 'pk.eyJ1IjoiY29yZS1naXMiLCJhIjoiaUxqQS1zQSJ9.mDT5nb8l_dWIHzbnOTebcQ';

  // build map
  var map = L.mapbox.map('map', 'mapbox.light').setView([0,0],1);
  var points = L.featureGroup();
  var approvalBucklin = L.featureGroup();
  var approvalPreferential = L.featureGroup();
  var cumulativeVoting = L.featureGroup();
  var instantRunoff = L.featureGroup();
  var limitedVote = L.featureGroup();
  var singleTransferable = L.featureGroup();
  
  for(var i=0;i<data.length;i++) {
    var marker = L.marker([parseFloat(data[i].lat), parseFloat(data[i].lng)]);
    var popupInfo = metadata(data[i]);
	
	//type in your desired dimensions for the markers; the marker will always be square
	var iconDim = 31;
	category = data[i].category.toLowerCase();
	marker.setIcon( L.icon({
		iconUrl: "markers/" + chooseIcon(category, data[i].active),
		iconSize: [iconDim, iconDim],
		iconAnchor: [iconDim/2, iconDim*0.9],
		popupAnchor: [0, 0]
		/*shadowUrl: 'my-icon-shadow.png',
		shadowSize: [68, 95],
		shadowAnchor: [22, 94]*/
	}));
    marker.bindPopup(popupInfo);
    points.addLayer(marker);
	if (category === "limited vote") {
	  limitedVote.addLayer(marker);
	}
	else if (category === "instant runoff voting") {
	   instantRunoff.addLayer(marker);
	}
	else if (category === "single transferable vote") {
	   singleTransferable.addLayer(marker);
	}
	else if (category === "approval voting (bucklin system)") {
	   approvalBucklin.addLayer(marker);
	}
	else if (category === "cumulative voting") {
	   cumulativeVoting.addLayer(marker);
	}
	else if (category === "approval voting (preferential voting)") {
	   approvalPreferential.addLayer(marker);
	}	
  }

  var overlayMaps = {
    "Approval Voting (Bucklin System)": approvalBucklin,
	"Approval Voting (Preferential Voting)": approvalPreferential,
	"Cumulative Voting": cumulativeVoting,
	"Instant Runoff Voting": instantRunoff,
	"Limited Vote": limitedVote,
	"Single Transferable Vote": singleTransferable
  };
  
  
  function chooseIcon(category, active) {  
	  if (active.toLowerCase() === "yes"){
		  if (category === "limited vote") {
			  return "336699-15.svg";
		  }
		  else if (category === "instant runoff voting") {
			  return "cc3333-15.svg";
		  }
		  else if (category === "single transferable vote") {
			  return "cc3333-15.svg";
		  }
		  else if (category === "approval voting (bucklin system)") {
			  return "fc9d9d-15.svg";
		  }
		  else if (category === "cumulative voting") {
			  return "ffff00-15.svg";
		  }
		  else if (category === "approval voting (preferential voting)") {
			  return "ffff00-15.svg";
		  }
	  }
	  else {
		  if (category === "limited vote") {
			  return "66ccff-15.svg";
		  }
		  else if (category === "instant runoff voting") {
			  return "fc9d9d-15.svg";
		  }
		  else if (category === "single transferable vote") {
			  return "fc9d9d-15.svg";
		  }
		  else if (category === "approval voting (bucklin system)") {
			  return "fc9d9d-15.svg";
		  }
		  else if (category === "cumulative voting") {
			  return "ffff99-15.svg";
		  }
		  else if (category === "approval voting (preferential voting)") {
			  return "fc9d9d-15.svg";
		  }
	  }
	  return "black.svg";
  }

  /*
  Need to figure out how to style the points stored in overlayMaps using the attribute marker-color from the Google spreadsheet from line 3; the code below is from a jsfiddle I found at http://jsfiddle.net/erictheise/HQhzr/22/
  */
  
  /*
   {
    style: function(feature) {
        return {color: feature.properties.marker-color};
    },
  */
  
  L.control.layers(false, overlayMaps).addTo(map);
  map.addLayer(approvalBucklin);
  map.addLayer(approvalPreferential);
  map.addLayer(cumulativeVoting);
  map.addLayer(instantRunoff);
  map.addLayer(limitedVote);
  map.addLayer(singleTransferable);
  
  
  var bounds = points.getBounds();
  map.fitBounds(bounds, {padding:[10,10]});

  map.setView(map.getCenter());

  map.on('click', function(e) {
    var coords = document.getElementById('coords');
    coords.innerHTML="<p>Lat: <strong>" + e.latlng.lat + "</strong>, Lng: <strong>" + e.latlng.lng+"</strong>";
  });
}

//add fields here that you do not want displayed in the popupInfo. Must be all lowercase
/*
NEED TO FIGURE OUT HOW TO SHOW ONLY NON-NULL FIELDS IN THE POPUP;
ALSO NEED TO FIGURE OUT HOW TO SHOW MULTIPLE IMAGES IN A GALLERY/SLID-SHOW. BELOW IS AN EXAMPLE:
https://www.mapbox.com/mapbox.js/example/v1.0.0/markers-with-image-slideshow/
*/
function metadata(properties) {
  //This is equivalent to the first row of the spreadsheet, these are the field names; field names are called keys
  var obj = Object.keys(properties);
  //This is all of the HTML that goes into the popup
  var info = "";
  for(var p=0; p<obj.length; p++) {
    var prop = obj[p];
    if (prop != 'lat' &&
        prop != 'lng' &&
        prop != 'marker-color' &&		
        prop != 'rowNumber' &&
		properties[prop].length > 0) {
      //prop is the field name from the spreadsheet; properties is the geoJSON generated from one row of the spreadsheet
	  //INSTEAD OF PROP, NEED TO WRITE A NEW FUNCTION THAT DOES TEXT SUBSTITUTIONS
	  //get rid of <strong>"+prop+"</strong>: to not show the field names in the popup
	  info += "<p class='"+prop+"'><strong>"+prop+"</strong>: "+properties[prop]+"</p>";
    }
  }
  console.log(info);
  return info;
}

function showErrors(err) {
  console.log(err);
}