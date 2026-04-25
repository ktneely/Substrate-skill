# Workflow: SubstrateCreate

> Create a new substrate information group with proper directory structure, taxonomy, and initial components.

## Trigger

- User says: "create new substrate", "new knowledge domain", "initialize substrate", "start a new substrate"
- User wants to organize knowledge around a new topic or domain
- Starting fresh knowledge capture for a project, domain, or subject area

## Input

- **Name**: The substrate name (e.g., "ai-safety", "climate-tech", "local-politics")
- **Description**: One-paragraph description of the substrate's scope and purpose
- **Optional**: Initial components, seed URLs, related substrates, access level

## Process

### Step 1: Validate Name

1. Check that the name follows conventions: lowercase, hyphenated, descriptive
2. Format as `substrate-{name}` for the directory
3. Verify no substrate with this name already exists at `config.base_path`
4. If conflict: suggest alternative names or offer to merge

### Step 2: Create Directory Structure

Create the full substrate directory tree:

```
substrate-{name}/
├── README.md                          # Substrate overview
├── INDEX.md                           # Master index of all components
├── components/
│   ├── problems/
│   │   └── INDEX.md                   # Table: PR-ID | TITLE | DESCRIPTION
│   ├── solutions/
│   │   └── INDEX.md
│   ├── arguments/
│   │   └── INDEX.md
│   ├── claims/
│   │   └── INDEX.md
│   ├── plans/
│   │   └── INDEX.md
│   ├── ideas/
│   │   └── INDEX.md
│   ├── people/
│   │   └── INDEX.md
│   ├── organizations/
│   │   └── INDEX.md
│   ├── projects/
│   │   └── INDEX.md
│   ├── values/
│   │   └── INDEX.md
│   ├── models/
│   │   └── INDEX.md
│   ├── frames/
│   │   └── INDEX.md
│   ├── data-sources/
│   │   └── INDEX.md
│   ├── laws/
│   │   └── INDEX.md
│   ├── votes/
│   │   └── INDEX.md
│   ├── funding-sources/
│   │   └── INDEX.md
│   ├── goals/
│   │   └── INDEX.md
│   ├── facts/
│   │   └── INDEX.md
│   └── events/
│       └── INDEX.md
├── connections/
│   ├── graph.md
│   ├── problem-solution-map.md
│   ├── claim-evidence-trails.md
│   └── people-organization-map.md
└── metadata/
    ├── index.json
    ├── taxonomy.json
    └── next-ids.json
```

### Step 3: Write README.md

Create the substrate README with template:

```markdown
# Substrate: {name}

> {One-line description of this substrate's purpose}

## Scope

{Description of what this substrate covers and what it doesn't}

## Component Types

| Code | Type | Count |
|------|------|-------|
| PR | Problems | 0 |
| SO | Solutions | 0 |
| AR | Arguments | 0 |
| CL | Claims | 0 |
| PL | Plans | 0 |
| ID | Ideas | 0 |
| PE | People | 0 |
| OR | Organizations | 0 |
| PJ | Projects | 0 |
| VA | Values | 0 |
| MO | Models | 0 |
| FR | Frames | 0 |
| DS | Data-Sources | 0 |
| LA | Laws | 0 |
| VO | Votes | 0 |
| FU | Funding-Sources | 0 |
| GO | Goals | 0 |
| FA | Facts | 0 |
| EV | Events | 0 |

## Usage

- **Add a component**: Use the ManualEntry workflow
- **Ingest a document**: Use the DocumentIngest workflow
- **Query knowledge**: Use the Query workflow
- **Audit health**: Use the Maintain workflow

## Created

{date}

## Last Updated

{date}
```

### Step 4: Write Root INDEX.md

Create the substrate-level INDEX.md (master index):

```markdown
# {Substrate Name} Index

> Master index of all components in this substrate

## Component Types

| Type | Count | Index |
|------|-------|-------|
| Problems | 0 | [View](components/problems/INDEX.md) |
| Solutions | 0 | [View](components/solutions/INDEX.md) |
| Arguments | 0 | [View](components/arguments/INDEX.md) |
| Claims | 0 | [View](components/claims/INDEX.md) |
| Plans | 0 | [View](components/plans/INDEX.md) |
| Ideas | 0 | [View](components/ideas/INDEX.md) |
| People | 0 | [View](components/people/INDEX.md) |
| Organizations | 0 | [View](components/organizations/INDEX.md) |
| Projects | 0 | [View](components/projects/INDEX.md) |
| Values | 0 | [View](components/values/INDEX.md) |
| Models | 0 | [View](components/models/INDEX.md) |
| Frames | 0 | [View](components/frames/INDEX.md) |
| Data-Sources | 0 | [View](components/data-sources/INDEX.md) |
| Laws | 0 | [View](components/laws/INDEX.md) |
| Votes | 0 | [View](components/votes/INDEX.md) |
| Funding-Sources | 0 | [View](components/funding-sources/INDEX.md) |
| Goals | 0 | [View](components/goals/INDEX.md) |
| Facts | 0 | [View](components/facts/INDEX.md) |
| Events | 0 | [View](components/events/INDEX.md) |

## Quick Links

- [Problem-Solution Map](connections/problem-solution-map.md)
- [Claim Evidence Trails](connections/claim-evidence-trails.md)
- [People-Organization Map](connections/people-organization-map.md)
- [Full Connection Graph](connections/graph.md)

---

*Created: YYYY-MM-DD | Last updated: YYYY-MM-DD*
```

### Step 5: Write Type INDEX.md Files

Each component type directory gets an INDEX.md with a table format:

**Example: `components/problems/INDEX.md`**

```markdown
# Problems Index

| PROBLEM ID | PROBLEM TITLE | SHORT and MEANINGFUL DESCRIPTION |
|------------|---------------|----------------------------------|

*No problems yet.*

---

*Last updated: YYYY-MM-DD*
```

**Column headers by type:**
- Problems: `| PROBLEM ID | PROBLEM TITLE | SHORT and MEANINGFUL DESCRIPTION |`
- Solutions: `| SOLUTION ID | SOLUTION TITLE | SHORT and MEANINGFUL DESCRIPTION |`
- Arguments: `| ARGUMENT ID | ARGUMENT TITLE | SHORT and MEANINGFUL DESCRIPTION |`
- Claims: `| CLAIM ID | CLAIM TITLE | SHORT and MEANINGFUL DESCRIPTION |`
- Plans: `| PLAN ID | PLAN TITLE | SHORT and MEANINGFUL DESCRIPTION |`
- Ideas: `| IDEA ID | IDEA TITLE | SHORT and MEANINGFUL DESCRIPTION |`
- People: `| PERSON ID | PERSON NAME | SHORT and MEANINGFUL DESCRIPTION |`
- Organizations: `| ORGANIZATION ID | ORGANIZATION NAME | SHORT and MEANINGFUL DESCRIPTION |`
- Projects: `| PROJECT ID | PROJECT TITLE | SHORT and MEANINGFUL DESCRIPTION |`
- Values: `| VALUE ID | VALUE TITLE | SHORT and MEANINGFUL DESCRIPTION |`
- Models: `| MODEL ID | MODEL TITLE | SHORT and MEANINGFUL DESCRIPTION |`
- Frames: `| FRAME ID | FRAME TITLE | SHORT and MEANINGFUL DESCRIPTION |`
- Data-Sources: `| DATA SOURCE ID | DATA SOURCE TITLE | SHORT and MEANINGFUL DESCRIPTION |`
- Laws: `| LAW ID | LAW TITLE | SHORT and MEANINGFUL DESCRIPTION |`
- Votes: `| VOTE ID | VOTE TITLE | SHORT and MEANINGFUL DESCRIPTION |`
- Funding-Sources: `| FUNDING SOURCE ID | FUNDING SOURCE TITLE | SHORT and MEANINGFUL DESCRIPTION |`
- Goals: `| GOAL ID | GOAL TITLE | SHORT and MEANINGFUL DESCRIPTION |`
- Facts: `| FACT ID | FACT TITLE | SHORT and MEANINGFUL DESCRIPTION |`
- Events: `| EVENT ID | EVENT TITLE | SHORT and MEANINGFUL DESCRIPTION |`

### Step 6: Write Connection Maps

Initialize each connection map with headers:

**graph.md**:
```markdown
# Connection Graph: substrate-{name}

> All cross-reference relationships between components

## Nodes

*None yet.*

## Edges

*None yet.*

---

*Last updated: YYYY-MM-DD*
```

**problem-solution-map.md**:
```markdown
# Problem ↔ Solution Map: substrate-{name}

> Mapping of Problems to their addressing Solutions

## Problems

*No problems yet.*

## Solutions

*No solutions yet.*

## Mappings

*No mappings yet.*

---

*Last updated: YYYY-MM-DD*
```

(Similar structure for claim-evidence-trails.md and people-organization-map.md)

### Step 7: Write Metadata Files

**index.json**:
```json
{
  "name": "substrate-{name}",
  "created": "YYYY-MM-DD",
  "updated": "YYYY-MM-DD",
  "description": "{description}",
  "component_count": 0,
  "components": {},
  "types": {
    "PR": {"name": "Problem", "directory": "problems", "count": 0},
    "SO": {"name": "Solution", "directory": "solutions", "count": 0},
    "AR": {"name": "Argument", "directory": "arguments", "count": 0},
    "CL": {"name": "Claim", "directory": "claims", "count": 0},
    "PL": {"name": "Plan", "directory": "plans", "count": 0},
    "ID": {"name": "Idea", "directory": "ideas", "count": 0},
    "PE": {"name": "Person", "directory": "people", "count": 0},
    "OR": {"name": "Organization", "directory": "organizations", "count": 0},
    "PJ": {"name": "Project", "directory": "projects", "count": 0},
    "VA": {"name": "Value", "directory": "values", "count": 0},
    "MO": {"name": "Model", "directory": "models", "count": 0},
    "FR": {"name": "Frame", "directory": "frames", "count": 0},
    "DS": {"name": "Data-Source", "directory": "data-sources", "count": 0},
    "LA": {"name": "Law", "directory": "laws", "count": 0},
    "VO": {"name": "Vote", "directory": "votes", "count": 0},
    "FU": {"name": "Funding-Source", "directory": "funding-sources", "count": 0},
    "GO": {"name": "Goal", "directory": "goals", "count": 0},
    "FA": {"name": "Fact", "directory": "facts", "count": 0},
    "EV": {"name": "Event", "directory": "events", "count": 0}
  }
}
```

**taxonomy.json**:
```json
{
  "version": "1.0.0",
  "component_types": {
    "PR": {
      "name": "Problem",
      "description": "Things that need solving",
      "directory": "problems",
      "relationships": {
        "addresses": ["SO"],
        "supported_by": ["AR", "FA"],
        "involves": ["PE", "OR"],
        "constrained_by": ["LA", "VA"]
      }
    },
    "SO": {
      "name": "Solution",
      "description": "Ways to address problems",
      "directory": "solutions",
      "relationships": {
        "addresses": ["PR"],
        "supported_by": ["AR", "FA"],
        "implemented_by": ["PL", "PJ"],
        "constrained_by": ["LA"]
      }
    },
    "AR": {
      "name": "Argument",
      "description": "Reasoned positions on claims",
      "directory": "arguments",
      "relationships": {
        "supports": ["CL", "PR", "SO"],
        "contradicts": ["CL", "AR"],
        "informed_by": ["MO", "FR"]
      }
    },
    "CL": {
      "name": "Claim",
      "description": "Assertions requiring evidence",
      "directory": "claims",
      "relationships": {
        "supported_by": ["FA", "DS"],
        "argued_by": ["AR"],
        "related_to": ["PR", "SO"]
      }
    },
    "PL": {
      "name": "Plan",
      "description": "Structured approaches to action",
      "directory": "plans",
      "relationships": {
        "addresses": ["PR", "GO"],
        "guided_by": ["VA", "MO"],
        "constrained_by": ["LA"]
      }
    },
    "ID": {
      "name": "Idea",
      "description": "Concepts worth exploring",
      "directory": "ideas",
      "relationships": {
        "evolves_to": ["SO", "PL", "PJ"],
        "informed_by": ["MO", "FR"],
        "related_to": ["PR"]
      }
    },
    "PE": {
      "name": "Person",
      "description": "Individuals of interest",
      "directory": "people",
      "relationships": {
        "belongs_to": ["OR"],
        "leads": ["OR", "PJ"],
        "involved_in": ["PR", "SO", "PJ"]
      }
    },
    "OR": {
      "name": "Organization",
      "description": "Groups, companies, institutions",
      "directory": "organizations",
      "relationships": {
        "owns": ["PJ"],
        "funded_by": ["FU"],
        "involves": ["PE"]
      }
    },
    "PJ": {
      "name": "Project",
      "description": "Initiatives with scope",
      "directory": "projects",
      "relationships": {
        "contains": ["PR", "SO", "PL"],
        "owned_by": ["OR"],
        "led_by": ["PE"],
        "funded_by": ["FU"]
      }
    },
    "VA": {
      "name": "Value",
      "description": "Principles guiding decisions",
      "directory": "values",
      "relationships": {
        "guides": ["PL", "GO", "PJ"],
        "conflicts_with": ["VA"]
      }
    },
    "MO": {
      "name": "Model",
      "description": "Mental models, frameworks",
      "directory": "models",
      "relationships": {
        "informs": ["FR", "PL", "AR"],
        "related_to": ["MO"]
      }
    },
    "FR": {
      "name": "Frame",
      "description": "Ways of viewing a situation",
      "directory": "frames",
      "relationships": {
        "reframes": ["PR", "CL"],
        "informed_by": ["MO"]
      }
    },
    "DS": {
      "name": "Data-Source",
      "description": "Information sources",
      "directory": "data-sources",
      "relationships": {
        "supports": ["CL", "FA"],
        "published_by": ["OR"]
      }
    },
    "LA": {
      "name": "Law",
      "description": "Regulations, policies, rules",
      "directory": "laws",
      "relationships": {
        "constrains": ["PR", "SO", "PJ"],
        "enacted_by": ["OR"]
      }
    },
    "VO": {
      "name": "Vote",
      "description": "Voting records, positions",
      "directory": "votes",
      "relationships": {
        "by": ["PE"],
        "regarding": ["LA", "PR"]
      }
    },
    "FU": {
      "name": "Funding-Source",
      "description": "Financial backers, patrons",
      "directory": "funding-sources",
      "relationships": {
        "funds": ["OR", "PJ", "PE"]
      }
    },
    "GO": {
      "name": "Goal",
      "description": "Desired outcomes",
      "directory": "goals",
      "relationships": {
        "drives": ["PL", "PJ"],
        "guided_by": ["VA"]
      }
    },
    "FA": {
      "name": "Fact",
      "description": "Verified information",
      "directory": "facts",
      "relationships": {
        "supports": ["CL", "AR"],
        "sourced_from": ["DS"]
      }
    },
    "EV": {
      "name": "Event",
      "description": "Occurrences with temporal context",
      "directory": "events",
      "relationships": {
        "involves": ["PE", "OR", "PJ"],
        "related_to": ["PR", "SO"]
      }
    }
  }
}
```

**next-ids.json**:
```json
{
  "PR": 1,
  "SO": 1,
  "AR": 1,
  "CL": 1,
  "PL": 1,
  "ID": 1,
  "PE": 1,
  "OR": 1,
  "PJ": 1,
  "VA": 1,
  "MO": 1,
  "FR": 1,
  "DS": 1,
  "LA": 1,
  "VO": 1,
  "FU": 1,
  "GO": 1,
  "FA": 1,
  "EV": 1
}
```

### Step 8: Create Initial Components (Optional)

If the user provided initial knowledge or seed URLs:

1. Process initial components through ManualEntry or WebScrape workflows
2. Create seed components to establish the knowledge graph
3. Create initial cross-references between seed components

### Step 9: Report

Provide the user with:
- **Substrate created**: Name, path, scope
- **Directory structure**: Verified all 19 type directories + metadata
- **Files created**: Count of template files
- **Ready for**: ManualEntry, DocumentIngest, WebScrape, VideoTranscript

## Output

A complete substrate directory structure with all template files, metadata, and ready for population.

## Example

**Input**: "Create a substrate called 'ai-safety' for tracking AI safety knowledge"

**Process**:
1. Create `substrate-ai-safety/` directory
2. Create 19 component type directories with INDEX.md files
3. Create README.md, INDEX.md
4. Create connection maps
5. Create metadata files (index.json, taxonomy.json, next-ids.json)

**Report**:
```
Substrate Created: ai-safety
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Path:        ~/substrates/substrate-ai-safety/
Directories: 19 component types + connections + metadata
Files:       25 template files created
Status:      Ready for population

Available workflows:
  → ManualEntry:    Add individual components
  → DocumentIngest: Extract from PDF/DOCX
  → WebScrape:      Extract from URLs
  → VideoTranscript: Extract from video/audio
  → Expand:         Research and deepen components
  → Connect:        Build cross-reference graph
  → Query:          Search and answer questions
  → Maintain:       Audit and repair integrity
```

## Edge Cases

- **Name conflict**: Suggest alternative names or offer to merge
- **Invalid name format**: Auto-format to lowercase, hyphenated
- **Very broad substrate**: Suggest breaking into multiple focused substrates
- **Existing substrate wanting reset**: Provide option to archive current and start fresh