# PassGuard

**PassGuard** is a privacy-first web app to **generate cryptographically strong passwords** and **analyze password strength**—entirely in the browser. No passwords are sent to a server.

![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat&logo=next.js&logo=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logo=white)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

- **Secure generator** — Uses the Web Crypto API (`crypto.getRandomValues`) with rejection sampling for index selection. Optional charset toggles, length 4–64, and ambiguous-character exclusion.
- **Strength analyzer** — Score out of 100, tiered levels, estimated crack time (illustrative brute-force model), validation hints, and an expandable methodology section.
- **Modern stack** — Next.js App Router, React 18, TypeScript, Tailwind CSS, Radix UI (progress), Lucide icons, Geist fonts.
- **UX & a11y** — Dark UI, responsive layout, skip link, `aria-live` regions for score updates, reduced-motion support, Spanish interface copy.
- **SEO** — Open Graph / Twitter metadata; set `NEXT_PUBLIC_SITE_URL` in production for absolute social preview URLs.

## Tech stack

| Layer        | Choice |
| ------------ | ------ |
| Framework    | [Next.js 16](https://nextjs.org) (Turbopack dev/build) |
| UI           | React 18, Tailwind CSS, `tailwind-merge`, `clsx` |
| Linting      | ESLint 9 + `eslint-config-next` (flat config) |
| Fonts        | Geist (`next/font/local`) |

## Getting started

**Requirements:** Node.js 20+ (recommended) and npm.

```bash
git clone <your-repo-url>.git
cd password-analyzer
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command       | Description        |
| ------------- | ------------------ |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | ESLint |

### Environment variables

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `NEXT_PUBLIC_SITE_URL` | No | Canonical site URL (no trailing slash), e.g. `https://passguard.example.com`. Used as `metadataBase` for Open Graph / absolute URLs. |

## Project structure (high level)

```
app/                  # App Router — layout, globals, page, not-found
components/           # UI — analyzer shell, generator panel, progress
lib/                  # Shared helpers — password math & generation
public/               # Static assets (if any)
```

Core logic for entropy estimates and `generateSecurePassword` lives in **`lib/password-utils.ts`**.

## Security & privacy

- Generator randomness is **client-side only**.
- The crack-time figure is a **rough educational estimate** (assumed guesses per second); real attacks may be faster (leaked passwords, phishing, MFA bypass, etc.).
- Do not treat this tool as a substitute for a **password manager** and **multi-factor authentication**.

## Authors

Academic project — **J. Santiago Ravelo** & **Omar Castro** (Systems Engineering, Universidad de Pamplona, Colombia).

## License

This project is released under the **MIT License** — see [LICENSE](./LICENSE).

---

*Last updated: tooling and UI aligned with Next.js 16, ESLint 9 flat config, and PassGuard branding.*
