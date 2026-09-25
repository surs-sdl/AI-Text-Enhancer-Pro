// background.js
// AI Text Enhancer Pro
// Handles AI providers, context menu actions,
// keyboard shortcuts, and extension settings.

let geminiApiKey = '';
let openrouterApiKey = '';


/* =========================================================
   SETTINGS
========================================================= */

async function loadSettings() {
  try {
    const settings =
      await chrome.storage.local.get([
        'geminiApiKey',
        'openrouterApiKey'
      ]);

    geminiApiKey =
      settings.geminiApiKey || '';

    openrouterApiKey =
      settings.openrouterApiKey || '';

  } catch (error) {
    console.error(
      'Failed to load settings:',
      error
    );
  }
}

loadSettings();


/*
  Keep the in-memory API keys
  synchronized whenever the user
  changes them from the popup.
*/
chrome.storage.onChanged.addListener(
  (changes, areaName) => {
    if (areaName !== 'local') {
      return;
    }

    if (changes.geminiApiKey) {
      geminiApiKey =
        changes.geminiApiKey.newValue || '';
    }

    if (changes.openrouterApiKey) {
      openrouterApiKey =
        changes.openrouterApiKey.newValue || '';
    }
  }
);


/* =========================================================
   SYSTEM PROMPTS
========================================================= */

function getSystemPrompt(mode) {
  const prompts = {

    grammar:
      'Fix grammar and spelling errors. Do NOT change the style or meaning. Return ONLY the corrected text, no extra comments.',

    'nepali-formal':
      'Write in formal Nepali (Devanagari). Use respectful pronouns and proper honorifics. Suitable for official letters or documents. Return ONLY the formal Nepali text.',

    professional:
      'Rewrite in a formal, professional business tone. Use polite language and standard formatting. Return ONLY the professional text.',

    creative:
      'Write creatively. Use vivid imagery, metaphors, and engaging language. Write as much as needed to complete the idea. Return ONLY the creative output.',

    image:
      'You are an expert prompt engineer for AI image generation. Expand the user input into a highly detailed descriptive prompt. Include style, lighting, composition, mood, colors, camera details where appropriate, environment, textures, and imaginative details. Return ONLY the prompt.',

    video:
      'You are an expert prompt engineer for AI video generation. Expand the user input into a detailed video prompt. Describe the scene, subject, camera movement, lighting, action, environment, atmosphere, pacing, and cinematic details. Return ONLY the prompt.',

    email:
      'Write a complete professional email. Include a subject line, greeting, body, and closing. Return ONLY the email content.',

    shorten:
      'Make the text very concise. Remove unnecessary words while preserving the key information and meaning. Return ONLY the shortened text.',

    expand:
      'Expand the text with useful details, explanations, and examples while preserving the original intent. Return ONLY the expanded text.',

    simplify:
      'Rewrite the text in simple, easy-to-understand English. Use clear wording, short sentences, and basic vocabulary. Return ONLY the simplified text.',

    marketing:
      'Rewrite the text as persuasive and compelling marketing copy. Use clear benefits, engaging language, and an appropriate call to action. Return ONLY the marketing copy.',

    question:
      'Turn the statement into a natural question while preserving its original meaning. Return ONLY the question.',

    summary:
      'Summarize the key points clearly and concisely. Preserve the important information. Return ONLY the summary.',

    'translate-ne':
      'Translate the English text into natural and correct Nepali using Devanagari script. Return ONLY the translation.',

    'translate-en':
      'Translate the Nepali text into natural and correct English. Return ONLY the translation.',

    eli5:
      'Explain the concept as if explaining it to a 5-year-old. Use very simple words, short sentences, and easy analogies. Return ONLY the explanation.',

    enhance:
      'Improve the text by fixing grammar, clarity, readability, and professionalism while preserving the original meaning. Return ONLY the improved text.'
  };

  return (
    prompts[mode] ||
    prompts.enhance
  );
}


/* =========================================================
   TOKEN LIMITS
========================================================= */

function getMaxTokens(mode) {
  const longModes = [
    'image',
    'video',
    'expand',
    'creative'
  ];

  return longModes.includes(mode)
    ? 8000
    : 2000;
}


/* =========================================================
   GEMINI API
========================================================= */

async function callGeminiAPI(
  text,
  mode
) {
  if (!geminiApiKey) {
    throw new Error(
      'Gemini API key missing'
    );
  }


  const systemPrompt =
    getSystemPrompt(mode);

  const maxTokens =
    getMaxTokens(mode);


  /*
    Current stable Gemini Flash model.
  */
  const model =
    'gemini-3.8-flash';


  const response =
    await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json',

          'x-goog-api-key':
            geminiApiKey
        },

        body: JSON.stringify({
          contents: [
            {
              role: 'user',

              parts: [
                {
                  text:
                    `${systemPrompt}\n\n` +
                    `User input:\n${text}`
                }
              ]
            }
          ],

          generationConfig: {
            maxOutputTokens:
              maxTokens,

            temperature:
              0.8
          }
        })
      }
    );


  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `Gemini API Error (${response.status}): ` +
      errorText.substring(
        0,
        250
      )
    );
  }


  const data =
    await response.json();


  const enhanced =
    data.candidates?.[0]
      ?.content?.parts
      ?.map(
        (part) =>
          part.text || ''
      )
      .join('')
      .trim();


  if (!enhanced) {
    throw new Error(
      'No response from Gemini'
    );
  }


  return enhanced;
}


/* =========================================================
   OPENROUTER API
========================================================= */

async function callOpenRouterAPI(
  text,
  mode
) {
  if (!openrouterApiKey) {
    throw new Error(
      'OpenRouter API key missing'
    );
  }


  const systemPrompt =
    getSystemPrompt(mode);

  const maxTokens =
    getMaxTokens(mode);


  const response =
    await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json',

          'Authorization':
            `Bearer ${openrouterApiKey}`,

          'X-Title':
            'AI Text Enhancer Pro'
        },

        body: JSON.stringify({
          model:
            'openrouter/free',

          messages: [
            {
              role:
                'system',

              content:
                systemPrompt
            },

            {
              role:
                'user',

              content:
                text
            }
          ],

          temperature:
            0.8,

          max_tokens:
            maxTokens
        })
      }
    );


  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `OpenRouter Error (${response.status}): ` +
      errorText.substring(
        0,
        250
      )
    );
  }


  const data =
    await response.json();


  const enhanced =
    data.choices?.[0]
      ?.message
      ?.content
      ?.trim();


  if (!enhanced) {
    throw new Error(
      'No response from OpenRouter'
    );
  }


  return enhanced;
}


/* =========================================================
   AI ENHANCEMENT PIPELINE
========================================================= */

async function enhanceText(
  text,
  mode
) {
  if (
    !text ||
    !text.trim()
  ) {
    return text;
  }


  /*
    Gemini is the primary provider.

    If Gemini fails and an OpenRouter
    key is available, OpenRouter is
    automatically used as fallback.
  */

  if (geminiApiKey) {
    try {
      return await callGeminiAPI(
        text,
        mode
      );

    } catch (error) {
      console.warn(
        'Gemini failed:',
        error.message
      );
    }
  }


  if (openrouterApiKey) {
    try {
      return await callOpenRouterAPI(
        text,
        mode
      );

    } catch (error) {
      console.warn(
        'OpenRouter failed:',
        error.message
      );
    }
  }


  /*
    No provider configured.
  */

  if (
    !geminiApiKey &&
    !openrouterApiKey
  ) {
    throw new Error(
      'No API key configured. Open the extension popup and add a Gemini or OpenRouter API key.'
    );
  }


  /*
    At least one provider existed,
    but all available providers failed.
  */

  throw new Error(
    'AI request failed. Check your internet connection, API key, quota, or provider availability.'
  );
}


/* =========================================================
   MESSAGES FROM CONTENT SCRIPT
========================================================= */

chrome.runtime.onMessage.addListener(
  (
    request,
    sender,
    sendResponse
  ) => {

    if (
      request.action !==
      'enhanceText'
    ) {
      return;
    }


    enhanceText(
      request.text,
      request.mode ||
        'enhance'
    )
      .then(
        (enhanced) => {
          sendResponse({
            enhanced
          });
        }
      )

      .catch(
        (error) => {
          console.error(
            'Enhancement error:',
            error
          );

          sendResponse({
            error:
              error.message
          });
        }
      );


    /*
      Required because sendResponse()
      is called asynchronously.
    */
    return true;
  }
);


/* =========================================================
   CONTEXT MENU CREATION
========================================================= */

chrome.runtime.onInstalled.addListener(
  () => {

    chrome.contextMenus.removeAll(
      () => {

        chrome.contextMenus.create({
          id:
            'enhance',

          title:
            '✨ Enhance with AI',

          contexts: [
            'selection'
          ]
        });

      }
    );

  }
);


/* =========================================================
   CONTEXT MENU ACTION
========================================================= */

chrome.contextMenus.onClicked.addListener(
  async (
    info,
    tab
  ) => {

    if (
      info.menuItemId !==
      'enhance'
    ) {
      return;
    }


    if (
      !info.selectionText ||
      !tab?.id
    ) {
      return;
    }


    try {

      const {
        selectedMode
      } =
        await chrome.storage.local.get(
          'selectedMode'
        );


      const mode =
        selectedMode ||
        'enhance';


      const enhanced =
        await enhanceText(
          info.selectionText,
          mode
        );


      /*
        Insert the generated result
        back into the currently active
        editable field.
      */

      await chrome.scripting.executeScript({
        target: {
          tabId:
            tab.id
        },

        func: (text) => {

          const active =
            document.activeElement;


          /*
            Standard input / textarea.
          */

          if (
            active &&
            (
              active.tagName ===
                'TEXTAREA' ||
              active.tagName ===
                'INPUT'
            )
          ) {

            const start =
              active.selectionStart ??
              active.value.length;


            const end =
              active.selectionEnd ??
              start;


            active.setRangeText(
              text,
              start,
              end,
              'end'
            );


            active.dispatchEvent(
              new Event(
                'input',
                {
                  bubbles:
                    true
                }
              )
            );


            return;
          }


          /*
            contenteditable fallback.
          */

          document.execCommand(
            'insertText',
            false,
            text
          );
        },

        args: [
          enhanced
        ]
      });

    } catch (error) {

      console.error(
        'Context menu enhancement failed:',
        error
      );

    }
  }
);


/* =========================================================
   KEYBOARD SHORTCUT
========================================================= */

chrome.commands.onCommand.addListener(
  async (command) => {

    if (
      command !==
      'enhance-text'
    ) {
      return;
    }


    try {

      const [tab] =
        await chrome.tabs.query({
          active:
            true,

          currentWindow:
            true
        });


      if (!tab?.id) {
        return;
      }


      /*
        Tell content.js to enhance the
        currently active text field.
      */

      chrome.tabs.sendMessage(
        tab.id,

        {
          action:
            'triggerEnhance'
        },

        () => {

          /*
            chrome:// pages, the Chrome
            Web Store and some protected
            pages do not allow content
            scripts.

            Ignore that expected error.
          */

          void chrome.runtime.lastError;
        }
      );

    } catch (error) {

      console.warn(
        'Shortcut failed:',
        error
      );

    }
  }
);


/* =========================================================
   SERVICE WORKER READY
========================================================= */

console.log(
  '🚀 AI Text Enhancer Pro background service worker loaded'
);