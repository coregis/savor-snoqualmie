//replace the url for the spreadsheet being mapped here
window.onload=function(){
	getSpreadsheet('https://docs.google.com/spreadsheets/d/15JXa1bIRTXWj4cNQldh1UEZFVkRQk0DoLvHc4dWuSl8/pubhtml');
}

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
  var map = L.mapbox.map('map', 'mapbox.outdoors').setView([0,0],1);
  var points = L.featureGroup();
  var artsCulture = L.featureGroup();
  var farmActivities = L.featureGroup();
  var foodDrink = L.featureGroup();
  var heritage = L.featureGroup();
  var infoCenters = L.featureGroup();
  var farmProducts = L.featureGroup();
  var lodging = L.featureGroup();
  var publicRestrooms = L.featureGroup();
  var recreation = L.featureGroup();
  var uniqueGifts = L.featureGroup();
  
  
  
  for(var i=0;i<data.length;i++) {
    var marker = L.marker([parseFloat(data[i].lat), parseFloat(data[i].lng)]);
    var popupInfo = metadata(data[i]);
	
	//type in your desired dimensions for the markers; the marker will always be square
	var iconDim = 28;
	category = data[i].category.toLowerCase();
	marker.setIcon( L.icon({
		iconUrl: "markers/" + chooseIcon(category),
		iconSize: [iconDim, iconDim],
		iconAnchor: [iconDim/2, iconDim*0.9],
		popupAnchor: [0, 0]
		/*shadowUrl: 'my-icon-shadow.png',
		shadowSize: [68, 95],
		shadowAnchor: [22, 94]*/
	}));
    marker.bindPopup(popupInfo);
    points.addLayer(marker);
	if (category === "arts and culture") {
	  artsCulture.addLayer(marker);
	}
	else if (category === "farm activities") {
	   farmActivities.addLayer(marker);
	}
	else if (category === "food and drink") {
	   foodDrink.addLayer(marker);
	}
	else if (category === "heritage") {
	   heritage.addLayer(marker);
	}
	else if (category === "information centers") {
	   infoCenters.addLayer(marker);
	}
	else if (category === "local farm products") {
	   farmProducts.addLayer(marker);
	}	
	else if (category === "lodging") {
	   lodging.addLayer(marker);
	}
	else if (category === "public restrooms") {
	   publicRestrooms.addLayer(marker);
	}
	else if (category === "recreation") {
	   recreation.addLayer(marker);
	}
	else if (category === "unique gifts and collectibles") {
	   uniqueGifts.addLayer(marker);
	}	
  }

  var overlayMaps = {
    "Arts and Culture": artsCulture,
	"Farm Activities": farmActivities,
	"Food and Drink": foodDrink,
	"Heritage": heritage,
	"Information Centers": infoCenters,
	"Local Farm Products": farmProducts,
	"Lodging": lodging,
	"Public Restrooms": publicRestrooms,
	"Recreation": recreation,
	"Unique Gifts and Collectibles": uniqueGifts
  };
  
  
  function chooseIcon(category) {  
	  if (category === "arts and culture") {
		  return "0A5446-15.svg";
	  }
	  else if (category === "farm activities") {
		  return "368FB6-15.svg";
	  }
	  else if (category === "food and drink") {
		  return "2E592E-15.svg";
	  }
	  else if (category === "heritage") {
		  return "5B871D-15.svg";
	  }
	  else if (category === "information centers") {
		  return "29A39D-15.svg";
	  }
	  else if (category === "local farm products") {
		  return "1E1E06-15.svg";
	  }
	  else if (category === "lodging") {
		  return "A64E28-15.svg";
	  }
	  else if (category === "public restrooms") {
		  return "84A9A1-15.svg";
	  }
	  else if (category === "recreation") {
		  return "368FB6-15.svg";
	  }
	  else if (category === "unique gifts and collectibles") {
		  return "5B871D-15.svg";
	  }
	  return "black.svg";
  }

  L.control.layers(false, overlayMaps).addTo(map);
  map.addLayer(artsCulture);
  map.addLayer(farmActivities);
  map.addLayer(foodDrink);
  map.addLayer(heritage);
  map.addLayer(infoCenters);
  map.addLayer(farmProducts);
  map.addLayer(lodging);
  map.addLayer(publicRestrooms);
  map.addLayer(recreation);
  map.addLayer(uniqueGifts);

  var bounds = points.getBounds();
  map.fitBounds(bounds, {padding:[8,8]});

  map.setView(map.getCenter());

  map.on('click', function(e) {
    var coords = document.getElementById('coords');
    coords.innerHTML="<p>Lat: <strong>" + e.latlng.lat + "</strong>, Lng: <strong>" + e.latlng.lng+"</strong>";
  });
}

//add fields here that you do not want displayed in the popupInfo. Must be all lowercase
function metadata(properties) {
  //This is equivalent to the first row of the spreadsheet, these are the field names; field names are called keys
  var obj = Object.keys(properties);
  //This is all of the HTML that goes into the popup
  var info = "";
  for(var p=0; p<obj.length; p++) {
    var prop = obj[p];
    if (prop != 'lat' &&
        prop != 'lng' &&
        prop != 'theme' &&
        prop != 'category' &&		
        prop != 'loclink' &&
		prop != 'map-category' &&
		prop != 'subcategory' &&
		prop != 'coordinatesource' &&
		//prop != 'zip' &&
		prop != 'updater' &&
		prop != 'updated' &&
		properties[prop].length > 0) {
      //prop is the field name from the spreadsheet; properties is the geoJSON generated from one row of the spreadsheet
	  //INSTEAD OF PROP, NEED TO WRITE A NEW FUNCTION THAT DOES TEXT SUBSTITUTIONS
	  //get rid of <strong>"+prop+"</strong>: to not show the field names in the popup
	  info += "<p class='"+prop+"'>"+properties[prop]+"</p>";
    }
  }
  console.log(info);
  return info;
}

function showErrors(err) {
  console.log(err);
}