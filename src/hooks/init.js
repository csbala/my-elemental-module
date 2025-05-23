import { logger } from "../logger.js";

/**
 * Sets up the init hook for the Elemental Module.
 */
export function setupInitHook() {
  Hooks.once("init", async function () {
    logger.debug("🌟 Elemental System | Initializing...");
  });
}
