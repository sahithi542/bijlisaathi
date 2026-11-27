const languageSelect = document.getElementById('language');
const responseEl = document.getElementById('response');
const statusEl = document.getElementById('voiceStatus');
let lastResponse = 'Namaskaram! I am BijliSaathi. How can I help you today?';
let recognition = null;

const replies = {
  'te-IN': {
    greeting: 'నమస్కారం! బిజిలీసాథీకి స్వాగతం. మీకు ఎలా సహాయం చేయగలను?',
    bill: 'మీ డెమో విద్యుత్ బిల్లు ₹850. చివరి చెల్లింపు తేదీ 30 నవంబర్ 2026. ఇది నమూనా సమాచారం మాత్రమే.',
    usage: 'ఈ నెల డెమో విద్యుత్ వినియోగం 120 యూనిట్లు.',
    reminder: 'మీ డెమో బిల్లు కోసం రిమైండర్ సెట్ చేయడానికి Reminder విభాగాన్ని ఉపయోగించండి.',
    power: 'మీ ప్రాంతం పేరు నమోదు చేయండి. మీ విద్యుత్ పంపిణీ సంస్థ అధికారిక ఫిర్యాదు మార్గాన్ని సంప్రదించండి. ఈ డెమో నిజమైన ఫిర్యాదును పంపదు.',
    fallback: 'క్షమించండి, మీ మాట అర్థం కాలేదు. దయచేసి మళ్లీ నెమ్మదిగా చెప్పండి లేదా టైప్ చేయండి.'
  },
  'hi-IN': {
    greeting: 'नमस्ते! बिजलीसाथी में आपका स्वागत है। मैं आपकी कैसे मदद कर सकता हूँ?',
    bill: 'आपका डेमो बिजली बिल ₹850 है। अंतिम भुगतान तिथि 30 नवंबर 2026 है। यह केवल नमूना जानकारी है।',
    usage: 'इस महीने का डेमो बिजली उपयोग 120 यूनिट है।',
    reminder: 'डेमो बिल के लिए रिमाइंडर लगाने हेतु रिमाइंडर विकल्प का उपयोग करें।',
    power: 'कृपया अपना क्षेत्र दर्ज करें और अपनी बिजली वितरण कंपनी के आधिकारिक शिकायत माध्यम से संपर्क करें। यह डेमो वास्तविक शिकायत दर्ज नहीं करता।',
    fallback: 'माफ़ कीजिए, मैं समझ नहीं पाया। कृपया धीरे-धीरे दोबारा बोलें या टाइप करें।'
  },
  'en-IN': {
    greeting: 'Hello! Welcome to BijliSaathi. How can I help you today?',
    bill: 'Your demo electricity bill is 850 rupees. The due date is 30 November 2026. This is sample information only.',
    usage: 'Your demo electricity usage this month is 120 units.',
    reminder: 'Use the reminder section to set a reminder for your demo bill.',
    power: 'Please enter your area and contact your electricity provider through its official complaint channel. This demo does not submit a real complaint.',
    fallback: 'Sorry, I could not understand. Please speak slowly again or type your question.'
  }
};

function getReply(text) {
  const q = text.toLowerCase();
  const lang = languageSelect.value;
  const r = replies[lang];
  if (/bill|బిల్లు|బిల్|बिल|amount|entha|ఎంత/.test(q)) return r.bill;
  if (/unit|usage|వినియోగం|యూనిట్|खपत|यूनिट/.test(q)) return r.usage;
  if (/remind|రిమైండర్|గుర్తు|याद|रिमाइंडर/.test(q)) return r.reminder;
  if (/power|cut|current|కరెంట్|విద్యుత్|करंट|बिजली नहीं/.test(q)) return r.power;
  return r.fallback;
}

function speak(text) {
  if (!('speechSynthesis' in window)) {
    statusEl.textContent = 'Speech output is not supported in this browser. Read the text response below.';
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = languageSelect.value;
  window.speechSynthesis.speak(utterance);
}
function answer(text) {
  lastResponse = text;
  responseEl.textContent = text;
  speak(text);
}
function processQuestion(text) {
  if (!text.trim()) return;
  answer(getReply(text));
}
document.getElementById('sendButton').addEventListener('click', () => {
  processQuestion(document.getElementById('questionInput').value);
});
document.getElementById('questionInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') processQuestion(e.target.value);
});
document.getElementById('repeatButton').addEventListener('click', () => speak(lastResponse));

languageSelect.addEventListener('change', () => {
  const greeting = replies[languageSelect.value].greeting;
  document.getElementById('welcomeTitle').textContent = greeting;
  answer(greeting);
});

document.getElementById('micButton').addEventListener('click', () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    statusEl.textContent = 'Voice input is not supported in this browser. Please use the text box, or try Chrome with microphone permission enabled.';
    return;
  }
  recognition = new SpeechRecognition();
  recognition.lang = languageSelect.value;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  const mic = document.getElementById('micButton');
  mic.classList.add('listening');
  mic.textContent = '🎙️ Listening…';
  statusEl.textContent = 'Please speak clearly.';
  recognition.onresult = event => {
    const transcript = event.results[0][0].transcript;
    document.getElementById('questionInput').value = transcript;
    processQuestion(transcript);
    statusEl.textContent = `Heard: ${transcript}`;
  };
  recognition.onerror = event => {
    statusEl.textContent = `Voice input issue (${event.error}). Please try again or type your question.`;
  };
  recognition.onend = () => {
    mic.classList.remove('listening');
    mic.textContent = '🎙️ Tap to speak';
  };
  recognition.start();
});

document.getElementById('reminderButton').addEventListener('click', () => {
  const date = document.getElementById('reminderDate').value;
  const target = document.getElementById('reminderStatus');
  if (!date) { target.textContent = 'Please choose a reminder date.'; return; }
  target.textContent = `Demo reminder saved for ${date}. This reminder is stored only while this page is open; no real notification is sent.`;
  answer(languageSelect.value === 'te-IN' ? `రిమైండర్ ${date} తేదీకి ఈ డెమోలో సెట్ చేయబడింది.` :
    languageSelect.value === 'hi-IN' ? `डेमो रिमाइंडर ${date} के लिए सेट किया गया है।` :
    `Your demo reminder is set for ${date}.`);
});

document.getElementById('areaButton').addEventListener('click', () => {
  const area = document.getElementById('areaInput').value.trim();
  const target = document.getElementById('areaStatus');
  if (!area) { target.textContent = 'Please enter your village or area.'; return; }
  target.textContent = `Area entered: ${area}. Next step: contact your local electricity distribution company using its official helpline or website. No complaint has been submitted.`;
  answer(replies[languageSelect.value].power);
});

answer(replies['te-IN'].greeting);
