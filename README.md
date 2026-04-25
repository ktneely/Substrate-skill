
# Substrate Skill for LLM Agents

## About

The Substrate Skill implements the ability to add, process, read, retrieve, analyze information into and from the substrate framework and is intended to be used with PAI, the [personal AI assistant](https://github.com/danielmiessler/Personal_AI_Infrastructure).  It is a single skill with 12 unique workflows and one tool to maintain the dataset.  The resultant dataset can be stored inside your PAI directory structure or in directories external to your PAI setup.


This was developed using [PAI-Opencode](https://github.com/Steffen025/pai-opencode), a port of the original PAI over to the OpenCode harness in conjunction with open-weight models, specifcally, Qwen3.6, Kimi-2.5, and Minimax-m2.7, parts running on local hardware, and others running on OpenCode's Go inference platform.

See my blog post about implementing this, as well as the embedded Substrate introduction video if you are not familiar with it.  For detailed information about this implemenation, look no further than the [SKILL.md](Substrate/SKILL.md) file, and the various capabilities in the [workflows](Workflows/) subdirectory.

## Installation

Basically, we just need to get the files in this repository into two different locations.  This Readme and the Examples are not needed, so you can clone this to a temporary directory, fork it, or just download the zip and move manually from your archive (or ask your agent to do it based on these instructions and it'll probably figure it out, but I recommend to have set $PAI_DIR to your `~/.opencode` or wherever you have it).

### Skill

In a PAI setup with heirarchical skills, move the entire Substrate directory under a relevant category.  In my setup, this is located at `$PAI_DIR/skills/Knowledge/Substrate`

Update your skill index with:

```sh
cd `$PAI_DIR/PAI/Tools`
bun run GenerateSkillIndex.ts
```


### Maintenance tool

#### Install the script

Simplky move `maintainSubstrate.ts` from the `Tools/` directory in the repo to your `$PAI_DIR/PAI/Tools` directory.

#### Running the Maintenance Tool

This Substrate skill uses a bun script to perform some Maintenance and create an index map of all the files so this is performed consistently over time, and that it can be fully rebuilt without dumping every single file (or, "component") should it get messed up somehow.

This tool is `maintainSubstrate.ts` and information regarding it is in the [Maintenance spec](Substrate/Tools/maintainSubstrate-spec.md) file.  

To update the links and run the Maintenance, simply provide your substrate as the argument, without the `substrate-` prefix.

**Example:**
`bun run maintainSubstrate.ts --substrate global`  from `$PAI_DIR/PAI/Tools` or reference it explicity. 


### Configuration

Open up `$PAI_DIR/PAI/skills/<parent>/Substrate/config.yaml` in a text editor, review, and update with your preferences.


## Example

In this repository is a simple [example](Example/substrate-global) of the very beginnings of getting data into Substrate.  Two articles were run against the "DocumentIngest" workflow and the Maintenance script was run afterwards to create the linkage. 

The articles used were:
- https://www.texasmonthly.com/news-politics/san-antonio-trailer-deaths-migrant-smuggling/
- https://wbrassociation.org.uk/why-changing-our-environment-is-so-hard/

## Future workflow

Todo list of things I'd like to add in the future

**Definitely**

- [ ] Create some usage workflows (currently everyhing is about data ingest and organization. I want some canned uses, rather than only extemporaneous ones)
- [ ] Create a map in Mermaid of the current contents
- [ ] Specify a specific component and create a Mermaid graph of just that.


**Just an idea**

- [ ] Create an Obsidian Vault from the contents (enabling a graph view through its native capability
