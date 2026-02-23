import type { ReactNode } from "react";
import styles from "./SlidingPane.module.scss";

interface SlidingPaneProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function SlidingPane({
  isOpen,
  onClose,
  children,
}: SlidingPaneProps) {
  return (
    <>
      <div
        className={`${styles.slidingPaneOverlay} ${isOpen ? styles.slidingPaneActive : ""}`}
      ></div>
      <aside
        className={`${styles.slidingPane} ${isOpen ? styles.slidingPaneOpen : ""}`}
      >
        <button onClick={onClose}>Close</button>
        <div className={styles.slidingPaneContent}>{children}</div>
      </aside>
    </>
  );
}
