/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.ts` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */


import './index.css';

// --- 1. STATE MANAGEMENT ---
let isPaused = false;
let isChatOpen = false;
let posX = 0;
let direction = 1;
let time = 0;
let baseY = 200; // This is your new starting height

declare global {
  interface Window {
    electronAPI: {
      setIgnoreMouseEvents: (ignore: boolean, options?: { forward: boolean }) => void;
      askAI: (prompt: string) => Promise<string>;
    };
  }
}

const reminders = [
  "Don't forget to drink some water! 💧",
  "Time to stretch your back. 🦴",
  "Rest your eyes for a minute. 👀",
  "You're doing a great job! ✨",
  "Take a deep breath. 🌬️"
];
const reminderInterval = 10000;

// --- 2. ELEMENT SELECTORS ---
const clickBox = document.querySelector('.click-box') as HTMLElement;
const ghostBody = document.querySelector('.ghost-body') as HTMLElement;
const ghostContainer = document.getElementById('character') as HTMLElement;
const bubble = document.getElementById('speech-bubble') as HTMLElement;
const bubbleContent = document.getElementById('bubble-content') as HTMLElement;
const ghostInput = document.getElementById('ghost-input') as HTMLInputElement;

// --- 3. HELPER FUNCTIONS ---
function closeChat() {
  isChatOpen = false;
  isPaused = false;
  bubble.classList.add('hidden');
  bubble.classList.remove('visible');
  ghostInput.classList.add('hidden');
  ghostInput.value = "";
  bubbleContent.classList.remove('hidden');
  bubbleContent.innerText = "";
  // Return to "Ghost Mode" so we can click through to the desktop
  window.electronAPI.setIgnoreMouseEvents(true, { forward: true });
}

// --- 4. INTERACTION LOGIC ---

// Mouse Hover: Toggle between "Solid" and "Click-through"
[clickBox, bubble, ghostInput].forEach(el => {
  if (el) {
    el.addEventListener('mouseenter', () => {
      window.electronAPI.setIgnoreMouseEvents(false);
    });
    el.addEventListener('mouseleave', () => {
      // Stay solid if the chat is open so we can keep typing
      if (!isChatOpen) {
        window.electronAPI.setIgnoreMouseEvents(true, { forward: true });
      }
    });
  }
});

// Click Ghost: Toggle Chat Window
clickBox.addEventListener('click', (e) => {
  // If clicking the input box inside the bubble, don't toggle the ghost
  if (e.target === ghostInput) return;

  isChatOpen = !isChatOpen;

  if (isChatOpen) {
    isPaused = true;
    window.electronAPI.setIgnoreMouseEvents(false); // Enable keyboard/mouse
    
    // UI Setup
    bubble.classList.remove('hidden');
    bubble.classList.add('visible');
    bubbleContent.classList.add('hidden'); 
    ghostInput.classList.remove('hidden');
    
    // Small delay to ensure the window is focused before focusing the input
    setTimeout(() => {
      ghostInput.focus();
    }, 50);

    // Visual "Jump" animation
    if (ghostBody) {
      ghostBody.style.transition = 'transform 0.1s ease-out';
      ghostBody.style.transform = 'scale(1.2) translateY(-10px)';
      setTimeout(() => ghostBody.style.transform = 'scale(1) translateY(0)', 100);
    }
  } else {
    closeChat();
  }
});

// Handle AI Input (Enter Key)
ghostInput.addEventListener('keypress', async (e) => {
  if (e.key === 'Enter') {
    const prompt = ghostInput.value.trim();
    if (!prompt) return;

    // Show "Thinking" state
    ghostInput.classList.add('hidden');
    bubbleContent.classList.remove('hidden');
    bubbleContent.innerText = "...";

    try {
      const response = await window.electronAPI.askAI(prompt);
      bubbleContent.innerText = response;
      
      // Stay on screen for 8 seconds, then auto-resume movement
      setTimeout(() => {
        if (isChatOpen) closeChat();
      }, 8000);

    } catch (err) {
      bubbleContent.innerText = "Ghost error!";
      setTimeout(closeChat, 3000);
    }
  }
});

// --- 5. ANIMATION LOOP ---
function animate() {
  if (isPaused) {
    requestAnimationFrame(animate); 
    return;
  }

  const safeBound = window.innerWidth - ghostContainer.offsetWidth;

  // Horizontal Movement
  posX += 0.5 * direction; 
  if (posX >= safeBound || posX <= 0) direction *= -1;

  // Vertical Bobbing
  time += 0.03;
  const bobY = Math.sin(time) * 10;
  const flip = direction === 1 ? -1 : 1;

  // FIX: Use the global 'baseY' variable so it doesn't reset to 0
  ghostContainer.style.transform = `translate3d(${posX}px, ${baseY + bobY}px, 0) scaleX(${flip})`;

  if (bubble && !bubble.classList.contains('hidden')) {
    // Keep the bubble from flipping with the ghost
    bubble.style.transform = `translateX(-50%) scaleX(${flip})`;
  }

  requestAnimationFrame(animate);
}


function sendGhostReminder() {
  if (isChatOpen) return;

  const randomMessage = reminders[Math.floor(Math.random() * reminders.length)];
  bubbleContent.innerText = randomMessage;

  // Show the text, hide the input
  ghostInput.classList.add('hidden');
  bubbleContent.classList.remove('hidden');
  bubble.classList.remove('hidden');

  // TRIGGER THE JUMP WITHOUT BREAKING TRANSFORM
  // Use a CSS class for the jump instead of manual style overrides
  ghostBody.classList.add('jump-anim');
  setTimeout(() => ghostBody.classList.remove('jump-anim'), 400);

  setTimeout(() => {
    if (!isChatOpen) bubble.classList.add('hidden');
  }, 7000);
}

setInterval(sendGhostReminder, reminderInterval);

// Start everything
animate();
