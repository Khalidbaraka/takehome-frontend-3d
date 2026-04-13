import React, { useEffect, useState } from "react";
import type { Mesh } from "three";
import Accordion from "./Accordion";
import ShapeTypeIcon from "./ShapeTypeIcon";
import ShapeTreeItem from "./ShapeTreeItem";
import styles from "./ShapeTree.module.css";

const geometryTypeLabels: Record<string, string> = {
  BoxGeometry: "cube",
  CylinderGeometry: "cylinder",
  SphereGeometry: "sphere",
};

export default function ShapeTreeNode({
  shape,
  selectedShape,
  level,
  handleDeleteShape,
}: {
  shape: Mesh;
  selectedShape: Mesh | null;
  level: number;
  handleDeleteShape: (shape: Mesh) => void;
}) {
  const hasChildren = shape.children.length > 0;
  const [isExpanded, setIsExpanded] = useState(hasChildren);

  useEffect(() => {
    if (hasChildren) {
      setIsExpanded(true);
    }
  }, [hasChildren]);

  const geometryType =
    geometryTypeLabels[shape.geometry.type] ?? shape.geometry.type;
  const material = Array.isArray(shape.material)
    ? shape.material[0]
    : shape.material;
  const color =
    (material as { color?: { getStyle: () => string } }).color?.getStyle() ??
    "unknown";
  const displayNumber = shape.userData.displayNumber ?? 0;
  const isSelected = shape.uuid === selectedShape?.uuid;
  const selectedHeaderStyle = isSelected
    ? {
        backgroundColor: "#036",
        borderColor: "#93c5fd",
        boxShadow: "inset 0 0 0 1px rgb(147 197 253 / 0.2)",
      }
    : undefined;

  const labelContent = (
    <div className={styles.nodeLabel}>
      {!hasChildren && (
        <span className={styles.toggleSpacer} aria-hidden="true" />
      )}
      <span
        className={styles.colorDot}
        data-testid={`shape-color-${shape.uuid}`}
        style={{
          backgroundColor: color,
        }}
      />
      <ShapeTypeIcon type={geometryType} />
      <span className={styles.shapeTitle}>
        {`${geometryType} ${displayNumber}`}
      </span>
    </div>
  );

  const deleteButton = (
    <button
      aria-label="Delete shape"
      className={styles.deleteButton}
      data-testid={`delete-shape-${shape.uuid}`}
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        handleDeleteShape(shape);
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
    <ShapeTreeItem key={`${shape.uuid}-${displayNumber}`} shape={shape} isSelected={isSelected}>
      {hasChildren ? (
        <Accordion
          open={isExpanded}
          label={labelContent}
          toggleTestId={`toggle-shape-${shape.uuid}`}
          headerTestId={`shape-header-${shape.uuid}`}
          headerSelected={isSelected}
          headerClassName={`${styles.nodeHeader} ${
            isSelected ? styles.nodeHeaderSelected : ""
          }`}
          headerStyle={selectedHeaderStyle}
          onToggle={(e) => {
            e.stopPropagation();
            setIsExpanded((current) => !current);
          }}
          actions={deleteButton}
        >
          <div
            className={styles.children}
            data-testid={`shape-children-${shape.uuid}`}
          >
            {shape.children.map((child) => (
              <ShapeTreeNode
                key={`${child.uuid}-${child.userData.displayNumber ?? "shape"}`}
                shape={child as Mesh}
                selectedShape={selectedShape}
                level={level + 1}
                handleDeleteShape={handleDeleteShape}
              />
            ))}
          </div>
        </Accordion>
      ) : (
        <div
          data-testid={`shape-header-${shape.uuid}`}
          data-selected={isSelected ? "true" : "false"}
          className={`${styles.nodeHeader} ${
            isSelected ? styles.nodeHeaderSelected : ""
          }`}
          style={selectedHeaderStyle}
        >
          {labelContent}
          {deleteButton}
        </div>
      )}
    </ShapeTreeItem>
  );
}
