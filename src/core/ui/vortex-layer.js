/**
 * Sets up the vortex-circles layer if it doesn't exist.
 *
 * @param {HTMLElement} mainCircle - The container for the nodes.
 */
export function setupVortexLayer(mainCircle) {
  let vortexCircles = mainCircle.querySelector(".vortex-circles");
  if (!vortexCircles) {
    vortexCircles = document.createElement("div");
    vortexCircles.classList.add("vortex-circles");
    mainCircle.appendChild(vortexCircles);
  }
}
