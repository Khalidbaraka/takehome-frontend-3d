import React from "react";
import styles from "./ShapeTree.module.css";

const ChevronIcon: React.FC<{
  direction: "up" | "down" | "left" | "right";
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  dataTestId?: string;
}> = ({ direction, onClick, dataTestId }) => {
  const rotationDegrees = {
    up: 0,
    right: 90,
    down: 180,
    left: 270,
  }[direction];

  return (
    <button
      className={styles.chevronButton}
      data-testid={dataTestId}
      onClick={onClick}
      type="button"
      aria-label="Toggle children"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          transform: `rotate(${rotationDegrees}deg)`,
          transition: "transform 180ms ease",
        }}
      >
        <path d="M12 8L6 14H18L12 8Z" fill="currentColor" />
      </svg>
    </button>
  );
};

export default ChevronIcon;
