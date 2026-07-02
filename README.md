<div align="center">

# ✦ Shayan Abrar — Portfolio

**Python & Machine Learning Developer · Junior AI Engineer**
Turning data into decisions with Python-powered, AI-driven solutions.

[![Live Site](https://img.shields.io/badge/▲_Live_Site-shayan--abrar.vercel.app-1DCD9F?style=for-the-badge)](https://shayan-abrar.vercel.app/)
[![Google Scholar](https://img.shields.io/badge/Scholar-7_publications-4285F4?style=for-the-badge&logo=googlescholar&logoColor=white)](https://scholar.google.com/citations?user=Y9-D6OQAAAAJ&hl=en)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-shayan--abrar-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/shayan-abrar/)

<br/>

![Portfolio preview](assets/preview.png)

</div>

---

## ✦ Overview

My personal portfolio — a fast, fully responsive single-page site with a **dark glassmorphism**
aesthetic and a mint accent (`#1DCD9F`). Built with **vanilla HTML, CSS and JavaScript** — no
framework, no build step — and brought to life with a custom motion layer: an animated cursor,
tilt + spotlight cards, scroll reveals and count-up stats.

It showcases my work as an AI engineer: production experience, seven research publications in
explainable deep learning, and a set of AI/ML projects that run everything from vision LLMs to
LangGraph agents.

---

## ✦ Sections

`Hero` · `About` · `Experience` · `Education` · `Skills & Technologies` · `GitHub Activity` · `Projects` · `Research / Publications` · `Contact`

---

## ✦ Features

- 🎨 **Dark glassmorphism UI** — cohesive mint accent, frosted cards, soft glows
- 💼 **Experience & Education** — quantified role cards and a clean timeline
- 📚 **Research section** — live Scholar stats, featured most-cited papers, publication cards
- 🖱️ **Custom animated cursor** with a lagging ring that reacts to interactive elements
- 🪄 **3D tilt + cursor-spotlight cards**, magnetic buttons and scroll-reveal animations
- 🌌 **Animated hero** — drifting aurora glow over an interactive particle field
- 🔢 **Count-up stats** — GitHub activity and Scholar metrics animate into view
- 📨 **Working contact form** — Formspree-powered with smart validation
- 🔍 **SEO-complete** — Open Graph / Twitter cards, JSON-LD (`Person` + `WebSite`), sitemap, robots.txt, favicons
- 📈 **Vercel Web Analytics** — cookieless and invisible to visitors
- ♿ **Accessible** — `:focus-visible` rings, `prefers-reduced-motion` support, keyboard-friendly
- ⚡ **Performance-minded** — WebP images, pre-generated Tailwind (19 KB vs the 300 KB CDN script), lazy loading

---

## ✦ Tech Stack

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap_5-7952B3?style=flat-square&logo=bootstrap&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-88CE02?style=flat-square&logo=greensock&logoColor=black)

| Layer | Tools |
|---|---|
| **Markup & layout** | HTML5, Tailwind CSS (pre-generated, static), Bootstrap 5 |
| **Styling & motion** | Custom CSS design system, GSAP + ScrollTrigger, particles.js, Lenis |
| **Interactions** | Vanilla JS — custom cursor, tilt, spotlight, counters |
| **Typography** | Sora, Inter & Special Gothic Expanded One (Google Fonts) |
| **Integrations** | GitHub REST API, Formspree, Vercel Analytics |
| **Icons** | Devicon, Font Awesome, Simple Icons |

---

## ✦ Project Structure

```
Shayan-Portfolio-Website/
├── index.html       # Markup & content for every section
├── styles.css       # Design system, glassmorphism & motion layer
├── tailwind.css     # Pre-generated Tailwind utilities (see below)
├── script.js        # Loader, particles, GSAP reveals, GitHub API, contact form
├── enhance.js       # Custom cursor, tilt, spotlight, counters
├── assets/          # Images (WebP), icons, résumé & social preview
├── favicon.ico      # Multi-resolution favicon
├── robots.txt / sitemap.xml
└── README.md
```

---

## ✦ Run Locally

```bash
git clone https://github.com/SHAYAN-ABRAR/Shayan-Portfolio-Website.git
cd Shayan-Portfolio-Website
python -m http.server 8000   # any static server works
```

> No build step required — it's a fully static site.

**One exception:** if you add *new* Tailwind utility classes to the markup, regenerate the static stylesheet once:

```bash
npx tailwindcss@3.4.17 -o tailwind.css --content "index.html,script.js,enhance.js" --minify
```

### Customize

- **Content** → edit the sections in `index.html`
- **Accent color** → tweak the `--accent` variable in `styles.css`
- **GitHub feed** → set your `username` in `script.js`
- **Contact form** → set your Formspree endpoint in `script.js`

---

## ✦ Connect

- 🌐 **Website** — [shayan-abrar.vercel.app](https://shayan-abrar.vercel.app/)
- 🎓 **Google Scholar** — [Shayan Abrar](https://scholar.google.com/citations?user=Y9-D6OQAAAAJ&hl=en)
- 💼 **LinkedIn** — [shayan-abrar](https://www.linkedin.com/in/shayan-abrar/)
- 🐙 **GitHub** — [SHAYAN-ABRAR](https://github.com/SHAYAN-ABRAR)
- ✉️ **Email** — [shayanabrar7@gmail.com](mailto:shayanabrar7@gmail.com)
- 📍 **Location** — Dhaka, Bangladesh

---

## ✦ Acknowledgements

Built on the shoulders of [GSAP](https://gsap.com/), [particles.js](https://vincentgarreau.com/particles.js/),
[Lenis](https://lenis.darkroom.engineering/), [Tailwind CSS](https://tailwindcss.com/),
[Bootstrap](https://getbootstrap.com/), [Devicon](https://devicon.dev/) and [Font Awesome](https://fontawesome.com/).

---

<div align="center">

Made with 💚 by <b>Shayan Abrar</b>

</div>
