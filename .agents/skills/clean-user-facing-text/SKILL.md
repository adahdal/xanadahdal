---
name: clean-user-facing-text
description: Clean user-facing text to remove AI-generated patterns, robotic phrasing, and unnatural language. Use this skill whenever the user wants to humanize copy, remove AI tells, rewrite website text that sounds generated, strip filler phrases, fix em-dash overuse, or make marketing/product text feel more natural and authentic. Triggers on: "clean up this text", "make this sound less AI", "humanize this copy", "remove AI patterns", "this sounds too robotic", "rewrite to sound human", "fix the AI writing", "make this more natural", "this reads like ChatGPT wrote it", "clean user-facing text", "remove filler phrases", "fix the em dashes".
---

# Clean User-Facing Text

This skill removes detectable AI-writing patterns and replaces them with natural, human-sounding prose. It is especially useful for website copy, product descriptions, marketing emails, and any text a real person will read.

## Common AI tells to remove

### Structural patterns
- **Excessive em-dashes** (`—`): AI overuses these to connect clauses. Replace with a period, comma, or rewrite the sentence.
- **Colon-then-list openers**: "There are three things to consider: first…" → restructure as flowing prose or a genuine list.
- **"Delve into"**, "dive into", "explore", "unpack" — replace with direct verbs: "covers", "explains", "shows", "walks through".
- **"It's worth noting that…"**, "It's important to mention…" — delete the preamble; just say the thing.
- **"In today's [adjective] world/landscape"** — delete the entire opener.
- **"At the end of the day"**, "all in all", "in conclusion" — cut or replace with the actual point.

### Vocabulary patterns
- **"Utilize"** → use
- **"Leverage"** (as a verb) → use, apply, draw on
- **"Facilitate"** → help, enable, make easier
- **"Ensure"** (overused) → make sure, check, confirm — or restructure
- **"Comprehensive"**, "robust", "cutting-edge", "state-of-the-art" — these are almost always empty; delete or replace with specifics
- **"Seamlessly"** → remove or describe what actually happens
- **"Innovative"**, "revolutionary", "game-changing" — remove unless you can back it up
- **"Tailored"**, "bespoke" (when generic) → remove or be specific about what's customized

### Tone patterns
- Overly formal register in contexts that call for warmth (wellness, personal services, community)
- Passive voice stacking: "It has been designed to be used by…" → "Built for…"
- Hedging chains: "may potentially be able to help" → "can help"
- Fake enthusiasm: "Exciting news!", "We're thrilled to announce" for routine updates → just announce it

## Process

1. **Read the full text first.** Note the intended audience, tone, and medium (homepage, email, product page).
2. **Identify the AI patterns** present — not every pattern applies to every text.
3. **Rewrite, don't just find-and-replace.** The goal is natural prose, not a checklist. Sometimes the right fix is restructuring the sentence entirely.
4. **Preserve the author's voice** where it exists. If the text has genuine personality, protect it.
5. **Show changes clearly.** Present the revised text and briefly note the main patterns that were cleaned.

## What NOT to change

- Terminology the brand or domain requires (technical terms, product names, legal language)
- Intentional style choices the user confirmed they want to keep
- Short, already-clean sentences — don't rewrite for the sake of it

## Output format

Present the cleaned text in full, then add a short note:

```
**Cleaned:**
[full revised text]

**Main changes:** removed [X], replaced [Y] with [Z], restructured [sentence].
```

For long documents, clean section by section and summarize changes at the end.

## Reference

See `references/phrase-replacements.md` for a lookup table of common AI phrases and their human alternatives.
