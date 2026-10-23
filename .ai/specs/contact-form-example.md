# Contact form with Sanity-managed copy

> **Status (template):** Intended. A worked example of the spec format. Nothing is built; copy and adapt it, then replace this header with the real date and state.

## Goal

A visitor sends a message through a form. Editors manage the heading, helper text, field labels and success message in Sanity without a deploy.

## Source of truth

| Data | Owner | Where the code reads it |
| --- | --- | --- |
| Form copy (heading, labels, success text) | Sanity, `contactForm` singleton | `services/content/` |
| Submitted message | The delivery system you choose (email or inbox provider) | `services/contact/`, server only |
| Validation rules | This app (Zod schema) | `domain/contact/` |

## Behaviour

1. The page renders server-side with copy from Sanity.
2. The visitor submits. A Server Action validates the input with Zod.
3. The action checks the rate limit, then calls `services/contact/` to deliver the message.
4. The action returns a typed result. The form shows the success copy or a field-level error.

## Invariants

* Validation runs on the server. Client checks are convenience only.
* The delivery credential is server-only and never has a `NEXT_PUBLIC_` prefix.
* CMS copy renders as text or through the Portable Text renderer, never `dangerouslySetInnerHTML`.
* The action is idempotent per submission token, backed by a store with a uniqueness guarantee, so a retry never sends twice.
* Submitted values are never logged.

## Failure scenarios

| Failure | Behaviour |
| --- | --- |
| Validation fails | Field-level errors, nothing sent |
| Delivery times out | Treated as unknown, not failed. No blind retry. Show a neutral message and keep the submission token |
| Delivery system down | Generic error, no stack trace, logged without personal data |
| Rate limit hit | Return a clear retry-later message |
| Sanity copy missing | Fall back to default copy in code, log a warning |

## Security

* Zod at the boundary, with length limits and an allowlist of fields.
* Rate limiting and a honeypot or equivalent bot control.
* Strip header-injection characters before building any email headers.
* Do not echo user input into the response unescaped.

## Accessibility

* Every input has a visible `<label>`. Errors are tied to inputs with `aria-describedby`.
* The error summary and success message are announced (`role="alert"` or a live region) and focus moves sensibly.
* Fully keyboard operable, visible focus, contrast AA in both themes.

## Acceptance criteria

- [ ] Editors change the copy in Studio and the page reflects it after revalidation.
- [ ] Invalid input shows accessible errors and sends nothing.
- [ ] A double submit sends one message.
- [ ] A delivery timeout does not trigger an automatic retry.
- [ ] Unit tests cover the schema, the action and the service failure paths. One E2E spec covers the happy path.

## Out of scope

File attachments, CRM sync, multi-step forms.
