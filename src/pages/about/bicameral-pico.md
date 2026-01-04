# Bicameral Pico: Instrumentation for Organizational Ethnography

## What It Is

Bicameral is not a Virtual CTO or decision engine. It's a **lightweight instrumentation layer** that makes decision dynamics observable, replayable, and learnable — a flight recorder for how product intent becomes engineering reality.

## Why It Matters

In my fieldwork with startups, I repeatedly observe the same pattern: decisions drift from their original intent, creating cascading technical debt and organizational friction. But this drift is rarely visible until it manifests as rework, pivots, or KTLO burden.

Bicameral makes this process observable in real-time by:
- Capturing decision moments with minimal intrusion
- Linking decisions to their downstream artifacts (PRs, tickets, incidents)
- Enabling human annotation to surface patterns
- Creating an empirical record of how rationality is enacted, not stated

## Core Design

The system centers on a single primitive: the **Decision Event**

```
DecisionEvent {
  timestamp
  actors
  trigger_context     // Slack message, PR comment, meeting note
  decision_claim      // What is being committed to
  implied_constraints // Initially empty, filled through observation
  downstream_refs     // Links to actual implementation
}
```

Everything else — patterns, trajectories, insights — emerges from accumulated, annotated events.

## Integration with Field Notes

Bicameral serves as empirical grounding for ethnographic observations:

1. **Decision Trace**: "Ship MVP without analytics" → 3-month retrofit
2. **Field Note**: How growth pressure creates technical debt through deferred decisions
3. **Thread Formation**: Pattern emerges across multiple startups

This creates a recursive loop:
- Bicameral captures the raw material
- Field notes interpret the patterns
- Threads synthesize recurring dynamics

## Open Instrumentation

Bicameral is designed as open-source infrastructure, not a product:
- Epistemically humble (no prescriptive recommendations)
- Extensible (organizations can add their own annotations)
- Trainable through use (not pre-trained models)

The goal is not to replace human judgment but to make organizational inference visible for ethnographic study.

---

[View the technical specification](/docs/bicameral-v2-instrumentation) · [GitHub Repository](https://github.com/yourusername/bicameral)