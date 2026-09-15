"use client";
import {
  Code2,
  Database,
  Heart,
  Paintbrush,
  Atom,
  Minus,
  Square,
  X,
  ChevronRight,
  Star,
  FileText,
  Files,
  Search,
  GitBranch,
  Blocks,
  Settings,
} from "lucide-react";
import type { RefObject } from "react";
import { copy } from "./content";

const bevel =
  "border-2 border-t-[#747474] border-l-[#747474] border-r-black border-b-black shadow-[1px_1px_0_#101010]";
const pressed =
  "border-2 border-t-black border-l-black border-r-[#747474] border-b-[#747474]";

const orbitIcons = [
  {
    Icon: Code2,
    label: "code",
    position: "top-[8%] left-[8%]",
    color: "text-[#b5ceff]",
  },
  {
    Icon: Atom,
    label: "React",
    position: "top-[2%] right-[17%]",
    color: "text-[#a7dcff]",
  },
  {
    Icon: Paintbrush,
    label: "design",
    position: "top-[30%] right-[1%]",
    color: "text-[#ffda85]",
  },
  {
    Icon: Database,
    label: "data",
    position: "bottom-[20%] left-[1%]",
    color: "text-[#b5ceff]",
  },
  {
    Icon: Heart,
    label: "create",
    position: "bottom-[6%] right-[17%]",
    color: "text-[#a1c5ff]",
  },
];

export function HomeSpace({
  lang,
  scrollRef,
  onProjects,
}: {
  lang: "pt" | "en";
  scrollRef: RefObject<HTMLDivElement | null>;
  onProjects: () => void;
}) {
  const t = copy[lang];
  const fileName = lang === "pt" ? "olá_mundo.txt" : "hello_world.txt";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="grid min-h-0 flex-1 gap-5 lg:grid-cols-[1fr_1.08fr]">
        <div className="flex min-h-0 flex-col gap-5">
          {/* Outer Window Container - matching Projetos, Sobre mim, and Contato */}
          <div
            className={`${bevel} flex min-h-0 flex-1 flex-col bg-[#161616] p-1`}
          >
            {/* Title Bar */}
            <div className="flex h-9 shrink-0 items-center justify-between bg-linear-to-r from-[#000080] to-[#2855a9] px-2 text-sm font-bold text-white">
              <span className="flex items-center gap-2 truncate pr-2">
                <FileText size={16} className="shrink-0 text-[#8be9fd]" />
                <span className="truncate">CodeStudio.exe</span>
              </span>
              <div className="flex gap-1 shrink-0">
                {[Minus, Square].map((Icon, i) => (
                  <span
                    key={i}
                    aria-hidden
                    className={`${bevel} flex size-6 items-center justify-center bg-[#161616] text-white opacity-65 cursor-not-allowed`}
                  >
                    <Icon size={14} />
                  </span>
                ))}
                <span
                  aria-hidden
                  className="border-2 border-t-[#ff7fff] border-l-[#ff7fff] border-r-[#5f036a] border-b-[#5f036a] shadow-[1px_1px_0_#101010] flex size-6 items-center justify-center bg-[#eb0083] text-white opacity-65 cursor-not-allowed"
                >
                  <X size={14} />
                </span>
              </div>
            </div>

            {/* Inset Retro Frame with Dracula Theme */}
            <div
              className={`${pressed} flex min-h-0 flex-1 flex-col bg-[#282a36] overflow-hidden`}
            >
              {/* Dracula Tabs Bar & Breadcrumbs */}
              <div className="text-white hidden sm:flex h-9 shrink-0 items-center gap-5 border-b border-[#999] px-3 text-xs">
                {(lang === "pt"
                  ? [
                      "Arquivo",
                      "Editar",
                      "Seleção",
                      "Exibir",
                      "Ir",
                      "Executar",
                      "Terminal",
                      "Ajuda",
                    ]
                  : [
                      "File",
                      "Edit",
                      "Selection",
                      "View",
                      "Go",
                      "Run",
                      "Terminal",
                      "Help",
                    ]
                ).map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
              <div className="flex h-8 shrink-0 items-center border-b border-[#191a21] bg-[#1e1f29] text-xs select-none">
                <div className="flex h-full items-center gap-2 border-r border-[#191a21] bg-[#282a36] px-3 font-mono text-white border-t-2 border-t-[#bd93f9]">
                  <FileText size={13} className="text-[#8be9fd]" />
                  <span className="text-[#f8f8f2] font-semibold">
                    {fileName}
                  </span>
                  <span className="ml-1 text-[#6272a4] hover:text-[#ff79c6] text-[10px] cursor-pointer">
                    ✕
                  </span>
                </div>
              </div>

              {/* Activity Bar + Editor Viewport */}
              <div className="flex min-h-0 flex-1">
                {/* Dracula Activity Bar */}
                <aside
                  aria-label="Activity Bar"
                  className="hidden sm:flex w-10 shrink-0 flex-col items-center justify-between border-r border-[#191a21] bg-[#1e1f29] py-3 text-[#6272a4] select-none"
                >
                  <div className="flex flex-col items-center gap-4">
                    <div
                      title="Explorer"
                      className="relative text-[#bd93f9] border-l-2 border-[#bd93f9] pl-1 w-full flex justify-center"
                    >
                      <Files size={18} />
                    </div>
                    <div
                      title="Search"
                      className="opacity-70 hover:opacity-100 hover:text-[#8be9fd] transition-opacity"
                    >
                      <Search size={18} />
                    </div>
                    <div
                      title="Source Control"
                      className="opacity-70 hover:opacity-100 hover:text-[#50fa7b] transition-opacity"
                    >
                      <GitBranch size={18} />
                    </div>
                    <div
                      title="Extensions"
                      className="opacity-70 hover:opacity-100 hover:text-[#ffb86c] transition-opacity"
                    >
                      <Blocks size={18} />
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div
                      title="Settings"
                      className="opacity-70 hover:opacity-100 hover:text-[#ff79c6] transition-opacity"
                    >
                      <Settings size={17} />
                    </div>
                  </div>
                </aside>

                {/* Editor Content Area (scrollable, attached to scrollRef) */}
                <div className="flex flex-col min-h-0 flex-1">
                  <div className="px-4 py-2 flex items-center gap-1.5 px-3 text-[#6272a4] text-[11px] font-mono truncate">
                    <span>joana-souto</span>
                    <span>&gt;</span>
                    <span>src</span>
                    <span>&gt;</span>
                    <span className="text-[#f1fa8c]">{fileName}</span>
                  </div>
                  <div
                    ref={scrollRef}
                    className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#282a36] text-[#f8f8f2] flex"
                  >
                    {/* Line numbers gutter */}
                    <div
                      aria-hidden
                      className="flex select-none flex-col py-6 sm:py-8 pl-2 pr-3 text-right font-mono text-xs text-[#6272a4] border-r border-[#44475a]/50 bg-[#21222c]/40 shrink-0 w-11 leading-loose"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(
                        (n) => (
                          <span key={n} className="opacity-70">
                            {String(n).padStart(2, "0")}
                          </span>
                        ),
                      )}
                    </div>

                    {/* Main text content in Dracula colors */}
                    <div className="min-w-0 flex-1 px-5 py-6 sm:px-8 sm:py-8">
                      <p className="font-mono text-xs text-[#6272a4] mb-2 select-none">
                        // {fileName}
                      </p>
                      <p className="font-mono text-sm sm:text-base text-[#8be9fd] font-medium">
                        {lang === "pt" ? "Olá, eu sou" : "Hi, I am"}
                      </p>
                      <h1 className="mt-1 text-3xl sm:text-5xl lg:text-6xl leading-[1.05] font-black tracking-[-.04em] text-[#FF79C6] [text-shadow:2px_2px_0_#191a21]">
                        Joana Souto
                        <span className="ml-1 text-white font-black inline-block animate-blink select-none">
                          |
                        </span>
                      </h1>
                      <p className="text-xs leading-relaxed text-[#BD93F9] font-mono">
                        <span className="text-white font-bold">&gt;</span>{" "}
                        {t.role}
                      </p>
                      <p className="mt-4 max-w-lg leading-relaxed text-sm text-[#f8f8f2]/90">
                        {t.intro}
                      </p>
                      <a
                        href={`${lang === "en" ? "/en" : "/"}?section=projects`}
                        onClick={(event) => {
                          event.preventDefault();
                          onProjects();
                        }}
                        className={`mt-6 inline-flex items-center gap-3 ${bevel} bg-[#bd93f9] hover:bg-[#ff79c6] px-5 py-3 text-sm font-bold text-[#282a36] hover:text-[#282a36] focus-visible:outline-2 focus-visible:outline-dotted active:translate-y-px cursor-pointer transition-colors`}
                      >
                        <span>{t.cta}</span>
                        <ChevronRight size={17} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dracula Status Bar */}
              <div className="flex h-6 shrink-0 items-center justify-between border-t border-[#191a21] bg-[#21222c] px-2.5 text-[11px] font-mono text-[#6272a4] select-none">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <GitBranch size={12} className="text-[#50fa7b]" />
                    <span className="text-[#f8f8f2]">main*</span>
                  </span>
                  <span className="hidden sm:inline text-[#8be9fd]">
                    0 ⨂ 0 ⚠
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[#f8f8f2]/80">
                  <span>Ln 1, Col 1</span>
                  <span className="hidden sm:inline text-[#6272a4]">
                    Spaces: 2
                  </span>
                  <span className="text-[#6272a4]">UTF-8</span>
                  <span className="text-[#bd93f9] font-bold">TXT</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Desktop Illustration */}
        <div className="relative hidden min-h-0 lg:block">
          <div
            aria-hidden
            className="absolute inset-x-[5%] inset-y-[5%] rotate-[-15deg] rounded-[50%] border border-dashed border-[#a8caff]/30"
          />
          <img
            data-float
            src="/hero.webp"
            alt={
              lang === "pt"
                ? "Garota flutuando com seu notebook"
                : "Girl floating with her laptop"
            }
            className="absolute inset-0 h-auto w-full self-center pointer-events-none"
          />
          {orbitIcons.map(({ Icon, label, position, color }) => (
            <div
              data-float
              key={label}
              className={`absolute ${position} ${color} flex size-16 flex-col items-center justify-center gap-1 rounded-full border-2 border-[#c7ddff] bg-[#93b5ff]/25 shadow-[inset_2px_2px_0_#e4edff88,0_0_18px_#b6ceff80] xl:size-20`}
            >
              <Icon size={30} strokeWidth={1.8} />
              <span className="text-[10px]">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
