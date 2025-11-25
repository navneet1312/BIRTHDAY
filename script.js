document.addEventListener("DOMContentLoaded", function () {
  const cake = document.querySelector(".cake");
  const candleCountDisplay = document.getElementById("candleCount");
  const birthdayMessage1 = document.getElementById("birthdayMessage1"); 
  const birthdayMessage2 = document.getElementById("birthdayMessage2"); 
  
  // Confetti container setup
  const confettiContainer = document.createElement('div'); 
  confettiContainer.id = 'confetti-container'; 
  // Append to the element containing the cake (the body or a wrapper)
  cake.parentElement.appendChild(confettiContainer); 
  
  let candles = [];
  let audioContext;
  let analyser;
  let microphone;

  function hideCake() {
    cake.style.transition = 'opacity 1s ease-in-out';
    cake.style.opacity = '0';
  }

  function launchConfetti() {
    const colors = ["#ffcc00", "#ff6699", "#66ccff", "#99ff99", "#ffffff"]; 
    const totalConfetti = 100;
    const viewportWidth = window.innerWidth; // Get full screen width

    for (let i = 0; i < totalConfetti; i++) {
      const piece = document.createElement("div");
      piece.className = "confetti";
      
      // Start position: randomly across the full viewport width
      piece.style.left = (Math.random() * viewportWidth) + "px"; 
      
      piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDelay = Math.random() * 0.5 + "s";
      piece.style.transform = `translate(0, -100px) rotate(${Math.random() * 360}deg)`;
      
      // End position: random horizontal drift
      piece.style.setProperty('--end-x', `${Math.random() * 600 - 300}px`); 

      confettiContainer.appendChild(piece);
    }
  }

  function updateCandleCount() {
    const activeCandles = candles.filter(
      (candle) => !candle.classList.contains("out")
    ).length;
    candleCountDisplay.textContent = activeCandles;

    if (activeCandles === 0) {
      // 1. Launch Confetti Immediately
      launchConfetti(); 

      // 2. Display FIRST Message (Message 1) after 1 second
      if (birthdayMessage1) {
        setTimeout(() => {
          birthdayMessage1.classList.add("show");
        }, 1000); 
      }

      // 3. Hide Cake, Hide Message 1, and Show Message 2 (Final Message) after 3 seconds total
      if (birthdayMessage2) {
        setTimeout(() => {
          // A. Hide the cake before showing the final message
          hideCake(); 
          
          // B. Hide the first message
          if (birthdayMessage1) {
             birthdayMessage1.classList.remove("show");
          }
          
          // C. Show the second message
          birthdayMessage2.classList.add("show");
        }, 6000); 
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

  // FIXED: Ensure 21 initial candles load immediately
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
