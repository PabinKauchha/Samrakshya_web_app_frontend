"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import {
  Video,
  Upload,
  Square,
  Circle,
  Loader2,
  ArrowLeft,
  CheckCircle,
  Trash2,
  Play,
  Pause,
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

  // Recording state
  const [recordState, setRecordState] = useState<RecordState>("idle")
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
  const [videoSource, setVideoSource] = useState<"record" | "upload" | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [recordSeconds, setRecordSeconds] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const liveVideoRef = useRef<HTMLVideoElement>(null)
  const previewVideoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("samrakshya_email")
    if (!stored) {
      toast.error("Please log in to report an incident.")
      router.replace("/login")
      return
    }
    setEmail(stored)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount
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
      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = stream
        liveVideoRef.current.play()
      }

      chunksRef.current = []
      const mr = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9,opus" })
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" })
        setVideoBlob(blob)
        setVideoSource("record")
        const url = URL.createObjectURL(blob)
        setPreviewUrl(url)
        stopStream()
      }
      mr.start(250)
      mediaRecorderRef.current = mr
      setRecordState("recording")
      setRecordSeconds(0)
      timerRef.current = setInterval(() => setRecordSeconds((s) => s + 1), 1000)
    } catch {
      toast.error("Camera/microphone access denied. Please allow access and try again.")
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    mediaRecorderRef.current?.stop()
    setRecordState("stopped")
  }, [])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("video/")) {
      toast.error("Please select a video file.")
      return
    }
    if (file.size > 200 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 200 MB.")
      return
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setVideoBlob(file)
    setVideoSource("upload")
    setPreviewUrl(URL.createObjectURL(file))
    setRecordState("idle")
    stopStream()
  }

  const clearVideo = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setVideoBlob(null)
    setVideoSource(null)
    setPreviewUrl(null)
    setRecordState("idle")
    stopStream()
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const togglePlayback = () => {
    if (!previewVideoRef.current) return
    if (playing) {
      previewVideoRef.current.pause()
    } else {
      previewVideoRef.current.play()
    }
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
      setSubmitted(true)
      toast.success("Incident reported successfully!")
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to submit report.")
    } finally {
      setSubmitting(false)
    }
  }

  const fmtTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <div className="text-center max-w-md">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-green-500/15 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">Report Submitted</h1>
          <p className="text-muted-foreground mb-8">
            Your incident report has been recorded securely. Authorities and your emergency contacts have been notified.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => { setSubmitted(false); clearVideo(); setDescription("") }}>
              Report Another
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header bar */}
      <div className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">Report Incident</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Video Incident Report</h1>
          <p className="text-muted-foreground text-sm">
            Record or upload video evidence. Your report is stored securely and can be shared with authorities.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Your Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Incident Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what happened, when, and where…"
              required
              rows={4}
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none"
            />
          </div>

          {/* Video capture area */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Video Evidence <span className="text-red-500">*</span>
            </label>

            {!videoBlob && recordState === "idle" && (
              <div className="rounded-xl border-2 border-dashed border-border bg-card p-8 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <Video className="w-7 h-7 text-primary" />
                  </div>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">Add video evidence</p>
                  <p className="text-sm text-muted-foreground">Record with your camera or upload a file (max 200 MB)</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button type="button" variant="outline" className="gap-2" onClick={startRecording}>
                    <Circle className="w-4 h-4 text-red-500" />
                    Record Now
                  </Button>
                  <Button type="button" variant="outline" className="gap-2" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-4 h-4" />
                    Upload File
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            )}

            {/* Live camera feed while recording */}
            {recordState === "recording" && (
              <div className="rounded-xl overflow-hidden border border-red-500/50 bg-black relative">
                <video ref={liveVideoRef} muted autoPlay playsInline className="w-full aspect-video object-cover" />
                <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/70 rounded-full px-3 py-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-white text-xs font-mono">{fmtTime(recordSeconds)}</span>
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-full font-semibold text-sm transition-colors shadow-lg"
                  >
                    <Square className="w-4 h-4" />
                    Stop Recording
                  </button>
                </div>
              </div>
            )}

            {/* Preview of recorded/uploaded video */}
            {previewUrl && (
              <div className="rounded-xl overflow-hidden border border-border bg-card">
                <div className="relative bg-black">
                  <video
                    ref={previewVideoRef}
                    src={previewUrl}
                    className="w-full aspect-video object-contain"
                    onEnded={() => setPlaying(false)}
                  />
                  <button
                    type="button"
                    onClick={togglePlayback}
                    className="absolute inset-0 flex items-center justify-center group"
                  >
                    <div className="w-14 h-14 rounded-full bg-black/50 flex items-center justify-center group-hover:bg-black/70 transition-colors">
                      {playing ? (
                        <Pause className="w-6 h-6 text-white" />
                      ) : (
                        <Play className="w-6 h-6 text-white ml-1" />
                      )}
                    </div>
                  </button>
                </div>
                <div className="px-4 py-3 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {videoSource === "record" ? `Recorded · ${fmtTime(recordSeconds)}` : "Uploaded file"}
                  </span>
                  <button
                    type="button"
                    onClick={clearVideo}
                    className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <Button type="submit" disabled={submitting || !videoBlob} className="w-full" size="lg">
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting Report…
              </>
            ) : (
              "Submit Incident Report"
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Your report is encrypted and stored securely. Only you and authorized personnel can access it.
          </p>
        </form>
      </div>
    </div>
  )
}
