import React from "react";

export default function StatusBadge({ status }) {
  const isDischarged = status === "Discharged";
  const badgeClass = isDischarged
    ? "status-badge status-discharged"
    : "status-badge status-admitted";

  return <span className={badgeClass}>{status}</span>;
}

