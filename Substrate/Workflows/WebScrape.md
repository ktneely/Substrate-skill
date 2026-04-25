# Workflow: WebScrape

> Extract Substrate components from web content at a given URL.

## Trigger

- User says: "scrape this URL", "extract from this page", "add this article to substrate"
- User provides a URL containing structured or semi-structured knowledge

## Input

- **URL**: The web page to extract from
- **Substrate name**: Target substrate (default: `config.default_substrate`)
- **Optional**: Component type filter, depth (follow links?), max pages

## Process

### Step 0: Deduplication Check (Batch)

**Before creating any components from web content**, run the DedupCheck workflow (`Workflows/DedupCheck.md`) in batch mode against all proposed components.

1. **Internal batch dedup**: After Step 3 (Extract Components) produces the list of proposed components, run dedup across the proposed set itself. If two proposed components within the batch match (≥ 0.85 title similarity), merge them within the batch.

2. **External dedup**: For each remaining proposed component, check against the substrate INDEX.md for that component type. This includes a **special URL dedup check**: search existing Data-Source (DS) components for the target URL. If the URL has already been processed, the entire source already exists in the substrate. Inform the user and offer to:
   - **Skip**: Do not re-extract components from this URL
   - **Update**: Re-extract and merge any new information into existing components
   - **Force**: Create new components anyway (requires `force_create: true`)

3. **Evaluate each match result**:
   - **URL already processed** → Notify user, offer update or skip
   - **Certain/High match** → Merge: Add source URL to existing component, enrich content if applicable
   - **Medium match** → Prompt user for decision
   - **Low match** → Create with log
   - **No match** → Proceed to Step 1: Normal creation flow

4. **After dedup**: The batch now contains only truly new components plus enrichment actions. Proceed to Step 1 (Parse/Fetch).

This step runs on **every** web scrape. It is mandatory and cannot be skipped unless the user explicitly forces creation.

### Step 1: Fetch and Extract

1. Use Parser skill or BrightData skill to fetch the URL content
2. Extract the primary text content, stripping navigation, ads, and boilerplate
3. Extract metadata: title, author, date, publication, URL
4. If the page contains structured data (tables, lists, data), preserve that structure
5. Record full source attribution: `{url}`, `{title}`, `{author}`, `{date}`, `{site}`

### Step 2: Identify Content Type

Classify the source content to inform extraction strategy:

| Source Type | Extraction Strategy |
|-------------|---------------------|
| **News article** | Focus on Claims, Facts, People, Organizations |
| **Research paper** | Focus on Claims, Arguments, Facts, Data-Sources |
| **Blog/opinion** | Focus on Arguments, Ideas, Frames — lower confidence |
| **Policy document** | Focus on Laws, Plans, Organizations, Goals |
| **Company page** | Focus on Organizations, People, Projects, Goals |
| **Wikipedia/encyclopedia** | Focus on Facts, People, Organizations, Events |
| **Social media post** | Focus on Claims, Ideas — lowest confidence |
| **Documentation** | Focus on Data-Sources, Models, Plans |

### Step 3: Extract Components

1. **Apply Fabric patterns** for content analysis:
   - `extract_wisdom` → identifies key insights, ideas, claims
   - `summarize` → captures overview for summaries
   - `extract_entities` → identifies people, organizations, concepts
2. **Classify each extracted item** by component type
3. **Extract relationships** between items found on the same page
4. **Assess confidence** based on source reliability:
   - Academic/government sources → high
   - Reputable news/industry → medium  
   - Opinion/blog/social → low

### Step 4: Create Components

For each extracted knowledge item:

1. Generate proper code and slug
2. Create component file using standard template
3. Set confidence level based on source type
4. Add source attribution with URL, date accessed
5. Add cross-references to other extracted components
6. Add cross-references to existing substrate components

### Step 5: Create Source Component

1. Create a **Data-Source** (DS) component for the URL itself:
   ```markdown
   ---
   code: DS-NNNNN-{slug}
   type: Data-Source
   title: "Source: {page title}"
   ...
   sources:
     - url: {original_url}
       title: "{page title}"
       accessed: YYYY-MM-DD
   ---
   ```
2. Link all extracted components to this DS component
3. This creates an evidence trail from every claim back to its source

### Step 6: Update Indexes

1. Update all INDEX.md files (add table rows for new components)
2. Update metadata/index.json
3. Update metadata/next-ids.json
4. Update connections/graph.md and connection maps

### Step 7: Report

Provide the user with:
- **Source processed**: URL, title, type
- **Components extracted**: Count by type
- **Data-Source created**: DS code for this source
- **Connections**: Internal and external
- **Confidence levels**: Distribution
- **Warnings**:_paywalled content, uncertain classifications

## Output

Multiple component files with a Data-Source component linking them all to the original URL, with source attribution and updated indexes.

## Example

**Input**: `https://www.example.com/ai-safety-report-2024`

**Process**:
1. Fetch and parse the article (3,200 words)
2. Classify as "Research report"
3. Extract: 4 Problems, 6 Solutions, 8 Claims, 3 Arguments, 2 People, 1 Organization
4. Create DS-015-example-ai-safety-report-2024.md
5. Create 24 component files
6. Link all to DS-015 as source
7. Create cross-references to existing substrate (9 connections)

**Report**:
```
Web Scrape Complete: ai-safety-report-2024
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Source:      DS-015 (https://www.example.com/...)
Type:        Research report
Components:  24 extracted
Connections: 31 internal, 9 external
Confidence:  14 high, 8 medium, 2 low
Data Source: DS-015-example-ai-safety-report-2024
```

## Edge Cases

- **Paywalled content**: Report inability to access, suggest manual entry
- **JavaScript-rendered pages**: Use Browser skill for rendering, then extract
- **Multi-page articles**: Follow pagination, extract as single source
- **Video-heavy pages**: Note video content, suggest VideoTranscript workflow
- **Already-processed URLs**: Handled by DedupCheck (Step 0) — search DS components for existing URL, offer to update or skip