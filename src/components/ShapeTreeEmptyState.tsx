import styles from "./ShapeTree.module.css";

export default function ShapeTreeEmptyState() {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyStateIconRow} aria-hidden="true">
        <svg className={styles.emptyStateIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" />
        </svg>
        <svg className={styles.emptyStateIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="5" y="5" width="14" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" />
        </svg>
        <svg className={styles.emptyStateIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="12" cy="6.5" rx="6" ry="2.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" />
          <path d="M6 6.5V17.5C6 18.88 8.686 20 12 20C15.314 20 18 18.88 18 17.5V6.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" />
        </svg>
      </div>
      <p className={styles.emptyStateTitle}>No shapes yet</p>
      <p className={styles.emptyStateBody}>Add a sphere, cube, or cylinder from the left panel to get started.</p>
    </div>
  );
}
