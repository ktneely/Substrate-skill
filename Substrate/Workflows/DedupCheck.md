# Workflow: DedupCheck

> Prevent duplicate components by checking the substrate index before creating any new component.

## Purpose

When adding components to a substrate — whether by manual entry, document ingestion, web scraping, or video transcription — the system may encounter knowledge that already exists in the substrate under a different code, source, or time. Duplicate components erode graph integrity, inflate counts, and create conflicting partial references. This workflow defines how to detect, evaluate, and resolve potential duplicates **before** a new component is created.

**This workflow runs as Step 0 in every ingestion workflow** (ManualEntry, DocumentIngest, WebScrape, VideoTranscript). It must complete before any component file is written.

---

## Trigger

Invoked automatically by ingestion workflows before component creation. Not a standalone user-facing workflow.

---

## Input

| Field | Type | Description |
|-------|------|-------------|
| `proposed_type` | string | Component type code (PR, SO, AR, CL, etc.) |
| `proposed_title` | string | Working title for the new component |
| `proposed_summary` | string | One-paragraph summary content |
| `proposed_tags` | string[] | Tags intended for the component |
| `proposed_sources` | object[] | Source URLs and attributions |
| `proposed_content` | string | Full content (Details section) if available |
| `substrate_name` | string | Target substrate (default: `config.default_substrate`) |

---

## Process

### Step 1: Load Index

Read the INDEX.md file for the proposed component type:

```
{base_path}/substrate-{name}/components/{type_dir}/INDEX.md
```

Parse the table rows to extract all existing components of the proposed type. Each row provides: `CODE`, `TITLE`, `DESCRIPTION`.

If the INDEX.md does not exist (empty type directory), there are no duplicates possible — proceed to Step 5 (skip).

### Step 2: Title Similarity Match

For each existing component of the same type, compute a **title similarity score** against the proposed title.

#### 2a: Normalization

Before comparison, normalize both titles through these transformations (applied to the existing title and the proposed title):

1. **Lowercase** the entire string
2. **Remove articles**: strip `a`, `an`, `the` (only as standalone words)
3. **Remove punctuation**: strip `, . ; : ! ? ( ) [ ] { } — "" ''`
4. **Normalize whitespace**: collapse runs of spaces/tabs to single space, trim
5. **Normalize hyphens**: convert en-dash/em-dash to hyphen
6. **Lemmatize common forms**: `organizations` → `organization`, `systems` → `system` (best-effort, English)
7. **Remove stop words**: `of`, `in`, `at`, `on`, `for`, `to`, `by`, `with`, `from`, `and`, `or`, `is`, `are`

#### 2b: Comparison Algorithm

Apply these checks in order. A match at any level is sufficient to flag.

| Match Level | Method | Threshold | Description |
|-------------|--------|-----------|-------------|
| **Exact** | String equality of normalized titles | 1.0 | Titles are identical after normalization |
| **Contains** | Proposed title is a substring of existing title, or vice versa | N/A | One contains the other |
| **Fuzzy** | Jaro-Winkler similarity | ≥ 0.85 | Close semantic match with minor wording differences |
| **Token Overlap** | Jaccard similarity of word sets | ≥ 0.70 | Significant word overlap |

**Scoring**: The highest match level achieved determines the confidence:
- Exact match → `match.confidence = "certain"`, score = 1.0
- Contains match → `match.confidence = "high"`, score = 0.90
- Fuzzy match → `match.confidence = "high"`, score = Jaro-Winkler value
- Token overlap match → `match.confidence = "medium"`, score = Jaccard value

If **no title match** meets threshold, proceed to Step 3.

### Step 3: Content & Tag Overlap Check

When title similarity is inconclusive (score < 0.70), check deeper signals:

#### 3a: Tag Overlap

Compare the proposed tags against each existing component's tags (from frontmatter).

- Compute Jaccard similarity of tag sets
- Threshold: ≥ 0.50 (at least half the tags overlap)
- If tag overlap ≥ 0.50 **and** title similarity ≥ 0.50, flag as `match.confidence = "medium"`

#### 3b: Core Concept Extraction

If the proposed content (summary + details) is available:

1. Extract the **first sentence** of the proposed summary
2. Compare against the **first sentence** of each existing component's summary (from INDEX.md description column)
3. Compute Jaccard similarity of word sets
4. Threshold: ≥ 0.60 to flag as `match.confidence = "low"`

#### 3c: Cross-Reference Overlap

If the proposed component lists related components in its content:

1. Extract proposed cross-references (codes like PR-001, SO-003)
2. Compare against each existing component's cross-references
3. If ≥ 2 shared cross-references, flag as `match.confidence = "low"`

### Step 4: Match Evaluation

Aggregate all match signals and render a decision:

| Scenario | Match Confidence | Action |
|----------|-----------------|--------|
| Title exact match | `certain` | **Merge** — Do not create new component. Add source to existing. |
| Title contains/fuzzy ≥ 0.85 | `high` | **Merge** — Do not create new component. Add source to existing. Prompt user if uncertain. |
| Title fuzzy 0.70–0.84 + tag overlap ≥ 0.50 | `medium` | **Prompt user** — Present the similar existing component. User decides: merge or create distinct. |
| Content overlap only | `low` | **Create** — Components are likely distinct. Log the similarity for review but proceed with creation. |
| No match | `none` | **Create** — No duplicate detected. Proceed normally. |

#### User Prompt (for medium-confidence matches)

When a medium-confidence match is found, the workflow must pause and present the user with:

```
Potential duplicate detected:
━━━━━━━━━━━━━━━━━━━━━━━━
Proposed: [{TYPE}] {proposed_title}
Existing: [{TYPE}] {existing_code} — {existing_title}

Similarity: {score} ({match_method})

Proposed summary: {first 100 chars of proposed_summary}
Existing summary: {first 100 chars of existing_description}

Choose:
  [M] Merge — Add source to existing component, skip creation
  [D] Create distinct — Create new component with explicit distinction
  [V] View existing — Read full existing component before deciding
```

### Step 5: Merge Procedure

When a duplicate is confirmed (certain or high confidence, or user-selected merge):

#### 5a: Do NOT Create a New Component File

The proposed component is not written to disk. No code is assigned.

#### 5b: Add Source to Existing Component

Open the existing component file. In the frontmatter `sources` array, add the new source:

```yaml
sources:
  - url: "https://original-source.com/article"
    title: "Original Source Title"
    accessed: 2025-01-15
  - url: "https://new-source.com/article"      # ← ADDED
    title: "New Source Title"                    # ← ADDED
    accessed: 2025-03-22                         # ← ADDED
```

When the source has no URL (e.g., from a PDF document), use the file path or document title:

```yaml
sources:
  - url: "document:ai-regulation-whitehouse-2024.pdf"
    title: "AI Regulation White House Report 2024"
    accessed: 2025-03-22
```

#### 5c: Enrich Content (Optional)

If the proposed component contains information NOT present in the existing component:

1. **Title**: Do NOT change the existing title (it may have downstream references)
2. **Summary**: If the proposed summary is more complete or accurate, **suggest** the update but do not overwrite. Add to the `Notes` section:
   ```markdown
   ## Notes
   ...
   **Alternative summary from [Source Title] (2025-03-22):**
   > {proposed_summary}
   ```
3. **Details**: If the proposed content adds new information, **append** it under a subheading:
   ```markdown
   ## Details
   ...existing content...

   ### Additional Context from {Source Title} ({Date})

   {new information}
   ```
4. **Tags**: Merge proposed tags into existing tags if they enrich categorization (add missing tags, do not remove existing)
5. **Cross-references**: Add any new cross-references from the proposed component

#### 5d: Update INDEX.md

If the existing component's description (3rd column) would be enriched by the merge, update the row in INDEX.md.

#### 5e: Log the Dedup Action

Record the merge in the maintenance audit trail. This can be appended to a dedup log within the substrate:

```
{base_path}/substrate-{name}/metadata/dedup-log.json
```

```json
{
  "timestamp": "2025-03-22T14:30:00Z",
  "action": "merge",
  "proposed_type": "PR",
  "proposed_title": "AI Misinformation Undermines Public Trust",
  "existing_code": "PR-00007",
  "existing_title": "AI Misinformation at Scale",
  "match_method": "fuzzy_title",
  "match_score": 0.87,
  "source_added": {
    "url": "https://new-source.com/article",
    "title": "New Source Title"
  }
}
```

### Step 6: Create Distinct (User Decision)

When the user decides the proposed component is **distinct** from the similar one:

1. Create the component as normal
2. Add an explicit cross-reference between the two components:
   - In the new component: `**Related to**: [{existing_code}] — Similar to but distinct from {existing_title}`
   - In the existing component: Add `**Related to**: [{new_code}] — Similar to but distinct from {proposed_title}`
3. Log the decision in `dedup-log.json`:

```json
{
  "timestamp": "2025-03-22T14:35:00Z",
  "action": "create_distinct",
  "proposed_type": "PR",
  "proposed_title": "AI Misinformation Undermines Democratic Processes",
  "existing_code": "PR-00007",
  "existing_title": "AI Misinformation at Scale",
  "match_method": "token_overlap",
  "match_score": 0.72,
  "distinction_note": "Different scope: PR-00007 focuses on trust erosion, new component focuses on democratic process impact"
}
```

---

## Cross-Type Deduplication

The primary dedup check scans components **within the same type** (PR vs PR, SO vs SO). However, some entities may appear in different type directories:

### Cross-Type Heuristics

| Scenario | Check |
|----------|-------|
| Person (PE) vs Organization (OR) | A person named like an org (e.g., "OpenAI" could be PE or OR) — check both directories |
| Idea (ID) vs Solution (SO) | An idea that has evolved into a solution — check ID for related SO entries |
| Claim (CL) vs Fact (FA) | A fact that was previously a claim — check CL for upgrading to FA |
| Event (EV) cross-references | An event may already be captured via DS (Data-Source) from a document |

Cross-type dedup is **advisory only** — present potential cross-type matches to the user, but do not block creation.

---

## Batch Ingestion (DocumentIngest, WebScrape, VideoTranscript)

For workflows that create multiple components at once:

### Step 0a: Internal Dedup

Before checking against the substrate, deduplicate **within the batch**:

1. Collect all proposed components from the extraction phase
2. Run the title similarity algorithm across the proposed set
3. If two proposed components within the batch match (≥ 0.85 title similarity), merge them:
   - Combine their content (summary + details)
   - Merge their tags
   - Collect all their cross-references
4. This prevents creating 5 components about "AI safety risks" from a single document

### Step 0b: External Dedup

After internal dedup, check each remaining proposed component against the substrate index as described above.

### Step 0c: Batch Report

For batch workflows, include a dedup summary in the final report:

```
Deduplication Summary:
  Internal merges:  3 (within batch)
  External merges:  2 (with existing substrate components)
  Distinct creates: 48
  User decisions:   1 (medium-confidence match prompted)
```

---

## Configuration

Dedup check behavior can be configured in `config.yaml`:

```yaml
substrate:
  dedup:
    # Enable/disable dedup checking (default: true)
    enabled: true

    # Title similarity threshold for automatic merge (0.0-1.0)
    # Matches at or above this threshold are merged without prompting
    auto_merge_threshold: 0.85

    # Title similarity threshold for prompting user (0.0-1.0)
    # Matches between prompt_threshold and auto_merge_threshold prompt the user
    prompt_threshold: 0.70

    # Tag overlap threshold for medium-confidence matching (0.0-1.0)
    tag_overlap_threshold: 0.50

    # Enable cross-type dedup checks (slower but more thorough)
    cross_type_check: true

    # Log all dedup actions to dedup-log.json
    log_actions: true
```

---

## Edge Cases

### Partial Title Match with Different Scope

Two components about "AI misinformation" might cover different scopes:
- PR-007: "AI Misinformation at Scale" (societal-level)
- PR-042: "AI Misinformation in Healthcare" (domain-specific)

These are **not duplicates** — they address different problems. The system should:
1. Detect the high title similarity
2. Prompt the user with both summaries
3. Create distinct components with explicit cross-references if user confirms

### Same Topic, Different Source, Different Angle

An article from *The Atlantic* and a research paper from *arXiv* about the same topic:
- They cover the same Problem but from different perspectives
- Merge them under the existing Problem component
- Both sources are recorded
- If the articles present genuinely different claims, create separate Claim (CL) components for each

### Conflicting Information

When merging reveals that the new source contradicts the existing component:
1. **Do not overwrite** the existing information
2. Note the conflict in the existing component's Notes section
3. Consider creating an Argument (AR) component documenting the conflicting positions
4. Log the conflict in dedup-log.json

```markdown
## Notes
...
**⚠️ Conflicting information from [New Source Title] (2025-03-22):**
> {contradicting claim}

See AR-{NNNNN} for analysis.
```

### Degraded Matching (No Available Index)

If the INDEX.md for a type directory is missing or empty, skip dedup for that type and proceed with creation. Log the skipped check.

### User Override

If the user explicitly commands "create this component even if it duplicates an existing one" (e.g., `force_create: true`), skip the dedup check and create. Log this override.

---

## Algorithm Summary

```
DEDUP_CHECK(proposed_type, proposed_title, proposed_summary, proposed_tags, proposed_sources, proposed_content, substrate_name):

  matches = []

  // Step 1: Load index
  index = LOAD_INDEX(substrate_name, proposed_type)
  if index is empty: RETURN "no_match"

  // Step 2: Title similarity
  for each existing_component in index:
    norm_proposed = NORMALIZE(proposed_title)
    norm_existing = NORMALIZE(existing_component.title)
    
    if norm_proposed == norm_existing:
      matches.append({component: existing_component, confidence: "certain", score: 1.0, method: "exact_title"})
    else if norm_proposed IN norm_existing OR norm_existing IN norm_proposed:
      matches.append({component: existing_component, confidence: "high", score: 0.90, method: "contains_title"})
    else:
      jw = JARO_WINKLER(norm_proposed, norm_existing)
      if jw >= 0.85:
        matches.append({component: existing_component, confidence: "high", score: jw, method: "fuzzy_title"})
      else:
        jaccard = TOKEN_JACCARD(norm_proposed, norm_existing)
        if jaccard >= 0.70:
          matches.append({component: existing_component, confidence: "medium", score: jaccard, method: "token_overlap"})

  if no matches:
    // Step 3: Content & Tag check
    for each existing_component in index:
      tag_jaccard = TAG_JACCARD(proposed_tags, existing_component.tags)
      if tag_jaccard >= 0.50 AND TITLE_SIMILARITY() >= 0.50:
        matches.append({component: existing_component, confidence: "medium", score: tag_jaccard, method: "tag_overlap"})
      
      content_jaccard = SENTENCE_JACCARD(proposed_summary, existing_component.description)
      if content_jaccard >= 0.60:
        matches.append({component: existing_component, confidence: "low", score: content_jaccard, method: "content_overlap"})

  // Step 4: Evaluate
  if matches.is_empty: RETURN "no_match"
  
  best_match = matches.highest_confidence
  
  if best_match.confidence in ["certain", "high"]:
    RETURN "merge", best_match
  elif best_match.confidence == "medium":
    RETURN "prompt_user", best_match
  else:  // low
    RETURN "create_with_log", best_match
```

---

## Integration Points

This workflow is invoked at **Step 0** in the following ingestion workflows:

| Workflow | Integration |
|----------|-------------|
| **ManualEntry** | Before Step 1 (Classify), after input is parsed |
| **DocumentIngest** | Before Step 3 (Create Components), after Step 2 (Analyze and Classify) |
| **WebScrape** | Before Step 4 (Create Components), after Step 3 (Extract Components) |
| **VideoTranscript** | Before Step 6 (Create Components), after Step 5 (Add Timestamp References) |

Each of these workflows has been updated to include a "Step 0: Deduplication Check" that references this workflow.

---

*Duplicates are entropy in a knowledge graph. Every duplicate that slips through degrades traversability, inflates counts, and fractures the very connectivity that makes Substrate powerful. Dedup is not optional — it is a constitutional requirement.*