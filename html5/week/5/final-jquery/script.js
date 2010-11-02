var map = null;
var db;

jQuery(function($){
  getTweets();
  pageLoaded();

  var $nav = $('#navList');
  
  $nav.find('li').first().addClass('selected');
  $nav.find('a').live('click', function(e){
    $(this).parent().addClass('selected').siblings().removeClass('selected');
    navSelected(e);
    
    e.preventDefault();
    e.stopPropagation();
  });
  
  $('#tweetsList li img').live('click', function(e){
    var name = $(this).parent()[0].getAttribute('data-tweeter');
    $nav.find('li').removeClass('selected');
    getProfileForScreenName(name);
    
    e.preventDefault();
    e.stopPropagation();
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
					// First let's clear out the tweets list so we don't 
					// get duplicates.
					var tweetsList = document.getElementById('tweetsList');
					tweetsList.innerHTML = '';
					
					// Add results to list.
					for (var i = 0; i < len; i++) {
						// addTweetToList(username, userImageURL, text)
						var tweet = results.rows.item(i);
						addTweetToList(tweet.username, tweet.userImageURL, tweet.text);
					}
				}
			});
		});
	}
	else {
		console.log('Error loading cached tweets.')
	}
}

function addTweetToList(username, userImageURL, text) {
	// Add List Item to List
	var tweetsList = $('#tweetsList');
	tweetsList.append('<li data-tweeter="'+username+'"><img src="'+userImageURL+'" alt="'+username+'" class="user-image"><h3 class="username">'+username+'</h3><div class="message">'+text+'</div></li>');
	
}

function addEventListeners() {
	// Orientation Detection
	var supportsOrientationChange = "onorientationchange" in window;
	var orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";

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
		// getTweets();
		// header.innerText = 'Tweetstr';
		navigator.geolocation.getCurrentPosition(loadMap, function(error) {
			console.log(error.message);
		});
	}
}

function loadMap(position) {
	var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
	var myOptions = {
		center: latLng,
		zoom: 8,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById('mapCanvas'), myOptions);
	
	loadLocalTweets(position);
}

function loadLocalTweets(position) {
  $.getJSON('http://search.twitter.com/search.json?rpp=100&geocode=' + position.coords.latitude + ',' + position.coords.longitude + ',25mi&callback=?', function(json){
    var re = new RegExp('-?\\d+\\.\\d+\\,-?\\d+\\.\\d+');
		for (var resultId in json.results) {
      var result = json.results[resultId],
					m = re.exec(result.location);
			if ((m) && (m.length > 0)) {
				var latLng = m[0].split(',');
				var location = new google.maps.LatLng(latLng[0], latLng[1]);
				try {
					var mark = new google.maps.Marker({
						position: location,
						map: map
					});
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
	var fullYear =  date.getFullYear().toString();
	var month = date.getMonth() < 10 ? '0' + date.getMonth().toString() : date.getMonth().toString();
	var day = date.getDate() < 10 ? '0' + date.getDate().toString() : date.getDate().toString();
	var hours = date.getHours() < 10 ? '0' + date.getHours().toString() : date.getHours().toString();
	var minutes = date.getMinutes() < 10 ? '0' + date.getMinutes().toString() : date.getMinutes().toString();
	var seconds = date.getSeconds() < 10 ? '0' + date.getSeconds().toString() : date.getSeconds().toString();
	
	var dateArray = [fullYear, month, day];
	var timeArray = [hours, minutes, seconds];
	
	var dateString = dateArray.join('-') + ' ' + timeArray.join(':');
	
	return dateString;
}