# NAVIAR CARE 2 — static edition handoff 7.0

Date: 5 September 2026. Project: NAVIAR-CARE-002. Repository: BETA-ART (`naviar/care2-src/`).

## Completed scope

The v6 source delivery (generators, content, catalogue, schema, checks, design records) was placed in the BETA-ART repository byte-for-byte and archived with numbered records (`docs/naviar/care2-teslim/00_ARSIV-DIZINI.md`, NC2-ARS-001…). Files missing from the delivery package were rebuilt in a separate `public/` layer: `styles.css`, `model.js`, `site.js`, `operations.js`, `studio-demo/` (recovered from the archived single-file Studio Demo, with `sample-calendar.js` providing the next three Oslo days), and the original logo and AI illustration extracted from that same archive file. `build_static.py` runs the original generators and adds the layer.

The public static site is published on Vercel (`naviarcare`, https://naviarcare.vercel.app). Booking, email drafts, payment simulation, ICS export and the measurement preference run in the visitor's browser; no server, account or provider is involved. The original private site and its Worker/D1 backend are unchanged.

## Validation

- `checks/static.py`: PASS — 27 localized pages + 9 compatibility/error pages, local routes, assets, anchors, IDs, privacy copy, demo labels, script order, studio-demo anchors and calendar note.
- `checks/catalog-model.cjs`: PASS — 42 profiles, 113 language joins, 12 known differences, filters, journey state, Oslo grouping.
- `checks/sample-calendar.test.mjs`: PASS — Oslo midnight, year rollover, both DST transitions.
- Browser drive (`run-care2-src` skill, Chromium): 54 checks PASS, including the full booking and studio-demo flows in Turkish and Norwegian, mobile menu and 390 px overflow.
- `checks/operations.test.mjs` is not runnable here: it imports `server/operations.mjs`, which is not part of the delivery.

No real email, charge, consultation, screen-reader, physical-device or penetration test was performed. This release does not certify accessibility, medical safety or legal compliance.

## Differences from the original edition

Reservations are per browser, not per verified user; slots are generated on each visit instead of being seeded by the owner; `/insights/` shows a local summary only; email is draft-only; payment is simulation-only; consent is a stored preference without a measurement service. See CONCEPT-v7-tr.md §20.

## Remaining operational dependencies

Unchanged from v6 §16: verified healthcare provider and clinical lead, clinician and interpreter capacity, scope and jurisdiction, real prices and terms, identity/video/records systems, privacy roles and supplier agreements, retention and restore drills, user and accessibility testing, provider sandbox evidence. Additionally: connecting naviarcare.com to the Vercel project, and legal clearance of the mark.
