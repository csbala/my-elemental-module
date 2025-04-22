# My Elemental Module 🌟

**My Elemental Module** is a Foundry VTT module that enhances D&D 5e character sheets by adding a custom "Elements" tab. This tab allows players to manage elemental attributes with a visually appealing node-based UI, where they can set and visualize a number of elemental nodes in a circular layout. The module is designed for seamless multiplayer use, with data persistence across clients using Foundry’s flag system.

## Features ✨

- **Custom Elements Tab**: Adds a new "Elements" tab to D&D 5e character sheets.
- **Node-Based UI**: Visualize elemental attributes with a circular node layout (1–12 nodes).
- **Persistent Data**: Node count and active tab state sync across all clients using Foundry’s flag system.
- **User-Friendly**: Intuitive interface with visual feedback for updates and input validation.
- **Unit Tested**: Includes a comprehensive Jest test suite to ensure reliability.

## Screenshots 📸

_The Elements tab in action, showing the node-based UI._

## Installation 🚀

1. **Download the Module**:

   - Download the latest release from GitHub Releases (or your preferred hosting platform).

2. **Install in Foundry VTT**:

   - Copy the `my-elemental-module` folder to your Foundry VTT `modules` directory (`Data/modules/` in your Foundry VTT installation).

3. **Enable the Module**:

   - Launch Foundry VTT, go to the "Add-on Modules" tab in the setup menu, and click "Install Module".
   - Search for "My Elemental Module" and click "Install", or manually install by copying the module folder as described above.
   - Once installed, go to your world’s "Manage Modules" settings and enable "My Elemental Module".

## Usage 🛠️

1. **Open a Character Sheet**:

   - Create or open a D&D 5e character sheet in your Foundry VTT world.

2. **Navigate to the Elements Tab**:

   - You’ll see a new "Elements" tab with a gem icon in the character sheet.

3. **Set Elemental Nodes**:

   - Enter a number between 1 and 12 in the "Number of Elements" input field.
   - Click the "Update" button to visualize the nodes in a circular layout.
   - The node count and active tab state are automatically saved and synced across all clients.

## Development Setup 💻

### Prerequisites

- **Node.js**: Ensure you have Node.js installed (version 18 or higher recommended).
- **Foundry VTT**: Version 12 or higher.
- **D&D 5e System**: Version 3.x or higher.

### File Structure

- `src/bootstrap.js`: Entry point that initializes all hooks.
- `src/`: Main source directory.
  - `core/`: Core logic for node rendering and storage.
    - `node-renderer.js`: Renders the node UI.
    - `node-store.js`: Manages node count persistence.
  - `elements-tab/`: Logic specific to the Elements tab.
    - `tab-controller.js`: Orchestrates Elements tab logic.
    - `tab-injector.js`: Injects the tab button and content.
    - `tab-state.js`: Manages active tab state.
    - `node-ui.js`: Sets up the node UI in the tab.
  - `hooks/`: Hook setups.
    - `init.js`: Handles the init hook.
    - `render.js`: Handles the renderActorSheet5eCharacter hook.
    - `update.js`: Handles the updateActor hook.
    - `close.js`: Handles the closeActorSheet5eCharacter hook.
  - `utils/`: General utilities.
    - `debounce.js`: Debounce utility for preventing rapid re-renders.
- `templates/`: Contains the Handlebars template for the Elements tab.
- `styles/`: Contains the CSS for the Elements tab.

### Testing

Unit tests are written using Jest to ensure the module’s reliability. To run the tests:

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run the tests:

   ```bash
   npm run test
   ```

3. Run tests in watch mode:

   ```bash
   npm run test:watch
   ```

4. View test coverage:

   - After running `npm run test`, open `coverage/lcov-report/index.html` in a browser to view the coverage report.

### Git Ignore

A `.gitignore` file is included to exclude unnecessary files from version control, such as:

- `node_modules/`: Node.js dependencies.
- `coverage/`: Jest test coverage reports.
- Editor/IDE files (e.g., `.vscode/`, `.idea/`).
- System files (e.g., `.DS_Store`, `Thumbs.db`).

Ensure this file is present in your repository to keep it clean.

## Contributing 🤝

Contributions are welcome! If you’d like to contribute to My Elemental Module, please follow these steps:

1. **Fork the Repository**:

   - Fork the repository on GitHub (or your preferred hosting platform).

2. **Clone Your Fork**:

   ```bash
   git clone https://github.com/your-username/my-elemental-module.git
   cd my-elemental-module
   ```

3. **Install Dependencies**:

   ```bash
   npm install
   ```

4. **Make Changes**:

   - Create a new branch for your feature or bugfix:

     ```bash
     git checkout -b feature/your-feature-name
     ```

   - Make your changes and ensure tests pass:

     ```bash
     npm run test
     ```

5. **Commit and Push**:

   ```bash
   git add .
   git commit -m "Add your feature or fix description"
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**:

   - Open a pull request on GitHub, describing your changes and linking any related issues.

## Roadmap 🗺️

- **Element Types**: Allow players to assign specific element types (e.g., Fire, Water) to nodes.
- **Drag-and-Drop UI**: Enable drag-and-drop functionality to rearrange nodes.
- **Enhanced Visuals**: Add animations and custom styling options for the node UI.
- **Additional Tabs**: Support for more custom tabs (e.g., Magic, Skills).

## License 📜

This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgments 🙏

- **Foundry VTT Community**: For their amazing platform and support.
- **Jest**: For providing a robust testing framework.
- **D&D 5e System**: For the awesome system integration.

---

**Happy Gaming!** 🎲
