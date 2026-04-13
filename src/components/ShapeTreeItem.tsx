import type { PropsWithChildren } from "react";
import type { Mesh } from "three";
import styles from "./ShapeTree.module.css";
import { getNotificationCenter } from "../notification";

export default function ShapeTreeItem({
  children,
  shape,
}: PropsWithChildren<{ isSelected: boolean; shape: Mesh }>) {
  return (
    <div
      className={styles.shapeItem}
      data-testid={`shape-item-${shape.uuid}`}
      onClick={(e) => {
        getNotificationCenter().notify("shapeSelected", shape);
        e.stopPropagation();
      }}
    >
      {children}
    </div>
  );
}
