import React from "react";

export default function Header({ onAddClick }) {
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="header-title-group">
          <h1 className="header-title">Patient Admission Management</h1>
          <p className="header-subtitle">
            Hospital Ward &amp; Admission Tracking Dashboard
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onAddClick}
        >
          + Add Patient
        </button>
      </div>
    </header>
  );
}

