# QA Master Report (PDF -> MD)

- This file is the consolidated QA log for PDF->Markdown quality assurance, fixes, and reviews.
- New QA entries are appended with date and status updates.

## 2026-02-23 Batch 1 (Initial QA via script + Claude)

### Scope
- `911-TB-DHVN_Foreign Language Certificate Submission VJU2024`
- `984-TB-DHVN_Foreign Language Certificate Submission VJU2023`
- `1010-TB-DHVN_English Certificate Submission VJU2025`

### Script Checks (common findings)
- YAML standardized fields missing / incomplete in all three documents (all language variants)
- Disclaimer block missing in all three documents (all language variants)
- Notification documents have no `##` headings (not necessarily a defect; checklist item may not apply to all TB docs)
- `_source` contamination detected in some `title` fields
- EN/JA table rendering defects suspected (ASCII grid / escaped pipes)

### Claude QA Findings Summary

#### 911-TB-DHVN (VJU2024)
- EN/JA Appendix 1 and Appendix 2 tables are broken (ASCII/escaped-pipe formatting, unreadable) [CRITICAL]
- EN/JA Section 2 table also broken [CRITICAL]
- EN/JA header/recipient/signature blocks collapsed into single-line formatting [MEDIUM]
- EN/JA institutional name translation error: `Nam Can Tho University` rendered as `Can Tho University` [HIGH]
- VI front matter title contains `_source` suffix [HIGH]

#### 984-TB-DHVN (VJU2023)
- EN/JA cross-reference doc IDs incorrectly changed from `ĐHQGHN` to `ĐHVN` and lost diacritics [HIGH]
- EN/JA Appendix formatting severely degraded (table escape / wrapping issues) [LOW-MEDIUM for rendering, HIGH where IDs wrong]
- VI/EN/JA section 1.2 bullet markers missing vs PDF [MEDIUM]
- `id` field format and `issue_date: null` metadata need normalization [MEDIUM]
- VI front matter title contains `_source` suffix [MEDIUM]

#### 1010-TB-DHVN (VJU2025)
- JA version is from a different source document (content contamination), requiring full rewrite [CRITICAL]
- JA structure/sections/appendices do not match PDF/VI/EN [CRITICAL]
- VI front matter title contains `_source` suffix [HIGH]
- EN only minor issues; VI/EN are mostly structurally faithful [LOW-MEDIUM]

### Additional QA Checks Added to Standard Workflow
1. Source-document contamination check (translations must match the exact source document, not related prior-year documents)
2. EN/JA table format validation (fail on ASCII grid tables or escaped-pipe pseudo tables for intended Markdown tables)
3. Proper-name list reconciliation for annexes (e.g., university names, row-by-row against VI)
4. Doc ID preservation check (keep diacritics and issuing institution codes in references)
5. Notification layout block check (header / recipients / signature must not collapse into one line)

### Next Actions (planned)
- [ ] Claude fix + Claude review: `1010` JA full rewrite
- [ ] Claude fix + Claude review: `911` EN/JA table/layout repair
- [ ] Claude fix + Claude review: `984` EN/JA ID + table/layout repair

## 2026-02-23 Batch 1A (Claude Fix Attempt / Timeout Tracking)

### Claude Execution Notes
- `1010` JA full rewrite (direct file edit request) timed out at 180s with no response.
- `1010` JA full rewrite (reduced scope: VI/EN-based rewrite, no PDF read) timed out at 180s with no response.
- Per user rule, these >3 min no-response events were reported immediately during execution.

### Claude-applied Fixes (completed)
- Target: `1010-TB-DHVN_English Certificate Submission VJU2025`
- EN footnote marker formatting corrected in Appendix 2 footnote definition: `(**)` -> `(\*\*)` (rendering-safe literal marker)
- VI title front matter checked by Claude; no additional fix required (already clean)

### Claude Feedback (for QA/formatter improvements)
- Add an automatic rule to verify footnote marker escape consistency between reference markers and footnote definitions (e.g., `(*)`, `(\*\*)`, `†`) so Markdown does not reinterpret literal markers as emphasis.

### Remaining Work (still pending)
- `1010` JA file: full rewrite to correct source-document contamination
- `1010` PDF-based post-fix review by Claude (after JA rewrite)
## 2026-02-23 1010-TB-DHVN Script Check Pass (Pre-fix)

### Files
- `data/1010-TB-DHVN_English Certificate Submission VJU2025_transcription.md`
- `data/1010-TB-DHVN_English Certificate Submission VJU2025_transcription_en.md`
- `data/1010-TB-DHVN_English Certificate Submission VJU2025_transcription_ja.md`

### Script results (Codex-run)
- VI: metadata fields present, source-note present, pipe tables detected, no structural warning triggered
- EN: metadata fields present, source-note present, pipe tables detected, no structural warning triggered
- JA: metadata fields present, but script flags triggered:
  - sanitized `QD` token pattern detected in body references (likely diacritic loss)
  - ASCII separator lines detected (`ascii-separator-lines=7`), indicating non-Markdown table formatting contamination
  - no pipe-table lines detected (`pipe_table_lines=0`) while VI/EN have 45 each

### Status
- Pre-fix script checks confirm JA requires structural rewrite before PDF-based re-review.
