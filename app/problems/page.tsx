"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Inbox,
  Plus,
  Send,
  MessageSquare,
  HeartHandshake,
  Clock,
  CheckCircle2,
  Loader2,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Header } from "@/components/header";
import { useAuth } from "@/components/auth/auth-provider";
import {
  addReply,
  CATEGORY_META,
  CATEGORY_OPTIONS,
  createProblem,
  listUserProblems,
  Problem,
  ProblemCategory,
  STATUS_META,
  subscribeProblems,
  summarise,
} from "@/lib/problems-service";

const ROSE = "#D81B60";
const ROSE_DARK = "#AD1457";

export default function UserProblemsPage() {
  const router = useRouter();
  const { email, isAuthenticated } = useAuth();

  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);

  // ── Auth gate ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login?redirect=/problems");
    }
  }, [isAuthenticated, router]);

  // ── Data loading + live sync ──────────────────────────────────────────────
  const refresh = useCallback(async () => {
    if (!email) return;
    const data = await listUserProblems(email);
    setProblems(data);
    setLoading(false);
  }, [email]);

  useEffect(() => {
    if (!email) return;
    setLoading(true);
    refresh();
    const unsub = subscribeProblems(refresh);
    return unsub;
  }, [email, refresh]);

  const selected = useMemo(
    () => problems.find((p) => p.id === selectedId) ?? null,
    [problems, selectedId]
  );

  const summary = useMemo(() => summarise(problems), [problems]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleCreated = (newP: Problem) => {
    setComposerOpen(false);
    setSelectedId(newP.id);
    toast.success("Problem submitted. Our team will review shortly.");
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/60 via-white to-rose-50/40">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ── Page header ─────────────────────────────────────────────── */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 transition-colors hover:text-[#AD1457]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Dashboard
            </Link>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Share a problem with admin
            </h1>
            <p className="mt-1 text-[13.5px] text-slate-600">
              Report an issue, request a feature, or flag a safety concern. You&apos;ll get
              updates from our team here.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setComposerOpen((v) => !v)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] px-4 text-[13.5px] font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${ROSE} 0%, ${ROSE_DARK} 100%)`,
              boxShadow: `0 8px 22px -8px ${ROSE_DARK}80`,
            }}
          >
            <Plus className="h-4 w-4" />
            New Problem
          </button>
        </div>

        {/* ── Mini summary strip ──────────────────────────────────────── */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SummaryTile label="All" value={summary.total} Icon={Inbox} tone="neutral" />
          <SummaryTile label="Pending" value={summary.pending} Icon={Clock} tone="amber" />
          <SummaryTile label="In Review" value={summary.inReview} Icon={Loader2} tone="indigo" />
          <SummaryTile label="Resolved" value={summary.resolved} Icon={CheckCircle2} tone="emerald" />
        </div>

        {/* ── Composer ─────────────────────────────────────────────────── */}
        {composerOpen && email && (
          <ProblemComposer
            userEmail={email}
            onCancel={() => setComposerOpen(false)}
            onCreated={handleCreated}
          />
        )}

        {/* ── Main split: list + detail ───────────────────────────────── */}
        <div className="mt-2 grid gap-4 lg:grid-cols-[minmax(0,380px)_1fr]">
          {/* List */}
          <aside className="rounded-[14px] border border-rose-100 bg-white/90 shadow-sm backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-rose-100/70 px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                Your submissions
              </p>
              <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-[#AD1457]">
                {problems.length}
              </span>
            </div>

            {loading ? (
              <ListSkeleton />
            ) : problems.length === 0 ? (
              <EmptyList onStart={() => setComposerOpen(true)} />
            ) : (
              <ul className="max-h-[640px] overflow-y-auto py-1">
                {problems.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(p.id)}
                      className={`group flex w-full flex-col gap-1.5 border-l-2 px-4 py-3 text-left transition-colors ${
                        selectedId === p.id
                          ? "border-[#D81B60] bg-rose-50/70"
                          : "border-transparent hover:bg-rose-50/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="line-clamp-1 text-[13px] font-semibold text-slate-900">
                          {p.title}
                        </p>
                        <StatusChip status={p.status} compact />
                      </div>
                      <p className="line-clamp-2 text-[12px] text-slate-500">
                        {p.description}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-mono uppercase tracking-wider">
                          {CATEGORY_META[p.category].label}
                        </span>
                        <span>{relativeTime(p.updatedAt)}</span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </aside>

          {/* Detail */}
          <section className="min-h-[480px] rounded-[14px] border border-rose-100 bg-white/90 shadow-sm backdrop-blur-sm">
            {selected ? (
              <ProblemDetail
                problem={selected}
                currentEmail={email || ""}
                onChange={refresh}
              />
            ) : (
              <DetailPlaceholder />
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

// ── Composer form ────────────────────────────────────────────────────────────
function ProblemComposer({
  userEmail,
  onCancel,
  onCreated,
}: {
  userEmail: string;
  onCancel: () => void;
  onCreated: (p: Problem) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ProblemCategory>("other");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit =
    title.trim().length >= 3 && description.trim().length >= 10 && !submitting;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const created = await createProblem({
        userEmail,
        title,
        description,
        category,
      });
      onCreated(created);
      setTitle("");
      setDescription("");
      setCategory("other");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not submit.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="mb-4 rounded-[14px] border border-rose-100 bg-white/95 p-5 shadow-lg shadow-rose-900/5 backdrop-blur-sm"
    >
      <div className="mb-4 flex items-center gap-2">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-[10px] text-white"
          style={{
            background: `linear-gradient(135deg, ${ROSE} 0%, ${ROSE_DARK} 100%)`,
          }}
        >
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-[14px] font-bold text-slate-900">New problem</h2>
          <p className="text-[11.5px] text-slate-500">
            Be specific — it helps us respond faster.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
        <Field label="Title">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Short summary of the issue"
            maxLength={120}
            className="h-10 w-full rounded-[10px] border border-slate-200 bg-white px-3 text-[13px] outline-none transition-colors placeholder:text-slate-400 focus:border-[#D81B60]/50 focus:ring-2 focus:ring-[#D81B60]/15"
            required
          />
        </Field>

        <Field label="Category">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ProblemCategory)}
            className="h-10 w-full rounded-[10px] border border-slate-200 bg-white px-3 text-[13px] outline-none transition-colors focus:border-[#D81B60]/50 focus:ring-2 focus:ring-[#D81B60]/15"
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-3">
        <Field label="Description">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What went wrong, what did you expect, and any steps to reproduce?"
            rows={5}
            className="w-full rounded-[10px] border border-slate-200 bg-white px-3 py-2.5 text-[13px] outline-none transition-colors placeholder:text-slate-400 focus:border-[#D81B60]/50 focus:ring-2 focus:ring-[#D81B60]/15"
            required
            minLength={10}
          />
        </Field>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-[11px] text-slate-400">
          Submitting as <span className="font-semibold text-slate-700">{userEmail}</span>
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 rounded-[10px] border border-slate-200 bg-white px-3.5 text-[13px] font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex h-10 items-center gap-2 rounded-[10px] px-4 text-[13px] font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:translate-y-0"
            style={{
              background: `linear-gradient(135deg, ${ROSE} 0%, ${ROSE_DARK} 100%)`,
            }}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Submit
          </button>
        </div>
      </div>
    </form>
  );
}

// ── Detail panel ─────────────────────────────────────────────────────────────
function ProblemDetail({
  problem,
  currentEmail,
  onChange,
}: {
  problem: Problem;
  currentEmail: string;
  onChange: () => void;
}) {
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const canReply = problem.status !== "resolved";

  const onReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || sending) return;
    setSending(true);
    try {
      await addReply({
        id: problem.id,
        author: "user",
        authorEmail: currentEmail,
        message: reply,
      });
      setReply("");
      await onChange();
      toast.success("Reply sent.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not send.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-rose-100/70 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center gap-2">
            <StatusChip status={problem.status} />
            <span className="rounded-[6px] border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
              {CATEGORY_META[problem.category].label}
            </span>
          </div>
          <h2 className="text-[18px] font-bold leading-tight text-slate-900">
            {problem.title}
          </h2>
          <p className="mt-0.5 text-[11.5px] text-slate-500">
            Submitted {relativeTime(problem.createdAt)} ·{" "}
            <span className="font-mono">{problem.id}</span>
          </p>
        </div>
      </div>

      {/* Description */}
      <div className="border-b border-rose-100/70 p-5">
        <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-slate-700">
          {problem.description}
        </p>
      </div>

      {/* Replies */}
      <div className="flex-1 space-y-3 overflow-y-auto p-5">
        {problem.replies.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[12px] border border-dashed border-rose-200 bg-rose-50/40 px-6 py-10 text-center">
            <MessageSquare className="h-6 w-6 text-rose-300" />
            <p className="mt-2 text-[13px] font-semibold text-slate-700">
              No replies yet
            </p>
            <p className="mt-0.5 text-[12px] text-slate-500">
              Our team will respond here soon.
            </p>
          </div>
        ) : (
          problem.replies.map((r) => (
            <ReplyBubble key={r.id} author={r.author} email={r.authorEmail} message={r.message} at={r.createdAt} />
          ))
        )}
      </div>

      {/* Reply composer */}
      {canReply ? (
        <form
          onSubmit={onReply}
          className="flex items-center gap-2 border-t border-rose-100/70 bg-rose-50/30 p-3"
        >
          <input
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Add a message for the admin…"
            className="h-10 flex-1 rounded-[10px] border border-slate-200 bg-white px-3 text-[13px] outline-none transition-colors placeholder:text-slate-400 focus:border-[#D81B60]/50 focus:ring-2 focus:ring-[#D81B60]/15"
          />
          <button
            type="submit"
            disabled={!reply.trim() || sending}
            className="inline-flex h-10 items-center gap-1.5 rounded-[10px] px-3.5 text-[13px] font-semibold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0"
            style={{
              background: `linear-gradient(135deg, ${ROSE} 0%, ${ROSE_DARK} 100%)`,
            }}
          >
            {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            Send
          </button>
        </form>
      ) : (
        <div className="flex items-center justify-center gap-2 border-t border-emerald-100 bg-emerald-50/60 py-3 text-[12.5px] font-semibold text-emerald-800">
          <CheckCircle2 className="h-4 w-4" />
          This problem has been resolved.
        </div>
      )}
    </div>
  );
}

// ── Small building blocks ────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600">
        {label}
      </span>
      {children}
    </label>
  );
}

function StatusChip({
  status,
  compact = false,
}: {
  status: keyof typeof STATUS_META;
  compact?: boolean;
}) {
  const meta = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-bold uppercase tracking-wider ${meta.chip} ${
        compact ? "text-[9px]" : "text-[10px]"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

function ReplyBubble({
  author,
  email,
  message,
  at,
}: {
  author: "user" | "admin";
  email?: string;
  message: string;
  at: string;
}) {
  const isAdmin = author === "admin";
  return (
    <div className={`flex ${isAdmin ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[80%] rounded-[12px] px-3.5 py-2.5 shadow-sm ${
          isAdmin
            ? "border border-slate-200 bg-white text-slate-800"
            : "text-white"
        }`}
        style={
          isAdmin
            ? undefined
            : { background: `linear-gradient(135deg, ${ROSE} 0%, ${ROSE_DARK} 100%)` }
        }
      >
        <div className={`mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${isAdmin ? "text-slate-500" : "text-white/85"}`}>
          {isAdmin ? <HeartHandshake className="h-3 w-3" /> : null}
          <span>{isAdmin ? "Admin" : email || "You"}</span>
          <span className={isAdmin ? "text-slate-400" : "text-white/60"}>·</span>
          <span className={isAdmin ? "text-slate-400" : "text-white/70"}>
            {relativeTime(at)}
          </span>
        </div>
        <p className="whitespace-pre-wrap text-[13px] leading-relaxed">{message}</p>
      </div>
    </div>
  );
}

function SummaryTile({
  label,
  value,
  Icon,
  tone,
}: {
  label: string;
  value: number;
  Icon: React.ElementType;
  tone: "neutral" | "amber" | "indigo" | "emerald";
}) {
  const ring: Record<typeof tone, string> = {
    neutral: "from-slate-400 to-slate-600",
    amber: "from-amber-400 to-orange-500",
    indigo: "from-indigo-400 to-violet-500",
    emerald: "from-emerald-400 to-teal-500",
  };
  return (
    <div className="flex items-center gap-3 rounded-[12px] border border-rose-100 bg-white/90 p-3 shadow-sm backdrop-blur-sm">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br ${ring[tone]} text-white shadow-sm`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
          {label}
        </p>
        <p className="text-[18px] font-black leading-none tracking-tight text-slate-900">
          {value}
        </p>
      </div>
    </div>
  );
}

function EmptyList({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-[14px] bg-rose-50">
        <HelpCircle className="h-6 w-6 text-[#AD1457]" />
      </div>
      <p className="text-[13.5px] font-bold text-slate-800">Nothing here yet</p>
      <p className="mt-1 max-w-[240px] text-[12px] text-slate-500">
        Submit your first problem and track the admin&apos;s response right here.
      </p>
      <button
        type="button"
        onClick={onStart}
        className="mt-3 inline-flex items-center gap-1.5 rounded-[10px] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#AD1457] shadow-sm ring-1 ring-rose-100 transition-colors hover:bg-rose-50"
      >
        <Plus className="h-3.5 w-3.5" />
        New problem
      </button>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-1 p-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="animate-pulse rounded-[10px] bg-rose-50/60 p-3">
          <div className="mb-2 h-3 w-1/2 rounded bg-rose-100" />
          <div className="h-2 w-3/4 rounded bg-rose-100/80" />
        </div>
      ))}
    </div>
  );
}

function DetailPlaceholder() {
  return (
    <div className="flex h-full min-h-[480px] flex-col items-center justify-center px-6 py-12 text-center">
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-[16px] text-white shadow-lg"
        style={{
          background: `linear-gradient(135deg, ${ROSE} 0%, ${ROSE_DARK} 100%)`,
          boxShadow: `0 12px 28px -10px ${ROSE_DARK}80`,
        }}
      >
        <MessageSquare className="h-6 w-6" />
      </div>
      <p className="text-[15px] font-bold text-slate-900">Select a problem</p>
      <p className="mt-1 max-w-sm text-[13px] text-slate-500">
        Pick an entry from the list to see full details, admin responses, and reply to the
        conversation.
      </p>
    </div>
  );
}

// ── Utilities ────────────────────────────────────────────────────────────────
function relativeTime(iso: string) {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Math.max(0, Date.now() - then);
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}
