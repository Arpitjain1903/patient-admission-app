import React from "react";
import StatusBadge from "./StatusBadge";

export default function PatientCard({
  patient,
  isDischarging,
  onEdit,
  onDelete,
  onDischarge,
}) {
  const isDischarged = patient.status === "Discharged";

  return (
    <article className="patient-card">
      <div className="patient-card-header">
        <div>
          <h3 className="patient-card-name">{patient.name}</h3>
          <p className="patient-card-meta">
            {patient.age} yrs &bull; {patient.gender}
          </p>
        </div>
        <StatusBadge status={patient.status} />
      </div>

      <dl className="patient-card-details">
        <div className="detail-item">
          <dt>Ward</dt>
          <dd>{patient.ward}</dd>
        </div>
        <div className="detail-item">
          <dt>Department</dt>
          <dd>{patient.department}</dd>
        </div>
        <div className="detail-item">
          <dt>Doctor</dt>
          <dd>{patient.doctor}</dd>
        </div>
        <div className="detail-item">
          <dt>Admission Date</dt>
          <dd>{patient.admission_date}</dd>
        </div>
      </dl>

      <div className="patient-card-actions">
        {!isDischarged && (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => onDischarge(patient)}
            disabled={isDischarging}
          >
            {isDischarging ? "Updating..." : "Discharge"}
          </button>
        )}
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => onEdit(patient)}
        >
          Edit
        </button>
        <button
          type="button"
          className="btn btn-danger btn-sm"
          onClick={() => onDelete(patient)}
        >
          Delete
        </button>
      </div>
    </article>
  );
}

