# Substrate Ontology

> "The limits of my language mean the limits of my world." — Ludwig Wittgenstein

## Purpose

This document describes how components are classified, connected, and structured within a Substrate. The ontology defines the relationships between component types, the hierarchy of specificity, and how to handle the inevitable edge cases that arise when mapping human knowledge to structured data.

---

## The Component Type System

### Overview

Substrate uses 19 component types organized into four categories:

**Knowledge Types** — Information about the world:

| Type | Code | Essence |
|------|------|---------|
| Fact | FA | Verified information |
| Claim | CL | Assertions requiring evidence |
| Argument | AR | Reasoned positions |
| Data-Source | DS | Origins of information |

**Challenge-Response Types** — Problems and their answers:

| Type | Code | Essence |
|------|------|---------|
| Problem | PR | Gaps, obstacles, negative conditions |
| Solution | SO | Ways to address problems |
| Plan | PL | Structured action approaches |
| Goal | GO | Desired outcomes |

**Conceptual Types** — Frameworks for thinking:

| Type | Code | Essence |
|------|------|---------|
| Idea | ID | Speculative concepts worth exploring |
| Model | MO | Mental models and frameworks |
| Frame | FR | Perspectives for viewing situations |
| Value | VA | Principles that guide decisions |

**Entity Types** — People, organizations, and things:

| Type | Code | Essence |
|------|------|---------|
| Person | PE | Individuals of interest |
| Organization | OR | Groups, companies, institutions |
| Project | PJ | Organized initiatives |
| Law | LA | Regulations and policies |
| Vote | VO | Voting records and positions |
| Funding-Source | FU | Financial backers |
| Event | EV | Temporal occurrences |

---

## The Cross-Reference Graph

### How Components Connect

Substrate is not a filing cabinet — it's a graph. Every component is a node, and every cross-reference is a typed, directed edge. The graph structure enables:

1. **Traversal**: Starting from any node, follow connections to discover related knowledge
2. **Evidence trails**: From any Claim, trace back through Facts and Data-Sources to verify
3. **Impact analysis**: From any Problem, find all Solutions, Arguments, and Plans connected to it
4. **Discovery**: From any component, find semantically related knowledge across types

### Canonical Relationship Types

Relationships between components are **typed** and **directional**:

```
PR ──addresses──▸ SO          (Problem is addressed by Solution)
SO ──addresses──▸ PR          (Solution addresses Problem)
CL ──supported_by──▸ FA/DS    (Claim supported by Fact or Data-Source)
CL ──argued_by──▸ AR          (Claim argued by Argument)
AR ──supports──▸ CL/PR/SO    (Argument supports Claim/Problem/Solution)
AR ──contradicts──▸ CL/AR     (Argument contradicts Claim/Argument)
PL ──addresses──▸ PR/GO      (Plan addresses Problem or Goal)
PL ──contains──▸ SO/PL/AR/CL (Plan contains Solutions, sub-plans, Arguments, Claims)
PL ──defines──▸ MO/FR         (Plan defines Beliefs/Models that shape it)
PL ──measured_by──▸ GO        (Plan's success measured by Goals as OKRs)
PJ ──contains──▸ PR/SO/PL/AR (Project contains these components)
PJ ──executes──▸ PL           (Project executes a Plan)
OR ──owns──▸ PJ               (Organization owns Project)
PE ──belongs_to──▸ OR         (Person belongs to Organization)
PE ──leads──▸ OR/PJ           (Person leads Organization/Project)
FU ──funds──▸ OR/PJ/PE       (Funding-Source funds entities)
LA ──constrains──▸ PR/SO/PJ   (Law constrains components)
VA ──guides──▸ PL/GO/PJ       (Value guides Plans/Goals/Projects)
MO ──informs──▸ FR/PL/AR      (Model informs Frames/Plans/Arguments)
FR ──reframes──▸ PR/CL        (Frame reframes Problems/Claims)
GO ──drives──▸ PL/PJ           (Goal drives Plans/Projects)
EV ──involves──▸ PE/OR/PJ     (Event involves People/Orgs/Projects)
ID ──evolves_to──▸ SO/PL/PJ   (Idea evolves into Solution/Plan/Project)
SO ──implemented_by──▸ PL/PJ   (Solution implemented by Plan/Project)
FA ──sourced_from──▸ DS        (Fact sourced from Data-Source)
VA ──conflicts_with──▸ VA      (Value conflicts with Value)
MO ──related_to──▸ MO          (Model related to Model)
```

### Relationship Cardinality

**One-to-Many (1:N)**:
- A Problem can have many Solutions (but a Solution addresses at least one Problem)
- An Organization can have many People (but a Person belongs to at least one context)
- A Goal can drive many Plans (but a Plan addresses at least one Goal or Problem)

**Many-to-Many (N:N)**:
- A Fact can support many Claims, and a Claim can be supported by many Facts
- An Argument can support many Claims, and a Claim can be argued by many Arguments
- A Law can constrain many components, and many Laws can constrain one component

**Bidirectional (↔)**:
If component A references component B with relationship R, then component B should reference component A with the inverse relationship R⁻¹:
- A `addresses` B ↔ B `addressed_by` A
- A `supports` B ↔ B `supported_by` A
- A `contradicts` B ↔ B `contradicted_by` A
- A `funds` B ↔ B `funded_by` A

**Self-referential**:
- A Value can conflict with another Value (`VA ──conflicts_with──▸ VA`)
- A Model can be related to another Model (`MO ──related_to──▸ MO`)
- An Argument can contradict another Argument (`AR ──contradicts──▸ AR`)

### Plan-Specific Ontology

Plans have a rich internal structure that goes beyond simple cross-references. A Plan is a **composite component** — it contains and organizes other components into a coherent whole.

**Internal Plan Structure** (from Miessler's Substrate):

```
PL (Plan)
├── Purpose         — Why this plan exists
├── Scope           — What entity/domain it applies to
├── Challenges      — PR-NNNNN references (the Problems)
├── Mission         — Unifying purpose statement
├── Beliefs/Models  — MO-NNNNN / FR-NNNNN references (author's worldview)
├── Ideal World     — Vision of the end state
├── Strategies      — Concrete approaches (may reference SO-NNNNNNN)
├── OKRs            — Measurable success criteria (Objectives + Key Results)
│   ├── Objective 1 (qualitative goal)
│   │   ├── KR1.1 (numeric/binary measurement with baseline, target, deadline)
│   │   └── KR1.2
│   └── Objective 2
│       ├── KR2.1
│       └── KR2.2
└── Related         — Cross-references to all connected components
```

**The Plan → OKR → Goal Relationship**:
- A Plan's OKRs are expressed as Goals (GO-NNNNN) with measurable Key Results
- Each Key Result has: Measurement, Baseline, Target, Deadline, Status
- The `PL ──measured_by──▸ GO` relationship connects Plans to their success metrics
- Goals referenced in OKRs should have their own component files in `components/goals/`

**The Challenge → Strategy → OKR Flow**:
```
Challenges (PR) → Mission → Strategies → Objectives → Key Results (GO)
```
Each Strategy addresses one or more Challenges. Each Strategy maps to at least one Objective. Each Objective has 2+ measurable Key Results.

---

## The Hierarchy of Specificity

Components exist on a spectrum from broad/abstract to narrow/concrete. Understanding this hierarchy is essential for proper classification and meaningful connections.

```
┌─────────────────────────────────────────────────────────────┐
│                     MOST ABSTRACT                           │
│                                                             │
│  Frame (FR) ───── How to see everything                     │
│      │                                                      │
│  Model (MO) ───── How to understand patterns                │
│      │                                                      │
│  Value (VA) ───── What principles guide us                  │
│      │                                                      │
│  Goal (GO) ────── What outcomes we desire                   │
│      │                                                      │
│  Problem (PR) ─── What stands in our way                    │
│      │                                                      │
│  Claim (CL) ───── What assertions we make                   │
│      │                                                      │
│  Argument (AR) ── Why we hold positions                     │
│      │                                                      │
│  Solution (SO) ── How we address problems                   │
│      │                                                      │
│  Plan (PL) ────── What steps we take                        │
│      │                                                      │
│  Fact (FA) ────── What we know is true                      │
│      │                                                      │
│  Law (LA) ─────── What rules constrain us                   │
│      │                                                      │
│  Data-Source (DS)─ Where our knowledge comes from           │
│                                                             │
│                     MOST CONCRETE                           │
└─────────────────────────────────────────────────────────────┘
```

**Implication**: More specific components reference more abstract ones. A Plan (specific) is guided by a Value (abstract). A Fact (concrete) is informed by a Model (abstract).

**Navigation**: Starting from a specific component, you can navigate "up" the hierarchy to find principles, and "down" to find details.

---

## Externalities and Edge Cases

### Composite Knowledge Items

Some knowledge doesn't fit neatly into a single type. When this happens:

**Strategy 1: Primary + Cross-reference**
Create the primary type, then reference secondary types through the Related section.
- Example: "The EU AI Act" → Primary: `LA-00001-eu-ai-act`, cross-reference to `SO-NNNNN` (it's also a Solution)

**Strategy 2: Split into Multiple Components**
If the knowledge truly contains multiple atomic concepts, split them.
- Example: "OpenAI released GPT-4 which increased misinformation" → Three components:
  - `EV-NNNNN-gpt4-release-march-2023` (the event)
  - `FA-NNNNN-gpt4-can-generate-misinformation` (the fact)
  - `PR-NNNNN-gpt4-misinformation-risk` (the problem)

**Strategy 3: Note the Ambiguity**
If you can't split without losing meaning, create the best-fit type and add a Note:
```markdown
## Notes
Classification ambiguity: This component could also be classified as a [Type].
The primary classification was chosen because [reason].
```

### Emerging vs. Established Knowledge

**Emerging knowledge** (new, uncertain, evolving):
- Use lower confidence levels
- Prefer Claim (CL) over Fact (FA) until verified
- Prefer Idea (ID) over Solution (SO) until validated
- Update frequently as understanding evolves

**Established knowledge** (well-documented, consensus):
- Use higher confidence levels
- Facts (FA) with strong source attribution
- Solutions (SO) with evidence of effectiveness
- Less frequent updates needed

### Temporal Degradation

Knowledge becomes stale. Components should be reviewed:
- **Facts**: Annually (data may change)
- **Claims**: Annually (evidence may emerge)
- **Arguments**: Semi-annually (new arguments may emerge)
- **People**: Quarterly (positions, affiliations change)
- **Organizations**: Quarterly (focus, leadership changes)
- **Laws**: Annually (new regulations, amendments)
- **Events**: No degradation (historical facts)
- **Models/Rrames**: Rarely (persistent ways of thinking)

Use the Maintain workflow to identify and update stale components.

### Value Conflicts

Values inherently conflict. When two Values contradict:
1. Document the tension explicitly using `conflicts_with` relationship
2. Create an Argument (AR) component describing the tension
3. Note which Plans/Goals each Value supports

Example:
```
VA-002-transparency-in-ai ──conflicts_with──▸ VA-005-privacy-protection
AR-015: "AI transparency and privacy protection can conflict when revealing 
        system details exposes personal data"
```

### Negative Knowledge

Sometimes we need to capture what we *don't* know:
- Create a Claim component with `confidence: low` for unverified assertions
- Use the Notes section to document unknowns
- Create an Idea component for research directions that might fill gaps

### Non-Binary Confidence

Confidence isn't just high/medium/low. For fine-grained confidence:
- **high**: Multiple independent sources, peer-reviewed, official data
- **medium**: Some evidence, reputable sources, but not fully verified
- **low**: Speculative, single source, or unverified
- **proposed**: Not yet assessed, newly created component

In the frontmatter, use `confidence: <level>`. In details, explain the confidence assessment.

### Domain Boundaries

Substrates have fuzzy boundaries. Knowledge at the edges:
- **Clear fit**: Clearly within the substrate's scope
- **Adjacent**: Related but primarily in another domain → create with cross-references to relevant substrates
- **Unclear**: Could belong to multiple substrates → create in the most relevant one, add Notes about alternatives

### versioning and Evolution

Components evolve over time:
- **Updated components**: Change the `updated` date in frontmatter, add notes about what changed
- **Deprecated components**: Change status to `deprecated`, note what replaced it
- **Resolved Problems**: Change status to `resolved`, note which Solution resolved it
- **Evolved Ideas**: Use `evolves_to` relationship when an Idea becomes a Solution, Plan, or Project

Never delete components — deprecate them. The history matters.

---

## The Evidence Trail Pattern

One of Substrate's most powerful patterns is the evidence trail. Every Claim should trace back through supporting Facts to their Data-Sources:

```
CL-00005: "AI misinformation is growing at scale"
  ├── supported_by
  │   ├── FA-00002: "GPT-4 hallucination rate is ~3%" (high confidence)
  │   │   └── sourced_from
  │   │       └── DS-015: "AI Safety Report 2024" (high reliability)
  │   └── FA-00008: "Deepfake video incidents increased 900% in 2023" (high confidence)
  │       └── sourced_from
  │           └── DS-00022: "Deepfake Statistics Report" (medium reliability)
  ├── argued_by
  │   ├── AR-00007: "Current regulatory approaches are insufficient" (supports)
  │   └── AR-00012: "Market incentives can address misinformation" (contradicts)
  └── contradicted_by
      └── CL-00019: "AI misinformation is being effectively managed"
```

This pattern enables:
- **Verification**: Trace any claim back to its sources
- **Confidence assessment**: Evaluate claim reliability based on source quality
- **Contradiction discovery**: Find opposing claims and arguments
- **Knowledge gaps**: Identify claims without sufficient supporting evidence

---

## The Problem-Solution Pattern

Another core pattern connects Problems to their Solutions:

```
PR-001: "AI misinformation at scale undermines public trust"
  ├── addressed by
  │   ├── SO-00003: "Automated fact-checking systems"
  │   │   ├── implemented_by
  │   │   │   └── PL-002: "Deploy fact-checking pipeline"
  │   │   │       └── part_of
  │   │   │           └── PJ-005: "AI Truth Initiative"
  │   │   └── constrained_by
  │   │       └── LA-00001: "EU AI Act"
  │   └── SO-00008: "International AI regulation framework"
  │       ├── constrained_by
  │       │   └── LA-00003: "US Executive Order 14110"
  │       └── involves
  │           └── OR-00002: "Frontier Model Forum"
  └── related_to
      └── PR-00004: "Lack of regulatory consensus"
```

This pattern enables:
- **Solution discovery**: Find all approaches to a problem
- **Constraint awareness**: Understand what laws/policies affect solutions
- **Stakeholder mapping**: Know which organizations and people are involved
- **Gap identification**: Find problems without solutions, or solutions without implementation plans

---

## Substrate Merging and Cross-Substrate Relationships

When substrates grow or overlap, they can be merged (see Merge workflow) or linked:

### Cross-Substrate References

Components in different substrates can reference each other using extended codes:

```
[substrate-ai-safety/PR-001]  ← Cross-substrate reference
```

These are stored in a special `cross_substrates` section:
```markdown
## Cross-Substrate References

- [substrate-climate-tech/PR-015]: Climate change accelerates AI energy demands
- [substrate-technology-regulation/LA-002]: EU AI Act applies across domains
```

### When to Merge

- Substrates with >30% cross-references should be merged
- Substrates where queries frequently span both should be merged
- Substrates with different access requirements should remain separate

---

## Integration with Other Systems

### TELOS Integration

Substrate Goals (GO) align with TELOS goals:
- A Substrate GO component can be linked to a TELOS goal
- TELOS tracking can reference Substrate components for context

### Fabric Integration

Fabric patterns are used during ingestion workflows:
- `extract_wisdom`: Extract key insights from content
- `summarize`: Create component summaries
- `extract_entities`: Identify People, Organizations, and concepts
- `analyze_claims`: Identify claims and their evidence quality

### Research Integration

The Research skill supports the Expand workflow:
- Web search for topic deepening
- Source discovery for Data-Source creation
- Fact verification for Claim → Fact upgrading

---

## Summary Principles

1. **Atomicity**: Each component represents one concept. Not five. Not "sort of." One.
2. **Connectivity**: Components without connections are orphans. Find their relationships or question their value.
3. **Verifiability**: Claims trace to Facts. Facts trace to Data-Sources. Every assertion has a trail.
4. **Specificity**: More abstract components inform more specific ones. Navigate up for principles, down for details.
5. **Temporality**: Knowledge degrades. Review and update. Never delete — deprecate.
6. **Ambiguity**: When classification is unclear, choose the best fit, note the ambiguity, and cross-reference.
7. **Conflict**: Value conflicts and contradiction arguments are features, not bugs. Document them explicitly.
8. **Evolution**: Knowledge evolves. Components should evolve with new information.
9. **Composability**: Substrates can be merged, split, or cross-referenced. Structure serves understanding.
10. **Human-Readable**: Every file is readable by humans. Every graph is traversable by machines. Both access the same truth.

---

*An ontology is not a cage. It is a scaffold — temporary, useful, and meant to be rebuilt when understanding demands it.*