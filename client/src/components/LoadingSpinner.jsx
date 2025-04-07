import React from "react";

function LoadingSpinner() {
  return (
    <div className="spinner-overlay">
      <div className="spinner-border text-light" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
}

export default LoadingSpinner;
