# BiteFlow

<p align="center">
  <a href="https://github.com/Jipung7/biteflow/releases/latest"><img src="https://img.shields.io/badge/Release-v1.0.0-6366f1?style=flat-square" alt="Release"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-emerald?style=flat-square" alt="MIT License"></a>
  <a href="https://github.com/Jipung7"><img src="https://img.shields.io/badge/Author-Jipung-0078d4?style=flat-square&logo=github" alt="Author"></a>
  <a href="https://ko-fi.com/jipung"><img src="https://img.shields.io/badge/Ko--fi-Tip_Coffee-ff5e5b?style=flat-square&logo=ko-fi&logoColor=white" alt="Ko-fi"></a>
  <a href="https://saweria.co/jipung"><img src="https://img.shields.io/badge/Saweria-Traktir_Kopi-faae2b?style=flat-square" alt="Saweria"></a>
  <a href="https://github.com/Jipung7/biteflow/discussions"><img src="https://img.shields.io/badge/Community-Discussions-8b5cf6?style=flat-square&logo=github" alt="Discussions"></a>
</p>

Modern asynchronous documentation tool: Transform 30–60 second screen recordings into bite-sized interactive video guides with dynamic auto-zoom, time-ranged privacy blur, and a standalone web player.

---

## Problem & Solution

- **Problem:**
  - Synchronous meetings (Zoom / Google Meet) are often called just to answer a 1-minute procedural question.
  - Raw screen recording videos (Loom / OBS) are tedious to watch and hard to read on small UI elements.
  - Manual step-by-step screenshots (Scribe / manual capture) are time-consuming and exhausting to assemble.
- **BiteFlow Solution:**
  - Record active browser workflows in 30–60 seconds.
  - BiteFlow automatically captures click events, generating a **Dynamic Auto-Zoom Video** synchronized with **Numbered Milestone Step Cards**.
  - Recipients can choose: watch the concise video or read through the step cards in 10 seconds.

---

## Key Features

1. **Persistent Tab Recording (Manifest V3 Offscreen + TabCapture)**:
   - Recording survives intra-tab navigations without interruptions.
   - Eliminates confusing OS window picker dialogs.
2. **Dynamic Coordinate Auto-Zoom**:
   - The player smoothly scales the viewport 1.6x toward cursor click coordinates during interaction timestamps.
3. **Integrated Step Editor**:
   - Inline editing for step titles and descriptions.
   - Reorder steps with up/down controls ([▲]/[▼]) and add new steps at current playback timestamps.
4. **Time-Ranged Privacy Blur**:
   - Draw blur boxes directly over sensitive screen areas.
   - Configure start (`startSec`) and end (`endSec`) timestamps; blur automatically hides when sensitive elements leave the screen.
5. **Permanent Canvas Pixel Burn-in**:
   - Destroys underlying pixels before sharing publicly, preventing secrets from being revealed via browser inspect element or raw video downloads.
6. **Self-Contained Export & 7-Day Ephemeral Web Player**:
   - Export single-file `.html` offline bundles that run on mobile or desktop without internet access.
   - Two-column responsive public web viewer with a transparent 7-day retention countdown banner.

---

## Directory Structure

```text
biteflow/
├── .github/
│   ├── workflows/
│   │   └── release.yml          # CI automated syntax validation & packaging
│   └── FUNDING.yml              # GitHub sponsorship & tipping channels
├── extension/                   # Manifest V3 Chrome Extension source
│   ├── manifest.json
│   ├── background/service-worker.js
│   ├── content/
│   ├── offscreen/
│   ├── popup/
│   ├── preview/
│   └── web/                     # Local integrated player
├── web/                         # Public Web Player source (Cloudflare Pages ready)
│   ├── css/
│   ├── demo/
│   ├── js/
│   ├── v/
│   └── index.html
├── docs/                        # Specifications & engineering standards
│   ├── 00_ENGINEERING_STANDARDS.md
│   ├── 01_PRODUCT_SPEC.md
│   ├── 02_TECH_STACK.md
│   ├── 03_ROADMAP_WORKFLOW.md
│   └── 04_UI_WIREFRAME.md
├── scripts/
│   ├── check-syntax.js          # Zero-dependency JavaScript syntax checker
│   ├── build-zip.js             # Automated extension ZIP packaging script
│   └── create-icons.js          # PNG icon generator
├── CONTRIBUTING.md
├── LICENSE
├── package.json
└── README.md
```

---

## Quick Start (Developer Mode)

Install BiteFlow in Google Chrome, Microsoft Edge, Brave, or any Chromium-based browser for free:

1. Clone or download this repository:
   ```bash
   git clone https://github.com/Jipung7/biteflow.git
   ```
2. Navigate to your browser's extensions page:
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
3. Enable **Developer mode** toggle in the top-right corner.
4. Click **Load unpacked** and select the `extension/` directory.
5. The BiteFlow icon will appear in your browser toolbar, ready to record.

---

## Verification & Build Tooling

This project requires zero external runtime dependencies. All tooling runs directly via standard Node.js:

```bash
# Validate JavaScript syntax across all files
node scripts/check-syntax.js

# Build release ZIP bundle for distribution
node scripts/build-zip.js
```

The packaged archive will be generated at `dist/biteflow-extension-v1.0.0.zip`.

---

## Feedback & Contributions

Found a bug or have an idea?
- Open an issue on [GitHub Issues](https://github.com/Jipung7/biteflow/issues).
- Join the conversation on [GitHub Discussions](https://github.com/Jipung7/biteflow/discussions).

---

## Support & Buy Me a Coffee

If this project made your workflow smoother or saved you time, consider supporting its ongoing development:

- Tip a Coffee (Global): Support maintenance via [Ko-fi](https://ko-fi.com/jipung) (PayPal / Credit Cards).
- Local Support (Indonesia): Tip via [Saweria](https://saweria.co/jipung) or [SociaBuzz](https://sociabuzz.com/jipung) (QRIS, GoPay, OVO, DANA).
- Star this repository: Free and helps others discover the project on GitHub.

---

## Author & License

Crafted with care by **[Jipung](https://github.com/Jipung7)** (*Lone Steed Studio*).

This project is open-source and available under the [MIT License](LICENSE).
