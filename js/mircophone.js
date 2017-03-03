

(function(){
    var filter, compressor, mediaStreamSource;

    // Start off by initializing a new context.
    var context = new (window.AudioContext || window.webkitAudioContext)();


    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
    navigator.getUserMedia( {audio:true}, initAudio , function(err){
        console.log('usermedia error', err)
    });



    function initAudio(stream) {
        compressor = context.createDynamicsCompressor();
        compressor.threshold.value = -50;
        compressor.knee.value = 40;
        compressor.ratio.value = 12;
        compressor.reduction.value = -20;
        compressor.attack.value = 0;
        compressor.release.value = 0.25;

        filter = context.createBiquadFilter();
        filter.Q.value = 8.30;
        filter.frequency.value = 355;
        filter.gain.value = 3.0;
        filter.type = 'bandpass';
        filter.connect(compressor);


        compressor.connect(context.destination)
        filter.connect(context.destination)

        mediaStreamSource = context.createMediaStreamSource( stream );
        mediaStreamSource.connect( filter );
    }
})();



//
// var Microphone = function (_fft_size, _buffer_size) {
//
//     var audioContext = new AudioContext();
//     var filter, compressor, mediaStreamSource;
//
//     console.log("Starting mirophone ...");
//
//     var BUFF_SIZE = _buffer_size || 16384;
//     var FFT_SIZE = _fft_size || 16384;
//
//     var audioInput = null,
//         hardware = null,
//         gain_node = null,
//         script_processor_node = null,
//         script_processor_fft_node = null,
//         analyserNode = null;
//
//     this.input = [];
//
//     if (!navigator.getUserMedia)
//             navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
//                           navigator.mozGetUserMedia || navigator.msGetUserMedia;
//
//     if (navigator.getUserMedia){
//
//         navigator.getUserMedia({audio:true},
//           function(stream) {
//               setup_mic(stream);
//               initAudio(stream);
//           },
//           function(e) {
//               alert('Probably something wrong with your audio input.');
//           }
//         );
//
//     } else {
//       alert('Sorry, your browser does not support getUserMedia. Meaning you probably using Safari. And really sorry. But Safari sucks. And is holding us back doing cool stuff on the web. Use Chrome, really. Or Firefox. And never look back.');
//    }
//
//
//
//
//     function setup_mic(stream){
//       console.log("Setup microphone...");
//       gain_node = audioContext.createGain();
//       gain_node.connect( audioContext.destination );
//
//       compressor = audioContext.createDynamicsCompressor();
//       compressor.threshold.value = -50;
//       compressor.knee.value = 40;
//       compressor.ratio.value = 12;
//       compressor.reduction.value = -20;
//       compressor.attack.value = 0;
//       compressor.release.value = 0.25;
//
//       filter = audioContext.createBiquadFilter();
//       filter.Q.value = 8.30;
//       filter.frequency.value = 355;
//       filter.gain.value = 3.0;
//       filter.type = 'bandpass';
//       filter.connect(compressor);
//
//       compressor.connect(audioContext.destination)
//       filter.connect(audioContext.destination)
//
//
//
//       ///
//       hardware = audioContext.createMediaStreamSource(stream);
//       //gain_node.connect(filter);
//       hardware.connect( filter );
//       //hardware.connect(gain_node);
//       //hardware.connect( gain_node );
//
//       script_processor_node = audioContext.createScriptProcessor(BUFF_SIZE, 1, 1);
//       script_processor_node.onaudioprocess = process_microphone_buffer;
//
//       hardware.connect(script_processor_node);
//
//       // --- enable volume control for output speakers
//
//       //setupVolume();
//
//       // --- setup FFT
//
//       script_processor_fft_node = audioContext.createScriptProcessor(FFT_SIZE, 1, 1);
//       script_processor_fft_node.connect(gain_node);
//
//       analyserNode = audioContext.createAnalyser();
//       analyserNode.smoothingTimeConstant = 0;
//       analyserNode.fftSize = FFT_SIZE;
//
//       hardware.connect(analyserNode);
//
//       analyserNode.connect(script_processor_fft_node);
//
//       script_processor_fft_node.onaudioprocess = function() {
//
//         // get the average for the first channel
//         var input_array = new Uint8Array(analyserNode.frequencyBinCount);
//         analyserNode.getByteFrequencyData(input_array);
//
//         // draw the spectrogram
//         if (hardware.playbackState == hardware.PLAYING_STATE) {
//             processMicData(input_array, 5);
//         }
//       };
//     }
//
//     function initAudio(stream) {
//      compressor = audioContext.createDynamicsCompressor();
//      compressor.threshold.value = -50;
//      compressor.knee.value = 40;
//      compressor.ratio.value = 12;
//      compressor.reduction.value = -20;
//      compressor.attack.value = 0;
//      compressor.release.value = 0.25;
//
//      filter = audioContext.createBiquadFilter();
//      filter.Q.value = 8.30;
//      filter.frequency.value = 355;
//      filter.gain.value = 3.0;
//      filter.type = 'bandpass';
//      filter.connect(compressor);
//
//
//      compressor.connect(audioContext.destination)
//      filter.connect(audioContext.destination)
//
//      //mediaStreamSource = context.createMediaStreamSource( stream );
//      hardware.connect( filter );
//  }
//
//     function process_microphone_buffer(event) {
//
//         var microphone_output_buffer = event.inputBuffer.getChannelData(0);
//
//         //processMicData(microphone_output_buffer, 5);
//
//     }
//
//     function processMicData(microphone_input_buffer, num_row_to_display) {
//
//         var size_buffer = microphone_input_buffer.length;
//         // var index = 0;
//         // var max_index = num_row_to_display;
//
//         this.input = microphone_input_buffer;
//
//         // for (var i = 0; i < microphone_input_buffer.length; i++) {
//         //   var input = microphone_input_buffer[i];
//         //   //console.log(input);
//         // }
//
//
//         // for (; index < max_index && index < size_buffer; index += 1) {
//         //
//         //     console.log(given_typed_array[index]);
//         // }
//     }
//
//     // function setupVolume() {
//     //
//     //   document.getElementById('volume').addEventListener('change', function() {
//     //
//     //       var curr_volume = this.value;
//     //       gain_node.gain.value = curr_volume;
//     //
//     //       console.log("curr_volume ", curr_volume);
//     //   });
//     //
//     // }
//
//   this.stop = function() {
//
//       console.log('Done listening');
//       // Stop processing audio stream
//         inputHardware.disconnect();
//
//   }
//
//   this.start = function() {
//       inputHardware.connect(script_processor_node);
//   }
//
//     return this;
//   }(); //  Microphone = function()
//



////////////////////////////////

//
// function Microphone(sz) {
//
//     var initialized;
//     var SAMPLE_RATE;
//     var timeData;
//     var procNode;
//     var BUFFER_LEN;
//     var MIN_SUPPORTED_FREQ;
//     var MAX_PEAK_SEARCH;
//     var fft;
//     var spectrum;
//     var MY_FFT_SIZE;
//     var FFT_FREQ_RES;
//     var processing;
//     var recording;
//     var recordingLength;
//     var leftChannel;
//     var rightChannel;
//     var notes; // A JSON look-up table to get notes from frequencies
//
//
//     this.initialize = function() {
//         // Set parameters
//         initialized = false;
//         context = null;
//         inputHardware = null;       // Microphone
//         SAMPLE_RATE = 44100;
//         timeData = null;
//         procNode = null;
//         //BUFFER_LEN = 4096;
//         console.log("BUFFER_LENGTH:" + sz);
//         BUFFER_LEN = sz*2;
//         //BUFFER_LEN = 2048;          // Keep a power of 2, but can change to
//                                     // provide more data, increased resolution
//         MIN_SUPPORTED_FREQ = 60;
//         MAX_PEAK_SEARCH = (SAMPLE_RATE/MIN_SUPPORTED_FREQ);
//         fft = null;
//         spectrum = null;
//         MY_FFT_SIZE = BUFFER_LEN;
//         FFT_FREQ_RES = (SAMPLE_RATE/2)/(MY_FFT_SIZE/2);
//         processing = false;
//         recording = false;
//         recordingLength = 0;
//         leftChannel = [];
//         rightChannel = [];
//
//         // Make a note that the microphone is about to be accessed
//         //console.log('Beginning!');
//
//         // Normalize the various vendor prefixed versions of getUserMedia
//         navigator.getUserMedia = (navigator.getUserMedia ||
//                                   navigator.webkitGetUserMedia ||
//                                   navigator.mozGetUserMedia ||
//                                   navigator.msGetUserMedia);
//
//         // Check that browser supports getUserMedia
//         if (navigator.getUserMedia) {
//             // Request the microphone
//             navigator.getUserMedia({audio:true}, gotStream, noStream);
//         }
//         else {
//             alert('Sorry, your browser does not support getUserMedia. Really. I am sorry. Safari sucks. And is holding us back doing cool stuff on the web. Use Chrome, really. Or Firefox. And never look back.');
//         }
//     }
//
//     function gotStream(stream) {
//         console.log('gotStream called');
//         // Create the audio context
//         audioContext = window.AudioContext || window.webkitAudioContext;
//         context = new audioContext();
//
//         // Set up variables to perform FFT
//         timeData = [];
//         fft = new FFT(MY_FFT_SIZE, SAMPLE_RATE);
//
//         // Set up a processing node that will allow us to pass mic input off to
//         // the DSP library for frequency domain analysis
//         procNode = context.createScriptProcessor(BUFFER_LEN, 1, 1);
//         procNode.onaudioprocess = function(e) {
//             timeData = e.inputBuffer.getChannelData(0);
//             if (recording) {
//                 leftChannel.push(new Float32Array(timeData));
//                 rightChannel.push(new Float32Array(timeData));
//                 recordingLength += BUFFER_LEN;
//             }
//         }
//
//         // Create an audio source node from the microphone input to eventually
//         // feed into the processing node
//         inputHardware = context.createMediaStreamSource(stream);
//         procNode.connect(context.destination); // Node must have a destination
//                                                // to work. Weird.
//        // console.log('gotStream finished')
//         initialized = true;
//
//     }
//
// // -----------------------------------------------------------------------------
// // noStream function. This function is the failure callback for getUserMedia
// // and alerts the user if their browser doesn't support getUserMedia.
//
//     function noStream(e) {
//         alert('Error capturing audio.');
//     }
//
// // -----------------------------------------------------------------------------
// // isInitialized function. This function simply returns whether or not the
// // microphone object has been fully initialized (indicated by the var
// // 'initialized' being equal to true. Returns a boolean value.
//
// 		this.isInitialized = function() {
// 				if (initialized) {
// 						return true;
// 				}
// 				else {
// 						return false;
// 				}
// 		}
//
// // -----------------------------------------------------------------------------
// // startListening function. Connects the microphone input to a processing node
// // for future operations. Throws an error if the microphone hasn't been
// // initialized before this function is called -- in other words, if a user
// // tries to get mic data before allowing the browser permission to collect it.
//
//     this.startListening = function() {
//         if (!initialized) {
//
//           //  throw "Not initialized";
//         }
//         else {
//             console.log('Now listening');
//             listening = true;
//             //$("mike_cover").fadeOut();
//            // $('.mike_on_permission').css('display', 'none');
//             if (!processing) {
//             		processing = true;
//             		// connect mic input so we can process it whenever we want
//             		inputHardware.connect(procNode);
//             }
//         }
//     }
//
// // -----------------------------------------------------------------------------
// // stopListening function. Disconnects the microphone input. Can be called or
// // tied to a button to save on processing.
//
//     this.stopListening = function() {
//         console.log('Done listening');
//         if (processing && !recording) {
//             processing = false;
//
//             // Stop processing audio stream
//             inputHardware.disconnect();
//         }
//     }


// SOUND UTILITIES
this.mapSound = function(_audio_array, _me, _total){

      //var new_me = Math.floor(map(_me, 0, _total, 0, 256));
      // HACK TO BECAUSE HIGHER VALUES NEVER HAVE DATA
      var new_me = Math.floor(_me / _total * _audio_array.length);
      return _audio_array[new_me];
    }
