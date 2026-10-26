# TasteBridge Qloo hackathon integration — scaffold, not a submission

Status: **server-only adapter and mocked offline tests on an isolated branch; live Qloo key and calls NOT verified, DRIP UI NOT yet connected.** Do not describe the integration as completed or eligible until genuine sponsor API calls and a user-facing journey work.

Official developer guide: https://docs.qloo.com/reference/qloo-llm-hackathon-developer-guide

1. Request a personal hackathon Qloo API key from the guide's linked form. Keys can take several business days. Store as server-only `QLOO_API_KEY` in Vercel; never publish or use a client-side `VITE_` prefix.
2. The hackathon host is `https://hackathon.api.qloo.com`, NOT production or staging. Insights are `GET /v2/insights` with header `X-Api-Key` and documented `filter.type` and `signal.interests.entities` query parameters. Legacy `/recommendations` is unsupported.
3. New `/api/qloo-taste?seed=<QLOO_ENTITY_ID>&type=urn:entity:brand` is a contract scaffold only. The seed must be a genuine Qloo entity ID from `/search` (not a free-text shoe name). It returns up to twelve suggestions and never reports a stock or price guarantee.
4. Execute `node --test tests/qloo-taste.test.mjs` without a network connection or key. These are **mocked tests**, not a real provider acceptance test.
5. TODO: secure Qloo key, entity search adapter, Qloo response contract confirmation, meaningful integration with the current DRIP stylist, frontend user flow, comparison against existing DRIP ranking, truthful ablation results, screenshot/UX/accessibility tests, public open-source license and Devpost submission.

New/Existing: DRIP pre-existed the Qloo hackathon. Rules allow existing agents **if Qloo is meaningfully integrated after Sept 30, 2026**; mark all existing capabilities and later work honestly.

The official Qloo rubric weights implementation, design, impact and originality equally. No judge simulation or test can prove a contest win.
