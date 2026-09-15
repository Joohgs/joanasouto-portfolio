"use client";
import { useEffect, useState } from "react";
import { ProjectDetails } from "../project-explorer";
import { ImageWindow } from "../image-window";
import { projects } from "../projects";
const bevel =
  "border-2 border-t-[#747474] border-l-[#747474] border-r-black border-b-black shadow-[1px_1px_0_#101010]";
const pressed =
  "border-2 border-t-black border-l-black border-r-[#747474] border-b-[#747474]";
export default function ProjectPresentation() {
  const [index, setIndex] = useState(0),
    [lang, setLang] = useState<"pt" | "en">("pt"),
    [open, setOpen] = useState(false),
    [minimized, setMinimized] = useState(false);
  useEffect(() => {
    const query = new URLSearchParams(location.search),
      value = Number(query.get("project"));
    setIndex(
      Number.isInteger(value) && value >= 0 && value < projects.length
        ? value
        : 0,
    );
    setLang(query.get("lang") === "en" ? "en" : "pt");
  }, []);
  const project = projects[index];
  return (
    <main className="fixed inset-0 flex flex-col overflow-hidden bg-[#224493] p-3 text-[#182047] sm:p-6">
      <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col border-2 border-t-white border-l-white border-r-[#444] border-b-[#444] bg-[#c7c7c7] p-1">
        <header className="bg-[#000080] px-3 py-2 text-sm font-bold text-white">
          {project.name}.exe
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto bg-[#f4f3ef]">
          <ProjectDetails
            standalone
            index={index}
            lang={lang}
            onImage={() => {
              setOpen(true);
              setMinimized(false);
            }}
          />
        </div>
      </div>
      {open && (
        <>
          <button
            data-image-task="preview"
            onClick={() => setMinimized((value) => !value)}
            aria-pressed={!minimized}
            className={`mx-auto mt-3 w-full max-w-5xl ${!minimized ? pressed : `${bevel} hover:bg-[#242424]`} bg-[#161616] px-3 py-2 text-left text-sm text-white active:translate-y-px`}
          >
            {project.name}.png
          </button>
          <ImageWindow
            window={{
              id: "preview",
              title: `${project.name}.png`,
              src: project.image,
              alt: project.alt[lang],
              order: 1,
              minimized,
            }}
            lang={lang}
            rank={0}
            active
            onClose={() => setOpen(false)}
            onMinimize={() => setMinimized(true)}
            onActivate={() => {}}
          />
        </>
      )}
    </main>
  );
}
