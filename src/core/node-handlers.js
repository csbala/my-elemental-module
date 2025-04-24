import { getThemeColor, setNodeCorruptionState } from "./store/index.js";

/**
 * Attaches drag-and-drop, double-click, element name click, and hover event listeners to a node.
 *
 * @param {HTMLElement} node - The node element.
 * @param {number} nodeIndex - The index of the node.
 * @param {Object} app - The character sheet application.
 * @param {Function} onFeatureDrop - Callback when a feature is dropped onto a node.
 * @param {Function} onFeatureRemove - Callback when a feature is dragged out of a node.
 * @param {Function} onStateToggle - Callback when a node's state is toggled.
 */
export function attachNodeHandlers(node, nodeIndex, app, onFeatureDrop, onFeatureRemove, onStateToggle) {
  // Variables for double-right-click detection
  let lastRightClickTime = 0;
  const doubleClickThreshold = 500; // 500ms window for double right-click
  let hoverPad = null;
  let hoverTimeout = null;

  // Function to remove the hover pad
  const removeHoverPad = () => {
    if (hoverPad) {
      hoverPad.remove();
      hoverPad = null;
    }
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      hoverTimeout = null;
    }
  };

  // Allow dropping items onto the node
  node.addEventListener("dragover", (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    console.log(`Drag over node ${nodeIndex}`);
  });

  node.addEventListener("drop", async (event) => {
    event.preventDefault();
    console.log(`Drop on node ${nodeIndex}`);
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData("text/plain"));
      console.log("Dropped data:", data);
    } catch (e) {
      console.error("Failed to parse drag data:", e);
      return;
    }
    if (data.type !== "Item") {
      console.log("Dropped data is not an Item:", data.type);
      return;
    }

    const item = (await fromUuid(data.uuid)) || game.items.get(data.id) || app?.actor?.items.get(data.id);
    if (!item) {
      console.log("Item not found:", data.id);
      return;
    }
    if (item.type !== "feat") {
      console.log("Item is not a feat:", item.type);
      return;
    }

    await onFeatureDrop(nodeIndex, item);
    removeHoverPad(); // Remove the hover pad after dropping a feature
  });

  // Allow dragging features out of the node
  node.addEventListener("dragstart", (event) => {
    const featureId = node.dataset.featureId;
    if (!featureId) {
      console.log(`No feature to drag from node ${nodeIndex}`);
      return;
    }

    console.log(`Dragging feature ${featureId} from node ${nodeIndex}`);
    event.dataTransfer.setData(
      "text/plain",
      JSON.stringify({
        type: "Item",
        uuid: `Actor.${app.actor.id}.Item.${featureId}`,
        id: featureId,
        nodeIndex: nodeIndex,
      })
    );
    event.dataTransfer.effectAllowed = "move";

    // Remove the hover pad when dragging out
    removeHoverPad();

    setTimeout(async () => {
      await onFeatureRemove(nodeIndex);
    }, 0);
  });

  // Add double-click handler to toggle awakened/dormant state
  node.addEventListener("dblclick", async () => {
    removeHoverPad(); // Remove the hover pad on double-click
    const isAwakened = !node.classList.contains("node-dormant");
    if (isAwakened) {
      node.classList.add("node-dormant");
    } else {
      node.classList.remove("node-dormant");
    }
    await onStateToggle(nodeIndex, !isAwakened);
  });

  // Add right-click handler to toggle corruption state with double right-click
  node.addEventListener("contextmenu", async (event) => {
    event.preventDefault(); // Prevent the default context menu

    const currentTime = Date.now();
    if (currentTime - lastRightClickTime <= doubleClickThreshold) {
      // Double right-click detected
      removeHoverPad(); // Remove the hover pad on double-right-click
      const isCorrupted = !node.classList.contains("node-corrupted");
      node.classList.toggle("node-corrupted", isCorrupted);
      await setNodeCorruptionState(app.actor, nodeIndex, isCorrupted);
      console.log(`Toggled corruption state for node ${nodeIndex} to ${isCorrupted ? "corrupted" : "not corrupted"}`);
      lastRightClickTime = 0; // Reset the timer
    } else {
      lastRightClickTime = currentTime;
    }
  });

  // Add click handler to the element name to roll 1d6 + bonus if awakened
  const nameElement = node.querySelector(".element-name");
  if (nameElement) {
    nameElement.addEventListener("click", async () => {
      if (node.classList.contains("node-dormant")) {
        console.log(`Cannot roll for node ${nodeIndex}: Element is dormant`);
        return;
      }

      const input = node.querySelector("input");
      const bonus = parseInt(input.value, 10) || 0;
      const elementName = nameElement.textContent || "Element";

      // Roll 1d6 + bonus
      const roll = new Roll(`1d6 + ${bonus}`);
      await roll.evaluate();

      // Fetch the theme color
      const themeColor = await getThemeColor(app.actor);

      // Render the custom chat message template
      const chatContent = await renderTemplate("modules/my-elemental-module/templates/elemental-roll.hbs", {
        elementName: elementName,
        rollFormula: `1d6 + ${bonus}`,
        rollResult: roll.total,
        themeColor: themeColor,
      });

      // Send the roll to chat with the custom template
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: app.actor }),
        content: chatContent,
      });

      console.log(`Rolled 1d6 + ${bonus} for node ${nodeIndex} (${elementName}): ${roll.total}`);
    });
  }

  // Add hover handler to display the node information pad
  node.addEventListener("mouseover", async (event) => {
    // Only show the hover pad if a feature is linked
    const featureId = node.dataset.featureId;
    if (!featureId) {
      console.log(`No feature linked to node ${nodeIndex}, skipping hover pad.`);
      return;
    }

    // Remove any existing hover pad
    removeHoverPad();

    // Delay the hover pad appearance to prevent flickering
    hoverTimeout = setTimeout(async () => {
      // Get the node's information
      const elementName = nameElement.textContent || "Unknown Element";
      const isAwakened = !node.classList.contains("node-dormant");
      const isCorrupted = node.classList.contains("node-corrupted");
      let state = isAwakened ? "Awakened" : "Dormant";
      if (isCorrupted) {
        state += " (Corrupted)";
      }

      let featSummary = "No feat linked.";
      let description = "No description available.";
      if (featureId) {
        const feat = game.items.get(featureId) || app?.actor?.items.get(featureId);
        if (feat) {
          featSummary = feat.name || "Unknown Feat";
          description = feat.system?.description?.value || "No description available.";
          // Strip HTML tags from description for display
          description = description.replace(/<[^>]+>/g, "");
          // Truncate description if too long
          if (description.length > 100) {
            description = description.substring(0, 97) + "...";
          }
        }
      }

      // Create the hover pad
      hoverPad = document.createElement("div");
      hoverPad.classList.add("node-hover-pad");
      if (!isAwakened) {
        hoverPad.classList.add("node-dormant");
      }
      if (isCorrupted) {
        hoverPad.classList.add("node-corrupted");
      }
      hoverPad.style.setProperty("--theme-color", await getThemeColor(app.actor));
      hoverPad.innerHTML = `
        <div class="hover-pad-header">${elementName}</div>
        <div class="hover-pad-content">
          <p><strong>Description:</strong> ${description}</p>
          <p><strong>Feat:</strong> ${featSummary}</p>
          <p><strong>State:</strong> ${state}</p>
        </div>
      `;

      // Position the hover pad to the right of the node
      const rect = node.getBoundingClientRect();
      hoverPad.style.position = "absolute";
      hoverPad.style.left = `${rect.right + 10}px`;
      hoverPad.style.top = `${rect.top}px`;
      document.body.appendChild(hoverPad);
    }, 200); // 200ms delay to prevent flickering
  });

  // Remove the hover pad when the mouse leaves the node
  node.addEventListener("mouseout", () => {
    removeHoverPad();
  });

  // Make the node draggable if it has a feature
  node.draggable = !!node.dataset.featureId;
}
