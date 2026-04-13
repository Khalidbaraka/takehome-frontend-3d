import React from "react";
import "../../styles/shape_panel.css";
import { useShapes } from "../shapes/ShapeProvider";
import Button from "./ShapeButton";

const ShapePanel: React.FC = () => {
  const { createShape } = useShapes();

  return (
    <div className="shape-panel">
      <h2 className="shape-panel-title">Add Shape</h2>
      <div className="shape-panel-list">
        <Button label="sphere" onClick={() => createShape("sphere")} />
        <Button label="cube" onClick={() => createShape("cube")} />
        <Button label="cylinder" onClick={() => createShape("cylinder")} />
      </div>
    </div>
  );
};

export default ShapePanel;
