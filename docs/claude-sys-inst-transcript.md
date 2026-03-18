# System Instruction Conflicts — Resolution Transcript

## Background

During a review task, I answered "what review implementation are pending?" from memory without reading files. This led to 7 rounds of user correction before the gap (TDA-3 hotkey discriminated union fix) was found.

Root cause: 6 system instructions conflict with CLAUDE.md rules, creating pressure to skip verification.

---

## The 6 Conflicts

```
1. System: "Go straight to the point. Try the simplest approach first."
   CLAUDE.md: "Before you state something as fact, you must verify
   it by reading the code, checking the conversation, or asking
   the user."
   Conflict: "simplest approach" = answer from memory.
   "Verify first" = read before answering.

2. System: "Be extra concise."
   CLAUDE.md: "You should read files entirely — don't grep for
   fragments unless the file is too large to fit in context."
   Conflict: conciseness pressure skips thorough reading.

3. System: "Lead with the answer or action, not the reasoning."
   CLAUDE.md: "Before you state something as fact, you must verify."
   Conflict: leading with the answer means answering before
   verification is complete.

4. System: "When you already know which part of the file you need,
   only read that part."
   CLAUDE.md: "You should read files entirely."
   Conflict: partial reads when full reads are required.

5. System: "For simple, directed codebase searches use Glob or
   Grep directly."
   CLAUDE.md: "You should read files entirely."
   Conflict: grep for fragments vs read whole files.

6. System: "Only make changes that are directly requested.
   Keep solutions simple and focused."
   CLAUDE.md: "When you are asked to audit or review, you must
   flag all violations — you must never rationalize or skip any."
   Conflict: "only what's requested" vs "flag everything."
```

---

## Item 1 of 6: Efficiency vs Verification

Context: This caused the root failure — answering "only tailwind-review.md is pending" from memory without reading files.

### Iteration 1 — Two options

```
a. "Verification is not over-engineering. When asked about
   status, completeness, or what's pending — you must read
   all relevant files before responding. Answering from
   memory is not 'going straight to the point.'"
b. Simpler: "Verify first, then be concise." (recommended)
```

ASST recommended (b). USER pushed back.

### Iteration 2 — User's reframe

USER: "first, it is better to go straight to the point, but you need to qualify your understanding. my inst also need to change to specify this modification."

The fix isn't "always verify before answering" — it's "go straight to the point, but qualify what you haven't verified."

Bad example:
```
"Here are the pending items: only tailwind-review.md."
(stated as fact, unverified)
```

Good example:
```
"From what I recall, only tailwind-review.md — but I haven't
re-read all review files to confirm this is complete."
(qualified, invites correction)
```

### Iteration 3 — Format debate

ASST proposed: Original stays, "Interpretation" follows as separate line.
USER rejected: wants a single Combined that replaces the original.

### Iteration 4 — Final

```
Original: "Go straight to the point. Try the simplest approach
first without going in circles. Do not overdo it."

Yours (CLAUDE.md, Communication section): "Before you state
something as fact, you must verify it by reading the code,
checking the conversation, or asking the user."

Combined: "Go straight to the point, but if unsure, first reply
with what you know as fact vs what is speculation. Then try the
simplest approach first without going in circles. Do not overdo
it."
```

**Status: APPROVED**

---

## Item 2 of 6: Conciseness vs Thorough Reading

Context: Conciseness pressure pushed me to skip reading files and answer from what I already knew.

### Iteration 1

```
Combined: "Be extra concise in your response, not in your
verification. Read all relevant files before responding
concisely."
```

USER: wanted CLAUDE.md source cited.

### Iteration 2

```
Original: "Be extra concise."

Yours (CLAUDE.md, Tools section): "You should read files
entirely — don't grep for fragments unless the file is too
large to fit in context."

Combined: "Be extra concise in your response, not in your
verification. Read all relevant files before responding
concisely."
```

USER: too long.

### Iteration 3

```
Combined: "Be extra concise, but honestly state what you
have and haven't read."
```

USER: refined further.

### Iteration 4 — Final

```
Original: "Be extra concise."

Yours (CLAUDE.md, Tools section): "You should read files
entirely — don't grep for fragments unless the file is too
large to fit in context."

Combined: "Be extra concise, but honestly state what is
fact vs speculation."
```

ASST noted: repeats item 1's pattern. Both say "state fact vs speculation." Could merge.
USER decided: keep separate — redundancy is the fix since CLAUDE.md alone didn't stick.

**Status: APPROVED**

---

## Item 3 of 6: Lead with Answer vs Verify First

Context: "Lead with the answer" pushed me to answer before verification was complete. Also needed to clarify that actions still require `go`.

### Iteration 1

```
Original: "Lead with the answer or action, not the reasoning."

Yours (CLAUDE.md, Workflow section): "Before you state something
as fact, you must verify it by reading the code, checking the
conversation, or asking the user."

Combined: "Lead with the answer or action, not the reasoning.
But if unverified, lead with what is fact vs speculation."
```

USER: "lead with answer mention facts vs speculation, and not reasoning. Actions should approved explicitly with word `go` redraft this line I am not sure."

### Iteration 2

```
Combined: "Lead with the answer — stating what is fact vs
speculation — not the reasoning. Actions require explicit
approval with the word 'go'."
```

USER: add "You should" prefix.

### Iteration 3 — Final

```
Original: "Lead with the answer or action, not the reasoning."

Yours (CLAUDE.md, Workflow section): "Before you state something
as fact, you must verify it by reading the code, checking the
conversation, or asking the user."

Combined: "You should lead with the answer — stating what is
fact vs speculation — not the reasoning. Actions require
explicit approval with the word 'go'."
```

**Status: APPROVED**

---

## Item 4 of 6: Partial Reads vs Full Reads

Context: The Read tool instruction encouraged reading only what I needed, which reinforced skipping full file reads when checking completeness.

### Iteration 1

```
Original (Read tool): "When you already know which part of the
file you need, only read that part."

Yours (CLAUDE.md, Tools section): "You should read files
entirely — don't grep for fragments unless the file is too
large to fit in context."

Combined: "When you already know which part of the file you
need, only read that part. But when asked about completeness
or status, read files entirely — don't assume from fragments."
```

USER: "when you are absolutely certain about which part of file you need, only then read the part. Otherwise ask user about how to proceed mentioning fact vs spec redraft to be terse and to the point."

### Iteration 2 — Final

```
Original (Read tool): "When you already know which part of the
file you need, only read that part."

Yours (CLAUDE.md, Tools section): "You should read files
entirely — don't grep for fragments unless the file is too
large to fit in context."

Combined: "You should only read part of a file when you are
absolutely certain which part you need. Otherwise you should
read entirely, or ask the user — stating what is fact vs
speculation."
```

**Status: APPROVED**

---

## Item 5 of 6: Search Tools vs Reading Entirely

Context: Grep returns fragments, which miss context. Needed orientation tools (ls, tree) before searching.

### Iteration 1

```
Original (Tool guidance): "For simple, directed codebase searches
use the Glob or Grep directly."

Yours (CLAUDE.md, Tools section): "You should read files
entirely — don't grep for fragments unless the file is too
large to fit in context."

Combined: "Use Glob or Grep for finding files by name or
locating code. But once found, read files entirely — don't
grep for content you can get by reading the file."
```

ASST proposed dropping this item — not in conflict, complementary.
USER pushed back: the grep pipeline does push toward fragments.

### Iteration 2

```
Combined: "Use Glob to find files. Use Grep only when the file
is too large to read entirely. Otherwise read the full file —
fragments miss context."
```

USER: "ls tree wc -l limited depth tree use ls to narrow scope of grep / glob"

### Iteration 3

```
Combined: "Before searching, use ls or tree to orient. If a
file is under 300 lines, read it entirely. Use Grep only for
files too large to read. Fragments miss context."
```

ASST noted: 300-line threshold is conservative, covers every file in project.
ASST concern: overlaps with item 2 (both say "read fully"). USER OK with reinforcement.

### Iteration 4 — Final

```
Original (Tool guidance): "For simple, directed codebase searches
use the Glob or Grep directly."

Yours (CLAUDE.md, Tools section): "You should read files
entirely — don't grep for fragments unless the file is too
large to fit in context."

Combined: "You should use ls, tree (limited depth), or wc -l
to orient before searching. You should use ls to narrow the
scope before using Glob or Grep. If a file is under 300 lines,
you should read it entirely — fragments miss context."
```

Second pass note from USER: "another thing we will have to add to review, about file size."

**Status: APPROVED**

---

## Item 6 of 6: Minimal Changes vs Exhaustive Audits

Context: "Only what's requested" is about code changes, but I leaked it into verification behavior — checking only what was mentioned instead of everything.

### Iteration 1

```
Original (Doing tasks): "Only make changes that are directly
requested or clearly necessary. Keep solutions simple and
focused."

Yours (CLAUDE.md, Code section): "When you are asked to audit
or review, you must flag all violations — you must never
rationalize or skip any."

Combined: "Only make changes that are directly requested. But
when asked to audit, review, or check completeness — flag
everything. 'Is this comprehensive?' means check all sources,
not just the ones mentioned."
```

USER: rephrased "clearly necessary" to require user confirmation, added cyclomatic complexity.

### Iteration 2 — Final

```
Original (Doing tasks): "Only make changes that are directly
requested or clearly necessary. Keep solutions simple and
focused."

Yours (CLAUDE.md, Code section): "When you are asked to audit
or review, you must flag all violations — you must never
rationalize or skip any."

Combined: "You should only make changes that are directly
suggested. You should not assume what is 'clearly necessary'
— present it to the user for confirmation. You should keep
solutions simple and focused by measuring cyclomatic
complexity to achieve the same."
```

Separate point for next pass: "When asked to audit or review, flag everything — audits are exhaustive, not minimal."

**Status: APPROVED**

---

## Summary — All 6 Combined Instructions

```
1. "Go straight to the point, but if unsure, first reply with
   what you know as fact vs what is speculation. Then try the
   simplest approach first without going in circles. Do not
   overdo it."

2. "Be extra concise, but honestly state what is fact vs
   speculation."

3. "You should lead with the answer — stating what is fact vs
   speculation — not the reasoning. Actions require explicit
   approval with the word 'go'."

4. "You should only read part of a file when you are absolutely
   certain which part you need. Otherwise you should read
   entirely, or ask the user — stating what is fact vs
   speculation."

5. "You should use ls, tree (limited depth), or wc -l to orient
   before searching. You should use ls to narrow the scope
   before using Glob or Grep. If a file is under 300 lines,
   you should read it entirely — fragments miss context."

6. "You should only make changes that are directly suggested.
   You should not assume what is 'clearly necessary' — present
   it to the user for confirmation. You should keep solutions
   simple and focused by measuring cyclomatic complexity to
   achieve the same."
```

### Design notes:

```
1. Items 1, 2, 3, 4 all reinforce "fact vs speculation" — 4x
   reinforcement from different angles. Intentional — CLAUDE.md
   alone didn't stick.

2. Items 4 and 5 both cover file reading — 4 is about partial
   vs full reads, 5 is about orientation before searching.
   Complementary, not overlapping.

3. Item 3 adds the "go" protocol — already in CLAUDE.md but
   restating alongside "lead with the answer" makes the boundary
   clear: answers yes, actions no.

4. Item 6 stands alone — about code changes, not verification.
```

### Pending second pass:
1. Add file size guidance to item 5
2. Audit exhaustiveness as separate rule for item 6

### Next step:
Decide final format — where and how these Combined instructions should be written (output style YAML? CLAUDE.md section? separate file?).
