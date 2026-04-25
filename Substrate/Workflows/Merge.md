# Workflow: Merge

> Merge data from one substrate into another, resolving conflicts and maintaining referential integrity.

## Trigger

- User says: "merge these substrates", "combine substrate A into B", "merge knowledge domains"
- User wants to consolidate multiple substrates into one
- User wants to import one substrate's knowledge into another

## Input

- **Source substrate**: The substrate to merge from
- **Target substrate**: The substrate to merge into
- **Optional**: Merge strategy (conservative, aggressive), conflict resolution mode (ask, prefer-source, prefer-target), component type filter

## Process

### Step 1: Pre-Merge Analysis

Before any changes, analyze both substrates:

1. **Count components by type** in both source and target
2. **Identify overlapping component types** that exist in both
3. **Detect potential duplicates**:
   - Compare titles and slugs for similarity
   - Compare summaries for semantic overlap
   - Use fuzzy matching (threshold: 0.85 similarity)
4. **Identify cross-substrate references**: Components in source that reference components also in target
5. **Generate merge plan**: What will be created, what will be merged, what will conflict

### Step 2: Plan Merge Strategy

Present the user with the merge plan:

```
Merge Plan: substrate-ai-safety → substrate-technology
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Source: 147 components across 16 types
Target: 89 components across 14 types

New components: 112 (will be created in target)
Merged components: 23 (duplicates, will be combined)
Conflicts: 12 (require resolution)
Unchanged: 0

Component breakdown:
  Problems:     8 new, 2 merged, 1 conflict
  Solutions:   6 new, 3 merged, 0 conflicts
  Arguments:   15 new, 1 merged, 2 conflicts
  Claims:      22 new, 8 merged, 4 conflicts
  ...

Proceed? [Y/n/edit]
```

### Step 3: Prepare Target

1. **Backup target substrate**: Create `substrate-{target}-{date}.backup/`
2. **Ensure target structure**: Verify all required directories exist
3. **Lock target indexes**: Read current next-ids.json

### Step 4: Process Components

For each component in source:

#### 4a. New Components (No duplicate in target)

1. **Reassign code**: Generate a new target code (e.g., source PR-005 → target PR-NEXT)
2. **Update internal references**: Change all cross-references within the component from source codes to target codes
3. **Copy to target directory**: Create file in the appropriate target directory
4. **Update target INDEX.md**: Add table row to type index
5. **Update target index.json**: Add new component entry
6. **Update target next-ids.json**: Increment counter

#### 4b. Merged Components (Duplicate found in target)

1. **Read both versions**: Source and target components
2. **Compare content**: Identify overlaps and unique content in each
3. **Merge content**:
   - **Summary**: Combine, prefer more comprehensive version
   - **Details**: Merge, avoid duplication, preserve unique information
   - **Related**: Combine both sets of cross-references (deduplicate)
   - **Evidence**: Combine both evidence lists (deduplicate)
   - **Notes**: Append both notes with merge annotation
4. **Update merged component**: Write combined content to target file
5. **Update status**: Mark source component as "merged into {TARGET-CODE}"
6. **Record merge in metadata**: Add merge note to both files

#### 4c. Conflicting Components (Same topic, contradictory content)

For each conflict, apply the conflict resolution strategy:

- **ask**: Present both versions to user, let them decide
- **prefer-source**: Keep source version, archive target version
- **prefer-target**: Keep target version, archive source version

Record the resolution in the merged component's Notes.

### Step 5: Remap Cross-References

After all components are processed:

1. **Build ID mapping table**: Map every source code → target code
   ```json
   {
     "PR-00001": "PR-00014",  // Now PR-00014 in target
     "SO-00003": "SO-012",  // Merged with existing SO-012
     "AR-007": "AR-025"   // New in target
   }
   ```

2. **Update all target components**: Replace any references to source codes with the new target codes
3. **Update connection maps**: Apply ID mapping to graph.md and type-specific maps
4. **Verify no broken references**: Ensure every cross-reference resolves to a valid target component

### Step 6: Merge Connection Maps

1. **Merge graph.md**: Combine edges from both substrates, remapping source IDs
2. **Merge problem-solution-map.md**: Combine with remapped IDs
3. **Merge claim-evidence-trails.md**: Combine with remapped IDs
4. **Merge people-organization-map.md**: Combine with remapped IDs
5. **Deduplicate edges**: Remove any now-duplicate relationships

### Step 7: Merge Metadata

1. **Merge index.json**: Combine component lists, update counts
2. **Update taxonomy.json**: Use the more complete taxonomy (usually the target, unless source has custom types)
3. **Update next-ids.json**: Recalculate based on max IDs in combined substrate
4. **Update README.md**: Reflect new component counts and scope

### Step 8: Validate Merged Substrate

1. **Run Maintain workflow** on the target substrate
2. **Check for broken references**: Every cross-reference must resolve
3. **Check for orphan components**: New imports should have connections
4. **Verify ID uniqueness**: No duplicate codes within types
5. **Verify file-code alignment**: Filenames match frontmatter codes

### Step 9: Post-Merge Report

```markdown
# Merge Report

**Source**: substrate-{source_name} ({source_count} components)
**Target**: substrate-{target_name} ({original_target_count} → {final_target_count} components)
**Date**: YYYY-MM-DD

## Summary

- **New components created**: {count}
- **Merged components**: {count}
- **Conflicts resolved**: {count} (strategy: {strategy})
- **Cross-references remapped**: {count}
- **Orphaned after merge**: {count} (flagged for review)

## ID Mapping

| Source Code | Target Code | Action |
|-------------|-------------|--------|
| PR-00001 | PR-00014 | New |
| SO-00003 | SO-012 (merged) | Merged |
| AR-007 | AR-025 | New |
| ... | ... | ... |

## Actions Required

- [ ] Review {N} orphaned components
- [ ] Verify {N} merged components for content accuracy
- [ ] Run Maintain workflow for final integrity check
- [ ] Update any external references to source substrate
```

## Output

A merged target substrate with all source components integrated, conflicts resolved, cross-references remapped, and metadata updated.

## Example

**Input**: "Merge substrate-ai-regulation into substrate-ai-safety"

**Process**:
1. Analyze: 89 components in ai-regulation, 147 in ai-safety
2. Detect: 12 duplicates, 3 conflicts
3. Plan: 74 new, 12 merged, 3 conflicts (ask strategy)
4. Execute: Resolve conflicts, remap IDs, merge content
5. Validate: Run integrity checks

**Report**:
```
Merge Complete: ai-regulation → ai-safety
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Source:        89 components (substrate-ai-regulation)
Target:        147 → 221 components (substrate-ai-safety)
New:           74 components created
Merged:        12 components combined
Conflicts:     3 resolved (2 prefer-target, 1 manual)

ID mappings:   89 source → 86 target (3 merged)
References:    234 cross-references remapped
Orphans:       5 components need connection review

Backup:        ~/substrates/substrate-ai-safety-2025-01-15.backup/
```

## Edge Cases

- **Very large merges**: Process in batches by component type, report progress
- **Merge into empty substrate**: Equivalent to renaming the source substrate
- **Circular references**: Remap carefully, verify after merge
- **Custom component types in source not in target**: Add them to target taxonomy
- **Partial merge**: Allow merging specific types or specific components
- **Rollback**: Backup created before merge; can be restored if needed
- **Same substrate**: Detect and prevent self-merge