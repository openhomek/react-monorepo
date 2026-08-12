# Two-step login design QA

## Sources and capture normalization

- Visual reference: `/var/folders/9b/92v5b0w967542hkcr73_3kch0000gp/T/codex-clipboard-83820776-cb31-4b79-8f3d-9a5aa33cb49e.png`
- Implementation: `http://127.0.0.1:5175/login`
- Step-one implementation screenshot: `/private/tmp/jikeyuan-login-step1-1928x963.png`
- Step-two implementation screenshot: `/private/tmp/jikeyuan-login-step2-1928x963.png`
- Mobile step-two screenshot: `/private/tmp/jikeyuan-login-step2-mobile-390x844.png`
- Full-view comparison: `/private/tmp/jikeyuan-login-comparison-v1.png`
- Focused card comparison: `/private/tmp/jikeyuan-login-card-comparison-v1.png`
- Source and desktop implementation: 1928×963 pixels, 1928×963 CSS viewport, density 1. No density normalization was required.

## State and intentional adaptations

The source shows the identifier step of a centered desktop login card. The implementation was compared in the same anonymous, identifier-entry state. Product decisions intentionally adapt the source as follows:

- The supplied project `logo.svg` replaces the Binance wordmark.
- The card stays horizontally and vertically centered as requested.
- Login is a two-step credential flow: email first, password second; it is not two-factor authentication.
- The QR affordance, passkey and third-party providers are omitted because those login methods do not have working backend integrations.
- The step counter communicates progress, while registration remains a separate link below the card instead of a tab.

## Fidelity review

- **Fonts and typography:** the existing Inter/CJK system stack, 32px semibold heading, compact labels and restrained secondary copy reproduce the reference hierarchy without importing a product-inappropriate brand typeface.
- **Spacing and layout rhythm:** the desktop card is 424px wide, matching the reference card width. The 20px radius, 40px desktop padding, 56px inputs/CTAs and centered composition preserve its density. Step one is intentionally shorter because unavailable provider rows are removed.
- **Colors and tokens:** pure white canvas, `#222222` text, light gray borders and the existing `#ff385c` product accent replace the source brand yellow consistently.
- **Image quality and assets:** the only visible non-standard asset is the supplied vector project logo; field and visibility icons use the existing project asset set without placeholders or code-drawn substitutes.
- **Copy and content:** localized Traditional Chinese copy clearly names email, password, change-email, remember-me, registration and progress actions.

No actionable P0/P1/P2 mismatch remains. The focused comparison confirmed the card border, radius, form control sizing and primary hierarchy. The removed source rows are explicit product decisions, not missing visual content.

## Responsive and interaction evidence

| Viewport | State | Page scroll size | Result |
| --- | --- | --- | --- |
| 1928×963 | Step 1 | 1928×963 | Centered 424px card; no overflow |
| 1928×963 | Step 2 | 1928×963 | Complete password state visible; no overflow |
| 1366×768 | Step 2 | 1366×768 | Complete card and registration link visible; no overflow |
| 390×844 | Step 1 | 390×844 | 358px mobile card; no overflow |
| 390×844 | Step 2 | 390×844 | Complete password state visible; no overflow |

- Empty email and password submissions show localized field errors.
- A valid email advances without calling an account-existence endpoint.
- Changing or returning to the email step preserves the normalized email and remember-me choice while clearing the password.
- Password visibility changes the field type from `password` to `text`.
- The second step submits email, password and remember-me together through the existing Redux login action.
- Successful mock login stores the Access Token in module memory, updates Redux user/session state and navigates to authenticated home.
- Browser console: no warnings or errors during the tested path.

## Comparison history

- Initial comparison found no P0/P1/P2 issues. The narrower first-step card height is expected after removing the unavailable provider methods, and the centered placement follows the explicit user decision.

final result: passed
