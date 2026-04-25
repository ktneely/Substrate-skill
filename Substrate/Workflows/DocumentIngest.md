# Workflow: DocumentIngest

> Extract Substrate components from a document file (PDF, DOCX, TXT, MD).

## Trigger

- User says: "ingest this document", "process this PDF", "extract from this file"
- User provides or references a document file path

## Input

- **Document path**: Full path to the file (PDF, DOCX, TXT, MD, or other parseable format)
- **Substrate name**: Which substrate to add components to (default: `config.default_substrate`)
- **Optional**: Component type filter (only extract certain types), confidence threshold

## Process

### Step 0: Deduplication Check (Batch)

**Before creating any components from a document**, run the DedupCheck workflow (`Workflows/DedupCheck.md`) in batch mode against all proposed components.

1. **Internal batch dedup**: After Step 2 (Analyze and Classify) produces the list of proposed components, run dedup across the proposed set itself. If two proposed components within the batch match (≥ 0.85 title similarity), merge them within the batch — combine their content, tags, and cross-references.

2. **External dedup**: For each remaining proposed component, check against the substrate INDEX.md for that component type.

3. **Evaluate each match result**:
   - **Certain/High match** → Merge: Add the document source to the existing component, enrich content if applicable, skip creation of a new component for this item
   - **Medium match** → Prompt user: Present the similar existing component, user decides merge or distinct. Batch similar matches together to reduce prompts.
   - **Low match** → Create with log: Proceed with creation, log similarity for review
   - **No match** → Proceed to Step 1: Normal creation flow

4. **After dedup**: The batch now contains only truly new components plus enrichment actions for existing components. Proceed to Step 1 (which was previously Step 1 — Parse Document is now Step 1, Analyze is Step 2, and Create Components becomes Step 3).

5. **Report dedup summary**: Include in the final report:
   - Internal merges (within batch)
   - External merges (with existing substrate components)
   - Distinct creates
   - User decisions on medium-confidence matches

This step runs on **every** document ingestion. It is mandatory and cannot be skipped unless the user explicitly forces creation with `force_create: true`.

### Step 1: Parse Document

1. Determine file type from extension
2. Use Parser skill to extract text content:
   - **PDF**: Use `Pdf` skill for text extraction
   - **DOCX**: Use `Docx` skill for text extraction
   - **TXT/MD**: Read directly
   - **Other formats**: Attempt parser, report unsupported formats
3. Extract title, author, date from metadata when available
4. Record source attribution: `{filename}`, `{author}`, `{date}`, `{filepath}`

### Step 2: Analyze and Classify

Using the extracted text, identify potential Substrate components:

1. **Read through the entire text** and identify distinct knowledge items
2. **Classify each item** using the component type taxonomy
3. **Assess atomicity** — ensure each extracted item represents ONE concept
4. **Extract relationships** between identified items
5. **Extract external references** (people, organizations, sources mentioned)

Classification heuristics:
- Sentences starting with "The problem is..." → Problem
- Sentences with "We propose..." or "The solution is..." → Solution
- Sentences beginning with "I argue..." or "The argument is..." → Argument
- Statistical statements or verifiable claims → Claim or Fact
- Step-by-step descriptions → Plan
- Descriptions of a person → Person
- Descriptions of a company/org → Organization

### Step 3: Create Components

For each identified knowledge item:

1. Generate proper code (read `metadata/next-ids.json`)
2. Create the component file using the standard template
3. Set `confidence` based on source reliability:
   - **high**: Peer-reviewed, official documents, primary sources
   - **medium**: News articles, reports, secondary sources
   - **low**: Opinion pieces, social media, unverified claims
4. Add source attribution in frontmatter
5. Add cross-references to other extracted components
6. Add cross-references to existing substrate components (if `auto_connect` enabled)

### Step 4: Build Internal References

Within the same document extraction, create connections:

1. Map Problems → Solutions mentioned in the same document
2. Link Claims → supporting Facts from the same source
3. Connect People → Organizations they're associated with
4. Link Arguments → Claims they support or contradict
5. Create a **document-level event** (EV component) that ties all extracted items to the source document

### Step 5: Update Indexes

1. Update `INDEX.md` for each affected component type directory (add table rows for each new component)
2. Update `metadata/index.json` with all new components
3. Update `metadata/next-ids.json` with incremented counters
4. Update `connections/graph.md` with new edges
5. Update relevant connection maps in `connections/`

### Step 6: Report

Provide the user with:
- **Components extracted**: Count by type
- **Cross-references created**: Count
- **New stubs generated**: List
- **Potential duplicates flagged**: List of similar existing components
- **Confidence distribution**: How many high/medium/low confidence items
- **Source attribution**: File, author, date recorded

## Output

Multiple component files created across appropriate type directories, with internal cross-references, source attribution, and updated indexes.

## Example

**Input**: `~/documents/ai-regulation-whitehouse-2024.pdf`

**Process**:
1. Parse PDF → extract 47 pages of text
2. Identify 12 Problems, 8 Solutions, 15 Claims, 6 Arguments, 3 Organizations, 5 People, 4 Laws
3. Create 53 component files across type directories
4. Create internal cross-references (87 connections)
5. Create external cross-references to existing substrate (23 connections)
6. Create EV component for the document event itself

**Report**:
```
Document Ingest Complete: ai-regulation-whitehouse-2024.pdf
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Components:  53 total
  Problems:  12 | Solutions:  8 | Claims:    15
  Arguments:  6 | People:     5 | Organizations: 3
  Laws:       4 | Event:      1

Connections: 110 total (87 internal, 23 external)
Stubs:       7 auto-generated
Confidence:  28 high, 18 medium, 7 low
Source:      White House AI Regulation Report, 2024
```

## Edge Cases

- **Corrupt or empty files**: Report error, suggest alternative sources
- **Very large documents**: Process in chunks, maintain coherence between chunks
- **Duplicate with existing components**: Handled by DedupCheck workflow (Step 0) — merge sources or prompt user
- **Ambiguous classification**: Create as best-fit type, note ambiguity in Notes section
- **Non-text content (images, charts)**: Note in metadata, suggest manual entry for visual data