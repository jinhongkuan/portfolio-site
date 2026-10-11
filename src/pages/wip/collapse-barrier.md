---
layout: ../../layouts/MarkdownLayout.astro
title: A Collapse Barrier (work in progress)
---

# A Collapse Barrier

*Work in progress · ICSE 2027 NIER submission (working title)*

A lightweight check that flags when a coding agent's plan commits to details that neither the issue nor the code it has read can justify.

---

Coding agents often settle questions too early. Faced with an underspecified issue, an agent will commit to plan details that the issue never licensed and that it never read anywhere in the repository. We call this *state collapse*. A recent example comes from OpenAI's note [Why we no longer evaluate SWE-bench Verified](https://openai.com/index/why-we-no-longer-evaluate-swe-bench-verified/): in pylint-4551, the gold patch adds a `get_annotation` helper that the issue never mentions.

The idea is simple. Take the atoms of an agent's plan (*P*), the spans of the ticket (*I*), and the files read during the session (*R*). Any atom in *P* \ (*I* ∪ *R*) has no cited support. Rather than forcing the agent to resolve it on the spot, we surface those atoms and feed them back, so the open question stays visible until someone with the authority to answer it does. We are exploring this on SWE-bench Verified.

The lineage is the ViewPoints framework (Nuseibeh, Kramer & Finkelstein, ICSE 1993) and its idea of *lazy inconsistency*: an inconsistency is a respectable state to be in until an authorized party resolves it. This connects to a broader aim of mine, which is to build technology that keeps options open instead of collapsing them early on people's behalf.

This is new, ongoing work. More to come.

[← Home](/portfolio-site/)
