---
name: amend-plan
description: >-
  Use this skill whenever the user proposes any change to the Paladeium plan —
  a new feature, a removed feature, a tech stack swap, a priority change, a
  scope reduction, or a design update. Guides the agent through the full amendment
  protocol: understand -> log AMD entry -> update source docs -> confirm.
trigger: model_decision
---

# Paladeium — Plan Amendment Skill

Activate this skill when the user says things like:
- "change X to Y"
- "actually, let's use Z instead"
- "add a feature for..."
- "remove / drop / skip..."
- "I changed my mind about..."
- "new requirement: ..."
- "update the plan to..."
- "the client wants..."

---

## Step 1 — Parse the Change

Before doing anything, confirm your understanding:

> "Got it. You want to [summary of change]. Let me log this as an amendment and update the docs. Should I proceed?"

If the change is ambiguous (e.g., "make the map better"), ask ONE clarifying question:
> "What specific aspect of the map should change — the visual style, the data shown, or the interaction model?"

Do NOT ask multiple questions at once.

---

## Step 2 — Determine the AMD Number

Read the LAST amendment in `/docs/AMENDMENTS.md` to find the current highest AMD number.
Increment by 1. If the file is empty or only has AMD-001 (baseline), the next is AMD-002.

---

## Step 3 — Write the Amendment Entry

Append to `/docs/AMENDMENTS.md` BELOW the line that says:
`<!-- NEW AMENDMENTS GO BELOW THIS LINE — DO NOT EDIT ABOVE -->`

Use this exact format:

```
## AMD-[NNN] — [Short descriptive title, max 8 words]
**Date:** [current date YYYY-MM-DD HH:MM IST]
**Requested by:** Team
**Status:** ACTIVE

### What Changed
[2-4 sentences describing the change clearly. Be specific — mention module names, field names, tech names.]

### Overrides
- [filename]:[Section Name] — "[brief description of old state]" -> "[brief description of new state]"
[List every doc section this amendment changes. If it adds something new, write "NEW ADDITION"]

### Rationale
[1-2 sentences on why this change is being made — user preference, new requirement, technical constraint, etc.]

### Impact
- Modules affected: [comma-separated list from PRD.md module names]
- Files to update: [list of /docs/*.md files that need updating]
- Breaking changes: [Yes / No] — [brief explanation if yes]
```

---

## Step 4 — Update Source Documents

After writing the amendment, update the affected section in the source doc(s).

**Rules for updating source docs:**
- Do NOT rewrite entire sections — make surgical edits to the changed parts only
- Add a comment `<!-- Updated by AMD-NNN -->` at the top of the changed section
- If a tech stack entry changes in IMPLEMENTATION_GUIDE.md, update the locked table in AGENTS.md too

**Common update patterns:**

| Change Type | Files to Update |
|---|---|
| New feature added | PRD.md (add module section), PROBLEM_VALIDATION.md (add problem entry if needed) |
| Feature removed | PRD.md (strike or remove section), AGENTS.md (update priority list if affected) |
| Tech stack swap | IMPLEMENTATION_GUIDE.md (Part 2), AGENTS.md (Section 4 locked table) |
| Priority change | AGENTS.md (Section 8 priority list) |
| Design change | IMPLEMENTATION_GUIDE.md (Part 2 design system), AGENTS.md (Section 6) |
| DB schema change | IMPLEMENTATION_GUIDE.md (Part 4) |

---

## Step 5 — Confirm Completion

Reply to the user with:

>  **Amendment AMD-[NNN] logged.**
> 
> **What changed:** [one-liner summary]
> **Docs updated:** [list of files touched]
> **Next step:** [what the team should do next, e.g., "implement the new SquadUp filter UI"]

---

## Important Rules

1. **Never modify AMD-001** — it is the baseline and must remain unchanged
2. **Never delete an amendment** — if something is reversed, add a new AMD with Status: REVERTED
3. **If two amendments conflict**, the higher-numbered one wins (most recent = authoritative)
4. **Amendments are additive** — they describe deltas, not full rewrites
5. **All four core differentiators are protected** — SquadUp, EduRev Connect, LostPulse, and GTA5 fog-of-war cannot be removed without explicit "I want to remove [feature]" from the user. If a change would inadvertently kill one, warn the user first.
