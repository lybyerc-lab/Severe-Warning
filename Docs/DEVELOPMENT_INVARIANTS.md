# Severe Warning — Development Invariants & CI Guidelines

This document defines critical repository invariants enforced by CI workflows and local build scripts.

---

## 1. File Inventory (FILE_INVENTORY.txt)
- **Requirement:** Every tracked file in Git must be listed in FILE_INVENTORY.txt.
- **Encoding:** UTF-8 without BOM, LF (\n) line endings.
- **Sort Order:** Exact Ordinal / ASCII code unit order (matching Python sorted() and LC_ALL=C sort).
- **Automated Fix:**
  `ash
  pnpm run inventory:update
  # or: python3 Tools/validate_project.py --fix
  `

---

## 2. TypeScript & Unit Tests (src/**/*.test.ts)
- **Test Runner:** Must use Node.js native test runner:
  `	s
  import test from 'node:test';
  import assert from 'node:assert/strict';
  `
- **Prohibited:** Do **NOT** import from external test frameworks (itest, jest, mocha, chai) because @types/node is the sole type provider.
- **Import Extensions:** All relative imports must include explicit .ts extensions (e.g. import { Foo } from './foo.ts';) per 	sconfig.json llowImportingTsExtensions.
- **Validation:**
  `ash
  pnpm run lint:hygiene
  pnpm run modern:typecheck
  pnpm test
  `

---

## 3. Typography & Styling
- **No Emojis:** Do not use unicode surrogate-pair emojis in HUD, HTML, radar, or UI. Use clean, authentic retro arcade typography and NOAA weather alert formatting.
