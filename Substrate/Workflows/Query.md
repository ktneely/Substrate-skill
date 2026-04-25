# Workflow: Query

> Search the Substrate knowledge graph and return connected answers with evidence trails.

## Trigger

- User says: "what does substrate say about...", "query substrate for...", "search for", "tell me about"
- User asks a question that could be answered by structured knowledge
- User wants to understand relationships between components

## Input

- **Query**: Natural language question or topic
- **Substrate name**: Which substrate to search (default: all substrates)
- **Optional**: Component type filter, confidence threshold, max results, depth of traversal

## Process

### Step 1: Parse the Query

Analyze the user's question to determine:

1. **Question type**:
   - **Factual**: "What is the population of France?" → Search Facts
   - **Relational**: "How does AI safety relate to regulation?" → Search + traverse
   - **Proscriptive**: "What solutions address climate change?" → Search Problems → Solutions
   - **Evaluative**: "What arguments support this claim?" → Search Claims → Arguments
   - **Exploratory**: "Tell me about this topic" → Broad search across all types

2. **Key entities and concepts**: Extract nouns, named entities, and conceptual terms
3. **Desired output format**: Summary, detailed, or graph visualization

### Step 2: Search Components

1. **Keyword search**: Match query terms against component titles, summaries, tags
2. **Semantic search**: Identify conceptually related components even with different terms
3. **Type-filtered search**: If question type maps to specific component types, prioritize those
4. **Search across directories**: Query all component type directories for matches

Search algorithm:
```
for each component_type in substrate:
    for each component in component_type:
        score = 0
        score += keyword_match(query, component.title) * 3
        score += keyword_match(query, component.summary) * 2
        score += keyword_match(query, component.tags) * 2
        score += keyword_match(query, component.details) * 1
        if score > threshold:
            results.add(component, score)
```

### Step 3: Traverse the Graph

For each matching component, traverse cross-references to build evidence trails:

1. **Primary results**: The directly matching components
2. **First-degree connections**: Components cross-referenced by primary results
3. **Second-degree connections**: Components cross-referenced by first-degree (optional, controlled by depth)

Build relationship chains:
- Problem → Solution → Evidence trail
- Claim → supporting Facts → Data Sources
- Person → Organization → Projects
- Argument → supports/contradicts → Claims

### Step 4: Assess Confidence

For each result and connection in the answer:

1. **Component confidence**: Use the component's `confidence` field (high/medium/low)
2. **Source reliability**: Check if the component has source attribution (DS cross-reference)
3. **Corroboration**: Multiple independent sources supporting the same claim → higher confidence
4. **Contradiction**: Arguments that contradict → flag as contested

### Step 5: Compose Answer

Structure the response using the "Answer First" principle:

1. **Direct Answer**: One-paragraph summary answering the question
2. **Evidence Trail**: Chain of components supporting the answer
3. **Confidence Level**: Assessment of answer reliability
4. **Caveats**: What's missing, what's contested, what's uncertain
5. **Further Reading**: Related components for deeper exploration

Format:
```markdown
## Answer

{Direct answer to the question, derived from substrate components}

## Evidence

- **[PR-003]**: {Problem statement supporting this answer} → Confidence: high
  - **Addressed by**: [SO-012] {Solution description}
  - **Supported by**: [FA-008] {Factual evidence}

- **[CL-005]**: {Relevant claim} → Confidence: medium
  - **Supported by**: [DS-003] {Data source}
  - **Contested by**: [AR-009] {Counter-argument}

## Confidence Assessment

Based on {N} components with confidence distribution: {X} high, {Y} medium, {Z} low.

## Caveats

- {What's missing or uncertain}
- {What's actively contested}

## Explore Further

- [PR-NNNNN]: {Related problem}
- [SO-NNNNN]: {Related solution}
- [AR-NNNNN]: {Related argument}
```

### Step 6: Report

Provide the answer plus metadata:
- **Components searched**: Total in substrate
- **Results matched**: Direct matches for the query
- **Connections traversed**: First and second degree
- **Confidence distribution**: High/medium/low across results
- **Query interpretation**: How the natural language was parsed

## Output

A structured answer with evidence trails, confidence assessment, and exploration paths.

## Example

**Input**: "What does our substrate say about AI safety regulation?"

**Process**:
1. Parse: Relational question about AI safety + regulation
2. Search: Find 8 related Problems, 5 Solutions, 12 Claims, 6 Arguments
3. Traverse: Build evidence chains from Problems → Solutions → Evidence → Arguments
4. Assess: 15 components high confidence, 10 medium, 6 low
5. Compose: Answer-first summary with evidence trails

**Answer**:
```
Query Results: AI safety regulation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Answer

AI safety regulation is a contested domain where multiple competing approaches 
address the fundamental problem that AI systems can cause harm at scale without 
appropriate oversight. The substrate contains 8 problems, 5 proposed solutions, 
and 12 claims supported by varied evidence.

## Key Problems

- **PR-00001**: AI misinformation at scale undermines public trust → High confidence
  - Addressed by: SO-00003 (fact-checking automation), SO-008 (regulation frameworks)
  - Supported by: FA-002 (misinformation incident data)

- **PR-004**: Lack of regulatory consensus across jurisdictions → High confidence
  - Addressed by: SO-012 (international coordination)
  - Constrained by: LA-001 (EU AI Act), LA-003 (US executive order)

## Confidence Assessment

Based on 31 components: 15 high, 10 medium, 6 low.
Primary sources: DS-005, DS-011, DS-015

## Caveats

- Limited coverage of Asian regulatory approaches
- Some claims based on 2023 data, may be outdated
- Active debate between pro-regulation and pro-innovation camps

## Explore Further

- AR-007: "Current regulatory approaches are insufficient"
- MO-003: "Precautionary principle applied to AI"
- FR-002: "National security vs. open development"
```

## Edge Cases

- **No results**: Suggest broader search, offer to create initial components via Expand
- **Too many results**: Ask user to narrow scope or filter by type
- **Contradictory evidence**: Present both sides, flag as contested, create Argument components
- **Ambiguous query**: Ask clarifying questions about what aspect they care about
- **Cross-substrate queries**: Search across multiple substrates, note which substrate each result comes from