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

declare global {
  interface Window {
    electronAPI: {
      setIgnoreMouseEvents: (ignore: boolean, options?: { forward: boolean }) => void;
    };
  }
}

const clickBox = document.querySelector('.click-box') as HTMLElement;
const ghostBody = document.querySelector('.ghost-body') as HTMLElement;
const ghostContainer = document.getElementById('character');

// Handle Clickability
if (clickBox) {
  clickBox.addEventListener('mouseenter', () => window.electronAPI.setIgnoreMouseEvents(false));
  clickBox.addEventListener('mouseleave', () => window.electronAPI.setIgnoreMouseEvents(true, { forward: true }));

  clickBox.addEventListener('click', () => {
    if (ghostBody) {
      ghostBody.style.transition = 'transform 0.1s ease-out';
      ghostBody.style.transform = 'scale(1.2) translateY(-10px)';
      setTimeout(() => ghostBody.style.transform = 'scale(1) translateY(0)', 100);
    }
  });
}

// Animation State
let posX = 0;
let direction = 1;
let time = 0;

function animate() {
  if (!ghostContainer) return requestAnimationFrame(animate);

  const safeBound = window.innerWidth - ghostContainer.offsetWidth;

  // Move
  posX += 0.5 * direction; 
  if (posX >= safeBound || posX <= 0) direction *= -1;

  // Bob
  time += 0.03;
  const bobY = Math.sin(time) * 10;
  const flip = direction === 1 ? -1 : 1;

  ghostContainer.style.transform = `translate3d(${posX}px, ${100 + bobY}px, 0) scaleX(${flip})`;
  
  requestAnimationFrame(animate);
}

animate();
