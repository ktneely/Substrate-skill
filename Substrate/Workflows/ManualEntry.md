# Workflow: ManualEntry

> Create a Substrate component from a text description.

## Trigger

- User says: "add this to substrate", "capture this", "create a component", or directly describes a knowledge item with a component type intent
- Any text input that the agent identifies as containing substrate-appropriate knowledge

## Input

- **Text**: Natural language description of a knowledge item
- **Implicit**: Component type classification, relationships to existing components
- **Optional**: Substrate name (defaults to `config.default_substrate`), specific component type override

## Process

### Step 0: Deduplication Check

**Before creating any component**, run the DedupCheck workflow (`Workflows/DedupCheck.md`) to determine if a matching component already exists in the substrate.

1. **Prepare dedup input**: From the text input, extract the proposed title, summary, and tags
2. **Run Dedup Check**: Query the appropriate INDEX.md for the proposed component type
3. **Evaluate match result**:
   - **Certain/High match** → Merge: Add the new source to the existing component, update content if enriched, skip creation
   - **Medium match** → Prompt user: Present the similar existing component, user decides merge or distinct
   - **Low match** → Create with log: Proceed with creation, but log the similarity for future review
   - **No match** → Proceed to Step 1: No duplicate detected, continue with normal creation flow

4. **If merging**: Follow the Merge Procedure from DedupCheck (add source to existing frontmatter, optionally enrich content, update INDEX.md, log to dedup-log.json). **Do not proceed to Step 1 — the component already exists.**
5. **If creating distinct**: Add explicit cross-reference to the similar existing component, then proceed to Step 1.

This step runs on **every** single-component creation. It is mandatory and cannot be skipped unless the user explicitly forces creation with `force_create: true`.

### Step 1: Classify

Determine the component type by analyzing the content:

| If the content describes... | Classify as... |
|----------------------------|----------------|
| Something wrong, a gap, a challenge | `PR` (Problem) |
| A way to address or fix something | `SO` (Solution) |
| A reasoned position or debatable stance | `AR` (Argument) |
| An assertion that needs verification | `CL` (Claim) |
| A structured approach or step-by-step | `PL` (Plan) |
| A concept, brainstorm, or exploration seed | `ID` (Idea) |
| An individual person | `PE` (Person) |
| A company, group, or institution | `OR` (Organization) |
| An initiative with scope and timeline | `PJ` (Project) |
| A principle or ethical guideline | `VA` (Value) |
| A mental model or framework | `MO` (Model) |
| A perspective or lens for viewing | `FR` (Frame) |
| An information source or dataset | `DS` (Data-Source) |
| A regulation, policy, or rule | `LA` (Law) |
| A voting record or position | `VO` (Vote) |
| A financial backer or patron | `FU` (Funding-Source) |
| A desired outcome | `GO` (Goal) |
| A verified piece of information | `FA` (Fact) |
| A temporal occurrence | `EV` (Event) |

**Ambiguity Resolution**: If a description could be multiple types:
1. Ask the user: "This could be a [Type A] or a [Type B]. Which is primary?"
2. Create the primary component, then create secondary components as cross-references
3. Prefer the more specific type (Claim > Fact, Plan > Idea)

### Step 2: Assign Code

1. Read `metadata/next-ids.json` from the target substrate
2. Get the next available number for the component type
3. Generate a slug from the title (lowercase, hyphenated, ≤50 chars)
4. Compose the full code: `{TYPE}-{NNNNN}-{slug}`
5. Example: `PR-007-ai-misinformation-at-scale`

### Step 3: Create Component File

Use the component template (see `Templates/ComponentTemplate.md`):

1. Set frontmatter fields (code, type, title, status, created, updated, confidence, tags, sources)
2. Write the **Summary** paragraph (answer-first — what and why in one paragraph)
3. Write the **Details** section (expanded description)
4. Identify and populate **Related** cross-references:
   - Search existing components for semantic relationships
   - Use typed relationships from the cross-reference ontology
   - If a referenced component doesn't exist and `auto_create_stubs` is true, create a stub
5. Populate **Evidence** section (if Claim, Fact, or Argument)
6. Add **Notes** for open questions or caveats

### Step 4: Update Indexes

After creating the component file:

1. **Update `components/{type}/INDEX.md`**:
   - Read the existing INDEX.md table
   - Add a new row following the table format:
   ```markdown
   | PR-00007 | AI Misinformation at Scale | AI systems can generate convincing misinformation faster than humans can verify, undermining public trust. |
   ```
   - Keep rows sorted by ID number
2. Update `metadata/index.json` with the new component entry
3. Increment the counter in `metadata/next-ids.json`
4. Add graph edges to `connections/graph.md`
5. Update root `INDEX.md` component counts

### Step 5: Connect

If `auto_connect` is enabled (default):

1. Search existing components for semantic matches
2. For each match, determine the relationship type
3. Add bidirectional cross-references to both component files
4. Update connection maps in `connections/`

### Step 6: Confirm

Report to the user:
- Created component: `{CODE} — {title}`
- Component type: `{Type}`
- Cross-references added: `{count}` connections
- Stub components created: `{list of stubs}`
- Location: `{full path to file}`

## Output

A new markdown file in the correct component type directory, with proper frontmatter, cross-references, and updated indexes.

## Example

**Input**: 
"The problem is that AI systems can generate convincing misinformation at scale, which undermines public trust in information."

**Classification**: Problem (PR)

**Process**:
- Searches for existing Problems about misinformation → finds `PR-003-media-trust-decline.md`
- Searches for Solutions → finds `SO-012-fact-checking-automation.md`
- Assigns code: `PR-007-ai-misinformation-at-scale`
- Creates file with Connections to PR-003, SO-012

**Output**:
```
Created: PR-007-ai-misinformation-at-scale.md
Type: Problem
Connections: 2 (PR-003, SO-012)
Location: ~/substrates/substrate-ai-safety/components/problems/
```

## Edge Cases

- **Multiple types in one description**: Create separate components for each type, cross-reference them
- **Duplicate detection**: Handled by DedupCheck workflow (Step 0) — if a similar component exists, merge sources or prompt user
- **Missing source**: If `verification: "strict"`, prompt user for source attribution before creating
- **Very long descriptions**: Extract multiple atomic components from a single long input