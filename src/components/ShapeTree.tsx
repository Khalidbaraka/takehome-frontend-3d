import $ from "jquery";
import React, { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import "../../styles/shape_properties.css";
import styles from "./ShapeTree.module.css";
import { getNotificationCenter } from "../notification";
import type { Mesh } from "three";
import ThreeEngineController from "../3d/engine";
import type { MainViewController } from "../3d/MainViewController";
import ShapeTreeEmptyState from "./ShapeTreeEmptyState";
import ShapeTreeNode from "./ShapeTreeNode";

const ShapeTree: React.FC<{ controller: MainViewController }> = ({
  controller,
}) => {
  const [projectName, setProjectName] = useState($(".project-name").text());
  const [numOfShapes, setNumOfShapes] = useState(0);
  const [shapes, setShapes] = useState<Mesh[]>([]);
  const [selectedShape, setSelectedShape] = useState<Mesh | null>(null);

  getNotificationCenter().subscribe("projectName", (newName) => {
    setProjectName(newName);
  });

  useEffect(() => {
    getNotificationCenter().subscribe("shapeAdded", (shapes: Mesh[]) => {
      setShapes(shapes);
      setNumOfShapes(ThreeEngineController.getInstance().getObjectCount());
    });
    getNotificationCenter().subscribe("shapeRemoved", (shapes: Mesh[]) => {
      setShapes(shapes);
      setNumOfShapes(ThreeEngineController.getInstance().getObjectCount());
    });

    getNotificationCenter().subscribe("shapeSelected", (shape: Mesh | null) => {
      setSelectedShape(shape);
    });
  }, []);

  return (
    <div className={styles.container}>
      <h3>{projectName}</h3>
      <span>{numOfShapes} objects</span>

      <div className={styles.treeContainer}>
        {shapes.length === 0 ? (
          <ShapeTreeEmptyState />
        ) : (
          shapes.map((shape) => (
            <ShapeTreeNode
              key={`${shape.uuid}-${shape.userData.displayNumber ?? "shape"}`}
              shape={shape}
              selectedShape={selectedShape}
              level={0}
              handleDeleteShape={(shape) => controller.shapeDeleted(shape)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export function createShapeTree(controller: MainViewController): void {
  const listRoot = document.getElementById("shape-properties");
  if (listRoot) {
    const root = createRoot(listRoot);
    flushSync(() => {
      root.render(<ShapeTree controller={controller} />);
    });
  }
}
