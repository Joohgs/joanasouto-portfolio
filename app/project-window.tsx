"use client";
import { useCallback, useRef } from "react";
import { Folder, X, Minus, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { projects } from "./projects";
export function ProjectWindow({
  selected,
  minimized,
  lang,
  onClose,
  onMinimize,
  onSelect,
}: {
  selected: number | null;
  minimized: boolean;
  onMinimize: () => void;
  lang: "pt" | "en";
  onClose: () => void;
  onSelect: (n: number) => void;
}) {
  const returnFocus = useRef<HTMLElement | null>(null),
    windowRef = useRef<HTMLDivElement>(null);
  const project = selected === null ? null : projects[selected];
  // Animate transform only: Tailwind's separate translate keeps the window centered.
  const attachWindow = useCallback((node: HTMLDivElement | null) => {
    windowRef.current
      ?.getAnimations()
      .forEach((animation) => animation.cancel());
    windowRef.current = node;
    if (node && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      node.animate(
        [
          { opacity: 0, transform: "translate3d(0,28px,0) scale(.94)" },
          { opacity: 1, transform: "translate3d(0,0,0) scale(1)" },
        ],
        { duration: 300, easing: "cubic-bezier(.16,1,.3,1)" },
      );
    }
  }, []);
  return (
    <Dialog
      modal={false}
      open={selected !== null && !minimized}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        onOpenAutoFocus={() => {
          returnFocus.current = document.activeElement as HTMLElement;
        }}
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          returnFocus.current?.focus();
        }}
        onInteractOutside={(e) => e.preventDefault()}
        ref={attachWindow}
        showCloseButton={false}
        overlayClassName="bg-[#0a1d4a]/30"
        className="animate-none! transition-none! flex! max-h-[calc(100dvh-7rem)] w-[calc(100%-2rem)] max-w-5xl! flex-col gap-0 rounded-none border-2 border-t-white border-l-white border-r-[#424242] border-b-[#424242] bg-[#c7c7c7] p-1 shadow-[10px_12px_0_#071c4b55] sm:max-w-5xl"
      >
        {project && (
          <>
            <div className="flex h-9 shrink-0 items-center justify-between bg-linear-to-r from-[#000080] to-[#2e62b3] px-2 text-white">
              <DialogTitle className="flex items-center gap-2 text-sm">
                <Folder size={18} fill="#f9d576" />
                {project.name}.exe
              </DialogTitle>
              <div className="flex gap-1">
                <button
                  onClick={onMinimize}
                  aria-label={
                    lang === "pt" ? "Minimizar projeto" : "Minimize project"
                  }
                  className="flex size-6 items-center justify-center border-2 border-t-white border-l-white border-r-[#444] border-b-[#444] bg-[#c7c7c7] text-black"
                >
                  <Minus size={15} />
                </button>
                <DialogClose
                  aria-label={
                    lang === "pt" ? "Fechar projeto" : "Close project"
                  }
                  className="flex size-6 items-center justify-center border-2 border-t-white border-l-white border-r-[#444] border-b-[#444] bg-[#c7c7c7] text-black focus-visible:outline-2 focus-visible:outline-white"
                >
                  <X size={15} />
                </DialogClose>
              </div>
            </div>
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain bg-[#f3f2ec]">
              <div className="border-b border-[#b9bbc4] px-4 py-2 text-xs text-[#686a7c]">
                C:\Joana\Projects\{project.name} ·{" "}
                {lang === "pt" ? "Conceito de exemplo" : "Example concept"}
              </div>
              <div className="grid gap-7 p-5 md:grid-cols-[1.15fr_1fr] sm:p-7">
                <figure className="min-w-0">
                  <img
                    src={project.image}
                    alt={project.alt[lang]}
                    className="aspect-[3/2] w-full border-2 border-[#9a9ba6] object-cover [image-rendering:pixelated]"
                  />
                  <figcaption className="mt-2 text-xs leading-relaxed text-[#777989]">
                    {lang === "pt"
                      ? "Imagem conceitual ilustrativa; não é uma captura de um produto publicado."
                      : "Conceptual illustration; not a screenshot of a published product."}
                  </figcaption>
                  <div className="mt-4 flex items-center gap-3 border border-[#b8b9c4] bg-[#e4e4df] p-3">
                    <img
                      src={project.image}
                      alt=""
                      className="h-14 w-20 object-cover [image-rendering:pixelated]"
                    />
                    <span className="text-xs">
                      {lang === "pt"
                        ? "Detalhe da composição"
                        : "Composition detail"}
                    </span>
                  </div>
                </figure>
                <div>
                  <span className="text-xs tracking-wider text-[#4c68a4]">
                    PROJECT 0{selected! + 1}
                  </span>
                  <h2 className="mt-3 text-3xl font-black text-[#172453]">
                    {project.name}
                  </h2>
                  <DialogDescription className="mt-4 text-base leading-relaxed text-[#5d6174]">
                    {project.description[lang]}
                  </DialogDescription>
                  <h3 className="mt-6 text-sm font-bold">
                    {lang === "pt"
                      ? "O que este conceito explora"
                      : "What this concept explores"}
                  </h3>
                  <ul className="mt-3 space-y-3 text-sm leading-relaxed text-[#5d6174]">
                    {project.highlights[lang].map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="text-[#2855a9]">▸</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {project.tools.map((tool) => (
                      <span
                        key={tool}
                        className="border border-[#a4a7b2] bg-white/60 px-2 py-1 text-xs"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-center justify-between gap-3 pt-2 text-xs">
              <span className="px-2 text-[#5d6174]">
                {lang === "pt"
                  ? "Projetos de exemplo · dados editáveis"
                  : "Example projects · editable content"}
              </span>
              <div className="flex gap-2">
                <button
                  aria-label={
                    lang === "pt" ? "Projeto anterior" : "Previous project"
                  }
                  onClick={() => onSelect((selected! + 2) % 3)}
                  className="border border-[#777] p-1"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  aria-label={
                    lang === "pt" ? "Próximo projeto" : "Next project"
                  }
                  onClick={() => onSelect((selected! + 1) % 3)}
                  className="border border-[#777] p-1"
                >
                  <ChevronRight size={18} />
                </button>
                <DialogClose className="border-2 border-t-white border-l-white border-r-[#444] border-b-[#444] px-3 py-1">
                  {lang === "pt" ? "Fechar" : "Close"}
                </DialogClose>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
