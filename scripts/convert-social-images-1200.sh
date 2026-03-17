#!/usr/bin/env bash
set -euo pipefail

SRC_DIR="public/social_images"
OUT_DIR="public/social_images_1200"

if ! command -v sips >/dev/null 2>&1; then
  echo "Error: sips is required on macOS but was not found." >&2
  exit 1
fi

if [[ ! -d "$SRC_DIR" ]]; then
  echo "Error: source directory '$SRC_DIR' does not exist." >&2
  exit 1
fi

mkdir -p "$OUT_DIR"

count=0
while IFS= read -r -d '' svg_file; do
  base_name="$(basename "$svg_file" .svg)"
  output_file="$OUT_DIR/${base_name}.png"

  # Convert SVG to PNG and set width to 1200px while preserving aspect ratio.
  sips -s format png "$svg_file" --resampleWidth 1200 --out "$output_file" >/dev/null

  echo "Created: $output_file"
  count=$((count + 1))
done < <(find "$SRC_DIR" -maxdepth 1 -type f -name '*.svg' -print0 | sort -z)

echo "Done. Converted $count SVG file(s) to 1200px-wide PNG in '$OUT_DIR'."
