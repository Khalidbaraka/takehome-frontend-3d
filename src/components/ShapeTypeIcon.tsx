import styles from "./ShapeTree.module.css";

const ShapeTypeIcon: React.FC<{ type: string }> = ({ type }) => {
  if (type === "sphere") {
    return (
      <svg
        aria-hidden="true"
        className={styles.shapeIcon}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }

  if (type === "cylinder") {
    return (
      <svg
        aria-hidden="true"
        className={styles.shapeIcon}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse
          cx="12"
          cy="6"
          rx="7"
          ry="3"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M5 6V18C5 19.657 8.134 21 12 21C15.866 21 19 19.657 19 18V6"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className={styles.shapeIcon}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="5"
        y="5"
        width="14"
        height="14"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
};

export default ShapeTypeIcon;
