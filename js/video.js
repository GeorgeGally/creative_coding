
  var video;
  var hidden_ctx;
  var showBgImg = false;
  var showVideo = false;

  document.addEventListener("DOMContentLoaded", function() {
    hidden_ctx = createHiddenCanvas("hidden_canvas");
    video = document.createElement('video');
    document.body.appendChild(video);

    video.autoplay  = true;
    video.loop  = true;
    video.setAttribute("id", "videoOutput");
    video.setAttribute("style", "display:none;");
    video.width = 320;
    video.height = 240;


    // check if browser supports getUserMedia - yes we are looking at you Safari!
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

    if (navigator.getUserMedia) {

        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
          console.log("enumerateDevices() not supported.");
          return;
        }

        // List cameras and microphones.

        navigator.mediaDevices.enumerateDevices()
        .then(function(devices) {
          gotSources(devices);
        })
        .catch(function(err) {
          console.log(err.name + ": " + err.message);
        });

    }

  //CHOOSE WHICH CAMERA TO USE

  function setupCamera(cameras){

    //console.log(cameras)

    //var videoSource = cameras[cameras.length-1].id;
    var videoSource = cameras[0].id;

    var constraints = {
      // audio: {
      //   optional: [{
      //     sourceId: audioSource
      //   }]
      // },
      video: {
        optional: [{
          sourceId: videoSource
        }]
      }
    }

    navigator.getUserMedia(constraints, successCallback, errorCallback);

  }

  function successCallback(stream) {


        if (video.mozCaptureStream) {
            video.mozSrcObject = stream;
        } else {
          video.src = (window.URL && window.URL.createObjectURL(stream)) || stream;
        }
        video.play();
        this.video = video;
  }

  function errorCallback(error) {
    alert('Unable to get webcam stream.');
  }


  // hacky loop to make sure video is streaming

  video.addEventListener('loadeddata', function() {
    var attempts = 50;
    function checkVideo() {

      if (attempts > 0) {

        if (video.videoWidth > 0 && video.videoHeight > 0) {

            video.available = true;

        } else {

          // Wait a bit and try again
          window.setTimeout(checkVideo, 100);

        }


      } else {

        // Give up after 10 attempts
        alert('Unable to play video stream. Is webcam working?');

      }

        attempts--;

    }

    checkVideo();

    }, false);


    function gotSources(devices) {

      var cameras = [];

      devices.forEach(function(device) {

          // console.log(device.kind + ": " + device.label + " id = " + device.deviceId);

          if (device.kind === 'videoinput') {
            //console.log(device.deviceId);
            cameras.push(device);
          }

      })

      setupCamera(cameras);

    };

  })
