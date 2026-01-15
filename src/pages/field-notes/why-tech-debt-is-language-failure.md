---
layout: ../../layouts/MarkdownLayout.astro
title: Why Tech Debt is a Language Failure
date: 2026-01-13
---

# Why Tech Debt is a Language Failure

*2026-01-13* · Tags: `semantic` `engineering` `product` · 🪑 armchair

"Ship fast and break things" may paint a superficial picture of antagonism between product velocity and engineering fastidiousness, but it betrays a deeper conundrum, one which takes root in the fact that a feature is _conceptualized_ differently across a cross-functional team.

Consider the directive to quickly spin up a web checkout feature for an equipment store, and it doesn't have to be perfect---the plan is to iterate upon it over time. The priority seems straightforward: focus on building the core functionalities of this new feature. But what does "core functionalities" entail? From a product perspective, the key deliverables of this feature is captured in the user flow: review cart, submit payment details, receive confirmation. From an engineering perspective however, payment reconciliation is undoubtedly the cornerstone of this feature, as a double-counted or omitted transaction results in corrupted database that will take time to comb through and potential loss, whereas glitches in the cart review or

Both are describing the same feature, and share the same priority to get it up and running as soon as possible, yet what constitutes "core functionalities" versus "allowed to break" is a fuzzy line mired with unspoken intuitions. Product conceptualizes the feature as it appears to the user ("what it does"), and UX may impact user retention, whereas engineering conceptualizes the feature as a of primitives working in ("how it works"), and plan around . Up until a feature is completed to its full spec, then a state of _semantic misalignment_ around the terminologies used to communicate the factors that impact timely delivery.

The priority is the same: get the _Semantic misalignment_ (payment as checkout flow vs payment as ). Luckily, there exists a class of AI exceptionally suited to bridging incommensurable vocabularies: large language models. Trained on text spanning user-facing documentation to low-level implementation details, LLMs can serve as an approximate Lagrangian—translating product requirements into engineering implications and vice versa, surfacing hidden assumptions before they calcify into misalignment.

This semantic misalignment problem underpins the industry miscordination.

## Market Implications

web3 users never signed up for wallets with security vulnerabilities, nor Uber drivers for their earning potential to be controlled by a black-box algorithm. Instead, they signed up for "take control of your own funds" and "be your own boss as an Uber driver". The use of embellished language is excusable, and at times even necessary as initial wedge into a market, yet to conflate the market demand for _what was promised_ ("what it does") with _what was delivered_ ("how it works") is dangerous for the long-term prospects of both the company and the economy, as we witnessed in the FTX incident which locked up enterprise funds would show.

This .. pharmaceutical industry, where the , inhibition of neuroreceptors etc. This creates a distinct caused by semantic gap.

At first glance this may seem : whatever the market wants, it will signal through willingness to pay. Yet a closer peak reveals the semantic gap ---

More broadly however, as we have identified with the custodial wallet example above, the semantic problem that product and engineering team contends on a week-to-week basis within a company ultimately results in between the market and technology at large.

[insert graph that contrasts good vs bad feedback flow, the build-up of "alignment debt" due to pressure to deliver]

**Connected thoughts:**
- [Does Technology Create a Freer Society?](/portfolio-site/field-notes/does-technology-create-freer-society)
- [Commitment Negotiation Stack](/portfolio-site/field-notes/commitment-negotiation-stack)
- [Growth Pressure and Technical Debt](/portfolio-site/field-notes/growth-pressure-technical-debt)

**Theoretical grounding:**
- Semantic alignment as upstream coordination
- LLMs as vocabulary bridges
- Market failure through engineering miscommunication

---
*Draft notes on the semantic gap between product and engineering. Incomplete — needs further development.*
