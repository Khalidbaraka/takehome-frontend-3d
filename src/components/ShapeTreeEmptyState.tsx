import styles from "./ShapeTree.module.css";

export default function ShapeTreeEmptyState() {
  return (
    <div className={styles.emptyState}>
      <p className={styles.emptyStateTitle}>No shapes yet.</p>
      <p className={styles.emptyStateBody}>Add one from the left panel.</p>
    </div>
  );
}
