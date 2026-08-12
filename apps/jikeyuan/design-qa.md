# Three-step registration design QA

## Sources

- Latest registration reference: `/var/folders/9b/92v5b0w967542hkcr73_3kch0000gp/T/codex-clipboard-94778f3b-8cc2-421b-977c-968dd97c4a1b.png`
- Supplied illustration assets: `/Users/Admin/Downloads/gangban-svg-assets 2/`
- Required project wordmark: `src/assets/logo.svg`
- Implementation: `http://127.0.0.1:5175/register`

## Visual comparison

The reference and the anonymous step-one implementation were captured at the same 1487×1058 viewport and combined in `/private/tmp/jikeyuan-register-comparison-final.png`.

- The card matches the reference at x=820, y=205 and 480px wide.
- The desktop composition uses the same two-column hierarchy, copy, supplied community illustration, security reassurance, control radii and restrained red accent.
- The project `logo.svg` intentionally replaces the word-only reference mark, as explicitly required by the product owner.
- The step counter is an intentional addition that makes the requested email → code → password sequence visible and predictable.
- Google and Apple controls are visibly disabled until provider credentials and callback endpoints exist; they are not presented as working actions.

## Responsive evidence

| Viewport | State | Page scroll size | Result |
| --- | --- | --- | --- |
| 1487×1058 | Step 1 | 1487×1058 | Reference-aligned two-column composition |
| 1366×768 | Step 1 | 1366×768 | Complete card and login entry visible; no scroll |
| 1366×768 | Step 3 | 1366×768 | Password completion state visible; no scroll |
| 744×768 | Step 1 | 744×768 | Centered single-column card; no scroll |
| 744×768 | Steps 2 and 3 | 744×768 | Code and password states visible; no scroll |
| 390×844 | Step 1 | 390×844 | Mobile card and login entry visible; no scroll |
| 390×844 | Steps 2 and 3 | 390×844 | Code and password states visible; no scroll |
| 390×844 | Code/password errors | 390×844 | Expanded localized errors visible; no scroll |

The decorative hero yields to the form below 1024px. Short desktop and tablet viewports reduce only non-interactive spacing; fields keep their touch-friendly height and primary actions remain at least 48px tall.

## Interaction evidence

- Empty step-one submission shows localized email and consent errors.
- A valid email advances to the six-digit verification-code step.
- An invalid code returns a localized error while preserving the entered email.
- Send-code and verify-code failures use step-specific messages; an invalid email is not misreported as a bad code.
- A valid code returns an in-memory registration credential and advances to password creation.
- Password mismatch is rejected, and the visibility control switches the input type from `password` to `text`.
- Successful final registration stores the short-lived Access Token only in module memory, updates the Redux user/session state, and navigates to authenticated home.
- Refresh-token behavior remains cookie-based through credentialed requests; cookie flags are owned by the backend response.
- Logout returns the app to anonymous state.
- Browser console: no warnings or errors during the tested path.

final result: passed
