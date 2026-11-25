import React from "react";
import Modal from "./Modal";

export default function ConfirmDialog({
  isOpen,
  patient,
  isDeleting,
  onCancel,
  onConfirm,
}) {
  return (
    <Modal
      isOpen={isOpen}
      title="Are you sure?"
      onClose={isDeleting ? () => {} : onCancel}
      size="sm"
    >
      <p className="confirm-message">
        Are you sure you want to delete{" "}
        <strong>{patient ? patient.name : "this patient"}</strong>? This action
        cannot be undone.
      </p>
      <div className="form-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={isDeleting}
        >
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-danger"
          onClick={onConfirm}
          disabled={isDeleting}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </Modal>
  );
}

