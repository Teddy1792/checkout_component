# Book of the Month checkout

A responsive React + TypeScript checkout page styled with Tailwind. The app fetches its initial member, address, and three-book order from `public/data/checkout.json`, then submits the selected IDs to `POST /api/checkout`.

## Run it

```bash
npm install
npm run dev
```

The Vite development and preview servers include a small mock checkout handler, so the success flow works locally without another service.

```bash
npm test
npm run build
npm run preview
```

## Assumptions and trade-offs

- Prices are stored as integer cents to avoid floating-point total errors. The member pick is `$17.99`; add-ons are `$11.99`; shipping is free.
- The mock models a US saved address, so the editor validates a two-letter state and ZIP/ZIP+4. A production international checkout would use country-aware fields and validation.
- The API contract only asks for `bookIds`, so edited address data stays client-side in this exercise. A real implementation would save the address to a dedicated authenticated endpoint before checkout.
- The in-Vite endpoint is intentionally a development mock, not a production authentication or payment service.

## Edge cases and security

- The UI handles initial-data failure, malformed JSON, non-JSON API responses, API errors, timeouts, double submits, empty boxes, and invalid selections outside the 1–4 range.
- Fetched JSON and API success payloads are runtime-validated rather than trusted after a TypeScript cast.
- Address fields are length-limited, normalized, validated, and rendered only through React text nodes—there is no raw HTML rendering.
- The mock API accepts JSON POST requests only, caps request bodies at 16 KB, allowlists known unique book IDs, and returns generic parsing errors.
- Requests use same-origin credentials. A production service must additionally enforce authenticated sessions, CSRF protections, authorization, rate limiting, server-side pricing, and idempotency keys.
- The included CSP limits scripts, images, and network calls to the same origin. Local cover assets avoid third-party image tracking and broken-image dependencies.
