#!/usr/bin/env bash
# regen-sitemap.sh — regenerate sitemap.xml from the current state of the site.
#
# How it works:
#   - Main pages (index, about, audit, methodology, field-notes/index) get
#     today's date as <lastmod> — they don't carry a publish date.
#   - Field-note articles get their date from the visible byline. Until Batch 2
#     lands `<time datetime="YYYY-MM-DD">` wrappers, this script falls back to
#     parsing the "Mon D · YYYY" pattern inside `<div class="byline-date">`.
#
# Usage:
#   cd /path/to/cmprssn-website-v6
#   bash scripts/regen-sitemap.sh > sitemap.xml
#
# Requires: bash, grep, sed, awk, date (BSD or GNU).

set -euo pipefail

HOST="https://www.cmprssn.xyz"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TODAY="$(date -u +%Y-%m-%d)"

# Convert "May 4 · 2026" → "2026-05-04". Returns empty on failure.
to_iso_date() {
  local raw="$1"
  # Strip the middle dot and any extra whitespace.
  raw="$(echo "$raw" | sed 's/·//g' | tr -s ' ')"
  # Try `date` parsing (works on both BSD and GNU).
  if date -j -f "%b %d %Y" "$raw" "+%Y-%m-%d" >/dev/null 2>&1; then
    date -j -f "%b %d %Y" "$raw" "+%Y-%m-%d"
  elif date -d "$raw" "+%Y-%m-%d" >/dev/null 2>&1; then
    date -d "$raw" "+%Y-%m-%d"
  else
    echo ""
  fi
}

# Extract publish date from a field-notes article.
# Priority: <time datetime="..."> (Batch 2+), then byline-date span.
extract_date() {
  local file="$1"
  local iso=""

  iso="$(grep -oE '<time[^>]*datetime="[0-9]{4}-[0-9]{2}-[0-9]{2}"' "$file" \
        | head -n1 | sed -E 's/.*datetime="([0-9-]+)".*/\1/')"
  if [[ -n "$iso" ]]; then
    echo "$iso"
    return
  fi

  local raw
  raw="$(awk '/byline-date/,/<\/div>/' "$file" \
        | grep -oE '[A-Z][a-z]{2,3} [0-9]{1,2} · [0-9]{4}' \
        | head -n1)"
  to_iso_date "$raw"
}

emit_url() {
  local loc="$1" lastmod="$2" prio="${3:-0.7}" cf="${4:-}"
  echo "  <url>"
  echo "    <loc>${loc}</loc>"
  echo "    <lastmod>${lastmod}</lastmod>"
  [[ -n "$cf" ]] && echo "    <changefreq>${cf}</changefreq>"
  echo "    <priority>${prio}</priority>"
  echo "  </url>"
}

cat <<HEAD
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <!-- Main pages -->
HEAD

emit_url "${HOST}/"                  "$TODAY" "1.0" "monthly"
emit_url "${HOST}/methodology.html"  "$TODAY" "0.9" "monthly"
emit_url "${HOST}/audit.html"        "$TODAY" "0.9" "monthly"
emit_url "${HOST}/about.html"        "$TODAY" "0.7" "monthly"

# Field-notes index lastmod = newest article date.
newest=""
for f in "$ROOT"/field-notes/*.html; do
  base="$(basename "$f")"
  [[ "$base" == "index.html" ]] && continue
  d="$(extract_date "$f")"
  if [[ -n "$d" ]] && [[ "$d" > "$newest" ]]; then
    newest="$d"
  fi
done
[[ -z "$newest" ]] && newest="$TODAY"
emit_url "${HOST}/field-notes/" "$newest" "0.8" "weekly"

echo ""
echo "  <!-- Field notes (newest first) -->"

# Build list of (date, slug) pairs, sort by date desc, emit.
tmp="$(mktemp)"
for f in "$ROOT"/field-notes/*.html; do
  base="$(basename "$f")"
  [[ "$base" == "index.html" ]] && continue
  d="$(extract_date "$f")"
  [[ -z "$d" ]] && d="$TODAY"
  echo "${d}|${base}" >> "$tmp"
done

sort -r "$tmp" | while IFS='|' read -r date slug; do
  emit_url "${HOST}/field-notes/${slug}" "$date" "0.7"
done

rm -f "$tmp"

cat <<TAIL

</urlset>
TAIL
