
const languageSelect = document.getElementById('language');
const responseEl = document.getElementById('response');
const statusEl = document.getElementById('voiceStatus');
const mic = document.getElementById('micButton');

let lastResponse = '';
let userName = '';
let userArea = '';
let step = 0; // 0=name, 1=area, 2=help
let registrationComplete = false;

const questions = {
  'te-IN': [
    'నమస్కారం! బిజిలీసాథీకి స్వాగతం. ముందుగా మీ పేరు ఏమిటి?',
    'ధన్యవాదాలు! మీరు ఏ గ్రామం లేదా ప్రాంతంలో ఉంటారు?',
    'మీకు ఏ సహాయం కావాలి? మీ కరెంట్ బిల్లు వివరాలా, కరెంట్ సమస్యా, లేక రిమైండరా?'
  ],
  'hi-IN': [
    'नमस्ते! बिजलीसाथी में आपका स्वागत है। आपका नाम क्या है?',
    'धन्यवाद! आप किस गाँव या क्षेत्र में रहते हैं?',
    'आपको किस चीज़ में मदद चाहिए? बिजली बिल, बिजली की समस्या या रिमाइंडर?'
  ],
  'en-IN': [
    'Hello! Welcome to BijliSaathi. First, what is your name?',
    'Thank you! Which village or area do you live in?',
    'What help do you need? Your electricity bill, a power problem, or a reminder?'
  ]
};

const replies = {
  'te-IN': {
    bill: 'మీ డెమో విద్యుత్ బిల్లు 850 రూపాయలు. చివరి తేదీ 30 నవంబర్ 2026. ఇది నమూనా సమాచారం మాత్రమే.',
    usage: 'ఈ నెల డెమో విద్యుత్ వినియోగం 120 యూనిట్లు.',
    reminder: 'మీ డెమో బిల్లు కోసం రిమైండర్ విభాగాన్ని తెరిచాను. తేదీ ఎంచుకుని సెట్ చేయండి.',
    power: 'మీ ప్రాంతంలో కరెంట్ సమస్య ఉంటే మీ విద్యుత్ పంపిణీ సంస్థ అధికారిక ఫిర్యాదు మార్గాన్ని సంప్రదించండి. ఈ డెమో నిజమైన ఫిర్యాదును పంపదు.',
    fallback: 'క్షమించండి, అర్థం కాలేదు. బిల్లు, యూనిట్లు, రిమైండర్ లేదా కరెంట్ సమస్య గురించి అడగండి.'
  },
  'hi-IN': {
    bill: 'आपका डेमो बिजली बिल 850 रुपये है। अंतिम तारीख 30 नवंबर 2026 है। यह केवल नमूना जानकारी है।',
    usage: 'इस महीने का डेमो बिजली उपयोग 120 यूनिट है।',
    reminder: 'रिमाइंडर विकल्प खोल दिया है। तारीख चुनकर सेट करें।',
    power: 'बिजली की समस्या के लिए अपनी बिजली वितरण कंपनी के आधिकारिक माध्यम से संपर्क करें। यह डेमो वास्तविक शिकायत दर्ज नहीं करता।',
    fallback: 'माफ़ कीजिए, समझ नहीं आया। बिल, यूनिट, रिमाइंडर या बिजली की समस्या पूछें।'
  },
  'en-IN': {
    bill: 'Your demo electricity bill is 850 rupees. The due date is 30 November 2026. This is sample information only.',
    usage: 'Your demo electricity usage this month is 120 units.',
    reminder: 'I opened the reminder section. Choose a date and set your demo reminder.',
    power: 'For electricity problems, contact your electricity provider through its official complaint channel. This demo does not submit a real complaint.',
    fallback: 'Sorry, I did not understand. Ask about your bill, units, reminder or power problem.'
  }
};

function speak(text) {
  lastResponse = text;
  responseEl.textContent = text;

  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const voice = new SpeechSynthesisUtterance(text);
    voice.lang = languageSelect.value;
    window.speechSynthesis.speak(voice);
  }
}

function askCurrentStep() {
  const question = questions[languageSelect.value][step];
  document.getElementById('welcomeTitle').textContent = 'BijliSaathi';
  speak(question);
  statusEl.textContent = 'మైక్ నొక్కి సమాధానం చెప్పండి.';
}

function finishRegistration(helpAnswer) {
  registrationComplete = true;

  const lang = languageSelect.value;
  let greeting = '';

  if (lang === 'te-IN') {
    greeting = `ధన్యవాదాలు ${userName}! మీ ప్రాంతం ${userArea}. ఇప్పుడు మీకు సహాయం చేస్తాను.`;
  } else if (lang === 'hi-IN') {
    greeting = `धन्यवाद ${userName}! आपका क्षेत्र ${userArea} है। अब मैं आपकी मदद करूँगा।`;
  } else {
    greeting = `Thank you, ${userName}! Your area is ${userArea}. I am ready to help.`;
  }

  speak(greeting);
  processQuestion(helpAnswer);
}

function handleAnswer(text) {
  if (!text.trim()) return;

  if (!registrationComplete) {
    if (step === 0) {
      userName = text.trim();
      step = 1;
      askCurrentStep();
      return;
    }

    if (step === 1) {
      userArea = text.trim();
      step = 2;
      askCurrentStep();
      return;
    }

    if (step === 2) {
      finishRegistration(text);
      return;
    }
  }

  processQuestion(text);
}

function processQuestion(text) {
  const q = text.toLowerCase();
  const r = replies[languageSelect.value];

  if (/bill|బిల్లు|బిల్|बिल|amount|ఎంత|kitna/.test(q)) {
    document.getElementById('billCard').hidden = false;
    speak(r.bill);
  } else if (/unit|usage|వినియోగం|యూనిట్|खपत|यूनिट/.test(q)) {
    speak(r.usage);
  } else if (/remind|reminder|రిమైండర్|గుర్తు|याद|रिमाइंडर/.test(q)) {
    document.getElementById('reminderCard').hidden = false;
    speak(r.reminder);
  } else if (/power|cut|current|కరెంట్|విద్యుత్|करंट|बिजली/.test(q)) {
    document.getElementById('powerCard').hidden = false;
    speak(r.power);
  } else {
    speak(r.fallback);
  }
}

function startListening() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    statusEl.textContent = 'Voice input is not supported. Please use Chrome or type your answer.';
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = languageSelect.value;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  mic.textContent = '🎙️ Listening...';
  mic.classList.add('listening');
  statusEl.textContent = 'Please speak now.';

  recognition.onresult = event => {
    const transcript = event.results[0][0].transcript;
    statusEl.textContent = 'Heard: ' + transcript;
    handleAnswer(transcript);
  };

  recognition.onerror = event => {
    statusEl.textContent = 'Voice issue: ' + event.error + '. Please try again.';
  };

  recognition.onend = () => {
    mic.textContent = '🎙️ మాట్లాడటానికి నొక్కండి';
    mic.classList.remove('listening');
  };

  try {
    recognition.start();
  } catch (error) {
    statusEl.textContent = 'Please press the microphone again.';
  }
}

mic.addEventListener('click', startListening);

document.getElementById('sendButton').addEventListener('click', () => {
  const input = document.getElementById('questionInput');
  handleAnswer(input.value);
  input.value = '';
});

document.getElementById('questionInput').addEventListener('keydown', event => {
  if (event.key === 'Enter') {
    handleAnswer(event.target.value);
    event.target.value = '';
  }
});

document.getElementById('repeatButton').addEventListener('click', () => {
  if (lastResponse) {
    window.speechSynthesis.cancel();
    speak(lastResponse);
  }
});

languageSelect.addEventListener('change', () => {
  if (!registrationComplete) {
    askCurrentStep();
  } else {
    speak(questions[languageSelect.value][2]);
  }
});

document.getElementById('reminderButton').addEventListener('click', () => {
  const date = document.getElementById('reminderDate').value;
  const target = document.getElementById('reminderStatus');

  if (!date) {
    target.textContent = 'Please choose a date.';
    return;
  }

  target.textContent =
    'Demo reminder saved for ' + date +
    '. No real notification is sent.';

  const messages = {
    'te-IN': `డెమో రిమైండర్ ${date} తేదీకి సెట్ చేయబడింది.`,
    'hi-IN': `डेमो रिमाइंडर ${date} के लिए सेट किया गया है।`,
    'en-IN': `Your demo reminder is set for ${date}.`
  };

  speak(messages[languageSelect.value]);
});

// Start by asking the user's name.
askCurrentStep();
