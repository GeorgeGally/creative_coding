// exposes audioChannelVolume
var audioChannelVolume = [];
var body = document.querySelector('body');
var music = createAudioElement('player');
var playButton;
var trackImage, trackImageLink;
var artistInfo;
var trackInfo;
var timeline, playtime;
var playhead;
var duration;
var timelineWidth;
var mix = [];
var audioChannelVolume = [];
var volume = [];

var genres = ["slomo", "deeptechno", "ebm", "disco", "deepdisco", "indiedisco", "slomodisco", "slomohouse", "downtempotechno", "downtempo", "deepness", "pixies", "lowmotion", "plastikman", "minimalhouse", "acidhouse", "cosmic", "cosmicdisco", "ambient"];


var audioCtxCheck = window.AudioContext || window.webkitAudioContext;
if (!audioCtxCheck) {
  document.getElementById('warning').style.display = 'block';
  document.getElementById('player').style.display = 'none';
}
else {

  var SoundCloudAudioSource = function(player) {
    var self = this;
    var analyser;
    var audioCtx = new (window.AudioContext || window.webkitAudioContext);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    //analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.3;

    var source = audioCtx.createMediaElementSource(player);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);


    var sampleAudioStream = function() {

      analyser.getByteFrequencyData(self.streamData);

      mix = getMixFromFFT(self.streamData);

      audioChannelVolume = volume = getVolume(self.streamData);





      // Calculate an overall volume value
      // var total = 0;
      // for (var i = 0; i < 64; i++) { // Get the volume from the first 64 bins
      //   total += self.streamData[i];
      // }
      // self.volume = total;

      // var totalLow = 0;
      // for (var i = 0; i < 31; i++) { // Get the volume from the first 32 bins
      //   totalLow += self.streamData[i];
      // }
      // self.volumeLow = totalLow;

      // var totalHi = 0;
      // for (var i = 31; i < 64; i++) { // Get the volume from the second 32 bins
      //   totalHi += self.streamData[i];
      // }
      // self.volumeHi = totalHi;
    };

    setInterval(sampleAudioStream, 20);

    // Public properties and methods
    this.volume = 0;
    this.volumeLow = 0;
    this.volumeHi = 0;
    this.streamData = new Uint8Array(analyser.frequencyBinCount);

    this.playStream = function(streamUrl) {
        // Get the input stream from the audio element
        player.addEventListener('ended', function(){
            //self.directStream('coasting');
            console.log('end track.')
        });
        player.crossOrigin = 'anonymous';
        player.setAttribute('src', streamUrl);
        player.play();
    }
  };

  var Visualizer = function() {
    var audioSource;
      this.init = function(options) {
          audioSource = options.audioSource;
          var container = document.getElementById(options.containerId);
      };
  };

  var SoundcloudLoader = function(player,uiUpdater) {
    var self = this;
    var client_id = "a02d202ac1397c777070cd10fbe015c5"; // to get an ID go to http://developers.soundcloud.com/
    this.sound = {};
    this.streamUrl = "";
    this.errorMessage = "";
    this.player = player;

    /**
     * Loads the JSON stream data object from the URL of the track (as given in the location bar of the browser when browsing Soundcloud),
     * and on success it calls the callback passed to it (for example, used to then send the stream_url to the audiosource object).
     * @param track_url
     * @param callback
     */

    this.loadStream = function(genres, successCallback, errorCallback) {

      if (SC != undefined) {

        SC.initialize({
            client_id: client_id
        });
        // SC.get('/resolve', { url: track_url }, function(sound) {

        // load a specific track
        if (genres.charAt(0) == "!") {

            genres = genres.substring(1);
            var call = { track: genres }
            console.log("track: " + genres);

           SC.get('/tracks/', {genres: genres} , function(tracks) {

            console.log("tracks: " + tracks);

            if (tracks.errors) {

              self.errorMessage = "";

              for (var i = 0; i < tracks.errors.length; i++) {
                self.errorMessage += tracks.errors[i].error_message + '<br>';
              }

              self.errorMessage += 'Make sure the URL has the correct format: https://soundcloud.com/user/title-of-the-track';
              errorCallback();

            } else {

            // randomTrack = Math.floor(Math.random()*(tracks.length-1));
            // console.log("Returned tracks: " + tracks.length);
            // console.log("Play track: " + randomTrack);
            sound = tracks;
            self.sound = sound;
            self.streamUrl = function(){ return sound.stream_url + '?client_id=' + client_id; };
            successCallback();

            }

        }); // END GENRE CALL

        // load tags
        } else {

          console.log(genres);
          var call = {genres: genres }


        SC.get('/tracks', { genres: genres, limit: 100 }, function(tracks) {

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
                // if(sound.kind=="playlist"){
                //     self.sound = sound;
                //     self.streamPlaylistIndex = 0;
                //     self.streamUrl = function(){
                //         return sound.tracks[self.streamPlaylistIndex].stream_url + '?client_id=' + client_id;
                //     }
                //     successCallback();
                // }else{
                //     self.sound = sound;
                //     self.streamUrl = function(){
                //        return sound.stream_url + '?client_id=' + client_id; };
                //        successCallback();
                // }
            }

        }); // END GENRE CALL

        }

      }
    };


    this.directStream = function(direction){
        if(direction=='toggle'){
            if (this.player.paused) {
                this.player.play();
            } else {
                this.player.pause();
            }
        }
        else if(this.sound.kind=="playlist"){
            if(direction=='coasting') {
                this.streamPlaylistIndex++;
            }else if(direction=='forward') {
                if(this.streamPlaylistIndex>=this.sound.track_count-1) this.streamPlaylistIndex = 0;
                else this.streamPlaylistIndex++;
            }else{
                if(this.streamPlaylistIndex<=0) this.streamPlaylistIndex = this.sound.track_count-1;
                else this.streamPlaylistIndex--;
            }
            if(this.streamPlaylistIndex>=0 && this.streamPlaylistIndex<=this.sound.track_count-1) {
               this.player.setAttribute('src',this.streamUrl());
               this.player.play();
            }
        }
    }


  };

function mapSound(_me, _total){

  // HACK TO BECAUSE HIGHER VALUES NEVER HAVE DATA
  var new_me = Math.floor(_me / _total * 110);
  //console.log(_total + " _me: "+ _me + " new_me: "+ new_me);
  //var new_me = Math.floor(map(_me, 0, _total, 0, 256));
  return audioChannelVolume[new_me];
}


function bassFFT(){

  var split =  audioChannelVolume.length - Math.round(audioChannelVolume.length/6);
  var bass = audioChannelVolume.slice(0, split);
  return bass;

}

function getBass(){

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


var player =  document.getElementById('player');
var loader = new SoundcloudLoader(player);

  var audioSource = new SoundCloudAudioSource(player);
  var form = document.getElementById('form');
  var loadAndUpdate = function(trackUrl) {
    loader.loadStream(trackUrl,
        function() {
            audioSource.playStream(loader.streamUrl());
            ui(loader);
        }, function(){});
  };


  // On load, check to see if there is a track token in the URL, and if so, load that automatically
  if (window.location.hash) {
    //var trackUrl = 'https://soundcloud.com/' + window.location.hash.substr(1);
    var genres = window.location.hash.substr(1);
    loadAndUpdate(genres);
  }
  else {
    //var genres = "disco";
    var genres = genres[randomInt(genres.length-1)];
    location.hash = "#"+genres;
    //var trackUrl = 'https://soundcloud.com/' + 'justin-van-der-volgen/alexander-robotnick-undicidisco-justin-van-der-volgen-edit?in=h-track/sets/alexande-robotnick-florian';
    loadAndUpdate(genres);
  }
}

function createAudioElement(audio_name){
  var music = document.createElement('audio');
  music.setAttribute("id", audio_name);
  body.appendChild(music);
  music.width = window.innerWidth;
  music.height = window.innerHeight;
  createPlayerUI();
  return music;
}






// player UI

var ui = function(loader) {
    console.log(loader);
    // update the track and artist into in the controlPanel
    var artistLink = document.createElement('a');
    artistLink.setAttribute('href', loader.sound.user.permalink_url);
    artistLink.innerHTML = loader.sound.user.username;
    var trackLink = document.createElement('a');
    trackLink.setAttribute('href', loader.sound.permalink_url);

    if(loader.sound.kind=="playlist"){
      trackLink.innerHTML = "<p>" + loader.sound.tracks[loader.streamPlaylistIndex].title + "</p>" + "<p>"+loader.sound.title+"</p>";
    }else{
      trackLink.innerHTML = loader.sound.title;
    }

        var image = loader.sound.artwork_url ? loader.sound.artwork_url : loader.sound.user.avatar_url; // if no track artwork exists, use the user's avatar.
        trackImage.setAttribute('src', image);
        trackImageLink.setAttribute('href', loader.sound.permalink_url);
        artistInfo.innerHTML = '';
        artistInfo.appendChild(artistLink);

        trackInfo.innerHTML = '';
        trackInfo.appendChild(trackLink);

        // display the track info panel
        //trackInfoPanel.className = '';

        // add a hash to the URL so it can be shared or saved
        var trackToken = loader.sound.permalink_url.substr(22);
        //window.location = '#' + trackToken;
        //loadPlayer();
    };



function createPlayerUI() {

  var audioplayer = document.createElement('div');
  audioplayer.setAttribute("id", "audioplayer");
  audioplayer.setAttribute("class", "wrapper");

  trackImageLink = document.createElement('a');
  trackImageLink.setAttribute("id", "trackImageLink");
  audioplayer.appendChild(trackImageLink);

  trackImage = document.createElement('img');
  trackImage.setAttribute("id", "trackImage");
  trackImageLink.appendChild(trackImage);

  trackInfo = document.createElement('div');
  trackInfo.setAttribute("id", "trackInfo");
  audioplayer.appendChild(trackInfo);

  artistInfo = document.createElement('div');
  artistInfo.setAttribute("id", "artistInfo");
  audioplayer.appendChild(artistInfo);

  playButton = document.createElement('div');
  playButton.setAttribute("id", "playButton");
  playButton.setAttribute("class", "pause");
  audioplayer.appendChild(playButton);
  timeline = document.createElement('div');
  timeline.setAttribute("id", "timeline");

  audioplayer.appendChild(timeline);
  playhead = document.createElement('div');
  playhead.setAttribute("id", "playhead");
  timeline.appendChild(playhead);

  playtime = document.createElement('span');
  playtime.setAttribute("id", "playtime");
  timeline.appendChild(playtime);

  soundcloud = document.createElement('img');
  soundcloud.setAttribute("id", "soundcloudLogo");
  soundcloud.setAttribute("src", "http://developers.soundcloud.com/assets/logo_black.png");
  audioplayer.appendChild(soundcloud);

  body.appendChild(audioplayer);
  playButton.addEventListener("click", playAudio);
  timelineWidth = timeline.offsetWidth - playhead.offsetWidth;
}

function playAudio() {
  if (music.paused) {
    console.log("play");
    music.play();
    playButton.className = "";
    playButton.className = "pause";
  } else {
    console.log("pause");
    music.pause();
    playButton.className = "";
    playButton.className = "play";
  }
}


function timeUpdate() {
  var playPercent = 100 * (music.currentTime / duration);
  playhead.style.marginLeft = playPercent + "%";
  playtime.innerHTML = convertTime(Math.floor(music.currentTime)) + "/" + convertTime(Math.floor(duration));
}

// Gets audio file duration
music.addEventListener("canplaythrough", function () {
  duration = music.duration;
  music.addEventListener("timeupdate", timeUpdate, false);
}, false);


//Makes timeline clickable
timeline.addEventListener("click", function (event) {
  moveplayhead(event);
  music.currentTime = duration * clickPercent(event);
}, false);

// returns click as decimal (.77) of the total timelineWidth
function clickPercent(e) {
  return (e.pageX - timeline.offsetLeft) / timelineWidth;
}

function moveplayhead(e) {
    var newMargLeft = e.pageX - timeline.offsetLeft;
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
  //var totalSec = new Date().getTime() / 1000;
  var hours = parseInt( totalSec / 3600 ) % 24;
  var minutes = parseInt( totalSec / 60 ) % 60;
  var seconds = totalSec % 60;
  return (hours > 0 ? (hours < 10 ? "0" + hours : hours)+ ":" : "") + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds  < 10 ? "0" + seconds : seconds);
}


/* SOUND ANALYSIS UTILITIES*/


var MY_FFT_SIZE = 256
var SAMPLE_RATE = 44100;
var FFT_FREQ_RES = (SAMPLE_RATE/2)/(MY_FFT_SIZE/2);

var notes = {"A#1" : 58.2705, "B1" : 61.7354, "C2" : 65.4064,
            "C#2" : 69.2957, "D2" : 73.4162, "D#2" : 77.7817, "E2" : 82.4069,
            "F2" : 87.3071, "F#2" : 92.4986, "G2" : 97.9989, "G#2" : 103.826,
            "A2" : 110, "A#2" : 116.542, "B2" : 123.471, "C3" : 130.813,
            "C#3" : 138.591, "D3" : 146.832, "D#3" : 155.563, "E3" : 164.814,
            "F3" : 174.614, "F#3" : 184.997, "G3" : 195.998, "G#3" : 207.652,
            "A3" : 220, "A#3" : 233.082, "B3" : 246.942, "C4" : 261.626,
            "C#4" : 277.183, "D4" : 293.665, "D#4" : 311.127, "E4" : 329.628,
            "F4" : 349.228, "F#4" : 369.994, "G4" : 391.995, "G#4" : 415.305,
            "A4" : 440, "A#4" : 466.164, "B4" : 493.883, "C5" : 523.251,
            "C#5" : 554.365, "D5" : 587.330, "D#5" : 622.254, "E5" : 659.255,
            "F5" : 698.456, "F#5" : 739.989, "G5" : 783.991, "G#5" : 830.609,
            "A5" : 880, "A#5" : 932.328, "B5" : 987.767, "C6" : 1046.5,
            "C#6" : 1108.73, "D6" : 1174.66, "D#6" : 1244.51, "E6" : 1318.51,
            "F6" : 1396.91, "F#6" : 1479.98, "G6" : 1567.98, "G#6" : 1661.22,
            "A6" : 1760, "A#6" : 1864.66, "B6" : 1975.53, "C7" : 2093,
            "C#7" : 2217.46, "D7" : 2349.32, "D#7" : 2489.02, "E7" : 2637.02,
            "F7" : 2793.83, "F#7" : 2959.96, "G7" : 3135.96, "G#7" : 3322.44,
            "A7" : 3520, "A#7" : 3729.31, "B7" : 3951.07, "C8" : 4186.01};



// =============================================================================
// FFT Functions
// =============================================================================

// -----------------------------------------------------------------------------
// computeFreqFromFFT function. Input: none. Output: frequency of the sound
// picked up by the microphone, computed via FFT. Automatically grabs the
// current microphone data from the timeData global variable and uses the FFT
// defined in DSP.JS. Interpolates the FFT power spectrum to more accurately
// guess the actual value of the peak frequency of the signal.

    function computeFreqFromFFT(spectrum) {

        // Get index of maximum in spectrum array
        var i = 0, m = spectrum[0], maxIndex = 0;

        while (++i < spectrum.length) {
            if (spectrum[i] > m) {
                maxIndex = i;
                m = spectrum[i];
            }
        }

        // Make a best guess at the frequency of the signal
        interpolatedBin = jainsMethodInterpolate(spectrum, maxIndex);
        return Math.round(interpolatedBin*FFT_FREQ_RES);
    }


// -----------------------------------------------------------------------------
// jainsMethodInterpolate function. Input: array of spectrum power values
// returned from FFT; index of bin in spectrum array with max power value.
// Output: a fractional bin number indicating the interpolated location of
// the actual signal peak frequency. Uses neighbouring indices to the index of
// greatest magnitude to create a more accurate estimate of the frequency.
// Simply multiply the returned fractional bin index by the FFT spectrum
// frequency resolution to get the estimate of the actual peak frequency.

    function jainsMethodInterpolate(spctrm, maxIndex) {
        var m1, m2, m3, n, o;
        var m1 = Math.abs(spctrm[maxIndex - 1]);
        var m2 = Math.abs(spctrm[maxIndex]);
        var m3 = Math.abs(spctrm[maxIndex + 1]);

        if (m1 > m3) {
            a = m2 / m1;
            d = a / (1 + a);
            return maxIndex - 1 + d;
        }
        else {
            a = m3 / m2;
            d = a / (1 + a);
            return maxIndex + d;
        }
    }


// -----------------------------------------------------------------------------
// getMixFromFFT function. Computes the current frequency with
// computeFreqFromFFT, then returns bass, mids and his
// sub bass : 0 > 100hz
// mid bass : 80 > 500hz
// mid range: 400 > 2000hz
// upper mid: 1000 > 6000hz
// high freq: 4000 > 12000hz
// Very high freq: 10000 > 20000hz and above

//n * SAMPLE_RATE / MY_FFT_SIZE
//0:   0 * 44100 / 512 =      0.0 Hz
//1:   1 * 44100 / 512 =     86.1 Hz
//2:   2 * 44100 / 512 =   172.27 Hz
//3:   3 * 44100 / 512 =    258.4 Hz
//4:   4 * 44100 / 512 =    344.5 Hz
//5:   5 * 44100 / 512 =   430.66 Hz
//6:   5 * 44100 / 512 =    516.8 Hz

    function getMixFromFFT(spectrum) {
        var mix = [];
        var bass_count = 0;
        var bass_freq = 0;
        var mids_count = 0;
        var mids_freq = 0;
        var highs_count = 0;
        var highs_freq = 0;
        for (var i = 0; i < spectrum.length; i++) {
            var band = i * SAMPLE_RATE / MY_FFT_SIZE;
            if (band < 500) {
                bass_freq += spectrum[i];
                bass_count++;
            }
            if (band > 400 && band < 6000) {
                mids_freq += spectrum[i];
                mids_count++;
            }
            if (band > 4000) {
                highs_freq += spectrum[i];
                highs_count++;
            }

        }

        var bass = bass_freq/bass_count;
        var mids = mids_freq/mids_count;
        var highs = highs_freq/highs_count;
        mix.push(bass);
        mix.push(mids);
        mix.push(highs);

        return mix;
    }


    // -----------------------------------------------------------------------------
// getNoteFromFFT function. Computes the current frequency with
// computeFreqFromFFT, then determines the current note by feeding the current
// frequency to matchNote

    function getNoteFromFFT(spectrum) {
        var currFreq = computeFreqFromFFT(spectrum);
        var noteInfo = matchNote(currFreq);
        return noteInfo[0];
    }

// -----------------------------------------------------------------------------
// getNoteCentsFromFFT function. Computes the current frequency with
// computeFreqFromFFT, then determines the current note by feeding the current
// frequency to matchNote, and finally computes the cents offset from the
// current note

    function getNoteCentsFromFFT(spectrum) {
        var currFreq = computeFreqFromFFT(spectrum)
        var noteInfo = matchNote(currFreq);
        var noteFreq = noteInfo[1];
        var cents = 1200*(Math.log(currFreq/Math.round(noteFreq))/Math.log(2));
        return [noteInfo[0], Math.round(cents)];
    }



    // -----------------------------------------------------------------------------
// matchNote function. Input: frequency, in Hertz. Output: closest note
// value to that frequency. This function iterates over the JSON lookup table
// to find the nearest note to the input frequency and returns the note as a
// string.

    function matchNote(freq) {
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


    // -----------------------------------------------------------------------------
// calculate RMS - a good approximation of "loudness"

function getRMS(freq) {
  var rms = 0;
  for (var i = 0; i < buffer.length; i++) {
    rms += buffer[i] * buffer[i];
  }
  rms /= buffer.length;
  rms = Math.sqrt(rms);
  /* rms now has the value we want. */
}


function getVolume(streamData) {
    var vol = [];
    for (var i = streamData.length - 1; i >= 0; i--) {
        vol[i] = streamData[i];
    }

    return vol;
}
