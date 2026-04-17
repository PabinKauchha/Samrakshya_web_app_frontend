const BASE_URL = "http://localhost:4321";

// Always get fresh token
function getAuthHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

// For FormData requests we must not set `Content-Type` manually.
function getAuthHeadersForFormData() {
  const token = localStorage.getItem("token");
  return {
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

// Universal request handler
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options?.headers || {}),
    },
  });

  let body: any = null;

  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    throw new Error(
      body?.error || body?.message || `Request failed (${res.status})`
    );
  }

  return body as T;
}

//
// ───────── TYPES ─────────
//

export interface EmergencyContact {
  _id: string;
  name: string;
  phone: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  emergencyContacts: EmergencyContact[];
}

export interface SOSEvent {
  _id: string;
  email: string;
  latitude: number;
  longitude: number;
  locationLink: string;
  status: "active" | "confirmed";
  time: string;
}

export interface Incident {
  _id: string;
  email: string;
  description: string;
  videoUrl: string;
  createdAt: string;
}

//
// ───────── AUTH ─────────
//

export function loginUser(email: string, password: string) {
  return request<{
    message: string;
    data: { user: User; token: string };
  }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function registerUser(name: string, email: string, password: string) {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export function forgotPassword(email: string) {
  return request<{ message: string }>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function resetPassword(token: string, password: string) {
  return request<{ message: string }>(`/api/auth/reset-password/${token}`, {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}

export function getUserProfile() {
  return request<{
    data: { user: User & { emergencyContacts: any[] } };
  }>("/api/auth/me");
}

//
// ───────── CONTACTS ─────────
//

export function addContact(data: {
  name: string;
  phone: string;
  relationship: string;
}) {
  const cleanPhone = data.phone.replace(/\D/g, "");

  return request<{
    success: boolean;
    data: { emergencyContact: EmergencyContact };
  }>("/api/emergency-contacts", {
    method: "POST",
    body: JSON.stringify({
      name: data.name,
      phone: cleanPhone,
      relationship: data.relationship,
    }),
  });
}

export function deleteContact(id: string) {
  return request(`/api/emergency-contacts/${id}`, {
    method: "DELETE",
  });
}

//
// ───────── SOS ─────────
//

export function triggerSOS(latitude: number, longitude: number) {
  return request<{
    data: {
      sosId: string;
      location: string;
    };
  }>("/api/sos/trigger", {
    method: "POST",
    body: JSON.stringify({ latitude, longitude }),
  });
}

export function getActiveSOS() {
  return request<{
    data: { activeSos: any };
  }>("/api/sos/active");
}

export function cancelSOS(sosId: string) {
  return request(`/api/sos/cancel/${sosId}`, {
    method: "POST",
  });
}

// Admin-only: list currently active SOS events (array).
export function adminGetActiveSOSList() {
  return request<{
    success: boolean;
    message: string;
    data: Array<{ _id: string; status: string; user?: { name?: string; email?: string } }>;
  }>(`/api/admin/active-sos`);
}

// Admin-only: resolve an active SOS on behalf of a user.
export function adminResolveSOS(sosId: string) {
  return request<{
    success: boolean;
    message: string;
    data: { sosId: string; status: string };
  }>(`/api/admin/sos/${sosId}/resolve`, {
    method: "POST",
  });
}

// Uses the shared request helper so auth headers are included.
export function confirmSOS(sosId: string) {
  return request(`/api/sos/confirm/${sosId}`, {
    method: "POST",
  });
}

export async function getSOSHistory() {
  try {
    const res = await request<{
      data: { history: SOSEvent[] };
    }>("/api/sos/history");

    return res.data?.history || [];
  } catch (err) {
    console.error("SOS history error:", err);
    return [];
  }
}

//
// ───────── INCIDENTS ─────────
//

// Incident API helpers
export async function getIncidents(email: string) {
  const res = await fetch(`${BASE_URL}/api/incidents?email=${email}`, {
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  return data.data?.incidents || [];
}

// upload
export async function reportIncident(
  email: string,
  description: string,
  videoBlob: Blob,
  fileName: string
) {
  const form = new FormData();
  form.append("email", email);
  form.append("description", description);
  form.append("video", videoBlob, fileName);

  const res = await fetch(`${BASE_URL}/api/incidents/report`, {
    method: "POST",
    body: form,
    headers: getAuthHeadersForFormData(),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error || body?.message);
  }

  return res.json();
}