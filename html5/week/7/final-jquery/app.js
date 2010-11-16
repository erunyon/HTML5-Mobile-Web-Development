window.addEventListener("load", function(){
	addEventListeners();
}, false);

function addEventListeners() {
	// Toolbar Listeners
	var liVideo = document.getElementById('liVideo');
	liVideo.addEventListener('click', showVideo, false);
	
	var liAudio = document.getElementById('liAudio');
	liAudio.addEventListener('click', showAudio, false);
	
	// Cassette Listeners
	var listItems = document.getElementById('cassette');
	for (var index = 0; index < listItems.children.length; index++) {
		var item = listItems.children[index];
		item.addEventListener('click', changeAudio, false);
	}
	
	// Audio Time Update
	var audio = document.getElementsByTagName('audio')[0];
	audio.addEventListener('timeupdate', function() {
		var progressIndicator = document.getElementById('progressIndicator');
	
		var progress = parseInt(((audio.currentTime / audio.duration) * 100));
		progressIndicator.style.width = (progress + '%');
	}, false);
	
	// Audio Controlls
	var imgPlay = document.getElementById('imgPlay');
	imgPlay.addEventListener('click', function() {
		audio.play();
		var liPlay = document.getElementById('liPlay');
		var liPause = document.getElementById('liPause');
		
		liPlay.setAttribute('class', 'selected');
		liPause.setAttribute('class', '');
	}, false);
	
	var imgPause = document.getElementById('imgPause');
	imgPause.addEventListener('click', function() {
		audio.pause();
		var liPlay = document.getElementById('liPlay');
		var liPause = document.getElementById('liPause');
		
		liPlay.setAttribute('class', '');
		liPause.setAttribute('class', 'selected');
	}, false);
}

function showVideo() {
	var audioSection = document.getElementById('audio');
	var videoSection = document.getElementById('video');
	
	videoSection.setAttribute('class', 'selected');
	audioSection.setAttribute('class', '');
}

function showAudio() {
	var audioSection = document.getElementById('audio');
	var videoSection = document.getElementById('video');
	
	videoSection.setAttribute('class', '');
	audioSection.setAttribute('class', 'selected');
}

function changeAudio(event) {
	var item = event.target;
	
	// Change Song Label
	var name = item.children[0].innerText;
	if (name) {
		var songLabel = document.getElementById('songLabel');
		songLabel.innerText = name;
	}
	
	//var src = item.dataset.src;
	// Change Audio Source
	var src = item.getAttribute('data-src');
	if (src) {
		var audio = document.getElementsByTagName('audio')[0];
		// canplaythrough might be a better choice.
		audio.addEventListener('canplay', function() {
			audio.play();
		}, false);
		
		audio.src = src;
		audio.load();
	}
}