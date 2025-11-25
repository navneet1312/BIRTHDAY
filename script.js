document.addEventListener("DOMContentLoaded", function () {
  const cake = document.querySelector(".cake");
  const candleCountDisplay = document.getElementById("candleCount");
  const birthdayMessage = document.getElementById("birthdayMessage"); 
  let candles = [];
  let audioContext;
  let analyser;
  let microphone;

  function updateCandleCount() {
    const activeCandles = candles.filter(
      (candle) => !candle.classList.contains("out")
    ).length;
    candleCountDisplay.textContent = activeCandles;

    // CHECK FOR ZERO CANDLES AND SHOW MESSAGE
    if (activeCandles === 0) {
      if (birthdayMessage) {
        birthdayMessage.classList.add("show");
      }
    }
  }

  function addCandle(left, top) {
    const candle = document.createElement("div");
    candle.className = "candle";
    candle.style.left = left + "px";
    candle.style.top = top + "px";

    const flame = document.createElement("div");
    flame.className = "flame";
    candle.appendChild(flame);

    cake.appendChild(candle);
    candles.push(candle);
    updateCandleCount();
  }

function setInitialCandles(count) {
    const numRows = 5; 
    const candlesPerRow = Math.ceil(count / numRows); 
    
    // Cake width is 350px. Icing width is ~340px (relative to the container)
    const cakeIcingWidth = 340; 
    const paddingX = 60; // <<< INCREASED significantly to push candles inward
    const paddingTop = 5; 
    const rowSpacing = 22; // Slight increase for better vertical separation

    // Calculate spacing based on inner area
    const spacingX = (cakeIcingWidth - 2 * paddingX) / (candlesPerRow - 1); 

    for (let i = 0; i < count; i++) {
      // Determine row and column index
      const row = i % numRows; 
      const col = Math.floor(i / numRows);

      // Calculate the base alignment position
      const alignedLeft = paddingX + col * spacingX;
      const alignedTop = paddingTop + row * rowSpacing;

      // Add minimal random jitter (max +/- 1px)
      const randomJitterX = Math.random() * 2 - 1; // -1 to +1px
      const randomJitterY = Math.random() * 2 - 1;  // -1 to +1px

      // Final position (relative to the 350px .cake container)
      const left = alignedLeft + randomJitterX;
      const top = alignedTop + randomJitterY;
      
      addCandle(left, top);
    }
  }

  cake.addEventListener("click", function (event) {
    const rect = cake.getBoundingClientRect();
    const left = event.clientX - rect.left;
    const top = event.clientY - rect.top;
    addCandle(left, top);
  });

  function isBlowing() {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    let average = sum / bufferLength;

    return average > 40; 
  }

  function blowOutCandles() {
    let blownOut = 0;

    if (isBlowing()) {
      candles.forEach((candle) => {
        if (!candle.classList.contains("out") && Math.random() > 0.5) {
          candle.classList.add("out");
          blownOut++;
        }
      });
    }

    if (blownOut > 0) {
      updateCandleCount();
    }
  }

  setInitialCandles(21); 

  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(function (stream) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        analyser.fftSize = 256;
        setInterval(blowOutCandles, 200);
      })
      .catch(function (err) {
        console.log("Unable to access microphone: " + err);
      });
  } else {
    console.log("getUserMedia not supported on your browser!");
  }
});
