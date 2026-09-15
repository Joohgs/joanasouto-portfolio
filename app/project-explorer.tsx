"use client";
import { useState } from "react";
import {
  Folder,
  ChevronRight,
  ImageIcon,
  ExternalLink,
  Code2,
  FileText,
} from "lucide-react";
import { projects } from "./projects";
import { profile } from "./profile-data";
const bevel =
  "border-2 border-t-[#747474] border-l-[#747474] border-r-black border-b-black shadow-[1px_1px_0_#101010]";
export function ProjectDetails({
  index,
  lang,
  onImage,
  standalone = false,
}: {
  standalone?: boolean;
  index: number;
  lang: "pt" | "en";
  onImage: (index: number) => void;
}) {
  const project = projects[index];
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-3 border-b border-[#aaaeb8] bg-[#e2e2dc] px-5 py-3">
        <Folder size={30} fill="#f6d279" className="shrink-0" />
        <div>
          <h2 className="text-xl font-bold text-[#142453]">{project.name}</h2>
          <p className="mt-1 text-xs text-[#6a6d7a]">
            {lang === "pt"
              ? "Pasta de projeto · conceito de exemplo"
              : "Project folder · example concept"}
          </p>
        </div>
      </div>
      <div className="p-5 sm:p-7">
        <button
          onClick={() => onImage(index)}
          aria-label={
            lang === "pt"
              ? `Ampliar imagem de ${project.name}`
              : `Enlarge ${project.name} image`
          }
          className="group relative block w-full border-2 border-t-[#737782] border-l-[#737782] border-r-white border-b-white bg-[#d9d9d3] p-1 focus-visible:outline-2 focus-visible:outline-[#000080]"
        >
          <img
            src={project.image}
            alt={project.alt[lang]}
            className="max-h-64 w-full object-cover [image-rendering:pixelated]"
          />
          <span className="absolute right-3 bottom-3 flex items-center gap-2 border border-white/50 bg-[#000080]/90 px-3 py-2 text-xs text-white">
            <ImageIcon size={15} />
            {lang === "pt" ? "Ampliar imagem" : "Enlarge image"}
          </span>
        </button>
        <div className="mt-6 flex items-center gap-2 border-b border-[#c3c4cc] pb-2">
          <FileText size={17} />
          <h3 className="text-sm font-bold">
            {lang === "pt" ? "Descrição" : "Description"}
          </h3>
        </div>
        <p className="mt-3 text-base leading-relaxed text-[#555d72]">
          {project.description[lang]}
        </p>
        <ul className="mt-5 space-y-2 text-sm leading-relaxed text-[#555d72]">
          {project.highlights[lang].map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-[#3158aa]">▸</span>
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex items-center gap-2 border-b border-[#c3c4cc] pb-2">
          <Code2 size={17} />
          <h3 className="text-sm font-bold">
            {lang === "pt" ? "Ferramentas utilizadas" : "Tools used"}
          </h3>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {project.tools.map((tool) => (
            <span
              key={tool}
              className="border border-[#a6aab5] bg-[#e7e7e1] px-3 py-1.5 text-xs"
            >
              {tool}
            </span>
          ))}
        </div>
        {(project.url || !standalone) && (
          <a
            href={project.url || `/project?project=${index}&lang=${lang}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`${bevel} mt-7 inline-flex items-center gap-3 bg-[#161616] hover:bg-[#242424] px-4 py-3 text-sm font-bold text-white focus-visible:outline-2 focus-visible:outline-[#000080] active:translate-y-px`}
          >
            {project.url
              ? lang === "pt"
                ? "Visualizar projeto"
                : "View project"
              : lang === "pt"
                ? "Ver apresentação em nova aba"
                : "Open presentation in new tab"}
            <ExternalLink size={16} />
          </a>
        )}
        <p className="mt-4 text-xs leading-relaxed text-[#777b8a]">
          {lang === "pt"
            ? "Projeto e imagem conceituais. Substitua pelos dados e endereço do projeto real."
            : "Conceptual project and artwork. Replace with your real project details and URL."}
        </p>
      </div>
    </div>
  );
}
export function ProjectExplorer({
  lang,
  onImage,
  onProject,
}: {
  lang: "pt" | "en";
  onImage: (index: number) => void;
  onProject: (index: number) => void;
}) {
  const [selected, setSelected] = useState(0);
  return (
    <div className="flex min-h-full flex-col">
      <div className="flex shrink-0 items-center gap-2 border-b border-[#b2b3bb] bg-[#deded8] px-4 py-2 text-xs">
        <Folder size={15} fill="#f6d279" />
        <span>C:\Joana\Projects\{projects[selected].name}</span>
      </div>
      <div className="grid flex-1 xl:grid-cols-[minmax(220px,30%)_1fr]">
        <nav
          aria-label={lang === "pt" ? "Pastas de projetos" : "Project folders"}
          className="border-b-2 border-[#9599a7] bg-[#d1d1cb] p-3 xl:border-r-2 xl:border-b-0"
        >
          <p className="border-b border-[#a6a9b3] px-2 py-3 text-xs font-bold tracking-widest text-[#555d72]">
            {lang === "pt" ? "PROJETOS" : "PROJECTS"}
          </p>
          {projects.map((project, index) => (
            <button
              key={project.name}
              aria-pressed={selected === index}
              onClick={() => {
                setSelected(index);
                if (matchMedia("(max-width: 1279px)").matches) onProject(index);
              }}
              className={`flex w-full items-center gap-3 border-b border-[#b0b1b9] px-2 py-5 text-left focus-visible:outline-2 focus-visible:outline-dotted ${selected === index ? "bg-[#000080] text-white" : "text-[#152453] hover:bg-[#e2e2dc]"}`}
            >
              <Folder
                size={28}
                strokeWidth={1.3}
                fill="#f6d279"
                className={`shrink-0 ${selected === index ? "text-[#ffe59d]" : "text-[#544c32]"}`}
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold">{project.name}</span>
                <span
                  className={`mt-1 block text-xs leading-relaxed ${selected === index ? "text-[#d7e0ff]" : "text-[#606678]"}`}
                >
                  {
                    [
                      lang === "pt"
                        ? "Sites, apps e experiências digitais."
                        : "Sites, apps and digital experiences.",
                      lang === "pt"
                        ? "Design de interfaces para cuidados."
                        : "Interface design for care.",
                      lang === "pt"
                        ? "Pixels, criação e movimento."
                        : "Pixels, creativity and motion.",
                    ][index]
                  }
                </span>
              </span>
              <ChevronRight size={16} className="shrink-0" />
            </button>
          ))}
          <p className="hidden px-2 pt-5 text-xs text-[#606678] xl:block">
            {projects.length} {lang === "pt" ? "pastas" : "folders"}
          </p>
        </nav>
        <div className="hidden xl:block">
          <ProjectDetails index={selected} lang={lang} onImage={onImage} />
        </div>
      </div>
    </div>
  );
}
