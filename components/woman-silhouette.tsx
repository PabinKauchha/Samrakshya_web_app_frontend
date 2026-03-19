"use client"

import { useEffect, useRef } from "react"

function bfPaths(s: number) {
  return {
    ul: `M0,0 C${-20*s},${-26*s} ${-52*s},${-31*s} ${-52*s},${-8*s} C${-52*s},${11*s} ${-20*s},${17*s} 0,0`,
    ur: `M0,0 C${20*s},${-26*s} ${52*s},${-31*s} ${52*s},${-8*s} C${52*s},${11*s} ${20*s},${17*s} 0,0`,
    ll: `M0,0 C${-17*s},${9*s} ${-36*s},${30*s} ${-24*s},${44*s} C${-14*s},${54*s} ${6*s},${36*s} 0,0`,
    lr: `M0,0 C${17*s},${9*s} ${36*s},${30*s} ${24*s},${44*s} C${14*s},${54*s} ${-6*s},${36*s} 0,0`,
    rx: 2.8 * s, ry: 12 * s, bcy: 9 * s,
  }
}

function Butterfly({
  x, y, s = 1, floatClass, flapDelay = "0s", rotate = 0,
}: { x: number; y: number; s?: number; floatClass: string; flapDelay?: string; rotate?: number }) {
  const p = bfPaths(s)
  return (
    <g transform={`translate(${x},${y}) rotate(${rotate})`}>
      <g className={floatClass}>
        <path d={p.ul} className="bfw-ul" style={{ animationDelay: flapDelay }} />
        <path d={p.ur} className="bfw-ur" style={{ animationDelay: flapDelay }} />
        <path d={p.ll} className="bfw-ll" style={{ animationDelay: flapDelay }} />
        <path d={p.lr} className="bfw-lr" style={{ animationDelay: flapDelay }} />
        <ellipse cx={0} cy={p.bcy} rx={p.rx} ry={p.ry} />
      </g>
    </g>
  )
}

export function WomanSilhouette() {
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    let raf: number
    const onScroll = () => {
      raf = requestAnimationFrame(() => {
        el.style.transform = `translateY(${window.scrollY * 0.38}px)`
      })
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf) }
  }, [])

  return (
    <div
      ref={wrapRef}
      className="absolute pointer-events-none select-none"
      style={{ top: "-8%", left: 0, height: "116%", width: "auto", willChange: "transform", overflow: "visible" }}
    >
      <svg
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 480 980"
        fill="currentColor"
        preserveAspectRatio="xMinYMid meet"
        className="h-full w-auto text-primary"
        style={{ opacity: 0.44, overflow: "visible" }}
        overflow="visible"
      >
        <style>{`
          .bfw-ul,.bfw-ll{
            transform-box:fill-box; transform-origin:right center;
            animation:bfFlapL .65s ease-in-out infinite alternate;
          }
          .bfw-ur,.bfw-lr{
            transform-box:fill-box; transform-origin:left center;
            animation:bfFlapR .65s ease-in-out infinite alternate;
          }
          @keyframes bfFlapL{ from{transform:scaleX(1) skewY(-8deg)} to{transform:scaleX(0.42) skewY(8deg)} }
          @keyframes bfFlapR{ from{transform:scaleX(1) skewY(8deg)}  to{transform:scaleX(0.42) skewY(-8deg)} }
          .bf1{animation:bff1 4.3s ease-in-out infinite}
          .bf2{animation:bff2 5.6s ease-in-out infinite 1.4s}
          .bf3{animation:bff3 3.9s ease-in-out infinite 0.7s}
          .bf4{animation:bff4 6.2s ease-in-out infinite 2.2s}
          .bf5{animation:bff5 4.8s ease-in-out infinite 0.4s}
          .bf6{animation:bff6 5.3s ease-in-out infinite 1.9s}
          .bf7{animation:bff3 3.6s ease-in-out infinite 3.1s}
          @keyframes bff1{0%,100%{transform:translate(0,0)rotate(0deg)}33%{transform:translate(-10px,-18px)rotate(-7deg)}66%{transform:translate(7px,-9px)rotate(5deg)}}
          @keyframes bff2{0%,100%{transform:translate(0,0)rotate(0deg)}50%{transform:translate(14px,-22px)rotate(10deg)}}
          @keyframes bff3{0%,100%{transform:translate(0,0)rotate(0deg)}50%{transform:translate(-12px,-24px)rotate(-7deg)}}
          @keyframes bff4{0%,100%{transform:translate(0,0)rotate(0deg)}40%{transform:translate(12px,-14px)rotate(8deg)}80%{transform:translate(-8px,-18px)rotate(-5deg)}}
          @keyframes bff5{0%,100%{transform:translate(0,0)rotate(0deg)}50%{transform:translate(-14px,-12px)rotate(-10deg)}}
          @keyframes bff6{0%,100%{transform:translate(0,0)rotate(0deg)}50%{transform:translate(10px,-20px)rotate(7deg)}}
        `}</style>

        {/*
          ═══════════════════════════════════════════════════════
          PROPORTIONS  (8-head rule, front view, dress)
            Head top y=66  chin y=178  → head h=112 px
            Shoulders  x 142–338  (196 px wide)
            Waist      x 192–296  (104 px wide)   ← clear hourglass
            Hips       x 156–330  (174 px wide)
            Hem        y=958
          ═══════════════════════════════════════════════════════
        */}


        {/* ╔═══════════════════════════════════════╗
            ║  LAYER 1 — BACK HAIR                  ║
            ╚═══════════════════════════════════════╝ */}

        {/* Crown arch — thick mass sitting on skull */}
        <path d="
          M 176,122 C 172,90 180,60 200,42 C 216,28 232,16 252,12
          C 274,10 296,20 314,42 C 334,66 340,98 332,126
          C 323,104 310,84 292,70 C 274,54 256,50 240,56
          C 221,62 205,80 195,104 C 188,118 182,124 178,128 Z
        "/>

        {/* Main flowing mass — sweeps left, heaviest strand */}
        <path d="
          M 180,132 C 152,114 118,122 92,154
          C 66,188 50,232 46,278 C 42,320 48,358 66,382
          C 76,398 92,408 108,412 C 118,392 116,360 122,326
          C 128,292 142,260 158,232 C 172,208 188,182 204,158
          C 206,148 200,136 180,132 Z
        "/>

        {/* Strand 2 — peels off mid-length */}
        <path d="
          M 170,128 C 148,150 134,180 130,214
          C 126,244 132,272 148,286 C 142,266 140,240 147,212
          C 154,186 166,160 178,142 Z
        "/>

        {/* Strand 3 — long wisp reaches past shoulder */}
        <path d="
          M 78,200 C 60,228 48,266 44,306
          C 40,342 46,376 62,394 C 56,370 59,336 68,306
          C 77,276 92,244 106,216 Z
        "/>

        {/* Strand 4 — medium, drifts left of strand 3 */}
        <path d="
          M 106,162 C 84,190 68,228 62,272
          C 58,308 64,340 80,356 C 74,330 76,298 86,268
          C 96,240 112,206 124,180 Z
        "/>

        {/* Right hair — falls naturally behind right shoulder */}
        <path d="
          M 314,124 C 338,142 358,174 364,210
          C 370,246 364,278 350,298 C 346,276 344,246 338,216
          C 332,188 322,158 314,132 Z
        "/>

        {/* Right cheek wisp */}
        <path d="
          M 312,132 C 328,154 336,182 338,212
          C 340,234 335,252 325,262 C 329,242 330,218 326,194
          C 322,172 314,152 308,138 Z
        "/>


        {/* ╔═══════════════════════════════════════╗
            ║  LAYER 2 — FACE / HEAD                ║
            ║  Egg oval: wide cheekbones, soft chin ║
            ╚═══════════════════════════════════════╝ */}

        <path d="
          M 242,66
          C 204,66 174,92 164,130 C 154,166 157,202 172,226
          C 182,244 202,258 222,264 C 230,266 236,268 242,268
          C 248,268 254,266 262,264 C 282,258 302,244 312,226
          C 327,202 330,166 320,130 C 310,92 280,66 242,66 Z
        "/>


        {/* ╔═══════════════════════════════════════╗
            ║  LAYER 3 — NECK                       ║
            ║  Narrow, tapers from jaw to collarbone║
            ╚═══════════════════════════════════════╝ */}

        <path d="
          M 228,262 C 221,277 218,296 220,314
          C 226,310 234,308 242,308 C 250,308 258,310 264,314
          C 266,296 263,277 256,262 Z
        "/>


        {/* ╔══════════════════════════════════════════════════╗
            ║  LAYER 4 — TORSO + DRESS                        ║
            ║  Right side down first, then left side up        ║
            ║  Enforced: waist 104px < shoulders 196px        ║
            ╚══════════════════════════════════════════════════╝ */}

        <path d="
          M 264,314

          C 294,320 322,330 342,348
          C 350,360 350,378 342,396
          C 332,408 318,418 316,438
          C 314,456 300,474 294,492
          C 290,506 320,528 330,548
          C 338,566 344,590 344,616
          C 348,672 382,776 422,878
          C 454,962 466,972 466,976

          L 18,976

          C 18,972 30,962 62,878
          C 102,776 136,672 140,616
          C 140,590 146,566 154,548
          C 164,528 194,506 190,492
          C 184,474 170,456 168,438
          C 166,418 152,408 142,396
          C 134,378 134,360 142,348
          C 162,330 190,320 220,314

          C 230,312 236,310 242,310
          C 248,310 254,312 264,314 Z
        "/>


        {/* ╔══════════════════════════════════════════════════╗
            ║  LAYER 5 — LEFT ARM                             ║
            ║  Natural hang; both edges taper toward wrist    ║
            ╚══════════════════════════════════════════════════╝ */}

        {/*
          Outer (left) edge: shoulder x≈108 → elbow x≈62 → wrist x≈58
          Inner (right) edge: shoulder x≈138 → elbow x≈94 → wrist x≈82
          Arm tapers from ~30px at shoulder to ~24px at wrist
        */}
        <path d="
          M 138,352
          C 114,374 88,418 70,470
          C 54,518 52,560 64,588
          C 74,608 92,614 110,606
          C 126,598 138,580 144,556
          C 150,530 148,494 150,452
          C 152,412 148,368 138,352 Z
        "/>

        {/* Left hand — rounded paddle shape at wrist */}
        <ellipse cx="87" cy="601" rx="26" ry="16" transform="rotate(-15,87,601)"/>


        {/* ╔══════════════════════════════════════════════════╗
            ║  LAYER 6 — RIGHT ARM (raised)                   ║
            ║  Goes up and to the right from shoulder         ║
            ╚══════════════════════════════════════════════════╝ */}

        {/*
          Shoulder at (342,350) → elbow at (420,200) → wrist at (434,86)
          Outer (right) edge at slightly larger x, inner (left) at smaller x
        */}
        <path d="
          M 370,336
          C 394,302 418,252 432,200
          C 444,152 446,106 434,80
          C 426,60 410,54 394,64
          C 378,76 370,106 364,150
          C 356,198 346,250 342,304
          C 340,322 344,338 370,336 Z
        "/>

        {/* Right hand at top of raised arm */}
        <ellipse cx="431" cy="72" rx="22" ry="14" transform="rotate(25,431,72)"/>


        {/* ╔══════════════════════════════════════════════════╗
            ║  LAYER 7 — FRONT HAIR  (renders above face)     ║
            ╚══════════════════════════════════════════════════╝ */}

        {/* Left face-framing wisp */}
        <path d="
          M 178,140 C 164,164 156,192 154,222
          C 152,244 158,264 170,274
          C 164,254 162,228 168,204 C 174,182 186,158 192,144 Z
        "/>

        {/* Left shoulder-draping strand */}
        <path d="
          M 166,152 C 144,182 130,222 126,264
          C 122,296 130,322 148,336
          C 140,314 140,282 148,252 C 156,224 170,192 180,166 Z
        "/>

        {/* Right face-framing wisp */}
        <path d="
          M 306,140 C 320,164 328,194 330,226
          C 332,250 327,270 316,280
          C 319,258 321,232 317,208 C 313,184 305,162 298,146 Z
        "/>

        {/* Crown flyaways — three tiny broken strands at the parting */}
        <path d="M 250,14 C 244,30 241,52 242,68 C 246,54 249,32 250,14 Z"/>
        <path d="M 258,12 C 265,30 267,52 264,70 C 263,54 260,32 258,12 Z"/>
        <path d="M 240,18 C 234,36 231,58 234,74 C 237,58 239,36 240,18 Z"/>


        {/* ╔══════════════════════╗
            ║  BUTTERFLIES — 7    ║
            ╚══════════════════════╝ */}

        <Butterfly x={440} y={62}  s={1.15} floatClass="bf1" flapDelay="0s"    rotate={-14}/>
        <Butterfly x={258} y={ 38} s={0.9}  floatClass="bf2" flapDelay="0.24s" rotate={9} />
        <Butterfly x={ 58} y={226} s={0.95} floatClass="bf3" flapDelay="0.09s" rotate={-20}/>
        <Butterfly x={460} y={384} s={0.8}  floatClass="bf4" flapDelay="0.36s" rotate={16} />
        <Butterfly x={ 42} y={498} s={0.72} floatClass="bf5" flapDelay="0.18s" rotate={-9} />
        <Butterfly x={418} y={660} s={0.68} floatClass="bf6" flapDelay="0.44s" rotate={11} />
        <Butterfly x={124} y={ 68} s={0.58} floatClass="bf7" flapDelay="0.30s" rotate={22} />

      </svg>
    </div>
  )
}
