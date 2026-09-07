# Paul Brooks — Portfolio

A static portfolio with a real-time sculptural chrome-and-glass hero, an editorial project gallery, and accessible project detail dialogs. The existing GitHub Pages workflow deploys the repository without a build step.

## Source

- `index.html` — portfolio content, navigation, gallery, experience, toolkit, résumé, and contact links.
- `cinematic.css` — responsive layout, typography, reduced-motion and print styles.
- `portfolio.js` — navigation, scroll progress, four project dialogs, and focus restoration.
- `rendering.js` — procedural sculpture, HDR reflection environment, physical chrome and glass materials, planar reflection, soft shadows, pointer controls, and rendering lifecycle.
- `assets/` — locally hosted Three.js **0.180.0** modules and Reflector (MIT; license included), artwork, and favicon.

Open `index.html` directly from disk or serve the repository with any static HTTP server. The page loads `assets/sculpture.bundle.js`, a classic self-contained script that works with both `file://` and HTTP. Keep the assets folder next to index.html. Google Fonts is the only external presentation dependency; system fonts are used when offline. No server, API key, package install, or build step is needed to view the page.

When editing rendering.js or its Three.js dependencies, run `npm ci` once and then `npm run build` to regenerate the checked-in bundle. The GitHub Pages deployment continues to serve the prepared files directly.

## Rendering behavior

The sculpture uses a continuous surface with 720 longitudinal and 64 radial segments. Chrome and Glass buttons switch real physical materials; the glass uses transmission, thickness, attenuation, and dispersion. A generated HDR studio environment supplies reflections. High detail includes a blurred planar reflection and shadow maps. Light detail lowers pixel density and disables the reflected floor and shadows.

Idle rotation completes one revolution per minute. It stops while the pointer is held and resumes after a short handoff delay; pausing preserves the current orientation. Rendering stops when the sculpture is offscreen or the page is hidden. Reduced-motion preferences start the sculpture paused. Pointer dragging and the keyboard-accessible Rotate button still work while paused. Without WebGL2 or the rendering module, static fallback artwork and all portfolio content remain available.

The gallery artwork is conceptual, not a product screenshot. Original PNGs are retained; the page loads optimized WebP copies (~142–147 KB each). See `ART-DIRECTION.md` for asset provenance and generation prompts.

## Verification

Browser checks cover six viewport widths (320–1440 px), Chrome/Glass visual changes, rotation, detail switching, reduced-motion stability, all four project dialogs, Escape and focus restoration, mobile navigation, anchor targets, artwork loading, missing-module fallback, unavailable-WebGL fallback, and console errors. Browser verification scripts and screenshots are local in ignored `.preview/`.

Changes are local until committed and deployed through the existing GitHub Pages workflow.


The finishing pass includes active section navigation, project-dialog artwork and next-project controls, larger readable text, a native résumé disclosure, résumé-only print styling, and explicit contact actions. Résumé links expand the disclosure before navigation. All enhancements preserve direct file:// support.

A brief branded loading screen appears on every load and refresh. It fades after the first 3D frame (with a 550 ms minimum) and releases after 2.2 seconds even if scripts fail. Reduced motion removes its animation and minimum delay; with JavaScript disabled it stays hidden. Any keyboard input dismisses it immediately.
