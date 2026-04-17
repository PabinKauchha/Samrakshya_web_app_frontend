// ─────────────────────────────────────────────────────────────────────────────
// Problems Service — mock persistence layer for "Share a Problem with Admin"
// ─────────────────────────────────────────────────────────────────────────────
// This module is the ONLY place that touches storage/API for the problems
// feature. Swap the mock internals (load/save/delay/makeId) with real fetch
// calls when the backend is ready — every call site in the UI stays intact.
//
// Replace the bodies below with:
//   await fetch(`${API}/api/problems/...`, { headers, method, body })
// and then parse+return the response. Do not rename the exports.
// ─────────────────────────────────────────────────────────────────────────────

export type ProblemStatus = "pending" | "in_review" | "resolved";

export type ProblemCategory =
  | "bug"
  | "feature"
  | "account"
  | "safety"
  | "billing"
  | "other";

export type ProblemReply = {
  id: string;
  author: "user" | "admin";
  authorEmail?: string;
  message: string;
  createdAt: string;
};

export type Problem = {
  id: string;
  userEmail: string;
  title: string;
  description: string;
  category: ProblemCategory;
  status: ProblemStatus;
  replies: ProblemReply[];
  createdAt: string;
  updatedAt: string;
};

export type CreateProblemInput = {
  userEmail: string;
  title: string;
  description: string;
  category: ProblemCategory;
};

// ── Display metadata (shared by user + admin UIs) ────────────────────────────
export const STATUS_META: Record<
  ProblemStatus,
  { label: string; chip: string; dot: string; text: string; border: string }
> = {
  pending: {
    label: "Pending",
    chip: "bg-amber-50 text-amber-800 border-amber-200",
    dot: "bg-amber-500",
    text: "text-amber-800",
    border: "border-amber-200",
  },
  in_review: {
    label: "In Review",
    chip: "bg-indigo-50 text-indigo-800 border-indigo-200",
    dot: "bg-indigo-500",
    text: "text-indigo-800",
    border: "border-indigo-200",
  },
  resolved: {
    label: "Resolved",
    chip: "bg-emerald-50 text-emerald-800 border-emerald-200",
    dot: "bg-emerald-500",
    text: "text-emerald-800",
    border: "border-emerald-200",
  },
};

export const CATEGORY_META: Record<ProblemCategory, { label: string }> = {
  bug: { label: "Bug / Error" },
  feature: { label: "Feature Request" },
  account: { label: "Account" },
  safety: { label: "Safety Concern" },
  billing: { label: "Billing" },
  other: { label: "Other" },
};

export const CATEGORY_OPTIONS: { value: ProblemCategory; label: string }[] = (
  Object.keys(CATEGORY_META) as ProblemCategory[]
).map((v) => ({ value: v, label: CATEGORY_META[v].label }));

// ── Internal storage helpers (MOCK) ──────────────────────────────────────────
const STORAGE_KEY = "samrakshya.problems.v1";
const UPDATE_EVENT = "samrakshya:problems:updated";

function isBrowser() {
  return typeof window !== "undefined";
}

function load(): Problem[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Problem[]) : [];
  } catch {
    return [];
  }
}

function save(problems: Problem[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(problems));
  // Notify same-tab listeners (the `storage` event only fires across tabs).
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
}

function delay<T>(value: T, ms = 260): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function makeId(prefix = "p") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export async function listUserProblems(userEmail: string): Promise<Problem[]> {
  // TODO(api): GET `${API}/api/problems?user=${encodeURIComponent(userEmail)}`
  const all = load();
  return delay(
    all
      .filter((p) => p.userEmail.toLowerCase() === userEmail.toLowerCase())
      .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
  );
}

export async function listAllProblems(): Promise<Problem[]> {
  // TODO(api): GET `${API}/api/admin/problems` with admin JWT header.
  const all = load();
  return delay(
    [...all].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
  );
}

export async function getProblem(id: string): Promise<Problem | null> {
  // TODO(api): GET `${API}/api/problems/${id}`
  return delay(load().find((p) => p.id === id) ?? null);
}

export async function createProblem(
  input: CreateProblemInput
): Promise<Problem> {
  // TODO(api): POST `${API}/api/problems` with JSON body = input.
  const title = input.title.trim();
  const description = input.description.trim();
  if (!title) throw new Error("Title is required.");
  if (!description) throw new Error("Description is required.");
  if (!input.userEmail) throw new Error("You must be signed in to submit.");

  const now = new Date().toISOString();
  const problem: Problem = {
    id: makeId(),
    userEmail: input.userEmail,
    title,
    description,
    category: input.category,
    status: "pending",
    replies: [],
    createdAt: now,
    updatedAt: now,
  };
  const all = load();
  all.unshift(problem);
  save(all);
  return delay(problem);
}

export async function addReply(params: {
  id: string;
  author: "user" | "admin";
  authorEmail?: string;
  message: string;
}): Promise<Problem | null> {
  // TODO(api): POST `${API}/api/problems/${id}/replies` with JSON body.
  const message = params.message.trim();
  if (!message) throw new Error("Reply cannot be empty.");

  const all = load();
  const idx = all.findIndex((p) => p.id === params.id);
  if (idx === -1) return delay(null);

  const reply: ProblemReply = {
    id: makeId("r"),
    author: params.author,
    authorEmail: params.authorEmail,
    message,
    createdAt: new Date().toISOString(),
  };

  const current = all[idx];
  // When an admin replies to a pending problem, auto-promote to "in_review".
  const nextStatus: ProblemStatus =
    params.author === "admin" && current.status === "pending"
      ? "in_review"
      : current.status;

  all[idx] = {
    ...current,
    replies: [...current.replies, reply],
    status: nextStatus,
    updatedAt: reply.createdAt,
  };
  save(all);
  return delay(all[idx]);
}

export async function updateStatus(
  id: string,
  status: ProblemStatus
): Promise<Problem | null> {
  // TODO(api): PATCH `${API}/api/admin/problems/${id}` with JSON body { status }.
  const all = load();
  const idx = all.findIndex((p) => p.id === id);
  if (idx === -1) return delay(null);
  all[idx] = { ...all[idx], status, updatedAt: new Date().toISOString() };
  save(all);
  return delay(all[idx]);
}

// ── Subscription for live sync between user and admin views ──────────────────
// Returns an unsubscribe function. Listens to both cross-tab (storage) and
// same-tab (custom event) writes.
export function subscribeProblems(onChange: () => void): () => void {
  if (!isBrowser()) return () => {};
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) onChange();
  };
  const onLocal = () => onChange();
  window.addEventListener("storage", onStorage);
  window.addEventListener(UPDATE_EVENT, onLocal as EventListener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(UPDATE_EVENT, onLocal as EventListener);
  };
}

// ── Convenience selector for the admin dashboard summary tiles ───────────────
export function summarise(problems: Problem[]) {
  return {
    total: problems.length,
    pending: problems.filter((p) => p.status === "pending").length,
    inReview: problems.filter((p) => p.status === "in_review").length,
    resolved: problems.filter((p) => p.status === "resolved").length,
  };
}
