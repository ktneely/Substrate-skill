# Substrate Taxonomy Guide

> "Classification is the beginning of understanding. Without taxonomy, there is only noise." — Carolus Linnaeus (paraphrased)

## Purpose

This document provides guidance on classifying knowledge within Substrate. Proper classification ensures components are discoverable, connectable, and maintainable. Every piece of knowledge has a place; every place has a purpose.

---

## Component Type Reference

### PR — Problem

**Definition**: Something that needs solving. A gap between the current state and a desired state. A challenge, obstacle, or negative condition affecting people, systems, or processes.

**Essential characteristics**:
- Describes what is wrong, lacking, or broken
- Not a solution in disguise ("We need better regulation" is a Solution framing, not a Problem)
- Specific enough to be actionable ("AI is dangerous" → too vague; "AI systems can generate convincing misinformation at scale" → actionable)

**Naming**: Use noun phrases that describe the negative state
- ✅ Good: `PR-001-ai-misinformation-at-scale`
- ✅ Good: `PR-015-insufficient-healthcare-access`
- ❌ Bad: `PR-001-problem-with-ai` (too vague)
- ❌ Bad: `PR-001-we-need-better-regulation` (that's a solution framing)

**Template fields**:
- **Summary**: What's wrong, who's affected, why it matters
- **Details**: Scope, severity, evidence of the problem
- **Related**: Primarily connects to Solutions (SO), Arguments (AR) that define it, Laws (LA) that constrain it

---

### SO — Solution

**Definition**: A way to address a Problem. An approach, method, technology, or system that could reduce or eliminate a Problem.

**Essential characteristics**:
- Must address at least one Problem (every Solution needs a Problem)
- Can be partial (doesn't have to fully solve the Problem)
- May have trade-offs, costs, or side effects (note these in Details)

**Naming**: Use noun phrases that describe the approach
- ✅ Good: `SO-00003-automated-fact-checking-systems`
- ✅ Good: `SO-012-international-ai-regulation-framework`
- ❌ Bad: `SO-00003-solve-misinformation` (too vague)
- ❌ Bad: `SO-00003-better-ai` (what does "better" mean?)

---

### AR — Argument

**Definition**: A reasoned position on a Claim, Problem, or Solution. Arguments present evidence and reasoning to support or contradict a position.

**Essential characteristics**:
- Has a clear stance (supports or contradicts something)
- Includes reasoning, not just conclusion
- Can be contested by other Arguments

**Naming**: Use position + subject
- ✅ Good: `AR-007-current-regulatory-approaches-are-insufficient`
- ✅ Good: `AR-012-open-source-ai-promotes-safety`
- ❌ Bad: `AR-007-ai-regulation-argument` (what's the position?)
- ❌ Bad: `AR-007-regulation-is-good` (too simplistic)

---

### CL — Claim

**Definition**: An assertion that requires evidence. Claims are statements that could be true or false, and their truth value depends on supporting evidence.

**Essential characteristics**:
- Falsifiable (could be proven false)
- Requires evidence to assess
- Can be supported, contradicted, or unresolved
- Distinct from Facts (which are verified) and Arguments (which include reasoning)

**Naming**: Use the assertion itself
- ✅ Good: `CL-005-large-language-models-hallucinate-more-than-humans`
- ✅ Good: `CL-023-current-ai-safety-measures-are-adequate`
- ❌ Bad: `CL-005-llm-claim` (what's the claim?)
- ❌ Bad: `CL-005-ai-is-bad` (too vague, not falsifiable)

**Confidence guidance**:
- `high`: Multiple independent sources confirm
- `medium`: Some evidence supports, but not conclusive
- `low`: Primarily speculative, limited evidence

---

### PL — Plan

**Definition**: A structured approach to action that transparently presents a cohesive strategy for running an entity (team, department, company, government, etc.). Plans specify Purpose, Scope, Challenges, Mission, Beliefs/Models, Ideal World, Strategies, and measurable Success Criteria (OKRs). Plans are the primary tool for AI-assisted reasoning about complex problems — they hold all the various pieces in context simultaneously.

**Essential characteristics**:
- Has a clear Purpose (why this plan exists)
- Defines Scope (what entity or domain it applies to)
- Lists Challenges (the Problems it addresses, with PR-NNNNN references)
- States a Mission (the unifying purpose)
- May include Beliefs/Models (the author's worldview that shapes the plan)
- Describes an Ideal World (what success looks like in human terms)
- Specifies Strategies (the concrete approaches to move toward the Ideal World)
- **Must** define Success Criteria as OKRs (Objectives with measurable Key Results)
- Can be connected to Problems (what it addresses), Solutions (what it contains), Projects (what it drives), and Goals (what it measures)

**Alignment with Miessler's Substrate**: Plans in Substrate are designed to be the primary interface for AI-assisted governance and organizational planning. They use the TELOS style of defining context (Problems, Mission, Goals, Challenges, Strategies, Solutions, Metrics, Projects, Budgets) and are meant to be transparently presented so humans and AI can discuss, analyze, compare, and iterate on them together.

**Naming**: Use action-oriented phrases that capture the plan's core mission
- ✅ Good: `PL-00001-unify-us-around-bill-of-rights`
- ✅ Good: `PL-00012-break-the-debt-turnover-cycle`
- ❌ Bad: `PL-00003-fact-checking-plan` (too generic)
- ❌ Bad: `PL-00003-do-something-about-misinformation` (what specifically?)

**Template fields** (see `Templates/PlanTemplate.md`):
- **Purpose**: Why this plan exists
- **Scope**: What entity or domain it applies to
- **Challenges**: The Problems it addresses (PR-NNNNN references)
- **Mission**: The unifying purpose statement
- **Beliefs/Models**: Author's worldview (optional, MO/FR references)
- **Ideal World**: What success looks like
- **Strategies**: Concrete approaches with component references
- **Success Criteria (OKRs)**: Required — Objectives with measurable Key Results (Measurement, Baseline, Target, Deadline, Status)
- **Related**: Cross-references to Problems, Solutions, Projects, Models, Laws, Values, People, Organizations

**OKR requirements**:
- Every Plan must have at least one Objective
- Every Objective must have at least 2 Key Results
- Key Results must be numeric or binary — never vague
- Baselines must be stated (or marked `[TBD]` if data unavailable)
- Targets must be specific values, not ranges
- Deadlines must be specific dates

---

### ID — Idea

**Definition**: A concept worth exploring. Ideas are less formalized than Solutions and less actionable than Plans. They represent exploratory thinking.

**Essential characteristics**:
- Speculative or unformed
- Worth exploring further
- May evolve into Solutions, Plans, or Projects
- Not yet validated

**Naming**: Use the concept itself
- ✅ Good: `ID-00002-decentralized-content-verification`
- ✅ Good: `ID-00007-gamification-of-media-literacy`
- ❌ Bad: `ID-00002-cool-idea` (not descriptive)
- ❌ Bad: `ID-00002-build-a-system-that-fixes-everything` (too broad)

---

### PE — Person

**Definition**: An individual of interest. People who are relevant to the substrate's domain through their work, positions, influence, or involvement.

**Essential characteristics**:
- A real person (not fictional)
- Relevant to the substrate's domain
- Connected to Organizations, Projects, Arguments, etc.

**Naming**: Use the person's name, slugified
- ✅ Good: `PE-00008-sam-altman`
- ✅ Good: `PE-00015-geoffrey-hinton`
- ❌ Bad: `PE-00008-sa` (too abbreviated)
- ❌ Bad: `PE-00008-the-guy-who-runs-openai` (not a proper name)

**Template fields**:
- **Summary**: Who they are and why they're relevant
- **Details**: Role, affiliations, key positions, influence
- **Related**: Organizations they belong to, arguments they've made, projects they lead

---

### OR — Organization

**Definition**: A group, company, or institution relevant to the substrate's domain.

**Essential characteristics**:
- Has a formal or semi-formal structure
- Has a name and purpose
- Includes companies, non-profits, government agencies, research groups, etc.

**Naming**: Use the organization's name
- ✅ Good: `OR-00003-openai`
- ✅ Good: `OR-00012-european-commission`
- ❌ Bad: `OR-00003-oai` (abbreviations aren't descriptive enough)
- ❌ Bad: `OR-00003-the-company-that-makes-chatgpt` (use the actual name)

---

### PJ — Project

**Definition**: An initiative with defined scope. Projects are organized efforts with a start, end, and deliverables.

**Essential characteristics**:
- Has defined scope and goals
- Has participants (People and/or Organizations)
- May address Problems, pursue Goals, or implement Solutions
- Has a start date and (intended) end date

**Naming**: Use the project's official name
- ✅ Good: `PJ-00002-frontier-model-forum`
- ✅ Good: `PJ-00007-ai-safety-institute`
- ❌ Bad: `PJ-00002-the-ai-project` (too generic)
- ❌ Bad: `PJ-00002-make-ai-safe` (that's a Goal, not a Project name)

---

### VA — Value

**Definition**: A principle that guides decisions. Values represent beliefs about what is important, right, or preferred.

**Essential characteristics**:
- Abstract but actionable (guides specific decisions)
- Can conflict with other Values (tensions are worth documenting)
- Not facts (they can't be proven true or false)
- Shapes Plans, Goals, and arguments

**Naming**: Use the value itself
- ✅ Good: `VA-00002-transparency-in-ai-systems`
- ✅ Good: `VA-00005-individual-privacy-over-convenience`
- ❌ Bad: `VA-00002-ethics` (too broad)
- ❌ Bad: `VA-00002-people-should-be-good` (not specific enough)

**Value Conflicts**: Values that tension with each other should cross-reference each other using the `conflicts_with` relationship.

---

### MO — Model

**Definition**: A mental model or framework. Predictable patterns of thinking that help understand, predict, or navigate situations.

**Essential characteristics**:
- A generalizable pattern (not specific to one instance)
- Has a name or label in common usage (or you coin one)
- Can be applied to multiple situations
- Informs Frames and Plans

**Naming**: Use the model's name
- ✅ Good: `MO-001-tragedy-of-the-commons`
- ✅ Good: `MO-005-principal-agent-problem`
- ❌ Bad: `MO-001-the-model-about-resources` (not the model's name)

---

### FR — Frame

**Definition**: A way of viewing a situation. Frames determine what you see and what you miss. They provide lenses through which to interpret Problems, Claims, and Arguments.

**Essential characteristics**:
- Shapes perception (what you focus on, what you ignore)
- Can be chosen deliberately
- Different frames reveal different truths about the same situation
- Informed by Models

**Naming**: Use the frame's perspective
- ✅ Good: `FR-00002-national-security-lens`
- ✅ Good: `FR-005-public-interest-framework`
- ❌ Bad: `FR-00002-frame-1` (not descriptive)
- ❌ Bad: `FR-00002-the-way-i-think-about-things` (too subjective)

---

### DS — Data-Source

**Definition**: An information source. A specific document, dataset, publication, or resource that provides evidence for Claims and Facts.

**Essential characteristics**:
- Points to a specific, retrievable source (URL, DOI, archive location)
- Includes metadata: author, date, publication, reliability assessment
- Every Claim and Fact should trace back to a Data-Source
- The root of evidence trails

**Naming**: Use a descriptive slug from the source title
- ✅ Good: `DS-015-ai-safety-report-2024`
- ✅ Good: `DS-00003-arxiv-transformer-architecture`
- ❌ Bad: `DS-015-source-1` (not descriptive)

**Reliability assessment**:
- **high**: Peer-reviewed, official, primary source
- **medium**: Reputable outlet, secondary source
- **low**: Social media, opinion, unverified

---

### LA — Law

**Definition**: A regulation, policy, or rule. Formal constraints that apply to Problems, Solutions, and Projects.  May be the written and enforced version of a Value.

**Essential characteristics**:
- Has legal or policy force
- Enacted by an Organization
- Constrains or enables certain actions
- Includes jurisdiction information
- Can link to the specific statute, policy, ordinance, etc. describing the law

**Naming**: Use the law's name or common abbreviation
- ✅ Good: `LA-00001-eu-ai-act`
- ✅ Good: `LA-00003-us-ai-executive-order-14110`
- ❌ Bad: `LA-00001-regulation` (which one?)
- ❌ Bad: `LA-00018-enforcement-through-deterrence` (describes a value or claim or solution when not a documented law with formalized enactment)

**Identifiability**:
- The Law must be discoverable through search or posted documentation that is official for an organization or community 

---

### VO — Vote

**Definition**: A voting record or position. How a Person or Organization voted on a specific issue, bill, or decision.

**Essential characteristics**:
- Links a Person/Organization to a specific position
- Includes context: what was voted on, when, and the outcome
- Source-attributed (official record or reliable reporting)

**Naming**: Use the subject and voter
- ✅ Good: `VO-00004-senate-vote-on-ai-act-2024`
- ❌ Bad: `VO-00004-the-vote` (which one?)

---

### FU — Funding-Source

**Definition**: A financial backer or patron. Organizations or individuals that provide funding for Projects, Organizations, or People.

**Essential characteristics**:
- Specifies the funding entity
- Includes amount, type, and timeline if known
- Links to what is being funded
- May reveal influence dynamics

**Naming**: Use the funder's name and context
- ✅ Good: `FU-00002-nist-ai-safety-funding-2024`
- ❌ Bad: `FU-00002-money` (not descriptive)

---

### GO — Goal

**Definition**: A desired outcome. Goals specify what we want to achieve, as distinct from how we achieve it (Plans) or what prevents us (Problems).

**Essential characteristics**:
- Specified as an outcome, not a method
- Can be measured or assessed
- Drives Plans and Projects
- May be guided by Values

**Naming**: Use the desired outcome
- ✅ Good: `GO-001-reduce-ai-misinformation-impact-by-50-percent`
- ✅ Good: `GO-005-establish-global-ai-safety-standards`
- ❌ Bad: `GO-001-better-ai` (not specific)
- ❌ Bad: `GO-001-build-a-system` (that's a Plan, not a Goal)

---

### FA — Fact

**Definition**: Verified information. A piece of information that has been confirmed through reliable evidence and can be stated with high confidence.

**Essential characteristics**:
- Verifiable (can be checked against evidence)
- Sourced (traces back to Data-Source)
- Not in dispute (if disputed, it's a Claim)
- Precise and specific

**Naming**: Use a brief statement of the fact
- ✅ Good: `FA-00002-gpt4-hallucination-rate-approximately-3-percent`
- ✅ Good: `FA-00008-eu-ai-act-enacted-august-2024`
- ❌ Bad: `FA-00002-ai-stats` (too vague)
- ❌ Bad: `FA-00002-ai-is-dangerous` (that's an opinion, not a fact)

**Fact vs. Claim distinction**:
- **Fact**: Verified, sourced, not in significant dispute → `FA`
- **Claim**: Asserted but requiring more evidence, or in dispute → `CL`
- When in doubt, classify as Claim. A Claim can be upgraded to Fact when verified.

---

### EV — Event

**Definition**: An occurrence with temporal context. A specific happening at a specific time that is relevant to the substrate's domain.

**Essential characteristics**:
- Has a specific date or date range
- Involves specific People, Organizations, or Projects
- Has context that connects to Problems, Claims, or other components
- Distinguished from timeless knowledge by its temporal nature

**Naming**: Use event name and date
- ✅ Good: `EV-00003-chatgpt-launch-november-2022`
- ✅ Good: `EV-00010-ai-safety-summit-2023`
- ❌ Bad: `EV-00003-the-launch` (which launch?)
- ❌ Bad: `EV-00003-when-ai-happened` (too vague)

---

## Classification Decision Framework

When you encounter a piece of knowledge, use this decision tree:

```
Is it something wrong or lacking?
  → Yes: Problem (PR)
  → No: Continue

Is it a way to address a problem?
  → Yes: Solution (SO)
  → No: Continue

Is it a reasoned position?
  → Yes: Argument (AR)
  → No: Continue

Is it a verifiable assertion?
  → Is it verified and not disputed?
    → Yes: Fact (FA)
    → No: Claim (CL)
  → No: Continue

Is it a structured approach with steps?
  → Yes: Plan (PL)
  → No: Continue

Is it a speculative concept worth exploring?
  → Yes: Idea (ID)
  → No: Continue

Is it a specific person?
  → Yes: Person (PE)
  → No: Continue

Is it a group, company, or institution?
  → Yes: Organization (OR)
  → No: Continue

Is it an organized initiative?
  → Yes: Project (PJ)
  → No: Continue

Is it a guiding principle?
  → Yes: Value (VA)
  → No: Continue

Is it a mental model or framework?
  → Yes: Model (MO)
  → No: Continue

Is it a perspective or lens?
  → Yes: Frame (FR)
  → No: Continue

Is it an information source?
  → Yes: Data-Source (DS)
  → No: Continue

Is it a regulation or policy?
  → Yes: Law (LA)
  → No: Continue

Is it a voting record?
  → Yes: Vote (VO)
  → No: Continue

Is it a funding entity?
  → Yes: Funding-Source (FU)
  → No: Continue

Is it a desired outcome?
  → Yes: Goal (GO)
  → No: Continue

Is it a temporal occurrence?
  → Yes: Event (EV)
  → No: Reassess — may need multiple components
```

---

## Handling Ambiguous Classifications

### Multiple Types Apply

When a knowledge item could be classified as multiple types:

1. **Create the primary type**: Choose the most specific/natural type
2. **Cross-reference to secondary types**: Use the Related section to point to related components
3. **Consider splitting**: If the item truly contains multiple concepts, split into separate components

**Example**:
- "The EU AI Act addresses AI misinformation" → Could be Law (LA) or Solution (SO)
  - Primary: `LA-00001-eu-ai-act` (it's primarily a law)
  - Cross-reference: "Addresses PR-001 (AI misinformation problem)"
  - Secondary: Consider also creating `SO-NNNNN-eu-ai-act-as-regulatory-solution`

### Fact vs. Claim

When uncertain whether something is verified:
- **Default to Claim (CL)**: Claims can be upgraded to Facts
- **Add a Note**: "This may be verifiable; consider upgrading to FA once sourced"
- **Set confidence**: `low` until verified, `medium` with some sources, `high` when well-sourced

### Idea vs. Solution

When a potential solution is still speculative:
- **Idea (ID)**: No clear implementation path, needs more exploration
- **Solution (SO)**: Has a specific approach, can be compared to alternatives
- An Idea can evolve into a Solution: `ID-00002 → SO-NNNNN` (use `evolves_to` relationship)

### Problem vs. Claim

When something is both a problem statement and an assertion:
- **Problem (PR)**: If the focus is on the negative condition that needs fixing
- **Claim (CL)**: If the focus is on whether the statement is true
- Create both and cross-reference them

---

## Specificity Hierarchy

Components range from broad to specific. Understanding this hierarchy helps with classification:

```
Frame (FR)          — Broadest: How to view everything
  ↓
Model (MO)           — Pattern: How to understand categories
  ↓
Value (VA)           — Principle: What guides decisions
  ↓
Goal (GO)            — Outcome: What we want to achieve
  ↓
Problem (PR)         — Gap: What's wrong
  ↓
Claim (CL)           — Assertion: What's being said
  ↓
Argument (AR)        — Reasoning: Why something is true/false
  ↓
Solution (SO)        — Approach: How to address
  ↓
Plan (PL)            — Steps: What to do specifically
  ↓
Fact (FA)            — Verified: What we know is true
  ↓
Law (LA)             — Constraint: What the rules are
  ↓
Data-Source (DS)     — Evidence: Where we know it from
```

More specific components reference more general ones. A Fact (specific) is informed by a Model (general). A Plan (specific) is guided by a Value (general).

---

## Creating New Substrate Information Groups

### When to Create a New Substrate

Create a new substrate when:
- The domain is sufficiently distinct (e.g., "ai-safety" vs. "climate-tech")
- Cross-references between domains would be sparse
- The knowledge has different stakeholders or access requirements
- The existing substrate is becoming unwieldy (>500 components)

### When Not to Create a New Substrate

Don't create a new substrate when:
- The domain overlaps significantly with an existing one
- Cross-references would be dense (better to keep together)
- The only reason is organizational convenience (use tags instead)

### Creating the Substrate

Use the SubstrateCreate workflow (see `Workflows/SubstrateCreate.md`).

**Naming**:
- Use lowercase, hyphenated names
- Be specific: `ai-safety` not just `ai`
- Avoid overly broad names: `technology-regulation` not just `regulation`
- Include scope in description

**Seeding**: After creation, consider seeding with:
- 3-5 key Problems that define the domain
- 2-3 key Organizations central to the domain
- 5-10 initial Facts that ground the substrate
- A Frame that establishes the substrate's perspective

---

## Expanding Existing Groups

### Adding Components to an Existing Substrate

1. **Use the appropriate workflow**:
   - ManualEntry for individual items
   - DocumentIngest for documents
   - WebScrape for URLs
   - VideoTranscript for media
   - Expand for deep research

2. **Follow the classification decision tree** above

3. **Always add cross-references**: A component without connections is an orphan. Find at least 2-3 related components.

4. **Update indexes**: Every new component must update INDEX.md (add table row), index.json, and next-ids.json

### Maintaining and Pruning Stale Data

1. **Regular maintenance**: Run the Maintain workflow monthly
2. **Deprecation**: Change `status: deprecated` for outdated components instead of deleting
3. **Archival**: Move resolved or deprecated components to an archive rather than deleting
4. **Staleness threshold**: Components not updated in 6+ months should be reviewed
5. **Orphan removal**: Components with zero connections should be connected or removed

---

## Tag System

Tags provide a secondary classification system that spans across component types.

### Tag Rules:
- Lowercase, hyphenated
- Use established vocabularies when possible
- Specific enough to be useful, broad enough to connect
- Maximum 5 tags per component

### Tag Categories:

| Category | Examples | Purpose |
|----------|----------|---------|
| Domain | `ai`, `climate`, `healthcare` | What field is this in? |
| Scale | `individual`, `organization`, `global` | What's the scope? |
| Method | `quantitative`, `qualitative`, `mixed` | How was this derived? |
| Certainty | `established`, `emerging`, `speculative` | How confident are we? |
| Region | `us`, `eu`, `global` | What geography does this apply to? |

### Using Tags for Cross-Substrate Queries:

Tags enable finding related components across substrates. When querying, tags provide a universal filter regardless of component type.

---

*Classification brings order to chaos. But remember: the taxonomy serves understanding, not the other way around. When an item resists classification, the taxonomy may need adjusting.*