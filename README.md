# Elemental Module for Foundry VTT

✨ **A narrative power system for D&D and beyond, brought to life in Foundry VTT!**

The Elemental Module integrates the [_Element System_](https://docs.google.com/document/d/1YHqrxfUAKVTldjLAZ7jC0qrXbj3PEGgYy8a36KJ1AAg/edit?usp=sharing)—a metaphysical, narrative-driven power system—into Foundry VTT character sheets. It allows players to manage their character's elements, visually interact with them, and roll elemental dice, all while enhancing the storytelling experience with dynamic visuals and mechanics.

## 📖 Overview

The _Element System_ defines characters through metaphysical "Elements" (e.g., Fire, Sword, Humanity) that shape their essence, values, and powers. This module brings that system to Foundry VTT with:

- A custom "Elements" tab in D&D 5e character sheets (both PC and NPC).
- Visual nodes representing each element, with drag-and-drop functionality for assigning features.
- Awakened/dormant states, corruption visuals, theme color customization, and a burn level tracker.
- Custom chat messages for rolling elemental dice with thematic styling.
- Optimized performance with controlled re-rendering and a configurable logging system.

This module is designed for anime-tier storytelling, powered by roleplay, and fueled by dreams. It emphasizes character expression and narrative depth while providing engaging gameplay mechanics.

## 🚀 Features

- **Dynamic Element Nodes**: Add up to 12 element nodes in a circular layout, each with a customizable bonus value.
- **Drag-and-Drop Features**: Assign features (e.g., items of type "feat") to nodes by dragging them from the inventory or items directory.
- **Awakened/Dormant States**: Toggle elements between awakened and dormant states with a double-click. Dormant elements are greyed out, non-editable, and non-rollable.
- **Corruption Visuals**: Toggle element corruption with a double right-click, displaying a dark overlay, animated cracks, and a pulsing red aura.
- **Burn Level Tracker**: Set a burn level (a non-negative integer) for your character, stored persistently for narrative use.
- **Theme Color Customization**: Choose a theme color for the UI, which applies to nodes, text, borders, and chat messages.
- **Elemental Dice Rolling**: Click an awakened element's name to roll a `1d6` plus its bonus, with a custom chat message styled in the theme color.
- **Persistent Storage**: All element data (count, values, features, states, corruption, theme color, burn level) is stored in actor flags, persisting across sessions.
- **Visual Feedback**: Nodes animate when created or removed, with hover effects, pulsing glows, and corruption visuals enhancing immersion.
- **Hover Information Pad**: Hover over a node with a linked feature to display a detailed information pad, showing the element’s name, description, feat, and state.
- **Optimized Re-rendering**: Prevents infinite loops by skipping unnecessary re-renders, especially when setting tab states.
- **Configurable Logging**: Supports `info` and `debug` log levels, configurable via the `ELEMENTAL_MODULE_LOG_LEVEL` environment variable (defaults to `info` for minimal logs).

## 📦 Installation

1. **Download the Module**:

   - Clone or download this repository into your Foundry VTT modules directory (`Data/modules/`).
   - Alternatively, install via the Foundry VTT module installer by providing the URL to this repository.

2. **Enable the Module**:

   - In Foundry VTT, go to the "Game Settings" tab.
   - Click "Manage Modules" and enable the "Elemental Module" by checking its box.
   - Save your settings and reload the world.

3. **Verify Installation**:
   - Open a D&D 5e character sheet (PC or NPC).
   - You should see a new "Elements" tab with the module's UI, indicated by a gem icon in the tab navigation.

## 🖥️ Usage

### Accessing the Elements Tab

- Open a D&D 5e character sheet in Foundry VTT.
- Navigate to the "Elements" tab (look for the gem icon in the tab navigation).

### Managing Elements

- **Number of Elements**: Use the "Number of Elements" input to set how many elements your character has (1–12). Click "Update" to apply changes.
- **Assigning Features**: Drag a feat item from your inventory or the items directory onto a node to assign it. The node's background updates to the item's image.
- **Removing Features**: Drag the feature off the node to remove it.
- **Toggling Awakened/Dormant State**: Double-click a node to toggle between awakened and dormant states. Dormant nodes are greyed out, non-editable, and cannot be rolled.
- **Toggling Corruption**: Right-click a node twice within 500ms to toggle corruption. Corrupted nodes display a dark overlay, animated cracks, and a pulsing red aura.
- **Setting Burn Level**: Use the "Burn Level" input to set a non-negative integer value, which is stored persistently for narrative purposes.
- **Theme Color**: Use the "Theme Color" picker to choose a color for the UI. This applies to nodes, text, borders, and chat messages.

### Rolling Elemental Dice

- Click the name of an awakened element (e.g., "Fire") to roll a `1d6` plus the element's bonus (the value in the node's input field).
- The roll result appears in the chat with a custom template, styled with your selected theme color.

### Viewing Element Details

- Hover over a node with a linked feature to display a hover pad with details, including the element’s name, description, feat, and state (awakened/dormant, corrupted/not corrupted).
- Click the "×" button on the hover pad to close it, or move the mouse away to dismiss it automatically.

## 🎨 Visuals

- **Awakened Nodes**: Bright and glowing with the theme color, fully interactable.
- **Dormant Nodes**: Greyed out with a dark overlay, non-editable, and non-rollable.
- **Corrupted Nodes**: Display a dark overlay, animated cracks, and a pulsing red aura, indicating corruption.
- **Hover Pads**: Show detailed information with a holographic appearance, styled with the theme color.
- **Custom Chat Messages**: Elemental dice rolls appear in the chat with a styled template, using the theme color for borders, text, and shadows.

## 🛠️ Configuration

### Logging Level

- The module supports configurable logging via the `ELEMENTAL_MODULE_LOG_LEVEL` environment variable.
- **Default**: Set to `"info"` for minimal logs (e.g., major actions like tab injection, node updates).
- **Debug Mode**: Set to `"debug"` to enable detailed logs for troubleshooting (e.g., intermediate steps, data dumps).
- **How to Set**:
  - On a server-hosted Foundry VTT, add `ELEMENTAL_MODULE_LOG_LEVEL=debug` to your environment variables or a `.env` file.
  - Restart Foundry VTT to apply the change.
- Note: In client-side environments, `process.env` availability may vary. If not set, the logger defaults to `"info"`.

## 📋 Requirements

- **Foundry VTT**: Tested with v10 and later.
- **System**: Designed for D&D 5e (PC and NPC sheets), but can be adapted for other systems with modifications.
- **Dependencies**: None; the module is self-contained.

## 📂 Project Structure

```
elemental-module/
├── asset/                    # Assets (e.g., images, sounds)
├── src/                      # Source code
│   ├── core/                 # Core logic
│   │   ├── node-renderer.js  # Handles node rendering and interactions
│   │   ├── node-store.js     # Manages persistent storage of node data
│   ├── elements-tab/         # Elements tab UI logic
│   │   ├── node-ui.js        # Configures the Elements tab UI
│   │   ├── tab-controller.js # Controls tab injection
│   │   ├── tab-injector.js   # Injects the tab into the sheet
│   │   ├── tab-state.js      # Manages tab state
│   ├── hooks/                # Foundry VTT hooks
│   │   ├── close.js          # Handles sheet close events
│   │   ├── init.js           # Initialization hook
│   │   ├── render.js         # Render hooks for character sheets
│   │   ├── update.js         # Update hooks for actor changes
│   ├── utils/                # Utility functions
│   │   ├── debounce.js       # Debounce utility (not currently used)
│   │   ├── logger.js         # Custom logger with configurable levels
├── styles/                   # CSS styles
│   ├── sheet.css             # Styles for the Elements tab and chat messages
├── templates/                # Handlebars templates
│   ├── elements-tab.hbs      # Template for the Elements tab
│   ├── elemental-roll.hbs    # Template for custom roll chat messages
├── __tests__/                # Unit tests
├── module.json               # Module manifest
├── README.md                 # This file
```

## 🛠️ Development

### Contributing

1. Fork the repository.
2. Create a new branch for your feature (`git checkout -b feature/your-feature`).
3. Make your changes and commit them (`git commit -m "Add your feature"`).
4. Push to your branch (`git push origin feature/your-feature`).
5. Open a pull request with a description of your changes.

### Known Issues

- None at this time. If you encounter any bugs, please open an issue on GitHub!

## 📜 License

This module is licensed under the MIT License. See the `LICENSE` file for details.

## 🙏 Acknowledgments

- Inspired by the _Element System_ narrative power system.
- Built with love for the Foundry VTT community.
- Special thanks to the Foundry VTT team for providing an amazing platform.

---

**Happy Roleplaying!** 🎲✨
