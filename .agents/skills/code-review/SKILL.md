---
name: code-review
description: "Review changes since a fixed point along two independent axes: Standards (repo rules and code quality) and Spec (the originating task/spec). Report them side by side. Use when the user asks to review a branch, PR, work-in-progress changes, or changes since a commit."
---

Two-axis review of the diff between `HEAD` and a fixed point the user supplies:

- **Standards**: does the code conform to this repo's documented coding standards?
- **Spec**: does the code faithfully implement the originating issue / spec?

Keep Standards and Spec as independent axes on the same pinned snapshot. A local harness may assign separate reviewers; follow its role boundaries and artifact paths.

Use the repository's local task/spec when present. Use an issue tracker only when the user requests one or the repository workflow requires it; do not block a review that has a local spec or no tracker request.

## Process

### 1. Pin the fixed point

Whatever the user said is the fixed point (a commit SHA, branch name, tag, `main`, `HEAD~5`, etc.). If they didn't specify one, ask for it.

Resolve and record the fixed point once with `git rev-parse <fixed-point>`. For committed work, capture `git diff <fixed-point>...HEAD` (three-dot comparison against the merge-base) and `git log <fixed-point>..HEAD --oneline`. If the user explicitly asks to review a dirty working tree, compare staged and unstaged changes to the resolved HEAD SHA with `git diff <HEAD-SHA> -- <task paths>`; record the exact path manifest and hashes for relevant untracked files. Keep the modes distinct and report the precise boundary.

Before going further, confirm the fixed point resolves and the selected diff is non-empty. A bad ref or empty diff should fail before review begins.

### 2. Identify the spec source

Look for the originating task/spec, in this order:

1. The current task and matching spec under `projects/tasks/<work>/work-items/` and `projects/tasks/<work>/specs/`.
2. A path the user passed as an argument.
3. Issue references in commit messages (`#123`, `Closes #45`, GitLab `!67`, etc.), using the configured tracker workflow when needed.
4. A matching spec under general `docs/`, `specs/`, or `.scratch/` directories.
5. If no spec is available, mark the **Spec** axis skipped with that limitation in the review agreement and final report. Continue **Standards** and correctness review against repository rules and observable behavior; do not infer requirements or block the whole review solely for a missing spec.

### 3. Identify the standards sources

Search the repo for every file that documents how code should be written. When `CODING_STANDARDS.md` or `CONTRIBUTING.md` exists, it must be on the list.

On top of whatever the repo documents, the Standards axis always carries the **smell baseline** below: a fixed set of Fowler code smells (_Refactoring_, ch.3) that applies even when a repo documents nothing. Two rules bind it:

- **The repo overrides.** A documented repo standard always wins; where it endorses something the baseline would flag, suppress the smell.
- **Always a judgement call.** Each smell is a labelled heuristic ("possible Feature Envy"), never a hard violation. Like any standard here, skip anything tooling already enforces.

Each smell reads *what it is* → *how to fix*; match it against the diff:

- **Mysterious Name**: a function, variable, or type whose name doesn't reveal what it does or holds. → rename it; if no honest name comes, the design's murky.
- **Duplicated Code**: the same logic shape appears in more than one hunk or file in the change. → extract the shared shape, call it from both.
- **Feature Envy**: a method that reaches into another object's data more than its own. → move the method onto the data it envies.
- **Data Clumps**: the same few fields or params keep travelling together (a type wanting to be born). → bundle them into one type, pass that.
- **Primitive Obsession**: a primitive or string standing in for a domain concept that deserves its own type. → give the concept its own small type.
- **Repeated Switches**: the same `switch`/`if`-cascade on the same type recurs across the change. → replace with polymorphism, or one map both sites share.
- **Shotgun Surgery**: one logical change forces scattered edits across many files in the diff. → gather what changes together into one module.
- **Divergent Change**: one file or module is edited for several unrelated reasons. → split so each module changes for one reason.
- **Speculative Generality**: abstraction, parameters, or hooks added for needs the spec doesn't have. → delete it; inline back until a real need shows.
- **Message Chains**: long `a.b().c().d()` navigation the caller shouldn't depend on. → hide the walk behind one method on the first object.
- **Middle Man**: a class or function that mostly just delegates onward. → cut it, call the real target direct.
- **Refused Bequest**: a subclass or implementer that ignores or overrides most of what it inherits. → drop the inheritance, use composition.

### 4. Run both review axes

Run both axes independently on the same pinned snapshot. Do not spawn agents when the caller's workflow forbids it; follow local reviewer roles and authority.

**Standards review** should include:

- The full diff command and commit list.
- The list of standards-source files you found in step 3, **plus the smell baseline from step 3** pasted in full (the independent reviewer needs this complete reference).
- The brief: "Report, per file/hunk where relevant, (a) every place the diff violates a documented standard: cite the standard (file + the rule); and (b) any baseline smell you spot: name it and quote the hunk. Distinguish hard violations from judgement calls: documented-standard breaches can be hard, but baseline smells are always judgement calls, and a documented repo standard overrides the baseline. Skip anything tooling enforces. Under 400 words."

**Spec review** should include:

- The diff command and commit list.
- The path or fetched contents of the spec.
- The brief: "Report: (a) requirements the spec asked for that are missing or partial; (b) behaviour in the diff that wasn't asked for (scope creep); (c) requirements that look implemented but where the implementation looks wrong. Quote the spec line for each finding. Under 400 words."

If the spec is missing, skip only the Spec axis and state that limitation in the review agreement and final report. Continue Standards and correctness review. Consider and try to construct plausible counterexamples in runtime behavior and architecture beyond literal ACs; record the scenarios examined and conclusion, including when no defect is found. Separate confirmed defects outside scope from proposed implementation changes. Request targeted read-only evidence when needed, and report unverified mandatory checks as blocked rather than pass. Avoid rerunning the full suite without a reason.

### 5. Aggregate

Present the two reports under `## Standards` and `## Spec` headings, verbatim or lightly cleaned. Do **not** merge or rerank findings, because the two axes are deliberately separate (see _Why two axes_).

End with a one-line summary: total findings per axis, and the worst issue _within each axis_ (if any). Don't pick a single winner across axes: that's the reranking the separation exists to prevent.

## Why two axes

A change can pass one axis and fail the other:

- Code that follows every standard but implements the wrong thing → **Standards pass, Spec fail.**
- Code that does exactly what the issue asked but breaks the project's conventions → **Spec pass, Standards fail.**

Reporting them separately stops one axis from masking the other.
