import { memo, useEffect, useState } from "react";
import type { CSSProperties } from "react";
import Accordion from "./Accordion";
import ShapeTypeIcon from "./ShapeTypeIcon";
import ShapeTreeItem from "./ShapeTreeItem";
import styles from "./ShapeTree.module.css";
import type { ShapeNode } from "../shapes/ShapeProvider";

type ShapeTreeNodeProps = {
  shape: ShapeNode;
  depth?: number;
  isSelected: boolean;
  getShapeById: (id: string) => ShapeNode | undefined;
  onDelete: (shapeId: string) => void;
  onSelect: (shapeId: string) => void;
  selectedShapeId: string | null;
};

function ShapeTreeNode({
  shape,
  depth = 0,
  isSelected,
  getShapeById,
  onDelete,
  onSelect,
  selectedShapeId,
}: ShapeTreeNodeProps) {
  const hasChildren = shape.childIds.length > 0;
  const [isExpanded, setIsExpanded] = useState(hasChildren);

  useEffect(() => {
    if (hasChildren) {
      setIsExpanded(true);
    }
  }, [hasChildren]);

  const selectedHeaderStyle = isSelected
    ? {
        backgroundColor: "#036",
        borderColor: "#93c5fd",
        boxShadow: "inset 0 0 0 1px rgb(147 197 253 / 0.2)",
      }
    : undefined;
  const rowStyle = {
    ...(selectedHeaderStyle ?? {}),
    "--tree-depth": depth,
  } as CSSProperties;
  const shapeLabel = `${shape.type} ${shape.displayNumber}`;

  const labelContent = (
    <div className={styles.nodeLabel}>
      {!hasChildren && <span className={styles.toggleSpacer} aria-hidden="true" />}
      <span
        className={styles.colorDot}
        data-testid={`shape-color-${shape.id}`}
        style={{ backgroundColor: shape.color }}
      />
      <ShapeTypeIcon type={shape.type} />
      <span className={styles.shapeTitle} title={shapeLabel}>
        {shapeLabel}
      </span>
    </div>
  );

  const deleteButton = (
    <button
      aria-label="Delete shape"
      className={styles.deleteButton}
      data-testid={`delete-shape-${shape.id}`}
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onDelete(shape.id);
      }}
    >
      <svg
        aria-hidden="true"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9 3H15L16 5H20V7H4V5H8L9 3ZM6 9H18L17 20C16.95 20.55 16.5 21 15.94 21H8.06C7.5 21 7.05 20.55 7 20L6 9ZM10 11V18H12V11H10ZM12 11V18H14V11H12Z"
          fill="currentColor"
        />
      </svg>
    </button>
  );

  return (
    <ShapeTreeItem shapeId={shape.id} depth={depth} onSelect={onSelect}>
      {hasChildren ? (
        <Accordion
          open={isExpanded}
          label={labelContent}
          toggleTestId={`toggle-shape-${shape.id}`}
          headerTestId={`shape-header-${shape.id}`}
          headerSelected={isSelected}
          headerClassName={`${styles.nodeHeader} ${
            isSelected ? styles.nodeHeaderSelected : ""
          }`}
          headerStyle={rowStyle}
          labelGroupClassName={styles.nodeHeaderIndented}
          onToggle={(event) => {
            event.stopPropagation();
            setIsExpanded((current) => !current);
          }}
          actions={deleteButton}
        >
          <div className={styles.children} data-testid={`shape-children-${shape.id}`}>
            {shape.childIds.map((childId) => {
              const childShape = getShapeById(childId);
              if (!childShape) {
                return null;
              }

              return (
                <MemoizedShapeTreeNode
                  key={childId}
                  shape={childShape}
                  depth={depth + 1}
                  isSelected={childId === selectedShapeId}
                  getShapeById={getShapeById}
                  onDelete={onDelete}
                  onSelect={onSelect}
                  selectedShapeId={selectedShapeId}
                />
              );
            })}
          </div>
        </Accordion>
      ) : (
        <div
          data-testid={`shape-header-${shape.id}`}
          data-selected={isSelected ? "true" : "false"}
          className={`${styles.nodeHeader} ${
            isSelected ? styles.nodeHeaderSelected : ""
          }`}
          style={rowStyle}
        >
          <div className={styles.nodeHeaderIndented}>{labelContent}</div>
          {deleteButton}
        </div>
      )}
    </ShapeTreeItem>
  );
}

const MemoizedShapeTreeNode = memo(ShapeTreeNode);

export default MemoizedShapeTreeNode;
