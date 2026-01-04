---
title: When Standups Become Scorekeeping
relatedNotes:
  - title: When Metrics Become the Territory
    url: /portfolio-site/field-notes/metrics-become-territory
  - title: Where Accountability Dissolves in the Stack
    url: /portfolio-site/field-notes/accountability-dissolves-upstream
  - title: Agile vs Waterfall as Commitment Strategies
    url: /portfolio-site/field-notes/agile-waterfall-commitment-strategies
relatedThreads:
  - title: The participatory nature of technical reality
    url: /portfolio-site/threads/techno-economic-constraint
---

# When Standups Become Scorekeeping: Reframing Tech Teams Through Brandom

*2026-01-04* · Tags: `organizational` `technological` `philosophical` · 🪑 armchair

Reading Brandom while sitting in sprint planning. The PM says "we're committed to shipping this feature." The engineer responds "that commits us to upgrading the database." The designer adds "which means we're committed to a migration UI." 

Suddenly I can't unsee it: this isn't resource allocation. It's deontic scorekeeping.

Every feature request is a proposal to alter the team's inferential commitments. When the business commits to a capability, they're not just setting a goal—they're entering a web of normative statuses that cascade through the entire stack. The engineer who points out technical prerequisites isn't being obstructionist; they're tracking the inferential consequences of the proposed commitment.

Watch the negotiation:
- Business: "We need real-time updates" (proposed commitment)
- Backend: "That entitles us to websocket infrastructure" (inferential consequence)
- Frontend: "Which commits us to state management refactor" (further consequence)
- DevOps: "Therefore we're committed to different scaling patterns" (yet further)

This isn't a causal chain—it's an inferential one. The commitments don't cause the consequences; they normatively entail them. Breaking these chains doesn't make the feature impossible, it makes it *improper* in Brandom's sense.

**The real insight**: Technical debt isn't failed execution. It's violated inferential propriety. When we ship the feature without the monitoring it inferentially requires, we're not just taking a shortcut—we're undermining the normative coherence of our technical practices.

MVP culture systematically violates these inferential commitments. "Just ship it" means "ignore what this commits us to." But those commitments don't disappear—they accumulate as unacknowledged normative debt that makes future reasoning harder.

**What I'm watching for**:
- How different org structures create different scorekeeping practices
- Whether making inferential chains explicit (through ADRs?) reduces conflict
- The gap between acknowledged and unacknowledged commitments

**Theoretical grounding**:
- Brandom's deontic scorekeeping from "Making It Explicit"
- His distinction between causal and inferential consequence
- The social articulation of reasoning

**Connected thoughts**:
- [How metrics redefine rather than measure](/portfolio-site/field-notes/metrics-become-territory)
- [Architecture as frozen accountability](/portfolio-site/field-notes/accountability-dissolves-upstream)
- [Agile vs Waterfall as commitment strategies](/portfolio-site/field-notes/agile-waterfall-commitment-strategies)
- [The participatory nature of technical reality](/portfolio-site/threads/techno-economic-constraint)

---
*Armchair note after reading Brandom ch. 3 on linguistic practice. The framework completely reframes what happens in technical organizations—from resource management to commitment negotiation.*