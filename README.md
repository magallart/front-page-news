# 🚀 Angular AI Project Template

A modern **Angular 21** starter template supercharged with **AI-powered agents** to help you design, scaffold, test, and evolve applications faster — without losing architectural consistency.

This repository is not just a boilerplate. It’s a **thinking partner** for Angular projects:

- 🤖 AI agents that understand your codebase and design system.
- 🎨 A scalable design system with semantic tokens.
- 🧱 Opinionated structure to reduce decision fatigue.
- ⚡ Ready for real-world, long-lived applications.

If you build Angular apps regularly and want **speed without chaos**, this template is for you.

---

## ✨ What’s inside

- **Angular 21** (generated with Angular CLI 21.1.0)
- **AI Agents** for:
  - Design consistency
  - Tailwind usage rules
  - Workflow and process enforcement

- **Semantic design system** (tokens over raw values)
- **Vitest** for unit testing
- Clean, extensible project structure

---

## 🧑‍💻 Getting started

### 📦 Install dependencies

```bash
npm install
```

### ▶️ Run the app locally

```bash
ng serve
```

Then open:

```
http://localhost:4200/
```

The app will automatically reload on file changes.

---

## 🧩 Common commands

### Build for production

```bash
ng build
```

Artifacts will be generated in the `dist/` folder, optimized for performance.

### Run unit tests

```bash
ng test
```

Powered by **Vitest**.

### Run end-to-end tests

```bash
ng e2e
```

---

## 🎨 Adapting the design template to a New App

🔁 **When to Update Each File:**

| Change                            | File to Update                  |
| --------------------------------- | ------------------------------- |
| New brand / redesign              | DESIGN.md + styles.css          |
| New semantic color (e.g. warning) | tailwind.config.js + styles.css |
| New UI pattern                    | DESIGN.md                       |
| Tailwind usage rules              | agents/tailwind.md              |
| Process or workflow rules         | AGENTS.md                       |

### 📒 Quick reference

- **DESIGN.md** → What this app looks like
- **styles.css** → Real values (colors, fonts)
- **tailwind.config.js** → Semantic tokens
- **Components** → Use tokens, never raw values

This separation allows AI agents (and humans) to reason clearly about design decisions.

---

## 🙏🏻 Thanks

Thanks to the authors and maintainers who shared the knowledge and resources that informed the agent setup in this template:

- [https://hassantayyab.com/blogs/agent-skills-angular-ai-coding](https://hassantayyab.com/blogs/agent-skills-angular-ai-coding)
- [https://github.com/Gentleman-Programming/Gentleman-Skills](https://github.com/Gentleman-Programming/Gentleman-Skills)

---

Happy building ✨
