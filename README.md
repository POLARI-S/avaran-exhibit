# AVARAN — Exposure, made visible

**Live exhibit: https://polari-s.github.io/avaran-exhibit/**

Interactive prototype exhibit by Team AVARAN, Amity University Noida · SIH26118.

AVARAN is a passive AgNP–PVA wristband being developed to estimate cumulative H₂S exposure from a phone photograph. The exhibit lets you take apart the actual CAD prototype in 3D, compare the original film trial photographs, inspect the laboratory chamber, replay a real recorded controller session, and walk through the phone-reader workflow.

Numerical calibration and independent validation remain in development; the exhibit labels what is built, recorded, proposed and not yet validated.

## Repository layout

- `avaran/dist/` — the published static site (deployed to GitHub Pages on every push to `main` by `.github/workflows/pages.yml`).
- `avaran/scripts/` — asset preparation, build, data audit and local server scripts.
- `avaran/README.md` — full technical notes, local commands and evidence boundaries.

## Run locally

```bash
cd avaran
npm install
npm run dev
```

Then open http://127.0.0.1:5173.
