# Authentication UI design QA

## Sources

- Structural reference: `/var/folders/9b/92v5b0w967542hkcr73_3kch0000gp/T/codex-clipboard-1001f476-cc8e-4c7f-a118-d9a70dc234a0.png`
- Supplied asset set: `/Users/Admin/Downloads/gangban-svg-assets 2/`
- Design system: `/Users/Admin/.codex/attachments/c0916d53-ebe5-4ce7-8a3d-a41647e9fee3/pasted-text.txt`
- Implementation: `http://127.0.0.1:5175/login` and `http://127.0.0.1:5175/register`

## Visual comparison

The reference and implementation were captured in the same anonymous login state at 1487×1058 and placed side by side in `/private/tmp/jikeyuan-auth-final-comparison.png`.

- Preserved from the reference: two-column information hierarchy, project logo placement, navigation, hero copy, supplied community illustration, login/register switcher, field iconography, social login actions, account prompt and security reassurance.
- Applied from `design.md`: 1200px centered content width, pure-white canvas, `#222222` ink, `#ff385c` as the only accent, restrained type weights, 56px text fields, 48px CTAs, 8px control radii and flat surfaces.
- Intentional difference: the implementation is visually denser than the reference so the complete authentication journey remains visible on common laptop-height screens.

## Responsive evidence

| Viewport | Route | Page scroll size | Result |
| --- | --- | --- | --- |
| 1487×1058 | Login | 1487×1058 | Full composition visible |
| 1366×768 | Login | 1366×768 | Full composition visible; no scroll |
| 1366×768 | Register | 1366×768 | Full composition visible; no scroll |
| 1024×768 | Login | 1024×768 | Single-column form; no overflow |
| 390×844 | Login | 390×844 | Mobile form visible in one viewport |
| 390×844 | Register | 390×844 | Mobile form visible in one viewport |

At widths below 1128px, the decorative hero is removed and the form becomes the primary centered surface. At desktop widths with heights at or below 800px, navigation, copy, illustration, fields and vertical gaps compact together.

## Interaction evidence

- Login and register tabs navigate without a full-page reload.
- Mobile navigation opens a shadcn Sheet with the three product links and a return-home action.
- Empty login submission shows both localized validation errors.
- Password visibility toggles the field type from `password` to `text`.
- Remember-me is submitted with the credentials so the backend can choose a session or persistent Refresh Token Cookie lifetime without persisting the Access Token.
- Valid mock login and registration both navigate to the authenticated home route.
- Logout clears the authenticated UI state.
- Short-screen register controls retain 56px fields and 48px minimum action targets.
- Browser console: no warnings or errors during the tested flows.

final result: passed
