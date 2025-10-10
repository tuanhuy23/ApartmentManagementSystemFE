### Prerequisites

- Node.js (version 18.18.0 or higher)
- npm or yarn

### Installation

1. Clone or download this project
2. Install dependencies:
   ```bash
   yarn install
   ```

3. Start the development server:
   ```bash
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
yarn run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── App.tsx          # Main application component with calendar
├── App.css          # Custom styles for React Big Calendar
├── index.css        # Global styles and resets
├── main.tsx         # Application entry point
```