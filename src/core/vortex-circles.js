import { getNodeConfig } from "./node-config.js";

/**
 * Generates the spinning circles effect for the vortex-circles layer.
 *
 * @param {HTMLElement} vortexCircles - The vortex-circles DOM element.
 * @param {string} themeColor - The theme color in hex format.
 */
export function generateVortexCircles(vortexCircles, themeColor) {
  if (!vortexCircles) return;

  const { circleCount, minPos, posRange, maxSize, sizeStep } = getNodeConfig(themeColor).vortex;
  const circleStyles = [];

  for (let i = 0; i < circleCount; i++) {
    const posX = minPos + Math.random() * posRange;
    const posY = minPos + Math.random() * posRange;
    const size = maxSize - i * sizeStep;
    const gradient = `radial-gradient(circle at ${posX}% ${posY}%, transparent 0, transparent 20px, ${themeColor}33 ${size}px, transparent 22px)`;
    circleStyles.push(gradient);
  }

  vortexCircles.style.background = circleStyles.join(",");
}
