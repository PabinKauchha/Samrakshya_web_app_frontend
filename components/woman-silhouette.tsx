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
  /* Outer <g>: SVG attribute positions the butterfly — untouched by CSS.
     Inner <g>: CSS float animation runs in local space of the outer group.
     Never on the same element — CSS transform overrides SVG transform attribute
     and snaps the butterfly to (0,0). */
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
        /* positive = drifts down relative to section = scrolls up slower than page = parallax */
        el.style.transform = `translateY(${window.scrollY * 0.38}px)`
      })
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf) }
  }, [])

  return (
    /*
      Wrapper div is absolute, starts 8% ABOVE the section top so the figure
      has downward room to travel via the parallax translateY without clipping
      the head off the top immediately.
    */
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
        /* overflow visible lets butterflies fly outside the viewBox rect without clipping */
        style={{ opacity: 0.38, overflow: "visible" }}
        overflow="visible"
      >
        <style>{`
          /* ── Wing flap ── */
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

          /* ── Per-butterfly floating paths ── */
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

        {/* ═══════════════════════════════════
            WOMAN SILHOUETTE  (centre ≈ x 254)
        ═══════════════════════════════════ */}

        {/* Flowing hair — sweeps dramatically left */}
        <path d="
          M 198 164
          C 158 140 116 150  92 182
          C  68 216  74 260  92 292
          C 108 320 136 334 158 324
          C 174 316 178 296 174 268
          C 170 238 162 206 156 178
          C 150 158 198 164 198 164 Z
        "/>

        {/* Hair crown — volume over the top of the head */}
        <path d="
          M 200 164
          C 172 110 188  54 228  26
          C 252   8 278   4 302  12
          C 340  24 358  58 350 100
          C 344 132 328 154 314 164
          C 306 132 288 108 262 100
          C 238  92 216 100 204 122
          C 196 140 200 164 200 164 Z
        "/>

        {/* Head */}
        <circle cx="256" cy="164" r="78"/>

        {/* Neck */}
        <path d="M 232 238 Q 230 258 232 272 L 280 272 Q 282 258 280 238 Z"/>

        {/* Body + flowing dress */}
        <path d="
          M 174 286
          C 148 302 134 340 140 376
          C 146 408 164 428 180 438
          C 190 446 188 462 184 486
          C 178 514 154 562 128 626
          C 100 700  74 782  62 848
          C  52 898  54 932  64 946
          L 446 946
          C 456 932 458 898 448 848
          C 436 782 410 700 382 626
          C 356 562 332 514 326 486
          C 322 462 320 446 330 438
          C 346 428 364 408 370 376
          C 376 340 362 302 336 286
          C 314 274 288 268 256 266
          C 224 264 196 274 174 286 Z
        "/>

        {/* Left arm — natural hang */}
        <path d="
          M 140 376
          C 114 396  92 434  84 474
          C  76 510  80 542  96 554
          C 112 564 130 558 138 540
          C 146 522 144 496 146 466
          C 148 434 146 404 140 376 Z
        "/>

        {/* Right arm — raised confidently */}
        <path d="
          M 372 376
          C 396 346 416 306 424 264
          C 432 228 428 194 414 180
          C 400 166 382 172 374 190
          C 366 208 366 238 364 268
          C 362 304 364 340 372 376 Z
        "/>

        {/* ═══════════════════════════════
            BUTTERFLIES  — 7 total
            Spread across left & around figure
        ═══════════════════════════════ */}

        {/* Near raised hand — upper right */}
        <Butterfly x={432} y={148} s={1.15} floatClass="bf1" flapDelay="0s"    rotate={-14}/>

        {/* Drifting above her head */}
        <Butterfly x={260} y={ 48} s={0.9}  floatClass="bf2" flapDelay="0.24s" rotate={9} />

        {/* Left side, by flowing hair */}
        <Butterfly x={ 68} y={230} s={0.95} floatClass="bf3" flapDelay="0.09s" rotate={-20}/>

        {/* Far right mid — beside torso */}
        <Butterfly x={454} y={380} s={0.8}  floatClass="bf4" flapDelay="0.36s" rotate={16} />

        {/* Left mid — beside her left arm */}
        <Butterfly x={ 52} y={490} s={0.72} floatClass="bf5" flapDelay="0.18s" rotate={-9} />

        {/* Lower right — near dress hem */}
        <Butterfly x={416} y={650} s={0.68} floatClass="bf6" flapDelay="0.44s" rotate={11} />

        {/* Small one drifting top-left */}
        <Butterfly x={128} y={ 74} s={0.58} floatClass="bf7" flapDelay="0.30s" rotate={22} />

      </svg>
    </div>
  )
}
