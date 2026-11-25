import React from "react";
import StatusBadge from "./StatusBadge";

export default function PatientTable({
  patients,
  dischargingId,
  onEdit,
  onDelete,
  onDischarge,
}) {
  return (
    <div className="table-wrapper">
      <table className="patient-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Age</th>
            <th>Gender</th>
            <th>Ward</th>
            <th>Department</th>
            <th>Doctor</th>
            <th>Admission Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => {
            const isDischarged = patient.status === "Discharged";
            const isDischarging = dischargingId === patient.id;

            return (
              <tr key={patient.id}>
                <td className="patient-name-cell">{patient.name}</td>
                <td>{patient.age}</td>
                <td>{patient.gender}</td>
                <td>{patient.ward}</td>
                <td>{patient.department}</td>
                <td>{patient.doctor}</td>
                <td>{patient.admission_date}</td>
                <td>
                  <StatusBadge status={patient.status} />
                </td>
                <td>
                  <div className="table-actions">
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
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

