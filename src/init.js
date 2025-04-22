console.log("✅ Elemental Module loaded");

import { setupInitHook } from "./hooks/use-init-hook.js";
import { setupRenderHook } from "./hooks/use-render-hook.js";
import { setupUpdateHook } from "./hooks/use-update-hook.js";
import { setupCloseHook } from "./hooks/use-close-hook.js";

// Initialize all hooks
setupInitHook();
setupRenderHook();
setupUpdateHook();
setupCloseHook();
