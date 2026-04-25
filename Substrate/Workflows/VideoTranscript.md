# Workflow: VideoTranscript

> Extract Substrate components from video or audio content by transcription and analysis.

## Trigger

- User says: "transcribe this video", "extract from this podcast", "process this audio"
- User provides a video/audio URL or file path
- User references YouTube links, podcast episodes, or other media

## Input

- **URL or file path**: Video/audio source (YouTube, podcast, MP3, MP4, etc.)
- **Substrate name**: Target substrate (default: `config.default_substrate`)
- **Optional**: Component type filter, timestamp granularity, language

## Process

### Step 0: Deduplication Check (Batch)

**Before creating any components from video/audio content**, run the DedupCheck workflow (`Workflows/DedupCheck.md`) in batch mode against all proposed components.

1. **URL dedup check**: If the source is a URL (YouTube, podcast), search existing Data-Source (DS) and Event (EV) components for the same URL. If the media has already been processed:
   - **Skip**: Do not re-extract (default recommendation)
   - **Update**: Re-extract and merge any new information
   - **Force**: Create new components anyway (requires `force_create: true`)

2. **Internal batch dedup**: After Step 3 (Extract Components per Segment) produces the list of proposed components, run dedup across the proposed set itself. Video content often produces overlapping components across segments (e.g., the same Claim repeated in multiple segments). Merge these within the batch.

3. **External dedup**: For each remaining proposed component, check against the substrate INDEX.md for that component type.

4. **Evaluate each match result**:
   - **URL already processed** → Notify user, offer update or skip
   - **Certain/High match** → Merge: Add media source to existing component, enrich content, skip creation
   - **Medium match** → Prompt user for decision
   - **Low match** → Create with log
   - **No match** → Proceed to Step 1: Normal creation flow

5. **After dedup**: The batch now contains only truly new components plus enrichment actions. Proceed to Step 1 (Transcribe).

This step runs on **every** video/audio ingestion. It is mandatory and cannot be skipped unless the user explicitly forces creation.

### Step 1: Transcribe

1. Use Podcast skill or Parser skill to transcribe the audio:
   - **YouTube URL**: Use Podcast skill for transcript extraction
   - **Podcast URL**: Use Podcast skill for transcription
   - **Local audio file**: Use AudioEditor skill for transcription
   - **Video file**: Extract audio, then transcribe
2. Preserve timestamps for temporal reference
3. Record metadata: title, channel/creator, date, duration, URL
4. Save raw transcript for reference

### Step 2: Segment by Topic

1. Divide the transcript into topically coherent segments
2. Each segment represents a topic or subtopic discussed
3. Tag each segment with approximate timestamps
4. Identify where topics shift, merge, or return

### Step 3: Extract Components per Segment

For each segment:

1. **Apply Fabric `extract_wisdom` pattern** to identify key insights
2. **Classify knowledge items** by component type
3. **Extract claims and assertions** — these become Claims (CL) or Facts (FA)
4. **Extract arguments and reasoning** — these become Arguments (AR)
5. **Identify people and organizations mentioned** — PE, OR components
6. **Capture ideas and proposals** — ID, SO components
7. **Note problems discussed** — PR components
8. **Record sources cited** — DS components
9. **Capture frames and mental models mentioned** — FR, MO components

### Step 4: Create Temporal Context

1. Create an **Event** (EV) component for the video/audio itself:
   ```markdown
   ---
   code: EV-NNNNNNN-{slug}
   type: Event
   title: "Discussion: {title}"
   ...
   ---
   
   ## Summary
   {Creator} discussed {topic} in a {duration} video/podcast.
   
   ## Key Topics
   - [00:00-05:30] Introduction and context
   - [05:30-12:00] First major topic
   - ...
   
   ## Participants
   - PE-NNNNN: {Speaker name}
   ```
2. Link all extracted components to this Event

### Step 5: Add Timestamp References

Each extracted component includes a `timestamps` field in the frontmatter:

```yaml
timestamps:
  - start: "05:30"
    end: "12:00"
    context: "Discussion of {topic} at this timestamp"
```

This enables users to navigate back to the source.

### Step 6: Create Components

1. Generate proper codes and slugs for all extracted items
2. Create component files using standard template
3. Set confidence levels:
   - Direct statements by domain experts → high
   - General discussion → medium
   - Off-hand remarks, jokes → low
4. Add source attribution including URL and timestamp
5. Create cross-references between extracted components
6. Create cross-references to existing substrate components

### Step 7: Update Indexes

1. Update all INDEX.md files (add table rows for new components)
2. Update metadata/index.json and next-ids.json
3. Update connections/graph.md and connection maps

### Step 8: Report

Provide the user with:
- **Source processed**: Title, creator, duration
- **Transcript quality**: Confidence in transcription accuracy
- **Components extracted**: Count by type
- **Temporal coverage**: Timestamp ranges for key topics
- **Connections**: Internal and external
- **Event component**: EV code for the media item

## Output

Multiple component files with an Event component for the media, timestamp references, cross-references, and updated indexes.

## Example

**Input**: `https://www.youtube.com/watch?v=abc123` (Daniel Miessler discussing Substrate)

**Process**:
1. Transcribe 45-minute video
2. Segment into 8 topical segments
3. Extract: 5 Problems, 3 Solutions, 4 Claims, 6 Arguments, 2 People, 1 Organization, 3 Ideas, 2 Models, 1 Frame
4. Create EV-003-substrate-intro-miessler.md
5. Add timestamps to all components
6. Create 27 component files
7. Create cross-references (34 internal, 15 external)

**Report**:
```
Video Transcript Complete: Substrate Introduction — Daniel Miessler
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Duration:      45:32
Transcript:    High confidence (clear audio, single speaker)
Components:    27 extracted (+ 1 Event)
  Problems: 5 | Solutions: 3 | Claims:    4
  Arguments: 6 | Ideas:    3 | Models:    2
  People:   2 | Orgs:     1 | Frames:    1

Timestamps:   All components have source timestamps
Event:         EV-003-substrate-intro-miessler
Connections:  49 total (34 internal, 15 external)
```

## Edge Cases

- **Low-quality audio**: Note lower transcription confidence, suggest manual review
- **Multiple speakers**: Distinguish speakers, create separate PE components for each
- **Foreign language**: Attempt transcription, note language, suggest translation
- **Long videos (>2 hours)**: Process in chapters, maintain coherence
- **Duplicate with existing transcript**: Handled by DedupCheck (Step 0) — search DS/EV components for existing URL, offer to update or skip