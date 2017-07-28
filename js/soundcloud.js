var Sound;

function SoundCloud(_fft) {

    // setup the player
    var body = document.querySelector('body');
    var client_id = "a02d202ac1397c777070cd10fbe015c5"; // to get an ID go to http://developers.soundcloud.com/

    var genres = ["slomo", "deeptechno", "ebm", "disco", "deepdisco", "indiedisco", "slomodisco", "slomohouse", "downtempotechno", "downtempo", "deepness", "pixies", "lowmotion", "plastikman", "minimalhouse", "acidhouse", "cosmic", "cosmicdisco", "ambient", "vapourwave"];

    var FFT_SIZE = _fft || 2048;

    this.spectrum = new Uint8Array(FFT_SIZE/2);
    this.data = [];
    this.volume = this.vol = 0;
    this.peak_volume = 0;

    var self = this;
    var audioContext = new AudioContext();

    var SAMPLE_RATE = audioContext.sampleRate;
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;

    //window.addEventListener('load', init, false);
    loadScript('http://connect.soundcloud.com/sdk.js', init);

    function init () {
      try {
        startPlayer(new AudioContext());
      }
      catch (e) {
        console.error(e);
        alert('Web Audio API is not supported in this browser');
      }
    }


    function createAudioElement(audio_name){

      var audioElement = document.createElement('audio');
      audioElement.setAttribute("id", audio_name);
      body.appendChild(audioElement);
      audioElement.width = window.innerWidth;
      audioElement.height = window.innerHeight;

      createPlayerUI(audioElement);
      return audioElement;

    }


    function startPlayer (context) {

      navigator.getUserMedia({ audio: true }, processSound, error);

      var player = createAudioElement('player');

      function processSound (stream) {

        // analyser extracts frequency, waveform, and other data
        var analyser = context.createAnalyser();
        analyser.smoothingTimeConstant = 0.2;
        analyser.fftSize = FFT_SIZE;
        source = context.createMediaElementSource(player);
        source.connect(analyser);
        analyser.connect(context.destination);
        var song_type = getGenre();

        var node = context.createScriptProcessor(FFT_SIZE*2, 1, 1);
        console.log(node.bufferSize);

        node.onaudioprocess = function () {

          // getByteFrequencyData returns the amplitude for each frequency
          analyser.getByteFrequencyData(self.spectrum);
          self.data = adjustFreqData(self.spectrum);

          // getByteTimeDomainData gets volumes over the sample time
          //analyser.getByteTimeDomainData(dataArray);
          self.vol = self.getRMS(self.spectrum);
          // get peak
          if (self.vol > self.peak_volume) self.peak_volume = self.vol;
          self.volume = self.vol;
        };

        analyser.connect(node);
        node.connect(context.destination);

      }

      function error () {
        console.log(arguments);
      }

    }

    // Get Genre and then load the track

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


    function loadAndUpdate(genre) {
      loadStream(genre,
        function() {
          playStream(self.streamUrl());
          populateUI();
          }, function(){});
    };


    function loadStream(genre, successCallback, errorCallback) {

        if (SC != undefined) {

          SC.initialize({ client_id: client_id });
          // load a specific track
          if (genre.charAt(0) == "!") {

              song_type = genre.substring(1);
              var call = { track: genre }
              console.log("track: " + genre);

              SC.get('/tracks/', {genres: genre} , function(tracks) {

                console.log("-- tracks: " + tracks);

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


      function playStream(streamUrl) {

          // Get the input stream from the audio element
          player.addEventListener('ended', function(){
                console.log('end track.')
          });
          player.crossOrigin = 'anonymous';
          player.setAttribute('src', streamUrl);
          player.play();
      }


    ///////////////////////////////////////////////
    ////////////// UI ///////////// //////////////
    /////////////////////////////////////////////

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



    ///////////////////////////////////////////////
    ////////////// SOUND UTILITIES  //////////////
    /////////////////////////////////////////////
    this.mapSound = function(_me, _total, _min, _max){

      if (self.spectrum.length > 0) {

        var min = _min || 0;
        var max = _max || 100;
        //actual new freq
        var new_freq = Math.floor(_me /_total * self.data.length);
        //console.log(self.spectrum[new_freq]);
        // map the volumes to a useful number
        return map(self.data[new_freq], 0, self.peak_volume, min, max);
      } else {
        return 0;
      }

    }

    this.mapRawSound = function(_me, _total, _min, _max){

      if (self.spectrum.length > 0) {

        var min = _min || 0;
        var max = _max || 100;
        //actual new freq
        var new_freq = Math.floor(_me /_total * (self.spectrum.length)/2);
        //console.log(self.spectrum[new_freq]);
        // map the volumes to a useful number
        return map(self.spectrum[new_freq], 0, self.peak_volume, min, max);
      } else {
        return 0;
      }

    }


    this.getVol = function(){

      // map total volume to 100 for convenience
      self.volume = map(self.vol, 0, self.peak_volume, 0, 100);
      return self.volume;
    }

    this.getVolume = function() { return this.getVol();}

    //A more accurate way to get overall volume
    this.getRMS = function (spectrum) {

          var rms = 0;
          for (var i = 0; i < spectrum.length; i++) {
            rms += spectrum[i] * spectrum[i];
          }
          rms /= spectrum.length;
          rms = Math.sqrt(rms);
          return rms;
    }

//freq = n * SAMPLE_RATE / MY_FFT_SIZE
function mapFreq(i){
  var freq = i * SAMPLE_RATE / FFT_SIZE;
  return freq;
}

// getMix function. Computes the current frequency with
// computeFreqFromFFT, then returns bass, mids and his
// sub bass : 0 > 100hz
// mid bass : 80 > 500hz
// mid range: 400 > 2000hz
// upper mid: 1000 > 6000hz
// high freq: 4000 > 12000hz
// Very high freq: 10000 > 20000hz and above

  this.getMix = function(){
    var highs = [];
    var mids = [];
    var bass = [];
    for (var i = 0; i < self.spectrum.length; i++) {
      var band = mapFreq(i);
      var v = map(self.spectrum[i], 0, self.peak_volume, 0, 100);
      if (band < 500) {
        bass.push(v);
      }
      if (band > 400 && band < 6000) {
          mids.push(v);
      }
      if (band > 4000) {
          highs.push(v);
      }
    }
    //console.log(bass);
    return {bass: bass, mids: mids, highs: highs}
  }


  this.getBass = function(){
          return this.getMix().bass;
    }

  this.getMids = function(){
        return this.getMix().mids;
  }

  this.getHighs = function(){
        return this.getMix().highs;
  }

  this.getHighsVol = function(_min, _max){
    var min = _min || 0;
    var max = _max || 100;
    var v = map(this.getRMS(this.getMix().highs), 0, self.peak_volume, min, max);
    return v;
  }

  this.getMidsVol = function(_min, _max){
    var min = _min || 0;
    var max = _max || 100;
    var v = map(this.getRMS(this.getMix().mids), 0, self.peak_volume, min, max);
    return v;
  }

  this.getBassVol = function(_min, _max){
    var min = _min || 0;
    var max = _max || 100;
    var v = map(this.getRMS(this.getMix().bass), 0, self.peak_volume, min, max);
    return v;
  }


  function adjustFreqData(frequencyData, ammt) {
    // get frequency data, remove obsolete
  //analyserNode.getByteFrequencyData(frequencyData);

  frequencyData.slice(0,frequencyData.length/2);
  var new_length = ammt || 16;
  var newFreqs = [], prevRangeStart = 0, prevItemCount = 0;
  // looping for my new 16 items
  for (let j=1; j<=new_length; j++) {
      // define sample size
    var pow, itemCount, rangeStart;
    if (j%2 === 1) {
      pow = (j-1)/2;
    } else {
      pow = j/2;
    }
    itemCount = Math.pow(2, pow);
    if (prevItemCount === 1) {
      rangeStart = 0;
    } else {
      rangeStart = prevRangeStart + (prevItemCount/2);
    }

        // get average value, add to new array
    var newValue = 0, total = 0;
    for (let k=rangeStart; k<rangeStart+itemCount; k++) {
      // add up items and divide by total
      total += frequencyData[k];
      newValue = total/itemCount;
    }
    newFreqs.push(newValue);
    // update
    prevItemCount = itemCount;
    prevRangeStart = rangeStart;
  }
  return newFreqs;
}


  this.matchNote = function (freq) {
    var closest = "A#1"; // Default closest note
    var closestFreq = 58.2705;
    for (var key in notes) { // Iterates through note look-up table
        // If the current note in the table is closer to the given
        // frequency than the current "closest" note, replace the
        // "closest" note.
        if (Math.abs(notes[key] - freq) <= Math.abs(notes[closest] -
                freq)) {
            closest = key;
            closestFreq = notes[key];
        }
        // Stop searching once the current note in the table is of higher
        // frequency than the given frequency.
        if (notes[key] > freq) {
            break;
        }
    }

    return [closest, closestFreq];
}


// preload the soundcloud library

function loadScript(url, callback) {
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

  return this;

  };





  Sound = new SoundCloud();
