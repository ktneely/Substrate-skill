# Argument Template (AR)

> "The only way to win an argument is to have better evidence." — not really, but it helps.

```markdown
---
code: AR-{NNNNN}-{slug}
type: Argument
title: "{Position}: {brief stance description}"
status: active | proposed | resolved | deprecated
created: YYYY-MM-DD
updated: YYYY-MM-DD
confidence: high | medium | low | proposed
tags: [{domain}, {stance}, {method}]
sources:
  - url: "{source_url}"
    title: "{source_title}"
    accessed: YYYY-MM-DD
---

# {Title}

## Summary

{What is the argument? What position does it take? What is it supporting or contradicting?}

## Details

### Position

{The specific stance this argument takes. Be precise about what is being claimed.}

### Reasoning

{The logical chain that leads from evidence to conclusion. What's the warrant?}

### Supports

{What claims, problems, or solutions does this argument support? How?}

### Contradicts

{What claims or arguments does this argument contradict? Why?}

### Limitations

{What are the weaknesses of this argument? Where does its reasoning fall short?}

## Related

- **Supports**: [CL-NNNNN], [PR-NNNNN], [SO-NNNNN] — Claims/Problems/Solutions this argument supports
- **Contradicts**: [CL-NNNNN], [AR-NNNNN] — Claims/Arguments this contradicts
- **Supported by**: [FA-NNNNN] — Facts that support this argument's reasoning
- **Informed by**: [MO-NNNNN], [FR-NNNNN] — Models/frames that shape this argument
- **Involves**: [PE-NNNNN] — People who have made this argument

## Evidence

- [FA-NNNNN]: {Fact supporting this argument}
- [DS-NNNNN]: {Data source}

## Notes

{Counter-arguments to consider, open questions about reasoning, classification notes.}
```