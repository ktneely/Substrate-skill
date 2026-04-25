#!/usr/bin/env bun
/**
 * maintainSubstrate.ts — Deterministic Substrate Knowledge Graph Auditor
 *
 * Audits a Substrate knowledge graph for structural integrity, cross-reference
 * consistency, content quality, and freshness. Produces a structured markdown
 * report and can optionally auto-fix detected issues.
 *
 * Usage: bun maintainSubstrate.ts [options]
 *
 * @see spec: ~/.opencode/skills/Knowledge/Substrate/Tools/maintainSubstrate-spec.md
 */

import { parse as parseYaml } from "yaml";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

// ─────────────────────────────────────────────────────────────
// 1. Component Type Registry (19 types)
// ─────────────────────────────────────────────────────────────

interface ComponentTypeDef {
  code: string;
  type: string;
  dir: string;
  label: string;
}

const COMPONENT_TYPES: Record<string, ComponentTypeDef> = {
  PR: { code: "PR", type: "Problem", dir: "problems", label: "PROBLEM" },
  SO: { code: "SO", type: "Solution", dir: "solutions", label: "SOLUTION" },
  AR: { code: "AR", type: "Argument", dir: "arguments", label: "ARGUMENT" },
  CL: { code: "CL", type: "Claim", dir: "claims", label: "CLAIM" },
  PL: { code: "PL", type: "Plan", dir: "plans", label: "PLAN" },
  ID: { code: "ID", type: "Idea", dir: "ideas", label: "IDEA" },
  PE: { code: "PE", type: "Person", dir: "people", label: "PERSON" },
  OR: { code: "OR", type: "Organization", dir: "organizations", label: "ORGANIZATION" },
  PJ: { code: "PJ", type: "Project", dir: "projects", label: "PROJECT" },
  VA: { code: "VA", type: "Value", dir: "values", label: "VALUE" },
  MO: { code: "MO", type: "Model", dir: "models", label: "MODEL" },
  FR: { code: "FR", type: "Frame", dir: "frames", label: "FRAME" },
  DS: { code: "DS", type: "Data-Source", dir: "data-sources", label: "DATA SOURCE" },
  LA: { code: "LA", type: "Law", dir: "laws", label: "LAW" },
  VO: { code: "VO", type: "Vote", dir: "votes", label: "VOTE" },
  FU: { code: "FU", type: "Funding-Source", dir: "funding-sources", label: "FUNDING SOURCE" },
  GO: { code: "GO", type: "Goal", dir: "goals", label: "GOAL" },
  FA: { code: "FA", type: "Fact", dir: "facts", label: "FACT" },
  EV: { code: "EV", type: "Event", dir: "events", label: "EVENT" },
};

// ─────────────────────────────────────────────────────────────
// 2. Data Structures
// ─────────────────────────────────────────────────────────────

interface SourceRef {
  url: string;
  title: string;
  accessed: string;
}

interface RelatedRef {
  relationship: string;
  targetCode: string;
  targetDescription: string;
}

interface IndexEntry {
  code: string;
  title: string;
  description: string;
  filePath: string;
}

interface ParsedComponent {
  filePath: string;
  fileName: string;
  code: string;
  type: string;
  typeCode: string;
  title: string;
  status: string;
  created: string;
  updated: string;
  confidence: string;
  tags: string[];
  sources: SourceRef[];
  summary: string;
  details: string;
  related: RelatedRef[];
  malformedRefs: Array<{ raw: string; suggested: string }>;
  slug: string;
  wordCount: {
    summary: number;
    details: number;
  };
  frontmatter: Record<string, unknown>;
}

type Severity = "critical" | "warning" | "suggestion" | "info";

interface AuditFinding {
  id: string;
  severity: Severity;
  category: string;
  message: string;
  component?: string;
  filePath?: string;
  fixAvailable: boolean;
  fixDescription?: string;
}

interface AuditStatistics {
  totalCrossReferences: number;
  brokenReferences: number;
  oneWayReferences: number;
  orphanComponents: number;
  missingSources: number;
  confidenceDistribution: Record<string, number>;
  staleComponents: number;
  thinSummaries: number;
  thinDetails: number;
  tagSimilarityGroups: string[][];
  indexCompleteness: number;
  nextIdsAccuracy: number;
}

interface AuditReport {
  substrateName: string;
  auditDate: string;
  totalComponents: number;
  componentsByType: Record<string, number>;
  healthScore: number;
  findings: AuditFinding[];
  statistics: AuditStatistics;
  autoFixedCount: number;
}

// ─────────────────────────────────────────────────────────────
// 3. Configuration
// ─────────────────────────────────────────────────────────────

interface MaintainConfig {
  report_by_severity: boolean;
  auto_tag_missing_sources: boolean;
  stale_threshold_days: number;
  check_broken_references: boolean;
  check_orphans: boolean;
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

const DEFAULT_MAINTAIN_CONFIG: MaintainConfig = {
  report_by_severity: true,
  auto_tag_missing_sources: true,
  stale_threshold_days: 90,
  check_broken_references: true,
  check_orphans: true,
};

const DEFAULT_CONFIG_PATH = path.join(
  os.homedir(),
  ".opencode/skills/Knowledge/Substrate/config.yaml"
);

// ─────────────────────────────────────────────────────────────
// 4. CLI Interface
// ─────────────────────────────────────────────────────────────

interface CLIOptions {
  substrate: string;
  configPath: string;
  fixMode: boolean;
  outputPath: string | null;
  typeFilter: string | null;
  quiet: boolean;
}

const HELP_TEXT = `
maintainSubstrate.ts — Substrate Knowledge Graph Auditor

Usage: bun maintainSubstrate.ts [options]

Options:
  --substrate <name>     Substrate to audit (default: from config)
  --config <path>        Config file path (default: ~/.opencode/skills/Knowledge/Substrate/config.yaml)
  --fix                  Auto-fix mode (default: suggest only)
  --output <path>        Report output path (default: stdout + substrate file)
  --type <type>          Audit only this component type (e.g., "PR")
  --quiet                Suppress verbose output, show only report
  --help                 Show this help message

Examples:
  bun maintainSubstrate.ts --substrate general
  bun maintainSubstrate.ts --substrate test --fix
  bun maintainSubstrate.ts --substrate global --quiet
  bun maintainSubstrate.ts --type PR --substrate global
`;

function parseArgs(argv: string[]): CLIOptions {
  const options: CLIOptions = {
    substrate: "",
    configPath: DEFAULT_CONFIG_PATH,
    fixMode: false,
    outputPath: null,
    typeFilter: null,
    quiet: false,
  };

  const args = argv.slice(2); // skip bun and script path
  let i = 0;
  while (i < args.length) {
    const arg = args[i];
    switch (arg) {
      case "--substrate":
        options.substrate = args[++i] || "";
        break;
      case "--config":
        options.configPath = args[++i] || DEFAULT_CONFIG_PATH;
        break;
      case "--fix":
        options.fixMode = true;
        break;
      case "--output":
        options.outputPath = args[++i] || null;
        break;
      case "--type":
        options.typeFilter = args[++i] || null;
        break;
      case "--quiet":
        options.quiet = true;
        break;
      case "--help":
        console.log(HELP_TEXT);
        process.exit(0);
        break;
      default:
        process.stderr.write(`Unknown option: ${arg}\n`);
        process.exit(1);
    }
    i++;
  }

  return options;
}

// ─────────────────────────────────────────────────────────────
// 5. Config Loading
// ─────────────────────────────────────────────────────────────

async function loadConfig(configPath: string): Promise<SubstrateConfig> {
  const content = await fs.promises.readFile(configPath, "utf-8");
  const parsed = parseYaml(content) as Record<string, unknown>;
  const substrate = (parsed.substrate || {}) as Record<string, unknown>;

  const maintainRaw = (substrate.maintain || {}) as Record<string, unknown>;
  const maintain: MaintainConfig = {
    report_by_severity: (maintainRaw.report_by_severity as boolean) ?? DEFAULT_MAINTAIN_CONFIG.report_by_severity,
    auto_tag_missing_sources: (maintainRaw.auto_tag_missing_sources as boolean) ?? DEFAULT_MAINTAIN_CONFIG.auto_tag_missing_sources,
    stale_threshold_days: (maintainRaw.stale_threshold_days as number) ?? DEFAULT_MAINTAIN_CONFIG.stale_threshold_days,
    check_broken_references: (maintainRaw.check_broken_references as boolean) ?? DEFAULT_MAINTAIN_CONFIG.check_broken_references,
    check_orphans: (maintainRaw.check_orphans as boolean) ?? DEFAULT_MAINTAIN_CONFIG.check_orphans,
  };

  const verificationRaw = (substrate.verification || {}) as Record<string, string>;
  const verification: Record<string, "strict" | "moderate" | "relaxed"> = {};
  for (const [key, val] of Object.entries(verificationRaw)) {
    if (val === "strict" || val === "moderate" || val === "relaxed") {
      verification[key] = val;
    }
  }

  const dedupRaw = (substrate.dedup || {}) as Record<string, unknown>;
  const dedup = {
    enabled: (dedupRaw.enabled as boolean) ?? true,
    auto_merge_threshold: (dedupRaw.auto_merge_threshold as number) ?? 0.85,
    prompt_threshold: (dedupRaw.prompt_threshold as number) ?? 0.7,
    tag_overlap_threshold: (dedupRaw.tag_overlap_threshold as number) ?? 0.5,
    cross_type_check: (dedupRaw.cross_type_check as boolean) ?? true,
    log_actions: (dedupRaw.log_actions as boolean) ?? true,
  };

  const basePath = ((substrate.base_path as string) || "~/substrates").replace(/^~/, os.homedir());

  return {
    base_path: basePath,
    naming: ((substrate.naming as string) || "numeric-slug") as "numeric" | "slug" | "numeric-slug",
    default_substrate: (substrate.default_substrate as string) || "general",
    maintain,
    verification,
    dedup,
  };
}

// ─────────────────────────────────────────────────────────────
// 6. Utility Functions
// ─────────────────────────────────────────────────────────────

function resolvePath(p: string): string {
  return p.replace(/^~/, os.homedir());
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function isValidISODate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
}

function daysBetween(dateStr: string, reference: Date): number {
  const date = new Date(dateStr);
  const diffMs = reference.getTime() - date.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function extractTypeCode(code: string): string {
  const match = code.match(/^([A-Z]{2})-/);
  return match ? match[1] : "";
}

function extractCodeFromFilename(filename: string): string {
  const match = filename.match(/^([A-Z]{2}-\d{5})/);
  return match ? match[1] : "";
}

function extractSlugFromFilename(filename: string, typeCode: string): string {
  // Remove TYPE-NNNNN- prefix and .md suffix
  const withoutExt = filename.replace(/\.md$/, "");
  const prefix = new RegExp(`^${typeCode}-\\d{5}-`);
  return withoutExt.replace(prefix, "");
}

// Finding ID counter per category
const findingCounters: Record<string, number> = {};

function nextFindingId(category: string): string {
  const prefixMap: Record<string, string> = {
    structural: "STR",
    component: "CMP",
    reference: "REF",
    index: "IDX",
    quality: "QAL",
    connection: "CON",
  };
  const prefix = prefixMap[category] || "UNK";
  findingCounters[prefix] = (findingCounters[prefix] || 0) + 1;
  return `${prefix}-${String(findingCounters[prefix]).padStart(3, "0")}`;
}

function makeFinding(
  severity: Severity,
  category: string,
  message: string,
  options: {
    component?: string;
    filePath?: string;
    fixAvailable?: boolean;
    fixDescription?: string;
  } = {}
): AuditFinding {
  return {
    id: nextFindingId(category),
    severity,
    category,
    message,
    component: options.component,
    filePath: options.filePath,
    fixAvailable: options.fixAvailable ?? false,
    fixDescription: options.fixDescription,
  };
}

// ─────────────────────────────────────────────────────────────
// 7. File Discovery and Parsing
// ─────────────────────────────────────────────────────────────

async function parseComponentFile(filePath: string): Promise<ParsedComponent | null> {
  try {
    const content = await fs.promises.readFile(filePath, "utf-8");
    const fileName = path.basename(filePath);

    // Split frontmatter
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!fmMatch) {
      return null; // malformed file
    }

    const fmText = fmMatch[1];
    const body = fmMatch[2];

    // Parse frontmatter using yaml package
    let frontmatter: Record<string, unknown>;
    try {
      frontmatter = parseYaml(fmText) as Record<string, unknown>;
    } catch {
      return null; // invalid YAML
    }

    // Extract fields
    const code = (frontmatter.code as string) || "";
    const type = (frontmatter.type as string) || "";
    const title = (frontmatter.title as string) || "";
    const status = (frontmatter.status as string) || "";
    const created = (frontmatter.created as string) || "";
    const updated = (frontmatter.updated as string) || "";
    const confidence = (frontmatter.confidence as string) || "";
    const tags = Array.isArray(frontmatter.tags)
      ? (frontmatter.tags as string[])
      : [];

    // Parse sources
    const sources: SourceRef[] = [];
    const sourcesRaw = frontmatter.sources;
    if (Array.isArray(sourcesRaw)) {
      for (const s of sourcesRaw) {
        if (typeof s === "object" && s !== null) {
          const sr = s as Record<string, unknown>;
          sources.push({
            url: (sr.url as string) || "",
            title: (sr.title as string) || "",
            accessed: (sr.accessed as string) || "",
          });
        }
      }
    }

    // Extract sections from body
    const summary = extractSection(body, "Summary");
    const details = extractSection(body, "Details");
    const relatedText = extractSection(body, "Related");

    // Parse cross-references from Related section
    const related = parseRelatedRefs(relatedText);

    // Detect malformed code references (non-5-digit patterns)
    const malformedRefs = detectMalformedRefs(relatedText);

    // Extract type code from code field
    const typeCode = extractTypeCode(code);

    // Extract slug from filename
    const slug = typeCode ? extractSlugFromFilename(fileName, typeCode) : "";

    // Word counts
    const wordCount = {
      summary: countWords(summary),
      details: countWords(details),
    };

    return {
      filePath,
      fileName,
      code,
      type,
      typeCode,
      title,
      status,
      created,
      updated,
      confidence,
      tags,
      sources,
      summary,
      details,
      related,
      malformedRefs,
      slug,
      wordCount,
      frontmatter,
    };
  } catch {
    return null;
  }
}

function extractSection(body: string, sectionName: string): string {
  const regex = new RegExp(`## ${sectionName}\\s*\\n([\\s\\S]*?)(?=## |$)`, "i");
  const match = body.match(regex);
  return match ? match[1].trim() : "";
}

function parseRelatedRefs(text: string): RelatedRef[] {
  if (!text) return [];

  const refs: RelatedRef[] = [];
  const lines = text.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || !trimmed.startsWith("-")) continue;

    // Extract relationship: text before the first [CODE]
    const relMatch = trimmed.match(/^-\s*\*\*(.+?)\*\*:\s*/);
    const relationship = relMatch ? relMatch[1].trim() : "";

    // Find all [CODE] references in the line (strict: exactly 5 digits)
    const codeRegex = /\[([A-Z]{2}-\d{5})\]/g;
    let codeMatch;
    while ((codeMatch = codeRegex.exec(trimmed)) !== null) {
      const targetCode = codeMatch[1];
      // Get description after the code reference
      const afterCode = trimmed.slice(codeMatch.index + codeMatch[0].length).trim();
      // Remove leading dash or other punctuation
      const targetDescription = afterCode.replace(/^[-–—]\s*/, "").trim();

      refs.push({
        relationship,
        targetCode,
        targetDescription,
      });
    }

    // Also handle inline references like [CODE] Description without bold prefix
    if (!relMatch) {
      const inlineMatch = trimmed.match(/^-\s+([A-Z]{2}-\d{5})\b/);
      if (inlineMatch) {
        refs.push({
          relationship: "",
          targetCode: inlineMatch[1],
          targetDescription: trimmed.slice(inlineMatch[0].length).trim(),
        });
      }
    }
  }

  return refs;
}

/**
 * Detect malformed code references in text — patterns that look like
 * component codes (XX-NNN) but don't use exactly 5 digits.
 * Returns array of { raw, suggested } where suggested is the zero-padded fix.
 */
function detectMalformedRefs(text: string): Array<{ raw: string; suggested: string }> {
  if (!text) return [];

  const malformed: Array<{ raw: string; suggested: string }> = [];
  const seen = new Set<string>();

  // Match [XX-NNN] where NNN is 1-4 digits (too short) or 6+ digits (too long)
  const malformedBracketRegex = /\[([A-Z]{2})-(\d+)\]/g;
  let match;
  while ((match = malformedBracketRegex.exec(text)) !== null) {
    const prefix = match[1];
    const digits = match[2];
    const raw = match[0]; // e.g., "[EV-001]"
    if (digits.length !== 5 && !seen.has(raw)) {
      seen.add(raw);
      const padded = digits.padStart(5, "0");
      malformed.push({
        raw,
        suggested: `[${prefix}-${padded}]`,
      });
    }
  }

  // Also detect inline references: - XX-NNN (not in brackets)
  // Use negative lookahead (?!\d) to avoid matching valid 5-digit codes
  // This catches 1-4 digit refs that might be truncated versions of valid codes
  const inlineMalformedRegex = /([A-Z]{2})-(\d{1,4})(?=\s|[,;:.!?)\]]|$)/g;
  while ((match = inlineMalformedRegex.exec(text)) !== null) {
    const prefix = match[1];
    const digits = match[2];
    const raw = `${prefix}-${digits}`;
    if (!seen.has(raw)) {
      seen.add(raw);
      const padded = digits.padStart(5, "0");
      malformed.push({
        raw,
        suggested: `${prefix}-${padded}`,
      });
    }
  }

  return malformed;
}

async function discoverComponents(
  substratePath: string,
  typeFilter?: string
): Promise<ParsedComponent[]> {
  const components: ParsedComponent[] = [];
  const typesToScan = typeFilter && COMPONENT_TYPES[typeFilter]
    ? { [typeFilter]: COMPONENT_TYPES[typeFilter] }
    : COMPONENT_TYPES;

  for (const [code, typeDef] of Object.entries(typesToScan)) {
    const dirPath = path.join(substratePath, "components", typeDef.dir);
    if (!fs.existsSync(dirPath)) continue;

    try {
      const entries = fs.readdirSync(dirPath);
      const mdFiles = entries.filter(
        (e) => e.endsWith(".md") && e !== "INDEX.md"
      );

      for (const file of mdFiles) {
        const filePath = path.join(dirPath, file);
        const parsed = await parseComponentFile(filePath);
        if (parsed) {
          components.push(parsed);
        }
      }
    } catch {
      // Directory read error — continue
    }
  }

  return components;
}

async function parseIndexFile(
  typeCode: string,
  substratePath: string
): Promise<IndexEntry[]> {
  const typeDef = COMPONENT_TYPES[typeCode];
  if (!typeDef) return [];

  const indexPath = path.join(substratePath, "components", typeDef.dir, "INDEX.md");
  if (!fs.existsSync(indexPath)) return [];

  try {
    const content = await fs.promises.readFile(indexPath, "utf-8");
    const entries: IndexEntry[] = [];
    const lines = content.split("\n");

    let inTable = false;
    for (const line of lines) {
      const trimmed = line.trim();

      // Detect table start (header row)
      if (trimmed.startsWith("|") && trimmed.includes("ID")) {
        inTable = true;
        continue;
      }

      // Skip separator row
      if (trimmed.startsWith("|") && trimmed.includes("---")) {
        continue;
      }

      if (!inTable || !trimmed.startsWith("|")) continue;

      // Parse table row: | CODE | TITLE | DESCRIPTION |
      const parts = trimmed.split("|").map((p) => p.trim()).filter(Boolean);
      if (parts.length >= 3) {
        entries.push({
          code: parts[0],
          title: parts[1],
          description: parts[2],
          filePath: "",
        });
      }
    }

    return entries;
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────
// 8. Structural Integrity Check
// ─────────────────────────────────────────────────────────────

async function checkStructuralIntegrity(substratePath: string): Promise<AuditFinding[]> {
  const findings: AuditFinding[] = [];

  // 8.1 Verify component type directories
  for (const [, typeDef] of Object.entries(COMPONENT_TYPES)) {
    const dirPath = path.join(substratePath, "components", typeDef.dir);
    if (!fs.existsSync(dirPath)) {
      findings.push(makeFinding("critical", "structural",
        `Missing directory: ${typeDef.dir}`,
        { fixAvailable: true, fixDescription: `Create directory ${typeDef.dir}` }
      ));
    }
  }

  // 8.2 Verify INDEX.md in each type directory
  for (const [, typeDef] of Object.entries(COMPONENT_TYPES)) {
    const indexPath = path.join(substratePath, "components", typeDef.dir, "INDEX.md");
    if (!fs.existsSync(indexPath)) {
      findings.push(makeFinding("critical", "structural",
        `Missing INDEX.md in ${typeDef.dir}`,
        { fixAvailable: true, fixDescription: `Generate INDEX.md for ${typeDef.dir}` }
      ));
    }
  }

  // 8.3 Verify root metadata files
  const requiredRootFiles = [
    "README.md",
    "INDEX.md",
    "metadata/index.json",
    "metadata/taxonomy.json",
    "metadata/next-ids.json",
  ];

  for (const file of requiredRootFiles) {
    if (!fs.existsSync(path.join(substratePath, file))) {
      findings.push(makeFinding("critical", "structural",
        `Missing root file: ${file}`,
        { fixAvailable: true, fixDescription: `Create ${file}` }
      ));
    }
  }

  // 8.4 Verify connections directory and files
  const connectionsDir = path.join(substratePath, "connections");
  if (!fs.existsSync(connectionsDir)) {
    findings.push(makeFinding("critical", "structural",
      "Missing connections directory",
      { fixAvailable: true, fixDescription: "Create connections directory" }
    ));
  } else {
    const requiredConnections = [
      "graph.md",
      "problem-solution-map.md",
      "claim-evidence-trails.md",
      "people-organization-map.md",
    ];
    for (const connFile of requiredConnections) {
      if (!fs.existsSync(path.join(connectionsDir, connFile))) {
        findings.push(makeFinding("warning", "structural",
          `Missing connection file: ${connFile}`,
          { fixAvailable: true, fixDescription: `Regenerate ${connFile}` }
        ));
      }
    }
  }

  return findings;
}

// ─────────────────────────────────────────────────────────────
// 9. Component Audit
// ─────────────────────────────────────────────────────────────

function getVerificationLevel(
  typeCode: string,
  config: MaintainConfig & { verification?: Record<string, "strict" | "moderate" | "relaxed"> }
): "strict" | "moderate" | "relaxed" {
  const typeDef = COMPONENT_TYPES[typeCode];
  if (!typeDef) return "relaxed";

  const verification = (config as unknown as { verification?: Record<string, string> }).verification;
  if (verification && verification[typeDef.dir]) {
    return verification[typeDef.dir] as "strict" | "moderate" | "relaxed";
  }
  return "relaxed";
}

async function auditComponents(
  components: ParsedComponent[],
  config: MaintainConfig & { verification?: Record<string, "strict" | "moderate" | "relaxed"> }
): Promise<AuditFinding[]> {
  const findings: AuditFinding[] = [];
  const seenCodes = new Set<string>();
  const validStatuses = ["active", "proposed", "resolved", "deprecated"];

  for (const component of components) {
    // 9.1 Frontmatter validation
    const requiredFields = ["code", "type", "title", "status", "created", "updated", "confidence", "tags"];
    for (const field of requiredFields) {
      if (!(field in component.frontmatter)) {
        findings.push(makeFinding("critical", "component",
          `Missing required field: ${field}`,
          { component: component.code }
        ));
      }
    }

    // Code format validation
    if (component.typeCode && component.code) {
      const expectedPattern = new RegExp(`^${component.typeCode}-\\d{5}`);
      if (!expectedPattern.test(component.code)) {
        findings.push(makeFinding("critical", "component",
          `Invalid code format: ${component.code}`,
          { component: component.code }
        ));
      }
    }

    // Malformed cross-reference detection (non-5-digit codes in Related section)
    if (component.malformedRefs && component.malformedRefs.length > 0) {
      for (const mal of component.malformedRefs) {
        findings.push(makeFinding("warning", "reference",
          `Malformed code reference: ${mal.raw} — expected 5-digit format like ${mal.suggested}`,
          {
            component: component.code,
            filePath: component.filePath,
            fixAvailable: true,
            fixDescription: `Replace ${mal.raw} with ${mal.suggested}`,
          }
        ));
      }
    }

    // Type consistency
    if (component.typeCode && COMPONENT_TYPES[component.typeCode]) {
      const expectedType = COMPONENT_TYPES[component.typeCode].type;
      if (component.type !== expectedType) {
        findings.push(makeFinding("critical", "component",
          `Type mismatch: code says ${component.typeCode} but type is ${component.type}`,
          { component: component.code }
        ));
      }
    }

    // Status validation
    if (component.status && !validStatuses.includes(component.status)) {
      findings.push(makeFinding("warning", "component",
        `Invalid status: ${component.status}`,
        { component: component.code }
      ));
    }

    // Date validation
    for (const dateField of ["created", "updated"] as const) {
      const dateVal = component[dateField];
      if (dateVal && !isValidISODate(dateVal)) {
        findings.push(makeFinding("warning", "component",
          `Invalid ${dateField} date: ${dateVal}`,
          { component: component.code }
        ));
      }
    }

    // 9.2 Content validation
    if (!component.summary || component.summary.trim() === "") {
      findings.push(makeFinding("warning", "component",
        "Empty summary",
        { component: component.code }
      ));
    }

    if (component.wordCount.summary < 20) {
      findings.push(makeFinding("suggestion", "component",
        `Summary < 20 words (${component.wordCount.summary} words)`,
        { component: component.code }
      ));
    }

    if (component.wordCount.details < 50) {
      findings.push(makeFinding("suggestion", "component",
        `Details < 50 words (${component.wordCount.details} words)`,
        { component: component.code }
      ));
    }

    if (component.related.length === 0) {
      findings.push(makeFinding("suggestion", "component",
        "No cross-references (orphan risk)",
        { component: component.code }
      ));
    }

    // 9.3 Code consistency (filename vs code)
    if (component.typeCode && component.code && component.slug) {
      const expectedFilename = `${component.code}-${component.slug}.md`;
      if (component.fileName !== expectedFilename) {
        findings.push(makeFinding("warning", "component",
          `Filename mismatch: expected ${expectedFilename}, got ${component.fileName}`,
          { component: component.code, filePath: component.filePath }
        ));
      }
    }

    // 9.4 Source verification
    const verificationLevel = getVerificationLevel(component.typeCode, config);
    if (component.sources.length === 0) {
      if (verificationLevel === "strict") {
        findings.push(makeFinding("critical", "component",
          "No source attribution (strict type requires source)",
          { component: component.code }
        ));
      } else if (verificationLevel === "moderate") {
        findings.push(makeFinding("warning", "component",
          "No source attribution (moderate type)",
          { component: component.code }
        ));
      }
      if (config.auto_tag_missing_sources) {
        findings.push(makeFinding("info", "component",
          "Auto-tag: adding 'source-needed' tag",
          { component: component.code, fixAvailable: true, fixDescription: "Add 'source-needed' tag" }
        ));
      }
    }

    // 9.5 Staleness check
    if (component.updated) {
      const daysSinceUpdate = daysBetween(component.updated, new Date());
      if (daysSinceUpdate > config.stale_threshold_days) {
        findings.push(makeFinding("suggestion", "component",
          `Component not updated in ${daysSinceUpdate} days`,
          { component: component.code }
        ));
      }
    }

    // 9.6 Duplicate code check
    if (seenCodes.has(component.code)) {
      findings.push(makeFinding("critical", "component",
        `Duplicate code: ${component.code}`,
        { component: component.code, filePath: component.filePath }
      ));
    }
    seenCodes.add(component.code);

    // 9.7 Slug vs title consistency
    if (component.title && component.slug) {
      const expectedSlug = slugify(component.title);
      if (component.slug !== expectedSlug) {
        // Simple similarity check: if they share < 50% of characters
        const similarity = computeStringSimilarity(component.slug, expectedSlug);
        if (similarity < 0.5) {
          findings.push(makeFinding("suggestion", "component",
            `Slug doesn't match title: slug="${component.slug}", title="${component.title}"`,
            { component: component.code }
          ));
        }
      }
    }
  }

  return findings;
}

function computeStringSimilarity(a: string, b: string): number {
  if (a === b) return 1.0;
  if (!a || !b) return 0.0;

  const setA = new Set(a.split(""));
  const setB = new Set(b.split(""));
  let intersection = 0;
  for (const char of setA) {
    if (setB.has(char)) intersection++;
  }
  return intersection / Math.max(setA.size, setB.size);
}

// ─────────────────────────────────────────────────────────────
// 10. Cross-Reference Audit
// ─────────────────────────────────────────────────────────────

// Bidirectional relationship pairs (from Ontology.md + actual data)
// Includes all canonical relationships plus entity-specific relationships observed in data
const INVERSE_RELATIONSHIPS: Record<string, string> = {
  // Core pairs from Ontology.md (lines 74-100)
  "addresses": "addressed by",
  "addressed by": "addresses",
  "supported by": "supports",
  "supports": "supported by",
  "argued by": "argues",
  "argues": "argued by",
  "contradicts": "contradicted by",
  "contradicted by": "contradicts",
  "funded by": "funds",
  "funds": "funded by",
  "led by": "leads",
  "leads": "led by",
  "has member": "belongs to",
  "belongs to": "has member",
  "owned by": "owns",
  "owns": "owned by",
  "constrained by": "constrains",
  "constrains": "constrained by",
  "guided by": "guides",
  "guides": "guided by",
  "informed by": "informs",
  "informs": "informed by",
  "reframed by": "reframes",
  "reframes": "reframed by",
  "driven by": "drives",
  "drives": "driven by",
  "involved in": "involves",
  "involves": "involved in",
  "evolved from": "evolves to",
  "evolves to": "evolved from",
  "implements": "implemented by",
  "implemented by": "implements",
  "sources": "sourced from",
  "sourced from": "sources",
  "contained in": "contains",
  "contains": "contained in",
  "executed by": "executes",
  "executes": "executed by",
  "measures": "measured by",
  "measured by": "measures",
  "defined by": "defines",
  "defines": "defined by",
  "exemplified by": "exemplifies",
  "exemplifies": "exemplified by",
  "perpetrated by": "perpetrates",
  "perpetrates": "perpetrated by",
  "related to": "related to",
  "conflicts with": "conflicts with",

  // Person-Organization relationships (from actual data)
  "victim of": "victimized by",
  "victimized by": "victim of",
  "prosecuted by": "prosecuted",
  "prosecuted": "prosecuted by",
  "employed by": "employed",
  "employed": "employed by",
  "works for": "employs",
  "employs": "works for",
  "associated with": "associated with",
  "author of": "authored by",
  "authored by": "author of",
  "informed": "informed by",
  "demonstrates": "demonstrated by",
  "demonstrated by": "demonstrates",
  "led": "led by",

  // Person-Person relationships (self-referential)
  "sibling of": "sibling of",

  // Organization-Organization relationships
  "splintered from": "splintered into",
  "splintered into": "splintered from",
  "competes with": "competes with",
  "members include": "member of",
  "member of": "members include",
  "investigated": "investigated by",
  "investigated by": "investigated",
  "responded to": "responded to by",
  "responded to by": "responded to",
  "published by": "published",
  "published": "published by",

  // Event-Entity relationships
  " defendants": "defendant in",
  "defendant in": "defendants",
  "involved families": "family of",
  "family of": "involved families",
  "follows": "followed by",
  "followed by": "follows",

  // Fact relationships (FA → various targets)
  "survivors": "survivor of",
  "survivor of": "survivors",
  "victims include": "victim of",
  "mechanic": "mechanic of",
  "mechanic of": "mechanic",
  "cartel": "cartel of",
  "cartel of": "cartel",
  "historical": "historical of",
  "historical of": "historical",
  "operated by": "operates",
  "operates": "operated by",
  "event": "event of",
  "event of": "event",
  "policy": "policy of",
  "policy of": "policy",
  "contributes to": "contributed to by",
  "contributed to by": "contributes to",
  "enforced by": "enforces",
  "enforces": "enforced by",

  // Problem relationships
  "affected families": "affected by",
  "affected by": "affected families",
  "author": "authored by",
  "authored by": "author",

  // Data-Source relationships
  "informs": "informed by",
  "informed by": "informs",
};

async function auditCrossReferences(
  components: ParsedComponent[],
  componentIndex: Map<string, ParsedComponent>,
  config: MaintainConfig
): Promise<AuditFinding[]> {
  const findings: AuditFinding[] = [];

  // Track references for bidirectional check
  // forwardRefs: sourceCode -> Set of targetCodes
  const forwardRefs = new Map<string, Set<string>>();
  // reverseRefs: targetCode -> Set of sourceCodes
  const reverseRefs = new Map<string, Set<string>>();
  // Store relationship details: sourceCode -> targetCode -> relationship
  const relationshipMap = new Map<string, Map<string, string>>();

  for (const component of components) {
    for (const ref of component.related) {
      // 10.1 Broken reference check
      if (config.check_broken_references) {
        if (!componentIndex.has(ref.targetCode)) {
          findings.push(makeFinding("critical", "reference",
            `Broken reference: ${component.code} → ${ref.targetCode} (file not found)`,
            {
              component: component.code,
              fixAvailable: true,
              fixDescription: `Remove reference to ${ref.targetCode} or create stub`,
            }
          ));
        }
      }

      // 10.2 Type consistency check
      const targetType = extractTypeCode(ref.targetCode);
      if (targetType && COMPONENT_TYPES[targetType] && COMPONENT_TYPES[component.typeCode]) {
        // Check if relationship is valid for these types
        // This is a soft check — many relationships are valid across types
        const rel = ref.relationship.toLowerCase();
        if (rel && !isKnownRelationship(rel)) {
          findings.push(makeFinding("warning", "reference",
            `Unexpected relationship: ${component.typeCode} --${ref.relationship}--> ${targetType}`,
            { component: component.code }
          ));
        }
      }

      // Track references
      if (!forwardRefs.has(component.code)) {
        forwardRefs.set(component.code, new Set());
      }
      forwardRefs.get(component.code)!.add(ref.targetCode);

      if (!reverseRefs.has(ref.targetCode)) {
        reverseRefs.set(ref.targetCode, new Set());
      }
      reverseRefs.get(ref.targetCode)!.add(component.code);

      // Store relationship
      if (!relationshipMap.has(component.code)) {
        relationshipMap.set(component.code, new Map());
      }
      relationshipMap.get(component.code)!.set(ref.targetCode, ref.relationship);
    }
  }

  // 10.3 Bidirectional check
  let oneWayCount = 0;
  for (const [sourceCode, targets] of forwardRefs) {
    for (const targetCode of targets) {
      if (componentIndex.has(targetCode)) {
        const sourceRels = relationshipMap.get(sourceCode);
        const relationship = sourceRels?.get(targetCode) || "";
        const expectedInverse = INVERSE_RELATIONSHIPS[relationship.toLowerCase()];

        if (expectedInverse) {
          const targetRels = relationshipMap.get(targetCode);
          const hasInverse = targetRels?.has(sourceCode) &&
            targetRels?.get(sourceCode)?.toLowerCase() === expectedInverse.toLowerCase();

          if (!hasInverse) {
            oneWayCount++;
            findings.push(makeFinding("warning", "reference",
              `One-way reference: ${sourceCode} → ${targetCode} (${relationship}) — missing reverse`,
              {
                component: sourceCode,
                fixAvailable: true,
                fixDescription: `Add "${expectedInverse}" reference from ${targetCode} to ${sourceCode}`,
              }
            ));
          }
        }
      }
    }
  }

  // 10.4 Orphan detection
  if (config.check_orphans) {
    for (const component of components) {
      if (component.related.length === 0) {
        findings.push(makeFinding("suggestion", "reference",
          `Orphan component: ${component.code} has zero cross-references`,
          { component: component.code }
        ));
      }
    }
  }

  // Store one-way count for statistics
  (auditCrossReferences as unknown as { lastOneWayCount: number }).lastOneWayCount = oneWayCount;

  return findings;
}

function isKnownRelationship(rel: string): boolean {
  const known = [
    // Core pairs from Ontology.md (lines 74-100)
    "addresses", "addressed by",
    "supported by", "supports",
    "argued by", "argues",
    "contradicts", "contradicted by",
    "funded by", "funds",
    "led by", "leads",
    "has member", "belongs to",
    "owned by", "owns",
    "constrained by", "constrains",
    "guided by", "guides",
    "informed by", "informs",
    "reframed by", "reframes",
    "driven by", "drives",
    "involved in", "involves",
    "evolved from", "evolves to",
    "implements", "implemented by",
    "sources", "sourced from",
    "contained in", "contains",
    "executed by", "executes",
    "measures", "measured by",
    "defined by", "defines",
    "exemplified by", "exemplifies",
    "perpetrated by", "perpetrates",
    "related to", "conflicts with",

    // Person-Organization relationships
    "victim of", "victimized by",
    "prosecuted by", "prosecuted",
    "employed by", "employed",
    "works for", "employs",
    "associated with",
    "author of", "authored by",
    "demonstrates", "demonstrated by",
    "led",

    // Person-Person relationships
    "sibling of",

    // Organization-Organization relationships
    "splintered from", "splintered into",
    "competes with",
    "members include", "member of",
    "investigated", "investigated by",
    "responded to", "responded to by",
    "published by", "published",

    // Event-Entity relationships
    "defendants", "defendant in",
    "involved families", "family of",
    "follows", "followed by",

    // Fact relationships
    "survivors", "survivor of",
    "victims include", "victim of",
    "mechanic", "mechanic of",
    "cartel", "cartel of",
    "historical", "historical of",
    "operated by", "operates",
    "event", "event of",
    "policy", "policy of",
    "contributes to", "contributed to by",
    "enforced by", "enforces",

    // Problem relationships
    "affected families", "affected by",
    "author",

    // Additional from actual data
    "involved", "evidence for", "guided by",
    // Fallback variations (case variations already handled by toLowerCase)
    "law", "informed", "informs",
  ];
  return known.includes(rel.toLowerCase());
}

// ─────────────────────────────────────────────────────────────
// 11. Index Audit
// ─────────────────────────────────────────────────────────────

async function auditIndexes(
  substratePath: string,
  components: ParsedComponent[],
  typeFilter?: string
): Promise<AuditFinding[]> {
  const findings: AuditFinding[] = [];
  const typesToCheck = typeFilter && COMPONENT_TYPES[typeFilter]
    ? { [typeFilter]: COMPONENT_TYPES[typeFilter] }
    : COMPONENT_TYPES;

  // Build a map of typeCode -> set of actual file codes
  const actualFileCodesByType = new Map<string, Set<string>>();
  for (const comp of components) {
    if (!actualFileCodesByType.has(comp.typeCode)) {
      actualFileCodesByType.set(comp.typeCode, new Set());
    }
    actualFileCodesByType.get(comp.typeCode)!.add(comp.code);
  }

  for (const [typeCode, typeDef] of Object.entries(typesToCheck)) {
    const typeDir = path.join(substratePath, "components", typeDef.dir);
    const indexPath = path.join(typeDir, "INDEX.md");

    if (!fs.existsSync(indexPath)) continue;

    // 11.1 Parse INDEX.md
    const indexEntries = await parseIndexFile(typeCode, substratePath);
    const actualFiles = fs.readdirSync(typeDir).filter(
      (e) => e.endsWith(".md") && e !== "INDEX.md"
    );
    const actualCodes = new Set<string>();
    for (const file of actualFiles) {
      const code = extractCodeFromFilename(file);
      if (code) actualCodes.add(code);
    }

    // 11.2 Files in directory but not in INDEX
    const indexCodes = new Set(indexEntries.map((e) => e.code));
    for (const code of actualCodes) {
      if (!indexCodes.has(code)) {
        findings.push(makeFinding("warning", "index",
          `File exists but missing from INDEX.md: ${code}`,
          { component: code, fixAvailable: true, fixDescription: `Add ${code} to INDEX.md` }
        ));
      }
    }

    // 11.3 Entries in INDEX but file doesn't exist
    for (const entry of indexEntries) {
      if (!actualCodes.has(entry.code)) {
        findings.push(makeFinding("critical", "index",
          `INDEX references missing file: ${entry.code}`,
          { component: entry.code, fixAvailable: true, fixDescription: `Remove ${entry.code} from INDEX.md or restore file` }
        ));
      }
    }

    // 11.4 Description quality
    for (const entry of indexEntries) {
      if (entry.description.length < 10) {
        findings.push(makeFinding("suggestion", "index",
          `INDEX entry has very short description: ${entry.code}`,
          { component: entry.code }
        ));
      }
    }
  }

  // 11.5 Check next-ids.json accuracy
  const nextIdsPath = path.join(substratePath, "metadata", "next-ids.json");
  if (fs.existsSync(nextIdsPath)) {
    try {
      const nextIdsContent = await fs.promises.readFile(nextIdsPath, "utf-8");
      const nextIds = JSON.parse(nextIdsContent) as Record<string, number>;

      for (const [typeCode, nextId] of Object.entries(nextIds)) {
        const maxId = getMaxIdForType(typeCode, components);
        if (nextId <= maxId) {
          findings.push(makeFinding("critical", "index",
            `next-ids.json counter for ${typeCode} is ${nextId} but max ID is ${maxId} (would cause collision)`,
            { fixAvailable: true, fixDescription: `Update ${typeCode} next-id to ${maxId + 1}` }
          ));
        } else if (nextId > maxId + 1) {
          findings.push(makeFinding("suggestion", "index",
            `next-ids.json counter for ${typeCode} has gap: next=${nextId}, max=${maxId}`,
            { fixAvailable: false }
          ));
        }
      }
    } catch {
      findings.push(makeFinding("critical", "index",
        "Failed to parse next-ids.json",
        { fixAvailable: false }
      ));
    }
  }

  // 11.6 Check index.json completeness
  const indexJsonPath = path.join(substratePath, "metadata", "index.json");
  if (fs.existsSync(indexJsonPath)) {
    try {
      const indexJsonContent = await fs.promises.readFile(indexJsonPath, "utf-8");
      const indexJson = JSON.parse(indexJsonContent) as { components?: Record<string, unknown> };
      const indexedCodes = indexJson.components ? Object.keys(indexJson.components) : [];

      for (const component of components) {
        if (!indexedCodes.includes(component.code)) {
          findings.push(makeFinding("warning", "index",
            `Component missing from index.json: ${component.code}`,
            { component: component.code, fixAvailable: true, fixDescription: `Add ${component.code} to index.json` }
          ));
        }
      }
    } catch {
      findings.push(makeFinding("critical", "index",
        "Failed to parse index.json",
        { fixAvailable: false }
      ));
    }
  }

  // Calculate index completeness
  const totalComponents = components.length;
  let inIndex = 0;
  if (fs.existsSync(indexJsonPath)) {
    try {
      const indexJson = JSON.parse(fs.readFileSync(indexJsonPath, "utf-8")) as { components?: Record<string, unknown> };
      const indexedCodes = indexJson.components ? Object.keys(indexJson.components) : [];
      inIndex = components.filter((c) => indexedCodes.includes(c.code)).length;
    } catch { /* ignore */ }
  }
  (auditIndexes as unknown as { lastCompleteness: number }).lastCompleteness =
    totalComponents > 0 ? (inIndex / totalComponents) * 100 : 100;

  return findings;
}

function getMaxIdForType(typeCode: string, components: ParsedComponent[]): number {
  let maxId = 0;
  for (const comp of components) {
    if (comp.typeCode === typeCode) {
      const numMatch = comp.code.match(/^\w{2}-(\d+)/);
      if (numMatch) {
        const num = parseInt(numMatch[1], 10);
        if (num > maxId) maxId = num;
      }
    }
  }
  return maxId;
}

// ─────────────────────────────────────────────────────────────
// 12. Quality Assessment
// ─────────────────────────────────────────────────────────────

function initAuditStatistics(): AuditStatistics {
  return {
    totalCrossReferences: 0,
    brokenReferences: 0,
    oneWayReferences: 0,
    orphanComponents: 0,
    missingSources: 0,
    confidenceDistribution: {},
    staleComponents: 0,
    thinSummaries: 0,
    thinDetails: 0,
    tagSimilarityGroups: [],
    indexCompleteness: 100,
    nextIdsAccuracy: 100,
  };
}

async function assessQuality(
  components: ParsedComponent[],
  config: MaintainConfig & { verification?: Record<string, "strict" | "moderate" | "relaxed"> }
): Promise<{ findings: AuditFinding[]; statistics: AuditStatistics }> {
  const findings: AuditFinding[] = [];
  const stats = initAuditStatistics();

  // 12.1 Confidence distribution
  for (const component of components) {
    const conf = component.confidence || "unknown";
    stats.confidenceDistribution[conf] = (stats.confidenceDistribution[conf] || 0) + 1;
  }

  // 12.2 Source coverage
  for (const component of components) {
    if (component.sources.length === 0) {
      stats.missingSources++;
    }
  }

  // 12.3 Content depth
  for (const component of components) {
    if (component.wordCount.summary < 20) {
      stats.thinSummaries++;
    }
    if (component.wordCount.details < 50) {
      stats.thinDetails++;
    }
  }

  // 12.4 Tag consistency — find similar tags
  const tagMap = new Map<string, number>();
  for (const component of components) {
    for (const tag of component.tags) {
      if (typeof tag !== "string") continue;
      const normalized = tag.toLowerCase().replace(/[_\s]+/g, "-");
      tagMap.set(normalized, (tagMap.get(normalized) || 0) + 1);
    }
  }

  const similarGroups = findSimilarTagGroups(tagMap);
  for (const group of similarGroups) {
    if (group.length > 1) {
      findings.push(makeFinding("suggestion", "quality",
        `Similar tags: ${group.join(", ")} — consider consolidating`,
        { fixAvailable: false }
      ));
    }
  }
  stats.tagSimilarityGroups = similarGroups;

  // 12.5 Cross-reference statistics
  stats.totalCrossReferences = components.reduce(
    (sum, c) => sum + c.related.length, 0
  );
  stats.orphanComponents = components.filter(
    (c) => c.related.length === 0
  ).length;

  // Stale components
  const today = new Date();
  stats.staleComponents = components.filter(
    (c) => c.updated && daysBetween(c.updated, today) > config.stale_threshold_days
  ).length;

  // Get index completeness from index audit
  const idxAudit = auditIndexes as unknown as { lastCompleteness?: number };
  if (idxAudit.lastCompleteness !== undefined) {
    stats.indexCompleteness = idxAudit.lastCompleteness;
  }

  // Get one-way references from cross-reference audit
  const refAudit = auditCrossReferences as unknown as { lastOneWayCount?: number };
  if (refAudit.lastOneWayCount !== undefined) {
    stats.oneWayReferences = refAudit.lastOneWayCount;
  }

  // Broken references will be calculated in main() after all audits complete
  stats.brokenReferences = 0;

  return { findings, statistics: stats };
}

function findSimilarTagGroups(tagMap: Map<string, number>): string[][] {
  const groups: string[][] = [];
  const tags = Array.from(tagMap.keys());
  const visited = new Set<string>();

  for (let i = 0; i < tags.length; i++) {
    if (visited.has(tags[i])) continue;

    const group = [tags[i]];
    for (let j = i + 1; j < tags.length; j++) {
      if (visited.has(tags[j])) continue;

      if (areTagsSimilar(tags[i], tags[j])) {
        group.push(tags[j]);
        visited.add(tags[j]);
      }
    }

    if (group.length > 1) {
      groups.push(group);
      visited.add(tags[i]);
    }
  }

  return groups;
}

function areTagsSimilar(a: string, b: string): boolean {
  // Check if tags differ only in case
  if (a.toLowerCase() === b.toLowerCase()) return true;

  // Check singular/plural (simple heuristic)
  if (a === b + "s" || b === a + "s") return true;
  if (a === b + "es" || b === a + "es") return true;

  // Check hyphen vs underscore
  if (a.replace(/-/g, "_") === b.replace(/-/g, "_")) return true;

  return false;
}

// ─────────────────────────────────────────────────────────────
// 13. Connection Map Regeneration
// ─────────────────────────────────────────────────────────────

interface Edge {
  from: string;
  to: string;
  relationship: string;
}

async function regenerateConnectionMaps(
  substratePath: string,
  components: ParsedComponent[]
): Promise<void> {
  // Step 1: Collect all cross-references
  const edgeList: Edge[] = [];
  for (const component of components) {
    for (const ref of component.related) {
      edgeList.push({
        from: component.code,
        to: ref.targetCode,
        relationship: ref.relationship,
      });
    }
  }

  // Step 2: Build connection groupings
  const problemSolutions: Edge[] = [];
  const claimEvidence: Edge[] = [];
  const peopleOrgs: Edge[] = [];

  for (const edge of edgeList) {
    const fromType = extractTypeCode(edge.from);
    const toType = extractTypeCode(edge.to);

    // Problem-Solution map
    if (
      (fromType === "PR" && toType === "SO") ||
      (fromType === "SO" && toType === "PR")
    ) {
      problemSolutions.push(edge);
    }

    // Claim-Evidence trails
    if (
      (fromType === "CL" && (toType === "FA" || toType === "DS")) ||
      (fromType === "FA" && toType === "CL") ||
      (fromType === "DS" && toType === "CL")
    ) {
      claimEvidence.push(edge);
    }

    // People-Organization map
    if (
      (fromType === "PE" && toType === "OR") ||
      (fromType === "OR" && toType === "PE")
    ) {
      peopleOrgs.push(edge);
    }
  }

  // Build component lookup
  const compMap = new Map<string, ParsedComponent>();
  for (const c of components) compMap.set(c.code, c);

  // Step 3: Write graph.md
  const connectionsDir = path.join(substratePath, "connections");
  if (!fs.existsSync(connectionsDir)) {
    fs.mkdirSync(connectionsDir, { recursive: true });
  }

  const graphContent = buildGraphMarkdown(edgeList, components, compMap);
  fs.writeFileSync(path.join(connectionsDir, "graph.md"), graphContent);

  // Step 4: Write problem-solution-map.md
  const psContent = buildProblemSolutionMap(problemSolutions, components, compMap);
  fs.writeFileSync(path.join(connectionsDir, "problem-solution-map.md"), psContent);

  // Step 5: Write claim-evidence-trails.md
  const ceContent = buildClaimEvidenceTrails(claimEvidence, components, compMap);
  fs.writeFileSync(path.join(connectionsDir, "claim-evidence-trails.md"), ceContent);

  // Step 6: Write people-organization-map.md
  const poContent = buildPeopleOrganizationMap(peopleOrgs, components, compMap);
  fs.writeFileSync(path.join(connectionsDir, "people-organization-map.md"), poContent);
}

function buildGraphMarkdown(
  edges: Edge[],
  components: ParsedComponent[],
  compMap: Map<string, ParsedComponent>
): string {
  const timestamp = new Date().toISOString().split("T")[0];
  const totalComponents = components.length;
  const edgeCount = edges.length;

  // Categorize edges
  const problemSolutions = edges.filter(
    (e) =>
      (extractTypeCode(e.from) === "PR" && extractTypeCode(e.to) === "SO") ||
      (extractTypeCode(e.from) === "SO" && extractTypeCode(e.to) === "PR")
  );
  const claimEvidence = edges.filter(
    (e) =>
      (extractTypeCode(e.from) === "CL" && (extractTypeCode(e.to) === "FA" || extractTypeCode(e.to) === "DS")) ||
      (extractTypeCode(e.from) === "FA" && extractTypeCode(e.to) === "CL") ||
      (extractTypeCode(e.from) === "DS" && extractTypeCode(e.to) === "CL")
  );
  const peopleOrgs = edges.filter(
    (e) =>
      (extractTypeCode(e.from) === "PE" && extractTypeCode(e.to) === "OR") ||
      (extractTypeCode(e.from) === "OR" && extractTypeCode(e.to) === "PE")
  );

  let md = `# Connection Graph\n\n`;
  md += `> Generated: ${timestamp}\n`;
  md += `> Components: ${totalComponents} | Edges: ${edgeCount}\n\n`;

  // Problem ↔ Solution
  md += `## Problem ↔ Solution\n\n`;
  if (problemSolutions.length === 0) {
    md += `*None yet.*\n\n`;
  } else {
    md += `| Problem | Solution | Relationship |\n|---------|----------|-------------|\n`;
    for (const e of problemSolutions) {
      const fromComp = compMap.get(e.from);
      const toComp = compMap.get(e.to);
      if (extractTypeCode(e.from) === "PR") {
        md += `| ${e.from} | ${e.to} | ${e.relationship} |\n`;
      } else {
        md += `| ${e.to} | ${e.from} | ${e.relationship} |\n`;
      }
    }
    md += `\n`;
  }

  // Claim → Evidence
  md += `## Claim → Evidence\n\n`;
  if (claimEvidence.length === 0) {
    md += `*None yet.*\n\n`;
  } else {
    md += `| Claim | Evidence | Type |\n|-------|----------|------|\n`;
    for (const e of claimEvidence) {
      if (extractTypeCode(e.from) === "CL") {
        md += `| ${e.from} | ${e.to} | ${e.relationship} |\n`;
      } else {
        md += `| ${e.to} | ${e.from} | ${e.relationship} |\n`;
      }
    }
    md += `\n`;
  }

  // People ↔ Organizations
  md += `## People ↔ Organizations\n\n`;
  if (peopleOrgs.length === 0) {
    md += `*None yet.*\n\n`;
  } else {
    md += `| Person | Organization | Relationship |\n|--------|-------------|-------------|\n`;
    for (const e of peopleOrgs) {
      if (extractTypeCode(e.from) === "PE") {
        md += `| ${e.from} | ${e.to} | ${e.relationship} |\n`;
      } else {
        md += `| ${e.to} | ${e.from} | ${e.relationship} |\n`;
      }
    }
    md += `\n`;
  }

  // All Connections
  md += `## All Connections\n\n`;
  if (edges.length === 0) {
    md += `*None yet.*\n\n`;
  } else {
    md += `| From | To | Relationship |\n|------|----|-------------|\n`;
    for (const e of edges) {
      md += `| ${e.from} | ${e.to} | ${e.relationship} |\n`;
    }
    md += `\n`;
  }

  return md;
}

function buildProblemSolutionMap(
  edges: Edge[],
  components: ParsedComponent[],
  compMap: Map<string, ParsedComponent>
): string {
  const timestamp = new Date().toISOString().split("T")[0];

  const problems = new Set<string>();
  const solutions = new Set<string>();
  for (const e of edges) {
    if (extractTypeCode(e.from) === "PR") problems.add(e.from);
    if (extractTypeCode(e.to) === "PR") problems.add(e.to);
    if (extractTypeCode(e.from) === "SO") solutions.add(e.from);
    if (extractTypeCode(e.to) === "SO") solutions.add(e.to);
  }

  let md = `# Problem-Solution Map\n\n`;
  md += `> Generated: ${timestamp}\n`;
  md += `> Problems: ${problems.size} | Solutions: ${solutions.size} | Links: ${edges.length}\n\n`;

  // Solutions by Problem
  md += `## Solutions by Problem\n\n`;
  if (problems.size === 0) {
    md += `*None yet.*\n\n`;
  } else {
    for (const pr of Array.from(problems).sort()) {
      const comp = compMap.get(pr);
      const title = comp ? comp.title : "";
      md += `### ${pr}${title ? `: ${title}` : ""}\n\n`;
      md += `| Solution | Relationship | Status |\n|----------|-------------|--------|\n`;
      for (const e of edges) {
        if (extractTypeCode(e.from) === "PR" && e.from === pr) {
          const toComp = compMap.get(e.to);
          md += `| ${e.to} | ${e.relationship} | ${toComp?.status || ""} |\n`;
        } else if (extractTypeCode(e.to) === "PR" && e.to === pr) {
          const fromComp = compMap.get(e.from);
          md += `| ${e.from} | ${e.relationship} | ${fromComp?.status || ""} |\n`;
        }
      }
      md += `\n`;
    }
  }

  // Problems by Solution
  md += `## Problems by Solution\n\n`;
  if (solutions.size === 0) {
    md += `*None yet.*\n\n`;
  } else {
    for (const so of Array.from(solutions).sort()) {
      const comp = compMap.get(so);
      const title = comp ? comp.title : "";
      md += `### ${so}${title ? `: ${title}` : ""}\n\n`;
      md += `| Problem | Relationship | Status |\n|---------|-------------|--------|\n`;
      for (const e of edges) {
        if (extractTypeCode(e.from) === "SO" && e.from === so) {
          const toComp = compMap.get(e.to);
          md += `| ${e.to} | ${e.relationship} | ${toComp?.status || ""} |\n`;
        } else if (extractTypeCode(e.to) === "SO" && e.to === so) {
          const fromComp = compMap.get(e.from);
          md += `| ${e.from} | ${e.relationship} | ${fromComp?.status || ""} |\n`;
        }
      }
      md += `\n`;
    }
  }

  return md;
}

function buildClaimEvidenceTrails(
  edges: Edge[],
  components: ParsedComponent[],
  compMap: Map<string, ParsedComponent>
): string {
  const timestamp = new Date().toISOString().split("T")[0];

  const claims = new Set<string>();
  for (const e of edges) {
    if (extractTypeCode(e.from) === "CL") claims.add(e.from);
    if (extractTypeCode(e.to) === "CL") claims.add(e.to);
  }

  // Claims with evidence
  const claimsWithEvidence = new Set<string>();
  for (const e of edges) {
    if (extractTypeCode(e.from) === "CL") claimsWithEvidence.add(e.from);
    if (extractTypeCode(e.to) === "CL") claimsWithEvidence.add(e.to);
  }

  let md = `# Claim-Evidence Trails\n\n`;
  md += `> Generated: ${timestamp}\n`;
  md += `> Claims: ${claims.size} | Evidence links: ${edges.length}\n\n`;

  // Evidence Trails
  md += `## Evidence Trails\n\n`;
  if (claimsWithEvidence.size === 0) {
    md += `*None yet.*\n\n`;
  } else {
    for (const cl of Array.from(claimsWithEvidence).sort()) {
      const comp = compMap.get(cl);
      const title = comp ? comp.title : "";
      md += `### ${cl}${title ? `: ${title}` : ""}\n\n`;
      md += `| Evidence | Type | Confidence | Source |\n|----------|------|-----------|--------|\n`;
      for (const e of edges) {
        if (extractTypeCode(e.from) === "CL" && e.from === cl) {
          const evComp = compMap.get(e.to);
          md += `| ${e.to} | ${COMPONENT_TYPES[extractTypeCode(e.to)]?.type || ""} | ${evComp?.confidence || ""} | ${evComp?.sources?.length ? evComp.sources[0].url : "—"} |\n`;
        } else if (extractTypeCode(e.to) === "CL" && e.to === cl) {
          const evComp = compMap.get(e.from);
          md += `| ${e.from} | ${COMPONENT_TYPES[extractTypeCode(e.from)]?.type || ""} | ${evComp?.confidence || ""} | ${evComp?.sources?.length ? evComp.sources[0].url : "—"} |\n`;
        }
      }
      md += `\n`;
    }
  }

  // Unsupported Claims
  md += `## Unsupported Claims\n\n`;
  const allClaims = components.filter((c) => c.typeCode === "CL");
  const unsupported = allClaims.filter((c) => !claimsWithEvidence.has(c.code));
  if (unsupported.length === 0) {
    md += `*All claims have evidence.*\n\n`;
  } else {
    md += `| Claim | Confidence | Status |\n|-------|-----------|--------|\n`;
    for (const c of unsupported) {
      md += `| ${c.code} | ${c.confidence} | ${c.status} |\n`;
    }
    md += `\n`;
  }

  return md;
}

function buildPeopleOrganizationMap(
  edges: Edge[],
  components: ParsedComponent[],
  compMap: Map<string, ParsedComponent>
): string {
  const timestamp = new Date().toISOString().split("T")[0];

  const orgs = new Set<string>();
  const people = new Set<string>();
  for (const e of edges) {
    if (extractTypeCode(e.from) === "OR") orgs.add(e.from);
    if (extractTypeCode(e.to) === "OR") orgs.add(e.to);
    if (extractTypeCode(e.from) === "PE") people.add(e.from);
    if (extractTypeCode(e.to) === "PE") people.add(e.to);
  }

  let md = `# People-Organization Map\n\n`;
  md += `> Generated: ${timestamp}\n\n`;

  // People by Organization
  md += `## People by Organization\n\n`;
  if (orgs.size === 0) {
    md += `*None yet.*\n\n`;
  } else {
    for (const org of Array.from(orgs).sort()) {
      const comp = compMap.get(org);
      const title = comp ? comp.title : "";
      md += `### ${org}${title ? `: ${title}` : ""}\n\n`;
      md += `| Person | Role | Status |\n|--------|------|--------|\n`;
      for (const e of edges) {
        if (extractTypeCode(e.from) === "OR" && e.from === org) {
          const peComp = compMap.get(e.to);
          md += `| ${e.to} | ${e.relationship} | ${peComp?.status || ""} |\n`;
        } else if (extractTypeCode(e.to) === "OR" && e.to === org) {
          const peComp = compMap.get(e.from);
          md += `| ${e.from} | ${e.relationship} | ${peComp?.status || ""} |\n`;
        }
      }
      md += `\n`;
    }
  }

  // Organizations by Person
  md += `## Organizations by Person\n\n`;
  if (people.size === 0) {
    md += `*None yet.*\n\n`;
  } else {
    for (const pe of Array.from(people).sort()) {
      const comp = compMap.get(pe);
      const title = comp ? comp.title : "";
      md += `### ${pe}${title ? `: ${title}` : ""}\n\n`;
      md += `| Organization | Role | Status |\n|-------------|------|--------|\n`;
      for (const e of edges) {
        if (extractTypeCode(e.from) === "PE" && e.from === pe) {
          const orgComp = compMap.get(e.to);
          md += `| ${e.to} | ${e.relationship} | ${orgComp?.status || ""} |\n`;
        } else if (extractTypeCode(e.to) === "PE" && e.to === pe) {
          const orgComp = compMap.get(e.from);
          md += `| ${e.from} | ${e.relationship} | ${orgComp?.status || ""} |\n`;
        }
      }
      md += `\n`;
    }
  }

  return md;
}

// ─────────────────────────────────────────────────────────────
// 14. Health Score Calculation
// ─────────────────────────────────────────────────────────────

function calculateHealthScore(
  findings: AuditFinding[],
  totalComponents: number,
  totalReferences: number
): number {
  let score = 100;

  // Count by severity
  const criticalCount = findings.filter((f) => f.severity === "critical").length;
  const warningCount = findings.filter((f) => f.severity === "warning").length;
  const suggestionCount = findings.filter((f) => f.severity === "suggestion").length;

  // Weight by severity with caps
  score -= Math.min(criticalCount * 5, 30);
  score -= Math.min(warningCount * 2, 20);
  score -= Math.min(suggestionCount * 0.5, 10);

  // Adjustments
  const orphanCount = findings.filter(
    (f) => f.message.includes("orphan") || f.message.includes("zero cross-references")
  ).length;
  if (totalComponents > 0 && orphanCount / totalComponents > 0.5) {
    score -= 5;
  }

  const missingSourceCount = findings.filter(
    (f) => f.message.includes("No source")
  ).length;
  if (totalComponents > 0 && missingSourceCount / totalComponents > 0.3) {
    score -= 5;
  }

  const collisionRisk = findings.filter(
    (f) => f.message.includes("collision")
  ).length;
  if (collisionRisk > 0) {
    score -= 10;
  }

  // Bonus: all cross-references bidirectional
  const oneWayCount = findings.filter(
    (f) => f.message.includes("One-way reference")
  ).length;
  if (totalReferences > 0 && oneWayCount === 0) {
    score += 2;
  }

  // Bonus: all components have sources
  if (missingSourceCount === 0 && totalComponents > 0) {
    score += 3;
  }

  // Bonus: no index issues
  const indexIssues = findings.filter(
    (f) => f.category === "index" && f.severity === "critical"
  ).length;
  if (indexIssues === 0) {
    score += 2;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

// ─────────────────────────────────────────────────────────────
// 15. Report Generation
// ─────────────────────────────────────────────────────────────

function generateReport(report: AuditReport): string {
  const findings = report.findings;

  // Group by severity
  const critical = findings.filter((f) => f.severity === "critical");
  const warnings = findings.filter((f) => f.severity === "warning");
  const suggestions = findings.filter((f) => f.severity === "suggestion");
  const infos = findings.filter((f) => f.severity === "info");

  let md = `# Substrate Maintenance Report\n\n`;
  md += `**Substrate**: ${report.substrateName}\n`;
  md += `**Date**: ${report.auditDate}\n`;
  md += `**Components**: ${report.totalComponents}\n`;
  md += `**Health Score**: ${report.healthScore}/100\n\n`;

  // Critical Issues
  md += `## 🔴 Critical Issues (${critical.length})\n\n`;
  if (critical.length === 0) {
    md += `*No critical issues found.*\n\n`;
  } else {
    for (const f of critical) {
      const comp = f.component ? ` (${f.component})` : "";
      md += `- [ ] ${f.message}${comp}\n`;
    }
    md += `\n`;
  }

  // Warnings
  md += `## 🟡 Warnings (${warnings.length})\n\n`;
  if (warnings.length === 0) {
    md += `*No warnings found.*\n\n`;
  } else {
    for (const f of warnings) {
      const comp = f.component ? ` (${f.component})` : "";
      md += `- [ ] ${f.message}${comp}\n`;
    }
    md += `\n`;
  }

  // Suggestions
  md += `## 🟢 Suggestions (${suggestions.length})\n\n`;
  if (suggestions.length === 0) {
    md += `*No suggestions found.*\n\n`;
  } else {
    for (const f of suggestions) {
      const comp = f.component ? ` (${f.component})` : "";
      md += `- [ ] ${f.message}${comp}\n`;
    }
    md += `\n`;
  }

  // Info
  md += `## ℹ️ Info (${infos.length})\n\n`;
  if (infos.length === 0) {
    md += `*No info items.*\n\n`;
  } else {
    for (const f of infos) {
      const comp = f.component ? ` (${f.component})` : "";
      md += `- [ ] ${f.message}${comp}\n`;
    }
    md += `\n`;
  }

  // Statistics
  const stats = report.statistics;
  const totalWithSources = report.totalComponents - stats.missingSources;
  const sourceCoverage = report.totalComponents > 0
    ? Math.round((totalWithSources / report.totalComponents) * 100)
    : 100;

  const confDist = stats.confidenceDistribution;
  const confStr = Object.entries(confDist)
    .map(([k, v]) => `${v} ${k}`)
    .join(", ");

  md += `## Statistics\n\n`;
  md += `| Metric | Value |\n|--------|-------|\n`;
  md += `| Total components | ${report.totalComponents} |\n`;

  // Components by type
  const typeBreakdown = Object.entries(report.componentsByType)
    .map(([t, c]) => `${t}: ${c}`)
    .join(", ");
  md += `| Components by type | ${typeBreakdown} |\n`;

  md += `| Cross-references | ${stats.totalCrossReferences} total, ${stats.brokenReferences} broken, ${stats.oneWayReferences} one-way |\n`;
  md += `| Orphans | ${stats.orphanComponents} |\n`;
  md += `| Confidence | ${confStr || "none"} |\n`;
  md += `| Source coverage | ${sourceCoverage}% |\n`;
  md += `| Thin summaries | ${stats.thinSummaries} |\n`;
  md += `| Thin details | ${stats.thinDetails} |\n`;
  md += `| Stale components | ${stats.staleComponents} |\n`;
  md += `| Index completeness | ${Math.round(stats.indexCompleteness)}% |\n`;
  md += `\n`;

  // Auto-Fixes Applied
  md += `## Auto-Fixes Applied: ${report.autoFixedCount}\n\n`;
  if (report.autoFixedCount === 0) {
    md += `*No auto-fixes were applied.*\n\n`;
  } else {
    const fixedFindings = findings.filter((f) => f.fixAvailable);
    for (const f of fixedFindings.slice(0, report.autoFixedCount)) {
      md += `- Fixed: ${f.fixDescription || f.message}\n`;
    }
    md += `\n`;
  }

  // Next Steps
  md += `## Next Steps\n\n`;
  md += `1. Review critical issues first\n`;
  md += `2. Address warnings within 7 days\n`;
  md += `3. Consider suggestions at next maintenance cycle\n`;
  md += `4. Re-run audit after fixes to confirm resolution\n`;

  return md;
}

function countByType(components: ParsedComponent[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const comp of components) {
    counts[comp.typeCode] = (counts[comp.typeCode] || 0) + 1;
  }
  return counts;
}

// ─────────────────────────────────────────────────────────────
// 16. Auto-Fix Mode
// ─────────────────────────────────────────────────────────────

async function applyAutoFixes(
  findings: AuditFinding[],
  substratePath: string,
  components: ParsedComponent[]
): Promise<number> {
  const fixable = findings.filter((f) => f.fixAvailable);
  if (fixable.length === 0) return 0;

  // Create backup directory
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.join(substratePath, ".maintain-backup", timestamp);
  fs.mkdirSync(backupDir, { recursive: true });

  let fixedCount = 0;

  for (const finding of fixable) {
    try {
      const result = await applySingleFix(finding, substratePath, components, backupDir);
      if (result) fixedCount++;
    } catch {
      // Skip failed fixes — don't crash
    }
  }

  return fixedCount;
}

async function applySingleFix(
  finding: AuditFinding,
  substratePath: string,
  components: ParsedComponent[],
  backupDir: string
): Promise<boolean> {
  const msg = finding.message;

  // Fix: Missing directory
  if (msg.startsWith("Missing directory:")) {
    const dirName = msg.replace("Missing directory: ", "");
    const dirPath = path.join(substratePath, "components", dirName);
    fs.mkdirSync(dirPath, { recursive: true });
    // Create empty INDEX.md
    const typeDef = Object.values(COMPONENT_TYPES).find((t) => t.dir === dirName);
    if (typeDef) {
      const indexPath = path.join(dirPath, "INDEX.md");
      fs.writeFileSync(indexPath, `# ${typeDef.label}s Index\n\n| ${typeDef.label} ID | ${typeDef.label} TITLE | SHORT and MEANINGFUL DESCRIPTION |\n|------------|---------------|----------------------------------|\n`);
    }
    return true;
  }

  // Fix: Missing INDEX.md
  if (msg.startsWith("Missing INDEX.md in")) {
    const dirName = msg.replace("Missing INDEX.md in ", "");
    const typeDef = Object.values(COMPONENT_TYPES).find((t) => t.dir === dirName);
    if (typeDef) {
      const dirPath = path.join(substratePath, "components", dirName);
      const indexPath = path.join(dirPath, "INDEX.md");
      fs.writeFileSync(indexPath, `# ${typeDef.label}s Index\n\n| ${typeDef.label} ID | ${typeDef.label} TITLE | SHORT and MEANINGFUL DESCRIPTION |\n|------------|---------------|----------------------------------|\n`);
    }
    return true;
  }

  // Fix: Missing root file
  if (msg.startsWith("Missing root file:")) {
    const fileName = msg.replace("Missing root file: ", "");
    const filePath = path.join(substratePath, fileName);
    const dir = path.dirname(filePath);
    fs.mkdirSync(dir, { recursive: true });

    if (fileName === "metadata/next-ids.json") {
      // Build next-ids from existing components
      const nextIds: Record<string, number> = {};
      for (const code of Object.keys(COMPONENT_TYPES)) {
        const maxId = getMaxIdForType(code, components);
        nextIds[code] = maxId + 1;
      }
      fs.writeFileSync(filePath, JSON.stringify(nextIds, null, 2) + "\n");
    } else if (fileName === "metadata/index.json") {
      const indexJson = {
        substrate: "unknown",
        created: new Date().toISOString().split("T")[0],
        last_updated: new Date().toISOString().split("T")[0],
        total_components: components.length,
        components: {} as Record<string, unknown>,
      };
      for (const comp of components) {
        indexJson.components[comp.code] = {
          code: comp.code,
          type: comp.type,
          title: comp.title,
          file: comp.filePath.replace(substratePath + "/", ""),
          status: comp.status,
        };
      }
      fs.writeFileSync(filePath, JSON.stringify(indexJson, null, 2) + "\n");
    } else if (fileName === "metadata/taxonomy.json") {
      fs.writeFileSync(filePath, "{}\n");
    } else if (fileName === "README.md") {
      fs.writeFileSync(filePath, "# Substrate\n\n*Auto-generated by maintainSubstrate*\n");
    } else if (fileName === "INDEX.md") {
      fs.writeFileSync(filePath, "# Substrate Index\n\n*Auto-generated by maintainSubstrate*\n");
    }
    return true;
  }

  // Fix: Missing connection file
  if (msg.startsWith("Missing connection file:")) {
    // Connection maps are regenerated at the end of main(), so this is handled
    return true;
  }

  // Fix: Missing entry in INDEX.md
  if (msg.includes("missing from INDEX.md")) {
    const codeMatch = msg.match(/([A-Z]{2}-\d+)/);
    if (codeMatch) {
      const code = codeMatch[1];
      const comp = components.find((c) => c.code === code);
      if (comp) {
        const typeDef = COMPONENT_TYPES[comp.typeCode];
        if (typeDef) {
          const indexPath = path.join(substratePath, "components", typeDef.dir, "INDEX.md");
          if (fs.existsSync(indexPath)) {
            const content = fs.readFileSync(indexPath, "utf-8");
            const newLine = `| ${comp.code} | ${comp.title} | ${comp.summary.slice(0, 80)}${comp.summary.length > 80 ? "..." : ""} |\n`;
            // Append before end of file
            fs.writeFileSync(indexPath, content + newLine);
          }
        }
      }
    }
    return true;
  }

  // Fix: next-ids collision
  if (msg.includes("next-ids.json counter") && msg.includes("collision")) {
    const nextIdsPath = path.join(substratePath, "metadata", "next-ids.json");
    if (fs.existsSync(nextIdsPath)) {
      // Backup first
      fs.copyFileSync(nextIdsPath, path.join(backupDir, "next-ids.json"));

      const content = fs.readFileSync(nextIdsPath, "utf-8");
      const nextIds = JSON.parse(content) as Record<string, number>;

      // Find the type code from the message
      const typeMatch = msg.match(/for ([A-Z]{2})/);
      if (typeMatch) {
        const typeCode = typeMatch[1];
        const maxId = getMaxIdForType(typeCode, components);
        nextIds[typeCode] = maxId + 1;
        fs.writeFileSync(nextIdsPath, JSON.stringify(nextIds, null, 2) + "\n");
      }
    }
    return true;
  }

  // Fix: Missing from index.json
  if (msg.includes("missing from index.json")) {
    const codeMatch = msg.match(/([A-Z]{2}-\d+)/);
    if (codeMatch) {
      const code = codeMatch[1];
      const comp = components.find((c) => c.code === code);
      if (comp) {
        const indexJsonPath = path.join(substratePath, "metadata", "index.json");
        if (fs.existsSync(indexJsonPath)) {
          // Backup first
          fs.copyFileSync(indexJsonPath, path.join(backupDir, "index.json"));

          const content = fs.readFileSync(indexJsonPath, "utf-8");
          const indexJson = JSON.parse(content) as { components?: Record<string, unknown> };
          if (!indexJson.components) indexJson.components = {};
          indexJson.components[comp.code] = {
            code: comp.code,
            type: comp.type,
            title: comp.title,
            file: comp.filePath.replace(substratePath + "/", ""),
            status: comp.status,
          };
          fs.writeFileSync(indexJsonPath, JSON.stringify(indexJson, null, 2) + "\n");
        }
      }
    }
    return true;
  }

  // Fix: Add source-needed tag
  if (msg.includes("Auto-tag") && msg.includes("source-needed")) {
    const comp = components.find((c) => c.code === finding.component);
    if (comp) {
      // Backup first
      const backupPath = path.join(backupDir, path.basename(comp.filePath));
      fs.copyFileSync(comp.filePath, backupPath);

      const content = fs.readFileSync(comp.filePath, "utf-8");
      // Add source-needed to tags in frontmatter
      const updated = content.replace(
        /^(tags:\s*\[.*?)(\])/m,
        (_, before, after) => {
          if (before.endsWith("[")) {
            return `tags: [source-needed]`;
          }
          return `${before}, source-needed${after}`;
        }
      );
      if (updated !== content) {
        fs.writeFileSync(comp.filePath, updated);
      }
    }
    return true;
  }

  // Fix: Malformed code reference — zero-pad to 5 digits
  if (msg.includes("Malformed code reference:")) {
    const comp = components.find((c) => c.code === finding.component);
    if (comp && comp.filePath) {
      // Extract the raw malformed ref and suggested fix from the message
      const rawMatch = msg.match(/Malformed code reference: (\[[A-Z]{2}-\d+\]|\b[A-Z]{2}-\d+\b)/);
      const suggestedMatch = msg.match(/like (\[[A-Z]{2}-\d{5}\]|\b[A-Z]{2}-\d{5}\b)/);
      if (rawMatch && suggestedMatch) {
        const raw = rawMatch[1];
        const suggested = suggestedMatch[1];
        // Backup first
        const backupPath = path.join(backupDir, path.basename(comp.filePath));
        fs.copyFileSync(comp.filePath, backupPath);

        const content = fs.readFileSync(comp.filePath, "utf-8");
        const updated = content.split("\n").map((line) => {
          if (line.includes(raw)) {
            return line.replaceAll(raw, suggested);
          }
          return line;
        }).join("\n");
        if (updated !== content) {
          fs.writeFileSync(comp.filePath, updated);
        }
      }
    }
    return true;
  }

  // Fix: One-way reference — add reciprocal reference
  if (msg.includes("One-way reference")) {
    // This is complex — requires parsing and modifying the target file
    // For now, log it but don't auto-fix (too risky without careful parsing)
    return false;
  }

  // Fix: Broken reference — remove the reference line
  if (msg.includes("Broken reference")) {
    const comp = components.find((c) => c.code === finding.component);
    if (comp) {
      const targetMatch = msg.match(/→ ([A-Z]{2}-\d+)/);
      if (targetMatch) {
        const targetCode = targetMatch[1];
        // Backup first
        const backupPath = path.join(backupDir, path.basename(comp.filePath));
        fs.copyFileSync(comp.filePath, backupPath);

        const content = fs.readFileSync(comp.filePath, "utf-8");
        // Remove lines containing the target code in Related section
        const lines = content.split("\n");
        const updatedLines = lines.filter(
          (line) => !line.includes(`[${targetCode}]`)
        );
        if (updatedLines.length !== lines.length) {
          fs.writeFileSync(comp.filePath, updatedLines.join("\n"));
        }
      }
    }
    return true;
  }

  return false;
}

// ─────────────────────────────────────────────────────────────
// 17. Main Execution Flow
// ─────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const startTime = Date.now();

  // 1. Parse CLI options
  const options = parseArgs(Bun.argv);

  // 2. Load configuration
  let config: SubstrateConfig;
  try {
    config = await loadConfig(options.configPath);
  } catch (err) {
    process.stderr.write(`Failed to load config from ${options.configPath}: ${err}\n`);
    process.exit(1);
  }

  const substrateName = options.substrate || config.default_substrate;
  const substratePath = path.join(config.base_path, `substrate-${substrateName}`);

  // 3. Validate substrate exists
  if (!fs.existsSync(substratePath)) {
    process.stderr.write(`Substrate not found: ${substratePath}\n`);
    process.exit(1);
  }

  if (!options.quiet) {
    process.stderr.write(`Auditing substrate: ${substrateName}\n`);
    process.stderr.write(`Path: ${substratePath}\n`);
  }

  // 4. Discover and parse all components
  if (!options.quiet) {
    process.stderr.write("Discovering components...\n");
  }
  const components = await discoverComponents(substratePath, options.typeFilter || undefined);

  if (!options.quiet) {
    process.stderr.write(`Found ${components.length} components\n`);
  }

  // 5. Build component index
  const componentIndex = new Map<string, ParsedComponent>();
  for (const comp of components) {
    componentIndex.set(comp.code, comp);
  }

  // 6. Run all audit checks
  const findings: AuditFinding[] = [];

  // 6a. Structural Integrity
  if (!options.quiet) process.stderr.write("Checking structural integrity...\n");
  findings.push(...await checkStructuralIntegrity(substratePath));

  // 6b. Component Audit
  if (!options.quiet) process.stderr.write("Auditing components...\n");
  findings.push(...await auditComponents(components, config.maintain as MaintainConfig & { verification?: Record<string, "strict" | "moderate" | "relaxed"> }));
  // Attach verification config
  (config.maintain as unknown as { verification?: Record<string, string> }).verification = config.verification;

  // 6c. Cross-Reference Audit
  if (!options.quiet) process.stderr.write("Auditing cross-references...\n");
  findings.push(...await auditCrossReferences(components, componentIndex, config.maintain));

  // 6d. Index Audit
  if (!options.quiet) process.stderr.write("Auditing indexes...\n");
  findings.push(...await auditIndexes(substratePath, components, options.typeFilter || undefined));

  // 6e. Quality Assessment
  if (!options.quiet) process.stderr.write("Assessing quality...\n");
  const { findings: qualityFindings, statistics } = await assessQuality(
    components,
    config.maintain as MaintainConfig & { verification?: Record<string, "strict" | "moderate" | "relaxed"> }
  );
  findings.push(...qualityFindings);

  // Calculate broken references from ALL findings (now that all audits are complete)
  statistics.brokenReferences = findings.filter(
    (f) => f.message.includes("Broken reference")
  ).length;

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
    if (!options.quiet) process.stderr.write("Applying auto-fixes...\n");
    // Re-run auditComponents with verification config for fix mode
    report.autoFixedCount = await applyAutoFixes(findings, substratePath, components);
    if (!options.quiet) process.stderr.write(`Applied ${report.autoFixedCount} auto-fixes\n`);
  }

  // 10. Regenerate connection maps
  if (!options.quiet) process.stderr.write("Regenerating connection maps...\n");
  await regenerateConnectionMaps(substratePath, components);

  // 11. Generate and output report
  const reportMarkdown = generateReport(report);

  // 11a. Write to file
  if (options.outputPath) {
    fs.writeFileSync(options.outputPath, reportMarkdown);
    if (!options.quiet) process.stderr.write(`Report written to: ${options.outputPath}\n`);
  } else {
    // Default: write to substrate directory
    const reportPath = path.join(
      substratePath,
      `maintenance-report-${new Date().toISOString().split("T")[0]}.md`
    );
    fs.writeFileSync(reportPath, reportMarkdown);
    if (!options.quiet) process.stderr.write(`Report written to: ${reportPath}\n`);
  }

  // 11b. Also print to stdout (unless --quiet)
  if (!options.quiet) {
    console.log(reportMarkdown);
  } else {
    // In quiet mode, still output the report to stdout
    console.log(reportMarkdown);
  }

  // 12. Exit with appropriate code
  const criticalCount = findings.filter((f) => f.severity === "critical").length;
  const elapsed = Date.now() - startTime;

  if (!options.quiet) {
    process.stderr.write(`\nAudit complete in ${elapsed}ms\n`);
    process.stderr.write(`Health Score: ${healthScore}/100\n`);
    process.stderr.write(`Critical: ${criticalCount}, Warnings: ${findings.filter((f) => f.severity === "warning").length}, Suggestions: ${findings.filter((f) => f.severity === "suggestion").length}\n`);
  }

  process.exit(criticalCount > 0 ? 1 : 0);
}

// Run
main().catch((err) => {
  process.stderr.write(`Fatal error: ${err}\n`);
  process.exit(2);
});
