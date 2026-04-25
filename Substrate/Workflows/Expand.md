# Workflow: Expand

> Research and deepen knowledge around an existing component, expanding the substrate network.

## Trigger

- User says: "expand on this", "research this component", "deepen this topic", "add more to PR-00001"
- User wants to grow the knowledge graph around a specific component or topic
- After initial component creation, user wants more context

## Input

- **Component code**: The component to expand (e.g., PR-00001, SO-00003)
- **Substrate name**: Target substrate (default: `config.default_substrate`)
- **Optional**: Depth limit (default: `config.expand_max_depth`), focus area, research scope

## Process

### Step 1: Read Target Component

1. Load the target component file
2. Extract: title, summary, details, tags, existing cross-references
3. Identify knowledge gaps from the component's current state:
   - Missing solutions (for Problems)
   - Missing evidence (for Claims/Arguments)
   - Missing context (for People/Organizations)
   - Missing connections (for any type)

### Step 2: Generate Research Queries

Based on the component type, generate targeted research queries:

| Component Type | Research Focus |
|----------------|---------------|
| **PR** (Problem) | Solutions attempted, affected populations, root causes, evidence of the problem |
| **SO** (Solution) | Evidence of effectiveness, trade-offs, implementations, comparisons to alternatives |
| **AR** (Argument) | Supporting and contradicting evidence, key proponents, rebuttals |
| **CL** (Claim) | Verifying evidence, contradicting evidence, context, source reliability |
| **PE** (Person) | Affiliations, work, positions, influence, connections to other entities |
| **OR** (Organization) | Key people, projects, funding, goals, controversies |
| **PJ** (Project) | Status, people involved, outcomes, related projects |
| **MO** (Model) | Applications, limitations, criticisms, related models |
| **FR** (Frame) | When applicable, limitations, alternative frames |

Generate 3-5 specific research queries from the component's content.

### Step 3: Execute Research

1. Use Research skill to execute each query
2. Use Fabric `extract_wisdom` pattern on research results
3. Use Exa web search for targeted information
4. Collect findings, sources, and evidence

### Step 4: Extract New Components

From research results, extract and classify:

1. **New facts** → FA components (with source attribution)
2. **New claims** → CL components (with confidence level)
3. **Related people** → PE components (with verification)
4. **Related organizations** → OR components (with details)
5. **New solutions** (if expanding a Problem) → SO components
6. **Supporting arguments** → AR components
7. **Data sources** → DS components
8. **Relevant laws/regulations** → LA components

### Step 5: Create and Connect

1. Create all new component files using standard template
2. Add cross-references from new components → target component
3. Add cross-references from target component → new components
4. Create DS components for all research sources
5. Link all new components to their respective DS sources

### Step 6: Depth Control

If depth > 1 (recursive expansion):

1. For each newly created component, assess if further expansion is warranted
2. Priority for expansion:
   - Components with high research yield
   - Components with zero existing connections
   - Components flagged as "important" or "central" in the graph
3. Recursively expand up to `expand_max_depth` levels
4. Track expansion depth in each component's Notes section

### Step 7: Update Indexes

1. Update all INDEX.md files for affected types (add table rows for new components)
2. Update metadata/index.json and next-ids.json
3. Update connections/graph.md and connection maps
4. Flag any newly discovered contradictions with existing components

### Step 8: Report

Provide the user with:
- **Expansion target**: The component being expanded
- **New components created**: Count by type
- **New connections**: Count
- **Research sources**: DS components created for sources
- **Knowledge gaps remaining**: What still needs investigation
- **Suggested further expansion**: Components that would benefit from deeper research

## Output

New component files expanding the knowledge around the target, with cross-references connecting back to the original and to each other, plus updated indexes.

## Example

**Input**: "Expand PR-00001-ai-misinformation-at-scale"

**Process**:
1. Read PR-00001: "AI misinformation at scale undermines public trust"
2. Identify gaps: No solutions linked, no evidence cited, no people/orgs connected
3. Generate queries: "AI misinformation solutions", "scale of AI misinformation", "organizations working on AI misinformation"
4. Research: Find 12 relevant sources
5. Extract: 2 Facts, 3 Claims, 4 Solutions, 2 People, 1 Organization, 2 Data-sources
6. Create 14 new components, link all to PR-00001
7. Link new components to each other where relevant

**Report**:
```
Expansion Complete: PR-00001-ai-misinformation-at-scale
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Target:       PR-00001 (depth: 1/3)
New components created: 14
  Solutions: 4 | Claims: 3 | Facts:     2
  People:    2 | Orgs:      1 | Sources:  2

New connections: 23 (14 to PR-00001, 9 inter-component)
Research sources: 6 (2 DS components created)

Gaps remaining:
  - Quantitative evidence on misinformation scale
  - Regulatory approaches beyond EU AI Act

Suggested expansion:
  - SO-015-fact-checking-automation (research effectiveness evidence)
  - PE-008-sam-altman (expand stance on AI regulation)
```

## Edge Cases

- **Max depth reached**: Report what would have been expanded, suggest manual continuation
- **Circular expansion**: Don't expand components that were just created in the current session
- **Low-quality sources**: Flag low-confidence findings, suggest verification
- **Contradictions with existing**: Create explicit Argument components for the contradiction
- **Topic too broad**: Suggest narrowing the expansion scope