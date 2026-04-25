# Problem Template (PR)

> "A problem well stated is a problem half solved." — Charles Kettering

```markdown
---
code: PR-{NNNNN}-{slug}
type: Problem
title: "{Human-readable problem statement}"
status: active | proposed | resolved | deprecated
created: YYYY-MM-DD
updated: YYYY-MM-DD
confidence: high | medium | low | proposed
tags: [{domain}, {scale}, {region}]
sources:
  - url: "{source_url}"
    title: "{source_title}"
    accessed: YYYY-MM-DD
---

# {Title}

## Summary

{What is the problem? Who is affected? Why does it matter? What's the gap between current and desired state?}

## Details

### Scope

{How widespread is this problem? Who is affected? What's the severity?}

### Root Causes

{What underlying factors contribute to this problem?}

### Impact

{What happens if this problem is not addressed? What's the cost of inaction?}

### Evidence of Problem

{How do we know this is a real problem? What data or observations support its existence?}

## Related

- **Addresses**: [SO-NNNNN], [SO-NNNNN] — Solutions that address this problem
- **Supported by**: [AR-NNNNN] — Arguments that define or support this problem's significance
- **Constrained by**: [LA-NNNNN] — Laws that relate to this problem
- **Involves**: [PE-NNNNN], [OR-NNNNN] — People/orgs affected by or working on this problem
- **Related to**: [PR-NNNNN] — Related problems
- **Part of**: [PJ-NNNNN] — Projects studying or addressing this problem

## Evidence

- [FA-NNNNN]: {Fact that demonstrates this problem}
- [DS-NNNNN]: {Data source with evidence}

## Notes

{Open questions about this problem, areas of uncertainty, classification notes.}
```