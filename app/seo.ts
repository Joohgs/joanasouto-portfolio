import type { Metadata } from "next";
import { profile, sectionNames } from "./profile-data";
export const sectionTitles = {
  pt: [
    "Joana Souto | Front-end, design e ilustração digital",
    "Projetos e estudos visuais | Joana Souto",
    "Sobre Joana Souto | Front-end, design e formação",
    "Contato | Joana Souto — Front-end e ilustração",
  ],
  en: [
    "Joana Souto | Front-end, design and digital illustration",
    "Projects and visual studies | Joana Souto",
    "About Joana Souto | Front-end, design and education",
    "Contact | Joana Souto — Front-end and illustration",
  ],
};
const descriptions = {
  pt: [
    "Joana Souto: desenvolvedora front-end, designer e ilustradora digital em Garanhuns, PE. Interfaces responsivas, identidades visuais, ícones e avatares.",
    "Conheça os estudos visuais do portfólio de Joana Souto e encontre seu GitHub. Conceitos de interfaces web, design e ilustração digital.",
    "Conheça a trajetória de Joana Souto, freelancer em front-end e design desde 2018, com formação em Enfermagem, Saúde Pública e estudos em cibersegurança.",
    "Converse com Joana Souto sobre desenvolvimento front-end, design de interfaces, identidade visual e ilustrações digitais. Contato por e-mail e LinkedIn.",
  ],
  en: [
    "Joana Souto is a front-end developer, designer and digital illustrator in Garanhuns, Brazil. Responsive interfaces, visual identities, icons and avatars.",
    "Explore visual studies in Joana Souto’s portfolio and find her GitHub. Concepts for web interfaces, design and digital illustration.",
    "Discover Joana Souto’s background: freelance front-end and design since 2018, Nursing and Public Health education, and ongoing cybersecurity studies.",
    "Contact Joana Souto about front-end development, interface design, visual identity and digital illustration by email or LinkedIn.",
  ],
};
export function sectionIndex(section: unknown) {
  return typeof section === "string"
    ? Math.max(0, sectionNames.indexOf(section))
    : 0;
}
export function pageMetadata(lang: "pt" | "en", section: number): Metadata {
  const suffix = section === 0 ? "" : `?section=${sectionNames[section]}`,
    path = `${lang === "en" ? "/en" : "/"}${suffix}`;
  return {
    metadataBase: new URL(profile.url),
    title: sectionTitles[lang][section],
    description: descriptions[lang][section],
    icons: { icon: "/favicon.ico" },
    alternates: {
      canonical: path,
      languages: {
        "pt-BR": `/${suffix}`,
        en: `/en${suffix}`,
        "x-default": `/${suffix}`,
      },
    },
    openGraph: {
      type: "website",
      url: path,
      title: sectionTitles[lang][section],
      description: descriptions[lang][section],
      locale: lang === "pt" ? "pt_BR" : "en_US",
      alternateLocale: lang === "pt" ? "en_US" : "pt_BR",
      siteName: "Joana Souto",
    },
    twitter: {
      card: "summary",
      title: sectionTitles[lang][section],
      description: descriptions[lang][section],
    },
    robots: { index: true, follow: true },
  };
}
export function profileSchema(lang: "pt" | "en", section: number) {
  const path = `${lang === "en" ? "/en" : "/"}${section === 0 ? "" : `?section=${sectionNames[section]}`}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": section === 0 || section === 2 ? "ProfilePage" : "WebPage",
        "@id": `${profile.url}${path}#page`,
        url: `${profile.url}${path}`,
        name: sectionTitles[lang][section],
        inLanguage: lang === "pt" ? "pt-BR" : "en",
        mainEntity: { "@id": `${profile.url}/#joana-souto` },
      },
      {
        "@type": "Person",
        "@id": `${profile.url}/#joana-souto`,
        name: profile.name,
        url: profile.url,
        jobTitle:
          lang === "pt"
            ? "Desenvolvedora front-end, designer e ilustradora digital"
            : "Front-end developer, designer and digital illustrator",
        sameAs: [profile.linkedin, profile.github],
        ...(section === 2 || section === 3
          ? {
              ...(section === 3 ? { email: profile.email } : {}),
              address: {
                "@type": "PostalAddress",
                addressLocality: "Garanhuns",
                addressRegion: "Pernambuco",
                addressCountry: "BR",
              },
            }
          : {}),
      },
    ],
  };
}
