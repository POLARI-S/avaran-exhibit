# AVARAN — Interactive H₂S Wristband Website: Codex Handoff

**Project:** SIH26118 · Team AVARAN · Amity University Noida  
**Prepared:** 2 October 2026, Asia/Kolkata  
**Purpose:** A self-contained implementation brief to transfer with the two asset ZIPs into a new Codex session.  
**State:** Website not started in this planning chat. Start implementation in the receiving session when the user asks to build.

## 1. Read this first: authoritative decisions

This handoff supersedes conflicting earlier project descriptions for this website. The user explicitly confirmed:

> The photographed and experimentally tested sensing material is an AgNP–PVA composite, arranged as a two-patch wristband. No PDMS was used; remove that concept.

- The current sensing film is **silver nanoparticles (AgNP) mixed with polyvinyl alcohol (PVA)**. Do not label it PDMS, invent a PDMS membrane, or include PDMS as a current/future website component.
- Present the **actual two-patch prototype**: an exposed sensing patch and a protected reference patch. The intended gas-exclusion function of the reference cover is not yet independently validated. Do not claim perfect sealing or complete optical compensation.
- The band body is reusable; the cartridge and sensing material are replaceable consumables.
- The wristband itself has **no electronics**. Arduino, relays, Peltier modules and sensors belong to the laboratory setup, not the wearable.
- The intended product measures **estimated cumulative exposure at the badge**, in **ppm·h**. It does not measure H₂S absorbed into the worker's body or the instantaneous/peak concentration.
- Shift-long use is the target, not a validated performance claim. A roughly 12-hour pilot exposure does not establish 6–8-hour field accuracy.
- The team built patches, a wristband prototype, an instrumented experimental chamber, a desktop controller/logger, and a phone-oriented reading interface. Preliminary exposure trials were conducted.
- **There is no trained and independently validated patch-to-dose ML model.** Independent samples and experiments were insufficient, and no more exposure experiments can be conducted before the immediate submission.
- The phone app must be described as **a colour-to-exposure estimation pipeline under development**. Existing displayed dose numbers are provisional interface examples, not validated results.
- The chamber's H₂S ppm values are **unvalidated datasheet-derived estimates**, not certified reference readings. Temperature/humidity compensation in the controller is approximate.
- Do not reuse earlier illustrative calibration constants, accuracy numbers, equal-dose results, cost estimates or shelf-life values as measured current-prototype results.
- No website has been created, registered or published by this handoff. Do not assume the previous chat's scratch paths exist in the receiving environment.

### Exact project-status statement

> AVARAN completed the wristband prototype, AgNP–PVA sensing films, an instrumented experimental chamber, an Arduino-based controller, a data-recording application and preliminary exposure runs. The available independent patch dataset was insufficient for responsibly training and validating a predictive model. The current application is therefore presented as a colour-to-exposure estimation pipeline under development, and no accuracy claim is made.

## 2. Website goal and audience

Create a shareable, responsive project exhibit for SIH judges. It must explain **what was built, how it works, how it was explored experimentally, and what remains unvalidated**. It supplements the official submission; it is not a substitute for its prescribed format.

The user's central request is a genuine **interactive 3D wristband**. Visitors can rotate it, click to detach/explode its parts, select a component, and read its purpose and preparation/assembly explanation. Also explain the chamber, electronics, recording application and real preliminary patch trials.

Two navigation modes:

1. **Judge Tour:** a short guided sequence intended to take approximately 90 seconds of reading/exploration; no forced autoplay or timer.
2. **Explore:** freely navigate the device, material, experimental setup, evidence and application.

The primary interaction must be available immediately. Avoid an oversized promotional hero that pushes the device below the fold. Keep copy concise and comprehensible to a technical judge who has not read the project documents.

## 3. Files to transfer

### Required

1. This `WEBSITE_HANDOFF.md`.
2. The **latest** `H2S data.zip`, including `agNPs Patches data/`. Older copies lack patch photographs.

### Required for real controller-data replay

3. `Portable.zip` (the older uploaded archive containing the desktop logger, its model documentation and CSV/log recordings).

Both archives are available in the planning workspace as `upload/01-H2S-data.zip` and `upload/01-Portable.zip`; these are location hints only, not portable paths.

If `Portable.zip` is absent in the receiving chat, build the rest of the site. Explain the controller using real media and omit the replay rather than inventing readings. Request that archive only if the user wants to restore replay.

### Safe asset handling

- Inspect the archive paths and extract safely into a task-specific folder. Preserve the originals.
- Never execute `H2S Monitor.exe` or the `.lnk` shortcut; neither is needed for a website build.
- Rename/copy website media into clean paths, retaining a source-path manifest for traceability. Do not alter the original experimental photographs.
- `H2S app ss/2` through `/6` are PNG files **without extensions**; add `.png` to working copies.
- Do not rely on ZIP modification times, WhatsApp filenames or EXIF to infer exposure start/end, patch identity, clock synchronization or trial conditions.
- Documentation describes proposed methods. It is **not evidence that every step was performed**.
- Never expose personal worker data, serial-port details, local computer paths or unreviewed raw logs on the public site.

## 4. Verified asset inventory

Paths below are relative to the extracted `H2S data/` folder.

| Asset | Path | Intended use |
| --- | --- | --- |
| Team logo | `avaranlogo.png` | Brand mark; 209 × 138 px source, avoid excessive enlargement |
| Current body mesh | `AVARAN_R6_print/AVARAN_FINAL_BODY.stl` | Actual reusable head geometry |
| Current cartridge mesh | `AVARAN_R6_print/AVARAN_FINAL_CARTRIDGE.stl` | Actual replaceable cartridge geometry |
| Earlier meshes | `AVARAN_R6_print/R6_BODY.stl`, `R6_CARTRIDGE.stl` | Reference only; prefer FINAL files |
| Wristband photos | `H2S wrist band/` (five JPEGs) | Actual device, calibration frame, film casting photos |
| Chamber photos | `H2S environment controller/` (three JPEGs) | Front, rear and overhead views |
| Chamber video | `H2S environment controller/WhatsApp Video 2026-10-02 at 12.00.24 AM.mp4` | Real operation and controller screen |
| Application screenshots | `H2S app ss/1.png`, `2`, `3`, `4`, `5`, `6`, `both.png` | Dashboard, Scan, Records, Setup and example output |
| Method document | `H2S patch making/AVARAN_AgPVA_Dose_Calibration_Protocol.docx` | Proposed material/optical/calibration workflow, not measured results |
| Quick Run guide | `AVARAN_Quick_Run_Lab_Guide.pdf` | Proposed pilot schedule and logger procedure; actual batch timings below take precedence |
| Patch evidence | `agNPs Patches data/Batch1/` through `Batch5/` | Before/after galleries |
| Early film photograph | `agNPs Patches data/First experiment color difference.jpeg` | Early development observation; exposure metadata unavailable |

The current data archive has 48 entries including directories and 12 patch-evidence JPEGs. Its integrity test passed.

### Model dimensions and alignment

Binary STL coordinates were inspected; interpret as millimetres pending normal import sanity checks:

| Mesh | Bounding extent | Coordinate bounds |
| --- | --- | --- |
| FINAL body | 48 × 36 × 8 | x −24…24; y −18…18; z 0…8 |
| FINAL cartridge, including grip | 32 × 41.6 × 3.6 | x −16…16; y −15.6…26; z 2.4…6 |

The cartridge includes a protruding grip, so its overall bounding box is not the recess footprint. Do not shrink it to force its entire bounding box into the body. Preserve the shared CAD coordinate system first, inspect the mating geometry, and transform the **whole assembly** consistently.

The two cartridge files are byte-identical. The body files have different byte hashes but identical inspected extents; prefer `AVARAN_FINAL_BODY.stl`, not an arbitrary older mesh.

## 5. Preliminary patch trials: actual user-reported metadata

In filenames, **B = before exposure** and **F = after exposure**. “Batch” here is the user's trial-group label, not evidence of an independently manufactured material batch. Do not count these as five manufacturing lots.

| Trial group | Before files | After files | Duration reported by user | Approximate concentration reported by user |
| --- | --- | --- | --- | --- |
| B1 | `Batch1/B1-B.jpeg` | `Batch1/B1-F.jpeg` | 10 minutes | Approximately 30 ppm |
| B2 | `Batch2/B2-B.jpeg` | `Batch2/B2-F.jpeg` | 20 minutes | Approximately 20 ppm |
| B3 | `Batch3/B3-B.jpeg` | `Batch3/B3-F.jpeg` | 30 minutes | Approximately 20 ppm |
| B4 | `Batch4/B4-B.jpeg` | `Batch4/B4-F.jpeg` | 45 minutes | Approximately 20 ppm |
| B5 | `Batch5/B5.1-B.jpeg`, `Batch5/B5.2-B.jpeg` | `Batch5/B5-F.jpeg` | Around 12 hours | User reports approximately 20 ppm; time course unverified |

These paths are relative to `agNPs Patches data/`. All conditions above are **team-reported approximate conditions**, not independently verified dose labels.

### What the images support

- Real exploratory material trials occurred, according to the team, and images document the sample appearance.
- The team reports the clearest fading/blackish response after the extended B5 exposure; visual review found pronounced darker brown areas and spatially uneven appearance.
- Short-duration comparisons are subtle or ambiguous in these photographs.
- The images show visible glare, wrinkles, bubbles, differing framing and nonuniform film appearance. Treat these as observed image/sample features, not proof of a particular defect mechanism.

### What they do not support

- A quantitative colour-to-dose calibration, trained predictor, accuracy percentage or validated dose-response monotonicity.
- Constant chamber concentration, exact integrated dose, equal-dose integration proof, selectivity, a shelf-life claim or saturation kinetics.
- Inferring that B5 received 240 ppm·h from “20 ppm × 12 h.” The full concentration history and exposure boundaries are not linked.
- Claiming all darkening is H₂S chemistry rather than imaging, handling, film variability or ageing. Discuss a **preliminary observed response under reported exposure conditions**, not independently demonstrated causality.
- Assigning each B5 after patch to a particular before patch. The before images each show four patches and the after image shows multiple patches without per-patch IDs; the mapping is not established.

### Gallery design

- Lead with **Extended exposure observation: B5**, with both before photographs and the after photograph. Identify it as qualitative pilot evidence.
- Keep B1–B4 accessible under **Early response trials**. Do not hide weaker trials or imply B5 represents all trials.
- Use paired photographs with explicit before/after labels. A full-image comparison slider is optional, but the pairs are unregistered: do not morph them, claim pixel alignment or pretend identical camera conditions.
- Keep the source images' colour intact. No recolouring, artificial darkening, selective contrast enhancement or generative cleanup of measurement evidence.
- Display this caveat close to the comparisons:

> Preliminary qualitative trials. Exposure conditions are team-reported estimates, and photographs were captured under varying conditions. These images are not used for numerical calibration.

- Do not plot extracted RGB, ΔE, KM or nominal ppm·h as measured results from these photos. Counts of photographs are not counts of independent experimental samples.

## 6. Recommended real recording for the controller replay

Use this verified candidate from `Portable.zip`:

`Portable/Recordings/H2S_2026-09-30_15-36-18-703.csv`

It is the most substantial included recording and demonstrates instrumentation and heating control. **It has not been linked to B1–B5.** Call it a **controller recording**, not the ground-truth exposure history of those patch trials.

### Verified recording summary

| Property | Observed value |
| --- | --- |
| Data rows | 1,781 |
| Local start | 2026-09-30 15:36:18.743 +05:30 |
| Local end | 2026-09-30 16:36:22.264 +05:30 |
| Timestamp span | 3,603.521 seconds, approximately one hour |
| Largest timestamp gap | 3.749 seconds |
| Non-increasing timestamp steps | None in this audit |
| Valid temperature readings | 1,760; range 28.8–30.2 °C |
| Valid humidity readings | 1,760; range 54.2–60.8% RH |
| Raw ADC range | 18–954 |
| Numeric estimated ppm readings | 186; range 1.084–8.017 ppm |
| Relay states observed | HEATING: 660 rows; BOTH OFF: 1,121 rows |

The recording does not demonstrate cooling in this selected trace; explain cooling as a hardware capability, not a measured event in this recording.

`ppm_status` distribution:

| Status | Rows | Display meaning |
| --- | --- | --- |
| `NO_BASELINE` | 727 | Concentration unavailable: baseline not captured |
| `BASELINE_CAPTURING` | 22 | Concentration unavailable: baseline capture in progress |
| `BELOW_MODEL_RANGE` | 813 | Below the model's 1 ppm range; unquantified, not zero |
| `DHT_ERROR` | 21 | Invalid environmental sensor reading |
| `ABOVE_MODEL_RANGE` | 12 | Above supported model range; unquantified |
| `ESTIMATED` | 186 | Numeric datasheet-derived estimate; unvalidated |

### Replay implementation rules

1. Parse `timestamp_local` with its +05:30 offset. Use wall-clock timestamp differences for the replay; do not assume `elapsed_seconds` equals the uninterrupted wall-clock span.
2. Preserve numeric nulls and status flags. Render broken chart segments for invalid/unquantified readings. Never fill missing ppm with zero or connect across invalid stretches.
3. Use actual columns: `temperature_c`, `humidity_percent`, `h2s_raw`, `h2s_voltage_v`, `h2s_estimated_ppm`, `ppm_status`, `relay_output`, `app_target_c`, `app_control_state`, `app_requested_output`, `app_command_status`.
4. Label the plot **Recorded controller session — replay**, not Live. Provide play/pause, a keyboard/touch-accessible timeline and current-value readouts.
5. Main traces: temperature/target, humidity and raw ADC; show estimated ppm as a secondary trace with a persistent caveat and its coverage. Keep ADC and ppm distinct.
6. Prefer the compact processed JSON generated reproducibly from the CSV. Keep source filename and processing notes in the repository. Sampling for rendering must preserve gaps and state transitions.
7. Do not recalculate old missing ppm using a later baseline from a different condition or session.
8. Do not compute a full-session dose or link patch photographs to this replay. Approximately 10.4% of rows have numeric ppm, and patch exposure boundaries are unknown.
9. “Below range” is not zero. If an educational integration illustration is added, keep it in a separately labelled **illustrative scenario**, not this measured recording.

Required nearby text:

> Recorded experimental controller data. H₂S concentration is a provisional datasheet-derived estimate, not calibrated reference ground truth. Missing and out-of-range readings remain unquantified. This recording is not linked to the photographed patch batches.

`Portable.zip` additionally contains seven other CSVs (including two header-only files), corresponding serial logs, `h2s-baseline.json`, `curve-model.json`, `MODEL-NOTES.md`, `README.md` and `START-HERE.txt`. Inspect those documents if implementing model-status explanations. Do not confuse the **electronic sensor's curve model** with a trained **patch-colour-to-dose model**.

## 7. Website structure and requested interactions

Aim for one cohesive page with section navigation rather than a complex portal. The two tour modes can share the same content.

### A. Explore the wristband — first screen

- Use the supplied logo, project name, SIH26118 and a short explanation: **A passive patch wristband designed to estimate cumulative H₂S exposure from a phone photograph.**
- Show the actual STL-based assembly, with drag/rotate, assemble/explode toggle, Reset View and selectable parts.
- Match body/cartridge scale and fit. The user previously objected to rendered cartridges being larger than their seating area; this is a high-priority visual acceptance check.
- Explain reusable body and replaceable cartridge. Display prototype/development status near the introduction, without overwhelming the interaction.
- Selecting a component opens a concise panel: **What it is / What it does / How it is made or assembled / Evidence status**.
- On mobile, use large controls and a collapsible detail panel. Avoid scroll trapping inside the 3D canvas.

### B. Material and manufacturing

- Explain the AgNP–PVA composite and the intended silver-to-silver-sulfide colour response in plain language.
- Use the real cast-film photographs and protocol as references. The exact formulation, loading, drying conditions and achieved film thickness were not confirmed by the final user message; do not invent them.
- Separate **documented/proposed procedure** from **actual supplied build evidence**. If a detail is unconfirmed, omit it or label it as the planned method.
- Explain that both device patches use the same composite; one is exposed, the other protected as a reference. Reference gas exclusion and optical equivalence remain to be validated.
- Do not force Kubelka–Munk, exponential kinetics or any earlier proposed equation as a validated current thin-film model.

### C. Instrumented chamber

- Use a clean clickable chamber schematic/reconstruction with the real photographs and video beside it. Label reconstruction **schematic** where dimensions/geometry are inferred.
- Clickable components: enclosure, patch rack, Arduino Uno, DHT11, H₂S sensor, two-channel relay module, Peltier modules, circulation fan, power supply and laptop/controller.
- Identify the visible Peltier modules as **TEC1-12706 thermoelectric modules**. They have hot and cold faces; appropriate drive, mounting and heat rejection enable temperature control.
- Sensor terminology in supplied controller files is **GM-602B**, associated with the SEN0568/Fermion H₂S module. Verify model labels in actual assets before placing a detailed commercial name on the site.
- DHT11 measures temperature and humidity; it does not actively control humidity. Peltier control here primarily addresses temperature.
- Keep chamber electronics physically distinct from the passive wristband.
- Include high-level supervised-laboratory safety context. Do not publish DIY H₂S generation recipes, reagent quantities, bypass instructions or imply the prototype enclosure is a certified gas chamber/alarm.

### D. Recorded controller session

Implement the replay in Section 6 if the archive is available. Use the actual values and status messages, not random animated numbers. Do not synchronize the existing video with the CSV without evidence that they are the same session.

### E. Preliminary patch evidence

Implement Section 5. Put the B5 extended exposure observation first, but retain early B1–B4 groups. Include approximate duration/concentration, the user-reported provenance and the photography caveat.

### F. Phone interface and intended reading workflow

- Show actual screenshots: scan/upload, worker and shift entry, reference-region selection, records/export and provisional calibration settings.
- These screenshots prove interface development, not numerical performance. Label **Interface prototype — provisional calibration**.
- Screenshot output such as 1.44 ppm·h is an example, not validated measured accuracy. Present context immediately beside the image.
- Any “Safe / Caution / Over Limit” labels visible in legacy screenshots are not certified safety decisions. Do not recreate them as operative website advice.
- Do not add a real worker scanner, image upload, working ppm predictor, fake prediction endpoint or trained-model claim. A screenshot walkthrough is enough for this phase.
- Explain intended cumulative dose units using `D = ∫ C(t) dt`. If describing shift-average concentration, explain it is dose divided by valid wearing time and not a peak measurement.

### G. Evidence status and next validation

Use four meaningful labels throughout:

| Label | Examples |
| --- | --- |
| **Built** | Wristband, cartridge, films, chamber, controller, application interface |
| **Recorded** | Actual controller logs and original trial photos; with their limitations |
| **Proposed** | Calibrated patch-colour-to-dose pipeline, equal-dose tests, future deployment |
| **Not yet validated** | Numerical dose accuracy, reference barrier, selectivity, shelf life, batch consistency, workplace use |

Explain missing independent dataset/model validation explicitly. Outline future calibrated-reference measurements, controlled imaging, film quality control, independent test samples and equal-dose studies as **future work**, not completed results.

### H. Team and sources

- AVARAN · Amity University Noida · SIH26118.
- Faculty mentor: Dr. Vinayak Majhi.
- Existing project context lists Arindam Maity (team lead), Anvi Malhotra, Sparsh Tyagi, Tanisha Suyal, Sneha Jain and Lavish Lohiya. Verify public name spelling/roles with the user before publishing; do not invent assigned workstreams.
- No confirmed public contact email or social link is needed to build; omit rather than invent.
- Optional curated downloads: reviewed project methods and CAD only. Do not dump executables or all unreviewed lab documents onto the public page.

## 8. 3D representation rules

### Model fidelity

- The actual STL body and cartridge are the starting point, not earlier AI product renders or old dimensions.
- Import body and cartridge together before changing their origins. Preserve a single unit scale, shared coordinate transforms and a consistent camera.
- Make separately selectable PVA-film patches, fixed white backing, protected reference cover, calibration print and strap only as necessary to explain the assembly. These extras have no supplied independent CAD and must be described as **illustrative layers**.
- A schematic strap can complete the wearable silhouette. Do not claim precise buckle/strap dimensions.
- Do not invent a separate perforated lid or mesh/PDMS layer: these are not verified components of this supplied prototype.
- Show the visible grey/warm-tone printed references and corner fiducials from the actual photos. Do not silently substitute the older RGB colour-frame concept and call it the actual build.
- Fiducials are optical location markers. Do not label them a functioning worker-ID QR code. A worker/lot QR remains an optional planned feature if no actual code is provided.
- Selecting the reference cover should say **intended gas barrier; exclusion not yet validated**. Its material is not confirmed here, so do not call it gas-tight glass or foil without evidence.

### Optical/mechanical intent

- Target geometry should keep patch measurement regions flat, at matching height, over consistent opaque white backing.
- Calibration references should occupy the flat optical face. Avoid decorative raised colour rings or references on sloped/curved surfaces.
- Recesses should be shallow with flared lead-ins in an intended-design illustration. Do not fabricate deep walls or glossy “smartwatch” styling.
- Preserve a protected grip area, repeatable seating and rounded practical form. Do not add electronics, screens, buttons, batteries or LEDs to the wristband.
- Actual photographs reveal some asymmetric borders/notches and visible print texture; never present the current prototype as already meeting every ideal optical condition. Explain deviations as prototype refinement work where needed.

### Interaction/performance

- Smooth explosion along a clearly readable axis with a small number of selectable components; default assembled view.
- Keyboard-accessible part list provides the same information as canvas picking. Support touch, focus indicators and reset.
- Honour `prefers-reduced-motion`; no essential auto-rotation or forced animation.
- Use real WebGL/Three.js geometry for rotation/explosion, not a static generated render pretending to be interactive.
- Include an original-photo fallback when WebGL is unavailable. The core story must remain usable without 3D.

## 9. Recommended implementation approach

This is a front-end project exhibit. No authentication, database, live hardware connection or trained inference server is required.

- Respect any existing receiving repository and its instructions; do not reset it or replace unrelated user work.
- If starting an empty ordinary Codex repository: **React + TypeScript + Vite**, **Three.js with React Three Fiber/Drei** for the wristband, and a light charting library such as Recharts for replay. These are recommendations, not a reason to migrate an established stack.
- If the receiving environment uses a managed website-building/hosting skill, follow that environment's required workflow instead. Do not assume tools from this planning chat are installed there.
- Use the existing component stack where possible. Add dependencies only for requested capabilities.
- Load STL assets directly or convert reproducibly to a compact GLB; retain original geometry and provenance. STL has no colours/materials, so apply explanatory materials separately.
- Use a deterministic CSV-to-JSON script. Include a compact media manifest linking processed assets to the originals and a metadata file for the user-reported batches.
- Lazy-load 3D and video, constrain mobile device-pixel ratio, compress working copies sensibly and reserve layout dimensions. Do not make evidence images visually different through colour processing.
- Prefer a one-page public-facing exhibit. The actual target is a shareable URL judges can open without sign-in; confirm the hosting/access choice before publishing if authorization is not already clear.
- Do not set up external accounts, pay for services, send messages, operate the chamber or start new experiments.

### Visual direction

Use **a precision engineering exhibit**: dark charcoal/black, restrained electric blue/cyan, readable high-contrast typography, matte object materials, fine technical lines and intentional whitespace. Warm yellow should come primarily from the real sensing film; use it sparingly as an accent. Blue-and-black aligns with the team's existing document preference.

Avoid excessive glow, particle effects, sci-fi holograms, chrome, giant slogans or busy decorative animation. The memorable feature should be the correctly fitted, explodable wristband and credible experimental evidence.

## 10. Phased build workflow

### Phase 1 — Validate and organize

1. Read this handoff and receiving repo instructions.
2. Confirm the latest data ZIP includes the 12 patch-evidence JPEGs and final STL pair.
3. Safely extract, inspect actual media and import the two STLs together.
4. Create a clean asset manifest and batch metadata with `evidence: qualitative` and `conditions_source: team_report`.
5. If Portable is included, confirm the selected trace, numeric coverage and status counts. Do not infer correspondence with B1–B5.
6. Read the supplied protocol only for details being used; distinguish methods from achieved results. It cannot override the user's explicit no-PDMS decision.

### Phase 2 — First coherent preview

Build the branded first screen with the actual wristband assembly, assemble/explode control, part selection and at least one representative real evidence photograph. Establish layout, typography and prototype status. Show this preview before extending the whole experience when the environment supports it.

### Phase 3 — Complete the interactive exhibit

Add the chamber hotspots, recorded-data replay, batch comparisons, manufacturing explanation, app screenshot walkthrough, status/limitations and team section. Implement the guided tour using the same content, with touch/keyboard parity and reduced-motion behaviour.

### Phase 4 — Verify and refine

Check assembled fit, real-image labels, trace gaps, unit correctness, scientific wording, phone usability, WebGL fallback and loading. Fix functional/visual defects; do not expand scope into an ML backend or invent missing measurements.

### Phase 5 — Handoff and hosting

Provide a working build, source README, processed-asset provenance, and preview/deployment instructions. Publish only under the receiving environment's applicable authorization/workflow. Test the shared link with the intended access level, particularly if judges should open it without an account. Report exact completed and omitted features.

## 11. Acceptance checklist

### Content/evidence

- [ ] Current chemistry is AgNP–PVA; no PDMS layer, fabrication step or concept appears in website copy.
- [ ] Two-patch actual prototype is clearly distinguished from its unvalidated reference-cover function.
- [ ] Reusable body/replaceable cartridge and passive wearable/lab electronics are unambiguous.
- [ ] Output is intended estimated cumulative badge exposure in ppm·h, never absorbed bodily dose.
- [ ] No trained-model, accuracy, selectivity, shelf-life, integration-proof or regulatory-certification claim is invented.
- [ ] B1–B5 conditions match Section 5 and are labelled team-reported approximate exposures.
- [ ] B5 is qualitative extended-exposure evidence, not a 240 ppm·h calibration datum or field validation.
- [ ] Weak early comparisons remain accessible; original photograph colour is preserved.
- [ ] App outputs are identified as provisional interface examples; no operative “safe” determination.
- [ ] Proposed methods and old example calibration constants are not presented as completed experiments.

### 3D/interaction

- [ ] FINAL body/cartridge geometry imports at consistent scale and mates in assembled position; grip is allowed to protrude.
- [ ] Rotate, explode/reassemble, reset and select-part actions work by mouse and touch.
- [ ] Clickable descriptions explain purposes and preparation without inventing unconfirmed formulation/cover details.
- [ ] Extra layers/strap/chamber geometry are labelled illustrative where inferred.
- [ ] No fictitious lid/membrane/electronics or QR identity function is attributed to the current wristband.
- [ ] Keyboard controls and a non-WebGL fallback communicate the same information.

### Recording/data

- [ ] Selected CSV is called a recorded controller session, not a live stream or matched patch trial.
- [ ] Raw ADC, voltage and estimated ppm are differentiated.
- [ ] Null/invalid readings display gaps and status flags, not zeros or fabricated interpolations.
- [ ] The session retains approximately 186 numeric ppm rows out of 1,781; no full-session dose is fabricated.
- [ ] Replay uses timezone-aware timestamps and doesn't pretend video synchrony.
- [ ] Temperature control is explained separately from humidity measurement; cooling is not claimed as observed in the selected trace.

### Delivery

- [ ] Mobile, tablet and desktop layouts work without accidental horizontal scrolling.
- [ ] Readable body text, sufficient contrast, visible focus states, image descriptions and reduced-motion support.
- [ ] Layout remains usable during loading and when a media asset/WebGL fails.
- [ ] Video does not autoplay with sound; compressed assets load reliably.
- [ ] No executable, shortcut, private paths or personal worker records are published.
- [ ] Build completes; browser interactions and console are checked if supported.
- [ ] Shared-link access matches the user-approved audience; deployment limitations are stated honestly.

## 12. Copy boundaries and open items

### Approved description

> AVARAN is developing a passive AgNP–PVA wristband for smartphone-based estimation of cumulative H₂S exposure. The team has built the wearable prototype, experimental chamber and recording software, and conducted preliminary material-response trials. Numerical calibration and independent prediction validation remain in development.

### Do not say

- “The worker absorbed X ppm·h of H₂S.”
- “Our AI accurately predicts exposure” or “validated 95/99% accuracy.”
- “The chamber held a constant 20 ppm for 12 hours.”
- “The sealed reference cancels lighting completely” or “blocks all gas” without validation.
- “Suitable replacement for an industrial H₂S alarm.”
- “Temperature and humidity were both actively controlled” based on DHT11 measurement alone.
- “The 12-hour trial proves one-shift cumulative dosimetry.”
- “Model unavailable” while generating plausible-looking exposure predictions behind the scenes.

### Non-blocking unknowns

The exact composite recipe, thickness, reference-cover material/sealing method, per-patch identities, image-capture settings, B5 patch mapping, batch exposure timestamps and links to the recorder files remain unconfirmed. They are **not reasons to fabricate details or stop the entire website**. Explain the verified high-level process and label gaps.

Public team roles/contact and publication host are also not settled. Leave unprovided contact links out; confirm only if needed for final publishing. No more gas experiments are requested or required for this website build.

## 13. Suggested message to start the new Codex session

> Read WEBSITE_HANDOFF.md fully and inspect the attached latest H2S data.zip and Portable.zip. Build AVARAN's responsive interactive SIH project website using the supplied final STL body/cartridge, real photographs, preliminary batch evidence, application screenshots and the documented controller recording. Follow the phased workflow and acceptance checklist. The tested material is AgNP–PVA in a two-patch wristband; no PDMS concept is to appear. There is no trained/validated patch prediction model. Preserve qualitative-evidence labels, real recording gaps and provisional app status; do not invent calibration, dose labels or accuracy. Start with a working 3D assembled/exploded device preview, then complete the exhibit. Prepare a judge-shareable version and confirm any publication/access decision that requires new authority.

---

**End of handoff.** This file records the latest user-confirmed prototype and website scope; earlier conflicting memory or AI renders must not override it.
