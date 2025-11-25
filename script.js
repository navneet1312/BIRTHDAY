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
    const candlesPerRow = Math.ceil(count / 3); // 7 candles per row for 21 total
    const cakeWidth = 340; 
    const padding = 20; 
    const spacing = (cakeWidth - 2 * padding) / (candlesPerRow - 1); 

    for (let i = 0; i < count; i++) {
      // Determine row and column index
      const row = i % 3; // 0, 1, or 2
      const col = Math.floor(i / 3); // 0, 1, 2, 3, 4, 5, 6

      // Calculate the base alignment position
      // Left position: Evenly space columns, plus padding
      const alignedLeft = padding + col * spacing;

      // Top position: Place in one of three aligned rows (0px, 15px, 30px from the top)
      const alignedTop = 0 + row * 15;

      // Add a small random jitter for a less perfect, more natural look
      const randomJitterX = Math.random() * 20 - 10; // -10 to +10px
      const randomJitterY = Math.random() * 10 - 5;  // -5 to +5px

      // Use the aligned position plus the jitter
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
