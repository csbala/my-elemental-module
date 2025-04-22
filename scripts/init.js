console.log("✅ Elemental Module loaded");

import { setupInitHook } from "./hooks/init-hook.js";
import { setupRenderHook } from "./hooks/render-hook.js";
import { setupUpdateHook } from "./hooks/update-hook.js";
import { setupCloseHook } from "./hooks/close-hook.js";

// Initialize all hooks
setupInitHook();
setupRenderHook();
setupUpdateHook();
setupCloseHook();
