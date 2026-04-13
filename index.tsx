import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import type { Root } from "react-dom/client";
import { createMainViewController } from "./src/3d/MainViewController";
import CountComponent from "./src/components/CountComponent";
import { createShapeTree } from "./src/components/ShapeTree";
import { createShapePanel } from "./src/components/ShapePanel";
import { createLayout } from "./src/layout";
import { resetNotificationCenter } from "./src/notification";
import { createToolbar } from "./src/toolbar";
import ThreeEngineController from "./src/3d/engine";
import SceneCanvas from "./src/components/SceneCanvas";

export interface AppHandle {
  controller: ReturnType<typeof createMainViewController>;
  cleanup: () => void;
}

export function initializeApp(root: HTMLElement = document.body): AppHandle {
  root.innerHTML = "";
  createLayout(root);
  const shapeController = createMainViewController();

  const handleDeleteKey = (event: KeyboardEvent) => {
    if (event.key === "Delete" || event.key === "Backspace") {
      shapeController.deleteSelectedShape();
    }
  };
  window.addEventListener("keydown", handleDeleteKey);

  createToolbar(root);
  const reactToolbarRoot = document.getElementById("react-toolbar-root");
  let toolbarRoot: Root | undefined;
  if (reactToolbarRoot) {
    toolbarRoot = createRoot(reactToolbarRoot);
    flushSync(() => {
      toolbarRoot!.render(<CountComponent />);
    });
  }
  const reactCanvasRoot = document.getElementById("main-view");
  let canvasRoot: Root | undefined;
  if (reactCanvasRoot) {
    canvasRoot = createRoot(reactCanvasRoot);
    flushSync(() => {
      canvasRoot!.render(
        <SceneCanvas controller={shapeController} />,
      );
    });
  }

  createShapePanel(shapeController);
  createShapeTree(shapeController);

  return {
    controller: shapeController,
    cleanup() {
      window.removeEventListener("keydown", handleDeleteKey);
      toolbarRoot?.unmount();
      canvasRoot?.unmount();
      ThreeEngineController.dispose();
      resetNotificationCenter();
      root.innerHTML = "";
    },
  };
}

export const app =
  import.meta.env.MODE === "test" ? undefined : initializeApp();
