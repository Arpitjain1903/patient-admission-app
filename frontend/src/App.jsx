import React, { useCallback, useEffect, useState } from "react";
import {
  createPatient,
  deletePatient,
  dischargePatient,
  fetchOptions,
  fetchPatients,
  updatePatient,
} from "./api/patientsApi";
import ConfirmDialog from "./components/ConfirmDialog";
import EmptyState from "./components/EmptyState";
import FilterBar from "./components/FilterBar";
import Header from "./components/Header";
import Modal from "./components/Modal";
import PatientCard from "./components/PatientCard";
import PatientForm from "./components/PatientForm";
import PatientTable from "./components/PatientTable";
import Toast from "./components/Toast";

const INITIAL_FILTERS = {
  search: "",
  ward: "",
  department: "",
  doctor: "",
};

const INITIAL_OPTIONS = {
  genders: [],
  wards: [],
  departments: [],
  doctors: [],
  statuses: ["Admitted", "Discharged"],
};

export default function App() {
  const [patients, setPatients] = useState([]);
  const [options, setOptions] = useState(INITIAL_OPTIONS);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState({});

  const [patientToDelete, setPatientToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dischargingId, setDischargingId] = useState(null);

  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Load shared dropdown options once on startup
  useEffect(() => {
    let ignore = false;

    async function loadOptions() {
      try {
        const data = await fetchOptions();
        if (!ignore) {
          setOptions(data);
        }
      } catch (err) {
        if (!ignore) {
          addToast(err.message || "Failed to load dropdown options", "error");
        }
      }
    }

    loadOptions();
    return () => {
      ignore = true;
    };
  }, [addToast]);

  // Debounce search input to avoid excessive API calls while typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 250);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const loadPatients = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchPatients({
        search: debouncedSearch,
        ward: filters.ward,
        department: filters.department,
        doctor: filters.doctor,
      });
      setPatients(data);
    } catch (err) {
      addToast(err.message || "Failed to load patients", "error");
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, filters.ward, filters.department, filters.doctor, addToast]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  function handleFilterChange(field, value) {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }

  function handleClearFilters() {
    setFilters(INITIAL_FILTERS);
    setDebouncedSearch("");
  }

  function openAddModal() {
    setEditingPatient(null);
    setServerErrors({});
    setIsFormModalOpen(true);
  }

  function openEditModal(patient) {
    setEditingPatient(patient);
    setServerErrors({});
    setIsFormModalOpen(true);
  }

  function closeFormModal() {
    if (isSubmitting) return;
    setIsFormModalOpen(false);
    setEditingPatient(null);
    setServerErrors({});
  }

  async function handleFormSubmit(payload) {
    setIsSubmitting(true);
    setServerErrors({});

    try {
      if (editingPatient) {
        await updatePatient(editingPatient.id, payload);
        addToast("Patient record updated successfully");
      } else {
        await createPatient(payload);
        addToast("Patient admitted successfully");
      }
      setIsFormModalOpen(false);
      setEditingPatient(null);
      await loadPatients();
    } catch (err) {
      if (err.fieldErrors) {
        setServerErrors(err.fieldErrors);
      }
      addToast(err.message || "Could not save patient record", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDischarge(patient) {
    setDischargingId(patient.id);
    try {
      const updated = await dischargePatient(patient.id);
      setPatients((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
      addToast(`${patient.name} marked as Discharged`);
    } catch (err) {
      addToast(err.message || "Failed to discharge patient", "error");
    } finally {
      setDischargingId(null);
    }
  }

  async function handleConfirmDelete() {
    if (!patientToDelete) return;
    setIsDeleting(true);

    try {
      await deletePatient(patientToDelete.id);
      addToast(`${patientToDelete.name} deleted`);
      setPatientToDelete(null);
      await loadPatients();
    } catch (err) {
      addToast(err.message || "Failed to delete patient", "error");
    } finally {
      setIsDeleting(false);
    }
  }

  const hasActiveFilters = Boolean(
    filters.search.trim() || filters.ward || filters.department || filters.doctor
  );

  return (
    <div className="app-shell">
      <Header onAddClick={openAddModal} />

      <main className="main-container">
        <FilterBar
          filters={filters}
          options={options}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        <div className="summary-bar">
          <span>
            {isLoading
              ? "Loading patient records..."
              : `Showing ${patients.length} patient${
                  patients.length === 1 ? "" : "s"
                }`}
          </span>
        </div>

        {isLoading ? (
          <div className="state-panel" role="status" aria-live="polite">
            <div className="spinner" aria-hidden="true" />
            <p className="state-description">Loading patients...</p>
          </div>
        ) : patients.length === 0 ? (
          <EmptyState
            hasActiveFilters={hasActiveFilters}
            onClearFilters={handleClearFilters}
          />
        ) : (
          <>
            <PatientTable
              patients={patients}
              dischargingId={dischargingId}
              onEdit={openEditModal}
              onDelete={setPatientToDelete}
              onDischarge={handleDischarge}
            />

            <div className="patient-cards" aria-label="Patient list">
              {patients.map((patient) => (
                <PatientCard
                  key={patient.id}
                  patient={patient}
                  isDischarging={dischargingId === patient.id}
                  onEdit={openEditModal}
                  onDelete={setPatientToDelete}
                  onDischarge={handleDischarge}
                />
              ))}
            </div>
          </>
        )}
      </main>

      <Modal
        isOpen={isFormModalOpen}
        title={editingPatient ? "Edit Patient" : "Add New Patient"}
        onClose={closeFormModal}
      >
        <PatientForm
          initialData={editingPatient}
          options={options}
          isSubmitting={isSubmitting}
          serverErrors={serverErrors}
          onSubmit={handleFormSubmit}
          onCancel={closeFormModal}
        />
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(patientToDelete)}
        patient={patientToDelete}
        isDeleting={isDeleting}
        onCancel={() => setPatientToDelete(null)}
        onConfirm={handleConfirmDelete}
      />

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

