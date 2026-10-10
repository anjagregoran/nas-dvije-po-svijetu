#!/bin/sh
# Koordinate za nova mjesta, tražilica, pa objava na GitHub Pages.
cd "$(dirname "$0")/.." || exit 1
node tools/geocode.js 2>&1 | tail -12
node tools/build-index.js || exit 1
git add -A
git diff --cached --quiet && { echo "nema promjena"; exit 0; }
git commit -qm "${1:-Update atlas content}

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" && git push -q && echo objavljeno
