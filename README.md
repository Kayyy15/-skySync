<div align="center">

# 🌦️ $kySync

### AI-Based Forecast Bust Detection for Medium-Range Weather Forecasts

*Smart India Hackathon 2026 · Problem Statement 26079 · Ministry of Earth Sciences / NCMRWF*

[![Made with HTML/CSS/JS](https://img.shields.io/badge/stack-HTML%20%2F%20CSS%20%2F%20JS-8E1616?style=for-the-badge)](#tech-stack)
[![Data: Open-Meteo](https://img.shields.io/badge/data-Open--Meteo-D84040?style=for-the-badge)](https://open-meteo.com/)
[![Status](https://img.shields.io/badge/status-hackathon%20build-1D1616?style=for-the-badge)](#roadmap)
[![License](https://img.shields.io/badge/license-MIT-EEEEEE?style=for-the-badge)](#license)

<br>

*A live confidence map of India that tells you not just what tomorrow's weather will be —*
*but how much to trust the forecast in the first place.*

</div>

---

## 📖 Table of Contents

- [The Problem](#-the-problem)
- [What SkySync Does](#-what-skysync-does)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Live Demo](#-live-demo)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [How the Bust-Probability Engine Works](#-how-the-bust-probability-engine-works)
- [Problem Statement Mapping](#-problem-statement-mapping)
- [Roadmap](#-roadmap)
- [Team](#-team)
- [License](#-license)

---

## 🎯 The Problem

Medium-range weather forecasts (Day 3–10) sometimes **"bust"** — diverge sharply from what actually happens — and existing systems rarely tell you *in advance* how much to trust a given forecast for a given region and lead time. PS 26079 asks for a prototype that flags where and when a forecast is at high risk of busting, and explains *why*.

## ✨ What SkySync Does

SkySync ingests real multi-model forecast, ensemble, and historical observation data, computes a **forecast bust probability** per state and lead time, and surfaces it through an interactive map — plus lets anyone upload their own weather data and get the same analysis, live.

---

## 🚀 Features

| | |
|---|---|
| 🗺️ **Interactive India Map** | Click any state to see a Day 1–10 confidence breakdown |
| 🎚️ **Day Scrubber** | Drag through Day 1 → Day 10 and watch the entire map recolor live |
| 📊 **Real Bust-Probability Scoring** | Computed from actual ensemble spread + multi-model disagreement, not fabricated numbers |
| 📁 **Bring Your Own Data** | Upload a CSV/JSON of your own readings and get instant error stats + bust probability |
| 🧠 **Explainable Output** | Every prediction comes with a plain-language reason ("high ensemble spread in rainfall...") |
| 💬 **SkySync Assistant** | Ask practical questions — "should I go outside today?", "should I irrigate?", "why is Odisha low-confidence?" |
| 📰 **News Tab** | Curated, always-current links to official IMD/PIB/NCMRWF advisories |
| 🎨 **Designed, Not Templated** | Custom palette, asymmetric layout, and motion — built to not look AI-generated |

---

## 🛠️ Tech Stack

<div align="center">

![HTML5](https://img.shields.io/badge/HTML5-1D1616?style=flat-square&logo=html5&logoColor=EEEEEE)
![CSS3](https://img.shields.io/badge/CSS3-1D1616?style=flat-square&logo=css3&logoColor=EEEEEE)
![JavaScript](https://img.shields.io/badge/JavaScript-1D1616?style=flat-square&logo=javascript&logoColor=EEEEEE)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-1D1616?style=flat-square&logo=tailwindcss&logoColor=D84040)
![D3.js](https://img.shields.io/badge/D3.js-1D1616?style=flat-square&logo=d3.js&logoColor=EEEEEE)
![Chart.js](https://img.shields.io/badge/Chart.js-1D1616?style=flat-square&logo=chart.js&logoColor=EEEEEE)
![GSAP](https://img.shields.io/badge/GSAP-1D1616?style=flat-square&logo=greensock&logoColor=88CE02)

</div>

No build step. No backend. No npm. Everything runs as static HTML/CSS/JS, loading libraries from CDNs and calling free public weather APIs directly from the browser.

- **UI:** HTML5, CSS3 (custom design tokens), Tailwind CSS (Play CDN)
- **Motion:** GSAP + ScrollTrigger
- **Map:** D3.js + topojson-client, rendering India state boundaries as interactive SVG
- **Charts:** Chart.js
- **CSV parsing:** PapaParse
- **Data sources:** [Open-Meteo](https://open-meteo.com/) Forecast, Ensemble, Historical Archive, and Geocoding APIs (free, no key required)
- **Hosting:** GitHub Pages / Netlify (static, zero-config)

---

## 🌐 Live Demo

**[👉 View SkySync live](#)** <!-- EDIT: replace with your GitHub Pages / Netlify URL -->

> First load may take a moment while live weather data is fetched — a cached snapshot renders instantly so the map is never empty.

---

## 🏁 Getting Started

No installation required.

```bash
git clone https://github.com/YOUR-USERNAME/skysync.git
cd skysync
```

Then just open `index.html` in your browser — or, for auto-reload while editing, right-click it in VS Code and choose **"Open with Live Server"**.

That's it. No `npm install`, no `pip install`, nothing to build.

---

## 📂 Project Structure

```
skysync/
├── index.html              # Main app shell, all sections
├── style.css                # Design tokens, custom animations
├── script.js                 # App state, onboarding, tab switching
├── js/
│   ├── map.js                  # D3/topojson India map + day scrubber
│   ├── bust-engine.js          # Bust-probability scoring pipeline
│   ├── upload.js               # CSV/JSON upload + results panel
│   ├── assistant.js            # SkySync Assistant logic
│   └── news.js                 # News tab
├── data/
│   ├── india-states.json       # Fallback state boundary GeoJSON
│   └── baseline-cache.json     # Pre-fetched real weather snapshot
├── assets/                   # Icons, textures, favicon, OG image
└── README.md
```

---

## 🧮 How the Bust-Probability Engine Works

For every station, date, and lead time, SkySync computes:

| Signal | What it captures |
|---|---|
| **Ensemble spread** | Standard deviation across ensemble forecast members — the real meteorological proxy for uncertainty |
| **Model disagreement** | Variance across GFS / ICON / ECMWF point forecasts |
| **Historical error percentile** | Where today's predicted deviation sits within that station's own past error distribution |
| **Synoptic flags** | Heavy rainfall / rapid pressure change indicators |

These combine into a transparent, weighted score — not a black box — so every prediction ships with a plain-language reason, e.g.:

> *"Confidence is low mainly due to high ensemble spread in rainfall, consistent with an active low-pressure system."*

---

## 🗺️ Problem Statement Mapping

| Expected Outcome (PS 26079) | Where it lives in SkySync |
|---|---|
| Forecast confidence map | Main India map |
| Region-wise Day 1–10 confidence | State detail panel + day scrubber |
| Forecast bust probability | Bust-probability engine |
| Error-prone area detection | Stats leaderboard |
| Explainable output | Top-factor explanation on every prediction |
| Prototype dashboard | The full app, running client-side |

---

## 🔭 Roadmap

- [ ] Replace the formula-based scorer with a trained classifier (RandomForest/GBM) once a larger labeled bust history is collected
- [ ] Live news feed via a lightweight backend proxy (currently curated/static for demo reliability)
- [ ] Free-text assistant powered by an LLM API, layered on top of the current rule-based version
- [ ] Per-district (not just per-state) granularity on the map

---

**Mentors:** Sri. Rohit Mishra · Sri. Abdullah Suhail Ayyub Zinjani · Sri. K Suresh — SAC/ISRO

---

## 📄 License

MIT — free to use, modify, and build on.

<div align="center">

**Built for Smart India Hackathon 2026** 🇮🇳

</div>
