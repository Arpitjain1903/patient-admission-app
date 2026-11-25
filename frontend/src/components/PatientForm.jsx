import React, { useEffect, useState } from "react";
import {
  getTodayDateString,
  validatePatientField,
  validatePatientForm,
} from "../utils/validators";

function buildInitialValues(initialData) {
  if (initialData) {
    return {
      name: initialData.name || "",
      age: initialData.age !== undefined ? String(initialData.age) : "",
      gender: initialData.gender || "",
      ward: initialData.ward || "",
      department: initialData.department || "",
      doctor: initialData.doctor || "",
      admission_date: initialData.admission_date || getTodayDateString(),
      status: initialData.status || "Admitted",
    };
  }

  return {
    name: "",
    age: "",
    gender: "",
    ward: "",
    department: "",
    doctor: "",
    admission_date: getTodayDateString(),
    status: "Admitted",
  };
}

export default function PatientForm({
  initialData,
  options,
  isSubmitting,
  serverErrors,
  onSubmit,
  onCancel,
}) {
  const isEditMode = Boolean(initialData);
  const [values, setValues] = useState(() => buildInitialValues(initialData));
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Reset form state whenever the user opens Add vs Edit for a different patient
  useEffect(() => {
    setValues(buildInitialValues(initialData));
    setErrors({});
    setTouched({});
    setHasSubmitted(false);
  }, [initialData]);

  // Surface any backend 422 field errors directly beneath the matching fields
  useEffect(() => {
    if (serverErrors && Object.keys(serverErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...serverErrors }));
      const nextTouched = {};
      for (const field of Object.keys(serverErrors)) {
        nextTouched[field] = true;
      }
      setTouched((prev) => ({ ...prev, ...nextTouched }));
    }
  }, [serverErrors]);

  const today = getTodayDateString();
  const validationResult = validatePatientForm(values, options);

  function handleChange(field, nextValue) {
    const nextValues = { ...values, [field]: nextValue };
    setValues(nextValues);

    if (touched[field] || hasSubmitted) {
      const message = validatePatientField(field, nextValue, options);
      setErrors((prev) => {
        const updated = { ...prev };
        if (message) {
          updated[field] = message;
        } else {
          delete updated[field];
        }
        return updated;
      });
    }
  }

  function handleBlur(field) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const message = validatePatientField(field, values[field], options);
    setErrors((prev) => {
      const updated = { ...prev };
      if (message) {
        updated[field] = message;
      } else {
        delete updated[field];
      }
      return updated;
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    setHasSubmitted(true);

    const allTouched = {
      name: true,
      age: true,
      gender: true,
      ward: true,
      department: true,
      doctor: true,
      admission_date: true,
      status: true,
    };
    setTouched(allTouched);

    const { errors: formErrors, isValid } = validatePatientForm(values, options);
    setErrors(formErrors);

    if (!isValid) {
      return;
    }

    onSubmit({
      ...values,
      name: values.name.trim(),
      age: Number(values.age),
    });
  }

  return (
    <form className="patient-form" onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <div className="form-field form-field-full">
          <label htmlFor="patient-name" className="form-label">
            Patient Name <span className="required-star">*</span>
          </label>
          <input
            id="patient-name"
            name="name"
            type="text"
            className={`input-control ${errors.name ? "input-error" : ""}`}
            placeholder="e.g. Aarav Patel"
            value={values.name}
            onChange={(e) => handleChange("name", e.target.value)}
            onBlur={() => handleBlur("name")}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
          {errors.name && (
            <p id="name-error" className="field-error" role="alert">
              {errors.name}
            </p>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="patient-age" className="form-label">
            Age <span className="required-star">*</span>
          </label>
          <input
            id="patient-age"
            name="age"
            type="number"
            min="0"
            max="120"
            step="1"
            className={`input-control ${errors.age ? "input-error" : ""}`}
            placeholder="0 - 120"
            value={values.age}
            onChange={(e) => handleChange("age", e.target.value)}
            onBlur={() => handleBlur("age")}
            aria-invalid={Boolean(errors.age)}
            aria-describedby={errors.age ? "age-error" : undefined}
          />
          {errors.age && (
            <p id="age-error" className="field-error" role="alert">
              {errors.age}
            </p>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="patient-gender" className="form-label">
            Gender <span className="required-star">*</span>
          </label>
          <select
            id="patient-gender"
            name="gender"
            className={`input-control ${errors.gender ? "input-error" : ""}`}
            value={values.gender}
            onChange={(e) => handleChange("gender", e.target.value)}
            onBlur={() => handleBlur("gender")}
            aria-invalid={Boolean(errors.gender)}
            aria-describedby={errors.gender ? "gender-error" : undefined}
          >
            <option value="">Select gender</option>
            {options.genders.map((gender) => (
              <option key={gender} value={gender}>
                {gender}
              </option>
            ))}
          </select>
          {errors.gender && (
            <p id="gender-error" className="field-error" role="alert">
              {errors.gender}
            </p>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="patient-ward" className="form-label">
            Ward <span className="required-star">*</span>
          </label>
          <select
            id="patient-ward"
            name="ward"
            className={`input-control ${errors.ward ? "input-error" : ""}`}
            value={values.ward}
            onChange={(e) => handleChange("ward", e.target.value)}
            onBlur={() => handleBlur("ward")}
            aria-invalid={Boolean(errors.ward)}
            aria-describedby={errors.ward ? "ward-error" : undefined}
          >
            <option value="">Select ward</option>
            {options.wards.map((ward) => (
              <option key={ward} value={ward}>
                {ward}
              </option>
            ))}
          </select>
          {errors.ward && (
            <p id="ward-error" className="field-error" role="alert">
              {errors.ward}
            </p>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="patient-department" className="form-label">
            Department <span className="required-star">*</span>
          </label>
          <select
            id="patient-department"
            name="department"
            className={`input-control ${errors.department ? "input-error" : ""}`}
            value={values.department}
            onChange={(e) => handleChange("department", e.target.value)}
            onBlur={() => handleBlur("department")}
            aria-invalid={Boolean(errors.department)}
            aria-describedby={
              errors.department ? "department-error" : undefined
            }
          >
            <option value="">Select department</option>
            {options.departments.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>
          {errors.department && (
            <p id="department-error" className="field-error" role="alert">
              {errors.department}
            </p>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="patient-doctor" className="form-label">
            Doctor <span className="required-star">*</span>
          </label>
          <select
            id="patient-doctor"
            name="doctor"
            className={`input-control ${errors.doctor ? "input-error" : ""}`}
            value={values.doctor}
            onChange={(e) => handleChange("doctor", e.target.value)}
            onBlur={() => handleBlur("doctor")}
            aria-invalid={Boolean(errors.doctor)}
            aria-describedby={errors.doctor ? "doctor-error" : undefined}
          >
            <option value="">Select doctor</option>
            {options.doctors.map((doctor) => (
              <option key={doctor} value={doctor}>
                {doctor}
              </option>
            ))}
          </select>
          {errors.doctor && (
            <p id="doctor-error" className="field-error" role="alert">
              {errors.doctor}
            </p>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="patient-admission-date" className="form-label">
            Admission Date <span className="required-star">*</span>
          </label>
          <input
            id="patient-admission-date"
            name="admission_date"
            type="date"
            max={today}
            className={`input-control ${
              errors.admission_date ? "input-error" : ""
            }`}
            value={values.admission_date}
            onChange={(e) => handleChange("admission_date", e.target.value)}
            onBlur={() => handleBlur("admission_date")}
            aria-invalid={Boolean(errors.admission_date)}
            aria-describedby={
              errors.admission_date ? "admission-date-error" : undefined
            }
          />
          {errors.admission_date && (
            <p id="admission-date-error" className="field-error" role="alert">
              {errors.admission_date}
            </p>
          )}
        </div>

        <div className="form-field form-field-full">
          <label htmlFor="patient-status" className="form-label">
            Status <span className="required-star">*</span>
          </label>
          <select
            id="patient-status"
            name="status"
            className={`input-control ${errors.status ? "input-error" : ""}`}
            value={values.status}
            onChange={(e) => handleChange("status", e.target.value)}
            onBlur={() => handleBlur("status")}
            aria-invalid={Boolean(errors.status)}
            aria-describedby={errors.status ? "status-error" : undefined}
          >
            {(options.statuses || ["Admitted", "Discharged"]).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          {errors.status && (
            <p id="status-error" className="field-error" role="alert">
              {errors.status}
            </p>
          )}
        </div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting || (hasSubmitted && !validationResult.isValid)}
        >
          {isSubmitting
            ? "Saving..."
            : isEditMode
            ? "Save Changes"
            : "Add Patient"}
        </button>
      </div>
    </form>
  );
}

