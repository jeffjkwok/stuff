import styles from "./ProgressBar.module.scss";

interface ProgressProps {
  progress: number;
}

import { useEffect, useState } from "react";

const ProgressBar = ({ progress }: ProgressProps) => {
  // Ensure progress is between 0 and 100
  const validProgress = Math.min(100, Math.max(0, progress));

  // Animate on mount by transitioning from 0% to the real value.
  const [animatedProgress, setAnimatedProgress] = useState(0);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setAnimatedProgress(validProgress));
    return () => cancelAnimationFrame(raf);
  }, [validProgress]);

  const progressBarColor =
    validProgress > 80 ? "#4caf50" : validProgress < 41 ? "#d03118" : "#f4bd53";

  return (
    <div className={styles.progressBar}>
      <div
        className={styles.progress}
        style={{
          width: `${animatedProgress}%`,
          backgroundColor: progressBarColor,
        }}
      />
    </div>
  );
};

export default ProgressBar;
