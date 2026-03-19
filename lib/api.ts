const BASE_URL = "http://localhost:4000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error || body?.message || `Request failed (${res.status})`);
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return res.json() as Promise<T>;
  }
  return res.text() as unknown as Promise<T>;
}

// ── Types ──────────────────────────────────────────────────────────────────

export interface EmergencyContact {
  _id: string;
  name: string;
  phone: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
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

// ── API functions ──────────────────────────────────────────────────────────

export function loginUser(email: string, password: string) {
  return request<{ message: string; user: User }>("/api/users/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function registerUser(name: string, email: string, password: string) {
  return request<{ message: string; user: User }>("/api/users/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export function getUserProfile(email: string) {
  return request<User>(`/api/users/profile?email=${encodeURIComponent(email)}`);
}

export function addContact(email: string, name: string, phone: string) {
  return request<{ message: string; contacts: EmergencyContact[] }>("/api/users/add-contact", {
    method: "POST",
    body: JSON.stringify({ email, name, phone }),
  });
}

export function triggerSOS(email: string, latitude: number, longitude: number) {
  return request<{ message: string; location: string }>("/api/sos/trigger", {
    method: "POST",
    body: JSON.stringify({ email, latitude, longitude }),
  });
}

export function confirmSOS() {
  return request<string>("/api/sos/confirm");
}

export function getSOSHistory() {
  return request<SOSEvent[]>("/api/sos/history");
}

// ── Incidents ──────────────────────────────────────────────────────────────

export interface Incident {
  _id: string;
  email: string;
  description: string;
  videoUrl: string;
  createdAt: string;
}

export async function reportIncident(email: string, description: string, videoBlob: Blob, fileName: string): Promise<{ message: string; incident: Incident }> {
  const form = new FormData();
  form.append("email", email);
  form.append("description", description);
  form.append("video", videoBlob, fileName);

  const res = await fetch(`${BASE_URL}/api/incidents/report`, { method: "POST", body: form });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error || body?.message || `Request failed (${res.status})`);
  }
  return res.json();
}

export function getIncidents(email?: string): Promise<Incident[]> {
  const qs = email ? `?email=${encodeURIComponent(email)}` : "";
  return request<Incident[]>(`/api/incidents${qs}`);
}
