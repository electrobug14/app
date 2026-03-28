# Nishit's Study Tracker — Setup Guide

## What's in the app
- **Dashboard** — Today's progress, streak, week dots, quick actions
- **Log Today** — Dynamic subject sliders (only selected subjects show), mood, checklist, notes
- **Subject Select** — Pick from 28 subjects (VLSI, Embedded, Core ECE, Math, Aptitude, Career)
- **Week Report** — Stats + AI next-week plan + weak area tips
- **AI Coach** — Chat directly with Claude / ChatGPT / Gemini about your prep
- **Study Guides** — AI generates full subject guides (topics, resources, interview questions)
- **Settings** — Switch AI provider, enter API key, test connection

---

## STEP 1 — Install prerequisites (one-time)

### 1.1 Install Node.js (if not already)
Download from: https://nodejs.org (LTS version)
Check: open terminal, type `node -v` — should show v18 or above

### 1.2 Install Expo CLI
```bash
npm install -g expo-cli
```

### 1.3 Install EAS CLI (for APK build)
```bash
npm install -g eas-cli
```

---

## STEP 2 — Set up the project

### 2.1 Copy the project folder
Put the `StudyTrackerApp` folder anywhere on your PC (e.g., Desktop)

### 2.2 Open terminal in that folder
```bash
cd path/to/StudyTrackerApp
```

### 2.3 Install dependencies
```bash
npm install
```
This will take 2–5 minutes. You'll see a `node_modules` folder appear.

### 2.4 Install the slider package
```bash
npx expo install @react-native-community/slider
```

---

## STEP 3 — Run on your phone (test instantly)

### 3.1 Install Expo Go on your phone
- Android: https://play.google.com/store/apps/details?id=host.exp.exponent
- Search "Expo Go" on Play Store

### 3.2 Start the app
```bash
npx expo start
```
A QR code will appear in your terminal.

### 3.3 Open on phone
Open Expo Go → Scan the QR code → App loads on your phone!

---

## STEP 4 — Build the APK (install without Expo Go)

### 4.1 Create free Expo account
Go to: https://expo.dev → Sign up (free)

### 4.2 Log in from terminal
```bash
eas login
```

### 4.3 Configure the build
```bash
eas build:configure
```
When asked about platform, choose: **Android**

### 4.4 Build APK
```bash
eas build -p android --profile preview
```
- This runs on Expo's servers (free tier: ~30 min build time)
- You'll get a download link when done
- Download the `.apk` file
- Transfer to phone → Install it

---

## STEP 5 — Add your AI API key in the app

Open Settings tab in the app:
1. Choose AI provider (Claude / ChatGPT / Gemini)
2. Enter your API key

### Getting free API keys:

**Claude (Anthropic)**
- Go to: https://console.anthropic.com
- Sign up → API Keys → Create new key
- Free $5 credits for new accounts

**Gemini (Google) — BEST FREE OPTION**
- Go to: https://aistudio.google.com
- Sign in with Google → Get API Key
- Completely FREE (generous free tier)

**ChatGPT (OpenAI)**
- Go to: https://platform.openai.com
- Sign up → API Keys → Create new key
- ~$5 free credits

---

## STEP 6 — Add eas.json for APK profile

Create a file called `eas.json` in the project root:
```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

---

## Troubleshooting

**"metro bundler" errors** → Run `npx expo start --clear`

**"dependency version mismatch"** → Run `npx expo install --fix`

**APK won't install on phone** → Go to Phone Settings → Security → Enable "Install unknown apps"

**API key not working** → Use "Test connection" button in Settings to verify

---

## Updating the app
Just edit files and save — Expo auto-reloads on your phone instantly (no rebuild needed for testing).

For APK updates: run `eas build -p android --profile preview` again.

---

## Project structure
```
StudyTrackerApp/
├── App.js                    ← Navigation setup
├── src/
│   ├── constants/index.js   ← All subjects, colors, AI providers
│   ├── utils/
│   │   ├── storage.js       ← AsyncStorage (saves logs on device)
│   │   └── aiService.js     ← Claude / OpenAI / Gemini API calls
│   └── screens/
│       ├── HomeScreen.js         ← Dashboard
│       ├── LogScreen.js          ← Log today (dynamic sliders)
│       ├── SubjectSelectScreen.js ← Pick subjects
│       ├── ChatScreen.js         ← AI chat
│       ├── WeekReportScreen.js   ← Weekly stats + AI plan
│       ├── StudyGuideScreen.js   ← AI study guides
│       └── SettingsScreen.js     ← API key, provider
```
