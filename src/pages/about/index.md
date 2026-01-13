---
layout: ../../layouts/MarkdownLayout.astro
---

# About

> "A problem well put is half-solved."
> — John Dewey

> "The limits of my language mean the limits of my world."
> — Ludwig Wittgenstein

The problem-solving aspect of software engineering has always been the most exciting part for me. How can a series of function calls be pieced together to solve a business problem? To me, the reward is in the challenge itself: bridging two different worlds, that of the formulaic software codes and the open-ended realm of commerce.

Before I immigrated to this country, I was drawn to its noble founding story. Thomas Jefferson envisioned a virtuous republic where domestic technologies help empower the yeoman farmers in earning a living for themselves. As I immersed myself in the tech startup scene over the past four years, I saw how this vision matured seamlessly into the digital age, inspiring founders to experiment with innovative ideas in finance and healthcare that democratize access to essential services.

Yet I also experienced first-hand the challenge that comes with applying clunky new technologies to solve varied human problems. Often, the technical overhead became an unforgiving filter on the type of problems being solved, as startups facing existential pressure to achieve scalable growth fast had to make engineering choices that inevitably restrict their future product roadmap.

Making informed tradeoffs is the name of the game in the startup world, and founders rightly put revenue expansion as their top priority. Yet the role that successive engineering decisions play in shaping the overall product trajectory is often overlooked: one feature roadmap may be temporarily chosen over another with larger market potential due to lower initial lift, yet, the risk/reward calculus of making the switch becomes increasingly out of reach as internal infrastructure and services all crystallize around the wedge use case. Any change now would mean sacrificing valuable velocity.

In the web3 space, the difficulty of working with non-custodial wallets — a core value proposition of blockchain — resulted in the saturation of the space with "shallow" web3 consumer apps that leverage custodial (centralized or managed) wallets behind the scenes, no different from traditional financial infrastructure that it sought to replace. This has resulted in ecosystem-wide security vulnerabilities—with over $2.3 billion lost to hacks and exploits in 2024 alone, a 31.6% increase from the previous year[1]—despite heavy VC investment in secure web3 infrastructure solutions.

This is market failure in action: the free market failing to coordinate in the rollout of a new technology, leaving market opportunities on the table. The macro-issue of market failure takes root in the micro-issue of engineering forecasting, since decisions made in high-pressure environments means that consequential implications get missed in lieu of more tangible cost/benefits. The solution thus requires that the two disparate domains of expertise come together upstream: that the _business_ and timeline costs of _engineering_ decisions be clearly articulated at the time when they are made.

With my private consultation work, I help startups stay on track with their product vision and prevent rework by assisting in technical design discussions and managing parallel development tracks. In _Why Tech Debt is a Language Failure_, I go over how this is fundamentally a language problem, not a tension of incentives. "Ship fast and break things" may paint a superficial picture of antagonism between product velocity and engineering fastidiousness, but it betrays a deeper conundrum, one which takes root in the fact that a feature is _conceptualized_ differently across a cross-functional team.

Consider the directive to quickly spin up a web checkout feature for an equipment store, and it doesn't have to be perfect---the plan is to iterate upon it over time. The priority seems straightforward: focus on building the core functionalities of this new feature. But what does "core functionalities" entail? From a product perspective, the key deliverables of this feature is captured in the user flow: review cart, submit payment details, receive confirmation. From an engineering perspective however, payment reconciliation is undoubtedly the cornerstone of this feature, as a double-counted or omitted transaction results in corrupted database that will take time to comb through and potential loss, whereas glitches in the cart review or

Both are describing the same feature, and share the same priority to get it up and running as soon as possible, yet what constitutes "core functionalities" versus "allowed to break" is a fuzzy line mired with unspoken intuitions. Product conceptualizes the feature as it appears to the user ("what it does"), and UX may impact user retention, whereas engineering conceptualizes the feature as a of primitives working in ("how it works"), and plan around . Up until a feature is completed to its full spec, then a state of _semantic misalignment_ around the terminologies used to communicate the factors that impact timely delivery.

The priority is the same: get the _Semantic misalignment_ (payment as checkout flow vs payment as ). Luckily, there exists a class of AI exceptionally suited to bridging incommensurable vocabularies: large language models. Trained on text spanning user-facing documentation to low-level implementation details, LLMs can serve as an approximate Lagrangian—translating product requirements into engineering implications and vice versa, surfacing hidden assumptions before they calcify into misalignment.

This semantic misalignment problem underpins the industry misccordination.

web3 users never signed up for wallets with security vulnerabilities, nor Uber drivers for their earning potential to be controlled by a black-box algorithm. Instead, they signed up for "take control of your own funds" and "be your own boss as an Uber driver". The use of embellished language is excusable, and at times even necessary as initial wedge into a market, yet to conflate the market demand for _what was promised_ ("what it does") with _what was delivered_ ("how it works") is dangerous for the long-term prospects of both the company and the economy, as we witnessed in the FTX incident which locked up enterprise funds would show.

This .. pharmaceutical industry, where the , inhibition of neuroreceptors etc. This creates a distinct caused by semantic gap.

At first glance this may seem : whatever the market wants, it will signal through willingness to pay. Yet a closer peak reveals the semantic gap ---

More broadly however, as we have identified with the custodial wallet example above, the semantic problem that product and engineering team contends on a week-to-week basis within a company ultimately results in between the market and technology at large.

[insert graph that contrasts good vs bad feedback flow, the build-up of "alignment debt" due to pressure to deliver]

While FTX was a particularly egregious example of a company optimizing for growth over fidelity, the more pernicious is the _unintentional_ of the contract between consenting parties. In _Does Technology Create a Freer Society?_ I explore how the increasing of reliance on ill-defined metric and terminologies (e.g. "creditworthiness", "service rating") to justify the assortment users on platforms gives these platforms undue leverage over the lives of their users. In the words of Schrepel,

Semantic capture due to context obfuscastion, rendering free market unsuitable for economic freedom.

The Uber example is not unique, and the fact that the company controls the very language of the exchange signals the emergent of a new form of economic soft power that has normative implications where the definition of each term favors the platform, displacing previously ad-hoc mutual understanding between human beings. A "surge cost" may have implied a mutual agreement to shift the burden of extra gas between a taxi driver and his passenger during heavy traffic, open for negotiation, but becomes a license for opaque rent-seeking behaviors in the context of a platform:

1. its drivers gave explicit consent to these pricing mechanisms without the possibility of understanding the intricacies of the algorithm that they are now staking their income source on, and
2. even if they did, they would have no meaningful recourse, since the overwhelmingly pro-consumer , an arrangement that simply .. to adopt platform terminology to remain competitive, as in the case of "ride-hailing service".

While platform economics becomes a , the distinction between consumers and laborers become increasingly blurred. One may bene --- is consumer choice actually a good proxy for economic freedom in the information age?

_systems should preserve agency; incentives shouldn’t hide behind ambiguity_

an economy of obfuscation.

The repressentationalist framework of economics, cannot easily account for the feasibility space engineering that combines black-box algorithms and vague language to manufacture consent. In my essays and field notes, I explore the potential of applying Robert Brandom's inferentialist framework of language, built upon both the analytic and pragmatist traditions to critique these asymmetric semantic arrangements.

The structural and semantic alignment gap between platforms and their participants is widening. Whether it is the pressure to expand market share or the pressure to satisfy investors, the drive to penetrate every vertical of the economy means that this will soon be adding ever greater gulf between consumer choice and economic freedom. Through the intersection of engineering, economics and linguistics, a new critical vocabulary of the information age, I hope to recover Jefferson's vision of technology of empowering the little ones.

engineering must be correct, auditable, and aligned with what’s promised to users..

## Contact {#contact}

Email: kuanjh123@gmail.com  
Substack: [Bicameral](https://substack.com)

For upstream consulting inquiries, see [Practice](/portfolio-site/practice).

## References

[1] CertiK. "Hack3d: The Web3 Security Report 2024." CertiK, 2024. https://www.certik.com/resources/blog/hack3d-the-web3-security-report-2024
