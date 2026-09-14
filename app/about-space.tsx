import { copy } from "./content";
import { education, toolGroups, questions, profile } from "./profile-data";
export function AboutSpace({ lang }: { lang: "pt" | "en" }) {
  const t = copy[lang];
  return (
    <div className="p-6 sm:p-10">
      <span className="text-xs text-[#586c9b]">JOANA_SOUTO / README.txt</span>
      <h1 className="mt-3 max-w-3xl text-3xl font-black leading-tight text-[#172453] sm:text-4xl">
        {t.about}
      </h1>
      <p className="mt-5 max-w-3xl text-base leading-relaxed text-[#586074]">
        {t.bio}
      </p>
      <p className="mt-4 text-sm text-[#586074]">
        {lang === "pt"
          ? "Base em Garanhuns, Pernambuco, Brasil."
          : "Based in Garanhuns, Pernambuco, Brazil."}
      </p>

      <section className="mt-8 max-w-4xl">
        <h2 className="text-xl font-bold">
          {lang === "pt" ? "Sobre meu trabalho" : "About my work"}
        </h2>
        <div className="mt-4 space-y-3">
          {questions[lang].map(([question, answer]) => (
            <details
              key={question}
              className="border border-[#b6bbc8] bg-[#e9e9e3] p-4"
            >
              <summary className="cursor-pointer text-sm font-bold">
                {question}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-[#586074]">
                {answer}
              </p>
            </details>
          ))}
        </div>
        <a
          href={profile.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-block text-sm text-[#254b97] underline"
        >
          {lang === "pt"
            ? "Veja minha trajetória no LinkedIn"
            : "Explore my background on LinkedIn"}
        </a>
      </section>
    </div>
  );
}
