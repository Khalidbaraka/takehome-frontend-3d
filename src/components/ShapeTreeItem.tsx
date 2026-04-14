import type { CSSProperties, PropsWithChildren } from "react";
import styles from "./ShapeTree.module.css";
import { useShapes } from "../shapes/ShapeProvider";

export default function ShapeTreeItem({
  children,
  shapeId,
  depth = 0,
}: PropsWithChildren<{ shapeId: string; depth?: number }>) {
  const { selectShape } = useShapes();

  return (
    <div
      className={styles.shapeItem}
      data-testid={`shape-item-${shapeId}`}
      style={
        {
          "--tree-depth": depth,
        } as CSSProperties
      }
      onClick={(e) => {
        selectShape(shapeId);
        e.stopPropagation();
      }}
    >
      {children}
    </div>
  );
}
