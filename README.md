# VNU Research Hub

A document viewer for Vietnam National University, Hanoi administrative regulations.

## Live Site

Hosted via GitHub Pages from the `docs/` directory.

## Features

- **Home / Discovery**: Search interface with recent circulars
- **Search Results**: Filtered document search with department and type facets
- **Department Archive**: Department detail pages with contact info and document listings
- **Document Reader**: Split-view mode with Vietnamese original and English/Japanese translations side-by-side
  - Scroll sync between panes
  - Resizable split view via drag handle
  - Table of contents sidebar with scroll spy
  - Source PDF viewer

## Documents

| Document | Languages |
|----------|-----------|
| 3626/QD-DHQGHN — Regulation on Undergraduate Training | VN, EN, JP |

## Tech Stack

- Static HTML (no build step, no Node.js)
- [Tailwind CSS](https://tailwindcss.com/) via CDN
- [marked.js](https://marked.js.org/) for Markdown rendering
- [DOMPurify](https://github.com/cure53/DOMPurify) for XSS prevention
- [Google Material Symbols](https://fonts.google.com/icons) for icons
