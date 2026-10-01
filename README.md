✨ AI Text Enhancer Pro

AI Text Enhancer Pro is a Chrome Manifest V3 extension that enhances, rewrites, translates, summarizes, and generates text directly inside editable fields on the web.

It adds a floating mode selector and Enhance button near the active text field, supports a keyboard shortcut, and uses Google Gemini as the primary AI provider with OpenRouter as an optional fallback.

«🔑 First-time setup: This extension requires your own AI API key.
You can create a Gemini API key at:
https://aistudio.google.com/apikey

OpenRouter can optionally be configured as a fallback:
https://openrouter.ai/keys

After installing the extension, open its popup, paste your API key, and click Save Keys.»

---

✨ Highlights

- Works with standard inputs, textareas, contenteditable editors, React-based editors, and ProseMirror-style editors.
- Floating draggable toolbar with 17 AI text modes.
- Mode-specific animated loading borders around the active editor while a request is running.
- Separate compact Generating... status loader.
- Gemini as the primary AI provider with automatic OpenRouter fallback.
- Ctrl + Shift + E shortcut on Windows/Linux.
- Command + Shift + E shortcut on macOS.
- Right-click Enhance with AI context-menu action for selected text.
- API keys are entered through the extension popup and stored in Chrome extension storage instead of being hardcoded in the source.
- Manual compatibility testing has covered ChatGPT, Gmail, Facebook comments/posts, Messenger, Gemini, Meta AI, and NotebookLM.

---

🧠 Text Modes

Mode| Purpose
Grammar & Spelling| Correct grammar and spelling while preserving meaning
Nepali Formal| Rewrite text in formal Nepali using Devanagari
Professional| Rewrite in a polished business tone
Creative| Produce more vivid and expressive writing
Image Prompt| Expand an idea into a detailed AI image prompt
Video Prompt| Expand an idea into a detailed AI video prompt
Email| Turn input into a complete professional email
Shorten| Make text concise while retaining key information
Expand| Add useful detail, explanation, and context
Simplify| Rewrite using clearer and easier language
Marketing| Produce persuasive marketing copy
Question| Convert a statement into a natural question
Summary| Condense text into its key points
English → Nepali| Translate English into natural Nepali
Nepali → English| Translate Nepali into natural English
ELI5| Explain a concept in very simple language
General Enhancement| Improve grammar, clarity, readability, and professionalism

Each mode also maps to its own visual loading style, such as Flow, Aurora, Neon, Sweep, Travel, or Quantum.

---

⚙️ How It Works

1. Click or focus an editable text field on a supported webpage.
2. The extension displays a floating toolbar near the active editor.
3. Choose an enhancement mode.
4. Click Enhance or press the keyboard shortcut.
5. A mode-specific animated border appears around the active editor while the AI request is processed.
6. The generated result replaces the original text in the editor.
7. If the primary Gemini request fails and an OpenRouter key is available, the extension automatically attempts OpenRouter.

---

🚀 Installation & First-Time Setup

This project is currently intended for local/unpacked Chrome installation.

Step 1 — Download the Extension

Download or clone this repository.

If you downloaded the project as a ZIP file:

1. Download the ZIP.
2. Extract it to a folder.
3. Make sure the folder containing "manifest.json" is available.

---

Step 2 — Open Chrome Extensions

Open Chrome and go to:

"chrome://extensions"

Then:

1. Enable Developer mode.
2. Click Load unpacked.
3. Select the project folder containing "manifest.json".
4. AI Text Enhancer Pro should now appear in your extensions list.
5. Pin the extension from the Chrome Extensions menu if desired.

After changing source files during development, click Reload on the extension card and refresh any already-open test pages.

---

🔑 API Setup

AI Text Enhancer Pro requires at least one AI provider API key.

The recommended setup is Google Gemini.

OpenRouter can optionally be added as a fallback provider.

---

🟦 Option 1 — Google Gemini API Key

Gemini is used as the primary AI provider.

Get your Gemini API key here:

https://aistudio.google.com/apikey

Setup Steps

1. Open:
   
   https://aistudio.google.com/apikey

2. Sign in with your Google account.

3. Create a Gemini API key.

4. Copy the generated API key.

5. Open the AI Text Enhancer Pro extension from the Chrome toolbar.

6. Find:
   
   Gemini API Key

7. Paste your personal Gemini API key into the field.

8. Click:
   
   💾 Save Keys

The extension can now use Gemini to process your AI enhancement requests.

---

🟠 Option 2 — OpenRouter API Key

OpenRouter can be configured as an optional fallback provider.

Get your OpenRouter API key here:

https://openrouter.ai/keys

Setup Steps

1. Open:
   
   https://openrouter.ai/keys

2. Sign in or create an OpenRouter account.

3. Create an API key.

4. Copy the generated key.

5. Open the AI Text Enhancer Pro extension popup.

6. Find:
   
   OpenRouter API Key (fallback)

7. Paste your OpenRouter API key.

8. Click:
   
   💾 Save Keys

If Gemini fails and a valid OpenRouter key is configured, the extension can automatically attempt the request using OpenRouter.

---

✅ Which API Key Should I Use?

For the simplest setup:

Use Gemini only.

Create your key here:

https://aistudio.google.com/apikey

Then paste it into the extension popup and click Save Keys.

You do not need an OpenRouter key unless you want a fallback provider.

---

⚡ Quick Setup

1. Download AI Text Enhancer Pro

↓

2. Open "chrome://extensions"

↓

3. Enable Developer mode

↓

4. Click Load unpacked

↓

5. Select the extension folder

↓

6. Create a Gemini API key

https://aistudio.google.com/apikey

↓

7. Open the AI Text Enhancer Pro popup

↓

8. Paste your Gemini API key

↓

9. Click Save Keys

↓

10. Start enhancing text ✨

---

🔐 API Key Storage & Security

API keys are entered through the extension popup and stored using:

"chrome.storage.local"

API keys are not included in this repository and should never be hardcoded into the extension source.

Important Security Notes

- Never commit your real API key to GitHub.
- Never paste your personal API key into "background.js".
- Never paste your personal API key into "content.js".
- Never paste your personal API key into "popup.js".
- Do not publish screenshots containing your API key.
- Each user should create and use their own API key.
- Chrome extension local storage should not be treated as a general-purpose encrypted secrets vault.
- Use API keys intended for your own extension usage.
- Review and manage provider quotas, billing, and limits appropriately.

---

⌨️ Keyboard Shortcut

Default shortcut:

Windows / Linux

"Ctrl + Shift + E"

macOS

"Command + Shift + E"

Chrome may leave a suggested shortcut unassigned if it conflicts with another browser, operating-system, or extension shortcut.

Users can inspect or change shortcut assignments at:

"chrome://extensions/shortcuts"

---

🖱️ Context Menu

Select text on a webpage and right-click to use:

✨ Enhance with AI

The currently selected enhancement mode is used for the request.

---

📁 Project Structure

AI-Text-Enhancer-Pro/
├── icons/
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
├── background.js
├── content.js
├── manifest.json
├── popup.html
├── popup.js
├── docs/
│   ├── floating-toolbar.png
│   ├── animated-border.png
│   ├── settings-popup.png
│   └── generating-loader.png
├── styles.css
├── README.md
├── LICENSE
└── .gitignore

---

🧩 Main Files

"background.js"

Handles:

- AI provider API calls
- Gemini → OpenRouter fallback logic
- Context-menu actions
- Keyboard shortcut handling
- Stored settings synchronization

"content.js"

Handles:

- Editable-field detection
- Floating toolbar
- Text extraction and replacement
- Dynamic-page support
- Loading-border behavior

"styles.css"

Handles:

- Generating loader
- Notifications
- Floating interface styling
- Mode-based field-border animations

"popup.html" / "popup.js"

Handles:

- Gemini API-key input
- OpenRouter API-key input
- Saving provider credentials into Chrome extension storage

"manifest.json"

Defines:

- Chrome Manifest V3 configuration
- Permissions
- Host permissions
- Content scripts
- Extension icons
- Keyboard commands

---

🔐 Permissions

The extension currently requests:

Permission| Why it is used
"activeTab"| Interact with the active page when needed
"storage"| Save API keys and the selected mode locally
"scripting"| Insert enhanced selected text for context-menu actions
"contextMenus"| Add the right-click enhancement action

Host permissions are limited to the configured AI provider endpoints:

- "generativelanguage.googleapis.com"
- "openrouter.ai"

The content script is configured for web pages so that the toolbar can detect editable fields across supported sites.

---

🛡️ Privacy Notes

The extension has no custom application backend in this repository.

Text is sent to the configured AI provider only when the user triggers an enhancement action.

API requests are made directly from the extension to the selected provider.

API keys are stored locally in Chrome extension storage and are not hardcoded in the repository.

Provider privacy policies and data-handling terms still apply to text sent to those services.

Do not commit:

- Real API keys
- Passwords
- Access tokens
- Exported browser profiles
- Private credentials
- Other sensitive information

to this repository.

---

🌐 Compatibility

The editor-detection logic supports common web editing patterns including:

- "<input>"
- "<textarea>"
- "contenteditable"
- React-controlled fields
- ProseMirror-style editors
- Dynamically recreated editors in single-page applications
- Editable content inside permitted frames

Manual compatibility testing has covered:

- ChatGPT
- Gmail
- Facebook comments
- Facebook posts
- Messenger
- Gemini
- Meta AI
- NotebookLM

Websites can change their DOM and editor implementations over time.

A site-specific adjustment may occasionally be required after a major website redesign.

---

🖼️ Screenshots

Floating Mode Selector

The floating toolbar appears next to the active editor and provides quick access to all 17 enhancement modes.

"AI Text Enhancer Pro floating mode selector" (docs/floating-toolbar.png)

---

Mode-Based Animated Border

While a request is running, the active editor receives a mode-specific visual loading border.

The example below shows the Marketing mode.

"Marketing mode animated loading border" (docs/animated-border.png)

---

API Settings Popup

Users can configure Gemini as the primary provider and OpenRouter as the optional fallback from the extension popup.

"AI Text Enhancer Pro API settings popup" (docs/settings-popup.png)

---

Generating Indicator

A compact generating indicator is displayed while AI output is being generated.

"AI Text Enhancer Pro generating indicator" (docs/generating-loader.png)

---

🧪 Development Checklist

Before tagging a release or publishing an update:

- Confirm Gemini requests work with a valid key.
- Confirm OpenRouter works directly.
- Confirm Gemini failure falls back to OpenRouter when both keys are configured.
- Test at least one normal input or textarea.
- Test at least one contenteditable editor.
- Test the floating mode selector.
- Test the keyboard shortcut.
- Test the right-click Enhance with AI action.
- Confirm the animated border disappears after successful requests.
- Confirm the animated border disappears after errors.
- Confirm saved API keys load correctly after reopening the popup.
- Confirm no credentials are present in tracked files.
- Confirm no personal API key has accidentally been committed.

---

🛠️ Troubleshooting

Gemini API key missing

Open the AI Text Enhancer Pro popup.

Create a Gemini API key at:

https://aistudio.google.com/apikey

Paste the key into the Gemini API Key field and click Save Keys.

---

No valid API key

Make sure at least one valid provider key has been entered.

Recommended:

Gemini API Key

Optional:

OpenRouter API Key

---

Extension toolbar does not appear

Try:

1. Refresh the webpage.
2. Click inside an editable text field.
3. Reload the extension from "chrome://extensions".
4. Refresh the webpage again.

---

Keyboard shortcut does not work

Open:

"chrome://extensions/shortcuts"

Check whether the AI Text Enhancer Pro shortcut is assigned.

---

Extension stopped working after source-code changes

Open:

"chrome://extensions"

Find AI Text Enhancer Pro.

Click:

Reload

Then refresh any webpages that were already open.

---

⚠️ Limitations

- Protected browser pages such as "chrome://" pages do not allow normal content-script injection.
- Provider availability is controlled by the external AI provider.
- API quotas and rate limits are controlled by the provider.
- Model availability may change over time.
- API pricing or free-tier limits may change according to provider policies.
- Site compatibility may change when websites redesign their editors.
- Some editors may require site-specific handling.
- The project currently requires users to provide their own API key or keys.
- An active internet connection is required for AI processing.

---

🔄 Updating the Extension

When using the unpacked version:

1. Download or pull the latest project files.

2. Replace or update the existing source files.

3. Open:
   
   "chrome://extensions"

4. Find AI Text Enhancer Pro.

5. Click Reload.

6. Refresh any already-open webpages.

Your saved API settings may remain in Chrome extension storage during normal source updates, but removing the extension or clearing its storage may remove saved keys.

---

🤝 Contributing

Contributions, bug reports, compatibility improvements, and feature suggestions are welcome.

Before submitting changes:

- Do not include personal API keys.
- Do not include credentials.
- Test existing enhancement modes.
- Test basic editor compatibility.
- Keep permissions limited to what the extension requires.

---

📄 License

Released under the MIT License.

See "LICENSE" for details.

---

✨ AI Text Enhancer Pro

Enhance, rewrite, translate, summarize, and generate text directly inside your browser using your own AI API key.
