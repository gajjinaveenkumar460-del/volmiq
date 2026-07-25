"use client";

import { useEffect, useId, useRef } from "react";
import "./volmiq-splash.css";

const PATH =
  "M295,140 C415,140 475,600 595,600 C671,600 709,140 785,140 C853,140 887,470 955,470 C1005,470 1030,230 1080,230 C1134,230 1161,585 1215,585";

const DRAW_MS = 1700;
const RIBBON_AT = 2000;
const TEXT_AT = 2700;
const REPLAY_AT = 3600;

type Props = {
  onDone?: () => void;
  showReplay?: boolean;
  autoCloseMs?: number;
};

/**
 * Logo intro + dimensional (3D tube line + beveled ribbon + shadows).
 */
export function VolmiqSplash({
  onDone,
  showReplay = true,
  autoCloseMs,
}: Props) {
  const uid = useId().replace(/:/g, "");
  const drawLineRef = useRef<SVGPathElement | null>(null);
  const tipDotRef = useRef<SVGCircleElement | null>(null);
  const ribbonRef = useRef<SVGGElement | null>(null);
  const glowRef = useRef<SVGEllipseElement | null>(null);
  const textBlockRef = useRef<HTMLDivElement | null>(null);
  const replayBtnRef = useRef<HTMLButtonElement | null>(null);
  const timersRef = useRef<number[]>([]);
  const rafRef = useRef<number>(0);
  const playingRef = useRef(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  function clearTimers() {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  }

  function playIntro() {
    const drawLine = drawLineRef.current;
    const tipDot = tipDotRef.current;
    const ribbon = ribbonRef.current;
    const glow = glowRef.current;
    const textBlock = textBlockRef.current;
    const replayBtn = replayBtnRef.current;
    if (!drawLine || !tipDot || !ribbon || !textBlock) return;

    if (playingRef.current) clearTimers();
    playingRef.current = true;
    clearTimers();

    if (replayBtn) replayBtn.style.opacity = "0";

    const len = drawLine.getTotalLength();

    drawLine.style.transition = "none";
    drawLine.style.strokeDasharray = `${len}`;
    drawLine.style.strokeDashoffset = `${len}`;
    drawLine.style.opacity = "0";
    drawLine.classList.remove("vox-intro__line--done");

    tipDot.style.transition = "none";
    tipDot.style.opacity = "0";
    tipDot.setAttribute("cx", "295");
    tipDot.setAttribute("cy", "140");

    ribbon.style.transition = "none";
    ribbon.style.opacity = "0";
    ribbon.classList.remove("vox-intro__ribbon--live");

    if (glow) {
      glow.style.transition = "none";
      glow.style.opacity = "0";
    }

    textBlock.style.transition = "none";
    textBlock.style.opacity = "0";

    void drawLine.getBoundingClientRect();
    drawLine.style.opacity = "1";

    const start = performance.now();

    function frame(now: number) {
      const t = Math.min(1, (now - start) / DRAW_MS);
      const eased = 1 - Math.pow(1 - t, 3);

      drawLine!.style.strokeDashoffset = `${len * (1 - eased)}`;

      // subtle “depth” pulse on stroke while drawing
      const pulse = 9 + Math.sin(eased * Math.PI * 4) * 0.8;
      drawLine!.setAttribute("stroke-width", String(pulse));

      const pt = drawLine!.getPointAtLength(len * eased);
      tipDot!.setAttribute("cx", String(pt.x));
      tipDot!.setAttribute("cy", String(pt.y));
      tipDot!.style.opacity = t > 0.02 ? "1" : "0";

      // tip scale pulse for 3D bead feel
      const tipR = 9 + Math.sin(eased * Math.PI * 6) * 1.5;
      tipDot!.setAttribute("r", String(tipR));

      if (t < 1) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        drawLine!.style.strokeDashoffset = "0";
        drawLine!.setAttribute("stroke-width", "9");
        const end = drawLine!.getPointAtLength(len);
        tipDot!.setAttribute("cx", String(end.x));
        tipDot!.setAttribute("cy", String(end.y));
        tipDot!.setAttribute("r", "10");
        tipDot!.style.opacity = "1";
      }
    }

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(frame);
    });

    timersRef.current.push(
      window.setTimeout(() => {
        drawLine!.style.transition = "opacity 0.55s ease";
        drawLine!.style.opacity = "0";
        tipDot!.style.transition = "opacity 0.55s ease";
        tipDot!.style.opacity = "0";

        ribbon!.style.transition =
          "opacity 0.85s ease, transform 0.85s cubic-bezier(0.22,1,0.36,1)";
        ribbon!.style.opacity = "1";
        ribbon!.classList.add("vox-intro__ribbon--live");

        if (glow) {
          glow.style.transition = "opacity 1s ease";
          glow.style.opacity = "0.85";
        }
      }, RIBBON_AT)
    );

    timersRef.current.push(
      window.setTimeout(() => {
        textBlock!.style.transition = "opacity 0.7s ease, transform 0.7s ease";
        textBlock!.style.opacity = "1";
      }, TEXT_AT)
    );

    timersRef.current.push(
      window.setTimeout(() => {
        if (replayBtn) {
          replayBtn.style.transition = "opacity 0.5s ease";
          replayBtn.style.opacity = "1";
        }
        playingRef.current = false;
      }, REPLAY_AT)
    );

    if (autoCloseMs && autoCloseMs > 0) {
      timersRef.current.push(
        window.setTimeout(() => onDoneRef.current?.(), autoCloseMs)
      );
    }
  }

  useEffect(() => {
    const t = window.setTimeout(() => playIntro(), 40);
    return () => {
      window.clearTimeout(t);
      clearTimers();
      playingRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const gLine = `lineGrad-${uid}`;
  const gA = `ribGradA-${uid}`;
  const gB = `ribGradB-${uid}`;
  const gHighlight = `ribHighlight-${uid}`;
  const fSoft = `softShadow-${uid}`;
  const fTube = `tube3d-${uid}`;
  const fTip = `tipGlow-${uid}`;
  const fBevel = `bevel3d-${uid}`;
  const fRib = `ribbonShadow-${uid}`;
  const fFloor = `floorGlow-${uid}`;

  return (
    <div className="vox-intro">
      <div className="vox-intro__stage">
        <svg
          className="vox-intro__svg"
          viewBox="0 0 1536 680"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient
              id={gLine}
              gradientUnits="userSpaceOnUse"
              x1="295"
              y1="0"
              x2="1215"
              y2="0"
            >
              <stop offset="0%" stopColor="#52a7e8" />
              <stop offset="20%" stopColor="#2f5be0" />
              <stop offset="42%" stopColor="#8a5cf0" />
              <stop offset="60%" stopColor="#3f5fe6" />
              <stop offset="80%" stopColor="#2fa0e8" />
              <stop offset="100%" stopColor="#2fd6e0" />
            </linearGradient>
            <linearGradient
              id={gA}
              gradientUnits="userSpaceOnUse"
              x1="295"
              y1="0"
              x2="1215"
              y2="0"
            >
              <stop offset="0%" stopColor="#63b3ef" />
              <stop offset="22%" stopColor="#2450e3" />
              <stop offset="45%" stopColor="#7c4ff2" />
              <stop offset="65%" stopColor="#2f5be0" />
              <stop offset="100%" stopColor="#2fd6e0" />
            </linearGradient>
            <linearGradient
              id={gB}
              gradientUnits="userSpaceOnUse"
              x1="295"
              y1="0"
              x2="1215"
              y2="0"
            >
              <stop offset="0%" stopColor="#8fc6f5" />
              <stop offset="30%" stopColor="#3a5aea" />
              <stop offset="50%" stopColor="#9a7bf5" />
              <stop offset="70%" stopColor="#3fa4ea" />
              <stop offset="100%" stopColor="#6fe3ec" />
            </linearGradient>
            {/* Specular highlight band for “4D” ribbon depth */}
            <linearGradient
              id={gHighlight}
              gradientUnits="userSpaceOnUse"
              x1="295"
              y1="80"
              x2="1215"
              y2="620"
            >
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="35%" stopColor="#ffffff" stopOpacity="0.55" />
              <stop offset="55%" stopColor="#ffffff" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>

            <filter id={fSoft} x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow
                dx="0"
                dy="10"
                stdDeviation="10"
                floodColor="#2a3a8f"
                floodOpacity="0.18"
              />
            </filter>

            {/* 3D tube lighting on drawing line */}
            <filter id={fTube} x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur
                in="SourceAlpha"
                stdDeviation="3"
                result="blur"
              />
              <feSpecularLighting
                in="blur"
                surfaceScale="4"
                specularConstant="0.9"
                specularExponent="18"
                lightingColor="#ffffff"
                result="spec"
              >
                <feDistantLight azimuth="235" elevation="55" />
              </feSpecularLighting>
              <feComposite
                in="spec"
                in2="SourceAlpha"
                operator="in"
                result="specClip"
              />
              <feComposite
                in="SourceGraphic"
                in2="specClip"
                operator="arithmetic"
                k1="0"
                k2="1"
                k3="1"
                k4="0"
                result="lit"
              />
              <feDropShadow
                in="lit"
                dx="0"
                dy="12"
                stdDeviation="11"
                floodColor="#2a3a8f"
                floodOpacity="0.28"
              />
            </filter>

            {/* Glowing tip bead */}
            <filter id={fTip} x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="3" result="g" />
              <feMerge>
                <feMergeNode in="g" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
              <feDropShadow
                dx="0"
                dy="0"
                stdDeviation="6"
                floodColor="#7c5cff"
                floodOpacity="0.85"
              />
            </filter>

            {/*
              Shadow follows logo path edges (SourceAlpha), offset DOWN.
              Merge order: shadows first, logo paint last → never on top of logo.
            */}
            <filter id={fBevel} x="-45%" y="-15%" width="190%" height="210%">
              {/* tight edge shadow along borders */}
              <feGaussianBlur
                in="SourceAlpha"
                stdDeviation="5"
                result="blur1"
              />
              <feOffset in="blur1" dx="0" dy="8" result="off1" />
              <feFlood
                floodColor="#0f172a"
                floodOpacity="0.11"
                result="col1"
              />
              <feComposite
                in="col1"
                in2="off1"
                operator="in"
                result="shadow1"
              />
              {/* softer outer falloff still below */}
              <feGaussianBlur
                in="SourceAlpha"
                stdDeviation="9"
                result="blur2"
              />
              <feOffset in="blur2" dx="0" dy="14" result="off2" />
              <feFlood
                floodColor="#475569"
                floodOpacity="0.07"
                result="col2"
              />
              <feComposite
                in="col2"
                in2="off2"
                operator="in"
                result="shadow2"
              />
              {/* light gloss on the ribbon fill */}
              <feGaussianBlur
                in="SourceAlpha"
                stdDeviation="4"
                result="blurLit"
              />
              <feSpecularLighting
                in="blurLit"
                surfaceScale="5"
                specularConstant="0.65"
                specularExponent="18"
                lightingColor="#ffffff"
                result="spec"
              >
                <feDistantLight azimuth="235" elevation="55" />
              </feSpecularLighting>
              <feComposite
                in="spec"
                in2="SourceAlpha"
                operator="in"
                result="specClip"
              />
              <feComposite
                in="SourceGraphic"
                in2="specClip"
                operator="arithmetic"
                k1="0"
                k2="1"
                k3="0.7"
                k4="0"
                result="lit"
              />
              <feMerge>
                <feMergeNode in="shadow2" />
                <feMergeNode in="shadow1" />
                <feMergeNode in="lit" />
              </feMerge>
            </filter>

            {/* Unused placeholder kept for id stability if needed */}
            <filter id={fRib} x="-10%" y="-10%" width="120%" height="120%">
              <feIdentity />
            </filter>

            <radialGradient id={fFloor} cx="50%" cy="80%" r="50%">
              <stop offset="0%" stopColor="#64748b" stopOpacity="0.1" />
              <stop offset="70%" stopColor="#94a3b8" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#94a3b8" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Very light wash only under the bottom of the logo */}
          <ellipse
            ref={glowRef}
            className="vox-intro__floor-glow"
            cx="755"
            cy="655"
            rx="260"
            ry="22"
            fill={`url(#${fFloor})`}
            style={{ opacity: 0 }}
          />

          <path
            ref={drawLineRef}
            className="vox-intro__draw-line"
            d={PATH}
            fill="none"
            stroke={`url(#${gLine})`}
            strokeWidth={9}
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`url(#${fTube})`}
            style={{ opacity: 0 }}
          />

          <circle
            ref={tipDotRef}
            r={10}
            cx={295}
            cy={140}
            fill="#a78bfa"
            filter={`url(#${fTip})`}
            style={{ opacity: 0 }}
          />

          {/* Logo on top: drop-shadow follows path borders, drawn under the paint */}
          <g
            ref={ribbonRef}
            className="vox-intro__ribbon"
            filter={`url(#${fBevel})`}
            style={{ opacity: 0 }}
          >
            {/* Base ribbon */}
            <path
              d={PATH}
              fill="none"
              stroke={`url(#${gA})`}
              strokeWidth={78}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.98}
            />
            {/* Depth layer */}
            <path
              d={PATH}
              fill="none"
              stroke={`url(#${gB})`}
              strokeWidth={40}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.55}
              transform="translate(14,9)"
              style={{ mixBlendMode: "multiply" }}
            />
            {/* Specular highlight thread (gloss) */}
            <path
              d={PATH}
              fill="none"
              stroke={`url(#${gHighlight})`}
              strokeWidth={14}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.75}
              transform="translate(-6,-8)"
            />
          </g>
        </svg>

        <div
          ref={textBlockRef}
          className="vox-intro__text"
          style={{ opacity: 0 }}
        >
          <div className="vox-intro__wordmark">
            <span className="vox">Vol</span>
            <span className="mind">miq</span>
          </div>
          <div className="vox-intro__tagline">
            <span className="voice">Your Voice.</span>{" "}
            <span className="community">Your Community.</span>
          </div>
        </div>

        {showReplay && (
          <button
            ref={replayBtnRef}
            type="button"
            className="vox-intro__replay"
            style={{ opacity: 0 }}
            onClick={() => playIntro()}
          >
            Replay
          </button>
        )}
      </div>
    </div>
  );
}

export function resetVolmiqIntro() {
  try {
    localStorage.removeItem("volmiq_intro_seen");
  } catch {
    /* ignore */
  }
}
