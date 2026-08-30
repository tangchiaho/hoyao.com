#!/usr/bin/env bash
set -euo pipefail
RAW="${1:-/workspace/tmp/zhushan-raw}"
OUT="/workspace/assets/images/projects/zhushan"
mkdir -p "$OUT"

map_one() {
  local src="$1" dest="$2" long="$3" q="$4"
  [[ -n "$src" && -f "$src" ]] || return 1
  if (( $(identify -format "%w" "$src") > $(identify -format "%h" "$src") )); then
    convert "$src" -auto-orient -strip -resize "${long}x>" -quality 92 "$OUT/_tmp.jpg"
  else
    convert "$src" -auto-orient -strip -resize "x${long}>" -quality 92 "$OUT/_tmp.jpg"
  fi
  cwebp -q "$q" -m 6 "$OUT/_tmp.jpg" -o "$OUT/$dest"
  rm -f "$OUT/_tmp.jpg"
  echo "OK $dest $(identify -format '%wx%h' "$OUT/$dest")"
}

find_src() {
  local img="$1"
  find "$RAW" -type f \( -iname "*${img}*" \) 2>/dev/null | head -1
}

map_one "$(find_src IMG0212)" "process-01-bamboo-frame.webp" 1500 84 || true
map_one "$(find_src IMG0237)" "process-02-workshop.webp" 1500 84 || true
map_one "$(find_src IMG0294)" "process-03-handcraft.webp" 1500 84 || true
map_one "$(find_src IMG0312)" "process-04-preassembly.webp" 1600 84 || true
map_one "$(find_src IMG0592)" "process-05-ground-detail.webp" 1400 84 || true
map_one "$(find_src IMG0663)" "process-06-full-preassembly.webp" 1800 86 || true
map_one "$(find_src IMG0662)" "hero-preassembly.webp" 1800 86 || true
[[ -f "$OUT/hero-preassembly.webp" ]] || map_one "$(find_src IMG0663)" "hero-preassembly.webp" 1800 86 || true
map_one "$(find_src IMG0281)" "people-01.webp" 1400 84 || true
map_one "$(find_src IMG0610)" "bamboo-message-detail.webp" 1200 84 || true
map_one "$(find_src IMG0675)" "people-02.webp" 1400 84 || true
map_one "$(find_src IMG0442)" "site-entrance.webp" 1600 84 || true
[[ -f "$OUT/site-entrance.webp" ]] || map_one "$(find_src IMG0447)" "site-entrance.webp" 1600 84 || true
ls -la "$OUT"/*.webp 2>/dev/null || echo "No webp yet"
