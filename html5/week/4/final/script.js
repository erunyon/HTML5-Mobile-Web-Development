function getTweets() {
	//console.log('getTweets()');
	
	var client = new XMLHttpRequest();
	client.onreadystatechange = function() {
		if (this.readyState == XMLHttpRequest.prototype.DONE && this.status == 200) {
			// So far so good.
			var response = eval('(' + this.responseText + ')');
			for (var resultId in response.results) {
				var result = response.results[resultId];

				// Get info we'll use.
				var name = result.from_user;
				var text = result.text;
				var imageUrl = result.profile_image_url;
				
				// Create Image Element
				var imageElement = document.createElement('img');
				imageElement.setAttribute('src', imageUrl);
				imageElement.setAttribute('alt', name)
				imageElement.setAttribute('class', 'user-image');
				imageElement.setAttribute('onClick', "showProfile('" + name + "')");

				// Create username span
				var usernameSpan = document.createElement('span');
				usernameSpan.setAttribute('class', 'username');
				usernameSpan.innerText = name;
				
				// Create message span
				var messageSpan = document.createElement('span');
				messageSpan.setAttribute('class', 'message');
				messageSpan.innerText = text;
				
				// Create container div
				var div = document.createElement('div');
				div.appendChild(imageElement);
				div.appendChild(usernameSpan);
				div.appendChild(messageSpan);
							
				// Create List Item
				var li = document.createElement('li');
				li.appendChild(div);
				
				// Add List Item to List
				var tweetsList = document.getElementById('tweetsList');
				tweetsList.insertBefore(li, tweetsList.firstChild);
			}
		}
	};
	var apiCall = 'http://search.twitter.com/search.json?q=OReillyMedia';
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