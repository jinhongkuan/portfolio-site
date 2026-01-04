# Where Accountability Dissolves in the Stack

*2025-01-06* · Tags: `technological` `organizational` · 🪑 armchair

Reading Davies' "Unaccountability Machine" while debugging a client's architecture. The parallel is uncanny.

Their system: 
- Frontend team "just displays what backend sends"
- Backend team "just implements product requirements"  
- Product team "just follows what data shows"
- Data team "just tracks what frontend logs"

Perfect circle. No one owns outcomes.

Davies calls these "accountability sinks" — structural features that absorb responsibility. In organizations, they're often cybernetic: metrics make decisions, humans just implement them. "The algorithm decided" becomes the universal absolution.

But here's what Davies misses that fieldwork reveals: accountability doesn't just disappear. It gets pushed upstream until it hits code. The technical architecture becomes the only honest record of who decided what. Every design pattern, every data model, every API contract — these are frozen accountability that no metric can dissolve.

This is why technical debt persists. Not because it's hard to fix, but because fixing it would require someone to claim the dissolved accountability. Better to leave it as "legacy system, author unknown."

**What I'm watching for**:
- How organizations create accountability sinks through architecture
- Whether making decision provenance visible (via Bicameral) prevents dissolution
- The gap between "blameless culture" and "responsibility-free systems"

**Theoretical grounding**:
- Davies on cybernetic management
- Beer's Viable System Model (but inverted)
- Latour on how artifacts carry politics

---
*Armchair note after completing "The Unaccountability Machine." Need fieldwork examples of accountability sinks in actual codebases.*