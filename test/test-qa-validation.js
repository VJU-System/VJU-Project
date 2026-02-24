// =============================================================
// test-qa-validation.js
// Tests for QA validation helper functions
// =============================================================

// === QA Validation Helper Functions ===

function validateYamlFrontMatter(md) {
  var errors = [];
  var requiredFields = ['doc_id', 'title', 'date', 'department', 'type', 'restricted', 'last_updated'];
  var validDepartments = ['Academic Affairs', 'Quality Assurance', 'Financial Affairs', 'General Affairs', 'Student Affairs', 'International Cooperation', 'Science and Technology', 'Organization and Personnel'];
  var validTypes = ['Regulation', 'Circular', 'Guideline', 'Notification', 'Decree', 'Decision', 'Report'];

  var match = md.match(/^---\n([\s\S]*?)\n---/);
  if (!match) { errors.push('No YAML front matter found'); return { errors: errors }; }

  var yaml = match[1];
  var fields = {};
  yaml.split('\n').forEach(function (line) {
    var m = line.match(/^(\w+):\s*(.+)/);
    if (m) fields[m[1]] = m[2].replace(/^["']|["']$/g, '');
  });

  requiredFields.forEach(function (field) {
    if (!fields[field]) errors.push('Missing required field: ' + field);
  });

  if (fields.department && !validDepartments.includes(fields.department)) {
    errors.push('Invalid department: ' + fields.department);
  }
  if (fields.type && !validTypes.includes(fields.type)) {
    errors.push('Invalid type: ' + fields.type);
  }
  if (fields.date && !/^\d{4}-\d{2}-\d{2}$/.test(fields.date)) {
    errors.push('Invalid date format: ' + fields.date + ' (expected YYYY-MM-DD)');
  }

  return { errors: errors, fields: fields };
}

function validateDocId(docId) {
  var valid = /\//.test(docId) && /[\u0111\u0110]/.test(docId);
  return { valid: valid, docId: docId };
}

function validateIndentation(text) {
  var warnings = [];
  var lines = text.split('\n');
  lines.forEach(function (line, i) {
    // khoan with 4+ space indent is wrong — khoan must start at column 0
    if (/^ {4,}\d+\.\s/.test(line)) {
      warnings.push('Line ' + (i + 1) + ': khoan "' + line.trim().substring(0, 30) + '..." is indented (khoan must start at column 0)');
    }
    // dash list with 4+ space indent is wrong — must be 0 or 2 spaces
    if (/^ {4,}- /.test(line)) {
      warnings.push('Line ' + (i + 1) + ': dash list "' + line.trim().substring(0, 30) + '..." has 4+ space indent (max 2)');
    }
  });
  return { warnings: warnings };
}

function validateHtmlMarkdownMix(text) {
  var errors = [];
  // Detect *...* or **...** inside HTML tags
  var htmlBlocks = text.match(/<(p|div|span)[^>]*>[\s\S]*?<\/\1>/g) || [];
  htmlBlocks.forEach(function (block) {
    if (/\*[^*]+\*/.test(block) && !/<em>|<strong>/.test(block)) {
      errors.push('Markdown emphasis inside HTML: ' + block.substring(0, 60) + '...');
    }
  });
  return { errors: errors };
}

function validateSourceNote(text, expectedPdfPath, expectedPages) {
  var errors = [];
  var m = text.match(/>\s*\*\*\[SOURCE_NOTE\]\*\*\s*Transcription source:\s*`([^`]+)`\s*\((\d+)\s+pages\)/);
  if (!m) {
    errors.push('Missing SOURCE_NOTE block');
    return { errors: errors };
  }
  if (expectedPdfPath && m[1] !== expectedPdfPath) {
    errors.push('SOURCE_NOTE pdf path mismatch: ' + m[1]);
  }
  if (typeof expectedPages === 'number' && Number(m[2]) !== expectedPages) {
    errors.push('SOURCE_NOTE page count mismatch: ' + m[2]);
  }
  return { errors: errors, pdfPath: m[1], pages: Number(m[2]) };
}

function validateHeadingLevelParity(viText, translatedText, lang) {
  var warnings = [];
  var viChapters = (viText.match(/^#\s+Chương\b/gm) || []).length;
  var viArticles = (viText.match(/^##\s+Điều\b/gm) || []).length;
  var trChapters = lang === 'ja'
    ? (translatedText.match(/^#\s+第[0-9一二三四五六七八九十百]+章/gm) || []).length
    : (translatedText.match(/^#\s+Chapter\b/gm) || []).length;
  var trArticles = lang === 'ja'
    ? (translatedText.match(/^##\s+第[0-9一二三四五六七八九十百]+条/gm) || []).length
    : (translatedText.match(/^##\s+Article\b/gm) || []).length;
  var badArticleH3 = lang === 'ja'
    ? (translatedText.match(/^###\s+第[0-9一二三四五六七八九十百]+条/gm) || []).length
    : (translatedText.match(/^###\s+Article\b/gm) || []).length;
  if (badArticleH3 > 0) warnings.push('Translated file uses h3 article headings: ' + badArticleH3);
  if (viChapters > 0 && trChapters !== viChapters) warnings.push('Chapter heading count mismatch: vi=' + viChapters + ' tr=' + trChapters);
  if (viArticles > 0 && trArticles !== viArticles) warnings.push('Article heading count mismatch: vi=' + viArticles + ' tr=' + trArticles);
  return { warnings: warnings, counts: { viChapters: viChapters, viArticles: viArticles, trChapters: trChapters, trArticles: trArticles } };
}

function validateCenteredHtmlWrapperMisuse(text) {
  var warnings = [];
  var lines = text.split('\n');
  lines.forEach(function (line, i) {
    if (/<p align="center"><strong>\*.*\*<\/strong><\/p>/.test(line)) {
      warnings.push('Line ' + (i + 1) + ': centered+bold wrapper used around italic paragraph');
    }
  });
  return { warnings: warnings };
}

// === Tests ===

describe('QA Validation Helpers', function () {

  it('validateYamlFrontMatter detects missing required fields', function () {
    var incomplete = '---\ntitle: Test\n---\nBody';
    var result = validateYamlFrontMatter(incomplete);
    assert(result.errors.length > 0, 'Should detect missing fields');
    assert(result.errors.some(function (e) { return e.includes('doc_id'); }), 'Should flag missing doc_id');
  });

  it('validateYamlFrontMatter passes valid front matter', function () {
    var valid = '---\ndoc_id: "3626/Q\u0110-\u0110HQGHN"\ntitle: Test\ndate: 2024-01-01\ndepartment: Academic Affairs\ntype: Regulation\nrestricted: false\nlast_updated: 2024-01-01\n---\nBody';
    var result = validateYamlFrontMatter(valid);
    assertEqual(result.errors.length, 0, 'Should have no errors, got: ' + result.errors.join('; '));
  });

  it('validateYamlFrontMatter detects invalid department', function () {
    var bad = '---\ndoc_id: "test"\ntitle: Test\ndate: 2024-01-01\ndepartment: Fake Department\ntype: Regulation\nrestricted: false\nlast_updated: 2024-01-01\n---\nBody';
    var result = validateYamlFrontMatter(bad);
    assert(result.errors.some(function (e) { return e.includes('Invalid department'); }), 'Should flag invalid department');
  });

  it('validateYamlFrontMatter detects invalid date format', function () {
    var bad = '---\ndoc_id: "test"\ntitle: Test\ndate: 01/01/2024\ndepartment: Academic Affairs\ntype: Regulation\nrestricted: false\nlast_updated: 2024-01-01\n---\nBody';
    var result = validateYamlFrontMatter(bad);
    assert(result.errors.some(function (e) { return e.includes('Invalid date format'); }), 'Should flag invalid date');
  });

  it('validateYamlFrontMatter detects missing front matter', function () {
    var result = validateYamlFrontMatter('No front matter here');
    assert(result.errors.some(function (e) { return e.includes('No YAML front matter found'); }), 'Should detect missing front matter');
  });

  it('validateDocId detects diacritical presence', function () {
    assert(validateDocId('3626/Q\u0110-\u0110HQGHN').valid === true, 'Original should be valid');
  });

  it('validateDocId rejects sanitized ID without diacriticals', function () {
    assert(validateDocId('3626-QD-DHQGHN').valid === false, 'Sanitized ID should be invalid (no slash or diacriticals)');
  });

  it('validateIndentation passes khoan at column 0', function () {
    var good = '1. Khoan at column 0';
    var result = validateIndentation(good);
    assertEqual(result.warnings.length, 0, 'Khoan at column 0 is correct');
  });

  it('validateIndentation detects 4sp-indented khoan', function () {
    var bad = '    1. Incorrectly indented khoan';
    var result = validateIndentation(bad);
    assert(result.warnings.length > 0, 'Should warn about indented khoan');
    assert(result.warnings[0].includes('column 0'), 'Should mention column 0');
  });

  it('validateIndentation detects 4sp-indented dash list', function () {
    var bad = '    - Dash list with 4 space indent';
    var result = validateIndentation(bad);
    assert(result.warnings.length > 0, 'Should warn about 4sp dash list');
    assert(result.warnings[0].includes('4+ space indent'), 'Should mention 4+ space indent');
  });

  it('validateIndentation passes 2sp-indented dash list', function () {
    var good = '  - Dash list with 2 space indent';
    var result = validateIndentation(good);
    assertEqual(result.warnings.length, 0, '2sp dash list is correct');
  });

  it('validateHtmlMarkdownMix detects asterisks inside HTML tags', function () {
    var bad = '<p align="center">*(Ban h\u00E0nh k\u00E8m theo)*</p>';
    var result = validateHtmlMarkdownMix(bad);
    assert(result.errors.length > 0, 'Should detect markdown inside HTML');
  });

  it('validateHtmlMarkdownMix passes HTML with proper tags', function () {
    var good = '<p align="center"><em>(Ban h\u00E0nh k\u00E8m theo)</em></p>';
    var result = validateHtmlMarkdownMix(good);
    assertEqual(result.errors.length, 0, 'Should pass with HTML tags');
  });

  it('validateHtmlMarkdownMix passes plain text without HTML', function () {
    var plain = 'Just some *italic* text outside HTML';
    var result = validateHtmlMarkdownMix(plain);
    assertEqual(result.errors.length, 0, 'Should pass for non-HTML text');
  });

  it('validateSourceNote detects missing source note', function () {
    var result = validateSourceNote('Body only');
    assert(result.errors.length > 0, 'Should detect missing SOURCE_NOTE');
  });

  it('validateSourceNote validates path and page count', function () {
    var text = '> **[SOURCE_NOTE]** Transcription source: `data/a_source.pdf` (9 pages)';
    var result = validateSourceNote(text, 'data/a_source.pdf', 9);
    assertEqual(result.errors.length, 0, 'Expected valid SOURCE_NOTE');
  });

  it('validateHeadingLevelParity flags translated h3 article headings', function () {
    var vi = '# Chương I\n## Điều 1. A\n## Điều 2. B';
    var en = '# Chapter I\n### Article 1. A\n### Article 2. B';
    var result = validateHeadingLevelParity(vi, en, 'en');
    assert(result.warnings.some(function (w) { return w.includes('h3 article headings'); }), 'Should flag h3 articles');
  });

  it('validateHeadingLevelParity passes VI/JA parity', function () {
    var vi = '# Chương I\n## Điều 1. A\n## Điều 2. B';
    var ja = '# 第1章 総則\n## 第1条 A\n## 第2条 B';
    var result = validateHeadingLevelParity(vi, ja, 'ja');
    assertEqual(result.warnings.length, 0, 'Expected no parity warnings');
  });

  it('validateCenteredHtmlWrapperMisuse flags centered bold italic wrapper', function () {
    var bad = '<p align="center"><strong>*Pursuant to ...*</strong></p>';
    var result = validateCenteredHtmlWrapperMisuse(bad);
    assert(result.warnings.length > 0, 'Should flag wrapper misuse');
  });

  it('validateCenteredHtmlWrapperMisuse ignores centered heading without italics', function () {
    var good = '<p align="center"><strong>THÔNG TƯ</strong></p>';
    var result = validateCenteredHtmlWrapperMisuse(good);
    assertEqual(result.warnings.length, 0, 'Should not flag normal centered headings');
  });
});

// === CSS Rule Validation ===

function validateCssRules(cssText) {
  var errors = [];
  // p.khoan must NOT have non-zero padding-left (khoan is not a list)
  var khoanMatch = cssText.match(/p\.khoan\s*\{([^}]*)\}/);
  if (khoanMatch) {
    var plMatch = khoanMatch[1].match(/padding-left:\s*([^;]+)/);
    if (plMatch) {
      var val = plMatch[1].trim();
      if (val !== '0' && val !== '0px' && val !== '0em') {
        errors.push('p.khoan has padding-left: ' + val + ' (must be 0 — khoan is not a bullet list)');
      }
    }
  }
  return { errors: errors };
}

describe('CSS Rule Validation', function () {

  it('p.khoan must not have non-zero padding-left', function () {
    var badCss = '.prose-legal p.khoan { padding-left: 1.5em; margin: 0.3rem 0; }';
    var result = validateCssRules(badCss);
    assert(result.errors.length > 0, 'Should detect non-zero khoan padding');
    assert(result.errors[0].includes('1.5em'), 'Should mention the actual value');
  });

  it('p.khoan with padding-left: 0 is valid', function () {
    var goodCss = '.prose-legal p.khoan { padding-left: 0; margin: 0.3rem 0; }';
    var result = validateCssRules(goodCss);
    assertEqual(result.errors.length, 0, 'padding-left: 0 should pass');
  });
});
