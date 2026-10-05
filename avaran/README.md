# AVARAN interactive exhibit

A responsive, static project exhibit using the team's actual CAD, photographs, application screenshots and recorded controller session. No authentication, backend or predictive model is required.

## Run locally

Use Node.js and npm. In this folder:

```powershell
npm.cmd install
npm.cmd run build
npm.cmd run dev
```

Open http://127.0.0.1:5173. The prepared `dist/assets` directory is already included. There is no dependency on a CDN for Three.js, and no web-font requests: the page uses the platform's system font (SF Pro on Apple devices, Segoe UI Variable on Windows).

## Files

- `dist/hero.css`, `dist/dna.js`, `dist/ash.js`: prototype-first hero with seven projected component callouts and a reversible surface-particle morph into a large, full-page decorative double helix. A shared erosion field removes fragments of the actual meshes as matching material-coloured ash is released; grains drift before gathering into the green helix. Scroll progress uses a damped spring. Stationary surface samples are cached while particle motion runs on the GPU. The model opens automatically after the intro; only the remove/insert, open/close layers and reset controls remain. Pointer rotation is unrestricted. The chosen inspection angle remains until reset. Ctrl + wheel zooms on desktop; normal wheel scrolls the page. On phones, drag centrally to turn and swipe beside the model to scroll. A separate Pause motion control stops the decorative DNA animation. Reduced motion skips the opening and uses a direct scroll-state change.

- `dist/index.html`, `style.css`, `pipeline.css`: accessible exhibit text and responsive layout, including the phone-reader product preview.
- `dist/apple.css`, `dist/motion.js`: base interaction layer retained under the current theme. System typography, dialog materials, press feedback and spring-driven motion: sliding selection indicators, scroll reveals, image zoom from its thumbnail with flick-to-dismiss, and a draggable phone tour sheet.
- `dist/device.js`: real STL loading, shared-coordinate assembly, canvas picking, rotation and explosion; illustrative strap, films, backing, cover and optical print.
- `dist/exhibit.js`: before/after galleries, original-image viewer, chamber inspection, replay, screenshot walkthrough and guided tour.
- `dist/relay.css`, `dist/relay.js`: black/lime presentation and once-per-session intro ring. The old standalone DNA panel and narrow sidebar strand have been replaced by the shared model-to-helix canvas. The facts plate remains a static readable card. Public visual references inspired the original implementation; no premium template code or assets are included.
- `dist/app.js`: component descriptions and graphics fallback.
- `asset-manifest.json`: source-relative provenance and CAD bounds.
- `scripts/prepare-assets.mjs`: deterministic asset copies and CSV processing.
- `scripts/audit.mjs`: data coverage, null preservation, timestamp, privacy and byte-exact asset checks.
- `source-assets/`: local extracted originals; excluded from source-control tracking and public delivery. Executables and shortcuts were skipped.
- `qa/`: validation reports and review screenshots; never part of the public site.

`npm.cmd run prepare-assets` regenerates media and data from the extracted originals. Preserve their folder names if re-extracting. The original Downloads ZIPs were not modified. `npm.cmd run build` copies the locked Three.js modules into the static output. `npm.cmd run check` checks module syntax; `npm.cmd run audit` verifies the data and assets.

## Content and geometry boundaries

The body and cartridge use their original CAD coordinates and identical scales. The cartridge grip extends to y=26 mm and is deliberately not shrunk to fit the body's overall extent. Optical print, film, backing, cover and strap geometry are illustrative; the precise cover material and recipe are not confirmed. The sticker sits on the cartridge's z=6 face, as confirmed by the prototype maker. A shared cartridge group carries the sticker and layers along the grip direction before opening the layer stack. Reassembly closes the layers before inserting the cartridge. Removal distance and exploded layer spacing are illustrative. Reduced-motion mode changes directly to the requested stage.

The user identified the Arduino Uno on the wired right-hand side, the white DHT11 beside it, the dark H₂S sensor board, the rear two-channel relay, and the yellow-labelled power supply. Hotspots 5, 6, 7, 8 and 9 identify these respectively. Both rear TEC1-12706 modules use hotspot 2. Selecting a component opens the relevant photograph. The supplied Arduino close-up is copied byte-for-byte. Chamber photos retain their full aspect ratio so hotspot positions stay tied to the original image.

The supplied `WhatsApp Image 2026-10-02 at 2.49.54 AM.jpeg` is retained privately in `source-assets/supplemental/`. With the user's approval, `scripts/redact-controller.ps1` creates `dist/assets/chamber-logger.png` with six opaque masks over local paths and serial-port identifiers. Readings and status labels remain untouched. The script checks the original 1257 × 944 dimensions before applying the masks. The controller view supports enlargement and explicitly labels its displayed ppm unvalidated.

Current chemistry is AgNP–PVA. The wearable is passive. The intended output is cumulative exposure at the badge in ppm·h. Reference exclusion, numerical calibration, selectivity, shelf life and field performance are unvalidated. There is no trained or independently validated patch-colour predictor.

B1–B5 metadata comes from the team report. B5 has two before photographs and one after photograph without established per-patch mapping. Photographs are copied without colour processing. Screenshot demo numbers, model constants and safety bands are labelled provisional examples. The selected controller recording is not linked to the pictured trials.

The phone-reader section links to the team's live [H₂S Dose Reader](https://avaran-h2s-reader.netlify.app/) and previews its Dashboard, Scan, Records and Setup screens with the supplied screenshots. A separate demo-result screenshot is labelled provisional. The exhibit does not embed the reader, submit data to it, or treat its example dose values and safety bands as validated measurements or certified decisions.

The sanitized replay retains every row from `H2S_2026-09-30_15-36-18-703.csv`: 1,781 rows, 186 numeric ppm estimates, and 3,603.521 seconds. Empty values remain null. Charts break at missing values; out-of-range estimates are never made into zeros. No full-session dose is calculated. Serial-port, raw log line and baseline identity columns are excluded from the browser data.

## Accessibility and fallback

All component callouts are keyboard-accessible buttons. Dragging turns the model freely, including its underside, and the chosen angle is retained until Reset view. Right-drag or Shift-drag pans. Ctrl + wheel zooms; ordinary wheel scrolling transforms the prototype into the DNA motif. On phones, the central interaction area supports rotation and two-finger pan/pinch; the side margins remain available for page scrolling. Focus the model interaction area to use arrow keys for rotation, Shift + arrows for pan, and plus/minus for zoom. The cartridge opens automatically on entry. Remove/insert, open/close layers and Reset view are the only three model controls. Reduced motion skips the opening animation and uses a direct transition between model and helix.

The operation video is displayed immediately with its poster, native controls and a visible Play video button. The ppm card rounds numeric source estimates to one decimal, with the exact CSV value available in the accompanying explanation. Missing estimates show “Unavailable” and the recorded reason beside the card. The “Show first recorded ppm estimate” button pauses replay, seeks to the first numeric source row, and selects the ppm trace. No missing estimate is fabricated or replaced with zero.

The old arrow and Top/Bottom view buttons have been removed. Reset restores the original camera orientation and framing while keeping the assembly state. Callout dots are projected from the actual component transforms, with dashed leaders and staggered label reveals. A graphics failure displays the original prototype photograph and keeps component descriptions accessible.

If WebGL or geometry loading fails, the original prototype photo and all component descriptions remain available. `?graphics=off` explicitly exercises the same photo-mode path for review. Image enlargement uses a native modal dialog; the guided tour is dismissible and has no forced timer.

The judge tour now recommends itself through a welcome dialog on the first page open in each tab session. Starting, skipping or dismissing remembers that choice in session storage, so reloads do not repeatedly interrupt the visitor. The header always allows restarting the tour. If storage is unavailable, the invitation still works.

`dist/tour.js` and `dist/tour.css` provide six guided chapters with progress, chapter navigation, optional demonstrations and a minimizable guide. The tour sets up the original CAD, B5 photos, laboratory view, first numeric recorded sample, phone workflow and validation summary. Desktop reserves space for the guide; phones use a compact bottom panel with persistent Previous/Next controls. Recording playback pauses on chapter changes or exit. Visitors advance at their own pace; there is no automatic media playback or forced progression.

## Delivery and publication

Only serve or upload `dist/`. It contains no executables, shortcuts, raw logs, private records or original development documents. It can be hosted as an ordinary static site. All local assets use relative URLs. Support correct JavaScript MIME types and HTTP range requests for video.

This version is a local preview; it has not been registered or published to an external host. Confirm the hosting provider, public access and public team details before publication. Judge access should be tested without an account when a public URL is approved.
