"use client";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useReducer,
  useCallback,
} from "react";
import {
  Monitor,
  Folder,
  Heart,
  Mail,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Music,
  Minus,
  Square,
  X,
  Repeat,
} from "lucide-react";
import { copy } from "./content";
import { HomeSpace } from "./home-space";
import { ProjectExplorer } from "./project-explorer";
import { ImageWindow } from "./image-window";
import { imageWindowReducer } from "./window-state";
import { animateWindow, windowOffset } from "./window-animation";
import { projects } from "./projects";
import { AboutSpace } from "./about-space";
import { profile, sectionNames } from "./profile-data";
import { sectionTitles, sectionIndex } from "./seo";
import { playlist, type Track } from "./playlist";
const bevel =
  "border-2 border-t-[#747474] border-l-[#747474] border-r-black border-b-black shadow-[1px_1px_0_#101010]";
const pressed =
  "border-2 border-t-black border-l-black border-r-[#747474] border-b-[#747474]";
const icons = [Monitor, Folder, Heart, Mail];

function WinButton({
  children,
  onClick,
  className = "",
  label,
  active = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  label?: string;
  active?: boolean;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className={`${active ? pressed : `${bevel} hover:bg-[#242424]`} bg-[#161616] px-3 py-2 text-sm text-white active:translate-y-px focus-visible:outline-2 focus-visible:outline-dotted focus-visible:outline-[#000080] ${className}`}
    >
      {children}
    </button>
  );
}

function MarqueeText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [overflows, setOverflows] = useState(false);

  useLayoutEffect(() => {
    const el = containerRef.current;
    const txt = textRef.current;
    if (!el || !txt) return;

    const check = () => {
      if (el.clientWidth === 0) return;
      const textWidth = Math.max(
        txt.scrollWidth,
        txt.getBoundingClientRect().width,
      );
      setOverflows(textWidth > el.clientWidth);
    };

    check();

    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(check);
    }

    const observer = new ResizeObserver(check);
    observer.observe(el);
    window.addEventListener("resize", check);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", check);
    };
  }, [text]);

  return (
    <span
      ref={containerRef}
      className={`relative flex w-full min-w-0 items-center overflow-hidden whitespace-nowrap ${className}`}
    >
      <span
        className={
          overflows
            ? "inline-flex w-max animate-marquee hover:[animation-play-state:paused] motion-reduce:animate-none"
            : "inline-block"
        }
      >
        <span className={overflows ? "inline-block pr-8" : "inline-block"}>
          <span ref={textRef}>{text}</span>
        </span>
        {overflows && (
          <span aria-hidden="true" className="inline-block pr-8">
            {text}
          </span>
        )}
      </span>
    </span>
  );
}

interface AudioNodes {
  ctx: AudioContext;
  analyser: AnalyserNode;
  panner?: StereoPannerNode;
  eqFilter?: BiquadFilterNode;
}

function getOrCreateAudioNodes(audioEl: HTMLAudioElement): AudioNodes | null {
  const customEl = audioEl as unknown as {
    __audioNodes?: AudioNodes;
    __audioCtx?: AudioContext;
    __analyser?: AnalyserNode;
  };
  if (customEl.__audioNodes) {
    return customEl.__audioNodes;
  }
  if (typeof window === "undefined") return null;

  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) return null;

    const ctx = new AudioContextClass();
    const source = ctx.createMediaElementSource(audioEl);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.75;

    let panner: StereoPannerNode | undefined;
    if (typeof ctx.createStereoPanner === "function") {
      panner = ctx.createStereoPanner();
    }

    const eqFilter = ctx.createBiquadFilter();
    eqFilter.type = "peaking";
    eqFilter.frequency.value = 1000;
    eqFilter.gain.value = 0;

    let lastNode: AudioNode = source;
    lastNode.connect(eqFilter);
    lastNode = eqFilter;

    if (panner) {
      lastNode.connect(panner);
      lastNode = panner;
    }

    lastNode.connect(analyser);
    analyser.connect(ctx.destination);

    const nodes: AudioNodes = { ctx, analyser, panner, eqFilter };
    customEl.__audioNodes = nodes;
    customEl.__audioCtx = ctx;
    customEl.__analyser = analyser;
    return nodes;
  } catch (e) {
    console.warn("Could not create Web Audio analyser:", e);
    return null;
  }
}

function getOrCreateAudioAnalyser(
  audioEl: HTMLAudioElement,
): AnalyserNode | null {
  return getOrCreateAudioNodes(audioEl)?.analyser || null;
}

function AudioVisualizer({
  audioRef,
  playing,
  className = "",
  barColor = "bg-[#f1fa8c]",
}: {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  playing: boolean;
  className?: string;
  barColor?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const analyser = getOrCreateAudioAnalyser(el);
    const ctx = (el as unknown as { __audioCtx?: AudioContext }).__audioCtx;

    if (ctx && ctx.state === "suspended" && playing) {
      ctx.resume().catch(() => {});
    }

    const freqData = analyser
      ? new Uint8Array(analyser.frequencyBinCount)
      : null;
    const timeData = analyser ? new Uint8Array(analyser.fftSize) : null;

    const bins = [1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 17, 20, 24, 28, 32];

    const update = () => {
      const bars = containerRef.current?.children;
      if (!bars || bars.length !== 16) return;

      if (playing && analyser && freqData && timeData) {
        analyser.getByteFrequencyData(freqData);
        analyser.getByteTimeDomainData(timeData);

        let sum = 0;
        for (let j = 0; j < timeData.length; j += 4) {
          const diff = (timeData[j] - 128) / 128;
          sum += diff * diff;
        }
        const rms = Math.min(1, Math.sqrt(sum / (timeData.length / 4)) * 2);

        let totalFreq = 0;
        for (let k = 0; k < 32; k++) totalFreq += freqData[k];

        if (totalFreq > 10 || rms > 0.04) {
          for (let i = 0; i < 16; i++) {
            const bin = bins[i];
            const raw = freqData[bin] || 0;
            const boost = 1 + (i / 15) * 1.5;
            const freqNorm = (raw / 255) * boost;

            const level = Math.min(1, freqNorm * 0.75 + rms * 0.45);
            const heightPx = Math.max(3, Math.min(22, Math.round(level * 22)));

            (bars[i] as HTMLElement).style.height = `${heightPx}px`;
          }
        } else {
          const tSec = el.currentTime;
          for (let i = 0; i < 16; i++) {
            const wave =
              Math.sin(tSec * 16 + i * 0.6) * 0.4 +
              Math.sin(tSec * 8 - i * 0.3) * 0.3 +
              0.5;
            const heightPx = Math.max(3, Math.min(22, Math.round(wave * 20)));
            (bars[i] as HTMLElement).style.height = `${heightPx}px`;
          }
        }
      } else if (playing) {
        const tSec = el.currentTime;
        for (let i = 0; i < 16; i++) {
          const wave =
            Math.sin(tSec * 16 + i * 0.6) * 0.4 +
            Math.sin(tSec * 8 - i * 0.3) * 0.3 +
            0.5;
          const heightPx = Math.max(3, Math.min(22, Math.round(wave * 20)));
          (bars[i] as HTMLElement).style.height = `${heightPx}px`;
        }
      } else {
        for (let i = 0; i < 16; i++) {
          (bars[i] as HTMLElement).style.height = "3px";
        }
      }

      if (playing) {
        rafRef.current = requestAnimationFrame(update);
      }
    };

    update();

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [audioRef, playing]);

  return (
    <div
      ref={containerRef}
      className={`flex h-6 items-end justify-between gap-[2px] ${className}`}
      aria-hidden
    >
      {[8, 16, 11, 20, 6, 14, 18, 10, 20, 13, 8, 19, 11, 15, 6, 18].map(
        (h, i) => (
          <span
            key={i}
            className={`w-1.5 sm:w-2 ${barColor} transition-[height] duration-75 rounded-[1px]`}
            style={{ height: `${h}px` }}
          />
        ),
      )}
    </div>
  );
}

function formatTime(sec: number) {
  if (!sec || isNaN(sec) || !isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function Desktop({
  initialLang = "pt",
  initialSection = 0,
}: {
  initialLang?: "pt" | "en";
  initialSection?: number;
}) {
  const [lang, setLang] = useState<"pt" | "en">(initialLang),
    [active, setActive] = useState(initialSection),
    [start, setStart] = useState(false),
    [playerOpen, setPlayerOpen] = useState(false),
    [playerShown, setPlayerShown] = useState(false),
    [playing, setPlaying] = useState(false),
    [track, setTrack] = useState(0),
    [progress, setProgress] = useState(0),
    [duration, setDuration] = useState(0),
    [volume, setVolume] = useState(0.35),
    [balance, setBalance] = useState(0),
    [eqEnabled, setEqEnabled] = useState(false),
    [playlistOpen, setPlaylistOpen] = useState(false),
    [shuffle, setShuffle] = useState(false),
    [repeat, setRepeat] = useState(true),
    [currentPlaylist, setCurrentPlaylist] = useState<Track[]>(playlist),
    [time, setTime] = useState("00:00");
  const [imageWindows, dispatchWindow] = useReducer(imageWindowReducer, []);
  const visibleWindows = imageWindows
    .filter((window) => !window.minimized)
    .sort((a, b) => a.order - b.order);
  const activeImage = visibleWindows.at(-1)?.id;
  const windowRef = useRef<HTMLElement>(null),
    busy = useRef(false),
    transitionOrigin = useRef({ x: 0, y: 60 }),
    frame = useRef<HTMLDivElement>(null),
    content = useRef<HTMLDivElement>(null),
    last = useRef(0),
    touch = useRef(0),
    audio = useRef<HTMLAudioElement>(null),
    playerRef = useRef<HTMLElement | null>(null),
    playerAnim = useRef<Animation | null>(null),
    fileInputRef = useRef<HTMLInputElement>(null);
  const t = copy[lang];
  const currentTrack =
    currentPlaylist[track] || currentPlaylist[0] || playlist[0];
  const openImage = (index: number) => {
    const project = projects[index];
    dispatchWindow({
      type: "open",
      window: {
        id: project.name,
        src: project.image,
        title: `${project.name}.png`,
        alt: project.alt[lang],
      },
    });
  };
  const openProject = (index: number) => {
    const project = projects[index];
    dispatchWindow({
      type: "open",
      window: {
        id: `project:${project.name}`,
        title: `${project.name}.exe`,
        src: project.image,
        alt: project.alt[lang],
        projectIndex: index,
      },
    });
  };
  const change = (n: number) => {
    dispatchWindow({ type: "minimize-all" });
    if (n < 0 || n > 3 || n === active || busy.current) return;
    history.pushState(
      {},
      "",
      `${lang === "en" ? "/en" : "/"}${n === 0 ? "" : `?section=${sectionNames[n]}`}`,
    );
    last.current = Date.now();
    setStart(false);
    const el = windowRef.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setActive(n);
      return;
    }
    busy.current = true;
    const target = frame.current?.querySelector(`[data-task="${active}"]`),
      incoming = frame.current?.querySelector(`[data-task="${n}"]`);
    transitionOrigin.current = windowOffset(el, incoming);
    const animation = animateWindow(el, "minimize", windowOffset(el, target));
    if (!animation) {
      setActive(n);
      busy.current = false;
      return;
    }
    animation.onfinish = () => setActive(n);
  };

  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    document.title = sectionTitles[lang][active];
  }, [lang, active]);
  useEffect(() => {
    const back = () =>
      setActive(
        sectionIndex(new URLSearchParams(location.search).get("section")),
      );
    addEventListener("popstate", back);
    return () => removeEventListener("popstate", back);
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
    localStorage.setItem("portfolio-language", lang);
  }, [lang]);
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    let accumulated = 0;
    const wheel = (e: WheelEvent) => {
      if (!!activeImage || (e.target as HTMLElement).closest('[role="dialog"]'))
        return;
      const sc = content.current;
      if (!sc) return;
      const down = e.deltaY > 0;
      if (
        (down && sc.scrollTop + sc.clientHeight < sc.scrollHeight - 2) ||
        (!down && sc.scrollTop > 2)
      )
        return;
      e.preventDefault();
      if (Date.now() - last.current < 850) return;
      accumulated += e.deltaY;
      if (Math.abs(accumulated) > 65) {
        change(active + (accumulated > 0 ? 1 : -1));
        accumulated = 0;
      }
    };
    el.addEventListener("wheel", wheel, { passive: false });
    return () => el.removeEventListener("wheel", wheel);
  }, [active, activeImage]);
  useLayoutEffect(() => {
    content.current?.scrollTo(0, 0);
    const el = windowRef.current;
    if (!el) return;
    el.getAnimations().forEach((a) => a.cancel());
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      busy.current = false;
      return;
    }
    busy.current = true;
    const animation = animateWindow(el, "open", transitionOrigin.current);
    if (!animation) {
      busy.current = false;
      return;
    }
    animation.onfinish = () => {
      busy.current = false;
    };
    return () => animation.cancel();
  }, [active]);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const animations: Animation[] = [];
    frame.current?.querySelectorAll("[data-float]").forEach((el, i) => {
      animations.push(
        el.animate(
          [
            { transform: "translateY(0px)" },
            { transform: `translateY(-${i === 0 ? 18 : 10}px)` },
            { transform: "translateY(0px)" },
          ],
          {
            duration: 4700 + i * 510,
            iterations: Infinity,
            easing: "ease-in-out",
            delay: i * 270,
          },
        ),
      );
    });
    return () => animations.forEach((a) => a.cancel());
  }, [active]);
  useEffect(
    () => () => {
      playerAnim.current?.cancel();
    },
    [],
  );
  async function play(index = track) {
    const el = audio.current;
    if (!el) return;
    const targetTrack = currentPlaylist[index] || currentPlaylist[0];
    if (!el.src || !el.src.includes(targetTrack.src) || index !== track) {
      el.src = targetTrack.src;
      setTrack(index);
    }
    el.volume = volume;
    try {
      const nodes = getOrCreateAudioNodes(el);
      const ctx = nodes?.ctx;
      if (ctx && ctx.state === "suspended") {
        await ctx.resume();
      }
      if (nodes?.panner) {
        nodes.panner.pan.value = balance;
      }
      if (nodes?.eqFilter) {
        nodes.eqFilter.gain.value = eqEnabled ? 6 : 0;
      }
      await el.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  }
  const stopTrack = useCallback(() => {
    if (audio.current) {
      audio.current.pause();
      audio.current.currentTime = 0;
    }
    setProgress(0);
    setPlaying(false);
  }, []);
  const nextTrack = (delta: number) => {
    if (currentPlaylist.length === 0) return;
    let n: number;
    if (shuffle && currentPlaylist.length > 1) {
      let rand = Math.floor(Math.random() * (currentPlaylist.length - 1));
      if (rand >= track) rand++;
      n = rand;
    } else {
      n = (track + delta + currentPlaylist.length) % currentPlaylist.length;
    }
    if (audio.current) {
      audio.current.src = currentPlaylist[n].src;
      setTrack(n);
      setProgress(0);
      setDuration(0);
      if (playing) audio.current.play().catch(() => setPlaying(false));
    }
  };
  const runPlayerAnimation = useCallback(
    (node: HTMLElement, direction: "open" | "minimize") => {
      if (playerAnim.current) {
        playerAnim.current.onfinish = null;
        playerAnim.current.cancel();
      }
      const target = document.querySelector("[data-taskbar-music]");
      const anim = animateWindow(node, direction, windowOffset(node, target));
      playerAnim.current = anim;
      const finish = () => {
        playerAnim.current = null;
        if (direction === "minimize") {
          setPlayerShown(false);
        }
      };
      if (anim) {
        anim.onfinish = finish;
      } else {
        finish();
      }
    },
    [],
  );
  const openPlayer = useCallback(() => {
    setPlayerOpen(true);
    if (playerShown && playerRef.current) {
      runPlayerAnimation(playerRef.current, "open");
    } else {
      setPlayerShown(true);
    }
  }, [playerShown, runPlayerAnimation]);
  const minimizePlayer = useCallback(() => {
    setPlayerOpen(false);
    const el = playerRef.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPlayerShown(false);
      return;
    }
    runPlayerAnimation(el, "minimize");
  }, [runPlayerAnimation]);
  const closePlayer = useCallback(() => {
    if (playerAnim.current) {
      playerAnim.current.onfinish = null;
      playerAnim.current.cancel();
      playerAnim.current = null;
    }
    setPlayerOpen(false);
    setPlayerShown(false);
    stopTrack();
  }, [stopTrack]);
  const togglePlayer = useCallback(() => {
    if (playerOpen) {
      minimizePlayer();
    } else {
      openPlayer();
    }
  }, [playerOpen, minimizePlayer, openPlayer]);
  const attachPlayer = useCallback(
    (node: HTMLElement | null) => {
      playerRef.current = node;
      if (node) {
        runPlayerAnimation(node, "open");
      }
    },
    [runPlayerAnimation],
  );
  return (
    <main
      lang={lang === "pt" ? "pt-BR" : "en"}
      ref={frame}
      className="fixed inset-0 flex h-dvh flex-col overflow-hidden bg-[#2864bf] text-[#182047]"
      onTouchStart={(e) => {
        touch.current = e.touches[0].clientY;
      }}
      onTouchEnd={(e) => {
        if (activeImage) return;
        const delta = touch.current - e.changedTouches[0].clientY;
        const sc = content.current;
        if (
          sc &&
          Math.abs(delta) > 70 &&
          Date.now() - last.current > 850 &&
          (delta > 0
            ? sc.scrollTop + sc.clientHeight >= sc.scrollHeight - 2
            : sc.scrollTop <= 2)
        )
          change(active + (delta > 0 ? 1 : -1));
      }}
      onKeyDown={(e) => {
        if (activeImage) return;
        if ((e.target as HTMLElement).closest("button,input,a,textarea"))
          return;
        if (e.key === "PageDown") {
          e.preventDefault();
          change(active + 1);
        }
        if (e.key === "PageUp") {
          e.preventDefault();
          change(active - 1);
        }
      }}
      tabIndex={-1}
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      >
        <source src="/background.webm" type="video/webm" />
      </video>
      <header className="relative flex h-16 shrink-0 items-center justify-end gap-4 px-4 text-xs text-white/90 sm:px-7">
        <span className="flex items-center gap-2">
          <svg
            width="24"
            height="24"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            fill="CurrentColor"
          >
            <rect x="0" fill="none" width="20" height="20" />
            <g>
              <path d="M11 7H9.49c-.63 0-1.25.3-1.59.7L7 5H4.13l-2.39 7h1.69l.74-2H7v4H2c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h7c1.1 0 2 .9 2 2v2zM6.51 9H4.49l1-2.93zM10 8h7c1.1 0 2 .9 2 2v7c0 1.1-.9 2-2 2h-7c-1.1 0-2-.9-2-2v-7c0-1.1.9-2 2-2zm7.25 5v-1.08h-3.17V9.75h-1.16v2.17H9.75V13h1.28c.11.85.56 1.85 1.28 2.62-.87.36-1.89.62-2.31.62-.01.02.22.97.2 1.46.84 0 2.21-.5 3.28-1.15 1.09.65 2.48 1.15 3.34 1.15-.02-.49.2-1.44.2-1.46-.43 0-1.49-.27-2.38-.63.7-.77 1.14-1.77 1.25-2.61h1.36zm-3.81 1.93c-.5-.46-.85-1.13-1.01-1.93h2.09c-.17.8-.51 1.47-1 1.93l-.04.03s-.03-.02-.04-.03z" />
            </g>
          </svg>
        </span>
        <div className="flex gap-1">
          <a
            href={active === 0 ? "/" : `/?section=${sectionNames[active]}`}
            aria-current={lang === "pt" ? "page" : undefined}
            className={`px-2 py-1 ${lang === "pt" ? "bg-white text-[#000080]" : "text-white"}`}
          >
            PT
          </a>
          <span className="py-1">/</span>
          <a
            href={active === 0 ? "/en" : `/en?section=${sectionNames[active]}`}
            aria-current={lang === "en" ? "page" : undefined}
            className={`px-2 py-1 ${lang === "en" ? "bg-white text-[#000080]" : "text-white"}`}
          >
            EN
          </a>
        </div>
      </header>
      <div className="relative flex min-h-0 flex-1 gap-3 px-3 pb-4 sm:gap-6 sm:px-6">
        <nav
          aria-label={lang === "pt" ? "Navegação principal" : "Main navigation"}
          className="hidden w-24 shrink-0 flex-col gap-7 pt-12 sm:flex"
        >
          {t.nav.map((name, i) => {
            const Icon = icons[i];
            return (
              <a
                href={`${lang === "en" ? "/en" : "/"}${i === 0 ? "" : `?section=${sectionNames[i]}`}`}
                key={i}
                aria-current={active === i ? "page" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  change(i);
                }}
                className={`group flex flex-col items-center gap-2 p-2 text-sm text-white ${active === i ? "bg-[#000080]/55 outline-1 outline-dotted outline-white" : "hover:bg-white/10"}`}
              >
                <Icon
                  size={37}
                  strokeWidth={1.7}
                  className="drop-shadow-[2px_2px_0_#092b66]"
                  fill={i === 1 ? "#f9d576" : i === 2 ? "#65bdff" : "#aed5ed"}
                />
                <span className="text-center leading-tight">{name}</span>
              </a>
            );
          })}
        </nav>
        <section
          ref={windowRef}
          className={`${active === 0 ? "bg-transparent p-0" : bevel + " bg-[#161616] p-1"} relative flex min-h-0 min-w-0 flex-1 flex-col will-change-transform`}
          aria-label={t.nav[active]}
        >
          <div
            className={`${active === 0 ? "hidden" : "flex"} h-8 shrink-0 items-center justify-between bg-linear-to-r from-[#000080] to-[#1e69b7] px-2 text-sm font-bold text-white`}
          >
            <span className="flex items-center gap-2">
              {(() => {
                const Icon = icons[active];
                return <Icon size={17} />;
              })()}{" "}
              {t.nav[active]}.exe
            </span>
            <div className="flex gap-1">
              <span
                aria-hidden
                className={`${bevel} flex size-6 items-center justify-center bg-[#161616] text-white opacity-65 cursor-not-allowed`}
              >
                <Minus size={14} />
              </span>
              <span
                aria-hidden
                className={`${bevel} flex size-6 items-center justify-center bg-[#161616] text-white opacity-65 cursor-not-allowed`}
              >
                <Square size={14} />
              </span>
              <span
                aria-hidden
                className="border-2 border-t-[#ff7fff] border-l-[#ff7fff] border-r-[#5f036a] border-b-[#5f036a] shadow-[1px_1px_0_#101010] flex size-6 items-center justify-center bg-[#eb0083] text-white opacity-65 cursor-not-allowed"
              >
                <X size={14} />
              </span>
            </div>
          </div>
          <div
            className={`${active === 0 ? "hidden" : "flex"} h-9 shrink-0 items-center gap-5 border-b border-[#999] px-3 text-xs`}
          >
            <span>{lang === "pt" ? "Arquivo" : "File"}</span>
            <span>{lang === "pt" ? "Explorar" : "Explore"}</span>
            <span>{lang === "pt" ? "Ajuda" : "Help"}</span>
            <span className="ml-auto hidden text-[#626262] sm:block">
              C:\\Joana\\{["home", "projects", "about", "contact"][active]}
            </span>
          </div>
          <div
            ref={active === 0 ? undefined : content}
            className={`relative min-h-0 flex-1 ${active === 0 ? " bg-transparent" : "overflow-y-auto overscroll-contain bg-[#f4f3ef]"}`}
          >
            {active === 0 && (
              <HomeSpace
                lang={lang}
                scrollRef={content}
                onProjects={() => change(1)}
              />
            )}
            {active === 1 && (
              <ProjectExplorer
                lang={lang}
                onImage={openImage}
                onProject={openProject}
              />
            )}
            {active === 2 && <AboutSpace lang={lang} />}
            {active === 3 && (
              <div className="flex min-h-full flex-col items-center justify-center p-7 text-center sm:p-12">
                <div className={`${bevel} mb-7 bg-[#d8e6ef] p-5`}>
                  <Mail size={46} strokeWidth={1.4} />
                </div>
                <span className="text-xs text-[#777989]">NEW_MESSAGE.txt</span>
                <h1 className="mt-4 max-w-xl text-4xl font-black tracking-tight sm:text-5xl">
                  {t.contact}
                </h1>
                <p className="mt-6 max-w-lg text-base leading-relaxed text-[#686a7c]">
                  {t.contactText}
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <a
                    href={`mailto:${profile.email}`}
                    className={`${bevel} bg-[#161616] hover:bg-[#242424] px-4 py-3 text-sm font-bold text-white active:translate-y-px`}
                  >
                    {lang === "pt" ? "Enviar e-mail" : "Send email"}
                  </a>
                  <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${bevel} bg-[#161616] hover:bg-[#242424] px-4 py-3 text-sm text-white active:translate-y-px`}
                  >
                    LinkedIn
                  </a>
                  <a
                    href={profile.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${bevel} bg-[#161616] hover:bg-[#242424] px-4 py-3 text-sm text-white active:translate-y-px`}
                  >
                    GitHub
                  </a>
                </div>
                <a
                  href={`mailto:${profile.email}`}
                  className="mt-5 text-sm text-[#254b97] underline"
                >
                  {profile.email}
                </a>
                <p className="mt-5 text-sm text-[#777989]">
                  {lang === "pt"
                    ? "Garanhuns, Pernambuco, Brasil"
                    : "Garanhuns, Pernambuco, Brazil"}
                </p>
              </div>
            )}
          </div>
          <footer
            className={`flex h-9 shrink-0 items-center justify-between gap-2 pt-1 text-xs ${active === 0 ? "mt-4 border-t border-white/20 text-[#c8dbff] bg-[#161616] pb-1" : "text-[#555563]"}`}
          >
            {active === 0 && (
              <span className="ml-2 text-[#f2d893] animate-blink">
                &nbsp;✦&nbsp;
              </span>
            )}
            <span
              className={`${active === 0 ? "" : `${pressed} px-2 `} flex h-full min-w-0 flex-1 items-center overflow-hidden`}
            >
              {active === 0 ? (
                <>
                  <span className="hidden lg:inline truncate">{t.scroll}</span>
                  <MarqueeText text={t.scrollMobile} className="lg:hidden" />
                </>
              ) : (
                <span className="truncate">{t.nav[active]}</span>
              )}
            </span>
            <div
              className={`${active === 0 ? "" : pressed} flex h-full items-center gap-3 px-2`}
            >
              <button
                aria-label="Previous"
                disabled={active === 0}
                onClick={() => change(active - 1)}
                className={`${bevel} cursor-pointer flex h-6 w-6 items-center justify-center bg-[#161616] hover:bg-[#242424] text-white active:translate-y-px disabled:opacity-30 disabled:hover:bg-[#161616] disabled:cursor-not-allowed disabled:active:translate-y-0`}
              >
                <ChevronLeft size={16} />
              </button>
              <span>0{active + 1} / 04</span>
              <button
                aria-label="Next"
                disabled={active === 3}
                onClick={() => change(active + 1)}
                className={`${bevel} cursor-pointer flex h-6 w-6 items-center justify-center bg-[#161616] hover:bg-[#242424] text-white active:translate-y-px disabled:opacity-30 disabled:hover:bg-[#161616] disabled:cursor-not-allowed disabled:active:translate-y-0`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </footer>
        </section>
      </div>
      {start && (
        <div
          className={`${bevel} absolute bottom-14 left-2 z-50 flex bg-[#161616] p-1`}
        >
          <div className="flex w-8 items-end bg-linear-to-b from-[#000080] to-[#2855a9] px-1 py-3 text-white [writing-mode:vertical-rl] text-xs">
            © 2026 Joana Souto
          </div>
          <div>
            {t.nav.map((n, i) => {
              const Icon = icons[i];
              return (
                <button
                  key={n}
                  onClick={() => change(i)}
                  className="flex w-52 items-center gap-4 px-5 py-4 text-sm text-white hover:bg-[#242424] cursor-pointer"
                >
                  <Icon size={22} />
                  {n}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {playerShown && (
        <aside
          ref={attachPlayer}
          className={`${bevel} absolute right-3 bottom-15 z-50 w-[min(460px,calc(100vw-24px))] bg-[#161616] text-white p-1 select-none font-mono shadow-2xl`}
          aria-label={t.music}
        >
          {/* Header Titlebar */}
          <div className="flex items-center justify-between bg-linear-to-r from-[#000080] to-[#2855a9] px-2 py-1 text-sm text-white">
            <span className="flex items-center gap-1.5 font-mono text-sm font-bold">
              <Music size={14} /> Playlist.exe
            </span>
            <div className="flex gap-1">
              <button
                aria-label={
                  lang === "pt" ? "Minimizar player" : "Minimize player"
                }
                onClick={minimizePlayer}
                className={`${bevel} flex size-6 items-center justify-center bg-[#161616] hover:bg-[#242424] text-white active:translate-y-px cursor-pointer`}
              >
                <Minus size={14} />
              </button>
              <span
                aria-hidden
                className={`${bevel} flex size-6 items-center justify-center bg-[#161616] text-white opacity-65 cursor-not-allowed`}
              >
                <Square size={14} />
              </span>
              <button
                aria-label={lang === "pt" ? "Fechar player" : "Close player"}
                onClick={closePlayer}
                className="border-2 border-t-[#ff7fff] border-l-[#ff7fff] border-r-[#5f036a] border-b-[#5f036a] shadow-[1px_1px_0_#101010] flex size-6 items-center justify-center bg-[#eb0083] hover:bg-[#ff279f] text-white active:translate-y-px cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Main Inner Container */}
          <div className="border-2 border-t-[#24042b] border-l-[#24042b] border-r-[#443e5b] border-b-[#443e5b] bg-[#282a36] p-2 flex flex-col gap-2">
            {/* Upper Section: Left LCD box + Right info/sliders/buttons */}
            <div className="flex flex-col sm:flex-row gap-2 items-stretch">
              {/* Left Screen: Status, Time and Visualizer */}
              <div className="w-full sm:w-[165px] shrink-0 h-[84px] bg-[#12131a] border-2 border-t-black border-l-black border-r-[#444] border-b-[#444] p-2 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {playing ? (
                      <Play
                        size={12}
                        fill="#f1fa8c"
                        className="text-[#f1fa8c]"
                      />
                    ) : progress > 0 ? (
                      <Pause
                        size={12}
                        fill="#f1fa8c"
                        className="text-[#f1fa8c]"
                      />
                    ) : (
                      <Square
                        size={9}
                        fill="#6272a4"
                        className="text-[#6272a4]"
                      />
                    )}
                  </div>
                  <span className="font-mono text-xl font-bold tracking-widest text-[#f1fa8c] [text-shadow:0_0_8px_rgba(80,250,123,0.35)] select-none leading-none">
                    {formatTime(progress)}
                  </span>
                </div>
                <AudioVisualizer
                  audioRef={audio}
                  playing={playing}
                  barColor="bg-[#f1fa8c]"
                />
              </div>

              {/* Right Column */}
              <div className="flex-1 min-w-0 flex flex-col justify-between gap-1.5 h-[84px]">
                {/* Track marquee/title box */}
                <div
                  className="border border-t-black border-l-black border-r-[#444] border-b-[#444] bg-[#12131a] px-2 py-1 flex items-center overflow-hidden h-7"
                  title={`${track + 1}. ${currentTrack.title} · ${currentTrack.artist} (${formatTime(duration)})`}
                >
                  <p className="font-mono text-xs font-semibold text-[#f1fa8c] truncate w-full">
                    {track + 1}. {currentTrack.title} ({formatTime(duration)})
                  </p>
                </div>

                {/* Technical badges & sliders & EQ/PL buttons */}
                <div className="flex items-end justify-between gap-1.5 pt-0.5">
                  {/* Volume Slider */}
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="bg-black border border-[#333] px-1 text-[9px] text-[#f1fa8c] font-mono leading-tight">
                        128
                      </span>
                      <span className="text-[9px] text-[#8be9fd] font-mono">
                        Kbps
                      </span>
                    </div>
                    <div className="relative w-16 sm:w-20">
                      <input
                        aria-label="Volume"
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => {
                          const val = +e.target.value;
                          setVolume(val);
                          if (audio.current) audio.current.volume = val;
                        }}
                        className="w-full h-2 bg-[#12131a] appearance-none cursor-pointer border border-t-black border-l-black border-r-[#444] border-b-[#444] focus:outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-[#282a36] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-t-[#747474] [&::-webkit-slider-thumb]:border-l-[#747474] [&::-webkit-slider-thumb]:border-r-black [&::-webkit-slider-thumb]:border-b-black [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:bg-[#282a36] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-t-[#747474] [&::-moz-range-thumb]:border-l-[#747474] [&::-moz-range-thumb]:border-r-black [&::-moz-range-thumb]:border-b-black"
                        title={`Volume: ${Math.round(volume * 100)}%`}
                      />
                    </div>
                  </div>

                  {/* Balance / Pan Slider */}
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="bg-black border border-[#333] px-1 text-[9px] text-[#f1fa8c] font-mono leading-tight">
                        48
                      </span>
                      <span className="text-[9px] text-[#8be9fd] font-mono">
                        kHz
                      </span>
                    </div>
                    <div className="relative w-16 sm:w-20">
                      <input
                        aria-label="Balance"
                        type="range"
                        min="-1"
                        max="1"
                        step="0.1"
                        value={balance}
                        onChange={(e) => {
                          const val = +e.target.value;
                          setBalance(val);
                          const nodes = getOrCreateAudioNodes(audio.current!);
                          if (nodes?.panner) {
                            nodes.panner.pan.value = val;
                          }
                        }}
                        className="w-full h-2 bg-[#12131a] appearance-none cursor-pointer border border-t-black border-l-black border-r-[#444] border-b-[#444] focus:outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-[#282a36] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-t-[#747474] [&::-webkit-slider-thumb]:border-l-[#747474] [&::-webkit-slider-thumb]:border-r-black [&::-webkit-slider-thumb]:border-b-black [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:bg-[#282a36] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-t-[#747474] [&::-moz-range-thumb]:border-l-[#747474] [&::-moz-range-thumb]:border-r-black [&::-moz-range-thumb]:border-b-black"
                        title={`Balance: ${balance === 0 ? "Center" : balance < 0 ? `L ${Math.round(Math.abs(balance) * 100)}%` : `R ${Math.round(balance * 100)}%`}`}
                      />
                    </div>
                  </div>

                  {/* EQ & PL Buttons */}
                  <div className="flex items-center gap-1 self-end pb-0.5">
                    <button
                      type="button"
                      aria-label="Equalizer"
                      onClick={() => {
                        setEqEnabled((prev) => {
                          const next = !prev;
                          const nodes = getOrCreateAudioNodes(audio.current!);
                          if (nodes?.eqFilter) {
                            nodes.eqFilter.gain.value = next ? 6 : 0;
                          }
                          return next;
                        });
                      }}
                      className={`${bevel} text-[10px] font-mono font-bold px-1.5 py-0.5 flex items-center gap-1 bg-[#161616] hover:bg-[#242424] text-white active:translate-y-px cursor-pointer`}
                      title="Equalizer Toggle"
                    >
                      <span
                        className={`size-1.5 shrink-0 ${eqEnabled ? "bg-[#f1fa8c] shadow-[0_0_4px_#f1fa8c]" : "bg-[#444]"}`}
                      />
                      EQ
                    </button>
                    <button
                      type="button"
                      aria-label="Playlist"
                      onClick={() => setPlaylistOpen((p) => !p)}
                      className={`${bevel} text-[10px] font-mono font-bold px-1.5 py-0.5 flex items-center gap-1 bg-[#161616] hover:bg-[#242424] text-white active:translate-y-px cursor-pointer`}
                      title="Playlist Editor Toggle"
                    >
                      <span
                        className={`size-1.5 shrink-0 ${playlistOpen ? "bg-[#f1fa8c] shadow-[0_0_4px_#f1fa8c]" : "bg-[#444]"}`}
                      />
                      PL
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Section: Full-Width Seek Bar */}
            <div className="w-full">
              <div className="relative w-full h-4 flex items-center">
                <input
                  aria-label={
                    lang === "pt" ? "Posição da música" : "Track position"
                  }
                  type="range"
                  min="0"
                  max={duration > 0 ? duration : 100}
                  step="0.1"
                  value={progress}
                  onChange={(e) => {
                    const val = +e.target.value;
                    setProgress(val);
                    if (audio.current) audio.current.currentTime = val;
                  }}
                  style={{
                    background: `linear-gradient(to right, #FF79C6 ${duration > 0 ? (progress / duration) * 100 : 0}%, #12131a ${duration > 0 ? (progress / duration) * 100 : 0}%)`,
                  }}
                  className="w-full h-3 appearance-none cursor-pointer border border-t-black border-l-black border-r-[#444] border-b-[#444] rounded-none focus:outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[#282a36] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-t-[#747474] [&::-webkit-slider-thumb]:border-l-[#747474] [&::-webkit-slider-thumb]:border-r-black [&::-webkit-slider-thumb]:border-b-black [&::-webkit-slider-thumb]:shadow-[1px_1px_0_#000] [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-7 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-[#282a36] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-t-[#747474] [&::-moz-range-thumb]:border-l-[#747474] [&::-moz-range-thumb]:border-r-black [&::-moz-range-thumb]:border-b-black [&::-moz-range-thumb]:cursor-pointer"
                />
              </div>
            </div>

            {/* Bottom Controls Row: Transport, Shuffle, Repeat */}
            <div className="flex items-center justify-between gap-1 flex-wrap sm:flex-nowrap">
              {/* Transport controls */}
              <div className="flex items-center gap-0.5">
                <button
                  aria-label="Previous"
                  onClick={() => {
                    if (audio.current && audio.current.currentTime > 3) {
                      audio.current.currentTime = 0;
                      setProgress(0);
                    } else {
                      nextTrack(-1);
                    }
                  }}
                  className={`${bevel} size-7 flex items-center justify-center bg-[#161616] hover:bg-[#242424] text-white active:translate-y-px cursor-pointer`}
                  title="Previous"
                >
                  <SkipBack size={13} fill="currentColor" />
                </button>
                <button
                  aria-label="Play"
                  onClick={() => play()}
                  className={`${bevel} size-7 flex items-center justify-center bg-[#161616] hover:bg-[#242424] text-white active:translate-y-px cursor-pointer`}
                  title="Play"
                >
                  <Play size={13} fill="currentColor" />
                </button>
                <button
                  aria-label="Stop"
                  onClick={stopTrack}
                  className={`${bevel} size-7 flex items-center justify-center bg-[#161616] hover:bg-[#242424] text-white active:translate-y-px cursor-pointer`}
                  title="Stop"
                >
                  <Square size={11} fill="currentColor" />
                </button>
                <button
                  aria-label="Pause"
                  onClick={() => {
                    audio.current?.pause();
                    setPlaying(false);
                  }}
                  className={`${bevel} size-7 flex items-center justify-center bg-[#161616] hover:bg-[#242424] text-white active:translate-y-px cursor-pointer`}
                  title="Pause"
                >
                  <Pause size={13} fill="currentColor" />
                </button>
                <button
                  aria-label="Next"
                  onClick={() => nextTrack(1)}
                  className={`${bevel} size-7 flex items-center justify-center bg-[#161616] hover:bg-[#242424] text-white active:translate-y-px cursor-pointer`}
                  title="Next"
                >
                  <SkipForward size={13} fill="currentColor" />
                </button>
              </div>

              {/* Right: Shuffle & Repeat */}
              <div className="flex items-center gap-1">
                <button
                  aria-label="Shuffle"
                  onClick={() => setShuffle((s) => !s)}
                  className={`${bevel} h-7 px-2 flex items-center gap-1.5 text-[10px] font-mono font-bold bg-[#161616] hover:bg-[#242424] text-white active:translate-y-px cursor-pointer`}
                  title="Shuffle"
                >
                  <span
                    className={`size-2 shrink-0 ${shuffle ? "bg-[#f1fa8c] shadow-[0_0_4px_#f1fa8c]" : "bg-[#444]"}`}
                  />
                  <span>SHUFFLE</span>
                </button>
                <button
                  aria-label="Repeat"
                  onClick={() => setRepeat((r) => !r)}
                  className={`${bevel} h-7 px-2 flex items-center gap-1.5 bg-[#161616] hover:bg-[#242424] text-white active:translate-y-px cursor-pointer`}
                  title="Repeat"
                >
                  <span
                    className={`size-2 shrink-0 ${repeat ? "bg-[#f1fa8c] shadow-[0_0_4px_#f1fa8c]" : "bg-[#444]"}`}
                  />
                  <Repeat size={12} />
                </button>
              </div>
            </div>

            {/* Optional Playlist Drawer when PL is active */}
            {playlistOpen && (
              <div className="mt-1 border-t border-t-[#3a354d] pt-1.5">
                <div className="border border-t-black border-l-black border-r-[#444] border-b-[#444] bg-[#12131a] p-1.5 max-h-36 overflow-y-auto font-mono text-xs">
                  <div className="flex justify-between items-center text-[10px] text-[#6272a4] border-b border-[#333] pb-1 mb-1 font-bold">
                    <span>PLAYLIST ({currentPlaylist.length})</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {currentPlaylist.map((tItem, idx) => {
                      const isCurrent = idx === track;
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setTrack(idx);
                            setProgress(0);
                            if (audio.current) {
                              audio.current.src = tItem.src;
                              audio.current
                                .play()
                                .then(() => setPlaying(true))
                                .catch(() => setPlaying(false));
                            }
                          }}
                          className={`flex items-center justify-between px-1.5 py-0.5 text-left cursor-pointer transition-colors ${
                            isCurrent
                              ? "bg-[#282a36] text-[#8be9fd]"
                              : "hover:bg-[#242424] text-white"
                          }`}
                        >
                          <span className="truncate pr-2">
                            {idx + 1}. {tItem.title} -{" "}
                            <span className="opacity-75">{tItem.artist}</span>
                          </span>
                          {isCurrent && playing && (
                            <span className="text-[10px] text-[#FF79C6] animate-pulse shrink-0">
                              ▶
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const url = URL.createObjectURL(file);
                const name = file.name.replace(/\.[^/.]+$/, "");
                const newTrackItem = {
                  title: name,
                  artist: "Local Audio",
                  src: url,
                };
                setCurrentPlaylist((prev) => {
                  const next = [...prev, newTrackItem];
                  const newIdx = next.length - 1;
                  setTrack(newIdx);
                  setProgress(0);
                  if (audio.current) {
                    audio.current.src = url;
                    audio.current
                      .play()
                      .then(() => setPlaying(true))
                      .catch(() => setPlaying(false));
                  }
                  return next;
                });
              }
            }}
          />
        </aside>
      )}
      <audio
        ref={audio}
        onTimeUpdate={() => {
          if (audio.current) {
            setProgress(audio.current.currentTime || 0);
            if (audio.current.duration && !isNaN(audio.current.duration)) {
              setDuration(audio.current.duration);
            }
          }
        }}
        onLoadedMetadata={() => {
          if (audio.current && audio.current.duration) {
            setDuration(audio.current.duration);
          }
        }}
        onDurationChange={() => {
          if (audio.current && audio.current.duration) {
            setDuration(audio.current.duration);
          }
        }}
        onEnded={() => {
          if (repeat && currentPlaylist.length === 1) {
            if (audio.current) {
              audio.current.currentTime = 0;
              audio.current.play().catch(() => setPlaying(false));
            }
            return;
          }
          if (!repeat && track === currentPlaylist.length - 1) {
            stopTrack();
            return;
          }
          let n: number;
          if (shuffle && currentPlaylist.length > 1) {
            let rand = Math.floor(Math.random() * (currentPlaylist.length - 1));
            if (rand >= track) rand++;
            n = rand;
          } else {
            n = (track + 1) % currentPlaylist.length;
          }
          const el = audio.current;
          if (el) {
            el.src = currentPlaylist[n].src;
            setTrack(n);
            setProgress(0);
            el.play().catch(() => setPlaying(false));
          }
        }}
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
      />
      <div className="relative z-40 flex h-13 shrink-0 items-center gap-2 border-t-2 border-[#747474] bg-[#161616] px-2 py-1.5">
        <WinButton
          onClick={() => setStart(!start)}
          active={start}
          className="flex items-center gap-2 px-2! cursor-pointer"
        >
          <span className="grid grid-cols-2 gap-px -skew-y-8">
            <i className="h-2 w-2 bg-white" />
            <i className="h-2 w-2 bg-white" />
            <i className="h-2 w-2 bg-white" />
            <i className="h-2 w-2 bg-white" />
          </span>
          <span className="inline">{t.start}</span>
        </WinButton>
        <div className="mx-1 h-8 border-r border-black border-l-black border-l" />
        <nav
          aria-label="Taskbar"
          className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {t.nav.map((n, i) => {
            const Icon = icons[i];
            const isCurrent = active === i && !activeImage;
            return (
              <a
                href={`${lang === "en" ? "/en" : "/"}${i === 0 ? "" : `?section=${sectionNames[i]}`}`}
                key={i}
                data-task={i}
                aria-label={n}
                aria-current={isCurrent ? "page" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  change(i);
                }}
                className={`${isCurrent ? pressed : `${bevel} hover:bg-[#242424]`} text-white flex h-9 min-w-9 shrink-0 flex-1 items-center justify-center gap-2 px-2 text-sm sm:max-w-44 sm:justify-start`}
              >
                <Icon size={17} className="shrink-0" />
                <span className="hidden truncate md:block">{n}</span>
              </a>
            );
          })}
          {imageWindows.map((window) => {
            const isCurrent = activeImage === window.id;
            return (
              <button
                key={window.id}
                data-image-task={window.id}
                aria-label={window.title}
                aria-pressed={isCurrent}
                onClick={() =>
                  dispatchWindow({ type: "toggle", id: window.id })
                }
                className={`${isCurrent ? pressed : `${bevel} hover:bg-[#242424]`} text-white cursor-pointer flex h-9 min-w-24 shrink-0 flex-1 items-center gap-2 px-2 text-sm sm:max-w-48`}
              >
                {window.projectIndex !== undefined ? (
                  <Folder size={16} fill="#f6d279" className="shrink-0" />
                ) : (
                  <Monitor size={16} className="shrink-0" />
                )}
                <span className="truncate">{window.title}</span>
              </button>
            );
          })}
        </nav>
        <button
          data-taskbar-music
          aria-label={t.music}
          aria-expanded={playerOpen}
          onClick={togglePlayer}
          className={`${playerOpen ? pressed : `${bevel} hover:bg-[#242424]`} cursor-pointer relative p-2 bg-[#161616] text-white active:translate-y-px`}
        >
          <Music size={19} />
          {playing && (
            <span className="absolute top-1 right-1 h-1.5 w-1.5 bg-[#f1fa8c] shadow-[0_0_4px_#f1fa8c]" />
          )}
        </button>
        <span
          className={`${pressed} hidden px-3 py-2 text-sm text-white lg:block`}
        >
          {time}
        </span>
      </div>
      {imageWindows.map((window) => (
        <ImageWindow
          key={window.id}
          window={window}
          onImage={openImage}
          lang={lang}
          rank={visibleWindows.findIndex((item) => item.id === window.id)}
          active={activeImage === window.id}
          onClose={() => dispatchWindow({ type: "close", id: window.id })}
          onMinimize={() => dispatchWindow({ type: "minimize", id: window.id })}
          onActivate={() => dispatchWindow({ type: "activate", id: window.id })}
        />
      ))}
    </main>
  );
}
