# Diagnostic Sprint Example

## What Actually Happens

A growth-stage marketplace contacts me: "We need to rebuild our notifications system. The current one can't scale."

Standard approach: Architect new system. Estimate effort. Execute rebuild.

What I do instead: First, understand why they think they need a rebuild.

### Week 1: Archaeology

I dig through their Slack. Read their PRs. Trace their decisions.

Finding #1: The "unscalable" system was built to handle 100x their current load.
Finding #2: The real problem — notification rules hardcoded customer-by-customer.
Finding #3: Why? Six months ago, biggest customer threatened to leave without custom logic.

The constraint isn't technical. It's contractual.

### Week 2: Mapping Commitments

I trace every custom notification rule to its source:
- Customer A: CEO promised during emergency renewal
- Customer B: Sales committed without asking engineering  
- Customer C: Support hardcoded as "temporary" fix

Pattern emerges: Each "exception" created precedent. Each precedent became expectation. Each expectation became technical debt.

### Week 3: Finding Leverage

Instead of rebuilding, we need to renegotiate. But first, we quantify:
- Cost of maintaining custom rules: 2 engineers full-time
- Revenue from "special" customers: 15% of total
- Risk of saying no: Lower than perceived

The real insight: They're not constrained by technology. They're constrained by commitments they didn't realize they were making.

### The Deliverable

Not a new architecture. A decision archaeology:
- Which commitments actually matter (very few)
- Which can be unwound (most)
- Which technical changes become possible after renegotiation
- How to prevent this pattern recurring

### The Outcome

Three months later:
- No rebuild needed
- 80% of custom logic removed through customer conversations
- New process: Technical review before sales commitments
- Saved: 6 months of engineering effort

## Why This Works

Traditional consulting would have built them a better notification system. But that would have preserved the underlying problem — making commitments without understanding their technical consequences.

By surfacing the decision history, we changed the constraint space itself.

---

[Back to Practice](/practice) · [Discuss a diagnostic sprint →](/about#contact)