# QA Report for Document 3636/QĐ-ĐHQGHN

**Date:** 2026-02-23
**Document ID:** 3636/QĐ-ĐHQGHN
**Source:** `data/3636-QD-DHQGHN_Regulation on Masters Training_source.pdf`
**Transcription Files:**
- `data/3636-QD-DHQGHN_Regulation on Masters Training_transcription.md`
- `data/3636-QD-DHQGHN_Regulation on Masters Training_transcription_en.md`
- `data/3636-QD-DHQGHN_Regulation on Masters Training_transcription_ja.md`

---

## 1. Summary of Fixes

A comprehensive review and correction process was undertaken on the Vietnamese, English, and Japanese transcriptions based on the `docs/QA_CHECKLIST.md`. The following changes were made to align the documents with formatting standards and ensure cross-language consistency:

### 1.1. Structural & Heading Normalization
- **Global:** The main "DECISION" heading (`# QUYẾT ĐỊNH` / `# DECISION` / `# 決定`) was converted into a non-heading, centered paragraph (`<p align="center"><strong>...</strong></p>`) across all three language files. This correctly separates the document's formal title from the navigable chapter/article structure.
- **EN & JA:** The signature and recipient block (`Nơi nhận`) was reformatted using a two-column HTML flexbox `<div>`. This fixes a major layout inconsistency and brings the translated documents in line with the Vietnamese source structure.

### 1.2. Content & Metadata Correction
- **EN & JA:** The document identifier in the subtitle was corrected from the incorrect `QD-VNU` to the official `QĐ-ĐHQGHN` to maintain ID integrity.
- **EN & JA:** The label for the document number in the header was changed from `No.:` (English) and `番号:` (Japanese) to `Số:` to match the label used in the source Vietnamese document.

### 1.3. Indentation & List Formatting
- **EN & JA:** Removed leading whitespace from all top-level numbered list items (e.g., `1.`, `2.`) throughout all chapters. This was the most extensive change, ensuring that clause-level items (`khoản`) are rendered as simple paragraphs rather than items in an ordered list (`<ol>`), aligning them with the Vietnamese file's structure and the rendering requirements outlined in the QA checklist.

---

## 2. QA Checklist Items Addressed

The following items from `docs/QA_CHECKLIST.md` were reviewed and corrected:

- **[1.3] Heading Normalization:** Verified and fixed.
- **[1.4] Decision Section:** Verified and fixed layout in EN/JA versions.
- **[1.5] khoản/điểm Indentation:** Verified and fixed in EN/JA versions to match VI structure.
- **[1.7] PDF → MD レイアウト整合性 (PDF Layout Fidelity):** Addressed layout issues for headings and the decision section. Full fidelity could not be checked without the PDF.
- **[2.2] Document ID Integrity:** Corrected `QD-VNU` in the document body.
- **[4.2] Structural Consistency Across Languages:** This was the primary focus. All fixes (headings, signature block, indentation) were made to ensure the VI, EN, and JA files share an identical Markdown structure.
- **[4.3] Heading Translation Patterns:** Verified that Chapter/Article heading translations followed the standard pattern.

---

## 3. Findings & Risks

- **Finding:** The primary issue was significant structural drift between the Vietnamese transcription and the English/Japanese translations. The translations used standard Markdown list indentation, whereas the source format required flat paragraphs for top-level clauses. Additionally, key HTML layout blocks (like the signature section) were missing from the translations.
- **Finding:** Minor inconsistencies in metadata (document ID, labels) were also present in the translated files.
- **Risk:** **Content Accuracy Not Verified.** The QA process focused exclusively on formatting, layout, and structural consistency as requested. The semantic content, accuracy of the translation, and fidelity to the original `_source.pdf` were **not** checked. There is a risk that the text itself contains translation errors.
- **Risk:** **Visual Layout Verification.** While structural HTML was corrected (e.g., flexbox), the final rendered appearance was not visually verified in a browser. There may be minor CSS-related presentation differences.

---

## 4. Final Status

**PARTIAL**

The requested QA tasks related to formatting, headings, indentation, and structural consistency have been completed successfully. However, as the content was not verified against the source PDF, the overall QA status is partial.