import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeTheme } from "./hooks/useTheme";

// Initialize theme before render to prevent flash
initializeTheme();

createRoot(document.getElementById("root")!).render(<App />);
