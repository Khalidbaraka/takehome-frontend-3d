import ChevronIcon from "./ChevronIcon";
import styles from "./Accordion.module.css";

const Accordion: React.FC<{
  open: boolean;
  label: React.ReactNode;
  onToggle: (event: React.MouseEvent<HTMLButtonElement>) => void;
  actions?: React.ReactNode;
  toggleTestId?: string;
  headerClassName?: string;
  headerTestId?: string;
  headerStyle?: React.CSSProperties;
  headerSelected?: boolean;
  labelGroupClassName?: string;
  children?: React.ReactNode;
}> = ({
  open,
  label,
  onToggle,
  actions,
  toggleTestId,
  headerClassName,
  headerTestId,
  headerStyle,
  headerSelected,
  labelGroupClassName,
  children,
}) => {
  return (
    <div className={styles.root}>
      <div
        className={`${styles.header} ${headerClassName ?? ""}`}
        data-testid={headerTestId}
        data-selected={headerSelected ? "true" : "false"}
        style={headerStyle}
      >
        <div className={`${styles.labelGroup} ${labelGroupClassName ?? ""}`}>
          <ChevronIcon
            dataTestId={toggleTestId}
            direction={open ? "down" : "right"}
            onClick={onToggle}
          />
          <span className={styles.label}>{label}</span>
        </div>
        {actions}
      </div>
      <div
        aria-hidden={!open}
        data-state={open ? "open" : "closed"}
        className={`${styles.contentWrap} ${open ? styles.contentWrapOpen : ""}`}
      >
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
};

export default Accordion;
