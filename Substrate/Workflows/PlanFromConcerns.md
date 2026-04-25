# Workflow: PlanFromConcerns

> Create a draft Plan from a set of user-specified Problems (or other concerns) within a substrate.

## Trigger

- User says: "create a plan to address PR-00003, PR-00218, and PR-02004"
- User says: "I'm concerned about these problems — draft a plan"
- User lists multiple Problems and asks for a unified approach
- User references a theme and asks for strategic planning

## Input

- **Problem codes**: One or more existing Problem component codes (e.g., `PR-00003`, `PR-00218`, `PR-02004`)
- **Optional**: Substrate name (defaults to `config.default_substrate`)
- **Optional**: Plan title or theme override
- **Optional**: Author name, deadline constraints, resource constraints

## Process

### Step 1: Resolve Problem References

For each Problem code provided:

1. Locate the component file in `components/problems/`
2. Read the full component (frontmatter + content)
3. Extract: title, summary, details, existing cross-references, evidence
4. If a code doesn't exist, report the error and skip

### Step 2: Traverse the Connection Graph

For each resolved Problem, follow its cross-references to gather context:

1. **Solutions (SO)**: What solutions already exist for this Problem? Collect them.
2. **Arguments (AR)**: What arguments support or contradict the Problem definition?
3. **Claims (CL)**: What claims are made about this Problem?
4. **Facts (FA)**: What verified facts support the Problem?
5. **People/Organizations (PE/OR)**: Who is involved or affected?
6. **Laws/Values (LA/VA)**: What constraints apply?
7. **Related Problems**: Are there other Problems connected to these? Flag them.

Build a **context map** — a unified view of everything connected to the user's concerns.

### Step 3: Identify Patterns and Themes

Analyze the context map to find:

1. **Common root causes**: Do multiple Problems share a single underlying cause?
2. **Overlapping solutions**: Do existing Solutions address multiple Problems?
3. **Gaps**: Are there Problems with no Solutions? These need new Strategies.
4. **Conflicts**: Do any Solutions contradict each other?
5. **Leverage points**: Which single intervention would address the most Problems?

### Step 4: Draft the Mission Statement

Synthesize a unifying Mission from the Problems and their context:

1. What is the common thread across all Problems?
2. What would "solved" look like for all of them simultaneously?
3. Draft a concise Mission statement (1-2 sentences) that captures the unifying purpose

### Step 5: Draft the Challenges Section

Populate the Challenges section from the resolved Problems:

```markdown
## Challenges

1. **[PR-00003]** — {Problem title}: {one-line summary}
2. **[PR-00218]** — {Problem title}: {one-line summary}
3. **[PR-02004]** — {Problem title}: {one-line summary}
```

### Step 6: Draft Strategies

For each Problem (or group of related Problems):

1. **If existing Solutions exist**: Adapt them into Strategy entries, noting how they address the Problems
2. **If no Solutions exist**: Draft new Strategies based on the Problem details, evidence, and context
3. **For each Strategy**:
   - Give it a descriptive name
   - Write a detailed description of the approach
   - List which Problems it addresses
   - Reference any related components (SO, PL, PJ, PE, OR)
   - Note trade-offs or risks

### Step 7: Draft the Ideal World Section

Based on the Problems and Strategies, describe what success looks like:

1. For each Problem, what does "solved" look like?
2. What is the combined vision if all Problems are solved?
3. Write 3-5 Ideal World statements that capture the end state

### Step 8: Draft OKRs (Success Criteria)

**This is the critical addition.** For each Strategy, derive measurable Objectives and Key Results:

1. **Objective**: A qualitative statement of what the Strategy aims to achieve
   - Derived from the Strategy's purpose and the Problems it addresses
2. **Key Results**: 2-4 measurable outcomes per Objective
   - Each KR has: Measurement, Baseline, Target, Deadline, Status
   - Baseline: Current state (extracted from Problem details or Facts)
   - Target: Desired state (derived from Ideal World statements)
   - Measurement: The metric that tracks progress (must be quantifiable)
   - Deadline: Suggested timeline (can be adjusted by user)

**OKR derivation rules**:
- Every Strategy must have at least one Objective
- Every Objective must have at least 2 Key Results
- Key Results must be numeric or binary (yes/no) — never vague
- If baseline data is unavailable, mark as `[baseline: TBD]` and flag for user review
- If a KR cannot be measured, it is not a valid KR — rewrite it

### Step 9: Draft Beliefs/Models (Optional)

If the context map reveals strong Models (MO) or Frames (FR) connected to the Problems:

1. Reference them in the Beliefs/Models section
2. Explain how they shape the plan's approach

### Step 10: Assemble the Draft Plan

Using `Templates/PlanTemplate.md`, create a complete draft Plan:

1. Assign code: `PL-NNNNN-{slug}`
2. Set status: `draft`
3. Populate all sections from Steps 4-9
4. Set cross-references to all Problems, Solutions, and related components
5. Save to `components/plans/`

### Step 11: Present for Review

Present the draft Plan to the user with:

1. **Summary**: "Draft Plan created: PL-NNNNN — {title}"
2. **Structure overview**: Sections populated, OKR count, Problem count
3. **Confidence notes**: Flag any sections where data was incomplete:
   - `[TBD]` baselines in OKRs
   - Missing Solutions for some Problems
   - Unclear measurements
4. **Edit prompt**: "Review the draft and let me know what to change. You can:
   - Edit any section directly
   - Add or remove Strategies
   - Adjust OKR targets or deadlines
   - Add new Problems to address
   - Change the Mission statement
   - Mark the plan as `proposed` when ready"

### Step 12: Iterate on Edits

When the user provides edits:

1. Apply changes to the Plan file
2. Update cross-references if new components are added
3. Re-validate OKRs (ensure all are measurable)
4. Re-present the updated draft
5. Repeat until the user is satisfied

## Output

A draft Plan component file in `components/plans/` with:
- All sections from the Plan template populated
- OKRs with measurable Key Results
- Cross-references to all source Problems and related components
- Status: `draft` (ready for user review and iteration)

## Example

**Input**:
```
"I am concerned about PR-00003, PR-00218, and PR-02004 in the acme-corp substrate. Create a plan to address these problems."
```

**Process**:
1. Resolves: PR-00003 (employee turnover), PR-00218 (technical debt), PR-02004 (customer churn)
2. Traverses graph: finds SO-0045 (mentorship program) addresses PR-00003, SO-0112 (refactoring initiative) partially addresses PR-00218, no Solutions for PR-02004
3. Identifies pattern: technical debt → poor developer experience → turnover → product quality decline → customer churn (causal chain)
4. Drafts Mission: "Break the cycle of technical debt and turnover to restore product quality and customer trust at Acme Corp."
5. Drafts 3 Strategies: (a) Technical debt reduction program, (b) Developer experience improvement, (c) Customer feedback loop
6. Drafts OKRs:
   - Objective 1: Reduce critical technical debt by 60% in 6 months
     - KR1.1: Critical bugs open → from 47 to <20 by 2026-10-01
     - KR1.2: Code coverage → from 34% to >70% by 2026-10-01
   - Objective 2: Reduce employee turnover by 40% in 12 months
     - KR2.1: Annual turnover rate → from 28% to <17% by 2027-04-01
     - KR2.2: Employee satisfaction score → from 5.2 to >7.5 by 2027-04-01
   - Objective 3: Reduce customer churn by 30% in 9 months
     - KR3.1: Monthly churn rate → from 4.1% to <2.9% by 2027-01-01
     - KR3.2: NPS score → from 32 to >50 by 2027-01-01
7. Presents draft for review

**Output**:
```
Draft Plan created: PL-00012-break-the-debt-turnover-cycle
Status: draft
Sections: Purpose, Scope, Challenges (3), Mission (1), Strategies (3), Ideal World (4), OKRs (3 Objectives, 6 Key Results)
Flags: [TBD] baseline for KR2.2 (no employee satisfaction data found)
Location: ~/substrates/substrate-acme-corp/components/plans/
```

## Edge Cases

- **Single Problem**: Still creates a full Plan — even one Problem deserves a structured approach with OKRs
- **No existing Problems**: If user describes concerns without codes, create the Problems first, then the Plan
- **Conflicting Problems**: If Problems contradict each other (e.g., one says "move fast" and another says "slow down"), flag the conflict in the Challenges section and ask the user to prioritize
- **Cross-substrate Problems**: If Problems span multiple substrates, create the Plan in the primary substrate and add cross-substrate references
- **Existing Plan covers these Problems**: Detect overlap, suggest updating the existing Plan instead of creating a new one
