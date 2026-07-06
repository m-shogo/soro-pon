# Dependency Policy

## Purpose

Soro-pon MVP should stay small and predictable.

Dependencies must be added deliberately, not because they are convenient for one file.

## Fixed MVP Stack

Allowed initial stack:

```text
TypeScript
React
Vite
Zod
Vitest
CSS / CSS Modules
localStorage first
```

## Not Allowed In MVP Initial Implementation

```text
Next.js
Supabase
Firebase
Unity
Godot
Phaser
Redux
Zustand
TanStack Query
Tailwind
large animation frameworks
remote image/CDN SDKs
runtime plugin systems
```

## Allowed Without ADR

Small dev dependencies may be added without ADR if they are standard for the stack and used immediately:

```text
@vitejs/plugin-react
jsdom or happy-dom for tests if needed
eslint/prettier tooling if chosen
TypeScript type packages
```

Must still be reported in commit summary.

## ADR Required

ADR required before adding:

```text
state management library
router
network/data fetching library
CSS framework
animation library
drag-and-drop framework
IndexedDB wrapper
image processing library
crypto/signature library
schema alternative
runtime validation alternative
```

ADR must answer:

```text
why built-in/simple implementation is insufficient
bundle/runtime impact
security impact
how it affects tests
how it affects mobile performance
exit strategy if removed later
```

## Dependency Review Checklist

Before adding dependency:

```text
Is it needed for MVP?
Can this be done with 30 lines of simple local code?
Does it run in browser safely?
Does it touch user data/import/image files?
Does it increase bundle size significantly?
Does it make tests harder?
Does it create hidden network behavior?
```

## Security Rule

Dependencies must not introduce:

```text
remote code execution
plugin loading from user decks
automatic remote image fetching
analytics/tracking
unexpected network calls
```

## Lockfile Rule

Once package setup exists:

```text
commit lockfile
CI uses lockfile install
unexpected lockfile-only changes require review
```

## Final Decision

The default answer to new dependencies is no until the need is proven.
