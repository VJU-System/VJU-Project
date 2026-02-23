// =============================================================
// test-markdown-preprocessing.js
// Tests for the markdown preprocessing logic
// =============================================================

// Helper: simplified version of preprocessLegalMd for testing.
// This extracts the core logic without DOM dependencies.
function preprocessForTest(md) {
  var lines = md.split('\n');
  var out = [];
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    // Escape numbered lists: "1. " at line start -> "1\. "
    line = line.replace(/^(\d+)\. /, '$1\\. ');
    // Strip 4+ space indent from dash lists
    if (/^ {4,}- /.test(line)) line = line.replace(/^ {4,}(- )/, '$1');
    out.push(line);
  }
  return out.join('\n');
}

describe('Markdown Preprocessing', function () {

  it('escapes numbered list markers', function () {
    var input = '1. First item\n2. Second item';
    var result = preprocessForTest(input);
    assert(result.includes('1\\. '), 'Should escape "1. " to "1\\. "');
    assert(result.includes('2\\. '), 'Should escape "2. " to "2\\. "');
  });

  it('does not escape numbers mid-line', function () {
    var input = 'See section 1. for details';
    var result = preprocessForTest(input);
    // Only line-start numbers are escaped
    assertEqual(result, input, 'Mid-line "1. " should not be escaped');
  });

  it('preserves diem letters (a), b), etc.)', function () {
    var input = 'a) First point\nb) Second point';
    var result = preprocessForTest(input);
    assert(result.includes('a)'), 'Should preserve a)');
    assert(result.includes('b)'), 'Should preserve b)');
  });

  it('handles mixed khoan and diem', function () {
    var input = '1. Khoan text\n    a) Diem text\n    b) Diem text\n2. Next khoan';
    var result = preprocessForTest(input);
    assert(result.includes('1\\. '), 'Should contain escaped khoan 1');
    assert(result.includes('2\\. '), 'Should contain escaped khoan 2');
    assert(result.includes('a)'), 'Should contain diem a');
  });

  it('escapes multi-digit numbers', function () {
    var input = '10. Tenth item\n25. Twenty-fifth';
    var result = preprocessForTest(input);
    assert(result.includes('10\\. '), 'Should escape 10.');
    assert(result.includes('25\\. '), 'Should escape 25.');
  });

  it('handles empty input', function () {
    assertEqual(preprocessForTest(''), '');
  });

  it('handles text with no numbered lists', function () {
    var input = 'Just a paragraph.\nAnother line.';
    assertEqual(preprocessForTest(input), input);
  });

  it('strips 4+ space indent from dash lists', function () {
    var input = '    - Indented dash item\n      continuation line';
    var result = preprocessForTest(input);
    assert(result.includes('- Indented dash item'), 'Should strip 4sp indent from dash list');
    assert(!result.includes('    - '), 'Should not contain 4sp dash');
  });

  it('preserves 2sp-indented dash lists', function () {
    var input = '  - Two space indent';
    var result = preprocessForTest(input);
    assertEqual(result, input, '2sp dash list should be preserved');
  });
});
