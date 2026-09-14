# Joana Souto — Portfólio

Portfólio interativo com estética retro pixel-art inspirada em sistemas operacionais clássicos (Windows 98), desenvolvido com **Next.js 16 (App Router)**, **React 19** e **Tailwind CSS 4**.

---

## 💻 Recursos e Tecnologias

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Biblioteca de UI:** [React](https://react.dev/)
- **Estilização:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Ícones:** [Lucide React](https://lucide.dev/)
- **Áudio:** Sintetizador Chiptune local em tempo real utilizando a Web Audio API (sem dependências externas)
- **Animações:** Web Animations API com suporte nativo a `prefers-reduced-motion`
- **Internacionalização:** Suporte bilíngue (Português / Inglês)
- **SEO & Performance:** Metadados estruturados JSON-LD, Open Graph, Sitemap e Robots configurados

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- **Node.js**: versão 20 ou superior
- **pnpm**: versão 9 ou superior (ou npm / yarn)

### Passo a passo

1. Instale as dependências:
   ```bash
   pnpm install
   ```

2. Inicie o servidor de desenvolvimento:
   ```bash
   pnpm dev
   ```

3. Abra no navegador:
   ```
   http://localhost:3000
   ```

---

## 📦 Build e Produção

Para gerar e testar a versão otimizada de produção:

```bash
pnpm build
pnpm start
```

---

## 🛠️ Estrutura do Projeto

```text
├── app/
│   ├── about-space.tsx        # Seção Sobre Mim (experiência, formação e skills)
│   ├── content.ts             # Textos em Português e Inglês
│   ├── desktop.tsx            # Ambiente principal (janelas, barra de tarefas e player)
│   ├── home-space.tsx         # Seção inicial / Apresentação
│   ├── image-window.tsx       # Visualizador de imagens em janela flutuante
│   ├── layout.tsx             # Layout raiz da aplicação
│   ├── profile-data.ts        # Dados profissionais, contatos e links
│   ├── project-explorer.tsx   # Explorador de projetos e detalhes
│   ├── projects.ts            # Lista de projetos, imagens e ferramentas
│   ├── seo.ts                 # Configurações de SEO e Schema.org
│   └── window-state.ts        # Gerenciamento de estado das janelas
├── components/
│   └── ui/                    # Componentes de interface reutilizáveis
└── public/                    # Imagens, ilustrações e assets estáticos
```

---

## 🎨 Personalização

- **Dados e Contatos:** Edite `app/profile-data.ts` para atualizar nome, e-mail, LinkedIn, GitHub e domínio do site.
- **Projetos:** Atualize `app/projects.ts` adicionando seus projetos reais, links e capturas de tela em `public/`.
- **Textos e Traduções:** Altere as cópias em PT/EN diretamente em `app/content.ts`.

---

Desenvolvido por **Joana Souto** · Garanhuns, PE, Brasil.
