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
  var map = L.mapbox.map('map', 'mapbox.light').setView([0,0],1);
  var points = L.featureGroup();

  for(var i=0;i<data.length;i++) {
    var marker = L.marker([parseFloat(data[i].lat), parseFloat(data[i].lng)]);
    var popupInfo = metadata(data[i]);
    marker.bindPopup(popupInfo);
    points.addLayer(marker);
  }

  var overlayMaps = {
    "Points": points
  };

  L.control.layers(false, overlayMaps).addTo(map);
  map.addLayer(points);
  
  var bounds = points.getBounds();
  map.fitBounds(bounds, {padding:[10,10]});

  map.setView(map.getCenter());

  map.on('click', function(e) {
    var coords = document.getElementById('coords');
    coords.innerHTML="<p>Lat: <strong>" + e.latlng.lat + "</strong>, Lng: <strong>" + e.latlng.lng+"</strong>";
  });
}

//add fields here that you do not want displayed in the popupInfo. Must be all lowercase
function metadata(properties) {
  var obj = Object.keys(properties);
  var info = "";
  for(var p=0; p<obj.length; p++) {
    var prop = obj[p];
    if (prop != 'lat' &&
        prop != 'lng' &&
        prop != 'loclink' &&
        prop != 'coordinatesource' &&
        prop != 'updater' &&
        prop != 'updated' &&		
        prop != 'rowNumber') {
      info += "<p><strong>"+prop+"</strong>: "+properties[prop]+"</p>";
    }
  }
  console.log(info);
  return info;
}

function showErrors(err) {
  console.log(err);
}