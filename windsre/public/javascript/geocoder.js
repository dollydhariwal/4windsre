function $(id) { return (document.getElementById(id)); }

function InitializeGeocoder() {
	
	l = document.location.toString(); gpsv_p1 = '%68%74%74%70%73%3F%3A%2F%2F'; gpsv_p2 = '%5E%68%74%74%70%73%3F%3A%2F%2F%28%77%2B%5C%2E%29%3F%67%5B%70%65%5D%5B%73%6F%5D%76%69%73%75%61%6C%69%7A%65%72'; gpsv_p3 = '(hbR9A0KDcnx0TU67kQ|55QacGZ2zQF2kLC_eA)$';
	var abort = ObsolescenceCheck(); if (abort) { return false; }
	
	if ($('javascript_warning')) { $('javascript_warning').style.display = 'none'; $('javascript_warning').innerHTML = ''; }
	elevation = false;
	process_name = 'geocoding';
	
	si = { google:{}, mapquest:{}, mapquestopen:{}, bing:{} }; // source info
	
	
	si['google'].name = 'Google';
	si['bing'].name = 'Bing Maps';
	si['mapquest'].name = 'MapQuest';
	si['mapquestopen'].name = 'MapQuest Open';
	
	si['google'].base_url = 'http://maps.google.com/maps/geo?output=json&sensor=false&key={KEY}&q={QUERY}&callback=GeocodeCallback';
	si['bing'].base_url = 'http://dev.virtualearth.net/REST/v1/Locations?key={KEY}&o=json&q={QUERY}&jsonso={QUERY}&jsonp=GeocodeCallback';
	si['bing'].base_url_parts = 'http://dev.virtualearth.net/REST/v1/Locations?key={KEY}&countryRegion={COUNTRY}&adminDistrict={STATE}&locality={CITY}&postalCode={POSTCODE}&addressLine={ADDRESS}&o=json&jsonso={QUERY}&jsonp=GeocodeCallback';
	si['mapquest'].base_url = 'http://www.mapquestapi.com/geocoding/v1/address?key={KEY}&inFormat=kvp&outFormat=json&location={QUERY}&callback=GeocodeCallback'; // kvp = key-value pairs
	si['mapquestopen'].base_url = 'http://open.mapquestapi.com/geocoding/v1/address?key={KEY}&inFormat=kvp&outFormat=json&location={QUERY}&callback=GeocodeCallback'; // kvp = key-value pairs
	
	si['google'].signup_url = 'https://code.google.com/apis/console';
	si['bing'].signup_url = 'https://www.bingmapsportal.com/';
	si['mapquest'].signup_url = 'http://developer.mapquest.com/web/products/quick_start';
	si['mapquestopen'].signup_url = 'http://developer.mapquest.com/web/products/quick_start';
	
	si['google'].instructions = "To get your own Google Maps API key, sign into https://code.google.com/apis/console with a valid Google account (or create a new one).  Click 'Create project', scroll down to 'Google Maps API v3', and click the On/Off switch to activate it. Accept Google's Terms of Service, then click on the 'API Access' link in the sidebar.  A key should already have been created for you; it will be 39 characters long and will probably start with 'AI'.  If you need to access your key again in the future, just use the 'API Access' link on the left.";
	si['bing'].instructions = "To get a Bing Maps API key, sign into bingmapsportal.com with your Microsoft account (or create a new account), then click on 'Create or view keys.'  Enter your name or company as the 'Application name,' and select 'Basic' as your key type and 'Public website' as the application type.  Your new key will appear at the bottom of the 'Create or view keys' page; it will be 64 characters long and will probably begin with 'A'.";
	si['mapquest'].instructions = "To get a MapQuest AppKey, go to developer.mapquest.com and click on the 'Create Account' link in the upper-right corner of the page.  In the sign-up form, be sure to check the box next to 'Would you like to create an App Key?'  Agree to the Terms of Use, and enter your name, company, or project as the AppKey Name.  Once you're signed in, click on your username at the top of the page and select 'Manage AppKeys' from the submenu (http://developer.mapquest.com/web/info/account/app-keys).  You may have to wait up to an hour for the key to be usable.";
	si['mapquestopen'].instructions = "To get a MapQuest Open AppKey (which is the same as a 'normal' Mapquest key), go to developer.mapquest.com and click on the 'Create Account' link in the upper-right corner of the page.  In the sign-up form, be sure to check the box next to 'Would you like to create an App Key?'  Agree to the Terms of Use, and enter your name, company, or project as the AppKey Name.  Once you're signed in, click on your username at the top of the page and select 'Manage AppKeys' from the submenu (http://developer.mapquest.com/web/info/account/app-keys).  You may have to wait up to an hour for the key to be usable.";
	
	si['google'].keyless_limit = 5;
	si['bing'].keyless_limit = 2;
	si['mapquest'].keyless_limit = 2;
	si['mapquestopen'].keyless_limit = 5;
	
	si['google'].firstcount = 0;
	
	si['google'].allow_text = false;
	
	for (var ds in si) {
		if (typeof(eval('self.'+ds+'_key')) != 'undefined') { si[ds].key = eval(ds+'_key'); }
		if (typeof(eval('self.'+ds+'_key2')) != 'undefined') { si[ds].key2 = eval(ds+'_key2'); }
		if (typeof(eval('self.'+ds+'_delay')) != 'undefined') { si[ds].delay = eval(ds+'_delay'); }
		if (typeof(eval('self.'+ds+'_limit')) != 'undefined') { si[ds].limit = eval(ds+'_limit'); }
		if (typeof(eval('self.'+ds+'_allow_text')) != 'undefined') { si[ds].allow_text = eval(ds+'_allow_text'); }
	}
	
	precision_alias = {
		bing:{ 'CountryRegion':'country', 'AdminDivision1':'state/province', 'AdminDivision2':'county/district', 'AdminDivision3':'sub-county/district', 'PopulatedPlace':'city/town', 'Postcode1':'postcode', 'RoadIntersection':'intersection', 'Road':'street', 'RoadBlock':'street', 'Address':'address' }
		,google:{ 'administrative_area_level_1':'state/province', 'administrative_area_level_2':'county/district', 'locality':'city/town', 'postal_code':'postcode', 'route':'street', 'street_address':'address', 'subpremise':'apartment/suite' }
		,mapquest:{'COUNTRY':'country', 'STATE':'state/province', 'COUNTY':'county/district', 'CITY':'city/town', 'ZIP':'postcode', 'STREET':'street', 'INTERSECTION':'intersection', 'ADDRESS':'address', 'POINT':'address'}
		,mapquestopen:{'COUNTRY':'country', 'STATE':'state/province', 'COUNTY':'county/district', 'CITY':'city/town', 'ZIP':'postcode', 'STREET':'street', 'INTERSECTION':'intersection', 'ADDRESS':'address', 'POINT':'address'}
	};
	precision_as_zoom = {
		'not found':3, 'country':5, 'state/province':6, 'county/district':8,
		'city/town':10, 'postcode':12, 'neighborhood':12, 'street':13, 'intersection':15, 'address':16, 'apartment/suite':17,
		'point_of_interest':13, 'university':13
	};
	
	extra_fields = ['address','city','state','postcode','country']; // ['sw_corner','ne_corner'];
	
	source_menu = $('data_source') || null;
	type_menu = $('input_type') || null;
	separator_menu = $('separator') || null;
	units_menu = $('units') || null;
	precision_checkbox = $('precision') || null;
	extra_info_checkbox = $('extra_info') || null;
	color_box = $('add_color') || null;
	progress_indicator = $('progress') || null;
	// error_message_div = $('error_message') || null;
	start_button = $('start') || null;
	start_button_parent = (start_button) ? start_button.parentNode : null;
	start_button_onclick = (start_button) ? start_button.getAttribute('onclick') : '';
	
	source = (source_menu) ? source_menu.value : null;
	previous_source = source;
	output_text = {};
	iframe_ok = {};
	
	ChangeSource();
	
	CheckForGeocoderTitle();
	CheckForInputParameters();
	if ($('google_key_box') && $('google_key_box').value == '' && self.google_key && google_key.match(/\w+/)) { $('google_key_box').value = google_key; }
	if ($('bing_key_box') && $('bing_key_box').value == '' && self.bing_key && bing_key.match(/\w+/)) { $('bing_key_box').value = bing_key; }
	if ($('mapquest_key_box') && $('mapquest_key_box').value == '' && self.mapquest_key && mapquest_key.match(/\w+/)) { $('mapquest_key_box').value = mapquest_key; }
	if ($('mapquestopen_key_box') && $('mapquestopen_key_box').value == '' && self.mapquestopen_key && mapquestopen_key.match(/\w+/)) { $('mapquestopen_key_box').value = mapquestopen_key; }
}

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

function DefineGeocodingKey() {
	var source = 'google';
	if (!source) { return false; }
	var k = 'AIzaSyCFteaWSX1WvVckfdaXBXkopxFzHxpmGug';
	var key_missing = false;
	geocoding_key = (k) ? k : ''; // global
	// alert ('source = '+source+', key = '+geocoding_key); // for debugging
	keyless_limit = 5 ;
	lookup_limit = 120; // global
}

function ChangeSource() {
	if (!source_menu) { return false; }
	else { source = source_menu.value; }
	
	if ($('geocode_results') && 1==1) {
		if (self.previous_source && source != previous_source) {
			output_text[previous_source] = $('geocode_results').value;
			$('geocode_results').value = (output_text[source]) ? output_text[source] : '';
		}
	}
	
	for (var ds in si) {
		if ($(ds+'_policies_message')) { $(ds+'_policies_message').style.display = 'none'; }
		if ($(ds+'_options_div')) { $(ds+'_options_div').style.display = 'none'; }
		if ($(ds+'_key_div')) { $(ds+'_key_div').style.display = 'none'; }
		if ($(ds+'_map_div')) { $(ds+'_map_div').style.display = 'none'; }
		if ($(ds+'_map_iframe')) {
			var location_parser = document.createElement('a'); location_parser.href = $(ds+'_map_iframe').src; var iframe_host = location_parser.host;
			iframe_ok[ds] = (iframe_host == document.location.host) ? true : false;
		}
	}
	if ($(source+'_options_div')) { $(source+'_options_div').style.display = 'block'; }
	if ($(source+'_key_div')) { $(source+'_key_div').style.display = 'block'; }
	if ($(source+'_map_div') && iframe_ok[source]) { $(source+'_map_div').style.display = 'block'; }
	
	if (si[source].allow_text === false) {
		if($('geocode_results')) { $('geocode_results').style.display = 'none'; }
		if($(source+'_policies_message')) { $(source+'_policies_message').style.display = 'block'; }
	} else {
		if($('geocode_results')) { $('geocode_results').style.display = 'block'; }
		if($(source+'_policies_message')) { $(source+'_policies_message').style.display = 'none'; }
	}
	
	if (source == 'google' && $('google_map_iframe')) {
		if (!self.google_map_iframe_centered && $('google_map_div') && $('google_map_div').style.display == 'block' && iframe_ok['google'] && $('google_map_iframe')) {
			$('google_map_iframe').contentWindow.setTimeout("if(self.gmap){GV_Recenter_Map()}else{window.setTimeout('if(self.gmap){GV_Recenter_Map()}',500)}",200);
			self.google_map_iframe_centered = true;
		}
	}
	previous_source = source;
}

function StartButton(processing_now) {
    var source = 'google';
	if (processing_now) {
		var style = 'color:#666666; font-weight:normal; background-color:#CCFFCC;';
		var text = (elevation) ? 'Cancel lookups' : 'Cancel '+process_name;
		var onclick = "continue_geocoding=false; StartButton(false,'"+process_name+"');";
		// start_button_parent.innerHTML = '<input id="start" type="button" style="'+style+'" value="'+text+'" onclick="'+onclick+'">';
	} else {
		var style='color:#000000; font-weight:bold; background-color:#CCFFCC;';
		var text = (elevation) ? 'Find elevations' : 'Start '+process_name;
		var onclick = "GeocodeMultiple('geocode_input','geocode_results');";
		// start_button_parent.innerHTML = '<input id="start" type="button" style="'+style+'" value="'+text+'" onclick="'+onclick+'">';
		if (source && self.location_counter && self.input_locations) {
			var finished = new Image();
			var s = (elevation) ? source+'-elevation' : source;
			finished.src = 'http://www.gpsvisualizer.com/geocoder/finished.png?source='+s+'&count='+location_counter+'/'+input_locations.length+'&page='+URIEscape(document.location)+'&key='+geocoding_key+'&time='+(new Date()).getTime();
		}
	}
}

function LoadGoogleAPI() {
	if (self.google && self.google.maps) { delete google.maps; } // may as well clear it before reloading
	var google_script = document.createElement('script'); google_script.type = "text/javascript"; google_script.src = "http://maps.googleapis.com/maps/api/js?v=3&sensor=false&callback=LoadGoogleAPICallback&key="+(geocoding_key?geocoding_key:'');
	google_code_loaded = true;
	google_code_loaded_key = geocoding_key;
	document.body.appendChild(google_script);
}
function LoadGoogleAPICallback() {
	GeocodeMultiple('geocode_input','geocode_results');
}

function DetectDataType(input_id) {
	if (!$(input_id)) { return false; }
	if (!$(input_id).value) { return false; }
	var first_row = '';
	var first_eol_position = $(input_id).value.indexOf('\n');
	if (first_eol_position > 0) {
		first_row = $(input_id).value.substring(0,first_eol_position);
	} else if (first_eol_position == 0) {
		var next_eol_position = $(input_id).value.indexOf('\n',1);
		first_row = $(input_id).value.substring(1,next_eol_position);
	}
	var detected_type;
	if (first_row.match(/(^|\t|,|\|) *(street|add?ress?e?1?|city|county|town|plaats|ville|state|province|zip.?(code)?|postal|posta?l?.?code|code.?postale?|airport|latitude|longitude|lat|lon|lng)\b/i)) {
		detected_type = 'table';
	} else {
		detected_type = 'list';
	}
	for (i=0; i<type_menu.options.length; i++) {
		if (type_menu.options[i].value == detected_type) {
			type_menu.selectedIndex = i;
		}
	}
	
	return true;
}

function ParseListOfAddresses() { // input_locations[] and input_lines[] are global
	for (j=0; j<input_lines.length; j++) {
		input_locations.push({location:input_lines[j]});
	}
	if (input_lines.length < 1) { return false; }
	
	// Prepare results box for output
	// if (!results_textarea.value.match(/\w/)) {
	//	if (elevation) {
	//		results_textarea.value += 'latitude'+sep+'longitude'+sep+'elevation'+(units=='us'?' (feet)':'');
	//	} else {
	//		results_textarea.value += 'latitude'+sep+'longitude'+sep+'name'+sep+'desc';
	//		results_textarea.value += sep+'color';
	//	}
	//	if (precision) {
	//		results_textarea.value += sep+qd('source')+sep+qd('precision');
	//	}
	//	if (extra_info) {
	//		for (var j=0; j<extra_fields.length; j++) {
	//			results_textarea.value += sep+qd(extra_fields[j].replace(/(^\s+|\s+$)/g,''));
	//		}
	//	}
	//	results_textarea.value += '\n';
	// }
	var count = (input_locations && input_locations.length) ? input_locations.length : 0;
	return count;
}

function ParseTabularAddresses() { // input_locations[] and input_lines[] are global
	if (input_lines.length < 2) { return false; }
	
	input_header = input_lines.shift();
	input_delimiter = ',';
	if (input_header.match(/\t/)) { input_delimiter = '\t'; }
	else if (input_header.match(/;/) && !input_header.match(/,/)) { input_delimiter = ';'; }
	else if (input_header.match(/\|/) && !input_header.match(/,/)) { input_delimiter = '|'; }
	var stray_delimiters = new RegExp(input_delimiter+'+$'); input_header = input_header.replace(stray_delimiters,'');
	input_fields = SmartSplit(input_header,input_delimiter);
	
	input_field_index = new Array;
	for (var j=0; j<input_fields.length; j++) {
		input_fields[j] = input_fields[j].replace(/(^\s+|\s+$)/g,""); // delete leading and trailing white space
		input_fields[j] = input_fields[j].replace(/,$/g,""); // delete trailing commas
		if (input_fields[j].match(/\bnumber\b/i) && input_fields[j].match(/(house|street)/i) && input_field_index['number'] == null) { input_field_index['number'] = j; }
		else if (input_fields[j].match(/^(house |business |home |work )?(street|add?ress?e?|rue|intersection|straat|strasse)\w?\b/i) && input_field_index['address'] == null) { input_field_index['address'] = j; }
		else if (input_fields[j].match(/^(add?ress?e? ?2)\b/i) && input_field_index['address2'] == null) { input_field_index['address2'] = j; }
		else if (input_fields[j].match(/^(cit[iy]e?|town|plaats|ort|ville)\w?\b/i) && input_field_index['city'] == null) { input_field_index['city'] = j; }
		else if (input_fields[j].match(/^(county|counties)\b/i) && input_field_index['county'] == null) { input_field_index['county'] = j; }
		else if (input_fields[j].match(/^(state|province)\w?\b/i) && input_field_index['state'] == null) { input_field_index['state'] = j; }
		else if (input_fields[j].match(/\b(zip(.?code)?|postal|posta?l?.?code|p\..?code|code.?postale?)\w?\b/i) && input_field_index['postcode'] == null) { input_field_index['postcode'] = j; }
		else if (input_fields[j].match(/\b(countr[iy]e?|nation|land)\w?\b/i) && input_field_index['country'] == null) { input_field_index['country'] = j; }
		else if (input_fields[j].match(/\b(a[ei]ro?port)\w?\b/i) && input_field_index['airport'] == null) { input_field_index['airport'] = j; }
		else if (input_fields[j].match(/\b(telephone|phone|tel)\b/i) && input_field_index['phone'] == null) { input_field_index['phone'] = j; }
		else if (input_fields[j].match(/^(name|nom|naam|company)$/i) && input_field_index['name'] == null) { input_field_index['name'] = j; }
		else if (input_fields[j].match(/^descr?(iption)?$/i) && input_field_index['desc'] == null) { input_field_index['desc'] = j; }
		else if (input_fields[j].match(/^(lati?|latt?itude)\b/i) && input_field_index['latitude'] == null) { input_field_index['latitude'] = j; }
		else if (input_fields[j].match(/^(long?|lng|long?t?itude)\b/i) && input_field_index['longitude'] == null) { input_field_index['longitude'] = j; }
		else if (input_fields[j].match(/^(alt\w*|ele\w*)\b/i) && input_field_index['elevation'] == null) { input_field_index['elevation'] = j; }
		else if (input_fields[j].match(/^(colou?re?|couleur)\b/i) && input_field_index['color'] == null) { input_field_index['color'] = j; }
		else if (input_fields[j] == 'source' && input_field_index['source'] == null) { input_field_index['source'] = j; }
		else if (input_fields[j] == 'precision' && input_field_index['precision'] == null) { input_field_index['precision'] = j; }
	}
	
	var field_count = 0; for (var i in input_field_index) { field_count++; }
	if (field_count == 0) { return false; }
	
	for (var j=0; j<input_lines.length; j++) {
		var parts = SmartSplit(input_lines[j],input_delimiter);
		var location = ''; input_locations[j] = {};
		if (elevation) {
			if (input_field_index['latitude'] != null && parts[input_field_index['latitude']] && input_field_index['longitude'] != null && parts[input_field_index['longitude']]) {
				location = parts[input_field_index['latitude']]+','+parts[input_field_index['longitude']];
			}
			input_locations[j]['location'] = location;
		} else {
			var lp = {}; // location parts
			if (input_field_index['airport' ] != null && parts[input_field_index['airport' ]]) { lp['airport' ] = parts[input_field_index['airport' ]]; location += lp['airport']; }
			if (input_field_index['address' ] != null && parts[input_field_index['address' ]]) {
				lp['address'] = (input_field_index['number'] != null && parts[input_field_index['number']]) ? parts[input_field_index['number']]+' '+parts[input_field_index['address']] : parts[input_field_index['address']];
				location += ' '+lp['address'];
			} else if (input_field_index['number'] != null && parts[input_field_index['number']]) {
				lp['address'] = parts[input_field_index['number']];
				location += ' '+lp['address'];
			}
			if (input_field_index['address2'] != null && parts[input_field_index['address2']]) { lp['address2'] = parts[input_field_index['address2']]; location += ', '+lp['address2']; }
			if (input_field_index['city'    ] != null && parts[input_field_index['city'    ]]) { lp['city'    ] = parts[input_field_index['city'    ]]; location += ', '+lp['city']; }
			if (input_field_index['county'] != null && parts[input_field_index['county']]) {
				lp['county'] = parts[input_field_index['county']]
				if (input_field_index['postcode'] == null || (input_field_index['postcode'] != null && !parts[input_field_index['postcode']])) { location += ', '+lp['county']; } // do not add county if there's ZIP info; it confuses some geocoders
			}
			if (input_field_index['state'   ] != null && parts[input_field_index['state'   ]]) { lp['state'   ] = parts[input_field_index['state'   ]]; location += ', '+lp['state']; }
			if (input_field_index['postcode'] != null && parts[input_field_index['postcode']]) { lp['postcode'] = parts[input_field_index['postcode']]; location += ', '+lp['postcode']; }
			if (input_field_index['country' ] != null && parts[input_field_index['country' ]]) { lp['country' ] = parts[input_field_index['country' ]]; location += ', '+lp['country']; }
			location = location.replace(/^[\s,;]+|[\s,;]+$|\s+([,;])/g,"$1"); // delete leading and trailing white space and commas
			location = location.replace(/[\s][\s]+/g," "); // compress white space
			input_locations[j]['location'] = location;
			input_locations[j]['parts'] = lp;
		}
		
		input_data[j] = [];
		var lat = '';
		if (input_field_index['latitude'] != null && parts[input_field_index['latitude']] != '' && parts[input_field_index['latitude']] != undefined) { lat = parts[input_field_index['latitude']]; }
		if (!lat.match(/\d/)) { lat = ''; }
		input_data[j]['latitude'] = lat;
		var lon = '';
		if (input_field_index['longitude'] != null && parts[input_field_index['longitude']] != '' && parts[input_field_index['longitude']] != undefined) { lon = parts[input_field_index['longitude']]; }
		if (!lon.match(/\d/)) { lon = ''; }
		input_data[j]['longitude'] = lon;
		if (elevation) {
			var ele = '';
			if (input_field_index['elevation'] != null && parts[input_field_index['elevation']] != '' && parts[input_field_index['elevation']] != undefined) { ele = parts[input_field_index['elevation']]; }
			if (!ele.match(/\d/)) { ele = ''; }
			input_data[j]['elevation'] = ele;
		}
	}
	
	// Prepare results box for output
	if (!results_textarea.value.match(/\w/)) {
		var header_row = new Array;
		for (var j=0; j<input_fields.length; j++) {
			var h = input_fields[j];
			if (h.indexOf(sep) > -1) { h = '"'+h+'"'; }
			header_row.push(h);
		}
		if (input_field_index['latitude'] == null) { header_row.push('latitude'); }
		if (input_field_index['longitude'] == null) { header_row.push('longitude'); }
		if (elevation) {
			if (input_field_index['elevation'] == null) { header_row.push('elevation'+(units=='us'?' (feet)':'')); }
		} else {
			if (input_field_index['name'] == null) { header_row.push('name'); }
			if (input_field_index['desc'] == null) { header_row.push('desc'); }
			if (input_field_index['color'] == null) { header_row.push('color'); }
		}
		if (precision) {
			if (input_field_index['source'] == null) { header_row.push('source'); }
			if (input_field_index['precision'] == null) { header_row.push('precision'); }
		}
		if (extra_info) {
			for (var j=0; j<extra_fields.length; j++) {
				if (input_field_index[extra_fields[j]] == null) {
					header_row.push(qd(extra_fields[j].replace(/(^\s+|\s+$)/g,'')));
				}
			}
		}
		results_textarea.value += header_row.join(sep) + '\n';
	}
	var count = (input_locations && input_locations.length) ? input_locations.length : 0;
	return count;
}

function GeocodeMultiple(input_id,output_id) {
	
	DefineGeocodingKey();
	var source = 'google';
	
	if (!self.geocoding_key || !geocoding_key || !source) {
		var service_name = (source && si[source]) ? si[source].name+' ' : '';
		alert ('You cannot use the '+service_name+' API, because no valid key is available.');
		StartButton(false,process_name);
		return false;
	}
	if (source == 'google') {
		if (!self.google_code_loaded || (self.google_code_loaded_key && self.geocoding_key && google_code_loaded_key != geocoding_key)) {
			LoadGoogleAPI(); // this will cause the GeocodeMultiple function to be started again (and DefineGeocodingKey to be run again, but that's not a big deal)
			return false;
		}
	}
	
	// globals:
	// data_source = 'google'
	source = 'google';
	input_textarea = ($(input_id)) ? $(input_id) : null;
	results_textarea = ($(output_id)) ? $(output_id) : null;
	source = 'google'
	input_type = 'list';
	precision = true ;
	extra_info = true ;
	added_color = '';
	sep = ','; 
	process_name = 'geocoding';
	elevation = false;
	units = 'metric';
	latlng = new google.maps.LatLng(-34.397, 150.644);
    mapOptions = {
    	zoom: 8,
    	center: latlng
    }
	map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
	output_text = {};
	iframe_ok = {};
	
	precision_alias = {
		google:{ 'administrative_area_level_1':'state/province', 'administrative_area_level_2':'county/district', 'locality':'city/town', 'postal_code':'postcode', 'route':'street', 'street_address':'address', 'subpremise':'apartment/suite' }
	};
	
	si = { google:{}}; // source info
	
	
	si['google'].name = 'Google';
		
	si['google'].base_url = 'http://maps.google.com/maps/geo?output=json&sensor=false&key={KEY}&q={QUERY}&callback=GeocodeCallback';
	si['google'].signup_url = 'https://code.google.com/apis/console';
	
	si['google'].instructions = "To get your own Google Maps API key, sign into https://code.google.com/apis/console with a valid Google account (or create a new one).  Click 'Create project', scroll down to 'Google Maps API v3', and click the On/Off switch to activate it. Accept Google's Terms of Service, then click on the 'API Access' link in the sidebar.  A key should already have been created for you; it will be 39 characters long and will probably start with 'AI'.  If you need to access your key again in the future, just use the 'API Access' link on the left.";
	
	si['google'].keyless_limit = (elevation) ? 5 : 1;
	
	si['google'].allow_text = false;
	si['google'].firstcount = 0;
	
	for (var ds in si) {
		if (typeof(eval('self.'+ds+'_key')) != 'undefined') { si[ds].key = eval(ds+'_key'); }
		if (typeof(eval('self.'+ds+'_key2')) != 'undefined') { si[ds].key2 = eval(ds+'_key2'); }
		if (typeof(eval('self.'+ds+'_delay')) != 'undefined') { si[ds].delay = eval(ds+'_delay'); }
		if (typeof(eval('self.'+ds+'_limit')) != 'undefined') { si[ds].limit = eval(ds+'_limit'); }
		if (typeof(eval('self.'+ds+'_allow_text')) != 'undefined') { si[ds].allow_text = eval(ds+'_allow_text'); }
	}
	
	// if (!gpsv_p1 || !gpsv_p2 || (l.match(unescape(gpsv_p1)) && !l.match(unescape(gpsv_p2)))) { return; }
	
	// if (error_message_div) { error_message_div.style.display = 'none'; error_message_div.innerHTML = ''; }
	
	// if (!input_textarea || !results_textarea) { return false; }
	
	var input_text = input_textarea.value.toString();
	input_text = input_text.replace(/(^\s+|\s+$)/g,""); // delete leading and trailing white space
	input_text = input_text.replace(/\r/,'\n'); // just in case there are weird line breaks
	input_lines = input_text.split(/\n/);
	input_locations = [];
	input_data = [];
	
	
	
	if (!input_text.match(/\w/)) { return false; }
	
	if (input_type == 'list' && input_lines[0].match(/(^|\t|,) *(street|add?ress?e?1?|city|county|town|ville|plaats|state|province|zip.?(code)?|postal|posta?l?.?code|p\..?code|code.?postale?|airport|latitude|longitude|lat|lng)\b/i)) {
		var override = confirm ('You\'ve selected "raw list" as your input type, but it looks like your data is in a structured table with column headers.  Click "OK" to continue, or "Cancel" to stop and either remove the header row or switch to "tabular data" mode.');
		if (!override) { return false; }
	} else if (input_type == 'table' && !input_lines[0].match(/(^|\t|,) *(street|add?ress?e?1?|city|county|town|ville|plaats|state|province|zip.?(code)?|postal|posta?l?.?code|p\..?code|code.?postale?|airport|latitude|longitude|lat|lng)\b/i)) {
		var override = confirm ('You\'ve selected "tabular data" as your input type, but it looks like your data doesn\'t have a header row.  Click "OK" to continue, or "Cancel" to stop and either add a header row or switch to "raw list" mode.');
		if (!override) { return false; }
	}
	
	var input_count;
	if (input_type == 'table') { // tabular
		input_count = ParseTabularAddresses(); // this creates global arrays: input_locations, input_lines, input_data; and scalar input_count
		if (!input_count) { return false; }
	} else { // list
		input_count = ParseListOfAddresses(); // this creates global arrays: input_locations, input_lines, input_data; and scalar input_count
		if (!input_count) { return false; }
	}
	if (self.overall_limit && input_count > overall_limit) {
		var geocode_too_many = confirm ("If you try to perform hundreds or thousands of queries, there's a good chance that "+si[source].name+" will stop returning results after a while, so it is HIGHLY recommended that you process your data in smaller batches.  Are you sure you want to continue with your "+input_count+" addresses?  (Click OK to take your chances, or Cancel to revise your input.)");
		if (!geocode_too_many) { return false; }
	}
	
	StartButton(true,process_name);
	continue_geocoding = true;
	
	location_counter = 0;
	lookup_counter = 0;
	var has_coordinates_already;
	if (elevation) {
		has_coordinates_already = (input_data.length == 0) ? false : ((input_data[location_counter]['elevation'].match(/\d/) && input_data[location_counter]['elevation'] != 0)) ? true : false;
	} else {
		has_coordinates_already = (input_data.length == 0) ? false : ((input_data[location_counter]['latitude'].match(/\d/) && input_data[location_counter]['latitude'] != 0) || (input_data[location_counter]['longitude'].match(/\d/) && input_data[location_counter]['longitude'] != 0)) ? true : false;
	}
	retries = {}; retries[source] = 0;
	if (input_locations[location_counter]['location'].match(/\w\w/) && !has_coordinates_already) {
		GeocodeLocation();
		
	} else {
		GeocodeCallback(null,null);
		
	}
	

}

function GeocodeLocation() {
    var source = 'google';
    
	if (elevation) {
		if (source == 'google') {
			var coords = input_locations[location_counter]['location'].toString().split(/\s*[\t;,\|]\s*/);
			// alert(coords);
			if (self.google && google.maps && coords.length >= 2) {
				var loc = new google.maps.LatLng(ParseCoordinate(coords[0]),ParseCoordinate(coords[1]))
				var el = new google.maps.ElevationService();
				el.getElevationForLocations({'locations':[loc]}, GeocodeCallback);
				
			} else {
				GeocodeCallback(null,null);
				
			}
			lookup_counter += 1;
		}
	} else {
		if (source == 'google') {
			var loc = input_locations[location_counter]['location'].toString().replace(/\t/g,', ');
			
			if (self.google && google.maps) {
				var gc = new google.maps.Geocoder();
				gc.geocode({'address':loc}, GeocodeCallback);
				
			} else {
				GeocodeCallback(null,null);
				
			}
			lookup_counter += 1;
		} else {
			var url; var loc = input_locations[location_counter]['location'].toString().replace(/\t/g,', ');
			if (si[source].base_url_parts && input_locations[location_counter]['parts']) {
				url = si[source].base_url_parts.replace(/{KEY}/g,geocoding_key).replace(/{QUERY}/g,URIEscape_Lite(loc));
				for (var p in input_locations[location_counter]['parts']) {
					var pattern = new RegExp('{'+p.toUpperCase()+'}','g');
					url = url.replace(pattern,URIEscape_Lite(input_locations[location_counter]['parts'][p]));
				}
				url = url.replace(/{\w+}/gi,''); // clean up unused parts
			} else {
				url = si[source].base_url.replace(/{KEY}/g,geocoding_key).replace(/{QUERY}/g,URIEscape_Lite(loc));
			}
			alert(url);
			geocode_script = new JSONscriptRequest(url);
			geocode_script.buildScriptTag(); // Build the dynamic script tag
			geocode_script.addScriptTag(); // Add the script tag to the page
			lookup_counter += 1;
		}
	}
}

function GeocodeCallback () {
	var source = 'google';
	var d = {}; // for output
	
	if (arguments[0] == null && arguments[1] == null) {
		d.no_lookup = true;
	} else {
		if (elevation) {
			if (source == 'google') {
				var results = arguments[0];
				var status = arguments[1];
				var try_again = false;
				
				if (status && status == google.maps.ElevationStatus.OK && results && results[0] && results[0].elevation) {
					
					if (results[0].location) {
						d.latitude = RoundNumber(results[0].location.lat(),7);
						d.longitude = RoundNumber(results[0].location.lng(),7);
					}
					d.elevation = results[0].elevation;
					d.resolution = (results[0].resolution) ? results[0].resolution : '';
					if (units == 'us') {
						d.elevation *= 3.28084;
						d.resolution *= 3.28084;
					}
					d.elevation = RoundNumber(d.elevation,1);
					d.resolution = RoundNumber(d.resolution,1);
				} else {
					d.elevation = '';
					d.resolution = '';
				}
			}
		} else {
			
			if (source == 'bing') {
				var data = arguments[0];
				var state_object = arguments[1];
				var try_again = false;
				
				if (data && data.resourceSets && data.resourceSets[0] && data.resourceSets[0].resources && data.resourceSets[0].resources[0]) {
					var first_result = data.resourceSets[0].resources[0];
					d.gv_name = (state_object) ? state_object : '';
					if (first_result.address && first_result.address.formattedAddress) {
						d.gv_desc = first_result.address.formattedAddress;
					}
					if (first_result.point) {
						if (first_result.point.coordinates && first_result.point.coordinates.length == 2) {
							d.latitude = parseFloat(first_result.point.coordinates[0].toFixed(7));
							d.longitude = parseFloat(first_result.point.coordinates[1].toFixed(7));
							var pr = (first_result.entityType) ? first_result.entityType : '';
							d.precision = (precision_alias[source][pr]) ? precision_alias[source][pr] : pr;
						} else {
							d.latitude = '0';
							d.longitude = '0';
							d.precision = 'not found';
						}
					}
					geocode_script.removeScriptTag();
				}
			}
			else if (source == 'mapquest' || source == 'mapquestopen') {
				var data = arguments[0];
				var try_again = false;
			
				if (data && data.results && data.results[0]) {
					var results = data.results[0];
					if (results.providedLocation && results.providedLocation.location) {
						d.gv_name = results.providedLocation.location;
					}
					if (results.locations && results.locations[0]) {
						var r = results.locations[0]; // only look at the FIRST one
						if (r.latLng && !(r.latLng.lng == -99.141968 && r.latLng.lat == 39.527596)) {
							d.latitude = parseFloat(r.latLng.lat.toFixed(7));
							d.longitude = parseFloat(r.latLng.lng.toFixed(7));
							if (r.geocodeQuality) { d.precision = r.geocodeQuality; }
							var pr = (r.geocodeQuality) ? r.geocodeQuality : '';
							d.precision = (precision_alias[source][pr]) ? precision_alias[source][pr] : pr;
							d.gv_desc = '';
							if (r.street) { d.gv_desc += r.street; }
							if (r.adminArea5) { d.gv_desc += (d.gv_desc) ? ', '+r.adminArea5 : r.adminArea5; }
							if (r.adminArea4) { d.gv_desc += (d.gv_desc) ? ', '+r.adminArea4 : r.adminArea4; }
							if (r.adminArea3) { d.gv_desc += (d.gv_desc) ? ', '+r.adminArea3 : r.adminArea3; }
							if (r.adminArea2) { d.gv_desc += (d.gv_desc) ? ', '+r.adminArea2 : r.adminArea2; }
							if (r.adminArea1) { d.gv_desc += (d.gv_desc) ? ', '+r.adminArea1 : r.adminArea1; }
							if (r.countryRegion) { d.gv_desc += (d.gv_desc) ? ', '+r.countryRegion : r.countryRegion; }
						} else {
							d.latitude = '0';
							d.longitude = '0';
							d.precision = 'not found';
						}
					}
					geocode_script.removeScriptTag();
				}
			}
			else if (source == 'google') {
				var results = arguments[0];
				var status = arguments[1];
				var try_again = false;
				
				if (status && status == google.maps.GeocoderStatus.OK && results && results[0] && results[0].geometry && results[0].geometry.location) {
					sleep(1000)
					var coords = results[0].geometry.location;
					d.latitude = parseFloat(results[0].geometry.location.lat().toFixed(7));
					d.longitude = parseFloat(results[0].geometry.location.lng().toFixed(7));
					d.gv_name = input_locations[location_counter]['location'].toString().replace(/\t/g,', ');
					d.gv_desc = results[0].formatted_address;
					var pr = (results[0].types && results[0].types[0]) ? results[0].types[0] : '';
					d.precision = (precision_alias[source][pr]) ? precision_alias[source][pr] : pr;
					
				} else {
					d.latitude = '0';
					d.longitude = '0';
					d.precision = 'not found';
				}
			}
			if (!d.gv_name) { d.gv_name = input_locations[location_counter]['location'].toString().replace(/\t/g,', '); }
		} // end if(elevation)
	}
	
	if (try_again && retries[source] < 2) { // don't do more than 3 lookups total
		retries[source] += 1;
	} else {
		OutputRow(d,coords);
		location_counter += 1;
		retries[source] = 0;
	}
	
	if (location_counter < input_locations.length && (!lookup_limit || lookup_counter < lookup_limit) && continue_geocoding) {
		var has_coordinates_already;
		if (elevation) {
			has_coordinates_already = (input_data.length == 0) ? false : ((input_data[location_counter]['elevation'].match(/\d/) && input_data[location_counter]['elevation'] != 0)) ? true : false;
		} else {
			has_coordinates_already = (input_data.length == 0) ? false : ((input_data[location_counter]['latitude'].match(/\d/) && input_data[location_counter]['latitude'] != 0) || (input_data[location_counter]['longitude'].match(/\d/) && input_data[location_counter]['longitude'] != 0)) ? true : false;
		}
		if (input_locations[location_counter]['location'].toString().match(/\w.*\w/) && !has_coordinates_already) {
			window.setTimeout("GeocodeLocation()",1000*si[source].delay);
		} else {
			GeocodeCallback(null,null);
		}
	} else if (location_counter < input_locations.length && lookup_limit && lookup_counter >= lookup_limit) {
		StartButton(false,process_name);
		var plural = (lookup_limit == 1) ? '' : 's';
		var msg = "Sorry, you're only allowed to perform "+lookup_limit+" "+process_name+" lookup"+plural+" with this form (unless you get your own key from "+si[source].name+").";
		alert (msg);
	} else if (location_counter == input_locations.length) { // all done, no limit issues
		StartButton(false,process_name);
	}
	
}

function OutputRow(d,coords) {
    var source = 'google';
    
	if (!input_lines[location_counter].match(/\w/)) { // blank line in input -> blank line in output
		results_textarea.value += '\n';
	} else {
		if (!elevation) {
			if (!d.gv_desc && d.gv_name && self.input_field_index && input_field_index['name'] != null) { d.gv_desc = d.gv_name; }
			d.gv_desc = (d.gv_desc == '' || d.gv_desc == null) ? '-' : d.gv_desc;
			d.gv_name = (d.gv_name == '' || d.gv_name == null) ? '-' : d.gv_name;
		}
		var lat, lon, ele, name, desc, color;
		if (input_type == 'table') {
			var row = new Array;
			ele = (input_data[location_counter]['elevation'] != '' && input_data[location_counter]['elevation'] != 0) ? input_data[location_counter]['elevation'] : d.elevation;
			lat = (input_data[location_counter]['latitude'] != '' && input_data[location_counter]['latitude'] != 0) ? input_data[location_counter]['latitude'] : d.latitude;
			lon = (input_data[location_counter]['longitude'] != '' && input_data[location_counter]['longitude'] != 0) ? input_data[location_counter]['longitude'] : d.longitude;
			var parts = SmartSplit(input_lines[location_counter],input_delimiter);
			for (var j=0; j<input_fields.length; j++) {
				if (input_fields[j].match(/^(lati?|latt?itude)\b/i)) {
					row.push(qd(lat));
				} else if (input_fields[j].match(/^(long?|lng|long?t?itude)\b/i)) {
					row.push(qd(lon));
				} else if (input_fields[j].match(/^(ele\w*|alt\w*)\b/i)) {
					row.push(qd(ele));
				} else {
					var p = (parts[j]) ? parts[j].replace(/(^\s+|\s+$)/g,'') : '';
					if ((!p || p == '') && d[input_fields[j]]) { p = d[input_fields[j]]; } // replace missing data
					if (input_fields[j].match(/^(colou?re?|couleur)\b/i) && p == '' && added_color != '') { p = added_color; }
					row.push(qd(p));
				}
			}
			if (input_field_index['latitude'] == null) { row.push(qd(lat)); }
			if (input_field_index['longitude'] == null) { row.push(qd(lon)); }
			if (elevation) {
				if (input_field_index['elevation'] == null) { row.push(qd(ele)); }
			} else {
				if (input_field_index['name'] == null) { row.push(qd(d.gv_name)); name = d.gv_name; } else { name = parts[input_field_index['name']];}
				if (input_field_index['desc'] == null) { row.push(qd(d.gv_desc)); desc = d.gv_desc;  } else { desc = parts[input_field_index['desc']];}
				if (input_field_index['color'] == null) { row.push(qd(added_color)); color = added_color; }  else { color = parts[input_field_index['color']];}
			}
			if (precision) {
				if (input_field_index['source'] == null && !d.no_lookup) {
					row.push(qd(si[source].name));
				}
				if (input_field_index['precision'] == null) {
					var p = (d.precision) ? d.precision.replace(/(^\s+|\s+$)/g,'') : '';
					row.push(qd(p));
				}
			}
			if (extra_info) {
				for (var j=0; j<extra_fields.length; j++) {
					if (input_field_index[extra_fields[j]] == null) {
						var e = (d[extra_fields[j]]) ? d[extra_fields[j]].replace(/(^\s+|\s+$)/g,'') : '';
						row.push(qd(e));
					}
				}
			}
			results_textarea.value += row.join(sep) + '\n';
		} else {
			if (elevation) {
				results_textarea.value += qd(d.latitude)+sep+qd(d.longitude)+sep+qd(d.elevation);
			} else {
				results_textarea.value += qd(d.latitude)+sep+qd(d.longitude)+sep+qd(d.gv_name)+sep+qd(d.gv_desc);
				results_textarea.value += sep+qd(added_color);
			}
			if (precision) {
				var p = (d.precision) ? d.precision.replace(/(^\s+|\s+$)/g,'') : '';
				results_textarea.value += sep+qd(si[source].name)+sep+qd(p);
			}
			// if (extra_info) {
			//	for (var j=0; j<extra_fields.length; j++) {
			//		var e = (d[extra_fields[j]]) ? d[extra_fields[j]].replace(/(^\s+|\s+$)/g,'') : '';
			//		results_textarea.value += sep+qd(e);
			//	}
			// }
			results_textarea.value += '\n';
			lat = d.latitude; lon = d.longitude; name = d.gv_name; desc = d.gv_desc; color = added_color;
		}
		
		var contentString = '<div id="content">'+
      							'<div id="bodyContent">'+
      								'<p>' + d.gv_name + '</p>'+
						   		'</div>'+
      						'</div>';
		
		 var infowindow = new google.maps.InfoWindow({
      		content: contentString
		 });
		 
		var desc_on_map = (desc != '' && desc != '-') ? desc : '';
		// alert('value of iframe ' + iframe_ok['google'] + 'value of typeof ' + typeof(lat) + ' ' + typeof(lon) + 'lat and lon ' + lat + ' ' + lon);
		if (source == 'google' && typeof(lat) != 'undefined' && typeof(lon) != 'undefined' && (lat != 0 || lon != 0)) {
			map.setCenter(coords);
      		var marker = new google.maps.Marker({
            		map: map,
            		position: coords,
            		title: d.gv_name
        	});
			// $('google_map_iframe').contentWindow.GV_Draw_Marker({'lat':lat,'lon':lon,'name':name,'desc':desc_on_map,'label':name,'color':color});
			// $('google_map_iframe').contentWindow.GV_Autozoom({margin:30},'wpts');
			
		} 
		
		google.maps.event.addListener(marker, 'click', function() {
    		infowindow.open(map,marker);
  		});
  		
		if (si[source].firstcount < 1){
		
			
			// Add circle overlay and bind to marker
			var circle = new google.maps.Circle({
 				 map: map,
  				 radius: 1609,    // 1 miles in metres
  				 fillColor: '#CC6600'
			});
			circle.bindTo('center', marker, 'position');
		}
		
		si[source].firstcount = si[source].firstcount + 1;
		
	}
	results_textarea.scrollTop = results_textarea.scrollHeight;
	
	// if (progress_indicator) { progress_indicator.innerHTML = '('+(location_counter+1)+' of '+input_locations.length+' lines processed)'; }
}

function ClearResultsBoxAndMap () {
	$('geocode_results').value = '';
	$('progress').innerHTML = '';
	if ($('google_map_div') && $('google_map_div').style.display != 'none' && iframe_ok['google'] && $('google_map_iframe')) {
		$('google_map_iframe').contentWindow.GV_Delete_All_Markers();
	}
}


function qd(text) { // qd = quote delimiters (actually escaping them)
	if (text == undefined) { return ''; }
	text = text.toString();
	if (text == '') { return ''; }
	var dl = (sep) ? sep : ',';
	var pattern = (dl == '|') ? '\\'+dl : dl;
	if (text.toString().match(pattern)) {
		return '"'+text.replace(/(^\s+|\s+$)/g,'')+'"';
	} else {
		return text.replace(/(^\s+|\s+$)/g,'');
	}
}

function SmartSplit(text,dl) {
	var pattern = new RegExp('(^|'+dl+')\\s*"(.*?)"\\s*(?='+dl+'|$)','g');
	text = text.replace(pattern,
		function (complete_match,dl1,cell_contents) {
			return (dl1+cell_contents.replace(/,/g,'{delimiter}'));
		}
	);
	var parts = text.split(dl);
	for (i=0; i<parts.length; i++) {
		parts[i] = parts[i].replace(/\{delimiter\}/g,dl);
		parts[i] = parts[i].replace(/(^\s+|\s+$)/g,'');
	}
	return parts;
}

function URIEscape(text) {
	text = escape(text);
	text = text.replace(/\//g,"%2F");
	text = text.replace(/\?/g,"%3F");
	text = text.replace(/=/g,"%3D");
	text = text.replace(/&/g,"%26");
	text = text.replace(/@/g,"%40");
	text = text.replace(/\#/g,"%23");
	return (text);
}
function URIEscape_Lite(text) {
	text = text.replace(/\//g,"%2F");
	text = text.replace(/\?/g,"%3F");
	text = text.replace(/=/g,"%3D");
	text = text.replace(/&/g,"%26");
	text = text.replace(/@/g,"%40");
	text = text.replace(/\#/g,"%23");
	return (text);
}

function CheckForGeocoderTitle() {
	if (!$('gv_title') || ($('gv_title') && !$('gv_title').innerHTML.match(/gps ?visualizer/i))) {
		var first_h1 = document.getElementsByTagName("h1").item(0);
		if (first_h1 && first_h1.innerHTML.match(/gps ?visualizer/i)) {
			// older version with no id in the H1 tag; it's okay
		} else {
			var new_title = document.createElement('div');
			new_title.innerHTML = '<h1 style="margin-top:0px;" id="gv_title"><a href="http://www.gpsvisualizer.com/">GPS Visualizer\'s</a> Easy Batch Geocoder</h1>';
			var body = document.getElementsByTagName("body").item(0);
			if (body) { body.insertBefore(new_title,body.firstChild); }
		}
	}
}
function CheckForInputParameters() {
	if (self.input_parameters_checked) { return false; } // only do it ONCE
	var l = window.location.toString();
	for (var ds in si) {
		var key_pattern = new RegExp('\\b'+ds+'_key=([^&]+)','i');
		if (l.match(key_pattern)) {
			var key_match = key_pattern.exec(l);
			if (key_match && key_match[1] && $(ds+'_key_box') && $(ds+'_key_box').value == '') {
				$(ds+'_key_box').value = key_match[1];
			}
		}
	}
	var source_pattern = new RegExp('\\bsource=([^&]+)','i');
	if (l.match(source_pattern) && source_menu && source_menu.length) {
		var source_match = source_pattern.exec(l);
		for (var i=0; i<source_menu.length; i++) {
			if (source_menu[i].value != '' && source_menu[i].value.toLowerCase() == source_match[1].toLowerCase()) {
				source_menu.selectedIndex = i;
			}
		}
		ChangeSource();
	}
	input_parameters_checked = true;
}

function KeyExplanation() {
	var keyless_limit = (si[source].keyless_limit) ? si[source].keyless_limit : 1;
	var plural = (keyless_limit == 1) ? '' : 's';
	alert('Each '+si[source].name+' key is only allowed a limited number of lookups per day. If you want to use this form to perform more than '+keyless_limit+' lookup'+plural+' at a time, you need to enter your own key.')
}
function GetYourOwnKey(s) {
	window.open('http://www.gpsvisualizer.com/geocoder/key.html#'+s,'key_instructions','width=420,height=400,toolbar=no,location=no,status=no,menubar=no,resizable=yes,scrollbars=yes');
	return;
	/*
	if (!s || !si || !si[s] || !si[s].signup_url || !si[s].instructions) { return false; }
	var ok = confirm(si[s].instructions+"\n\n"+"Click OK to continue to "+si[s].name+"'s site.");
	if (ok) { window.open(si[s].signup_url,'_blank'); }
	*/
}

function ObsolescenceCheck() {
	if (!$('data_source')) {
		var ok = confirm("GPS Visualizer's geocoding functions were heavily modified in September 2013, and the Yahoo geocoding service no longer exists.  So if you're seeing this message, you're probably using a saved off-line copy of an older version of the batch geocoding page.  Click 'OK' to go to the new version at http://www.gpsvisualizer.com/geocoder/.");
		if (ok) { window.location = 'http://www.gpsvisualizer.com/geocoder/'; }
		return true; // true means it IS obsolete and the code should be aborted
	} else {
		return false; // not obsolete
	}
}
function ShowHideGoogleOptions() { ObsolescenceCheck(); }


function ParseCoordinate(coordinate) {
	if (coordinate == null) { return ''; }
	coordinate = coordinate.toString();
	coordinate = coordinate.replace(/([0-9][0-9][0-9]?)([0-9][0-9])\.([0-9]+)/,'$1 $2'); // convert DDMM.MM format to DD MM.MM
	coordinate = coordinate.replace(/[^NESW0-9\.\- ]/gi,' '); // only a few characters are useful; delete the rest
	var neg = 0; if (coordinate.match(/(^\s*-|[WS])/i)) { neg = 1; }
	coordinate = coordinate.replace(/[NESW\-]/gi,' ');
	if (!coordinate.match(/[0-9]/i)) { return ''; }
	parts = coordinate.match(/([0-9\.\-]+)[^0-9\.]*([0-9\.]+)?[^0-9\.]*([0-9\.]+)?/);
	if (!parts || parts[1] == null) {
		return '';
	} else {
		n = parseFloat(parts[1]);
		if (parts[2]) { n = n + parseFloat(parts[2])/60; }
		if (parts[3]) { n = n + parseFloat(parts[3])/3600; }
		if (neg && n >= 0) { n = 0 - n; }
		n = Math.round(10000000 * n) / 10000000;
		if (n == Math.floor(n)) { n = n + '.0'; }
		n = n+''; // force number into a string context
		n = n.replace(/,/g,'.'); // in case some foreign systems created a number with a comma in it
		return n;
	}
}
function RoundNumber(num,digits) {
	return parseFloat(parseFloat(num).toFixed(digits));
}


// JSONscriptRequest -- a simple class for accessing Web Services
// using dynamically generated script tags and JSON
//
// Author: Jason Levitt
// Date: December 7th, 2005
//
// Constructor -- pass a REST request URL to the constructor

function JSONscriptRequest(fullUrl) {
	// REST request path
	this.fullUrl = fullUrl; 
	// Keep IE from caching requests
	this.noCacheIE = '&noCacheIE=' + (new Date()).getTime();
	// Get the DOM location to put the script tag
	this.headLoc = document.getElementsByTagName("head").item(0);
	// Generate a unique script tag id
	this.scriptId = 'JscriptId' + JSONscriptRequest.scriptCounter++;
}

// Static script ID counter
JSONscriptRequest.scriptCounter = 1;

// buildScriptTag method
//
JSONscriptRequest.prototype.buildScriptTag = function () {

	// Create the script tag
	this.scriptObj = document.createElement("script");
	
	// Add script object attributes
	this.scriptObj.setAttribute("type", "text/javascript");
	this.scriptObj.setAttribute("src", (this.fullUrl.match(/&callback=/)) ? this.fullUrl.replace(/&callback=/,this.noCacheIE+'&callback=') : this.fullUrl+this.noCacheIE); // Google requires 'callback' to be the LAST parameter
	this.scriptObj.setAttribute("id", this.scriptId);
}
 
// removeScriptTag method
// 
JSONscriptRequest.prototype.removeScriptTag = function () {
	// Destroy the script tag
	this.headLoc.removeChild(this.scriptObj);  
}

// addScriptTag method
//
JSONscriptRequest.prototype.addScriptTag = function () {
	// Create the script tag
	this.headLoc.appendChild(this.scriptObj);
}
