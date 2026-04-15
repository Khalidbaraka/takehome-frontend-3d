import { useMemo } from "react";
import "../../styles/shape_properties.css";
import styles from "./ShapeTree.module.css";
import ShapeTreeEmptyState from "./ShapeTreeEmptyState";
import ShapeTreeNode from "./ShapeTreeNode";
import { useShapes } from "../shapes/ShapeProvider";

export default function ShapeTree() {
  const {
    projectName,
    shapeCount,
    rootShapeIds,
    selectedShapeId,
    getShapeById,
    deleteShape,
    selectShape,
  } = useShapes();
  const selectedPathIds = useMemo(() => {
    const pathIds = new Set<string>();
    let currentId = selectedShapeId;

    while (currentId) {
      pathIds.add(currentId);
      currentId = getShapeById(currentId)?.parentId ?? null;
    }

    return pathIds;
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
                isOnSelectedPath={selectedPathIds.has(shapeId)}
                getShapeById={getShapeById}
                onDelete={deleteShape}
                onSelect={selectShape}
                selectedShapeId={selectedShapeId}
                selectedPathIds={selectedPathIds}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
