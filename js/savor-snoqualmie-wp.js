
jQuery( document ).ready( function ( $ ) {
  var environment = window.location.hostname.length <= 0 ? 'local' : 'wordpress';
  var assetUrl = environment == 'wordpress' ? ssvMap.pluginsUrl + 'savor-snoqualmie/' : '';

  var venueData = {
    total: 500,
    received: 0,
    page: 1,
    complete: false,
    data: []
  };
  //set up as object so we have cleaner controls over the categories
  var mapCategories = {
    'arts-and-culture' : {
      label: 'Arts and Culture',
      icon: 'custom/arts.svg',
      term_id: 7
    },
    'farm-activities' : {
      label: 'Farm Activities',
      icon: 'custom/farm_activities.svg',
      term_id: 9
    },
    'food-and-drink' : {
      label: 'Food and Drink',
      icon: 'custom/food_and_drink.svg',
      term_id: 6
    },
    'heritage' : {
      label: 'Heritage',
      icon: 'custom/heritage.svg',
      term_id: 8
    },
    'information-centers' : {
      label: 'Information Centers',
      icon: 'custom/information.svg',
      term_id: 19
    },
    'local-farm-products' : {
      label: 'Local Farm Products',
      icon: 'custom/local_farms.svg',
      term_id: 20
    },
    'lodging' : {
      label: 'Lodging',
      icon: 'custom/lodging.svg',
      term_id: 21
    },
    'public-restrooms' : {
      label: 'Public Restrooms',
      icon: 'custom/restrooms.svg',
      term_id: 46
    },
    'recreation' : {
      label: 'Recreation',
      icon: 'custom/recreation.svg',
      term_id: 11
    },
    'unique-gifts-and-collectables' : {
      label: 'Unique Gifts and Collectables',
      icon: 'custom/gifts.svg',
      term_id: 22
    }
  }

  // ** GET THE DATA **//
  //get the data
  if ($('#ssv-map').length) {
    if ($('#ssv-map').attr('data-stops') && $('#ssv-map').attr('data-stops').length > 0) {
      getWordpressData($('#ssv-map').attr('data-stops'));
    } else {
      getWordpressData();
    }
  }


  function getWordpressData(stops) {
  if (environment == 'local') {
    //if local use local data - on account of CORS
    //this is an export of a subset of venues
    //to get an updated version, visit this url in a browser
    //  api only lets you get 100 at a time so if you want the whole set you have to page through
    //  http://dev.savorsnoqualmievalley.org/wp-json/wp/v2/tribe_venue?status=publish&per_page=100&page=1
    $.getJSON('data/wp-data.json', function(json){
        processWPData(json, function(data){
        buildMap(venueData.data);
      });
    });
  } else {
    getAjaxDataBatch(stops);
  }
}
function getAjaxDataBatch(stops, page) {
  //data is limited to 100 at a time
  var curPage = page ? page : 1;
  //console.log("getting page", curPage);
  var url = '/wp-json/wp/v2/tribe_venue?status=publish&page=' + curPage + '&per_page=100';
  if (stops) {
    url += '&include=' + stops;
  }
  $.ajax({
      method: "GET",
      url: url,
      success : function( response, textStatus, request ) {
        venueData.total = parseInt(request.getResponseHeader('X-WP-Total'), 10);
        venueData.received += response.length;
        if (venueData.received < venueData.total) {
          getAjaxDataBatch(stops, curPage + 1);
          processWPData(response, function(){
          });
        } else {
          processWPData(response, function() {
            //TODO need to ensure that all pages have been processed (test async);
            console.log('data complete, total records: ', venueData.total, 'total received: ', venueData.received, 'total to map: ', venueData.data.length);
            buildMap(venueData.data);
          });
        }
      },
      fail : function( response ) {
        //TODO ERROR HANDLING
        console.log( 'Ajax Error', response );
      }
    });
  }
  function debugData(debug, message) {
    if (debug) {
      console.log(message);
    }
  }

  function processWPData (data, callback) {
    for (var i = 0; i < data.length; i++) {
      var v = data[i];
      var venue;
      var debug = false;
      var msg;
      //some basic checks for the data we need
      //structured as nested if statements for easier debugging - set debug to true to debug
      if (v.hasOwnProperty('map_venue_data')) {
        venue = v.map_venue_data;
        if (venue.hide_on_map !== 'true') {
          if (venue.lat && venue.lng && venue.category) {
              venueData.data.push(venue);
          } else {
            msg = 'Skipping - missing critical data: name:' + venue.placename + ' lat: ' + venue.lat + ' lng: ' + venue.lng + ' cat: ' + venue.category;
          }
        } else {
          msg = 'Skipping: ' + venue.placename + ' - hide on map: ' + venue.hide_on_map;
        }
      } else {
         msg = 'Skipping - no map data';
      }
    }
    if (debug && msg) {
      console.log(msg);
    }
    if (callback) {
      callback();
    }
  }
  //build the html for the popup
  function metadata(properties) {

    //handle categories
    //TODO: not sure what is desired to show up here so showing both cats & subcats for now
    var categorylist = [];
    var subcategorylist = [];
    for(var n = 0; n < properties.category.length; n++) {
      var cat = properties.category[n];
      if (cat.parent == 0) {
        categorylist.push(cat.name);
      } else {
        subcategorylist.push(cat.name);
      }
    }
    properties.subcategorylist = subcategorylist.join(', ') ;
    properties.categorylist = categorylist.join(', ');

    //These are the properties we want to show, in order
    var useProps = ['placename', 'categorylist', 'subcategorylist', 'description', 'website', 'access', 'hours'];
    var info = "";
    for (var i=0; i<useProps.length; i++) {
      var prop = useProps[i];
      if (properties[prop] && properties[prop].length > 0) {
        if (prop == 'website') {
          info += '<p class="' + prop + '"><a href="' + properties[prop] + '" target="_blank">Website</a></p>';
        } else {
          info += '<p class="' + prop + '">' + properties[prop] + '</p>';
        }
      }
    }
    return info;
  }

  function buildMap(data, tabletop) {
    console.log("building map for", data.length, "places.");
    L.mapbox.accessToken = 'pk.eyJ1IjoiY29yZS1naXMiLCJhIjoiaUxqQS1zQSJ9.mDT5nb8l_dWIHzbnOTebcQ';

    // build map
    var map = L.mapbox.map('ssv-map', 'mapbox.outdoors').setView([0,0],1);
    map.options.minZoom = 9;
    map.options.maxZoom = 20;
    map.setMaxBounds([
    [47.306706, -122.479706], //southwest map coordinates
      [47.895169, -121.288376] //northeast map coordinates
    ]);
    var points = L.featureGroup();

    $.each(mapCategories, function(key, val) {
      mapCategories[key].layer = L.featureGroup();
    });

    for(var i=0;i<data.length;i++) {
      //process for each category listed if its 'parent' property is 0
      for(var n = 0; n < data[i].category.length; n++) {
        var category = data[i].category[n];
        if (category.parent === 0 && mapCategories[category.slug]) {
          var marker = L.marker([parseFloat(data[i].lat), parseFloat(data[i].lng)]);
          var popupInfo = metadata(data[i]);

          //type in your desired dimensions for the markers; the marker will always be square
          var iconDim = 34
          marker.setIcon( L.icon({
            iconUrl: assetUrl + 'markers/' + mapCategories[category.slug].icon,
            iconSize: [iconDim, iconDim],
            iconAnchor: [iconDim/2, iconDim*0.9],
            popupAnchor: [0, 0]
            /*shadowUrl: 'my-icon-shadow.png',
            shadowSize: [68, 95],
            shadowAnchor: [22, 94]*/
          }));
          marker.bindPopup(popupInfo,{'autoPan':'true','keepInView':'true'});
          points.addLayer(marker);
          mapCategories[category.slug].layer.addLayer(marker);
        }
      }//end category loop
    }//end data loop

    var overlayMaps = {};
    //set up control
    //TODO Only show in control if we have items in the category?
    $.each(mapCategories, function(key, val) {
      var label = '<img src="' + assetUrl + 'markers/' + val.icon + '" alt="' + val.label + '" /> ' + val.label;
      overlayMaps[label] = mapCategories[key].layer;
    });

    L.control.layers(false, overlayMaps).addTo(map);

    $.each(mapCategories, function(key, val) {
      map.addLayer(mapCategories[key].layer);
    });

    //This dynamically sets the bounds to the extent of the data
    var bounds = points.getBounds();
    map.fitBounds(bounds, {padding:[10,10]});

    //Use this to hard-code the extent
    /*var bounds = [
      [-122.397995, 47.373710], // southwest map coordinates
      [-121.122208, 47.832057]  // northeast map coordinates
  ];
    */
    
    map.setView(map.getCenter());

    map.on('click', function(e) {
      var coords = document.getElementById('coords');
      coords.innerHTML="<p>Lat: <strong>" + e.latlng.lat + "</strong>, Lng: <strong>" + e.latlng.lng+"</strong>";
    });
  }

  
  function showErrors(err) {
    console.log(err);
  }
  
} );