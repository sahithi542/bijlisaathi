# BijliSaathi – AI Voice-Based Electricity Assistant

A mobile-friendly hackathon prototype that demonstrates voice-first electricity assistance in Telugu, Hindi and English.

## Features
- Voice input using the browser Web Speech API where supported.
- Spoken responses using browser speech synthesis where supported.
- Language selection: Telugu (`te-IN`), Hindi (`hi-IN`), English (`en-IN`).
- Demo electricity bill (₹850, 120 units, due 30 November 2026).
- Demo reminder interaction.
- Power-cut assistance guidance.
- Text input fallback if microphone support is unavailable.

## Important demo limitations
This is a front-end prototype. It uses sample bill data and does not connect to an electricity board, process payments, send real notifications, or submit actual complaints. Do not enter real consumer account information. Browser speech recognition support and available voices vary by device and browser. Use HTTPS or localhost and grant microphone permission for voice input.

## Run locally
Open `index.html` in a modern browser. For a local web server, run:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Run with Docker

```bash
docker build -t bijlisaathi .
docker run --rm -p 8080:80 bijlisaathi
```

Then visit `http://localhost:8080`.

## GitHub setup
1. Create a public repository named `bijlisaathi`.
2. Upload all files and folders from this project.
3. Confirm that `Dockerfile`, `index.html`, `styles.css`, and `app.js` are in the repository.
4. Test the app from the deployed HTTPS URL before recording your demo.

## Suggested demo flow (under 3 minutes)
1. Open the app and show the Telugu language selection.
2. Tap the microphone and ask: “నా కరెంట్ బిల్లు ఎంత?”
3. Show the demo bill response and explain that the bill is sample data.
4. Set a payment reminder.
5. Enter a locality in Power-cut assistance and show the official-service guidance.
6. Briefly switch to Hindi or English.

## Docker
The included Dockerfile serves the static app with Nginx.
