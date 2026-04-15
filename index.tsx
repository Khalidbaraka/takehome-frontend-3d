import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import ShapeTree from "./src/components/ShapeTree";
import ShapePanel from "./src/components/ShapePanel";
import ResizableRightSidebar from "./src/components/ResizableRightSidebar";
import ThreeEngineController from "./src/3d/engine";
import SceneCanvas from "./src/components/SceneCanvas";
import Toolbar from "./src/toolbar";
import { ShapeProvider, useShapes } from "./src/shapes/ShapeProvider";
import "./styles/app.css";

export interface AppHandle {
  cleanup: () => void;
}

function GlobalShortcuts() {
  const { deleteSelectedShape } = useShapes();

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
  return (
    <ShapeProvider>
      <GlobalShortcuts />
      <nav className="top-toolbar">
        <Toolbar />
      </nav>
      <div className="main-container">
        <aside id="shape-panel" className="left-bar">
          <ShapePanel />
        </aside>
        <main id="main-view" className="center-area">
          <SceneCanvas />
        </main>
        <ResizableRightSidebar>
          <ShapeTree />
        </ResizableRightSidebar>
      </div>
    </ShapeProvider>
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
