const NAME_REGEX = /^[A-Za-z]+(?: [A-Za-z]+)*$/;

/**
 * Return today's local date formatted as YYYY-MM-DD for <input type="date" max=...>.
 */
export function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Validate a single patient form field using the exact same rules as the FastAPI backend.
 * Returns an error string if invalid, or "" if valid.
 */
export function validatePatientField(field, value, options = {}) {
  switch (field) {
    case "name": {
      const trimmed = typeof value === "string" ? value.trim() : "";
      if (!trimmed) {
        return "Name is required";
      }
      if (trimmed.length < 2 || trimmed.length > 100) {
        return "Name must be between 2 and 100 characters";
      }
      if (!NAME_REGEX.test(trimmed)) {
        return "Name must contain only letters and single spaces between words";
      }
      return "";
    }

    case "age": {
      const raw = value === null || value === undefined ? "" : String(value).trim();
      if (!raw) {
        return "Age is required";
      }
      if (!/^-?\d+$/.test(raw)) {
        return "Age must be a whole number between 0 and 120";
      }
      const parsed = Number(raw);
      if (!Number.isInteger(parsed) || parsed < 0 || parsed > 120) {
        return "Age must be between 0 and 120";
      }
      return "";
    }

    case "gender": {
      const allowed = options.genders || [];
      if (!value) {
        return "Gender is required";
      }
      if (allowed.length > 0 && !allowed.includes(value)) {
        return "Please select a valid gender";
      }
      return "";
    }

    case "ward": {
      const allowed = options.wards || [];
      if (!value) {
        return "Ward is required";
      }
      if (allowed.length > 0 && !allowed.includes(value)) {
        return "Please select a valid ward";
      }
      return "";
    }

    case "department": {
      const allowed = options.departments || [];
      if (!value) {
        return "Department is required";
      }
      if (allowed.length > 0 && !allowed.includes(value)) {
        return "Please select a valid department";
      }
      return "";
    }

    case "doctor": {
      const allowed = options.doctors || [];
      if (!value) {
        return "Doctor is required";
      }
      if (allowed.length > 0 && !allowed.includes(value)) {
        return "Please select a valid doctor";
      }
      return "";
    }

    case "admission_date": {
      if (!value) {
        return "Admission date is required";
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return "Please enter a valid date";
      }
      const parsed = new Date(`${value}T00:00:00`);
      if (Number.isNaN(parsed.getTime())) {
        return "Please enter a valid date";
      }
      if (value > getTodayDateString()) {
        return "Admission date cannot be in the future";
      }
      return "";
    }

    case "status": {
      const allowed = options.statuses || ["Admitted", "Discharged"];
      if (!value) {
        return "Status is required";
      }
      if (!allowed.includes(value)) {
        return "Status must be Admitted or Discharged";
      }
      return "";
    }

    default:
      return "";
  }
}

/**
 * Validate all patient fields at once and return { errors, isValid }.
 */
export function validatePatientForm(values, options = {}) {
  const fields = [
    "name",
    "age",
    "gender",
    "ward",
    "department",
    "doctor",
    "admission_date",
    "status",
  ];

  const errors = {};
  for (const field of fields) {
    const message = validatePatientField(field, values[field], options);
    if (message) {
      errors[field] = message;
    }
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}

