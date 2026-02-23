const fs = require('fs');
const path = require('path');

function isListOrHeading(line) {
    if (line.match(/^(\s*)(#+|-|\*|\d+\.)\s+/)) return true;
    if (line.match(/^(\s*)([a-z]\)|\d+\))\s+/)) return true;
    if (line.match(/^\s*$/)) return true;
    if (line.match(/^<.*>$/)) return true; // HTML tags
    if (line.match(/^\|.*\|$/)) return true; // Table
    return false;
}

function expectsContinuationEn(line) {
    if (line.match(/[.:;!?]$/)) return false;
    if (line.match(/>$/)) return false;
    return true;
}

function isContinuationEn(line) {
    if (isListOrHeading(line)) return false;
    if (line.match(/^[a-z]/)) return true;
    if (line.match(/^[A-Z]*[a-z]+/)) return true;
    return false;
}

function fixEn(text) {
    const lines = text.split('\n');
    const result = [];
    let i = 0;
    let inYaml = false;

    if (lines[0] === '---') {
        inYaml = true;
        result.push(lines[i++]);
        while (i < lines.length && lines[i] !== '---') {
            result.push(lines[i++]);
        }
        if (i < lines.length) result.push(lines[i++]);
        inYaml = false;
    }

    while (i < lines.length) {
        let current = lines[i];
        if (isListOrHeading(current)) {
            result.push(current);
            i++;
            continue;
        }

        while (i + 1 < lines.length) {
            const next = lines[i + 1];
            if (isListOrHeading(next)) break;
            if (!expectsContinuationEn(current)) break;
            if (!isContinuationEn(next)) break;

            current = current.replace(/\s+$/, '') + ' ' + next.replace(/^\s+/, '');
            i++;
        }
        result.push(current);
        i++;
    }
    return result.join('\n');
}

function fixJa(text) {
    const lines = text.split('\n');
    const result = [];
    let i = 0;
    let inYaml = false;

    if (lines[0] === '---') {
        inYaml = true;
        result.push(lines[i++]);
        while (i < lines.length && lines[i] !== '---') {
            result.push(lines[i++]);
        }
        if (i < lines.length) result.push(lines[i++]);
        inYaml = false;
    }

    while (i < lines.length) {
        let current = lines[i];
        if (isListOrHeading(current)) {
            result.push(current);
            i++;
            continue;
        }

        while (i + 1 < lines.length) {
            const next = lines[i + 1];
            if (isListOrHeading(next)) break;
            if (next.match(/^\s*$/)) break; // stop on empty line
            if (current.match(/[。、：！？.;>:]$/)) break;

            // Do not merge if the next line starts with a list item that we might have missed
            if (next.match(/^(\s*)([a-z]\)|\d+\))/)) break;

            current = current.replace(/\s+$/, '') + next.replace(/^\s+/, '');
            i++;
        }
        result.push(current);
        i++;
    }
    return result.join('\n');
}

const dir = '/Users/home/GitHub/3. DX-General/VJU Project 2/data';
const enFile = path.join(dir, '3636-QD-DHQGHN_Regulation on Masters Training_transcription_en.md');
const jaFile = path.join(dir, '3636-QD-DHQGHN_Regulation on Masters Training_transcription_ja.md');

const enText = fs.readFileSync(enFile, 'utf8');
const fixedEn = fixEn(enText);
fs.writeFileSync(enFile, fixedEn, 'utf8');
console.log('Fixed EN file.');

const jaText = fs.readFileSync(jaFile, 'utf8');
const fixedJa = fixJa(jaText);
fs.writeFileSync(jaFile, fixedJa, 'utf8');
console.log('Fixed JA file.');
