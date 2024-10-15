function updateClock() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const amPm = hours >= 12 ? 'PM' : 'AM';

  // Format the time (e.g., 10:32:15 AM)
  let formattedTime = `${hours % 12 || 12}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${amPm}`;

  // Update the clock element
  document.getElementById('clock').textContent = `[${formattedTime}]`;
}

// Update the clock every second
setInterval(updateClock, 1000);

// Initial call to set the clock on page load
updateClock();

const noise = () => {
  let canvas, ctx;

  let wWidth, wHeight;

  let noiseData = [];
  let frame = 0;

  let loopTimeout;


  // Create Noise
  const createNoise = () => {
    const idata = ctx.createImageData(wWidth, wHeight);
    const buffer32 = new Uint32Array(idata.data.buffer);
    const len = buffer32.length;

    for (let i = 0; i < len; i++) {
      if (Math.random() < 0.5) {
        buffer32[i] = 0xff000000;
      }
    }

    noiseData.push(idata);
  };


  // Play Noise
  const paintNoise = () => {
    if (frame === 9) {
      frame = 0;
    } else {
      frame++;
    }

    ctx.putImageData(noiseData[frame], 0, 0);
  };


  // Loop
  const loop = () => {
    paintNoise(frame);

    loopTimeout = window.setTimeout(() => {
      window.requestAnimationFrame(loop);
    }, (1000 / 25));
  };


  // Setup
  const setup = () => {
    wWidth = window.innerWidth;
    wHeight = window.innerHeight;

    canvas.width = wWidth;
    canvas.height = wHeight;

    for (let i = 0; i < 10; i++) {
      createNoise();
    }

    loop();
  };


  // Reset
  let resizeThrottle;
  const reset = () => {
    window.addEventListener('resize', () => {
      window.clearTimeout(resizeThrottle);

      resizeThrottle = window.setTimeout(() => {
        window.clearTimeout(loopTimeout);
        setup();
      }, 200);
    }, false);
  };


  // Init
  const init = (() => {
    canvas = document.getElementById('noise');
    ctx = canvas.getContext('2d');

    setup();
  })();
};

noise();

// YouTube API Key
const apiKey = 'AIzaSyBLKoCWdw_s3S88QqK1YUd7sKsg6TBLYKI';
const channelId = 'UChRUnDg7MbSeG4HZPt5-tyQ';

// Function to fetch the latest video from the YouTube channel
async function fetchLatestVideo() {
  const response = await fetch(`https://www.googleapis.com/youtube/v3/search?order=date&part=snippet&channelId=${channelId}&maxResults=1&key=${apiKey}`);
  const data = await response.json();
  const latestVideo = data.items[0];

  // Update the iframe and figcaption
  const videoId = latestVideo.id.videoId;
  const videoDescription = latestVideo.snippet.description;
  document.getElementById('latestVideo').src = `https://www.youtube.com/embed/${videoId}`;
  document.getElementById('videoCaption').textContent = videoDescription;
}

// Call the function to update the video
fetchLatestVideo();


