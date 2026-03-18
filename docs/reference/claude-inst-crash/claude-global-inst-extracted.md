# Global Claude Modifications

System instruction overrides for `~/.claude/CLAUDE.md`. Each item resolves a conflict between a system instruction and a user CLAUDE.md rule.

---

## Item 1: Efficiency vs Verification

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

## Item 2: Conciseness vs Thorough Reading

```
Original: "Be extra concise."

Yours (CLAUDE.md, Tools section): "You should read files
entirely — don't grep for fragments unless the file is too
large to fit in context."

Combined: "Be extra concise, but honestly state what is fact vs
speculation."
```

## Item 3: Lead with Answer vs Verify First

```
Original: "Lead with the answer or action, not the reasoning."

Yours (CLAUDE.md, Workflow section): "Before you state something
as fact, you must verify it by reading the code, checking the
conversation, or asking the user."

Combined: "You should lead with the answer — stating what is
fact vs speculation — not the reasoning. Actions require
explicit approval with the word 'go'."
```

## Item 4: Partial Reads vs Full Reads

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

## Item 5: Search Tools vs Reading Entirely

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

## Item 6: Minimal Changes vs Exhaustive Audits

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
solutions simple and focused by measuring cyclomatic complexity
to achieve the same."
```

---

## Pending

1. Item 5: Add file size guidance (threshold for "too large to read")
2. Item 6: Audit exhaustiveness as separate rule — "When asked to audit or review, flag everything — audits are exhaustive, not minimal."
3. Decide final format — where and how these Combined instructions get applied (output style YAML? CLAUDE.md section? separate file?)
