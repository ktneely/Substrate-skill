---
type: Plan
title: Human-readable plan title
status: draft | proposed | active | on_hold | completed | deprecated
created: 2026-02-24
updated: 2026-02-24
confidence: high | medium | low
tags:
  - comma
  - separated
  - tags
sources:
  - url: https://...
    title: Source title
    accessed: YYYY-MM-DD
---

# {Title}

## Purpose

One-paragraph statement of what this plan is designed to achieve and why it exists. This is the "why" — the fundamental reason the plan was written.

> *Example: "This is a Substrate Plan document designed to be used as part of the Substrate project to help people create and discuss different ways to run cities, states, or countries. The primary tool for interface with these Plans will be AI combined with web and other UIs."*

## Scope

What entity, domain, or system this plan applies to. Be specific about boundaries.

> *Example: "This is a Plan for how to run the United States of America."*
> *Example: "This is a Plan for addressing AI safety risks at CompanyName."*

## Challenges

The biggest problems this plan addresses. Each challenge should reference an existing Problem component (PR-NNNNN) or be written as a standalone challenge statement.

1. **[PR-NNNNN]** — Challenge description
2. **[PR-NNNNN]** — Challenge description
3. **[PR-NNNNN]** — Challenge description

*If no existing Problem components exist, write challenges as numbered statements. The PlanFromConcerns workflow will auto-populate this from referenced Problems.*

## Mission

The core mission statement — one or more concise statements of what this plan aims to accomplish at the highest level.

1. Mission statement one
2. Mission statement two

*The Mission is the unifying purpose. Everything in the plan should serve the Mission.*

## Beliefs / Models

Optional section describing the author's worldview, mental models, or frames that shape how this plan is structured. These are the lenses through which the author sees the problem space.

1. **Belief/Model name**: Description of how the author sees this aspect of the world
2. **Belief/Model name**: Description

*Reference existing Model (MO-NNNNN) or Frame (FR-NNNNN) components where applicable.*

## Ideal World

A description of what the world looks like if this plan succeeds completely. This is the vision of the end state — the "north star" that all strategies point toward.

1. Ideal state description one
2. Ideal state description two
3. Ideal state description three

*The Ideal World section is critical — it defines what success looks like in human terms, not just metrics.*

## Strategies

The concrete approaches this plan uses to move from current state toward the Ideal World. Each strategy should be actionable and reference related components where applicable.

1. **Strategy name**: Detailed description of the approach. What it does, how it works, who it involves.
   - *Related: [SO-NNNNN], [PL-NNNNN], [PJ-NNNNN]*
2. **Strategy name**: Detailed description.
   - *Related: [SO-NNNNN], [PL-NNNNN]*
3. **Strategy name**: Detailed description.
   - *Related: [SO-NNNNN]*

*Strategies are the "how." They bridge the gap between the Mission and the measurable outcomes (OKRs).*

## Success Criteria (OKRs)

**Required.** Every Plan must define its success through Objectives and Key Results. This section is non-negotiable — a Plan without measurable success criteria is just an essay.

Key Results must have a specific measurement, which is one of: integer, percentage, or binary.

### Objective 1: [Descriptive objective title]

*The Objective is a qualitative statement of what we want to achieve.*

| # | Key Result | Measurement | Baseline | Target | Deadline | Status |
|---|-----------|-------------|----------|--------|----------|--------|
| KR1.1 | Specific, measurable outcome | Metric name and unit | Current value | Target value | YYYY-MM-DD | not_started |
| KR1.2 | Specific, measurable outcome | Metric name and unit | Current value | Target value | YYYY-MM-DD | not_started |

### Objective 2: [Descriptive objective title]

| #     | Key Result                   | Measurement          | Baseline      | Target       | Deadline   | Status      |
| ----- | ---------------------------- | -------------------- | ------------- | ------------ | ---------- | ----------- |
| KR2.1 | Specific, measurable outcome | Metric name and unit | Current value | Target value | YYYY-MM-DD | not_started |

### OKR Tracking Notes

- **Review cadence**: How often OKRs are reviewed (e.g., weekly, monthly, quarterly)
- **Owner**: Who is responsible for tracking and reporting
- **Reporting mechanism**: How progress is communicated (e.g., dashboard, report, meeting)

## Related

- **Addresses**: [PR-NNNNN] — Problems this plan addresses
- **Contains**: [SO-NNNNN], [PL-NNNNN] — Solutions and sub-plans within this plan
- **Drives**: [PJ-NNNNN] — Projects launched by this plan
- **Informed by**: [MO-NNNNN], [FR-NNNNN] — Models and frames that shape this plan
- **Constrained by**: [LA-NNNNN], [VA-NNNNN] — Laws and values that apply
- **Owned by**: [PE-NNNNN], [OR-NNNNN] — People and organizations responsible

## Evidence

- [FA-NNNNN]: Supporting fact
- [DS-NNNNN]: Supporting data source

## Notes

Additional context, caveats, open questions, or areas for future development.
