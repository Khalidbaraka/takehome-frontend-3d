import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import ShapeTree from "./src/components/ShapeTree";
import ShapePanel from "./src/components/ShapePanel";
import ResizableRightSidebar from "./src/components/ResizableRightSidebar";
import ThreeEngineController from "./src/3d/engine";
import SceneCanvas from "./src/components/SceneCanvas";
import Toolbar from "./src/toolbar";
import { ShapeProvider, type ShapeActions } from "./src/shapes/ShapeProvider";
import "./styles/app.css";

export interface AppHandle {
  cleanup: () => void;
}

function AppShell({
  onReady,
}: {
  onReady: (actions: ShapeActions) => void;
}) {
  return (
    <ShapeProvider onReady={onReady}>
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
  let actions: ShapeActions | undefined;

  const handleDeleteKey = (event: KeyboardEvent) => {
    if (event.key === "Delete" || event.key === "Backspace") {
      actions?.deleteSelectedShape();
    }
  };
  window.addEventListener("keydown", handleDeleteKey);

  const appRoot: Root = createRoot(root);
  flushSync(() => {
    appRoot.render(
      <AppShell
        onReady={(nextActions) => {
          actions = nextActions;
        }}
      />,
    );
  });

  return {
    cleanup() {
      window.removeEventListener("keydown", handleDeleteKey);
      appRoot.unmount();
      ThreeEngineController.dispose();
      root.innerHTML = "";
    },
  };
}

export const app = import.meta.env.MODE === "test" ? undefined : initializeApp();
