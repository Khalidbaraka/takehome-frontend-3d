import React from "react";
import type { Shape } from "../3d/buildShape";

type ButtonProps = {
  label: Shape;
  onClick: () => void;
};

const SHAPE_LABELS: Record<Shape, string> = {
  sphere: "Sphere",
  cube: "Cube",
  cylinder: "Cylinder",
};

const ShapeButton: React.FC<ButtonProps> = ({ label, onClick }) => {
  return (
    <button
      className="shape-panel-button"
      type="button"
      onClick={onClick}
      aria-label={`Add ${SHAPE_LABELS[label]}`}
    >
      <span className="shape-panel-button-icon" aria-hidden="true">
        {label === "sphere" ? (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="2" />
          </svg>
        ) : label === "cube" ? (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 3L19 7V17L12 21L5 17V7L12 3Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path d="M12 3V21" stroke="currentColor" strokeWidth="2" />
            <path d="M5 7L12 11L19 7" stroke="currentColor" strokeWidth="2" />
          </svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <ellipse
              cx="12"
              cy="6"
              rx="6.5"
              ry="2.5"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M5.5 6V18C5.5 19.38 8.41 20.5 12 20.5C15.59 20.5 18.5 19.38 18.5 18V6"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        )}
      </span>
      <span className="shape-panel-button-label">{SHAPE_LABELS[label]}</span>
    </button>
  );
};

export default ShapeButton;
