"use client";
import {
  Code2,
  Database,
  Heart,
  Paintbrush,
  Atom,
  Monitor,
  Minus,
  Square,
  ChevronRight,
  Star,
} from "lucide-react";
import type { RefObject } from "react";
import { copy } from "./content";
const bevel =
  "border-2 border-t-white border-l-white border-r-[#474747] border-b-[#474747] shadow-[4px_5px_0_#10235266]";
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
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="grid min-h-0 flex-1 gap-5 lg:grid-cols-[1fr_1.08fr]">
        <div className="flex min-h-0 flex-col gap-5">
          <div
            className={`${bevel} flex min-h-0 flex-1 flex-col bg-[#c7c7c7] p-1`}
          >
            <div className="flex h-9 shrink-0 items-center justify-between bg-linear-to-r from-[#000080] to-[#2855a9] px-2 text-sm font-bold text-white">
              <span className="flex items-center gap-2">
                <Monitor size={19} />
                {lang === "pt" ? "Olá_mundo.exe" : "Hello_world.exe"}
              </span>
              <div className="flex gap-1">
                {[Minus, Square].map((Icon, i) => (
                  <span
                    key={i}
                    aria-hidden
                    className="flex h-5 w-5 items-center justify-center border-2 border-t-white border-l-white border-r-[#444] border-b-[#444] bg-[#c7c7c7] text-black"
                  >
                    <Icon size={12} />
                  </span>
                ))}
              </div>
            </div>

            <div
              ref={scrollRef}
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-7 sm:px-9 xl:px-12 xl:py-9"
            >
              <div className="relative mx-auto mb-4 h-40 w-48 lg:hidden">
                <img
                  data-float
                  src="/hero.webp"
                  alt=""
                  className="h-full w-full object-contain [image-rendering:pixelated]"
                />
                <Code2
                  data-float
                  className="absolute top-4 right-0 text-[#3157b0]"
                />
                <Heart
                  data-float
                  className="absolute bottom-5 left-0 text-[#3157b0]"
                />
              </div>
              <p className="text-lg sm:text-xl">
                {lang === "pt" ? "Olá, eu sou" : "Hi, I am"}
              </p>
              <h1 className="uppercase text-6xl leading-[1.02] font-black tracking-[-.045em] text-[#152453] [text-shadow:2px_3px_0_#ffffff]">
                Joana Souto
                <span className="ml-2 inline-block h-1 w-6 bg-[#3157b0] shadow-[2px_3px_0_#eee] animate-pulse" />
              </h1>
              <p className="text-xs leading-relaxed sm:text-base">{t.role}</p>
              <p className="mt-5 max-w-lg leading-relaxed sm:text-base">
                {t.intro}
              </p>
              <a
                href={`${lang === "en" ? "/en" : "/"}?section=projects`}
                onClick={(event) => {
                  event.preventDefault();
                  onProjects();
                }}
                className="mt-4 flex items-center gap-4 border-2 border-t-white border-l-white border-r-[#444] border-b-[#444] bg-[#d6d6d0] px-5 py-3 text-sm font-bold focus-visible:outline-2 focus-visible:outline-dotted active:translate-y-px"
              >
                {t.cta}
                <ChevronRight size={17} />
              </a>
            </div>
          </div>
        </div>
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
            className="absolute inset-0 h-full w-full object-contain px-[8%] pb-5 [image-rendering:pixelated] drop-shadow-[0_14px_30px_#0d20555c]"
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
