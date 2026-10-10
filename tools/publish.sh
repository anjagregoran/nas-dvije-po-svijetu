#!/bin/sh
# Koordinate za nova mjesta, tražilica, pa objava na GitHub Pages.
cd "$(dirname "$0")/.." || exit 1
node tools/geocode.js 2>&1 | tail -12
for f in data/dodaci/*.js; do [ -f "$f" ] && { node -e "global.window={};require('./$f')" 2>/dev/null || { echo "neispravno, preskačem: $f"; mv "$f" "$f.bad"; }; }; done
node tools/build-index.js || exit 1
git add -A
git diff --cached --quiet && { echo "nema promjena"; exit 0; }
git commit -qm "${1:-Update atlas content}

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" && git push -q && echo objavljeno
