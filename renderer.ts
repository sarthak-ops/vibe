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

console.log(
  '👋 This message is being logged by "renderer.ts", included via Vite',
);

window.addEventListener('mousemove', (event) => {
  const pupils = document.querySelectorAll<HTMLElement>('.pupil');
  
  pupils.forEach((pupil) => {
    const rect = pupil.getBoundingClientRect();
    const eyeX = rect.left + rect.width / 2;
    const eyeY = rect.top + rect.height / 2;
    
    // Calculate angle between mouse and eye center
    const angle = Math.atan2(event.clientY - eyeY, event.clientX - eyeX);
    
    // Move pupil 4px in that direction
    const distance = 4;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    
    pupil.style.transform = `translate(${x}px, ${y}px)`;
  });
});


