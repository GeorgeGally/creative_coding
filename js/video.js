

var imgData;
var video

document.addEventListener("DOMContentLoaded", function() {

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
  
  
  // Set the source of the video element with the stream from the camera
  if (typeof MediaStreamTrack === 'undefined' ||
    typeof MediaStreamTrack.getSources === 'undefined') {
    alert('This browser does not support MediaStreamTrack.\n\nTry Chrome.');
  } else {
    MediaStreamTrack.getSources(gotSources);
  }

} else {

  alert('Native web camera streaming (getUserMedia) not supported in this browser.');

}

//doing this so that can use another camera

function setupCamera(cameras){
  
  console.log(cameras)
  
  var videoSource = cameras[cameras.length-1].id;
  //var videoSource = cameras[0].id;
  
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


function gotSources(sourceInfos) {
  var cameras = [];
  for (var i = 0; i !== sourceInfos.length; ++i) {

    var sourceInfo = sourceInfos[i];
    
    // var option = document.createElement('option');
    // option.value = sourceInfo.id;
    // if (sourceInfo.kind === 'audio') {
    //   option.text = sourceInfo.label || 'microphone ' +
    //     (audioSelect.length + 1);
    //   audioSelect.appendChild(option);
    if (sourceInfo.kind === 'video') {
      console.log(sourceInfo.label);
      cameras.push(sourceInfo);
    //   option.text = sourceInfo.label || 'camera ' + (videoSelect.length + 1);
    //   videoSelect.appendChild(option);
    // } else {
    //   console.log('Some other kind of source: ', sourceInfo);
    //}
  }
  }
  //console.log(cameras[1].id);
  //return cameras;
  setupCamera(cameras);
}
});



