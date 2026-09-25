// content.js
// AI Text Enhancer Pro
//
// Supports:
// - Normal input / textarea
// - contenteditable editors
// - React-based editors
// - ProseMirror editors
// - ChatGPT prompt editor
// - Facebook / Messenger
// - Gemini
// - Meta AI
// - NotebookLM
// - Gmail
// - Ctrl + Shift + E shortcut
// - Mode-based animated field border
// - Corner generating loader

let dragButton = null;
let modeSelectElement = null;

let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;

let savedLeft = null;
let savedTop = null;

let currentMode = 'enhance';

let activeInputElement = null;

let activeFieldBorderLoader = null;


/* =========================================================
   MODE STORAGE
========================================================= */

async function loadMode() {
  try {
    const { selectedMode } =
      await chrome.storage.local.get(
        'selectedMode'
      );

    if (selectedMode) {
      currentMode = selectedMode;

      if (modeSelectElement) {
        modeSelectElement.value =
          selectedMode;
      }
    }
  } catch (error) {
    console.warn(
      'Could not load selected mode:',
      error
    );
  }
}

loadMode();


/* =========================================================
   CHATGPT DETECTION
========================================================= */

function isChatGPT() {
  return (
    location.hostname ===
      'chatgpt.com' ||
    location.hostname ===
      'www.chatgpt.com'
  );
}


function getChatGPTEditor() {
  if (!isChatGPT()) {
    return null;
  }

  const selectors = [
    '#prompt-textarea',
    '#prompt-textarea[contenteditable="true"]',
    '#prompt-textarea[contenteditable="plaintext-only"]',
    'div.ProseMirror#prompt-textarea',
    'div[contenteditable="true"].ProseMirror'
  ];

  for (const selector of selectors) {
    const elements =
      document.querySelectorAll(
        selector
      );

    for (const element of elements) {
      const rect =
        element.getBoundingClientRect();

      const style =
        window.getComputedStyle(
          element
        );

      const visible =
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        rect.width > 0 &&
        rect.height > 0;

      if (visible) {
        return element;
      }
    }
  }

  return null;
}


function isSelectionInside(element) {
  if (!element) {
    return false;
  }

  const selection =
    window.getSelection();

  if (
    !selection ||
    selection.rangeCount === 0
  ) {
    return false;
  }

  let node =
    selection.anchorNode;

  if (!node) {
    return false;
  }

  if (
    node.nodeType ===
    Node.TEXT_NODE
  ) {
    node =
      node.parentElement;
  }

  if (!node) {
    return false;
  }

  return (
    node === element ||
    element.contains(node)
  );
}


/* =========================================================
   STANDARD INPUT DETECTION
========================================================= */

function isStandardInput(element) {
  if (
    !element ||
    element.nodeType !==
      Node.ELEMENT_NODE
  ) {
    return false;
  }

  const tag =
    element.tagName
      ?.toLowerCase();

  if (tag === 'textarea') {
    return (
      !element.disabled &&
      !element.readOnly
    );
  }

  if (tag === 'input') {
    const type =
      (
        element.type ||
        'text'
      ).toLowerCase();

    const allowedTypes = [
      'text',
      'email',
      'search',
      'url',
      'tel'
    ];

    return (
      allowedTypes.includes(type) &&
      !element.disabled &&
      !element.readOnly
    );
  }

  return false;
}


/* =========================================================
   CONTENTEDITABLE DETECTION
========================================================= */

function isContentEditableElement(
  element
) {
  if (
    !element ||
    element.nodeType !==
      Node.ELEMENT_NODE
  ) {
    return false;
  }

  if (
    element.isContentEditable
  ) {
    return true;
  }

  const contentEditable =
    element.getAttribute?.(
      'contenteditable'
    );

  if (
    contentEditable === '' ||
    contentEditable === 'true' ||
    contentEditable ===
      'plaintext-only'
  ) {
    return true;
  }

  if (
    element.getAttribute?.(
      'role'
    ) === 'textbox'
  ) {
    return true;
  }

  return false;
}


function findContentEditableRoot(
  element
) {
  if (!element) {
    return null;
  }

  /*
    ChatGPT must always use its
    real #prompt-textarea editor.
  */

  const chatGPTEditor =
    getChatGPTEditor();

  if (
    chatGPTEditor &&
    (
      element ===
        chatGPTEditor ||
      chatGPTEditor.contains(
        element
      )
    )
  ) {
    return chatGPTEditor;
  }

  let current = element;
  let best = element;

  while (
    current &&
    current !== document.body &&
    current !==
      document.documentElement
  ) {
    if (
      isContentEditableElement(
        current
      )
    ) {
      best = current;

      current =
        current.parentElement;

      continue;
    }

    break;
  }

  return best;
}


/* =========================================================
   FIND EDITABLE ELEMENT
========================================================= */

function findEditableElement(
  startElement
) {

  /* -------------------------------------------------------
     ChatGPT special handling
  ------------------------------------------------------- */

  const chatGPTEditor =
    getChatGPTEditor();

  if (chatGPTEditor) {
    let target =
      startElement;

    if (
      target?.nodeType ===
      Node.TEXT_NODE
    ) {
      target =
        target.parentElement;
    }

    if (
      target &&
      (
        target ===
          chatGPTEditor ||
        chatGPTEditor.contains(
          target
        )
      )
    ) {
      return chatGPTEditor;
    }

    const active =
      document.activeElement;

    if (
      active &&
      (
        active ===
          chatGPTEditor ||
        chatGPTEditor.contains(
          active
        )
      )
    ) {
      return chatGPTEditor;
    }

    if (
      isSelectionInside(
        chatGPTEditor
      )
    ) {
      return chatGPTEditor;
    }
  }


  /* -------------------------------------------------------
     Generic handling
  ------------------------------------------------------- */

  if (!startElement) {
    return null;
  }

  let element =
    startElement;

  if (
    element.nodeType ===
    Node.TEXT_NODE
  ) {
    element =
      element.parentElement;
  }

  if (
    !element ||
    element.nodeType !==
      Node.ELEMENT_NODE
  ) {
    return null;
  }


  if (
    isStandardInput(
      element
    )
  ) {
    return element;
  }


  if (
    isContentEditableElement(
      element
    )
  ) {
    return findContentEditableRoot(
      element
    );
  }


  const parentEditable =
    element.closest?.(`
      textarea,
      input[type="text"],
      input[type="email"],
      input[type="search"],
      input[type="url"],
      input[type="tel"],
      [contenteditable="true"],
      [contenteditable=""],
      [contenteditable="plaintext-only"],
      [role="textbox"]
    `);

  if (parentEditable) {
    if (
      isStandardInput(
        parentEditable
      )
    ) {
      return parentEditable;
    }

    return findContentEditableRoot(
      parentEditable
    );
  }


  /*
    Selection fallback
  */

  const selection =
    window.getSelection?.();

  if (
    selection &&
    selection.rangeCount > 0
  ) {
    let node =
      selection.anchorNode;

    if (
      node?.nodeType ===
      Node.TEXT_NODE
    ) {
      node =
        node.parentElement;
    }

    if (
      node?.nodeType ===
      Node.ELEMENT_NODE
    ) {
      if (
        isContentEditableElement(
          node
        )
      ) {
        return findContentEditableRoot(
          node
        );
      }

      const selectionEditable =
        node.closest?.(`
          [contenteditable="true"],
          [contenteditable=""],
          [contenteditable="plaintext-only"],
          [role="textbox"]
        `);

      if (
        selectionEditable
      ) {
        return findContentEditableRoot(
          selectionEditable
        );
      }
    }
  }

  return null;
}


/* =========================================================
   GET TEXT
========================================================= */

function getInputText(element) {
  if (!element) {
    return '';
  }

  if (
    element.tagName ===
      'TEXTAREA' ||
    element.tagName ===
      'INPUT'
  ) {
    return (
      element.value || ''
    );
  }

  if (
    element.isContentEditable ||
    element.getAttribute?.(
      'role'
    ) === 'textbox' ||
    element.getAttribute?.(
      'contenteditable'
    )
  ) {
    return (
      element.innerText ||
      element.textContent ||
      ''
    );
  }

  return '';
}


/* =========================================================
   STANDARD INPUT TEXT REPLACEMENT
========================================================= */

function setNativeInputValue(
  element,
  value
) {
  const tag =
    element.tagName
      ?.toLowerCase();

  let prototype;

  if (tag === 'textarea') {
    prototype =
      HTMLTextAreaElement
        .prototype;
  } else {
    prototype =
      HTMLInputElement
        .prototype;
  }

  const descriptor =
    Object.getOwnPropertyDescriptor(
      prototype,
      'value'
    );

  if (
    descriptor?.set
  ) {
    descriptor.set.call(
      element,
      value
    );
  } else {
    element.value = value;
  }

  element.dispatchEvent(
    new InputEvent(
      'input',
      {
        bubbles: true,
        composed: true,
        inputType:
          'insertText',
        data: value
      }
    )
  );

  element.dispatchEvent(
    new Event(
      'change',
      {
        bubbles: true,
        composed: true
      }
    )
  );
}


/* =========================================================
   CONTENTEDITABLE TEXT REPLACEMENT
========================================================= */

function selectAllEditorContent(
  element
) {
  const selection =
    window.getSelection();

  const range =
    document.createRange();

  range.selectNodeContents(
    element
  );

  selection.removeAllRanges();
  selection.addRange(
    range
  );

  return selection;
}


function putCursorAtEnd(element) {
  try {
    const selection =
      window.getSelection();

    const range =
      document.createRange();

    range.selectNodeContents(
      element
    );

    range.collapse(false);

    selection.removeAllRanges();

    selection.addRange(
      range
    );
  } catch (error) {
    console.warn(
      'Could not move cursor:',
      error
    );
  }
}


function setContentEditableText(
  element,
  text
) {
  if (!element) {
    return;
  }

  element.focus();

  try {
    selectAllEditorContent(
      element
    );

    let inserted = false;


    /*
      Primary method.
      Works well on many
      ProseMirror / React editors.
    */

    try {
      inserted =
        document.execCommand(
          'insertText',
          false,
          text
        );
    } catch (error) {
      console.warn(
        'insertText failed:',
        error
      );
    }


    /*
      Second fallback.
    */

    if (!inserted) {
      try {
        document.execCommand(
          'delete',
          false
        );

        inserted =
          document.execCommand(
            'insertText',
            false,
            text
          );
      } catch (error) {
        console.warn(
          'execCommand fallback failed:',
          error
        );
      }
    }


    /*
      Final DOM fallback.
    */

    if (!inserted) {
      element.replaceChildren();

      const lines =
        text.split('\n');

      lines.forEach(
        (line) => {
          const paragraph =
            document.createElement(
              'p'
            );

          if (
            line.length > 0
          ) {
            paragraph.textContent =
              line;
          } else {
            paragraph.appendChild(
              document.createElement(
                'br'
              )
            );
          }

          element.appendChild(
            paragraph
          );
        }
      );

      element.dispatchEvent(
        new InputEvent(
          'input',
          {
            bubbles: true,
            composed: true,
            inputType:
              'insertText',
            data: text
          }
        )
      );
    }


    element.dispatchEvent(
      new Event(
        'change',
        {
          bubbles: true,
          composed: true
        }
      )
    );

    putCursorAtEnd(
      element
    );

    element.focus();

  } catch (error) {
    console.error(
      'Failed to replace editor text:',
      error
    );

    element.textContent =
      text;

    element.dispatchEvent(
      new Event(
        'input',
        {
          bubbles: true,
          composed: true
        }
      )
    );
  }
}


function setInputText(
  element,
  text
) {
  if (!element) {
    return;
  }

  if (
    element.tagName ===
      'TEXTAREA' ||
    element.tagName ===
      'INPUT'
  ) {
    setNativeInputValue(
      element,
      text
    );

    return;
  }

  setContentEditableText(
    element,
    text
  );
}


/* =========================================================
   CREATE FLOATING BUTTON
========================================================= */

function createDraggableButton() {
  if (dragButton) {
    return;
  }

  const container =
    document.createElement(
      'div'
    );

  container.id =
    'ai-enhance-btn-drag';

  container.style.cssText = `
    position: fixed;
    display: none;
    align-items: center;
    gap: 8px;

    background:
      linear-gradient(
        135deg,
        #667eea,
        #764ba2
      );

    border-radius: 40px;

    padding: 6px 12px;

    z-index: 2147483646;

    box-shadow:
      0 4px 12px
      rgba(0,0,0,0.25);

    backdrop-filter:
      blur(4px);

    font-family:
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;

    user-select: none;

    cursor: move;
  `;


  /* -------------------------------------------------------
     Mode selector
  ------------------------------------------------------- */

  const select =
    document.createElement(
      'select'
    );

  modeSelectElement =
    select;

  select.style.cssText = `
    background: white;

    border:
      1px solid #ccc;

    border-radius: 30px;

    padding: 5px 10px;

    font-size: 12px;
    font-weight: 500;

    color: #333;

    cursor: pointer;

    outline: none;

    font-family:
      system-ui,
      sans-serif;
  `;


  const modes = [
    {
      value:
        'grammar',
      label:
        '📝 Grammar & Spelling'
    },

    {
      value:
        'nepali-formal',
      label:
        '📜 Nepali Formal'
    },

    {
      value:
        'professional',
      label:
        '💼 Professional'
    },

    {
      value:
        'creative',
      label:
        '🎨 Creative'
    },

    {
      value:
        'image',
      label:
        '🖼️ Image Prompt'
    },

    {
      value:
        'video',
      label:
        '🎬 Video Prompt'
    },

    {
      value:
        'email',
      label:
        '📧 Email'
    },

    {
      value:
        'shorten',
      label:
        '✂️ Shorten'
    },

    {
      value:
        'expand',
      label:
        '📖 Expand'
    },

    {
      value:
        'simplify',
      label:
        '🧠 Simplify'
    },

    {
      value:
        'marketing',
      label:
        '🎯 Marketing'
    },

    {
      value:
        'question',
      label:
        '❓ Question'
    },

    {
      value:
        'summary',
      label:
        '📋 Summary'
    },

    {
      value:
        'translate-ne',
      label:
        '🌐 Eng→Nepali'
    },

    {
      value:
        'translate-en',
      label:
        '🌐 Nepali→Eng'
    },

    {
      value:
        'eli5',
      label:
        '🧒 Explain like 5'
    },

    {
      value:
        'enhance',
      label:
        '✨ General Enhancement'
    }
  ];


  for (
    const mode of modes
  ) {
    const option =
      document.createElement(
        'option'
      );

    option.value =
      mode.value;

    option.textContent =
      mode.label;

    select.appendChild(
      option
    );
  }


  select.value =
    currentMode;


  select.addEventListener(
    'change',
    async (event) => {
      currentMode =
        event.target.value;

      await chrome.storage.local.set(
        {
          selectedMode:
            currentMode
        }
      );

      showNotification(
        `Mode: ${
          select.options[
            select.selectedIndex
          ].text
        }`,
        'info'
      );
    }
  );


  /* -------------------------------------------------------
     Enhance button
  ------------------------------------------------------- */

  const button =
    document.createElement(
      'button'
    );

  button.type =
    'button';

  button.textContent =
    '✨ Enhance';

  button.style.cssText = `
    background: white;

    color: #667eea;

    border: none;

    border-radius: 30px;

    padding: 5px 16px;

    font-size: 12px;
    font-weight: 600;

    cursor: pointer;

    transition:
      transform 0.1s;

    font-family: inherit;
  `;


  /*
    Prevent the editor from losing
    its focus/selection when the
    Enhance button is pressed.
  */

  button.addEventListener(
    'mousedown',
    (event) => {
      event.preventDefault();
      event.stopPropagation();
    }
  );


  button.addEventListener(
    'click',
    async (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (isDragging) {
        return;
      }

      await enhanceFocusedInput();
    }
  );


  button.addEventListener(
    'mouseenter',
    () => {
      button.style.transform =
        'scale(1.02)';
    }
  );


  button.addEventListener(
    'mouseleave',
    () => {
      button.style.transform =
        'scale(1)';
    }
  );


  container.appendChild(
    select
  );

  container.appendChild(
    button
  );


  /* -------------------------------------------------------
     Drag handling
  ------------------------------------------------------- */

  container.addEventListener(
    'mousedown',
    (event) => {
      if (
        event.target ===
          select ||
        event.target ===
          button
      ) {
        return;
      }

      isDragging = true;

      dragStartX =
        event.clientX -
        container.offsetLeft;

      dragStartY =
        event.clientY -
        container.offsetTop;

      container.style.cursor =
        'grabbing';

      event.preventDefault();
    }
  );


  window.addEventListener(
    'mousemove',
    (event) => {
      if (!isDragging) {
        return;
      }

      let newLeft =
        event.clientX -
        dragStartX;

      let newTop =
        event.clientY -
        dragStartY;


      newLeft =
        Math.max(
          0,
          Math.min(
            window.innerWidth -
              container.offsetWidth,
            newLeft
          )
        );


      newTop =
        Math.max(
          0,
          Math.min(
            window.innerHeight -
              container.offsetHeight,
            newTop
          )
        );


      container.style.left =
        `${newLeft}px`;

      container.style.top =
        `${newTop}px`;

      container.style.right =
        'auto';

      container.style.bottom =
        'auto';


      savedLeft =
        newLeft;

      savedTop =
        newTop;
    }
  );


  window.addEventListener(
    'mouseup',
    () => {
      if (!isDragging) {
        return;
      }

      isDragging = false;

      container.style.cursor =
        'move';
    }
  );


  document.body.appendChild(
    container
  );

  dragButton =
    container;
}


/* =========================================================
   FLOATING BUTTON POSITION
========================================================= */

function positionAboveInput(
  container,
  inputElement
) {
  if (
    !container ||
    !inputElement
  ) {
    return;
  }

  const rect =
    inputElement.getBoundingClientRect();


  let top =
    rect.top -
    container.offsetHeight -
    10;


  let left =
    rect.right -
    container.offsetWidth;


  /*
    If there is not enough room
    above the field, show below it.
  */

  if (top < 10) {
    top =
      rect.bottom + 10;
  }


  left =
    Math.max(
      10,
      Math.min(
        window.innerWidth -
          container.offsetWidth -
          10,
        left
      )
    );


  top =
    Math.max(
      10,
      Math.min(
        window.innerHeight -
          container.offsetHeight -
          10,
        top
      )
    );


  container.style.left =
    `${left}px`;

  container.style.top =
    `${top}px`;

  container.style.right =
    'auto';

  container.style.bottom =
    'auto';
}


function showButtonForInput(
  element
) {
  if (!element) {
    return;
  }

  if (!dragButton) {
    createDraggableButton();
  }

  activeInputElement =
    element;

  dragButton.style.display =
    'flex';


  if (
    savedLeft !== null &&
    savedTop !== null
  ) {
    dragButton.style.left =
      `${savedLeft}px`;

    dragButton.style.top =
      `${savedTop}px`;

  } else {
    requestAnimationFrame(
      () => {
        positionAboveInput(
          dragButton,
          element
        );
      }
    );
  }
}


function hideButton() {
  if (!dragButton) {
    return;
  }

  dragButton.style.display =
    'none';
}


/* =========================================================
   NOTIFICATIONS
========================================================= */

function showNotification(
  message,
  type = 'info'
) {
  const notification =
    document.createElement(
      'div'
    );

  notification.className =
    'ai-notification';

  notification.textContent =
    message;

  notification.style.position =
    'fixed';

  notification.style.bottom =
    '20px';

  notification.style.right =
    '20px';

  notification.style.padding =
    '8px 16px';

  notification.style.borderRadius =
    '8px';

  notification.style.zIndex =
    '2147483647';

  notification.style.fontFamily =
    'system-ui';

  notification.style.color =
    'white';

  notification.style.boxShadow =
    '0 2px 8px rgba(0,0,0,0.2)';


  if (type === 'error') {
    notification.style.background =
      '#f44336';

  } else if (
    type === 'success'
  ) {
    notification.style.background =
      '#4CAF50';

  } else {
    notification.style.background =
      '#2196F3';
  }


  document.body.appendChild(
    notification
  );


  setTimeout(
    () => {
      notification.remove();
    },
    3000
  );
}


/* =========================================================
   CORNER GENERATING LOADER
========================================================= */

function showLoader(message) {
  const loader =
    document.createElement(
      'div'
    );

  loader.className =
    'ai-loader-quantum';

  loader.innerHTML = `
    <span class="loader-text">
      ${message}
    </span>

    <span
      style="
        font-size: 11px;
        opacity: 0.8;
      "
    >
      ...
    </span>
  `;

  loader.style.position =
    'fixed';

  loader.style.bottom =
    '80px';

  loader.style.right =
    '20px';

  loader.style.zIndex =
    '2147483647';

  document.body.appendChild(
    loader
  );

  return loader;
}


function removeLoader(loader) {
  if (loader) {
    loader.remove();
  }
}


/* =========================================================
   MODE -> BORDER ANIMATION
========================================================= */

function getBorderAnimationForMode(
  mode
) {
  const modeAnimations = {
    grammar:
      'flow',

    'nepali-formal':
      'royal',

    professional:
      'sweep',

    creative:
      'aurora',

    image:
      'neon',

    video:
      'cinematic',

    email:
      'sweep',

    shorten:
      'minimal',

    expand:
      'orbit',

    simplify:
      'minimal',

    marketing:
      'pulse',

    question:
      'orbit',

    summary:
      'flow',

    'translate-ne':
      'travel',

    'translate-en':
      'travel',

    eli5:
      'playful',

    enhance:
      'quantum'
  };

  return (
    modeAnimations[mode] ||
    'quantum'
  );
}


/* =========================================================
   MODE-BASED FIELD BORDER LOADER
========================================================= */

function showFieldBorderLoader(
  element,
  mode
) {
  if (!element) {
    return null;
  }

  removeFieldBorderLoader();


  const overlay =
    document.createElement(
      'div'
    );


  const animation =
    getBorderAnimationForMode(
      mode
    );


  overlay.className =
    `ai-field-border-loader ai-border-${animation}`;


  overlay.setAttribute(
    'data-ai-mode',
    mode
  );


  overlay.setAttribute(
    'aria-hidden',
    'true'
  );


  document.body.appendChild(
    overlay
  );


  activeFieldBorderLoader = {
    overlay,
    element,
    animation,
    frameId: null
  };


  function updatePosition() {
    if (
      !activeFieldBorderLoader ||
      activeFieldBorderLoader
        .overlay !== overlay
    ) {
      return;
    }


    if (!element.isConnected) {
      removeFieldBorderLoader();

      return;
    }


    const rect =
      element.getBoundingClientRect();


    /*
      If the editor is temporarily
      invisible, keep checking.
    */

    if (
      rect.width <= 0 ||
      rect.height <= 0
    ) {
      activeFieldBorderLoader
        .frameId =
        requestAnimationFrame(
          updatePosition
        );

      return;
    }


    const offset = 3;


    overlay.style.left =
      `${rect.left - offset}px`;

    overlay.style.top =
      `${rect.top - offset}px`;

    overlay.style.width =
      `${rect.width + offset * 2}px`;

    overlay.style.height =
      `${rect.height + offset * 2}px`;


    /*
      Try to match the website's
      original input border radius.
    */

    const computed =
      window.getComputedStyle(
        element
      );

    const radius =
      computed.borderRadius;


    if (
      radius &&
      radius !== '0px'
    ) {
      overlay.style.borderRadius =
        radius;
    } else {
      overlay.style.borderRadius =
        '12px';
    }


    activeFieldBorderLoader
      .frameId =
      requestAnimationFrame(
        updatePosition
      );
  }


  updatePosition();

  return overlay;
}


function removeFieldBorderLoader() {
  if (
    !activeFieldBorderLoader
  ) {
    return;
  }


  if (
    activeFieldBorderLoader
      .frameId
  ) {
    cancelAnimationFrame(
      activeFieldBorderLoader
        .frameId
    );
  }


  activeFieldBorderLoader
    .overlay
    ?.remove();


  activeFieldBorderLoader =
    null;
}


/* =========================================================
   AI ENHANCEMENT
========================================================= */

async function enhanceFocusedInput() {

  /* -------------------------------------------------------
     ChatGPT priority
  ------------------------------------------------------- */

  const chatGPTEditor =
    getChatGPTEditor();


  if (
    chatGPTEditor &&
    (
      isSelectionInside(
        chatGPTEditor
      ) ||
      document.activeElement ===
        chatGPTEditor ||
      chatGPTEditor.contains(
        document.activeElement
      )
    )
  ) {
    activeInputElement =
      chatGPTEditor;
  }


  /* -------------------------------------------------------
     Generic fallback
  ------------------------------------------------------- */

  if (!activeInputElement) {
    const detected =
      findEditableElement(
        document.activeElement
      );

    if (detected) {
      activeInputElement =
        detected;
    }
  }


  if (!activeInputElement) {
    showNotification(
      'No editable text field detected.',
      'error'
    );

    return;
  }


  const text =
    getInputText(
      activeInputElement
    );


  if (
    !text ||
    !text.trim()
  ) {
    showNotification(
      'No text found in this field.',
      'error'
    );

    return;
  }


  /*
    Corner loader.
  */

  const loader =
    showLoader(
      '✨ Generating'
    );


  /*
    Premium mode-specific animated
    border around the active field.
  */

  showFieldBorderLoader(
    activeInputElement,
    currentMode
  );


  try {
    const response =
      await new Promise(
        (
          resolve,
          reject
        ) => {

          chrome.runtime.sendMessage(
            {
              action:
                'enhanceText',

              text:
                text,

              mode:
                currentMode
            },

            (response) => {
              if (
                chrome.runtime
                  .lastError
              ) {
                reject(
                  new Error(
                    chrome.runtime
                      .lastError
                      .message
                  )
                );

                return;
              }

              resolve(
                response
              );
            }
          );
        }
      );


    /*
      Stop both loaders as soon
      as the API request finishes.
    */

    removeFieldBorderLoader();

    removeLoader(
      loader
    );


    if (
      response?.error
    ) {
      showNotification(
        `Error: ${response.error}`,
        'error'
      );

      return;
    }


    if (
      response?.enhanced
    ) {

      /*
        ChatGPT sometimes recreates
        its editor DOM during the API
        wait. Re-detect it before
        writing the result.
      */

      const latestChatGPTEditor =
        getChatGPTEditor();


      if (
        latestChatGPTEditor &&
        isChatGPT()
      ) {
        activeInputElement =
          latestChatGPTEditor;
      }


      setInputText(
        activeInputElement,
        response.enhanced
      );


      showNotification(
        '✅ Generated!',
        'success'
      );
    }

  } catch (error) {

    removeFieldBorderLoader();

    removeLoader(
      loader
    );


    showNotification(
      `Error: ${error.message}`,
      'error'
    );
  }
}


/* =========================================================
   EDITOR EVENT DETECTION
========================================================= */

function handlePotentialEditable(
  target
) {
  if (
    dragButton &&
    dragButton.contains(
      target
    )
  ) {
    return;
  }


  /* -------------------------------------------------------
     ChatGPT priority
  ------------------------------------------------------- */

  const chatGPTEditor =
    getChatGPTEditor();


  if (
    chatGPTEditor &&
    target
  ) {
    let node =
      target;


    if (
      node.nodeType ===
      Node.TEXT_NODE
    ) {
      node =
        node.parentElement;
    }


    if (
      node &&
      (
        node ===
          chatGPTEditor ||
        chatGPTEditor.contains(
          node
        )
      )
    ) {
      activeInputElement =
        chatGPTEditor;


      showButtonForInput(
        chatGPTEditor
      );

      return;
    }
  }


  /* -------------------------------------------------------
     Generic editor
  ------------------------------------------------------- */

  const editable =
    findEditableElement(
      target
    );


  if (editable) {
    activeInputElement =
      editable;


    showButtonForInput(
      editable
    );
  }
}


/* =========================================================
   FOCUS EVENTS
========================================================= */

document.addEventListener(
  'focusin',

  (event) => {
    handlePotentialEditable(
      event.target
    );
  },

  true
);


/* =========================================================
   POINTER EVENTS
========================================================= */

document.addEventListener(
  'pointerdown',

  (event) => {
    handlePotentialEditable(
      event.target
    );
  },

  true
);


document.addEventListener(
  'pointerup',

  (event) => {

    const chatGPTEditor =
      getChatGPTEditor();


    if (chatGPTEditor) {
      let target =
        event.target;


      if (
        target?.nodeType ===
        Node.TEXT_NODE
      ) {
        target =
          target.parentElement;
      }


      if (
        target &&
        (
          target ===
            chatGPTEditor ||
          chatGPTEditor.contains(
            target
          )
        )
      ) {
        activeInputElement =
          chatGPTEditor;


        showButtonForInput(
          chatGPTEditor
        );

        return;
      }
    }


    handlePotentialEditable(
      event.target
    );
  },

  true
);


document.addEventListener(
  'click',

  (event) => {
    handlePotentialEditable(
      event.target
    );
  },

  true
);


/* =========================================================
   KEYBOARD DETECTION
========================================================= */

document.addEventListener(
  'keydown',

  () => {

    const chatGPTEditor =
      getChatGPTEditor();


    if (chatGPTEditor) {
      const active =
        document.activeElement;


      if (
        active ===
          chatGPTEditor ||
        chatGPTEditor.contains(
          active
        ) ||
        isSelectionInside(
          chatGPTEditor
        )
      ) {
        activeInputElement =
          chatGPTEditor;


        showButtonForInput(
          chatGPTEditor
        );

        return;
      }
    }


    const editable =
      findEditableElement(
        document.activeElement
      );


    if (editable) {
      activeInputElement =
        editable;


      showButtonForInput(
        editable
      );
    }
  },

  true
);


/* =========================================================
   FOCUS OUT
========================================================= */

document.addEventListener(
  'focusout',

  () => {
    setTimeout(
      () => {

        /* -----------------------------------------------
           ChatGPT special case
        ----------------------------------------------- */

        const chatGPTEditor =
          getChatGPTEditor();


        if (
          chatGPTEditor
        ) {
          const active =
            document.activeElement;


          if (
            active ===
              chatGPTEditor ||
            (
              active &&
              chatGPTEditor.contains(
                active
              )
            ) ||
            isSelectionInside(
              chatGPTEditor
            )
          ) {
            activeInputElement =
              chatGPTEditor;

            return;
          }
        }


        /* -----------------------------------------------
           Floating button itself
        ----------------------------------------------- */

        const active =
          document.activeElement;


        if (
          dragButton &&
          active &&
          dragButton.contains(
            active
          )
        ) {
          return;
        }


        /* -----------------------------------------------
           Generic editor
        ----------------------------------------------- */

        const editable =
          findEditableElement(
            active
          );


        if (editable) {
          activeInputElement =
            editable;

          return;
        }


        hideButton();

      },

      200
    );
  },

  true
);


/* =========================================================
   SCROLL
========================================================= */

window.addEventListener(
  'scroll',

  () => {
    if (
      dragButton &&
      dragButton.style.display ===
        'flex' &&
      activeInputElement &&
      savedLeft === null &&
      savedTop === null
    ) {
      positionAboveInput(
        dragButton,
        activeInputElement
      );
    }
  },

  true
);


/* =========================================================
   RESIZE
========================================================= */

window.addEventListener(
  'resize',

  () => {
    if (
      !dragButton ||
      dragButton.style.display !==
        'flex' ||
      !activeInputElement
    ) {
      return;
    }


    if (
      savedLeft !== null &&
      savedTop !== null
    ) {
      savedLeft =
        Math.max(
          0,
          Math.min(
            savedLeft,
            window.innerWidth -
              dragButton.offsetWidth
          )
        );


      savedTop =
        Math.max(
          0,
          Math.min(
            savedTop,
            window.innerHeight -
              dragButton.offsetHeight
          )
        );


      dragButton.style.left =
        `${savedLeft}px`;

      dragButton.style.top =
        `${savedTop}px`;

    } else {
      positionAboveInput(
        dragButton,
        activeInputElement
      );
    }
  }
);


/* =========================================================
   SPA / DYNAMIC PAGE SUPPORT
========================================================= */

let lastUrl =
  location.href;


const observer =
  new MutationObserver(
    () => {

      if (
        location.href !==
        lastUrl
      ) {
        lastUrl =
          location.href;

        activeInputElement =
          null;

        hideButton();

        removeFieldBorderLoader();
      }


      /*
        ChatGPT can recreate its
        editor after navigation.
      */

      if (isChatGPT()) {
        const editor =
          getChatGPTEditor();


        if (
          editor &&
          (
            document.activeElement ===
              editor ||
            editor.contains(
              document.activeElement
            ) ||
            isSelectionInside(
              editor
            )
          )
        ) {
          activeInputElement =
            editor;
        }
      }
    }
  );


observer.observe(
  document.documentElement,
  {
    subtree: true,
    childList: true
  }
);


/* =========================================================
   CTRL + SHIFT + E COMMAND SUPPORT
========================================================= */

chrome.runtime.onMessage.addListener(
  (
    request,
    sender,
    sendResponse
  ) => {

    if (
      request.action !==
      'triggerEnhance'
    ) {
      return;
    }


    const chatGPTEditor =
      getChatGPTEditor();


    if (chatGPTEditor) {
      activeInputElement =
        chatGPTEditor;

    } else {
      const editable =
        findEditableElement(
          document.activeElement
        );


      if (editable) {
        activeInputElement =
          editable;
      }
    }


    enhanceFocusedInput();


    sendResponse?.({
      received: true
    });
  }
);


/* =========================================================
   INITIALIZATION
========================================================= */

function initialize() {
  createDraggableButton();

  console.log(
    '🚀 AI Text Enhancer Pro content script loaded'
  );
}


if (
  document.readyState ===
  'loading'
) {
  document.addEventListener(
    'DOMContentLoaded',
    initialize
  );

} else {
  initialize();
}