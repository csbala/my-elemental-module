Elemental Module for Foundry VTT
✨ A narrative power system for D&D and beyond, brought to life in Foundry VTT!
The Elemental Module integrates the Element System—a metaphysical, narrative-driven power system—into Foundry VTT character sheets. It allows players to manage their character's elements, visually interact with them, and roll elemental dice, all while enhancing the storytelling experience with dynamic visuals and mechanics.
📖 Overview
The Element System defines characters through metaphysical "Elements" (e.g., Fire, Sword, Humanity) that shape their essence, values, and powers. This module brings that system to Foundry VTT with:

A custom "Elements" tab in the character sheet.
Visual nodes representing each element, with drag-and-drop functionality for assigning features.
Awakened/dormant states, corruption visuals, and theme color customization.
Custom chat messages for rolling elemental dice with thematic styling.

This module is designed for anime-tier storytelling, powered by roleplay, and fueled by dreams. It emphasizes character expression and narrative depth while providing engaging gameplay mechanics.
🚀 Features

Dynamic Element Nodes: Add up to 12 element nodes in a circular layout, each with a customizable bonus value.
Drag-and-Drop Features: Assign features (e.g., items of type "feat") to nodes by dragging them from the inventory or items directory.
Awakened/Dormant States: Toggle elements between awakened and dormant states with a double-click. Dormant elements are greyed out, non-editable, and non-rollable.
Corruption Visuals: Toggle element corruption with a double right-click, displaying a dark overlay, animated cracks, and a pulsing red aura.
Theme Color Customization: Choose a theme color for the UI, which applies to nodes, text, borders, and chat messages.
Elemental Dice Rolling: Click an awakened element's name to roll a 1d6 plus its bonus, with a custom chat message styled in the theme color.
Persistent Storage: All element data (count, values, features, states, corruption, theme color) is stored in actor flags, persisting across sessions.
Visual Feedback: Nodes animate when created or removed, with hover effects, pulsing glows, and corruption visuals enhancing immersion.

📦 Installation

Download the Module:

Clone or download this repository into your Foundry VTT modules directory (Data/modules/).
Alternatively, install via the Foundry VTT module installer by providing the URL to this repository.

Enable the Module:

In Foundry VTT, go to the "Game Settings" tab.
Click "Manage Modules" and enable the "Elemental Module" by checking its box.
Save your settings and reload the world.

Verify Installation:

Open a character sheet (e.g., a D&D 5e character).
You should see a new "Elements" tab with the module's UI.

🖥️ Usage
Accessing the Elements Tab

Open a character sheet in Foundry VTT.
Navigate to the "Elements" tab (look for the gem icon in the tab navigation).

Managing Elements

Number of Elements: Use the "Number of Elements" input to set how many elements your character has (1–12). Click "Update" to apply changes.
Assigning Features: Drag a feat item from your inventory or the items directory onto a node to assign it. The node's background will update to the item's image.
Removing Features: Drag the feature off the node to remove it.
Toggling Awakened/Dormant State: Double-click a node to toggle between awakened and dormant states. Dormant nodes are greyed out, non-editable, and cannot be rolled.
Toggling Corruption: Right-click a node twice within 500ms to toggle corruption. Corrupted nodes display a dark overlay, animated cracks, and a pulsing red aura.
Theme Color: Use the "Theme Color" picker to choose a color for the UI. This applies to nodes, text, borders, and chat messages.

Rolling Elemental Dice

Click the name of an awakened element (e.g., "Fire") to roll a 1d6 plus the element's bonus (the value in the node's input field).
The roll result appears in the chat with a custom template, styled with your selected theme color.

🎨 Visuals

Awakened Nodes: Bright and glowing with the theme color, fully interactable.
Dormant Nodes: Greyed out with a dark overlay, non-editable, and non-rollable.
Corrupted Nodes: Display a dark overlay, animated cracks, and a pulsing red aura, indicating corruption.
Custom Chat Messages: Elemental dice rolls appear in the chat with a styled template, using the theme color for borders, text, and shadows.

🛠️ Development
Prerequisites

Foundry VTT (tested with v10 and later).
A D&D 5e system installed (though the module can be adapted for other systems).

Project Structure
elemental-module/
├── asset/ # Assets (e.g., images, sounds)
├── src/ # Source code
│ ├── core/ # Core logic
│ │ ├── node-renderer.js # Handles node rendering and interactions
│ │ ├── node-store.js # Manages persistent storage of node data
│ ├── elements-tab/ # Elements tab UI logic
│ │ ├── node-ui.js # Configures the Elements tab UI
│ │ ├── tab-controller.js # Controls tab injection
│ │ ├── tab-injector.js # Injects the tab into the sheet
│ │ ├── tab-state.js # Manages tab state
│ ├── hooks/ # Foundry VTT hooks
│ ├── utils/ # Utility functions
├── styles/ # CSS styles
│ ├── sheet.css # Styles for the Elements tab and chat messages
├── templates/ # Handlebars templates
│ ├── elements-tab.hbs # Template for the Elements tab
│ ├── elemental-roll.hbs # Template for custom roll chat messages
├── **tests**/ # Unit tests
├── module.json # Module manifest
├── README.md # This file

Contributing

Fork the repository.
Create a new branch for your feature (git checkout -b feature/your-feature).
Make your changes and commit them (git commit -m "Add your feature").
Push to your branch (git push origin feature/your-feature).
Open a pull request with a description of your changes.

Known Issues

None at this time. If you encounter any bugs, please open an issue on GitHub!

📜 License
This module is licensed under the MIT License. See the LICENSE file for details.
🙏 Acknowledgments

Inspired by the Element System narrative power system.
Built with love for the Foundry VTT community.
Special thanks to the Foundry VTT team for providing an amazing platform.

Happy Roleplaying! 🎲✨
