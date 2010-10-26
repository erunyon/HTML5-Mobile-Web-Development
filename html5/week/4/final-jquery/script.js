jQuery(function($){
  getTweets();
  
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
});
  
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

window.scrollTo(0,1);