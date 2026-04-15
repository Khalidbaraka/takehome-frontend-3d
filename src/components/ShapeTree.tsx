import { useMemo } from "react";
import "../../styles/shape_properties.css";
import styles from "./ShapeTree.module.css";
import ShapeTreeEmptyState from "./ShapeTreeEmptyState";
import ShapeTreeNode from "./ShapeTreeNode";
import { useShapeActions, useShapeState } from "../shapes/ShapeProvider";

type ShapeTreeProps = {
  projectName: string;
};

export default function ShapeTree({ projectName }: ShapeTreeProps) {
  const { shapeCount, rootShapeIds, selectedShapeId, getShapeById } = useShapeState();
  const { deleteShape, selectShape } = useShapeActions();

  const selectedPath = useMemo(() => {
    if (!selectedShapeId) {
      return null;
    }

    const path: string[] = [];
    let currentId: string | null = selectedShapeId;

    while (currentId) {
      const shape = getShapeById(currentId);
      if (!shape) {
        return null;
      }

      path.unshift(shape.id);
      currentId = shape.parentId;
    }

    return path;
  }, [getShapeById, selectedShapeId]);

  return (
    <div className={styles.container}>
      <h3>{projectName}</h3>
      <span>{shapeCount} objects</span>

      <div className={styles.treeContainer}>
        {rootShapeIds.length === 0 ? (
          <ShapeTreeEmptyState />
        ) : (
          rootShapeIds.map((shapeId) => {
            const shape = getShapeById(shapeId);
            if (!shape) {
              return null;
            }

            return (
              <ShapeTreeNode
                key={shapeId}
                shape={shape}
                isSelected={shapeId === selectedShapeId}
                getShapeById={getShapeById}
                onDelete={deleteShape}
                onSelect={selectShape}
                selectedPath={selectedPath?.[0] === shapeId ? selectedPath : null}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
