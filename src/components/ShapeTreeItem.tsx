import type { CSSProperties, PropsWithChildren } from "react";
import styles from "./ShapeTree.module.css";

export default function ShapeTreeItem({
  children,
  shapeId,
  depth = 0,
  onSelect,
}: PropsWithChildren<{
  shapeId: string;
  depth?: number;
  onSelect: (shapeId: string) => void;
}>) {
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
        onSelect(shapeId);
        e.stopPropagation();
      }}
    >
      {children}
    </div>
  );
}
