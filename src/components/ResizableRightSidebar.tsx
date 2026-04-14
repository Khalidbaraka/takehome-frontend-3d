import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PropsWithChildren,
} from "react";
import styles from "./ResizableRightSidebar.module.css";

const DEFAULT_WIDTH_PX = 280;
const MIN_WIDTH_PX = DEFAULT_WIDTH_PX;
const MIN_CENTER_WIDTH_PX = 320;

export default function ResizableRightSidebar({ children }: PropsWithChildren) {
  const panelRef = useRef<HTMLElement | null>(null);
  const [width, setWidth] = useState(DEFAULT_WIDTH_PX);

  useEffect(() => {
    window.dispatchEvent(new Event("resize"));
  }, [width]);

  const startResize = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    const container = panelRef.current?.parentElement;
    if (!container) {
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const maxWidth = Math.max(MIN_WIDTH_PX, containerRect.width - MIN_CENTER_WIDTH_PX);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const nextWidth = containerRect.right - moveEvent.clientX;
      setWidth(Math.min(maxWidth, Math.max(MIN_WIDTH_PX, nextWidth)));
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <aside
      id="shape-properties"
      ref={panelRef}
      className={`right-bar ${styles.rightBarResizable}`}
      style={{ width: `${width}px`, minWidth: `${MIN_WIDTH_PX}px` }}
      data-testid="shape-properties-panel"
    >
      <button
        aria-label="Resize shape tree panel"
        className={styles.rightBarResizeHandle}
        data-testid="right-panel-resize-handle"
        type="button"
        onMouseDown={startResize}
      />
      {children}
    </aside>
  );
}
