import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import ShapeTree from "./src/components/ShapeTree";
import ShapePanel from "./src/components/ShapePanel";
import ResizableRightSidebar from "./src/components/ResizableRightSidebar";
import ThreeEngineController from "./src/3d/engine";
import SceneCanvas from "./src/components/SceneCanvas";
import Toolbar from "./src/toolbar";
import { ShapeProvider, useShapeActions } from "./src/shapes/ShapeProvider";
import { ThemeProvider } from "./src/theme/ThemeProvider";
import "./styles/app.css";

export interface AppHandle {
  cleanup: () => void;
}

function GlobalShortcuts() {
  const { deleteSelectedShape } = useShapeActions();

  useEffect(() => {
    const handleDeleteKey = (event: KeyboardEvent) => {
      if (event.key === "Delete" || event.key === "Backspace") {
        deleteSelectedShape();
      }
    };

    window.addEventListener("keydown", handleDeleteKey);

    return () => {
      window.removeEventListener("keydown", handleDeleteKey);
    };
  }, [deleteSelectedShape]);

  return null;
}

function AppShell() {
  const [projectName, setProjectName] = useState("Untitled Project");

  return (
    <ThemeProvider>
      <ShapeProvider>
        <GlobalShortcuts />
        <nav className="top-toolbar">
          <Toolbar
            projectName={projectName}
            setProjectName={setProjectName}
          />
        </nav>
        <div className="main-container">
          <aside id="shape-panel" className="left-bar">
            <ShapePanel />
          </aside>
          <main id="main-view" className="center-area">
            <SceneCanvas />
          </main>
          <ResizableRightSidebar>
            <ShapeTree projectName={projectName} />
          </ResizableRightSidebar>
        </div>
      </ShapeProvider>
    </ThemeProvider>
  );
}

export function initializeApp(root: HTMLElement = document.body): AppHandle {
  root.innerHTML = "";

  const appRoot: Root = createRoot(root);
  appRoot.render(<AppShell />);

  return {
    cleanup() {
      appRoot.unmount();
      ThreeEngineController.dispose();
      root.innerHTML = "";
    },
  };
}

export const app = import.meta.env.MODE === "test" ? undefined : initializeApp();
