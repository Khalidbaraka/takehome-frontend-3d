import type { PropsWithChildren } from "react";
import styles from "./ShapeTree.module.css";
import { useShapes } from "../shapes/ShapeProvider";

export default function ShapeTreeItem({
  children,
  shapeId,
}: PropsWithChildren<{ shapeId: string }>) {
  const { selectShape } = useShapes();

  return (
    <div
      className={styles.shapeItem}
      data-testid={`shape-item-${shapeId}`}
      onClick={(e) => {
        selectShape(shapeId);
        e.stopPropagation();
      }}
    >
      {children}
    </div>
  );
}
