import { useEffect, useState } from "react";
import { useCollectionProgress } from "../../hooks/useCollection";
import styles from "./CollectionProgress.module.scss";

export default function CollectionProgress() {
  const { acquired, total, percentage } = useCollectionProgress();

  // Animate on mount by transitioning from 0% to the real value.
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setAnimatedProgress(percentage));
    return () => cancelAnimationFrame(raf);
  }, [percentage]);

  const progressBarColor =
    percentage > 80 ? "#4caf50" : percentage < 41 ? "#d03118" : "#f4bd53";

  return (
    <>
      <div className={styles.collectionProgressLabel}>
        <h2>Completion</h2>
        <p>{`${acquired}/${total} - ${percentage}%`}</p>
      </div>
      <div className={styles.collectionProgressBar}>
        <div
          className={styles.collectionProgressBarFill}
          style={{
            width: `${animatedProgress}%`,
            backgroundColor: progressBarColor,
          }}
        />
      </div>
    </>
  );
}
