"use client";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useReducer,
} from "react";
import {
  Monitor,
  Folder,
  Heart,
  Mail,
  Code2,
  Paintbrush,
  Globe,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Music,
  Minus,
  Square,
  X,
  Star,
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
const bevel =
  "border-2 border-t-white border-l-white border-r-[#424242] border-b-[#424242] shadow-[1px_1px_0_#101010]";
const pressed =
  "border-2 border-t-[#424242] border-l-[#424242] border-r-white border-b-white";
const icons = [Monitor, Folder, Heart, Mail];

function WinButton({
  children,
  onClick,
  className = "",
  label,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  label?: string;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className={`${bevel} bg-[#c7c7c7] px-3 py-2 text-sm text-[#151515] active:translate-y-px focus-visible:outline-2 focus-visible:outline-dotted focus-visible:outline-[#000080] ${className}`}
    >
      {children}
    </button>
  );
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
    [player, setPlayer] = useState(false),
    [playing, setPlaying] = useState(false),
    [track, setTrack] = useState(0),
    [progress, setProgress] = useState(0),
    [volume, setVolume] = useState(0.35),
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
    bufferUrls = useRef<string[]>([]);
  const t = copy[lang];
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
      bufferUrls.current.forEach(URL.revokeObjectURL);
    },
    [],
  );
  function makeTrack(index: number) {
    const rate = 22050,
      duration = 48,
      length = rate * duration,
      bytes = new ArrayBuffer(44 + length * 2),
      view = new DataView(bytes);
    const str = (o: number, s: string) =>
      [...s].forEach((c, i) => view.setUint8(o + i, c.charCodeAt(0)));
    str(0, "RIFF");
    view.setUint32(4, 36 + length * 2, true);
    str(8, "WAVE");
    str(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, rate, true);
    view.setUint32(28, rate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    str(36, "data");
    view.setUint32(40, length * 2, true);
    const notes = index
      ? [261.63, 329.63, 392, 440, 392, 329.63, 293.66, 220]
      : [329.63, 392, 440, 523.25, 440, 392, 329.63, 293.66];
    for (let i = 0; i < length; i++) {
      const sec = i / rate,
        beat = sec % 0.375,
        f = notes[Math.floor(sec / 0.375) % notes.length],
        env = Math.exp(-beat * 10) * Math.min(beat * 100, 1),
        lead =
          (Math.sin(sec * f * Math.PI * 2) +
            0.18 * Math.sin(sec * f * Math.PI * 4)) *
          0.2 *
          env,
        bass =
          Math.sin(((sec * notes[Math.floor(sec / 3) % 8]) / 4) * Math.PI * 2) *
          0.12 *
          Math.exp(-(sec % 0.75) * 5),
        fade = Math.min(sec, 1, duration - sec);
      view.setInt16(
        44 + i * 2,
        Math.max(-1, Math.min(1, (lead + bass) * fade)) * 32767,
        true,
      );
    }
    return URL.createObjectURL(new Blob([bytes], { type: "audio/wav" }));
  }
  async function play(index = track) {
    const el = audio.current;
    if (!el) return;
    if (!bufferUrls.current[index])
      bufferUrls.current[index] = makeTrack(index);
    if (!el.src || index !== track) {
      el.src = bufferUrls.current[index];
      setTrack(index);
    }
    el.volume = volume;
    try {
      await el.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  }
  const nextTrack = (delta: number) => {
    const n = (track + delta + 2) % 2;
    if (audio.current) {
      audio.current.src =
        bufferUrls.current[n] || (bufferUrls.current[n] = makeTrack(n));
      setTrack(n);
      setProgress(0);
      if (playing) audio.current.play().catch(() => setPlaying(false));
    }
  };
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
          className={`${active === 0 ? "bg-transparent p-0" : bevel + " bg-[#c7c7c7] p-1"} relative flex min-h-0 min-w-0 flex-1 flex-col will-change-transform`}
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
              <WinButton
                label={lang === "pt" ? "Próxima janela" : "Next window"}
                onClick={() => change((active + 1) % 4)}
                className="px-1! py-0! h-5"
              >
                <Minus size={13} />
              </WinButton>
              <span
                className={`${bevel} flex h-5 w-5 items-center justify-center bg-[#c7c7c7] text-black`}
              >
                <Square size={12} />
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
            className={`relative min-h-0 flex-1 overflow-x-hidden ${active === 0 ? "overflow-hidden bg-transparent" : "overflow-y-auto overscroll-contain bg-[#f4f3ef]"}`}
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
                    className={`${bevel} bg-[#c7c7c7] px-4 py-3 text-sm font-bold`}
                  >
                    {lang === "pt" ? "Enviar e-mail" : "Send email"}
                  </a>
                  <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${bevel} bg-[#c7c7c7] px-4 py-3 text-sm`}
                  >
                    LinkedIn
                  </a>
                  <a
                    href={profile.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${bevel} bg-[#c7c7c7] px-4 py-3 text-sm`}
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
            className={`flex h-9 shrink-0 items-center justify-between gap-2 pt-1 text-xs ${active === 0 ? "mt-4 border-t border-white/20 text-[#c8dbff]" : "text-[#555563]"}`}
          >
            <span
              className={`${active === 0 ? "" : pressed} flex h-full flex-1 items-center px-2`}
            >
              {active === 0 ? t.scroll : t.nav[active]}
            </span>
            <div
              className={`${active === 0 ? "" : pressed} flex h-full items-center gap-3 px-2`}
            >
              <button
                aria-label="Previous"
                disabled={active === 0}
                onClick={() => change(active - 1)}
                className="disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              <span>0{active + 1} / 04</span>
              <button
                aria-label="Next"
                disabled={active === 3}
                onClick={() => change(active + 1)}
                className="disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </footer>
        </section>
      </div>
      {start && (
        <div
          className={`${bevel} absolute bottom-14 left-2 z-50 flex bg-[#c7c7c7] p-1`}
        >
          <div className="flex w-8 items-end bg-[#000080] px-1 py-3 text-white [writing-mode:vertical-rl]">
            Windows 98
          </div>
          <div>
            {t.nav.map((n, i) => {
              const Icon = icons[i];
              return (
                <button
                  key={n}
                  onClick={() => change(i)}
                  className="flex w-52 items-center gap-4 px-5 py-4 text-sm hover:bg-[#000080] hover:text-white"
                >
                  <Icon size={22} />
                  {n}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {player && (
        <aside
          className={`${bevel} absolute right-3 bottom-15 z-50 w-[min(360px,calc(100vw-24px))] bg-[#c7c7c7] p-1`}
          aria-label={t.music}
        >
          <div className="flex items-center justify-between bg-[#000080] px-2 py-1 text-sm text-white">
            <span className="flex items-center gap-2">
              <Music size={15} />
              {t.music}
            </span>
            <WinButton
              label={lang === "pt" ? "Fechar player" : "Close player"}
              onClick={() => setPlayer(false)}
              className="px-1! py-0!"
            >
              <X size={13} />
            </WinButton>
          </div>
          <div className={`${pressed} m-3 bg-[#172b29] p-4 text-[#96e6b1]`}>
            <p className="text-xs">
              {playing ? t.playing : t.paused} · CHIPTUNE
            </p>
            <p className="mt-2 text-base">{track ? t.track2 : t.track}</p>
            <div className="mt-3 flex h-5 items-end gap-1" aria-hidden>
              {[8, 16, 11, 20, 6, 14, 18, 10, 20, 13, 8, 19, 11, 15, 6, 18].map(
                (h, i) => (
                  <span
                    key={i}
                    className={`w-2 bg-[#96e6b1] ${["h-2", "h-4", "h-3", "h-5"][i % 4]} ${playing ? "animate-pulse motion-reduce:animate-none" : ""}`}
                  />
                ),
              )}
            </div>
          </div>
          <div className="px-3">
            <input
              aria-label={
                lang === "pt" ? "Posição da música" : "Track position"
              }
              type="range"
              min="0"
              max="48"
              step=".1"
              value={progress}
              onChange={(e) => {
                setProgress(+e.target.value);
                if (audio.current) audio.current.currentTime = +e.target.value;
              }}
              className="w-full accent-[#000080]"
            />
            <div className="flex justify-between text-xs">
              <span>0:{String(Math.floor(progress)).padStart(2, "0")}</span>
              <span>0:48</span>
            </div>
            <div className="my-3 flex items-center gap-2">
              <WinButton label="Previous track" onClick={() => nextTrack(-1)}>
                <SkipBack size={17} />
              </WinButton>
              <WinButton
                label={playing ? "Pause" : "Play"}
                onClick={() => {
                  if (playing) {
                    audio.current?.pause();
                    setPlaying(false);
                  } else play();
                }}
              >
                {playing ? <Pause size={17} /> : <Play size={17} />}
              </WinButton>
              <WinButton label="Next track" onClick={() => nextTrack(1)}>
                <SkipForward size={17} />
              </WinButton>
              <Volume2 size={18} />
              <input
                aria-label="Volume"
                className="min-w-0 flex-1 accent-[#000080]"
                type="range"
                min="0"
                max="1"
                step=".01"
                value={volume}
                onChange={(e) => {
                  setVolume(+e.target.value);
                  if (audio.current) audio.current.volume = +e.target.value;
                }}
              />
            </div>
          </div>
        </aside>
      )}
      <audio
        ref={audio}
        onTimeUpdate={() => setProgress(audio.current?.currentTime || 0)}
        onEnded={() => {
          const n = (track + 1) % 2;
          const el = audio.current;
          if (el) {
            el.src =
              bufferUrls.current[n] || (bufferUrls.current[n] = makeTrack(n));
            setTrack(n);
            el.play().catch(() => setPlaying(false));
          }
        }}
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
      />
      <div className="relative z-40 flex h-13 shrink-0 items-center gap-2 border-t-2 border-white bg-[#c7c7c7] px-2 py-1.5">
        <WinButton
          onClick={() => setStart(!start)}
          className={`flex items-center gap-2 px-2! font-bold ${start ? pressed : ""}`}
        >
          <span className="grid grid-cols-2 gap-px -skew-y-8">
            <i className="h-2 w-2 bg-red-600" />
            <i className="h-2 w-2 bg-green-600" />
            <i className="h-2 w-2 bg-blue-700" />
            <i className="h-2 w-2 bg-yellow-400" />
          </span>
          <span className="hidden sm:inline">{t.start}</span>
        </WinButton>
        <div className="mx-1 h-8 border-r border-white border-l-[#888] border-l" />
        <nav
          aria-label="Taskbar"
          className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {t.nav.map((n, i) => {
            const Icon = icons[i];
            return (
              <a
                href={`${lang === "en" ? "/en" : "/"}${i === 0 ? "" : `?section=${sectionNames[i]}`}`}
                key={i}
                data-task={i}
                aria-label={n}
                aria-current={active === i && !activeImage ? "page" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  change(i);
                }}
                className={`${active === i && !activeImage ? pressed : bevel} flex h-9 min-w-9 shrink-0 flex-1 items-center justify-center gap-2 px-2 text-sm sm:max-w-44 sm:justify-start ${active === i && !activeImage ? "bg-[#e2e2dc] font-bold" : "bg-[#c7c7c7]"}`}
              >
                <Icon size={17} className="shrink-0" />
                <span className="hidden truncate md:block">{n}</span>
              </a>
            );
          })}
          {imageWindows.map((window) => (
            <button
              key={window.id}
              data-image-task={window.id}
              aria-label={window.title}
              aria-pressed={activeImage === window.id}
              onClick={() => dispatchWindow({ type: "toggle", id: window.id })}
              className={`${activeImage === window.id ? pressed : bevel} flex h-9 min-w-24 shrink-0 flex-1 items-center gap-2 px-2 text-xs sm:max-w-48 ${activeImage === window.id ? "bg-[#e2e2dc] font-bold" : "bg-[#c7c7c7]"}`}
            >
              {window.projectIndex !== undefined ? (
                <Folder size={16} fill="#f6d279" className="shrink-0" />
              ) : (
                <Monitor size={16} className="shrink-0" />
              )}
              <span className="truncate">{window.title}</span>
            </button>
          ))}
        </nav>
        <button
          aria-label={t.music}
          aria-expanded={player}
          onClick={() => setPlayer(!player)}
          className={`${player ? pressed : bevel} relative p-2`}
        >
          <Music size={19} />
          {playing && (
            <span className="absolute top-1 right-1 h-1.5 w-1.5 bg-green-700" />
          )}
        </button>
        <span className={`${pressed} hidden px-3 py-2 text-sm lg:block`}>
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
