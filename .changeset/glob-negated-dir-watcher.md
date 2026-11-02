---
'astro': patch
---

Fixes the `glob()` loader adding files to a collection during dev when they change inside a directory excluded with a negation pattern like `!_docs`
