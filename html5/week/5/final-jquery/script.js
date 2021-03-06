var map = null,
		db;

jQuery(function($){
  getTweets();
  pageLoaded();

  var $nav = $('#navList');
  
  $nav.find('li').first().addClass('selected');
  $nav.find('a').live('click', function(e){
    e.preventDefault();
    $(this).parent().addClass('selected').siblings().removeClass('selected');
    navSelected(e);
  });
  
  $('#tweetsList li img').live('click', function(e){
    e.preventDefault();
    var name = $(this).parent()[0].getAttribute('data-tweeter');
    $nav.find('li').removeClass('selected');
    getProfileForScreenName(name);
  });

	window.scrollTo(0,1);
});

/*
 * Tweet Functionality
 ************************************************/
function navSelected(event) {
  // Now give navItem the selected css class.
  var navItem = event.target;
  
  // Now do the right thing.
  switch (navItem.id) {
    case 'liHome':
      switchToSectionWithId('home');
      break;
    case 'liMentions':
      break;
    case 'liFaves':
      break;
  }
}

function getTweets() {
	if (navigator.onLine == false) {
		loadCachedTweets();
		return;
	}

  $.getJSON("http://search.twitter.com/search.json?q=OReillyMedia&callback=?", function(json){
    var list = '';
    for (var resultId in json.results) {
      var result = json.results[resultId],
					id = result.id.toString(),
          name = result.from_user,
          text = result.text,
          imageUrl = result.profile_image_url;
      
      cacheTweetIfUnique(id, name, imageUrl, text);
    }
    // Now that we're done cacheing the tweets, lets load them.
		loadCachedTweets();
  });
}

function switchToSectionWithId(sectionId) {
  $('#'+sectionId).addClass('selected').siblings().removeClass('selected');
}

function getProfileForScreenName(screenName) {
  $.getJSON("http://api.twitter.com/1/users/show.json?screen_name="+screenName+"&callback=?", function(json){
    var profile = json,
        output = '';
    
    output += '<img src="'+profile.profile_image_url+'" alt="'+profile.name+'">';
    output += '<h3>'+profile.name+'</h3>';
    output += '<h4>@'+profile.screen_name+'</h4>';
    output += '<ul><li>'+profile.location+'</li>';
    output += '<li class="statustext">'+profile.status.text+'</li>';
    output += '<li class="followers">Followers: '+profile.followers_count+'</li>';
    output += '<li class="following">Following: '+profile.friends_count+'</li>';
    $('#profile').html(output);
    
    switchToSectionWithId('profile');
  });
}

/*
 * Map Functionality
 ************************************************/
function pageLoaded() {
	prepDB();
	addEventListeners();
	orientationChanged();
}

function prepDB() {
	if (window.openDatabase) {
		try {
			db = openDatabase('tweetstr', // Name
				'1.0', // Version
			  'A place to store our tweets for offline viewing', // Description
			  5 * 1024 * 1024); // Size (5MB)
			if (db) {
				db.transaction(function(tx) {
					tx.executeSql('CREATE TABLE IF NOT EXISTS tweets \
						(tweetId TEXT PRIMARY KEY,\
						 username TEXT,\
						 text TEXT,\
						 userImageURL TEXT,\
						 createdAt TEXT)');
				});
			}
		}
		catch (e) {
			console.log(e);
		}
		
	}
}

function cacheTweetIfUnique(id, username, userImageURL, text) {
	if (db) {
		db.transaction(function(tx) {
			var sql = 'SELECT COUNT(tweetId) AS c FROM tweets WHERE tweetId = "' + id + '"';
			// var sql = 'SELECT * FROM tweets';
			tx.executeSql(sql, [], function(tx, results) {
				if (results.rows.item(0).c == 0) {
					// This tweet has not been cached. Cache it yo!!!
					var nowString = stringFromDate(new Date());
					tx.executeSql('INSERT INTO tweets ("tweetId", username, text, userImageURL, createdAt) values (?, ?, ?, ?, ?)',
						[id,
						username,
						text,
						userImageURL,
						nowString]);
				}
			});
		});
	}
	else {
		console.log('Error caching tweet.');
	}
}

function loadCachedTweets() {
	if (db) {
		db.transaction(function(tx) {
			tx.executeSql('SELECT * FROM tweets ORDER BY tweetId DESC', [], function(tx, results) {
				var len = results.rows.length;
				if (len > 0) {
					// We are ready to start loading the cached tweets.
					var $tweetsList = $('#tweetsList'),
							tweets_list_content = '';
					
					// Add results to list.
					for (var i = 0; i < len; i++) {
						var tweet = results.rows.item(i);
						tweets_list_content += '<li data-tweeter="'+tweet.username+'"><img src="'+tweet.userImageURL+'" alt="'+tweet.username+'" class="user-image"><h3 class="username">'+tweet.username+'</h3><div class="message">'+tweet.text+'</div></li>';
					}
					$tweetsList.html(tweets_list_content);
				}
			});
		});
	}
	else {
		console.log('Error loading cached tweets.')
	}
}

function addEventListeners() {
	// Orientation Detection
	var supportsOrientationChange = "onorientationchange" in window,
			orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";

	window.addEventListener(orientationEvent, orientationChanged, false);
}

function orientationChanged() {
	var header = document.getElementById('header');
	if ((window.orientation == 90) || (window.orientation == -90)) {
		navigator.geolocation.getCurrentPosition(loadMap, function(error) {
			console.log(error.message);
		});
		header.innerText = 'Map View';
	} else {
		getTweets();
		header.innerText = 'Tweetstr';
	}
}

function loadMap(position) {
	var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
	var myOptions = {
			center: latLng,
			zoom: 10,
			mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById('mapCanvas'), myOptions);
	
	loadLocalTweets(position);
}

function loadLocalTweets(position) {
  $.getJSON('http://search.twitter.com/search.json?rpp=100&geocode=' + position.coords.latitude + ',' + position.coords.longitude + ',25mi&callback=?', function(json){
    var re = new RegExp('-?\\d+\\.\\d+\\,-?\\d+\\.\\d+');
		var infowindow = new google.maps.InfoWindow();
		
		for (var resultId in json.results) {
      var result = json.results[resultId],
					m = re.exec(result.location),
					id = result.id.toString(),
          name = result.from_user,
          text = result.text,
          imageUrl = result.profile_image_url;

			if ((m) && (m.length > 0)) {
				var latLng = m[0].split(','),
						location = new google.maps.LatLng(latLng[0], latLng[1]);
				try {
					var marker = new google.maps.Marker({
						position: location,
						map: map,
						title:name,
						text:text
					});

					google.maps.event.addListener(marker, 'click', (function(marker, location, map) { return function() {
						infowindow.setContent('<h2>'+marker.title+'</h2><p>'+marker.text+'</p>');
						infowindow.setPosition(location);
						infowindow.open(map, marker);
					}})(marker, location, map));
					
				}
				catch (ex) {
					console.log(ex);
				}
			}
    }
  });
}

function stringFromDate(date) {
	// Store createdAt like
	// 2010-11-2 03:00:00
	var fullYear =  date.getFullYear().toString(),
			month = date.getMonth() < 10 ? '0' + date.getMonth().toString() : date.getMonth().toString(),
			day = date.getDate() < 10 ? '0' + date.getDate().toString() : date.getDate().toString(),
			hours = date.getHours() < 10 ? '0' + date.getHours().toString() : date.getHours().toString(),
			minutes = date.getMinutes() < 10 ? '0' + date.getMinutes().toString() : date.getMinutes().toString(),
			seconds = date.getSeconds() < 10 ? '0' + date.getSeconds().toString() : date.getSeconds().toString(),
			dateArray = [fullYear, month, day],
			timeArray = [hours, minutes, seconds];
			
	return dateArray.join('-') + ' ' + timeArray.join(':');
}