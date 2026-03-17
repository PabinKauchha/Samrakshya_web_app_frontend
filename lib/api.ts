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

export function registerUser(name: string, email: string, password: string) {
  return request<{ message: string; user: User }>("/api/users/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
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
