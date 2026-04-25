# maintainSubstrate.ts — Technical Specification

> Auditing the knowledge graph is not optional maintenance — it is a constitutional safeguard. Every broken reference is a broken promise. Every orphan is an unanswered question. Every stale component is a lie about relevance.

---

## 1. Overview

`maintainSubstrate.ts` is a deterministic Bun script that audits a Substrate knowledge graph for structural integrity, cross-reference consistency, content quality, and freshness. It produces a structured markdown report and can optionally auto-fix detected issues.

**Location**: `~/.opencode/PAI/Tools/maintainSubstrate.ts`

**Runtime**: Bun TypeScript

**Execution**: `bun maintainSubstrate.ts [options]`

---

## 2. CLI Interface

```bash
bun maintainSubstrate.ts [options]

Options:
  --substrate <name>     Substrate to audit (default: config.default_substrate)
  --config <path>        Config file path (default: ~/.opencode/skills/Knowledge/Substrate/config.yaml)
  --fix                  Auto-fix mode (default: suggest only)
  --output <path>        Report output path (default: stdout + substrate file)
  --type <type>          Audit only this component type (optional, for partial scans)
  --quiet                Suppress verbose output, show only report
  --help                 Show help
```

### CLI Parsing

```typescript
interface CLIOptions {
  substrate: string;          // resolved from config.default_substrate if not provided
  configPath: string;         // path to config.yaml
  fixMode: boolean;          // --fix flag
  outputPath: string | null;  // --output path, null = stdout + substrate file
  typeFilter: string | null;  // --type filter (e.g., "PR"), null = all types
  quiet: boolean;             // --quiet flag
}
```

Parse using `Bun.argv` or a simple argument parser. Do not import external arg-parsing libraries — keep it zero-dependency except for YAML parsing.

---

## 3. Configuration Loading

### 3.1 Config File Location

```typescript
const DEFAULT_CONFIG_PATH = path.join(
  os.homedir(),
  ".opencode/skills/Knowledge/Substrate/config.yaml"
);
```

### 3.2 Config Structure

```typescript
interface MaintainConfig {
  report_by_severity: boolean;      // Group report findings by severity
  auto_tag_missing_sources: boolean; // Add "source-needed" tag to components missing sources
  stale_threshold_days: number;      // Days before component flagged as stale
  check_broken_references: boolean;  // Verify referenced files exist
  check_orphans: boolean;            // Flag zero-connection components
}

interface SubstrateConfig {
  base_path: string;
  naming: "numeric" | "slug" | "numeric-slug";
  default_substrate: string;
  maintain: MaintainConfig;
  verification: Record<string, "strict" | "moderate" | "relaxed">;
  dedup: {
    enabled: boolean;
    auto_merge_threshold: number;
    prompt_threshold: number;
    tag_overlap_threshold: number;
    cross_type_check: boolean;
    log_actions: boolean;
  };
}
```

### 3.3 Config Resolution Logic

```
1. Read config.yaml from --config path (or DEFAULT_CONFIG_PATH)
2. Parse YAML into SubstrateConfig
3. Resolve base_path: expand ~ to os.homedir()
4. Resolve substrate name: --substrate flag → config.default_substrate
5. Build full substrate path: {base_path}/substrate-{name}/
6. Merge maintain settings with defaults for any missing keys
```

**Default values for maintain settings** (if not in config.yaml):

```yaml
maintain:
  report_by_severity: true
  auto_tag_missing_sources: true
  stale_threshold_days: 90
  check_broken_references: true
  check_orphans: true
```

---

## 4. Data Structures

### 4.1 Component Type Registry

```typescript
const COMPONENT_TYPES: Record<string, ComponentTypeDef> = {
  PR: { code: "PR", type: "Problem",      dir: "problems",       label: "PROBLEM" },
  SO: { code: "SO", type: "Solution",      dir: "solutions",      label: "SOLUTION" },
  AR: { code: "AR", type: "Argument",       dir: "arguments",      label: "ARGUMENT" },
  CL: { code: "CL", type: "Claim",          dir: "claims",         label: "CLAIM" },
  PL: { code: "PL", type: "Plan",           dir: "plans",          label: "PLAN" },
  ID: { code: "ID", type: "Idea",           dir: "ideas",          label: "IDEA" },
  PE: { code: "PE", type: "Person",         dir: "people",         label: "PERSON" },
  OR: { code: "OR", type: "Organization",   dir: "organizations",  label: "ORGANIZATION" },
  PJ: { code: "PJ", type: "Project",        dir: "projects",       label: "PROJECT" },
  VA: { code: "VA", type: "Value",          dir: "values",         label: "VALUE" },
  MO: { code: "MO", type: "Model",          dir: "models",         label: "MODEL" },
  FR: { code: "FR", type: "Frame",          dir: "frames",         label: "FRAME" },
  DS: { code: "DS", type: "Data-Source",    dir: "data-sources",   label: "DATA SOURCE" },
  LA: { code: "LA", type: "Law",            dir: "laws",            label: "LAW" },
  VO: { code: "VO", type: "Vote",           dir: "votes",          label: "VOTE" },
  FU: { code: "FU", type: "Funding-Source",  dir: "funding-sources", label: "FUNDING SOURCE" },
  GO: { code: "GO", type: "Goal",           dir: "goals",          label: "GOAL" },
  FA: { code: "FA", type: "Fact",            dir: "facts",          label: "FACT" },
  EV: { code: "EV", type: "Event",           dir: "events",         label: "EVENT" },
};
```

### 4.2 Parsed Component

```typescript
interface ParsedComponent {
  filePath: string;             // Absolute path to the .md file
  fileName: string;             // Just the filename
  code: string;                 // e.g., "PR-00007"
  type: string;                 // e.g., "Problem"
  typeCode: string;             // e.g., "PR"
  title: string;
  status: string;                // active | proposed | resolved | deprecated
  created: string;              // YYYY-MM-DD
  updated: string;              // YYYY-MM-DD
  confidence: string;            // high | medium | low | proposed
  tags: string[];
  sources: SourceRef[];
  summary: string;               // Content of ## Summary section
  details: string;               // Content of ## Details section
  related: RelatedRef[];          // Parsed cross-references
  slug: string;                  // Extracted from filename
  wordCount: {
    summary: number;
    details: number;
  };
  frontmatter: Record<string, unknown>;  // Raw frontmatter for extensibility
}

interface SourceRef {
  url: string;
  title: string;
  accessed: string;
}

interface RelatedRef {
  relationship: string;  // e.g., "Addresses", "Supported by"
  targetCode: string;    // e.g., "SO-00003"
  targetDescription: string;
}

interface IndexEntry {
  code: string;
  title: string;
  description: string;
  filePath: string;
}
```

### 4.3 Audit Findings

```typescript
type Severity = "critical" | "warning" | "suggestion" | "info";

interface AuditFinding {
  id: string;                   // Unique finding ID (e.g., "STR-001", "REF-012")
  severity: Severity;
  category: string;              // "structural" | "reference" | "content" | "quality" | "index"
  message: string;              // Human-readable description
  component?: string;            // Affected component code (e.g., "PR-00007")
  filePath?: string;             // Affected file path
  fixAvailable: boolean;         // Whether --fix can auto-repair this
  fixDescription?: string;       // Description of the auto-fix
}

interface AuditReport {
  substrateName: string;
  auditDate: string;
  totalComponents: number;
  componentsByType: Record<string, number>;
  healthScore: number;           // 0-100 percentage
  findings: AuditFinding[];
  statistics: AuditStatistics;
  autoFixedCount: number;         // Number of issues fixed (if --fix mode)
}

interface AuditStatistics {
  totalCrossReferences: number;
  brokenReferences: number;
  oneWayReferences: number;
  orphanComponents: number;
  missingSources: number;         // By severity tier
  confidenceDistribution: Record<string, number>;
  staleComponents: number;
  thinSummaries: number;          // <20 words
  thinDetails: number;            // <50 words
  tagSimilarityGroups: string[][];  // Groups of similar tags
  indexCompleteness: number;       // Percentage of components listed in INDEX.md
  nextIdsAccuracy: number;         // Whether next-ids are correct
}
```

---

## 5. Core Algorithms

### 5.1 File Discovery and Parsing

```typescript
async function discoverComponents(substratePath: string, typeFilter?: string): Promise<ParsedComponent[]>

// Algorithm:
// 1. For each entry in COMPONENT_TYPES (or just the filtered type):
//    a. Build path: {substratePath}/components/{dir}/
//    b. Read all .md files in the directory (non-recursive)
//    c. For each file, parse frontmatter + content sections
//    d. Build ParsedComponent from parsed data
//    e. Validate parsed data against expected format
// 2. Return flat array of all ParsedComponent objects

async function parseComponentFile(filePath: string): Promise<ParsedComponent>

// Algorithm:
// 1. Read file content
// 2. Split on "---" frontmatter delimiters
// 3. Parse YAML frontmatter
// 4. Extract sections: Summary, Details, Related, Evidence, Notes
// 5. Parse cross-references from Related section (regex: /\[(\w{2}-\d{5})\]/)
// 6. Compute word counts for Summary and Details
// 7. Extract slug from filename (strip {TYPE}-{NNNNN}- prefix and .md suffix)
// 8. Build and return ParsedComponent

async function parseIndexFile(typeCode: string, substratePath: string): Promise<IndexEntry[]>

// Algorithm:
// 1. Build path: {substratePath}/components/{dir}/INDEX.md
// 2. Read file content
// 3. Parse markdown table rows (split on |, skip header/separator rows)
// 4. Extract code, title, description from each row
// 5. Return array of IndexEntry objects
```

### 5.2 Structural Integrity Check

```typescript
async function checkStructuralIntegrity(substratePath: string): Promise<AuditFinding[]>

// Algorithm:
// findings = []
//
// // 5.2.1 Verify component type directories
// for each (code, typeDef) in COMPONENT_TYPES:
//   dirPath = join(substratePath, "components", typeDef.dir)
//   if !exists(dirPath):
//     findings.push(SEVERITY=critical, "Missing directory: {dirPath}", fixAvailable=true)
//
// // 5.2.2 Verify INDEX.md in each type directory
// for each (code, typeDef) in COMPONENT_TYPES:
//   indexPath = join(substratePath, "components", typeDef.dir, "INDEX.md")
//   if !exists(indexPath):
//     findings.push(SEVERITY=critical, "Missing INDEX.md in {typeDef.dir}", fixAvailable=true)
//
// // 5.2.3 Verify root metadata files
// requiredRootFiles = [
//   "README.md",
//   "INDEX.md",
//   "metadata/index.json",
//   "metadata/taxonomy.json",
//   "metadata/next-ids.json"
// ]
// for each file in requiredRootFiles:
//   if !exists(join(substratePath, file)):
//     findings.push(SEVERITY=critical, "Missing root file: {file}", fixAvailable=true)
//
// // 5.2.4 Verify connections directory and files
// connectionsDir = join(substratePath, "connections")
// if !exists(connectionsDir):
//   findings.push(SEVERITY=critical, "Missing connections directory", fixAvailable=true)
// else:
//   requiredConnections = ["graph.md", "problem-solution-map.md",
//     "claim-evidence-trails.md", "people-organization-map.md"]
//   for each connFile in requiredConnections:
//     if !exists(join(connectionsDir, connFile)):
//       findings.push(SEVERITY=warning, "Missing connection file: {connFile}", fixAvailable=true)
//
// return findings
```

### 5.3 Component Audit

```typescript
async function auditComponents(
  components: ParsedComponent[],
  config: MaintainConfig
): Promise<AuditFinding[]>

// Algorithm:
// findings = []
// componentIndex = Map<code, ParsedComponent>  // for cross-reference checks
//
// for each component in components:
//
//   // 5.3.1 Frontmatter validation
//   required = ["code", "type", "title", "status", "created", "updated", "confidence", "tags"]
//   for each field in required:
//     if !(field in component.frontmatter):
//       findings.push(SEVERITY=critical, "Missing required field: {field}", component=component.code)
//
//   // Code format validation
//   expectedPattern = /^{component.typeCode}-\d{5}/
//   if !expectedPattern.test(component.code):
//     findings.push(SEVERITY=critical, "Invalid code format: {component.code}")
//
//   // Type consistency
//   if component.type !== COMPONENT_TYPES[component.typeCode].type:
//     findings.push(SEVERITY=critical, "Type mismatch: code says {typeCode} but type is {component.type}")
//
//   // Status validation
//   validStatuses = ["active", "proposed", "resolved", "deprecated"]
//   if component.status not in validStatuses:
//     findings.push(SEVERITY=warning, "Invalid status: {component.status}", component=component.code)
//
//   // Date validation
//   for each dateField in ["created", "updated"]:
//     if !isValidISODate(component[dateField]):
//       findings.push(SEVERITY=warning, "Invalid {dateField} date: {component[dateField]}", component=component.code)
//
//   // 5.3.2 Content validation
//   if component.summary is empty:
//     findings.push(SEVERITY=warning, "Empty summary", component=component.code)
//
//   if component.wordCount.summary < 20:
//     findings.push(SEVERITY=suggestion, "Summary < 20 words", component=component.code)
//
//   if component.wordCount.details < 50:
//     findings.push(SEVERITY=suggestion, "Details < 50 words", component=component.code)
//
//   if component.related is empty:
//     findings.push(SEVERITY=suggestion, "No cross-references (orphan risk)", component=component.code)
//
//   // 5.3.3 Code consistency
//   expectedFilename = "{component.code}-{component.slug}.md"
//   if component.fileName !== expectedFilename:
//     findings.push(SEVERITY=warning, "Filename mismatch: expected {expectedFilename}, got {component.fileName}")
//
//   // 5.3.4 Source verification check
//   verificationLevel = getVerificationLevel(component.typeCode, config)
//   if component.sources.length === 0:
//     if verificationLevel === "strict":
//       findings.push(SEVERITY=critical, "No source attribution (strict type requires source)", component=component.code)
//     elif verificationLevel === "moderate":
//       findings.push(SEVERITY=warning, "No source attribution (moderate type)", component=component.code)
//     // If auto_tag_missing_sources is enabled, add "source-needed" tag
//     if config.auto_tag_missing_sources:
//       findings.push(severity=info, "Auto-tag: adding 'source-needed' tag", component=component.code, fixAvailable=true)
//
//   // 5.3.5 Staleness check
//   daysSinceUpdate = daysBetween(component.updated, today)
//   if daysSinceUpdate > config.stale_threshold_days:
//     findings.push(SEVERITY=suggestion, "Component not updated in {daysSinceUpdate} days", component=component.code)
//
//   // 5.3.6 Duplicate code check
//   if component.code already seen:
//     findings.push(SEVERITY=critical, "Duplicate code: {component.code}")
//
//   // 5.3.7 Slug vs title consistency
//   expectedSlug = slugify(component.title)
//   if component.slug !== expectedSlug && similarity(component.slug, expectedSlug) < 0.5:
//     findings.push(SEVERITY=suggestion, "Slug doesn't match title: slug={component.slug}, title={component.title}")
//
// return findings
```

### 5.4 Cross-Reference Audit

```typescript
async function auditCrossReferences(
  components: ParsedComponent[],
  componentIndex: Map<string, ParsedComponent>,
  config: MaintainConfig
): Promise<AuditFinding[]>

// Algorithm:
// findings = []
// allReferences = Map<targetCode, Set<sourceCode>>  // forward refs: who references whom
// allReverseRefs = Map<targetCode, Set<sourceCode>>   // reverse refs: who is referenced by whom
//
// // Define bidirectional relationship pairs
// bidirectionalPairs = {
//   "addresses": "addressed by",
//   "supported by": "supports",
//   "contradicted by": "contradicts",
//   // ... etc from Ontology.md
// }
//
// for each component in components:
//   for each ref in component.related:
//
//     // 5.4.1 Broken reference check
//     if config.check_broken_references:
//       if ref.targetCode not in componentIndex:
//         findings.push(SEVERITY=critical,
//           "Broken reference: {component.code} → {ref.targetCode} (file not found)",
//           fixAvailable=true (can create stub or remove reference))
//
//     // 5.4.2 Type consistency check
//     targetCode = ref.targetCode
//     targetType = extractTypeCode(targetCode)
//     if targetType in COMPONENT_TYPES:
//       expectedRelations = getExpectedRelationships(component.typeCode, targetType)
//       if ref.relationship not in expectedRelations:
//         findings.push(SEVERITY=warning,
//           "Unexpected relationship: {component.typeCode} --{ref.relationship}--> {targetType}")
//
//     // Track references for bidirectional check
//     allReferences.getOrInit(ref.targetCode).add(component.code)
//     allReverseRefs.getOrInit(component.code).add(ref.targetCode)
//
// // 5.4.3 Bidirectional check
// // For each A → B reference, check if B → A exists with the inverse relationship
// for each (sourceCode, targetSet) in allReferences:
//   for each targetCode in targetSet:
//     if targetCode in componentIndex:
//       targetComp = componentIndex[targetCode]
//       expectedInverse = getInverseRelationship(sourceCode, targetCode)
//       if expectedInverse && !hasRelationship(targetComp, expectedInverse, sourceCode):
//         findings.push(SEVERITY=warning,
//           "One-way reference: {sourceCode} → {targetCode} (missing reverse)")
//
// // 5.4.4 Orphan detection
// if config.check_orphans:
//   for each component in components:
//     if component.related.length === 0:
//       findings.push(SEVERITY=suggestion,
//         "Orphan component: {component.code} has zero cross-references")
//
// return findings
```

### 5.5 Index Audit

```typescript
async function auditIndexes(
  substratePath: string,
  components: ParsedComponent[],
  typeFilter?: string
): Promise<AuditFinding[]>

// Algorithm:
// findings = []
//
// for each (code, typeDef) in COMPONENT_TYPES (or filtered):
//   typeDir = join(substratePath, "components", typeDef.dir)
//   indexPath = join(typeDir, "INDEX.md")
//
//   // 5.5.1 Parse INDEX.md
//   indexEntries = parseIndexFile(code, substratePath)
//   actualFiles = list .md files in typeDir (excluding INDEX.md itself)
//
//   // 5.5.2 Check: files in directory but not in INDEX
//   for each file in actualFiles:
//     fileCode = extractCodeFromFilename(file)
//     if fileCode not in indexEntries:
//       findings.push(SEVERITY=warning,
//         "File exists but missing from INDEX.md: {file}", fixAvailable=true)
//
//   // 5.5.3 Check: entries in INDEX but file doesn't exist
//   for each entry in indexEntries:
//     if entry.code not in actualFileCodes:
//       findings.push(SEVERITY=critical,
//         "INDEX references missing file: {entry.code}", fixAvailable=true)
//
//   // 5.5.4 Check: description quality
//   for each entry in indexEntries:
//     if entry.description.length < 10:
//       findings.push(SEVERITY=suggestion,
//         "INDEX entry has very short description: {entry.code}")
//
// // 5.5.5 Check next-ids.json accuracy
// nextIds = readJson(join(substratePath, "metadata/next-ids.json"))
// for each (typeCode, nextId) in nextIds:
//   maxId = getMaxIdForType(typeCode, components)
//   if nextId <= maxId:
//     findings.push(SEVERITY=critical,
//       "next-ids.json counter for {typeCode} is {nextId} but max ID is {maxId} (would cause collision)",
//       fixAvailable=true)
//   elif nextId > maxId + 1:
//     findings.push(SEVERITY=suggestion,
//       "next-ids.json counter for {typeCode} has gap: next={nextId}, max={maxId}")
//
// // 5.5.6 Check index.json completeness
// indexJson = readJson(join(substratePath, "metadata/index.json"))
// for each component in components:
//   if component.code not in indexJson:
//     findings.push(SEVERITY=warning,
//       "Component missing from index.json: {component.code}", fixAvailable=true)
//
// return findings
```

### 5.6 Quality Assessment

```typescript
async function assessQuality(
  components: ParsedComponent[],
  config: MaintainConfig
): Promise<{ findings: AuditFinding[]; statistics: AuditStatistics }>

// Algorithm:
// findings = []
// stats = initAuditStatistics()
//
// // 5.6.1 Confidence distribution
// for each component in components:
//   stats.confidenceDistribution[component.confidence] =
//     (stats.confidenceDistribution[component.confidence] || 0) + 1
//
// // 5.6.2 Source coverage
// for each component in components:
//   if component.sources.length === 0:
//     level = getVerificationLevel(component.typeCode, config)
//     if level === "strict":
//       findings.push(SEVERITY=critical, "No source (strict type): {component.code}")
//     elif level === "moderate":
//       findings.push(SEVERITY=warning, "No source (moderate type): {component.code}")
//     stats.missingSources++
//
// // 5.6.3 Content depth
// for each component in components:
//   if component.wordCount.summary < 20:
//     stats.thinSummaries++
//     findings.push(SEVERITY=suggestion, "Thin summary ({component.wordCount.summary} words): {component.code}")
//   if component.wordCount.details < 50:
//     stats.thinDetails++
//     findings.push(SEVERITY=suggestion, "Thin details ({component.wordCount.details} words): {component.code}")
//
// // 5.6.4 Tag consistency
// tagMap = Map<tag, count>
// for each component in components:
//   for each tag in component.tags:
//     tagMap[normalizeTag(tag)]++
//
// // Find similar tags (differ only in case, hyphenation, singular/plural)
// similarGroups = findSimilarTagGroups(tagMap)
// for each group in similarGroups:
//   findings.push(SEVERITY=suggestion,
//     "Similar tags: {group.join(', ')} — consider consolidating")
// stats.tagSimilarityGroups = similarGroups
//
// // 5.6.5 Cross-reference statistics
// stats.totalCrossReferences = sum of all component.related.length
// stats.orphanComponents = count of components with related.length === 0
//
// return { findings, statistics: stats }
```

### 5.7 Connection Map Regeneration

This is the **critical** section. Connection maps must be regenerated from source data, not patched incrementally.

```typescript
async function regenerateConnectionMaps(
  substratePath: string,
  components: ParsedComponent[]
): Promise<void>

// Algorithm:
//
// // Step 1: Collect ALL cross-references from ALL components
// edgeList: Array<{from: string, to: string, relationship: string}> = []
//
// for each component in components:
//   for each ref in component.related:
//     edgeList.push({
//       from: component.code,
//       to: ref.targetCode,
//       relationship: ref.relationship
//     })
//
// // Step 2: Build connection groupings
// problemSolutions = []  // PR ↔ SO
// claimEvidence = []     // CL → FA/DS
// peopleOrgs = []        // PE ↔ OR
// allConnections = []    // Everything for graph.md
//
// for each edge in edgeList:
//   fromType = extractTypeCode(edge.from)
//   toType = extractTypeCode(edge.to)
//
//   allConnections.push(edge)
//
//   // Problem-Solution map
//   if (fromType === "PR" && toType === "SO") || (fromType === "SO" && toType === "PR"):
//     problemSolutions.push(edge)
//
//   // Claim-Evidence trails
//   if (fromType === "CL" && (toType === "FA" || toType === "DS")):
//     claimEvidence.push(edge)
//   if (fromType === "FA" && toType === "CL"):
//     claimEvidence.push(edge)
//   if (fromType === "DS" && toType === "CL"):
//     claimEvidence.push(edge)
//
//   // People-Organization map
//   if (fromType === "PE" && toType === "OR") || (fromType === "OR" && toType === "PE"):
//     peopleOrgs.push(edge)
//
// // Step 3: Write graph.md
// graphContent = buildGraphMarkdown(allConnections, components)
// writeFileSync(join(substratePath, "connections", "graph.md"), graphContent)
//
// // Step 4: Write problem-solution-map.md
// psContent = buildProblemSolutionMap(problemSolutions, components)
// writeFileSync(join(substratePath, "connections", "problem-solution-map.md"), psContent)
//
// // Step 5: Write claim-evidence-trails.md
// ceContent = buildClaimEvidenceTrails(claimEvidence, components)
// writeFileSync(join(substratePath, "connections", "claim-evidence-trails.md"), ceContent)
//
// // Step 6: Write people-organization-map.md
// poContent = buildPeopleOrganizationMap(peopleOrgs, components)
// writeFileSync(join(substratePath, "connections", "people-organization-map.md"), poContent)
```

#### graph.md Format

```markdown
# {Substrate Name} — Full Connection Graph

> Generated: {timestamp}
> Components: {total} | Edges: {edgeCount}

## Problem ↔ Solution

| Problem | Solution | Relationship |
|---------|----------|-------------|
| PR-00007 | SO-00003 | addresses |
| PR-00007 | SO-00008 | addresses |

## Claim → Evidence

| Claim | Evidence | Type |
|-------|----------|------|
| CL-00005 | FA-00002 | supported_by |
| CL-00005 | DS-00015 | supported_by |

## People ↔ Organizations

| Person | Organization | Relationship |
|--------|-------------|-------------|
| PE-00008 | OR-00003 | belongs_to |

## All Connections

| From | To | Relationship |
|------|----|-------------|
| PR-00007 | SO-00003 | addresses |
| SO-00003 | AR-00001 | supports |
| ... | ... | ... |
```

#### problem-solution-map.md Format

```markdown
# Problem-Solution Map

> Generated: {timestamp}
> Problems: {count} | Solutions: {count} | Links: {count}

## Solutions by Problem

### PR-00007: AI Misinformation at Scale

| Solution | Relationship | Status |
|----------|-------------|--------|
| SO-00003 | addresses | active |
| SO-00008 | addresses | active |

### PR-00015: Insufficient Healthcare Access

| Solution | Relationship | Status |
|----------|-------------|--------|
| SO-00004 | addresses | proposed |

## Problems by Solution

### SO-00003: Automated Fact-Checking Systems

| Problem | Relationship | Status |
|---------|-------------|--------|
| PR-00007 | addressed_by | active |
```

#### claim-evidence-trails.md Format

```markdown
# Claim-Evidence Trails

> Generated: {timestamp}
> Claims: {count} | Evidence links: {count}

## Evidence Trails

### CL-00005: AI Misinformation Is Growing at Scale

| Evidence | Type | Confidence | Source |
|----------|------|-----------|--------|
| FA-00002 | Fact | high | DS-00015 |
| FA-00008 | Fact | high | DS-00022 |

### CL-00019: AI Misinformation Is Being Effectively Managed

| Evidence | Type | Confidence | Source |
|----------|------|-----------|--------|
| AR-00012 | Argument | medium | — |

## Unsupported Claims

| Claim | Confidence | Status |
|-------|-----------|--------|
| CL-00031 | low | proposed |
```

#### people-organization-map.md Format

```markdown
# People-Organization Map

> Generated: {timestamp}

## People by Organization

### OR-00003: OpenAI

| Person | Role | Status |
|--------|------|--------|
| PE-00008 | leads | active |

## Organizations by Person

### PE-00008: Sam Altman

| Organization | Role | Status |
|-------------|------|--------|
| OR-00003 | leads | active |
```

---

## 6. Health Score Calculation

```typescript
function calculateHealthScore(
  findings: AuditFinding[],
  totalComponents: number,
  totalReferences: number
): number

// Algorithm:
// Start at 100, subtract points for findings
// Weight by severity:
//   critical:  -5 points per finding (capped at -30)
//   warning:   -2 points per finding (capped at -20)
//   suggestion: -0.5 points per finding (capped at -10)
// Cap minimum at 0
//
// Adjustments:
//   If >50% of components have no cross-references: -5
//   If >30% of sources are missing: -5
//   If next-ids.json has collision risk: -10
//
// Bonus:
//   If all cross-references are bidirectional: +2
//   If all components have sources: +3
//   If all INDEX.md files are complete: +2
```

---

## 7. Report Generation

```typescript
function generateReport(report: AuditReport, config: MaintainConfig): string

// Output: Markdown report

/*
 Format:

 # Substrate Maintenance Report

 **Substrate**: {name}
 **Date**: {timestamp}
 **Components**: {total}
 **Health Score**: {score}/100

 ## 🔴 Critical Issues ({count})

 - [ ] {finding.message} ({component})

 ## 🟡 Warnings ({count})

 - [ ] {finding.message} ({component})

 ## 🟢 Suggestions ({count})

 - [ ] {finding.message} ({component})

 ## ℹ️ Info ({count})

 - [ ] {finding.message} ({component})

 ## Statistics

 | Metric | Value |
 |--------|-------|
 | Total components | {count} |
 | Components by type | {breakdown} |
 | Cross-references | {total} total, {broken} broken, {oneWay} one-way |
 | Orphans | {count} |
 | Confidence | {high} high, {medium} medium, {low} low |
 | Source coverage | {percentage}% |
 | Thin summaries | {count} |
 | Thin details | {count} |
 | Stale components | {count} |

 ## Auto-Fixes Applied: {count}

 (If --fix mode)
 - Fixed: {description of each fix}

 ## Next Steps

 1. Review critical issues first
 2. Address warnings within 7 days
 3. Consider suggestions at next maintenance cycle
 4. Re-run audit after fixes to confirm resolution
 */
```

---

## 8. Auto-Fix Mode

When `--fix` is passed, the script applies fixes for findings where `fixAvailable === true`:

| Finding Category | Auto-Fix Action |
|-----------------|-----------------|
| Missing component type directory | Create empty directory |
| Missing INDEX.md in type dir | Generate INDEX.md from existing component files |
| Missing connections/graph.md | Regenerate from component cross-references |
| Missing metadata files | Create with sensible defaults |
| Broken reference in component | Remove the reference line from the file |
| One-way reference | Add reciprocal reference to the target component |
| Missing entry in INDEX.md | Add row parsed from component file |
| Extra entry in INDEX.md (file deleted) | Remove the orphaned row |
| Next-ids collision risk | Update next-ids.json to max(existing_ids) + 1 |
| Missing entry in index.json | Add entry from component file |
| Missing source tag (--auto-tag) | Add `source-needed` to tags in frontmatter |
| Short description in INDEX.md | Update from component summary |

**Safety measures**:
1. Before any fix, log the original state to a backup file at `{substrate_path}/.maintain-backup/{timestamp}/`
2. Never delete component files in auto-fix mode
3. Never modify component content (Summary, Details, etc.) — only frontmatter and references
4. Always backup before modifying

---

## 9. Main Execution Flow

```typescript
async function main(): Promise<void> {
  // 1. Parse CLI options
  const options = parseArgs(Bun.argv);

  // 2. Load configuration
  const config = await loadConfig(options.configPath);
  const substrateName = options.substrate || config.default_substrate;
  const substratePath = resolveSubstratePath(config.base_path, substrateName);

  // 3. Validate substrate exists
  if (!exists(substratePath)) {
    console.error(`Substrate not found: ${substratePath}`);
    process.exit(1);
  }

  // 4. Discover and parse all components
  const components = await discoverComponents(substratePath, options.typeFilter);

  // 5. Build component index
  const componentIndex = new Map<string, ParsedComponent>();
  for (const comp of components) {
    componentIndex.set(comp.code, comp);
  }

  // 6. Run all audit checks
  const findings: AuditFinding[] = [];

  // 6a. Structural Integrity
  findings.push(...await checkStructuralIntegrity(substratePath));

  // 6b. Component Audit
  findings.push(...await auditComponents(components, config.maintain));

  // 6c. Cross-Reference Audit
  findings.push(...await auditCrossReferences(
    components, componentIndex, config.maintain
  ));

  // 6d. Index Audit
  findings.push(...await auditIndexes(
    substratePath, components, options.typeFilter
  ));

  // 6e. Quality Assessment
  const { findings: qualityFindings, statistics } = await assessQuality(
    components, config.maintain
  );
  findings.push(...qualityFindings);

  // 7. Calculate health score
  const healthScore = calculateHealthScore(
    findings, components.length, statistics.totalCrossReferences
  );

  // 8. Build report
  const report: AuditReport = {
    substrateName,
    auditDate: new Date().toISOString(),
    totalComponents: components.length,
    componentsByType: countByType(components),
    healthScore,
    findings,
    statistics,
    autoFixedCount: 0,
  };

  // 9. Auto-fix if requested
  if (options.fixMode) {
    report.autoFixedCount = await applyAutoFixes(findings, substratePath, components);
  }

  // 10. Regenerate connection maps
  await regenerateConnectionMaps(substratePath, components);

  // 11. Generate and output report
  const reportMarkdown = generateReport(report, config.maintain);

  // 11a. Write to file
  if (options.outputPath) {
    writeFileSync(options.outputPath, reportMarkdown);
  } else {
    // Default: write to substrate directory
    const reportPath = join(substratePath, `maintenance-report-${new Date().toISOString().split('T')[0]}.md`);
    writeFileSync(reportPath, reportMarkdown);
  }

  // 11b. Also print to stdout (unless --quiet)
  if (!options.quiet) {
    console.log(reportMarkdown);
  }

  // 12. Exit with appropriate code
  const criticalCount = findings.filter(f => f.severity === "critical").length;
  process.exit(criticalCount > 0 ? 1 : 0);
}
```

---

## 10. Performance Requirements

**Target**: Full audit of 500+ components in under 30 seconds.

**Optimization strategies**:

1. **Streaming file reads**: Read and parse component files one at a time, building the index in memory. Do not load all file contents simultaneously.

2. **Parallel where safe**: Structural integrity checks across type directories can run in parallel. Cross-reference checks can be parallelized per type.

3. **Index-based fast paths**: For cross-reference checks, use the in-memory `componentIndex` Map rather than re-reading files.

4. **Lazy content parsing**: Only parse Summary/Details section content when quality assessment requires it (not during reference checking).

5. **Batch writes**: When auto-fixing, batch all file writes and execute them in a single pass rather than reading-modifying-writing each file individually.

**Memory budget**: Should run comfortably within 256MB for substrates up to 5,000 components.

---

## 11. Error Handling

```typescript
// Error handling strategy:
//
// 1. File system errors (ENOENT):
//    - Missing files → report as findings, do not crash
//    - Missing directories → report as findings, suggest creation
//
// 2. Parse errors (malformed frontmatter, invalid YAML):
//    - Log the error with the file path
//    - Skip the component, add to findings as "content error"
//    - Continue processing remaining components
//
// 3. ID collision errors:
//    - Report as critical finding
//    - In --fix mode, increment next-ids to resolve
//
// 4. Permission errors:
//    - Report and skip (do not crash)
//    - Suggest running with appropriate permissions
//
// 5. Empty substrates:
//    - Generate a report showing the full directory structure needs creation
//    - Provide a "suggested initial structure" section
//
// 6. Corrupt files:
//    - Never auto-delete or overwrite content
//    - Report with file path and parse error
//    - Suggest manual review
//
// ALL errors are collected as findings, not thrown as exceptions.
// The script exits 0 (success) or 1 (critical issues found), never crashes.
```

---

## 12. Test Cases

### 12.1 Structural Integrity

| Test | Setup | Expected |
|------|-------|----------|
| All directories exist | Complete substrate | 0 findings |
| Missing type directory | Delete `components/claims/` | Critical: missing directory |
| Missing INDEX.md | Delete `components/problems/INDEX.md` | Critical: missing INDEX.md |
| Missing metadata file | Delete `metadata/next-ids.json` | Critical: missing file |
| Missing connections dir | Delete `connections/` | Critical: missing directory |

### 12.2 Component Audit

| Test | Setup | Expected |
|------|-------|----------|
| Valid component | Well-formed component | 0 findings |
| Missing frontmatter field | Component without `confidence` | Warning: missing field |
| Invalid code format | File with code `PR-X` instead of `PR-00001` | Critical: invalid format |
| Type/directory mismatch | SO file in problems directory | Critical: type mismatch |
| Invalid status | Status `draft` instead of `active`/`proposed`/etc | Warning: invalid status |
| Empty summary | Component with `## Summary\n\n` | Warning: empty summary |
| Thin details | Details section < 50 words | Suggestion: thin details |
| No cross-references | Related section is empty | Suggestion: orphan risk |
| Filename mismatch | File named `PR-00007-wrong-slug.md` with code `PR-00007` but title "AI Misinformation" | Warning: slug mismatch |
| Stale component | `updated: 2024-01-01` (>90 days) | Suggestion: stale |
| Missing source for strict type | FA component with no sources | Critical: no source |
| Missing source for moderate type | PR component with no sources | Warning: no source |

### 12.3 Cross-Reference Audit

| Test | Setup | Expected |
|------|-------|----------|
| Valid bidirectional | A references B, B references A | 0 findings |
| Broken reference | PR-007 references SO-999 (doesn't exist) | Critical: broken reference |
| One-way reference | A references B, B doesn't reference A | Warning: one-way |
| Type mismatch | PR references VA with "addresses" verb | Warning: unexpected relationship |
| Orphan component | Component with empty Related section | Suggestion: orphan |

### 12.4 Index Audit

| Test | Setup | Expected |
|------|-------|----------|
| Complete INDEX.md | All components listed | 0 findings |
| Missing INDEX entry | Component file exists but not in INDEX.md | Warning: missing entry |
| Ghost INDEX entry | INDEX.md references deleted file | Critical: ghost entry |
| next-ids collision | next-ids.json says PR=5, but PR-00007 exists | Critical: collision risk |
| next-ids gap | next-ids.json says PR=100, but max is PR=00020 | Suggestion: gap |
| Missing from index.json | Component not in metadata/index.json | Warning: missing |

### 12.5 Quality Assessment

| Test | Setup | Expected |
|------|-------|----------|
| Healthy substrate | All components well-formed | High health score |
| Tag similarity | Tags "AI" and "artificial-intelligence" | Suggestion: consolidate tags |
| Confidence distribution | Mix of high/medium/low | Statistics reported correctly |
| All sources present | 100% source coverage | No source-related findings |

### 12.6 Connection Map Regeneration

| Test | Setup | Expected |
|------|-------|----------|
| Simple graph | PR→SO, CL→FA references | Correct graph.md generated |
| Problem-solution map | Multiple PR↔SO mappings | Correct map generated |
| Claim-evidence trails | CL→FA→DS chains | Correct trails generated |
| People-organization map | PE↔OR mappings | Correct map generated |
| Empty connections | No cross-references at all | Empty maps with headers |
| Bidirectional consistency | A→B and B→A | Both listed in map |

### 12.7 Auto-Fix Mode

| Test | Setup | Expected |
|------|-------|----------|
| Fix missing INDEX entry | Component file missing from INDEX.md | Entry added |
| Fix one-way reference | A→B exists, B→A missing | B→A added |
| Fix next-ids collision | next-ids < max existing | next-ids updated |
| Don't delete data | Any fix mode | No component files deleted |
| Backup before fix | Any fix | Backup created in .maintain-backup/ |

---

## 13. Dependencies

```json
{
  "dependencies": {
    "yaml": "^2.x"  // For config.yaml parsing
  }
}
```

**No other external dependencies.** The script should use only Bun built-ins (`fs`, `path`, `os`) and the `yaml` package for configuration parsing.

---

## 14. File Output Structure

After running `maintainSubstrate.ts`, the following files are written:

```
{substrate_path}/
├── connections/
│   ├── graph.md                          ← REGENERATED
│   ├── problem-solution-map.md           ← REGENERATED
│   ├── claim-evidence-trails.md          ← REGENERATED
│   └── people-organization-map.md        ← REGENERATED
├── .maintain-backup/
│   └── {timestamp}/
│       ├── {component files}             ← BACKUP (only if --fix was run)
│       └── metadata/
│           ├── index.json                 ← BACKUP
│           └── next-ids.json              ← BACKUP
└── maintenance-report-{YYYY-MM-DD}.md    ← NEW
```

---

*The substrate is a living system. Without maintenance, it decays. This script is the constitutional auditor — meticulous, deterministic, and relentless in its pursuit of graph integrity.*