# UI Lab

Purely experimental UI playground — any library, any styling approach, no
rules. Each experiment is a self-contained folder under `experiments/`.

## Run the lab

```bash
npm install   # once — installs Vite
npm run dev   # → http://localhost:5173 (lab home / experiment index)
```

Vanilla experiments also run standalone — just open their `index.html`.

## Adding an experiment

**Vanilla (HTML/CSS/JS):**
```bash
cp -r _template experiments/NNN-kebab-name
```
Then link it in the root `index.html` gallery.

**Framework (React / Svelte / Vue / Solid / whatever):**
```bash
mkdir experiments/NNN-kebab-name && cd experiments/NNN-kebab-name
npm create vite@latest .
```
The folder gets its own `package.json` and dev server — fully isolated deps.
Link it in the gallery too (note the port if it needs one).

## Conventions

- Folders: `experiments/NNN-kebab-name/` — numbered for ordering.
- Styling: anything goes per experiment (vanilla, Tailwind, SCSS, CSS-in-JS).
- The lab shell itself (`index.html`, `lab.css`) stays vanilla.
- Each experiment should be safe to delete — no cross-experiment imports.
- Register every experiment in the root `index.html` so the gallery stays honest.
