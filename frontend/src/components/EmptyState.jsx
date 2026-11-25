import React from "react";

export default function EmptyState({ hasActiveFilters, onClearFilters }) {
  return (
    <div className="state-panel" role="status">
      <h2 className="state-title">No patients found</h2>
      <p className="state-description">
        {hasActiveFilters
          ? "No patient records match your current search or filter criteria."
          : "There are currently no patient admission records. Click \"+ Add Patient\" to register one."}
      </p>
      {hasActiveFilters && (
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onClearFilters}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

