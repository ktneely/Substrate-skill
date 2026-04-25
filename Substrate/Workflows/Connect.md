# Workflow: Connect

> Discover and create cross-references between existing Substrate components based on semantic relationships.

## Trigger

- User says: "connect these components", "find relationships", "link these", "build connections"
- User references two or more specific components
- User wants to see how components relate to each other
- After any extraction workflow, auto-connect is performed (but explicit connect goes deeper)

## Input

- **Components**: Specific component codes to connect, OR
- **Component type**: Connect all components of a type, OR
- **Substrate name**: Connect across entire substrate (default: all)
- **Optional**: Relationship type filter, confidence threshold, depth limit

## Process

### Step 1: Identify Scope

Determine the scope of the connection operation:

| Scope | Description |
|-------|-------------|
| **Pair** | Connect two specific components (e.g., PR-00001 and SO-00003) |
| **Type** | Connect all components of a given type (e.g., all Problems) |
| **Cluster** | Connect components within a topic cluster (e.g., "AI safety") |
| **Full** | Connect across entire substrate (comprehensive but expensive) |

### Step 2: Analyze Components

For each component in scope:

1. **Read the component file** — extract title, summary, details, tags
2. **Identify semantic relationships** by comparing with other components:
   - Problem ↔ Solution: Does this problem have solutions? Does this solution address problems?
   - Claim ↔ Fact: Is this claim supported by facts? Do these facts support claims?
   - Argument ↔ Claim: Does this argument support/contradict claims?
   - Person ↔ Organization: Does this person belong to this org?
   - Organization ↔ Project: Does this org own/lead this project?
   - Model ↔ Frame: Does this model inform this frame?
   - Value ↔ Plan: Does this value guide this plan?
   - Goal ↔ Plan: Does this goal drive this plan?

3. **Assess relationship strength**:
   - **Strong**: Explicitly stated in component content (direct mention)
   - **Moderate**: Semantic overlap in content (shared concepts, entities)
   - **Weak**: Inferential (similar tags, adjacent topics)

4. **Classify relationship type** using the canonical ontology:
   - addresses, addressed_by, supported_by, supports, contradicts
   - owns, belongs_to, leads, funds, constrains, guides
   - informs, reframes, involves, evolves_to, related_to

### Step 3: Validate Connections

For each proposed relationship:

1. **Confidence check**: Is this relationship explicitly stated or reasonably inferred?
2. **Bidirectionality**: If A relates to B, ensure B references A with the inverse relationship
3. **Cardinality check**: Does this relationship make sense? (e.g., a Problem can have many Solutions)
4. **No circular references**: Ensure no A → B → C → A cycles that are meaningless
5. **Deduplication**: Ensure this relationship doesn't already exist

### Step 4: Create Cross-References

For each validated relationship:

1. **Add to both component files**: Update the "Related" sections
2. **Specify the relationship type** with the canonical verb:
   ```markdown
   ## Related
   
   - **Addresses**: [SO-00003-fact-checking-automation] — This solution addresses PR-00001
   ```
3. **Remove stale references**: If a reference points to a deleted or deprecated component, flag it

### Step 5: Update Connection Maps

1. **Update `connections/graph.md`**: Add new edges with relationship types
2. **Update type-specific maps**:
   - `connections/problem-solution-map.md`: New PR ↔ SO mappings
   - `connections/claim-evidence-trails.md`: New CL → FA/DS chains
   - `connections/people-organization-map.md`: New PE ↔ OR relationships
3. **Regenerate `metadata/index.json`** with updated relationship counts

### Step 6: Report

Provide the user with:
- **Components analyzed**: Count and scope
- **New connections discovered**: Count by relationship type and strength
- **Existing connections validated**: Confirmed, removed, or updated
- **Orphan components**: Components with zero connections (flagged for review)
- **Graph statistics**: Average connections per component, most-connected components

## Output

Updated component files with new cross-references, updated connection maps, and updated metadata indexes.

## Example

**Input**: "Connect PR-00001 to the ai-safety substrate"

**Process**:
1. Read PR-00001 component details
2. Search all component types for semantic relationships
3. Find: SO-00003 addresses PR-00001, AR-007 supports PR-00001, PE-012 involved in PR-00001
4. Validate each relationship
5. Add cross-references to all affected component files
6. Update connection maps

**Report**:
```
Connection Analysis Complete: PR-00001 → ai-safety substrate
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Analyzed:     1 target + 147 substrate components
New connections discovered: 7
  Strong:   3 (explicitly mentioned)
  Moderate: 3 (semantic overlap)
  Weak:     1 (inferential)

Relationships:
  PR-00001 ←addresses← SO-00003, SO-008
  PR-00001 ←supported_by← AR-007, AR-012
  PR-00001 ←involves← PE-012
  PR-00001 ←constrained_by← LA-004
  PR-00001 ←reframes← FR-002

Orphans:    12 components with <2 connections (flagged)
```

## Edge Cases

- **Very large substrates**: Process in batches by type, then connect types
- **Ambiguous relationships**: Present options to user for confirmation
- **Circular references**: Break meaningless cycles, keep meaningful dialectics (PR ↔ SO ↔ AR)
- **Components with many connections**: Limit to strongest N relationships, archive weaker ones
- **Mixed strength**: Prefer strong connections over weak; don't dilute the graph