# Data-Source Template (DS)

> Every Claim needs a source. Every Fact needs a trail back to here.

```markdown
---
code: DS-{NNNNN}-{slug}
type: Data-Source
title: "Source: {Source title or description}"
status: active | proposed | resolved | deprecated
created: YYYY-MM-DD
updated: YYYY-MM-DD
confidence: high | medium | low | proposed
tags: [{type}, {domain}, {reliability}]
sources:
  - url: "{source_url_or_doi}"
    title: "{source_title}"
    accessed: YYYY-MM-DD
---

# Source: {Title}

## Summary

{What is this data source? What information does it provide? Why is it relevant?}

## Details

### Type

{What kind of source is this? Peer-reviewed paper, news article, government report, blog post, dataset, etc.}

### Content Overview

{Brief summary of what this source covers. What are its key findings, claims, or data points?}

### Authorship

{Who produced this source? Author(s), organization, publisher.}

### Reliability Assessment

{How reliable is this source? Consider: author credibility, publication venue, methodology, peer review status, potential biases.}

- **Reliability**: high | medium | low
- **Bias considerations**: {Any known biases or perspectives}

### Key Extracts

{Notable quotes, findings, or data points that are referenced by other components.}

## Related

- **Supports**: [CL-NNNNN], [FA-NNNNN] — Claims and Facts this source supports
- **Published by**: [OR-NNNNN] — Organization that published this source
- **Authored by**: [PE-NNNNN] — Person(s) who authored this
- **Related to**: [DS-NNNNN] — Other data sources (complementary, contradictory, or related)

## Notes

{Access limitations, archival status, classification notes.}
```