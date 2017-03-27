var Sound;
(function() {

var soundCloud = function(fft_size) {

  // setup the player
  var body = document.querySelector('body');
  var client_id = "a02d202ac1397c777070cd10fbe015c5"; // to get an ID go to http://developers.soundcloud.com/

  // exposes audioChannelVolume
  var audioChannelVolume = [];

  var timelineWidth;
  var mix = [];
  var audioChannelVolume = [];
  var volume = [];
  var audioCtx;
  this.analyser;
  this.source;
  this.volumeLow = 0;
  this.volumeHi = 0;
  this.streamData;
  this.audio;
  this.sound = {};
  // this.fft_size = fft_size || 256;
  this.fft_size = 256;

  var genres = ["slomo", "deeptechno", "ebm", "disco", "deepdisco", "indiedisco", "slomodisco", "slomohouse", "downtempotechno", "downtempo", "deepness", "pixies", "lowmotion", "plastikman", "minimalhouse", "acidhouse", "cosmic", "cosmicdisco", "ambient", "vapourwave"];

  // SETUP AUDICONTEXT INSTANCE
  var player = createAudioElement('player', fft_size);

  function createAudioElement(audio_name){

    var audioElement = document.createElement('audio');
    audioElement.setAttribute("id", audio_name);
    body.appendChild(audioElement);
    audioElement.width = window.innerWidth;
    audioElement.height = window.innerHeight;

    setupPlayer(audioElement, fft_size);
    createPlayerUI(audioElement);
    return audioElement;

  }

  this.getVolume = function(streamData) {
    var vol = [];
    for (var i = streamData.length - 1; i >= 0; i--) {
        vol[i] = streamData[i];
    }
    return vol;
  }


  function setupPlayer(audioElement, fft_size){
    var audioCtxCheck = window.AudioContext || window.webkitAudioContext;
    if (!audioCtxCheck) {
      alert("Audio context error");
    } else {
      audioCtx = new (window.AudioContext || window.webkitAudioContext);
      analyser = audioCtx.createAnalyser();
      var fft_size = 256
      console.log(fft_size);
      analyser.fftSize = fft_size;
      analyser.smoothingTimeConstant = 0.3;
      source = audioCtx.createMediaElementSource(audioElement);
      source.connect(analyser);
      analyser.connect(audioCtx.destination);
      streamData = new Uint8Array(analyser.frequencyBinCount);
      var song_type = getGenre();
      setInterval(function() {
        analyser.getByteFrequencyData(streamData);
        //mix = this.getMixFromFFT(streamData);
        this.volume = this.getVolume(streamData);

      }, 20);
    }
  }


  function playStream(streamUrl) {
      // Get the input stream from the audio element
      player.addEventListener('ended', function(){
            console.log('end track.')
      });
      player.crossOrigin = 'anonymous';
      player.setAttribute('src', streamUrl);
      player.play();
  }

    function populateUI() {
        // update the track and artist into in the controlPanel
        var artistLink = document.createElement('a');
        artistLink.setAttribute('href', this.sound.user.permalink_url);
        artistLink.innerHTML = this.sound.user.username;
        var trackLink = document.createElement('a');
        trackLink.setAttribute('href', this.sound.permalink_url);

        if(this.sound.kind=="playlist"){
          trackLink.innerHTML = "<p>" + this.sound.tracks[loader.streamPlaylistIndex].title + "</p>" + "<p>"+loader.sound.title+"</p>";
        }else{
          trackLink.innerHTML = this.sound.title;
        }

        //console.log(this.sound);
        var image = this.sound.artwork_url ? this.sound.artwork_url : this.sound.user.avatar_url; // if no track artwork exists, use the user's avatar.
        this.trackImage.setAttribute('src', image);
        this.trackImageLink.setAttribute('href', this.sound.permalink_url);
        this.artistInfo.innerHTML = '';
        this.artistInfo.appendChild(artistLink);

        this.trackInfo.innerHTML = '';
        this.trackInfo.appendChild(trackLink);

        // add a hash to the URL so it can be shared or saved
        var trackToken = this.sound.permalink_url.substr(22);

    };


  function loadAndUpdate(genre) {
      loadStream(genre,
        function() {
          playStream(this.streamUrl());
          populateUI();
          }, function(){});
    };

  function createPlayerUI(audioElement) {

      var audioplayer = document.createElement('div');
      audioplayer.setAttribute("id", "audioplayer");
      audioplayer.setAttribute("class", "wrapper");

      var trackImageLink = document.createElement('a');
      trackImageLink.setAttribute("id", "trackImageLink");
      audioplayer.appendChild(trackImageLink);

      var trackImage = document.createElement('img');
      trackImage.setAttribute("id", "trackImage");
      trackImageLink.appendChild(trackImage);

      var trackInfo = document.createElement('div');
      trackInfo.setAttribute("id", "trackInfo");
      audioplayer.appendChild(trackInfo);

      var artistInfo = document.createElement('div');
      artistInfo.setAttribute("id", "artistInfo");
      audioplayer.appendChild(artistInfo);

      var playButton = document.createElement('div');
      playButton.setAttribute("id", "playButton");
      playButton.setAttribute("class", "pause");
      audioplayer.appendChild(playButton);
      var timeline = document.createElement('div');
      timeline.setAttribute("id", "timeline");

      audioplayer.appendChild(timeline);
      var playhead = document.createElement('div');
      playhead.setAttribute("id", "playhead");
      timeline.appendChild(playhead);

      var playtime = document.createElement('span');
      playtime.setAttribute("id", "playtime");
      timeline.appendChild(playtime);

      var soundcloudLogo = document.createElement('img');
      soundcloudLogo.setAttribute("id", "soundcloudLogo");
      soundcloudLogo.setAttribute("src", "http://developers.soundcloud.com/assets/logo_black.png");
      audioplayer.appendChild(soundcloudLogo);

      body.appendChild(audioplayer);

      playButton.addEventListener("click", playStop);
      timelineWidth = timeline.offsetWidth - playhead.offsetWidth;

      // Gets audio file duration
      audioElement.addEventListener("canplaythrough",
        function () {
        duration = audioElement.duration;
        audioElement.addEventListener("timeupdate", timeUpdate, false);
      }, false);

      //Makes timeline clickable
      timeline.addEventListener("click", function (event) {
        moveplayhead(event);
        player.currentTime = audioElement.duration * clickPercent(event);
      }, false);

      function playStop() {

        if (audioElement.paused) {
          console.log("play");
          audioElement.play();
          playButton.className = "";
          playButton.className = "pause";
        } else {
          console.log("pause");
          audioElement.pause();
          playButton.className = "";
          playButton.className = "play";
        }

      }

      function timeUpdate() {
        var playPercent = 100 * (player.currentTime / audioElement.duration);
        playhead.style.marginLeft = playPercent + "%";
        playtime.innerHTML = convertTime(Math.floor(player.currentTime)) + "/" + convertTime(Math.floor(audioElement.duration));
      }

      // PLAYER UTILITIES
      function clickPercent(e) {
        return (e.pageX - this.timeline.offsetLeft) / timelineWidth;
      }

      function moveplayhead(e) {
          var newMargLeft = e.pageX - this.timeline.offsetLeft;
          if (newMargLeft >= 0 && newMargLeft <= timelineWidth) {
              playhead.style.marginLeft = newMargLeft + "px";
          }
          if (newMargLeft < 0) {
              playhead.style.marginLeft = "0px";
          }
          if (newMargLeft > timelineWidth) {
              playhead.style.marginLeft = timelineWidth + "px";
          }
      }

      function convertTime(totalSec){
        var hours = parseInt( totalSec / 3600 ) % 24;
        var minutes = parseInt( totalSec / 60 ) % 60;
        var seconds = totalSec % 60;
        return (hours > 0 ? (hours < 10 ? "0" + hours : hours)+ ":" : "") + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds  < 10 ? "0" + seconds : seconds);
      }

      return this;

  } // createPlayerUI

  function loadStream(genre, successCallback, errorCallback) {

      if (SC != undefined) {

        SC.initialize({ client_id: client_id });
        // load a specific track
        if (genre.charAt(0) == "!") {

              song_type = genre.substring(1);
              var call = { track: genre }
              console.log("track: " + genre);

             SC.get('/tracks/', {genres: genre} , function(tracks) {

              console.log("tracks: " + tracks);

              if (tracks.errors) {

                this.errorMessage = "";

                for (var i = 0; i < tracks.errors.length; i++) {
                  this.errorMessage += tracks.errors[i].error_message + '<br>';
                }

                this.errorMessage += 'Make sure the URL has the correct format: https://soundcloud.com/user/title-of-the-track';
                errorCallback();

              } else {

              sound = tracks;
              this.sound = sound;
              this.streamUrl = function(){ return sound.stream_url + '?client_id=' + this.client_id; };
              successCallback();

              }

          }); // END GENRE CALL

        // load tags
        } else {

          console.log(genre);
          var call = {genres: genre }

          // get tracks from soundcloud
          SC.get('/tracks', { genres: genre, limit: 100 }, function(tracks) {

            if (tracks.errors) {
                self.errorMessage = "";
                for (var i = 0; i < tracks.errors.length; i++) {
                    self.errorMessage += tracks.errors[i].error_message + '<br>';
                }
                self.errorMessage += 'Make sure the URL has the correct format: https://soundcloud.com/user/title-of-the-track';
                errorCallback();

            } else {
                randomTrack = Math.floor(Math.random()*(tracks.length-1));
                console.log("Returned tracks: " + tracks.length);
                console.log("Play track: " + randomTrack);
                sound = tracks[randomTrack];
                //console.log(sound);
                self.sound = sound;
                self.streamUrl = function(){ return sound.stream_url + '?client_id=' + client_id; };
                successCallback();
            }

          }); // end track get

        }

      }

    };

  // SOUND UTILITIES
  this.mapSound = function(_me, _total){

        //var new_me = Math.floor(map(_me, 0, _total, 0, 256));
        // HACK TO BECAUSE HIGHER VALUES NEVER HAVE DATA
        var new_me = Math.floor(_me / _total * 110);
        return this.volume[new_me];
      }

  this.getRMS = function (freq) {
        var rms = 0;
        for (var i = 0; i < buffer.length; i++) {
          rms += buffer[i] * buffer[i];
        }
        rms /= buffer.length;
        rms = Math.sqrt(rms);
        /* rms now has the value we want. */
  }

  this.bassFFT = function(){

        var split =  audioChannelVolume.length - Math.round(audioChannelVolume.length/6);
        var bass = audioChannelVolume.slice(0, split);
        return bass;

      }

  this.getBass = function(){

        var b = 0;
        var split =  audioChannelVolume.length - Math.round(audioChannelVolume.length/6);
        for (var i = split; i < audioChannelVolume.length; i++) {
          b += audioChannelVolume[i];
          //console.log(audioChannelVolume[i])
        }
        return (Math.round(b/(audioChannelVolume.length-1)));
      }

      function getMids(){

        var b = 0;
        var split =  audioChannelVolume.length - Math.round(audioChannelVolume.length/3);
        for (var i = audioChannelVolume.length/3; i < 2*Math.round(audioChannelVolume.length/3); i++) {
          b += audioChannelVolume[i];
        }
        return (Math.round(b/(audioChannelVolume.length-1)));

      }

      function highsFFT(){
        var split =  audioChannelVolume.length - Math.round(audioChannelVolume.length/3);
        var highs = audioChannelVolume.slice(audioChannelVolume.length/3, audioChannelVolume.length);
      }

      function getHighs(){

        var b = 0;
        var split =  audioChannelVolume.length - Math.round(audioChannelVolume.length/3);
        for (var i = Math.round(2*audioChannelVolume.length/3); i < audioChannelVolume.length; i++) {
          b += audioChannelVolume[i];
          //console.log(audioChannelVolume[i])
        }
        return (Math.round(b/(audioChannelVolume.length-1)));
      }


  function getGenre(){
      // On load, check to see if there is a track token in the URL, and if so, load that automatically
      if (window.location.hash) {
        var genre = window.location.hash.substr(1);
        loadAndUpdate(genre);
      } else {
        var genre = genres[randomInt(genres.length-1)];
        location.hash = "#" + genre;
        loadAndUpdate(genre);
      }
  }

  return this;

} // END SOUNDCLOUD


// loadscript utility

function loadScript(url, callback)
{
    // Adding the script tag to the head as suggested before
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    // Then bind the event to the callback function.
    // There are several events for cross browser compatibility.
    script.onreadystatechange = callback;
    script.onload = callback;

    // Fire the loading
    head.appendChild(script);
}

function init(){
  Sound = new soundCloud();
}

init();

})();
