import React from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import "../../styles/shape_panel.css";
import { type MainViewController } from "../3d/MainViewController";
import Button from "./ShapeButton";

const ShapePanel: React.FC<{ controller: MainViewController }> = ({
  controller,
}) => {
  return (
    <div>
      <Button label="sphere" onClick={() => controller.createShape("sphere")} />
      <Button label="cube" onClick={() => controller.createShape("cube")} />
      <Button
        label="cylinder"
        onClick={() => controller.createShape("cylinder")}
      />
    </div>
  );
};

export function createShapePanel(controller: MainViewController) {
  const panelRoot = document.getElementById("shape-panel");
  if (panelRoot) {
    const root = createRoot(panelRoot);
    flushSync(() => {
      root.render(<ShapePanel controller={controller} />);
    });
  }
}
