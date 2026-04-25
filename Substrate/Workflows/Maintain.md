# Workflow: Maintain

> Audit Substrate for stale components, broken references, missing summaries, and suggest cleanup.

## Trigger

- User says: "clean up substrate", "audit substrate", "maintain substrate", "fix broken references"
- Periodic maintenance (recommended monthly)
- After major merge operations
- User notices stale or broken data

## Input

- **Substrate name**: Which substrate to audit (default: `config.default_substrate`)
- **Optional**: Scope (full audit, quick scan, specific type), fix mode (suggest or auto-fix)

## Process

### Step 1: Structural Integrity

Check that the substrate directory structure is intact:

1. **Verify directory existence**: All 19 component type directories exist
2. **Verify INDEX.md**: Each component type directory has an INDEX.md
3. **Verify metadata files**: `README.md`, `INDEX.md`, `metadata/index.json`, `metadata/taxonomy.json`, `metadata/next-ids.json` all exist
4. **Verify connections directory**: `connections/graph.md` and type-specific maps exist
5. **Report**: Missing files and directories, suggest creation

### Step 2: Component Audit

For each component file in each type directory:

1. **Frontmatter validation**:
   - All required fields present (code, type, title, status, created, updated)
   - Code format matches `{TYPE}-{NNNNN}-{slug}.md` pattern
   - Type matches directory (PR files in problems/, etc.)
   - Status is one of: active, proposed, resolved, deprecated
   - Date fields are valid ISO format
   
2. **Content validation**:
   - Summary section exists and is non-empty
   - Details section exists and is substantive (>50 words)
   - Related section exists
   - No empty sections that should have content

3. **Code consistency**:
   - Filename matches frontmatter code
   - Code number is unique within type
   - Slug matches title (reasonable approximation)
   - Next-ids.json counter >= maximum code number in type

4. **Staleness check**:
   - Components with `updated` date >6 months ago → flag as potentially stale
   - Components with `status: proposed` and `updated` >3 months ago → flag for review
   - Components with `status: resolved` → consider archiving
   - Components with `status: deprecated` → consider removal or archiving

### Step 3: Cross-Reference Audit

For each cross-reference in each component file:

1. **Reference existence**: Does the referenced component file exist?
   - If not, flag as **broken reference**
   - Suggest: create stub, update reference, or remove

2. **Bidirectional check**: If A references B, does B reference A?
   - If not, flag as **one-way reference**
   - Suggest: add reciprocal reference

3. **Type consistency**: Are the relationships type-appropriate?
   - Problem should have "addresses" → Solution, not → Value
   - Flag type mismatches in relationship verbs

4. **Orphan detection**: Components with zero cross-references
   - Flag for review: should this component exist without connections?
   - Suggest: Connect or Remove

### Step 4: Index Audit

1. **INDEX.md completeness**: Does each type's INDEX.md table list all component files?
   - Missing rows → add
   - Extra rows (file deleted but INDEX still references) → remove
   - Ensure table format matches standard (| ID | TITLE | DESCRIPTION |)

2. **index.json completeness**: Does index.json contain entries for all component files?
   - Missing entries → add
   - Extra entries (file deleted) → remove
   
3. **next-ids.json accuracy**: Is the counter consistent with actual component counts?
   - Counter too low → fix (would cause ID collision)
   - Counter too high → acceptable but wasteful

4. **Connection maps**: Are connection maps consistent with actual cross-references?
   - Edges in graph.md that don't exist in component files → remove
   - Component file references not in graph.md → add

### Step 5: Quality Assessment

1. **Confidence distribution**: How many high/medium/low confidence components?
   - Check for components with no confidence field
   - Flag a high percentage of low-confidence components

2. **Source coverage**: How many components have source attribution?
   - Check for claims/facts/arguments without sources
   - Flag components relying on low-quality sources

3. **Content depth**: Are components substantive enough?
   - Summaries <20 words → flag as too short
   - Details sections <50 words → flag as thin
   - Related sections with no entries → flag as disconnected

4. **Tag consistency**: Are tags used consistently?
   - Identify similar but different tags (e.g., "AI" vs "artificial-intelligence")
   - Suggest tag normalization

### Step 6: Generate Report

Compile all findings into a structured maintenance report:

```markdown
# Substrate Maintenance Report

**Substrate**: {name}
**Date**: YYYY-MM-DD
**Components**: {total count}
**Health Score**: {percentage}

## 🔴 Critical Issues (Fix Immediately)

- [ ] {Broken references list}
- [ ] {Missing required files list}

## 🟡 Warnings (Fix Soon)

- [ ] {One-way references list}
- [ ] {Missing source attributions}
- [ ] {Stale components list}

## 🟢 Suggestions (Consider)

- [ ] {Tag normalization suggestions}
- [ ] {Content depth improvements}
- [ ] {Stale component archival}

## Statistics

- Total components: {N}
- Components by type: {breakdown}
- Cross-references: {N} total, {N} broken, {N} one-way
- Orphans: {N} components with zero connections
- Confidence: {N} high, {N} medium, {N} low
- Source coverage: {N}% have sources
- Last updated: {date range}
```

### Step 7: Auto-Fix (Optional)

If `fix_mode: auto`:

1. **Fix broken references**: Remove references to non-existent files, or create stubs
2. **Fix one-way references**: Add reciprocal references
3. **Fix INDEX.md files**: Regenerate table rows from actual component files
4. **Fix index.json**: Regenerate from component files
5. **Fix next-ids.json**: Recalculate from max code numbers

If `fix_mode: suggest` (default):

1. Present all issues with suggested fixes
2. Let user approve individual fixes
3. Batch-execute approved fixes

## Output

A maintenance report plus optional auto-fixes applied.

## Example

**Input**: "Audit the ai-safety substrate"

**Report**:
```
Substrate Maintenance Report: ai-safety
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Date:       2025-01-15
Components: 147 total
Health:     87%

🔴 Critical Issues (3)
  - Broken ref: PR-004 references SO-018 (file missing)
  - Broken ref: AR-009 references CL-025 (file missing)
   - Missing: components/events/INDEX.md

🟡 Warnings (12)
  - One-way: PR-00001 → SO-00003 (no back-reference)
  - One-way: PE-008 ← OR-002 (no forward reference)
  - No source: CL-017, CL-019, CL-022
  - Stale: 5 components not updated since 2024-06
  - Thin content: 7 components with <50 word details

🟢 Suggestions (8)
  - Tag consistency: "AI" → "ai", "artificial-intelligence" → "ai"
  - Consider archiving: 3 resolved Problems
  - Orphans: 4 components with zero connections

Statistics:
  Problems: 15 | Solutions: 12 | Arguments: 18
  Claims: 22 | People: 8 | Orgs: 10
  References: 234 total, 2 broken, 6 one-way
  Confidence: 82 high, 43 medium, 22 low
  Source coverage: 78%

Fix 3 critical issues? [y/N]
```

## Edge Cases

- **Empty substrate**: Create full directory structure, suggest initial components
- **Massive substrates**: Process in batches by type, report progress
- **Breaking changes in fixes**: Always create backups before auto-fix
- **User disagreement with flags**: Allow user to dismiss individual warnings
- **Corrupted files**: Report but don't auto-delete, suggest manual review