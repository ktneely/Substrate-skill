---
name: Substrate
description: Structured knowledge framework for capturing, connecting, and querying information about problems, solutions, people, organizations, and everything in the known universe. USE WHEN substrate, knowledge graph, capture knowledge, connect information, create plan from problems, ingest document into knowledge, scrape URL for knowledge, extract from video, query knowledge base, audit knowledge, merge substrates, create knowledge domain, expand on topic, add to substrate.
category: Knowledge
---

# Substrate Skill

> "The substrate of understanding is not a single truth, but a connected graph of evidence, argument, and perspective." — Daniel Miessler

## Description

Substrate is a structured knowledge framework for capturing, connecting, and querying information about problems, solutions, people, organizations, and everything in the known universe. It transforms disconnected data points into a navigable graph of understanding where every node is atomic, verifiable, and semantically linked to related nodes.

**What it does**: Creates, maintains, expands, and queries interlinked knowledge components stored as markdown files following a rigorous taxonomy and cross-reference system.

**Why it matters**: Human knowledge is fragmented across documents, conversations, and mental models. Substrate makes it structured, connected, and actionable — designed for both human comprehension and AI-assisted reasoning.

---

## When to Invoke This Skill

**Triggers** (invoke when user mentions or needs):

| Trigger | Workflow | Description |
|---------|----------|-------------|
| "add this to substrate" / "capture this" | ManualEntry | Create a component from text description |
| "ingest this document" / "process this PDF" | DocumentIngest | Extract components from a document file |
| "scrape this URL" / "extract from this page" | WebScrape | Extract components from web content |
| "transcribe this video" / "extract from video" | VideoTranscript | Extract components from video/audio |
| "connect these" / "find relationships" | Connect | Discover and create cross-references |
| "expand on this" / "research this topic" | Expand | Deepen knowledge around a component |
| "what does substrate say about" / "query substrate" | Query | Search and answer from substrate data |
| "clean up substrate" / "audit substrate" | Maintain | Audit and repair substrate integrity |
| "create new substrate" / "new knowledge domain" | SubstrateCreate | Initialize a new substrate information group |
| "merge substrates" / "combine knowledge" | Merge | Merge one substrate into another |
| "substrate" (general) | — | Assess intent and route to appropriate workflow |
| "create a plan to address" / "draft a plan for these problems" | PlanFromConcerns | Generate a draft Plan from specified Problems |
| *(automatic, before any ingestion)* | DedupCheck | Prevent duplicate components before creation |

**Also invoke when**:
- Research tasks that accumulate structured knowledge
- Building company/person/product profiles
- Analyzing ecosystems with interconnected entities
- Creating argument maps or evidence chains
- Long-term knowledge management across sessions

---

## Component Type System

Every piece of knowledge in Substrate is classified as one of **19 component types**, each with a unique code prefix:

| Code | Type | Directory | Description |
|------|------|-----------|-------------|
| `PR` | Problem | `problems/` | Things that need solving |
| `SO` | Solution | `solutions/` | Ways to address problems |
| `AR` | Argument | `arguments/` | Reasoned positions on claims |
| `CL` | Claim | `claims/` | Assertions requiring evidence |
| `PL` | Plan | `plans/` | Structured approaches to action |
| `ID` | Idea | `ideas/` | Concepts worth exploring |
| `PE` | Person | `people/` | Individuals of interest |
| `OR` | Organization | `organizations/` | Groups, companies, institutions |
| `PJ` | Project | `projects/` | Initiatives with defined scope |
| `VA` | Value | `values/` | Principles guiding decisions |
| `MO` | Model | `models/` | Mental models, frameworks |
| `FR` | Frame | `frames/` | Ways of viewing a situation |
| `DS` | Data-Source | `data-sources/` | Information sources |
| `LA` | Law | `laws/` | Regulations, policies, rules |
| `VO` | Vote | `votes/` | Voting records, positions |
| `FU` | Funding-Source | `funding-sources/` | Financial backers, patrons |
| `GO` | Goal | `goals/` | Desired outcomes |
| `FA` | Fact | `facts/` | Verified information |
| `EV` | Event | `events/` | Occurrences with temporal context |

---

## Directory Structure

Every substrate information group follows this standard structure, aligned with Miessler's original Substrate project for easy sharing and consumption. Each substrate lives as a subdirectory under `substrate.base_path`.

```
{base_path}/
├── substrate-{name}/                  # Individual substrate directory
│   ├── README.md                      # Substrate overview, purpose, scope
│   ├── INDEX.md                       # Master index of all components
│   ├── components/
│   │   ├── problems/                  # PR-NNNNN components
│   │   │   ├── PR-13042-toxic-water-in-poor-us-cities.md
│   │   │   ├── PR-22917-deforestation-of-tropical-rain-forest.md
│   │   │   └── INDEX.md               # Table index of all problems
│   │   ├── solutions/                 # SO-NNNNN components
│   │   │   └── INDEX.md               # Table index of all solutions
│   │   ├── arguments/                 # AR-NNNNN components
│   │   │   └── INDEX.md
│   │   ├── claims/                    # CL-NNNNN components
│   │   │   └── INDEX.md
│   │   ├── plans/                     # PL-NNNNN components
│   │   │   └── INDEX.md
│   │   ├── ideas/                     # ID-NNNNN components
│   │   │   └── INDEX.md
│   │   ├── people/                    # PE-NNNNN components
│   │   │   └── INDEX.md
│   │   ├── organizations/             # OR-NNNNN components
│   │   │   └── INDEX.md
│   │   ├── projects/                  # PJ-NNNNN components
│   │   │   └── INDEX.md
│   │   ├── values/                    # VA-NNNNN components
│   │   │   └── INDEX.md
│   │   ├── models/                    # MO-NNNNN components
│   │   │   └── INDEX.md
│   │   ├── frames/                    # FR-NNNNN components
│   │   │   └── INDEX.md
│   │   ├── data-sources/              # DS-NNNNN components
│   │   │   └── INDEX.md
│   │   ├── laws/                      # LA-NNNNN components
│   │   │   └── INDEX.md
│   │   ├── votes/                     # VO-NNNNN components
│   │   │   └── INDEX.md
│   │   ├── funding-sources/           # FU-NNNNN components
│   │   │   └── INDEX.md
│   │   ├── goals/                     # GO-NNNNN components
│   │   │   └── INDEX.md
│   │   ├── facts/                     # FA-NNNNN components
│   │   │   └── INDEX.md
│   │   └── events/                    # EV-NNNNN components
│   │       └── INDEX.md
│   ├── connections/
│   │   ├── graph.md                   # Full cross-reference graph
│   │   ├── problem-solution-map.md    # PR ↔ SO mappings
│   │   ├── claim-evidence-trails.md   # CL → FA/DS evidence chains
│   │   └── people-organization-map.md # PE ↔ OR relationship map
│   └── metadata/
│       ├── index.json                 # Machine-readable component index
│       ├── taxonomy.json              # Component type definitions
│       └── next-ids.json              # Counter tracking for code assignment
├── substrate-{another-name}/          # Another substrate
│   └── ...
└── substrate-{third-substrate}/       # Additional substrates
    └── ...
```

### INDEX.md Format

Each component type directory contains an `INDEX.md` file — a reference table of all document cards in that directory. This format aligns with Miessler's original Substrate project for easy sharing and consumption.

**Example `components/problems/INDEX.md`:**

```markdown
# Problems Index

| PROBLEM ID | PROBLEM TITLE | SHORT and MEANINGFUL DESCRIPTION |
|------------|---------------|----------------------------------|
| PR-13042 | Toxic Water in Poor US Cities | Many cities in the US with low socioeconomic status populations have water that's unsafe to drink. |
| PR-22917 | Deforestation of the Tropical Rain Forest | Earth is losing its tropical rain forests at an alarming rate, which will have a significant and likely negative impact on humanity which we do not yet fully understand. |
| PR-30456 | AI Misinformation at Scale | AI systems can generate convincing misinformation faster than humans can verify, undermining public trust in information ecosystems. |
```

**INDEX.md columns by component type:**

| Component Type | Column 1 | Column 2 | Column 3 |
|----------------|----------|----------|----------|
| Problems (PR) | PROBLEM ID | PROBLEM TITLE | SHORT and MEANINGFUL DESCRIPTION |
| Solutions (SO) | SOLUTION ID | SOLUTION TITLE | SHORT and MEANINGFUL DESCRIPTION |
| Arguments (AR) | ARGUMENT ID | ARGUMENT TITLE | SHORT and MEANINGFUL DESCRIPTION |
| Claims (CL) | CLAIM ID | CLAIM TITLE | SHORT and MEANINGFUL DESCRIPTION |
| Plans (PL) | PLAN ID | PLAN TITLE | SHORT and MEANINGFUL DESCRIPTION |
| Ideas (ID) | IDEA ID | IDEA TITLE | SHORT and MEANINGFUL DESCRIPTION |
| People (PE) | PERSON ID | PERSON NAME | SHORT and MEANINGFUL DESCRIPTION |
| Organizations (OR) | ORGANIZATION ID | ORGANIZATION NAME | SHORT and MEANINGFUL DESCRIPTION |
| Projects (PJ) | PROJECT ID | PROJECT TITLE | SHORT and MEANINGFUL DESCRIPTION |
| Values (VA) | VALUE ID | VALUE TITLE | SHORT and MEANINGFUL DESCRIPTION |
| Models (MO) | MODEL ID | MODEL TITLE | SHORT and MEANINGFUL DESCRIPTION |
| Frames (FR) | FRAME ID | FRAME TITLE | SHORT and MEANINGFUL DESCRIPTION |
| Data-Sources (DS) | DATA SOURCE ID | DATA SOURCE TITLE | SHORT and MEANINGFUL DESCRIPTION |
| Laws (LA) | LAW ID | LAW TITLE | SHORT and MEANINGFUL DESCRIPTION |
| Votes (VO) | VOTE ID | VOTE TITLE | SHORT and MEANINGFUL DESCRIPTION |
| Funding-Sources (FU) | FUNDING SOURCE ID | FUNDING SOURCE TITLE | SHORT and MEANINGFUL DESCRIPTION |
| Goals (GO) | GOAL ID | GOAL TITLE | SHORT and MEANINGFUL DESCRIPTION |
| Facts (FA) | FACT ID | FACT TITLE | SHORT and MEANINGFUL DESCRIPTION |
| Events (EV) | EVENT ID | EVENT TITLE | SHORT and MEANINGFUL DESCRIPTION |

### Master INDEX.md

The substrate root contains a master `INDEX.md` with links to all component type indices:

```markdown
# {Substrate Name} Index

## Component Types

| Type | Count | Index |
|------|-------|-------|
| Problems | 42 | [View](components/problems/INDEX.md) |
| Solutions | 28 | [View](components/solutions/INDEX.md) |
| Arguments | 15 | [View](components/arguments/INDEX.md) |
| Claims | 37 | [View](components/claims/INDEX.md) |
| Plans | 8 | [View](components/plans/INDEX.md) |
| Ideas | 23 | [View](components/ideas/INDEX.md) |
| People | 56 | [View](components/people/INDEX.md) |
| Organizations | 31 | [View](components/organizations/INDEX.md) |
| Projects | 12 | [View](components/projects/INDEX.md) |
| Values | 19 | [View](components/values/INDEX.md) |
| Models | 14 | [View](components/models/INDEX.md) |
| Frames | 9 | [View](components/frames/INDEX.md) |
| Data-Sources | 47 | [View](components/data-sources/INDEX.md) |
| Laws | 22 | [View](components/laws/INDEX.md) |
| Votes | 8 | [View](components/votes/INDEX.md) |
| Funding-Sources | 6 | [View](components/funding-sources/INDEX.md) |
| Goals | 18 | [View](components/goals/INDEX.md) |
| Facts | 89 | [View](components/facts/INDEX.md) |
| Events | 34 | [View](components/events/INDEX.md) |

## Quick Links

- [Problem-Solution Map](connections/problem-solution-map.md)
- [Claim Evidence Trails](connections/claim-evidence-trails.md)
- [People-Organization Map](connections/people-organization-map.md)
- [Full Connection Graph](connections/graph.md)
```
```

---

## Workflows

Each workflow is defined in detail in its own file under `Workflows/`:

| # | Workflow | File | Purpose |
|---|----------|------|---------|
| 0 | DedupCheck | `Workflows/DedupCheck.md` | Prevent duplicate component creation |
| 1 | ManualEntry | `Workflows/ManualEntry.md` | Create component from text description |
| 2 | DocumentIngest | `Workflows/DocumentIngest.md` | Extract components from documents |
| 3 | WebScrape | `Workflows/WebScrape.md` | Extract components from URLs |
| 4 | VideoTranscript | `Workflows/VideoTranscript.md` | Extract components from video/audio |
| 5 | Connect | `Workflows/Connect.md` | Discover and create cross-references |
| 6 | Expand | `Workflows/Expand.md` | Research and deepen a component |
| 7 | Query | `Workflows/Query.md` | Search and answer from substrate data |
| 8 | Maintain | `Workflows/Maintain.md` | Audit and repair substrate integrity |
| 9 | SubstrateCreate | `Workflows/SubstrateCreate.md` | Initialize a new substrate group |
| 10 | Merge | `Workflows/Merge.md` | Merge one substrate into another |
| 11 | PlanFromConcerns | `Workflows/PlanFromConcerns.md` | Draft Plan from specified Problems with OKRs |

---

## Integration with PAI Skills

Substrate integrates deeply with other PAI capabilities:

| Skill | Integration Point |
|-------|-------------------|
| **Research** | Used by Expand workflow to gather new information about a topic |
| **Fabric** | Fabric patterns (extract_wisdom, summarize, etc.) applied during ingestion workflows |
| **Parser** | Used by DocumentIngest to parse PDFs, DOCX, and other file formats into processable text |
| **Extractor** | Used by WebScrape to extract structured data from web pages |
| **Browser** | Used for interactive web scraping when static extraction fails |
| **OSINT** | Used by Expand for people/organization deep-dives |
| **ContentAnalysis** | Used to analyze and classify content during ingestion |
| **TELOS** | Goals component type aligns with TELOS goal tracking |
| **Science** | Experimental hypotheses map to Claims and Arguments |
| **BeCreative** | Idea component type can benefit from creative exploration |

---

## Configuration

```yaml
# ~/.opencode/skills/Substrate/config.yaml

substrate:
  # Default storage location for substrates
  base_path: "~/substrates"

  # Naming convention: "numeric" (PR-001) or "slug" (PR-climate-change)
  naming: "numeric-slug"

  # Whether to auto-connect new components to existing ones
  auto_connect: true

  # Maximum depth for Expand research (prevents runaway research)
  expand_max_depth: 3

  # Whether to auto-create missing cross-referenced components
  auto_create_stubs: true

  # Default substrate name for operations (override with --substrate flag)
  default_substrate: "general"

  # Integration with other skills
  use_fabric_patterns: true
  use_research_skill: true
  use_parser_skill: true

  # Appearance
  template_style: "detailed"  # "minimal" or "detailed"

  # ── Per-Type Verification Levels ─────────────────────────────
  # Each component type has its own verification strictness.
  # Levels:
  #   "strict"    — Source URL required. No source = component rejected.
  #   "moderate"  — Source strongly recommended. Missing source flagged but accepted.
  #   "relaxed"   — Source optional. Component accepted without attribution.
  #
  # Rationale:
  #   Evidence (FA) and external constraints (LA) must always be traceable.
  #   Claims and Arguments benefit from sources but may emerge from reasoning.
  #   Ideas and Values are inherently subjective — relaxed is appropriate.

  verification:
    # Evidence & constraint types — always require attribution
    facts: "strict"
    data_sources: "strict"
    laws: "strict"
    votes: "strict"
    funding_sources: "strict"

    # Challenge-response types — moderate to strict
    problems: "moderate"
    solutions: "moderate"
    plans: "moderate"
    goals: "moderate"

    # Epistemic types — claims relaxed, arguments moderate
    claims: "relaxed"
    arguments: "moderate"

    # Conceptual types — relaxed to moderate
    ideas: "relaxed"
    models: "moderate"
    frames: "relaxed"
    values: "relaxed"

    # Entity types — moderate (people/orgs need at least one reference)
    people: "moderate"
    organizations: "moderate"
    projects: "moderate"
    events: "moderate"

  # ── Verification Overrides ───────────────────────────────────
  # Per-substrate overrides that tighten or relax the global defaults.
  # Useful when a specific substrate demands higher rigor.
  #
  # Example: substrate-legal-compliance tightens all types to strict.
  # substrate-brainstorm relaxes everything to relaxed.
  #
  # substrate_overrides:
  #   substrate-legal-compliance:
  #     default_level: "strict"
  #   substrate-brainstorm:
  #     default_level: "relaxed"
```

### Verification Level Definitions

| Level | Source Required? | Missing Source Behavior | Best For |
|-------|-----------------|------------------------|----------|
| **strict** | Yes — URL or document reference mandatory | Component creation blocked until source provided | Facts, Laws, Data-Sources, Votes, Funding |
| **moderate** | Strongly recommended | Component accepted but flagged in Maintain audit | Problems, Solutions, Plans, Goals, People, Organizations, Arguments, Models, Projects, Events |
| **relaxed** | Optional | No flag. Source field may be empty | Claims, Ideas, Frames, Values |

### How Verification Is Enforced

1. **During ingestion** (ManualEntry, DocumentIngest, WebScrape, VideoTranscript): the workflow checks the component type against `verification.{type}`. If `strict` and no source is found, the workflow prompts for a source or rejects the component.
2. **During Maintain audit**: components missing sources are flagged by severity — `strict` violations are critical, `moderate` are warnings, `relaxed` are informational.
3. **During Merge**: source verification levels from both substrates are compared. The stricter level wins for each component type.
4. **During Query**: results include verification confidence — components with verified sources rank higher in relevance.

---

## Component File Template

Every component file follows this "Answer First" structure:

```markdown
---
code: PR-001
type: Problem
title: "Human-readable title"
status: active | proposed | resolved | deprecated
created: YYYY-MM-DD
updated: YYYY-MM-DD
confidence: high | medium | low
tags: [comma, separated, tags]
sources:
  - url: https://...
    title: "Source title"
    accessed: YYYY-MM-DD
---

# {Title}

## Summary

One-paragraph answer-first summary. What is this? Why does it matter?

## Details

Extended description of the component. For Problems: what's wrong, who's affected, why it matters. For Solutions: how it works, what it addresses, trade-offs. Etc.

## Related

- **Addresses**: [SO-NNNNN] — if this is a Problem, which Solutions address it
- **Addressed by**: [PR-NNNNN] — if this is a Solution, which Problems it addresses
- **Supports**: [AR-NNNNN], [CL-NNNNN] — arguments/claims that support this
- **Contradicts**: [AR-NNNNN], [CL-NNNNN] — arguments/claims that contradict this
- **Related to**: [any-NNNNN] — broader connections
- **Part of**: [PJ-NNNNN] — if this belongs to a project
- **Owned by**: [PE-NNNNN], [OR-NNNNN] — people/orgs involved
- **Informed by**: [MO-NNNNN], [FR-NNNNN] — models/frames that shape this
- **Constrained by**: [LA-NNNNN], [VA-NNNNN] — laws/values that apply

## Evidence

- [FA-NNNNN]: Supporting fact
- [DS-NNNNN]: Supporting data source

## Notes

Additional context, caveats, or open questions.
```

---

## Cross-Reference Graph

Components connect to each other through typed relationships. The canonical relationship types:

### Core Relationships

| Source | Relationship | Target | Meaning |
|--------|-------------|--------|---------|
| PR | addresses | SO | Problem is addressed by Solution |
| SO | addresses | PR | Solution addresses Problem |
| CL | supported_by | FA, DS | Claim is supported by Fact/Data-Source |
| CL | argued_by | AR | Claim is argued by Argument |
| AR | supports | CL, PR, SO | Argument supports a Claim/Problem/Solution |
| AR | contradicts | CL, AR | Argument contradicts a Claim/Argument |
| PL | addresses | PR, GO | Plan addresses a Problem or Goal |
| PL | contains | SO, PL, AR, CL | Plan contains Solutions, sub-plans, Arguments, Claims |
| PL | defines | MO, FR | Plan defines Beliefs/Models that shape it |
| PL | measured_by | GO | Plan's success measured by Goals (OKRs) |
| PJ | executes | PL | Project executes a Plan |
| PJ | contains | PR, SO, PL, AR | Project contains these components |
| OR | owns | PJ | Organization owns/leads Project |
| PE | belongs_to | OR | Person belongs to Organization |
| PE | leads | OR, PJ | Person leads Organization/Project |
| FU | funds | OR, PJ, PE | Funding-Source funds these entities |
| LA | constrains | PR, SO, PJ | Law constrains these components |
| VA | guides | PL, GO, PJ | Value guides these components |
| MO | informs | FR, PL, AR | Model informs these components |
| FR | reframes | PR, CL | Frame reframes these components |
| GO | drives | PL, PJ | Goal drives Plans and Projects |
| EV | involves | PE, OR, PJ | Event involves these entities |
| ID | evolves_to | SO, PL, PJ | Idea can evolve into Solution/Plan/Project |

### Relationship Cardinality

- **One-to-Many**: A Problem can have many Solutions. An Organization can have many People.
- **Many-to-Many**: A Claim can be supported by many Facts. A Fact can support many Claims.
- **Symmetric**: If A relates_to B, then B relates_to A (stored on both component files).
- **Directional**: `addresses` is directional (SO → PR). The inverse is `addressed_by` (PR ← SO).

---

## Code Assignment Rules

### Format: `{TYPE}-{NNNNN}-{slug}.md`

- **Type prefix**: Always uppercase, 2 characters (PR, SO, AR, etc.)
- **Number**: Zero-padded 5-digit sequential number (00001, 00002, etc.)
- **Slug**: Lowercase, hyphenated, ≤50 chars, descriptive (e.g., `climate-change`, `ai-alignment`)
- **Counter tracking**: `metadata/next-ids.json` maintains per-type counters

### Assignment Process:
1. Read `metadata/next-ids.json` for the next available ID
2. Create file with assigned code (e.g., `PR-03007-ai-safety-risk.md`)
3. Update `next-ids.json` with incremented counter
4. Update `INDEX.md` in the component type directory (add table row)
5. Update `metadata/index.json` with new component entry

### Slug Rules:
- Use natural language, not jargon: `ai-safety-risk` not `asr`
- Be specific: `gpt4-hallucination-problem` not `ai-problem`
- ≤50 characters
- No special characters except hyphens
- Must be unique within its component type

---

## Naming Conventions

### Substrate Names
- Format: `substrate-{name}`
- Lowercase, hyphenated
- Examples: `substrate-ai-safety`, `substrate-climate-tech`, `substrate-local-politics`

### Component File Names
- Format: `{CODE}-{slug}.md`
- Example: `PR-00001-climate-change.md`, `PE-04002-sam-altman.md`

### Directory Names
- Always lowercase, hyphenated
- Must match component type directory list exactly

### Tags
- Lowercase, hyphenated
- Use established vocabularies where possible
- Examples: `ai-safety`, `climate`, `regulation`, `open-source`

---

## Examples

### Creating a Component (ManualEntry)

```
User: "Add to substrate: The problem is that AI systems can generate convincing misinformation at scale, which undermines public trust in information."

→ Creates PR-NNNNN-ai-misinformation-at-scale.md
  Type: Problem
  Auto-connects to existing solutions, claims, people
  Generates stub cross-references
```


> [!NOTE] Use sequential numbering
> **ALWAYS** check `INDEX.md` in the component directory to determine the *next* identifier number and continue in sequence. **NEVER** use a code more than once  

### Ingesting a Document (DocumentIngest)

```
User: "Ingest this PDF about AI regulation into the ai-safety substrate"

→ Parses PDF
→ Extracts: Problems, Solutions, Arguments, Claims, Facts, People, Organizations
→ Creates components with cross-references
→ Updates INDEX.md files and index
```

### Querying the Substrate (Query)

```
User: "What does our substrate say about AI safety regulation?"

→ Searches all component types
→ Traverses cross-reference graph
→ Returns: Problems → Solutions → Evidence → Arguments
→ With confidence levels and source attribution
```

### Expanding Knowledge (Expand)

```
User: "Expand on PR-001 using research"

→ Researches topic using Research skill
→ Extracts new components from findings
→ Connects new components to PR-001
→ Updates graph and indexes
```

---

## Skill Loading Protocol

When this skill is invoked:

1. **Read configuration**: Load `config.yaml` for settings
2. **Identify substrate**: Determine which substrate to work with (default or specified)
3. **Load index**: Read `metadata/index.json` for current component inventory
4. **Load taxonomy**: Read `metadata/taxonomy.json` for type definitions
5. **Execute workflow**: Run the appropriate workflow based on user intent
6. **Update indexes**: After modifications, update all affected INDEX.md files and index.json
7. **Validate integrity**: Check for broken references and missing files

---

## Philosophy

Substrate embodies these principles:

1. **Atomicity** — Each component is one concept. Not five. Not "sort of." One.
2. **Connectivity** — Components that don't connect to anything are orphans. Find their relationships or question their value.
3. **Verifiability** — Claims without sources are just opinions. Facts need evidence. Arguments need warrants.
4. **Scalability** — The same structure works for a startup's market analysis or the entire domain of quantum physics.
5. **Composability** — Substrates can be merged, queried together, or kept separate. Your knowledge, your choice.
6. **AI-First** — Designed for AI agents to read, write, and reason over. Markdown is both human and machine readable.
7. **Human-Readable** — Open the directory. Read any file. Understand the knowledge. No databases required.

---

*Substrate: Because understanding is not a collection of facts, but a connected graph of meaning.*