# Claim Template (CL)

> "Extraordinary claims require extraordinary evidence." — Carl Sagan

```markdown
---
code: CL-{NNNNN}-{slug}
type: Claim
title: "{The assertion being claimed}"
status: active | proposed | resolved | deprecated
created: YYYY-MM-DD
updated: YYYY-MM-DD
confidence: high | medium | low | proposed
tags: [{domain}, {verification-status}]
sources:
  - url: "{source_url}"
    title: "{source_title}"
    accessed: YYYY-MM-DD
---

# {Title}

## Summary

{What is being claimed? State the assertion clearly and precisely.}

## Details

### The Claim

{The exact assertion being made. Be as specific as possible — vague claims are less useful.}

### Context

{In what context is this claim made? What's the background? Why is this claim significant?}

### Supporting Evidence

{What evidence supports this claim? How strong is the evidence?}

### Countering Evidence

{What evidence contradicts or challenges this claim?}

### Assessment

{Current assessment: Is this likely true, false, or uncertain? What would it take to verify?}

## Related

- **Supported by**: [FA-NNNNN], [DS-NNNNN] — Facts and Data-Sources supporting this claim
- **Argued by**: [AR-NNNNN] — Arguments that support or oppose this claim
- **Contradicts**: [CL-NNNNN] — Other claims that contradict this one
- **Related to**: [PR-NNNNN], [SO-NNNNN] — Related problems and solutions
- **Informed by**: [MO-NNNNN], [FR-NNNNN] — Models/frames relevant to this claim

## Evidence

- [FA-NNNNN]: {Fact supporting this claim}
- [FA-NNNNN]: {Fact countering this claim} (if applicable)
- [DS-NNNNN]: {Primary data source for this claim}

## Notes

{Verification status, open questions, classification notes. Consider: what evidence would settle this claim definitively?}
```