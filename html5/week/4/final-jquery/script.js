var map = null;

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
  $.getJSON("http://search.twitter.com/search.json?q=OReillyMedia&callback=?", function(json){
    var list = '';
    for (var resultId in json.results) {
      var result = json.results[resultId],
          name = result.from_user,
          text = result.text,
          imageUrl = result.profile_image_url;
      
      list += '<li data-tweeter="'+name+'"><img src="'+imageUrl+'" alt="'+name+'" class="user-image"><h3 class="username">'+name+'</h3><div class="message">'+text+'</div></li>';
    }
    $('#tweetsList').html(list);
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
	addEventListeners();
	orientationChanged();
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
		getTweets();
		header.innerText = 'Tweetstr';
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
  $.getJSON("http://search.twitter.com/search.json?rpp=100&geocode=' + position.coords.latitude + ',' + position.coords.longitude + ',25mi&callback=?", function(json){
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