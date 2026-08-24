<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=3B6B5E&height=200&section=header&text=PersonaAI&fontSize=90&fontColor=ffffff" alt="Header" />
  
  # Persona AI : A 3D AI Desktop Assistant with Adaptive Behavior - With mental health prediction model

  [![Typing SVG](https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=700&size=24&pause=1000&color=C5A880&center=true&vCenter=true&width=600&lines=Your+Intelligent+Desktop+Companion;Speech-to-Speech+Local+AI;Predicts+Mental+Health+Signals;3D+Holographic+Avatar)](https://git.io/typing-svg)

  **The signal behind the silence.** An adaptive, privacy-first desktop wellness companion built for developers, students, and techies who spend their lives in front of screens.

  <p align="center">
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
    <img src="https://img.shields.io/badge/ThreeJs-black?style=for-the-badge&logo=three.js&logoColor=white" />
    <img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi" />
    <img src="https://img.shields.io/badge/Ollama-FFFFFF?style=for-the-badge&logo=Ollama&logoColor=black" />
    <img src="https://img.shields.io/badge/scikit--learn-%23F7931E.svg?style=for-the-badge&logo=scikit-learn&logoColor=white" />
    <img src="https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white" />
  </p>
</div>

---

## 🌟 Why PersonaAI?
For techies, software developers, and students, spending 8-14 hours locked into a monitor is the norm. The result? Spiked stress, ruined posture, and declining mental health. 

Existing tools are just passive screen-time trackers with no personality, and mainstream AI assistants compromise your privacy by sending voice data to the cloud.

**PersonaAI** is different. It acts as a proactive desktop presence. It runs a local LLM so your data never leaves your machine, talks to you via bidirectional speech-to-speech, remembers your habits, and predicts your wellness trajectory using a Machine Learning model. 

---

## ✨ Key Features

| 🎙️ **Speech-to-Speech Local AI** | 🧠 **Adaptive Memory** |
| :--- | :--- |
| Uses the Web Speech API and an entirely local **Ollama (LLaMA 3.2)** LLM to process your voice securely. It talks back instantly with synthesized text-to-speech. | Uses **ChromaDB** vector storage and SQLite so it never has amnesia. It remembers your past commands, routines, and workflows. |

| 🧊 **3D Procedural Avatar** | 📊 **Mental Health ML Prediction** |
| :--- | :--- |
| A visually engaging **Three.js** holographic avatar that reacts to your voice. It idles, leans in to listen, and gestures when talking. | Trained on real student lifestyle data (R² ≈ 0.92). Feed it your screen time and sleep hours to predict a wellness score (0-10) and chart your trends. |

| 💧 **Proactive Wellness Nudges** | 💻 **OS-Level Desktop Integration** |
| :--- | :--- |
| Monitors your on-screen uptime. Every hour, it proactively alerts you via desktop notification and voice: *"Take a break, take a sip."* | Say *"Open VS Code"* or *"Open YouTube"* and the AI will physically launch the desktop apps using Python subprocesses. |

---

## 🏗️ System Architecture

<div align="center">
  <img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" width="100%" />
</div>

- **Frontend:** React (Vite) + Three.js + Recharts + Glassmorphism UI
- **Backend:** Python (FastAPI) + WebSockets for low-latency real-time voice chat
- **Database:** SQLite (Relational) + ChromaDB (Semantic Vector Memory)
- **AI Core:** Ollama (LLaMA 3.2:3b) + Google Gemini 2.0 (Online Fallback)
- **ML Core:** Scikit-Learn Random Forest Regressor (Joblib serialized)

---

## 🚀 Quick Start Guide

### 1️⃣ Prerequisites
- **Python 3.10+**
- **Node.js 18+**
- **Ollama** installed locally (to run LLaMA 3.2)

### 2️⃣ Start the Local AI Engine
Fire up your terminal and start Ollama so your data stays private:
```bash
ollama run llama3.2:3b
```

### 3️⃣ Boot up the Backend (FastAPI)
Open a new terminal and navigate to the backend folder:
```bash
cd persona-ai-backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 4️⃣ Boot up the Frontend (React)
Open a third terminal and navigate to the frontend folder:
```bash
cd persona-ai-frontend
npm install
npm run dev
```

### 5️⃣ Interact!
Navigate to `http://localhost:5173` in your browser. Create an account, click the 🎙️ **Microphone**, and say hello to your new 3D companion! 

---

## 🔮 Future Scope
- **Biometric Integration:** Syncing with Apple Watch / Garmin for real-time Heart Rate Variability (HRV) stress tracking.
- **Deep IDE Integration:** Docking the 3D avatar directly inside VS Code to detect coding frustration.
- **Computer Vision Posture AI:** Local webcam processing to detect slouching and enforce the 20-20-20 eye rest rule.

---

<div align="center">
  <i>Built with ❤️ for techies who need a break.</i><br><br>
  <img src="https://capsule-render.vercel.app/api?type=waving&color=3B6B5E&height=100&section=footer" width="100%"/>
</div>
