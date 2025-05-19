const video = document.getElementById('screenVideo');
const chatDiv = document.getElementById('chatHistory');
const loader = document.getElementById('loader');

async function startScreenShare() {
  try {
    const sources = await window.electronAPI.getScreenSources();
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: sources[0].id,
        }
      }
    });
    video.srcObject = stream;
  } catch (err) {
    alert("Failed to start screen share: " + err.message);
  }
}

async function startVoice() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.start();

  recognition.onresult = async (event) => {
    const voiceText = event.results[0][0].transcript;
    chatDiv.innerHTML += `<div><strong>You:</strong> ${voiceText}</div>`;
    loader.classList.remove('hidden');
    try {
      const response = await callXAPI(voiceText);
      chatDiv.innerHTML += `<div><strong>AI:</strong> ${response}</div>`;
      speakResponse(response);
    } catch (err) {
      chatDiv.innerHTML += `<div><strong>AI:</strong> Error getting response.</div>`;
      speakResponse("Sorry, I couldn't get a response.");
    } finally {
      loader.classList.add('hidden');
    }
  };
}

async function callXAPI(prompt) {
  const apiKey = window.electronAPI.getEnv().OPENAI_API_KEY;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }]
    })
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("API Error:", res.status, errorText);
    throw new Error("OpenAI API কল ব্যর্থ হয়েছে");
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

function speakResponse(text) {
  const synth = window.speechSynthesis;
  const utter = new SpeechSynthesisUtterance(text);
  synth.speak(utter);
}
