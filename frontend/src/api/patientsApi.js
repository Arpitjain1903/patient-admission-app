const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8000"
).replace(/\/+$/, "");

/**
 * Parse API responses uniformly and surface structured validation errors
 * returned by FastAPI (HTTP 422 / 400 / 404).
 */
async function handleResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    const error = new Error("Request failed");
    error.status = response.status;

    if (data && Array.isArray(data.detail)) {
      const fieldErrors = {};
      for (const item of data.detail) {
        if (item.field && item.message) {
          fieldErrors[item.field] = item.message;
        }
      }
      error.fieldErrors = fieldErrors;
      error.message =
        data.detail.map((item) => item.message).join("; ") ||
        "Validation failed";
    } else if (data && typeof data.detail === "string") {
      error.message = data.detail;
    } else {
      error.message = `Server responded with status ${response.status}`;
    }

    throw error;
  }

  return data;
}

/**
 * Fetch allowed dropdown options from the backend single source of truth.
 */
export async function fetchOptions() {
  const response = await fetch(`${API_BASE_URL}/api/options`);
  return handleResponse(response);
}

/**
 * Fetch patients matching optional search text and combinable filter values.
 */
export async function fetchPatients(filters = {}) {
  const params = new URLSearchParams();

  if (filters.search && filters.search.trim()) {
    params.set("search", filters.search.trim());
  }
  if (filters.ward) {
    params.set("ward", filters.ward);
  }
  if (filters.department) {
    params.set("department", filters.department);
  }
  if (filters.doctor) {
    params.set("doctor", filters.doctor);
  }

  const queryString = params.toString();
  const url = queryString
    ? `${API_BASE_URL}/api/patients?${queryString}`
    : `${API_BASE_URL}/api/patients`;

  const response = await fetch(url);
  return handleResponse(response);
}

/**
 * Create a new patient admission record.
 */
export async function createPatient(payload) {
  const response = await fetch(`${API_BASE_URL}/api/patients`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

/**
 * Update an existing patient admission record by ID.
 */
export async function updatePatient(id, payload) {
  const response = await fetch(`${API_BASE_URL}/api/patients/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

/**
 * Mark a patient as Discharged.
 */
export async function dischargePatient(id) {
  const response = await fetch(`${API_BASE_URL}/api/patients/${id}/discharge`, {
    method: "PATCH",
  });
  return handleResponse(response);
}

/**
 * Permanently delete a patient record by ID.
 */
export async function deletePatient(id) {
  const response = await fetch(`${API_BASE_URL}/api/patients/${id}`, {
    method: "DELETE",
  });
  return handleResponse(response);
}

