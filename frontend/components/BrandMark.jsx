import React from "react";
import "./BrandMark.css";

function BrandMark({ size = "medium", className = "" }) {
  return (
    <span className={`brand-mark brand-mark--${size} ${className}`.trim()}>
      <img
        src="/images/coding-campus-logo.png"
        alt=""
        aria-hidden="true"
      />
    </span>
  );
}

export default BrandMark;
