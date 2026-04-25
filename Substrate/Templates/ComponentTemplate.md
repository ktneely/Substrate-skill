# Component Template

> Every component follows this "Answer First" structure. Consistency enables both human readability and machine parsing.

---

## Template

```markdown
---
code: {TYPE}-{NNNNN}-{slug}
type: {Type}
title: "{Human-readable title}"
status: active | proposed | resolved | deprecated
created: YYYY-MM-DD
updated: YYYY-MM-DD
confidence: high | medium | low | proposed
tags: [{tag1}, {tag2}, {tag3}]
sources:
  - url: "{source_url}"
    title: "{source_title}"
    accessed: YYYY-MM-DD
---

# {Title}

## Summary

{One-paragraph answer-first summary. What is this? Why does it matter? This should be the most important paragraph in the entire component — the thing someone reads when they only have 30 seconds.}

## Details

{Extended description. The full story. For Problems: what's wrong, who's affected, why it matters. For Solutions: how it works, what it addresses, trade-offs. For People: their role, influence, positions. For Organizations: their mission, projects, impact. Write enough to be comprehensive but not so much that the key points are buried.}

## Related

- **Addresses**: [SO-NNNNN] — {Which Solutions address this Problem}
- **Addressed by**: [PR-NNNNN] — {Which Problems this Solution addresses}
- **Supports**: [AR-NNNNN], [CL-NNNNN] — {Arguments/claims that support this}
- **Contradicts**: [AR-NNNNN], [CL-NNNNN] — {Arguments/claims that contradict this}
- **Related to**: [{TYPE}-NNNNN] — {Broader connections}
- **Part of**: [PJ-NNNNN] — {Project this belongs to, if applicable}
- **Involves**: [PE-NNNNN], [OR-NNNNN] — {People and organizations involved}
- **Informed by**: [MO-NNNNN], [FR-NNNNN] — {Models/frames that inform this}
- **Constrained by**: [LA-NNNNN], [VA-NNNNN] — {Laws/values that apply}
- **Funded by**: [FU-NNNNN] — {Funding sources, if applicable}
- **Evolves to**: [{TYPE}-NNNNN] — {If this Idea can evolve into a Solution/Plan/Project}

## Evidence

- [FA-NNNNN]: {Supporting fact}
- [DS-NNNNN]: {Supporting data source}

## Notes

{Additional context, caveats, open questions, or classification notes. This is where you note ambiguities, pending verification, or anything that doesn't fit elsewhere.}
```

---

## Field Reference

### Frontmatter Fields

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `code` | Yes | string | Component code: `{TYPE}-{NNNNN}-{slug}` |
| `type` | Yes | string | Full type name (Problem, Solution, etc.) |
| `title` | Yes | string | Human-readable title, quoted |
| `status` | Yes | enum | `active`, `proposed`, `resolved`, `deprecated` |
| `created` | Yes | date | ISO date of creation |
| `updated` | Yes | date | ISO date of last update |
| `confidence` | Yes | enum | `high`, `medium`, `low`, `proposed` |
| `tags` | Yes | array | Lowercase, hyphenated tags (max 5) |
| `sources` | No* | array | Source attribution objects |

*Sources are **required** for Claims, Facts, and Arguments. Strongly recommended for all other types.

### Source Object Fields

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `url` | Yes | string | URL or DOI of the source |
| `title` | Yes | string | Title of the source |
| `accessed` | Yes | date | Date the source was accessed |

### Status Values

| Status | Meaning | When to Use |
|--------|---------|-------------|
| `active` | Currently relevant and maintained | Most components start here |
| `proposed` | Newly created, not yet reviewed | Components awaiting verification |
| `resolved` | The issue has been addressed | Problems that have solutions, Claims that are verified |
| `deprecated` | No longer relevant or replaced | Outdated information, superseded knowledge |

### Confidence Levels

| Level | Meaning | When to Use |
|-------|---------|-------------|
| `high` | Well-established, multiple sources | Verified facts, peer-reviewed claims |
| `medium` | Some evidence, reasonable confidence | Reputable news, secondary sources |
| `low` | Speculative, limited evidence | Opinions, unverified claims |
| `proposed` | Not yet assessed | Newly created components pending review |

### Content Sections

| Section | Required | Purpose |
|---------|----------|---------|
| Summary | Yes | One-paragraph answer-first overview |
| Details | Yes | Comprehensive description |
| Related | Yes* | Cross-references to other components |
| Evidence | No** | Supporting facts and data sources |
| Notes | No | Additional context, caveats, open questions |

*Related section is required but may be empty for newly created components that haven't been connected yet.
**Evidence section is required for Claims, Facts, and Arguments; optional for other types.

### Relationship Types in "Related" Section

Use the canonical relationship verbs as section headers:

| Relationship Verb | Source → Target | Meaning |
|-------------------|----------------|---------|
| **Addresses** | Problem → Solution | Problem is addressed by Solution |
| **Addressed by** | Solution → Problem | Solution addresses Problem |
| **Supports** | Argument/Fact → Claim | Supports the truth of |
| **Supported by** | Claim → Argument/Fact | Is supported by |
| **Contradicts** | Argument → Claim/Argument | Argues against |
| **Contradicted by** | Claim/Argument → Argument | Is argued against by |
| **Part of** | Any → Project | Belongs to this project |
| **Involves** | Any → Person/Organization | Involves these entities |
| **Informed by** | Any → Model/Frame | Is informed by these models/frames |
| **Constrained by** | Any → Law/Value | Is constrained by these |
| **Funded by** | Any → Funding-Source | Is funded by |
| **Evolves to** | Idea → Solution/Plan/Project | Can evolve into |
| **Implemented by** | Solution → Plan/Project | Is implemented by |
| **Sourced from** | Fact → Data-Source | Is sourced from |
| **Conflicts with** | Value → Value | Conflicts with |
| **Related to** | Any → Any | General relationship |

---

## Minimal Template

For quick entry when full template is excessive:

```markdown
---
code: {TYPE}-{NNNNN}-{slug}
type: {Type}
title: "{Title}"
status: proposed
created: YYYY-MM-DD
updated: YYYY-MM-DD
confidence: proposed
tags: []
sources: []
---

# {Title}

## Summary

{One-paragraph summary.}

## Details

{Details to be expanded.}

## Related

*To be connected.*

## Notes

*Stub created YYYY-MM-DD. Needs expansion and connections.*
```