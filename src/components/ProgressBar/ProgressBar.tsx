const ProgressBar = ({ progress }) => {
  // Ensure progress is between 0 and 100
  const validProgress = Math.min(100, Math.max(0, progress));

  return (
    <div
      style={{
        width: "100%",
        backgroundColor: "#e0e0e0",
        borderRadius: "8px",
        maxWidth: "425px",
      }}
    >
      <div
        style={{
          width: `${validProgress}%`,
          height: "20px",
          backgroundColor: "#4caf50",
          borderRadius: "8px",
          transition: "width 0.3s ease-in-out", // Smooth animation
        }}
      />
    </div>
  );
};

export default ProgressBar;
