import React from "react";

export default function FilterBar({
  filters,
  options,
  onFilterChange,
  onClearFilters,
  hasActiveFilters,
}) {
  return (
    <section className="filter-bar" aria-label="Search and filter patients">
      <div className="filter-field filter-search">
        <label htmlFor="filter-search" className="filter-label">
          Search by Name
        </label>
        <input
          id="filter-search"
          type="search"
          className="input-control"
          placeholder="Search patient name..."
          value={filters.search}
          onChange={(e) => onFilterChange("search", e.target.value)}
        />
      </div>

      <div className="filter-field">
        <label htmlFor="filter-ward" className="filter-label">
          Ward
        </label>
        <select
          id="filter-ward"
          className="input-control"
          value={filters.ward}
          onChange={(e) => onFilterChange("ward", e.target.value)}
        >
          <option value="">All Wards</option>
          {options.wards.map((ward) => (
            <option key={ward} value={ward}>
              {ward}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-field">
        <label htmlFor="filter-department" className="filter-label">
          Department
        </label>
        <select
          id="filter-department"
          className="input-control"
          value={filters.department}
          onChange={(e) => onFilterChange("department", e.target.value)}
        >
          <option value="">All Departments</option>
          {options.departments.map((department) => (
            <option key={department} value={department}>
              {department}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-field">
        <label htmlFor="filter-doctor" className="filter-label">
          Doctor
        </label>
        <select
          id="filter-doctor"
          className="input-control"
          value={filters.doctor}
          onChange={(e) => onFilterChange("doctor", e.target.value)}
        >
          <option value="">All Doctors</option>
          {options.doctors.map((doctor) => (
            <option key={doctor} value={doctor}>
              {doctor}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onClearFilters}
          disabled={!hasActiveFilters}
        >
          Clear filters
        </button>
      </div>
    </section>
  );
}

