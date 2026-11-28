
const languageSelect = document.getElementById('language');
const responseEl = document.getElementById('response');
const statusEl = document.getElementById('voiceStatus');
const mic = document.getElementById('micButton');

let lastResponse = '';
let recognition = null;

const replies = {
  'te-IN': {
    greeting: 'నమస్కారం! బిజిలీసాథీకి స్వాగతం. మీకు ఏ సహాయం కావాలి? మీ బిల్లు, విద్యుత్ వినియోగం, రిమైండర్ లేదా కరెంట్ సమస్య గురించి అడగండి.',
    bill: 'మీ డెమో విద్యుత్ బిల్లు 850 రూపాయలు. చివరి చెల్లింపు తేదీ 30 నవంబర్ 2026. ఇది నమూనా సమాచారం మాత్రమే.',
    usage: 'ఈ నెల డెమో విద్యుత్ వినియోగం 120 యూనిట్లు.',
    reminder: 'మీ డెమో బిల్లు కోసం రిమైండర్ విభాగం తెరిచాను. తేదీని ఎంచుకుని సెట్ చేయండి.',
    power: 'మీ ప్రాంతంలో కరెంట్ సమస్య ఉంటే మీ విద్యుత్ పంపిణీ సంస్థ అధికారిక ఫిర్యాదు మార్గాన్ని సంప్రదించండి. ఈ డెమో నిజమైన ఫిర్యాదును పంపదు.',
    fallback: 'క్షమించండి, మీ మాట అర్థం కాలేదు. దయచేసి మళ్లీ నెమ్మదిగా చెప్పండి.'
  },

  'hi-IN': {
    greeting: 'नमस्ते! बिजलीसाथी में आपका स्वागत है। आपको किस चीज़ में मदद चाहिए? बिल, बिजली उपयोग, रिमाइंडर या बिजली की समस्या के बारे में पूछें।',
    bill: 'आपका डेमो बिजली बिल 850 रुपये है। अंतिम भुगतान तिथि 30 नवंबर 2026 है। यह केवल नमूना जानकारी है।',
    usage: 'इस महीने का डेमो बिजली उपयोग 120 यूनिट है।',
    reminder: 'मैंने आपके डेमो बिल के लिए रिमाइंडर विकल्प खोल दिया है। तारीख चुनकर सेट करें।',
    power: 'बिजली की समस्या के लिए अपनी बिजली वितरण कंपनी के आधिकारिक शिकायत माध्यम से संपर्क करें। यह डेमो वास्तविक शिकायत दर्ज नहीं करता।',
    fallback: 'माफ़ कीजिए, मैं समझ नहीं पाया। कृपया धीरे-धीरे दोबारा बोलें।'
  },

  'en-IN': {
    greeting: 'Hello! Welcome to BijliSaathi. What help do you need? Ask about your bill, electricity usage, reminders or power problems.',
    bill: 'Your demo electricity bill is 850 rupees. The due date is 30 November 2026. This is sample information only.',
    usage: 'Your demo electricity usage this month is 120 units.',
    reminder: 'I have opened the reminder section. Choose a date and set your demo reminder.',
    power: 'For electricity problems, contact your electricity distribution company through its official complaint channel. This demo does not submit a real complaint.',
    fallback: 'Sorry, I could not understand. Please speak slowly again.'
  }
};

function speak(text) {
  if (!('speechSynthesis' in window)) {
    statusEl.textContent = 'Voice output is not supported. Please read the text response.';
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

function showGreeting() {
  const greeting = replies[languageSelect.value].greeting;
  document.getElementById('welcomeTitle').textContent = greeting;
  answer(greeting);
}

function processQuestion(text) {
  if (!text.trim()) return;

  const q = text.toLowerCase();
  const r = replies[languageSelect.value];

  if (/power cut|power problem|no power|కరెంట్ పో|కరెంట్ లేదు|విద్యుత్ సమస్య|बिजली नहीं|बिजली कट/.test(q)) {
    document.getElementById('powerCard').hidden = false;
    answer(r.power);
  }

  else if (/bill|బిల్లు|బిల్|बिल|amount|ఎంత|kitna/.test(q)) {
    document.getElementById('billCard').hidden = false;
    answer(r.bill);
  }

  else if (/unit|usage|వినియోగం|యూనిట్|खपत|यूनिट/.test(q)) {
    answer(r.usage);
  }

  else if (/remind|reminder|రిమైండర్|గుర్తు|याद|रिमाइंडर/.test(q)) {
    document.getElementById('reminderCard').hidden = false;
    answer(r.reminder);
  }

  else {
    answer(r.fallback);
  }
}

document.getElementById('sendButton').addEventListener('click', () => {
  const input = document.getElementById('questionInput');
  processQuestion(input.value);
  input.value = '';
});

document.getElementById('questionInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    processQuestion(e.target.value);
    e.target.value = '';
  }
});

document.getElementById('repeatButton').addEventListener('click', () => {
  if (lastResponse) speak(lastResponse);
});

languageSelect.addEventListener('change', showGreeting);

mic.addEventListener('click', () => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    statusEl.textContent =
      'Voice input is not supported. Please try Chrome with microphone permission.';
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = languageSelect.value;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  mic.classList.add('listening');
  mic.textContent = '🎙️ Listening...';
  statusEl.textContent = 'Please speak clearly.';

  recognition.onresult = event => {
    const transcript = event.results[0][0].transcript;

    statusEl.textContent = 'Heard: ' + transcript;

    processQuestion(transcript);
  };

  recognition.onerror = event => {
    statusEl.textContent =
      'Voice issue: ' + event.error + '. Please try again.';
  };

  recognition.onend = () => {
    mic.classList.remove('listening');
    mic.textContent = '🎙️ మాట్లాడటానికి నొక్కండి';
  };

  try {
    recognition.start();
  } catch (error) {
    statusEl.textContent = 'Please try pressing the microphone again.';
  }
});

document.getElementById('reminderButton').addEventListener('click', () => {
  const date = document.getElementById('reminderDate').value;
  const target = document.getElementById('reminderStatus');

  if (!date) {
    target.textContent = 'Please choose a reminder date.';
    return;
  }

  target.textContent =
    'Demo reminder saved for ' + date +
    '. This is temporary and no real notification is sent.';

  const messages = {
    'te-IN': `డెమో రిమైండర్ ${date} తేదీకి సెట్ చేయబడింది.`,
    'hi-IN': `डेमो रिमाइंडर ${date} के लिए सेट किया गया है।`,
    'en-IN': `Your demo reminder is set for ${date}.`
  };

  answer(messages[languageSelect.value]);
});

// Start the assistant in the selected default language.
showGreeting();
