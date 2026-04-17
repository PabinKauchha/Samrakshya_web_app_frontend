"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import {
  Video, Upload, Square, Circle, Loader2, ArrowLeft,
  CheckCircle, Trash2, Play, Pause, HeartHandshake, FileVideo,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { reportIncident } from "@/lib/api"

type RecordState = "idle" | "recording" | "stopped"

export default function ReportPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [description, setDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [recordState, setRecordState]     = useState<RecordState>("idle")
  const [videoBlob, setVideoBlob]         = useState<Blob | null>(null)
  const [videoSource, setVideoSource]     = useState<"record" | "upload" | null>(null)
  const [previewUrl, setPreviewUrl]       = useState<string | null>(null)
  const [playing, setPlaying]             = useState(false)
  const [recordSeconds, setRecordSeconds] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef        = useRef<MediaStream | null>(null)
  const chunksRef        = useRef<Blob[]>([])
  const liveVideoRef     = useRef<HTMLVideoElement>(null)
  const previewVideoRef  = useRef<HTMLVideoElement>(null)
  const fileInputRef     = useRef<HTMLInputElement>(null)
  const timerRef         = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    // Incident reporting relies on localStorage email.
    // Older flow saves it under `samrakshya_email`, but login saves under `email`.
    const stored = localStorage.getItem("samrakshya_email") || localStorage.getItem("email")
    if (!stored) {
      toast.error("Please log in to report an incident.")
      router.replace("/login")
      return
    }
    setEmail(stored)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      stopStream()
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [previewUrl]) // eslint-disable-line react-hooks/exhaustive-deps

  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      streamRef.current = stream
      if (liveVideoRef.current) { liveVideoRef.current.srcObject = stream; liveVideoRef.current.play() }
      chunksRef.current = []
      const mr = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9,opus" })
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" })
        setVideoBlob(blob); setVideoSource("record")
        setPreviewUrl(URL.createObjectURL(blob)); stopStream()
      }
      mr.start(250); mediaRecorderRef.current = mr
      setRecordState("recording"); setRecordSeconds(0)
      timerRef.current = setInterval(() => setRecordSeconds((s) => s + 1), 1000)
    } catch {
      toast.error("Camera/microphone access denied. Please allow access and try again.")
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    mediaRecorderRef.current?.stop(); setRecordState("stopped")
  }, [])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    if (!file.type.startsWith("video/")) { toast.error("Please select a video file."); return }
    if (file.size > 200 * 1024 * 1024) { toast.error("File is too large. Max size is 200 MB."); return }
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setVideoBlob(file); setVideoSource("upload")
    setPreviewUrl(URL.createObjectURL(file)); setRecordState("idle"); stopStream()
  }

  const clearVideo = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setVideoBlob(null); setVideoSource(null); setPreviewUrl(null)
    setRecordState("idle"); stopStream()
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const togglePlayback = () => {
    if (!previewVideoRef.current) return
    if (playing) { previewVideoRef.current.pause() } else { previewVideoRef.current.play() }
    setPlaying(!playing)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) { toast.error("Email is required."); return }
    if (!description.trim()) { toast.error("Please describe the incident."); return }
    if (!videoBlob) { toast.error("Please record or upload a video."); return }
    setSubmitting(true)
    try {
      const fileName = videoSource === "upload"
        ? (videoBlob instanceof File ? videoBlob.name : "incident.webm")
        : `incident-${Date.now()}.webm`
      await reportIncident(email.trim(), description.trim(), videoBlob, fileName)
      setSubmitted(true); toast.success("Incident reported successfully!")
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to submit report.")
    } finally { setSubmitting(false) }
  }

  const fmtTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`

  // ── Success screen ──
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <div className="text-center max-w-md animate-fade-in-up">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-emerald-500" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-foreground mb-3 tracking-tight">Report Submitted!</h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Your incident report has been recorded securely. Authorities and your emergency contacts have been notified.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button className="rounded-xl font-bold"
              onClick={() => { setSubmitted(false); clearVideo(); setDescription("") }}>
              Report Another
            </Button>
            <Button variant="outline" className="rounded-xl font-semibold" asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">

      {/* ── Header ── */}
      <div className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Button variant="ghost" size="sm" className="gap-1.5 rounded-xl" asChild>
            <Link href="/"><ArrowLeft className="w-4 h-4" /> Back</Link>
          </Button>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-[oklch(0.48_0.22_330)] flex items-center justify-center">
              <HeartHandshake className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-foreground">Samrakshya</span>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <div className="h-4 w-px bg-border" />
            <Video className="w-4 h-4 text-primary" />
            <span className="font-semibold text-foreground text-sm">Report Incident</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-2xl">

        {/* Page heading */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <FileVideo className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Secure Report</span>
          </div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight mb-2">Video Incident Report</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Record or upload video evidence. Your report is stored securely and can be shared with authorities.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Email */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-foreground">
              Your Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" required
              className="w-full h-12 px-4 rounded-xl border border-border/70 bg-secondary/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-colors text-sm"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-foreground">
              Incident Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what happened, when, and where…" required rows={4}
              className="w-full px-4 py-3 rounded-xl border border-border/70 bg-secondary/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-colors text-sm resize-none"
            />
          </div>

          {/* Video section */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-foreground">
              Video Evidence <span className="text-red-500">*</span>
            </label>

            {/* Idle — choose method */}
            {!videoBlob && recordState === "idle" && (
              <div className="rounded-2xl border-2 border-dashed border-border bg-card p-10 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Video className="w-8 h-8 text-primary" />
                </div>
                <p className="font-bold text-foreground mb-1">Add video evidence</p>
                <p className="text-sm text-muted-foreground mb-6">Record with your camera or upload a file (max 200 MB)</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button type="button" variant="outline" className="gap-2 rounded-xl font-semibold" onClick={startRecording}>
                    <Circle className="w-4 h-4 text-red-500" /> Record Now
                  </Button>
                  <Button type="button" variant="outline" className="gap-2 rounded-xl font-semibold"
                    onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-4 h-4" /> Upload File
                  </Button>
                </div>
                <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileUpload} className="hidden" />
              </div>
            )}

            {/* Recording — live camera */}
            {recordState === "recording" && (
              <div className="rounded-2xl overflow-hidden border-2 border-red-500/60 bg-black relative shadow-xl shadow-red-500/10">
                <video ref={liveVideoRef} muted autoPlay playsInline className="w-full aspect-video object-cover" />
                <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/70 rounded-full px-3 py-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-white text-xs font-mono font-bold">{fmtTime(recordSeconds)}</span>
                  <span className="text-red-300 text-xs font-semibold ml-1">REC</span>
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                  <button type="button" onClick={stopRecording}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-full font-bold text-sm transition-colors shadow-lg active:scale-95">
                    <Square className="w-4 h-4" /> Stop Recording
                  </button>
                </div>
              </div>
            )}

            {/* Preview */}
            {previewUrl && (
              <div className="rounded-2xl overflow-hidden border border-border bg-card shadow-sm">
                <div className="relative bg-black">
                  <video ref={previewVideoRef} src={previewUrl}
                    className="w-full aspect-video object-contain" onEnded={() => setPlaying(false)} />
                  <button type="button" onClick={togglePlayback}
                    className="absolute inset-0 flex items-center justify-center group">
                    <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center group-hover:bg-black/70 transition-colors backdrop-blur-sm">
                      {playing ? <Pause className="w-7 h-7 text-white" /> : <Play className="w-7 h-7 text-white ml-1" />}
                    </div>
                  </button>
                </div>
                <div className="px-5 py-3 flex items-center justify-between bg-secondary/30">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-muted-foreground font-medium">
                      {videoSource === "record" ? `Recorded · ${fmtTime(recordSeconds)}` : "Uploaded file"}
                    </span>
                  </div>
                  <button type="button" onClick={clearVideo}
                    className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 transition-colors font-medium">
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <Button type="submit" disabled={submitting || !videoBlob} size="lg"
            className="w-full h-12 rounded-xl font-bold text-base gap-2 bg-gradient-to-r from-primary to-[oklch(0.48_0.22_330)] hover:opacity-90 shadow-lg shadow-primary/25">
            {submitting
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting Report…</>
              : "Submit Incident Report"}
          </Button>

          <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
            <HeartHandshake className="w-3.5 h-3.5 text-primary/60" />
            Your report is encrypted and stored securely. Only you and authorized personnel can access it.
          </p>
        </form>
      </div>
    </div>
  )
}
