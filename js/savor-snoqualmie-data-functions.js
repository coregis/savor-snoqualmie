//Spreadsheet translation Functions
//  *** DO NOT DELETE THIS FILE ***
//NOT USING in MAP but this is how we get data out of the spreadsheet and into a format we can upload to wordpress.
  
  //getSpreadsheet('https://docs.google.com/spreadsheets/d/1RLYfBq2Jy-TOoP95jSEvU1tzVodSECP2g4t_DUz2v1U/pubhtml');
  //getSpreadsheet('https://docs.google.com/spreadsheets/d/1ptSzQ3Z8WLRibq_f3K8TedYReZNH4sVYXMBO-TgEsLU/pubhtml');
  function getSpreadsheet(key){
    Tabletop.init( { 
      key: key,
      callback:   translateToXml,
      simpleSheet: true
    });
  }
  function hyphenify(label) {
    return label.toLowerCase().split(' ').join('-');
  }
  function makePrimary(cat) {
    if (cat) {
      var slug = hyphenify(cat);
      if (mapCategories[slug]) {
        var cats = '<wp:postmeta>\n';
        cats += '<wp:meta_key><![CDATA[_yoast_wpseo_primary_tribe_events_cat]]></wp:meta_key>\n';
        cats += '<wp:meta_value><![CDATA[' + mapCategories[slug].term_id  + ']]></wp:meta_value>\n';
        cats += '</wp:postmeta>\n';
        //console.log(cats);
        return cats;
      }
    }
  }
  function makeCategory(data) {
    var cats = '';
    var slug;
    console.log("Original", data.category);
    if (data.category) {
      var catArr = data.category.split(', ');
      for (var i=0; i < catArr.length; i++){
        slug = hyphenify(catArr[i]);
        cats += '<category domain="tribe_events_cat" nicename="' + slug + '"><![CDATA[' +  catArr[i] + ']]></category>\n';
      }
    }
    if (data.subcategory) {
      var subcatArr = data.subcategory.split(', ');
      for (var i=0; i < subcatArr.length; i++){
        slug = hyphenify(subcatArr[i]);
        cats += '<category domain="tribe_events_cat" nicename="' + slug + '"><![CDATA[' +  subcatArr[i] + ']]></category>\n';
      }
    }
    console.log("processed", cats);
    return cats;
  }
  function getUrl(href) {
    var val;
    var link = [];
    var l = href.split('href="');
    if (href) {
      if (l.length > 1) {
        link = l[1].split('"');
        }  else {
          val = '';
        }
      if (link.length > 0) {
        val = link[0];
      } else {
        val = '';
      }
    } else {
      val = '';
    }
    //console.log(val);
    return val;
  }

  function translateToXml(data) {
    console.log(data);
    var count = 1;
    var total = data.lenght;
    var xml = '';
    for (d of data) {
      if (d.dup !== 'y'){
        console.log(d.placename);
        console.log(d.dup);
        var item = '<item>\n';
        item += '<title>' + d.placename + '</title>\n';
        var slug = d.placename.toLowerCase().split(' ').join('-');
        item += '<link>http://wordpress-ssv.dev/venue/' + slug + '/</link>\n';
        item += '<pubDate>Wed, 30 Nov 2016 17:41:06 +0000</pubDate>\n';
        item += '<dc:creator><![CDATA[admin]]></dc:creator>\n';
        item += '<guid isPermaLink="false">http://wordpress-ssv.dev/?post_type=tribe_venue&#038;p=' + count + '</guid>\n';
        item += '<description></description>\n';
        item += '<content:encoded><![CDATA[' + d.description + ']]></content:encoded>\n';
        item += '<excerpt:encoded><![CDATA[]]></excerpt:encoded>\n';
        item += '<wp:post_id>' + count + '</wp:post_id>\n';
        item += '<wp:post_date><![CDATA[2016-11-30 17:41:06]]></wp:post_date>\n';
        item += '<wp:post_date_gmt><![CDATA[2016-11-30 17:41:06]]></wp:post_date_gmt>\n';
        item += '<wp:comment_status><![CDATA[closed]]></wp:comment_status>\n';
        item += '<wp:ping_status><![CDATA[closed]]></wp:ping_status>\n';
        item += '<wp:post_name><![CDATA[' + slug + ']]></wp:post_name>\n';
        item += '<wp:status><![CDATA[publish]]></wp:status>\n';
        item += '<wp:post_parent>0</wp:post_parent>\n';
        item += '<wp:menu_order>0</wp:menu_order>\n';
        item += '<wp:post_type><![CDATA[tribe_venue]]></wp:post_type>\n';
        item += '<wp:post_password><![CDATA[]]></wp:post_password>\n';
        item += '<wp:is_sticky>0</wp:is_sticky>\n';
        item += makeCategory(d);

        var postmeta = {
            '_VenueOrigin' : 'events-calendar',
            '_edit_last' : 1,
            '_EventShowMapLink' : '',
            '_EventShowMap' : '',
            '_VenueAddress' : d.address,
            '_VenueCity' : d.city,
            '_VenueCountry' : 'United States',
            '_VenueProvince': '',
            '_VenueState' : d.state,
            '_VenueZip' : d.zip,
            '_VenuePhone' : d.phone,
            '_VenueURL' : getUrl(d.website),
            '_VenueShowMap' : 'false',
            '_VenueShowMapLink' : 'true',
            '_VenueStateProvince' : d.state,
            '_VenueOverwriteCoords' : '0',
            'venue_description' : d.description,
            '_VenueLat' : d.lat,
            '_VenueLng' : d.lng,
            'hours' : d.hours,
            'access' : d.access,
            'coordinate_source' : d.coordinatesource,
            'hide_on_map' : '0'
        }
        for (var key in postmeta) {
            item += '<wp:postmeta>\n';
            item += '<wp:meta_key><![CDATA[' + key + ']]></wp:meta_key>\n';
            item += '<wp:meta_value><![CDATA[' + postmeta[key] + ']]></wp:meta_value>\n';
            item += '</wp:postmeta>\n';
        }
        if(d.category) {
          item += makePrimary(d.category);
        }
        item += '</item>\n';
        xml += item;
        //if (count == 100 || count == 200 || count == 300 || count == 400 || count == 500) {
          //$('#spreadsheet').append('<textarea>' + xml + '</textarea>');
          //xml = '';
        //}
        count++;
      }//endif
    }//end loop
    console.log("Total items: ", count);
    $('#spreadsheet').append('<textarea>' + xml + '</textarea>');
  }