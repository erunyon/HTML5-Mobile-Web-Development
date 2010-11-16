addEventListeners();

function addEventListeners() {
  var $audio = $('#audio-player');
  
  // Toolbar Listeners
  $('#liVideo').click(function(e){
    e.preventDefault();
    showVideo();
  });
  $('#liAudio').click(function(e){
    e.preventDefault();
    showAudio()
  });
  
  // Cassette Listeners
  var $audio = $('#cassette li');
  $audio.each(function(){
    $(this).click(function(e){
      changeAudio(e);
    });
  });
  
  // Audio Time Update
  $audio.bind('timeupdate', function(){
    var $progressIndicator = $('#progressIndicator'),
        audio = this,
        progress = parseInt(((audio.currentTime / audio.duration) * 100));
        
    $progressIndicator.css({width: progress+'%'});
  });
  
  // Audio Controls
  $('#imgPlay').click(function(e) {
    e.preventDefault();
    $('#audio-player')[0].play();
    
    $('#liPlay').addClass('selected');
    $('#liPause').removeClass();
  });
  
  $('#imgPause').click(function(e) {
    e.preventDefault();
    $('#audio-player')[0].pause();
    
    $('#liPlay').removeClass();
    $('#liPause').addClass('selected');
  });
}

function showVideo() {
  $('#audio-player')[0].pause();
  
  $('#audio').removeClass('selected');
  $('#video').addClass('selected');
}

function showAudio() {
  $('#video-player')[0].pause();
  
  $('#audio').addClass('selected');
  $('#video').removeClass('selected');
}

function changeAudio(event) {
  var item = event.target;
  
  // Change Song Label
  var name = item.children[0].innerText;
  if (name) {
    $('#songLabel').text(name);
  }
  
  //var src = item.dataset.src;
  // Change Audio Source
  var src = item.getAttribute('data-src');
  if (src) {
    var $audio = $('#audio-player'),
        audio = $audio[0];
    // canplaythrough might be a better choice.
    $audio.bind('canplay', function() {
      audio.play();
    });
    
    audio.src = src;
    audio.load();
  }
}