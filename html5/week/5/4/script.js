function addEventListeners() {
	// Orientation Detection
	var supportsOrientationChange = "onorientationchange" in window;
	var orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";

	window.addEventListener(orientationEvent, orientationChanged, false);
}

function orientationChanged() {
	var header = document.getElementsByTagName('header')[0];
		
	if ((window.orientation == 90) ||
		(window.orientation == -90)) {
		navigator.geolocation.getCurrentPosition(loadMap, function(error) {
			// Handle Error
			console.log(error.message);
		});
		header.innerText = 'Map View';
	}
	else {
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
	var client = new XMLHttpRequest();
	client.onreadystatechange = function() {
		if (this.readyState == this.DONE && this.status == 200) {
			var response = eval('(' + this.responseText + ')');
			var re = new RegExp('-?\\d+\\.\\d+\\,-?\\d+\\.\\d+');
			
			for (var resultId in response.results) {
				var result = response.results[resultId];
				
				var m = re.exec(result.location);
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
		}
	};
	var apiCall = 'http://search.twitter.com/search.json?rpp=100&geocode=' + position.coords.latitude + ',' + position.coords.longitude + ',25mi';
	var requestString = '../../../shared/scripts/curl.php?apiCall=' + escape(apiCall);
	
	client.open('GET', requestString, true);
	client.send();				
}

function getProfileForScreenName(screenName) {
	var client = new XMLHttpRequest();
	client.onreadystatechange = function() {
		if (this.readyState == XMLHttpRequest.prototype.DONE && this.status == 200) {
			var profile = eval('(' + this.responseText + ')');
			
			// Get HTML Elements.
			var profileImage = document.getElementById('profileImage');
			profileImage.setAttribute('src', profile.profile_image_url);
			profileImage.setAttribute('alt', profile.name);
			
			var name = document.getElementById('name');
			name.innerText = profile.name;
			
			var screenName = document.getElementById('screenName');
			screenName.innerText = "@" + profile.screen_name;
			
			var location = document.getElementById('location');
			location.innerText = profile.location;
			
			var statusText = document.getElementById('statusText');
			//statusText.innerText = profile.status.text;
			
			var followersCount = document.getElementById('followersCount');
			followersCount.innerText = "Followers: " + profile.followers_count;
			
			var friendsCount = document.getElementById('friendsCount');
			friendsCount.innerText = "Following: " + profile.friends_count;
			
			switchToSectionWithId('profile');
		}
	};
	var apiCall = 'http://api.twitter.com/1/users/show.json?screen_name=' + screenName;
	var requestString = '../../../shared/scripts/curl.php?apiCall=' + escape(apiCall);

	client.open('GET', requestString, true);
	client.send();
}

function navSelected() {
	// First we need to clear all other nav items.
	clearAllNavItems();
	
	// Now give navItem the selected css class.
	var navItem = event.target;
	navItem.setAttribute('class', 'selected');
	
	// Now do the right thing.
	switch (navItem.id) {
		case 'liHome':
			getTweets();
			switchToSectionWithId('home');
			break;
		case 'liMentions':
			break;
		case 'liFaves':
			break;
	}
}

function clearAllNavItems() {
	var navList = document.getElementById('navList');
	
	for (var i = 0; i < navList.children.length; i++) {
		var li = navList.children[i];
		li.setAttribute('class', '');
	}
}

function switchToSectionWithId(sectionId) {
	hideAllSections();
	showSectionWithId(sectionId);
}

function hideAllSections() {
	var sections = document.getElementsByTagName('section');
	for (var i = 0; i < sections.length; i++) {
		var section = sections[i];
		section.setAttribute('class', '');
	}
}

function showSectionWithId(sectionId) {
	var section = document.getElementById(sectionId);
	section.setAttribute('class', 'selected');
}

function showProfile(username) {
	clearAllNavItems();
	getProfileForScreenName(username);
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