import { forwardRef } from "react";
import type { CSSProperties, PropsWithChildren } from "react";
import styles from "./ShapeTree.module.css";

type ShapeTreeItemProps = PropsWithChildren<{
  shapeId: string;
  depth?: number;
  onSelect: (shapeId: string) => void;
}>;

const ShapeTreeItem = forwardRef<HTMLDivElement, ShapeTreeItemProps>(
  function ShapeTreeItem({ children, shapeId, depth = 0, onSelect }, ref) {
    const style = {
      "--tree-depth": depth,
    } as CSSProperties;

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
      onSelect(shapeId);
      event.stopPropagation();
    };

    return (
      <div
        ref={ref}
        className={styles.shapeItem}
        data-testid={`shape-item-${shapeId}`}
        style={style}
        onClick={handleClick}
      >
        {children}
      </div>
    );
  },
);

export default ShapeTreeItem;
