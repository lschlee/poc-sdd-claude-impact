#!/usr/bin/env bash
# Download OSM raster tiles for the pilot micro-area bounding box.
# Adjust BBOX and zoom levels to match the target micro-area before running.
# Requires: wget or curl. Rate-limited to respect OSM tile usage policy.

set -euo pipefail

# Bounding box: south,west,north,east (decimal degrees)
BBOX="${BBOX:-"-22.960,-43.200,-22.945,-43.180"}"
MIN_ZOOM="${MIN_ZOOM:-14}"
MAX_ZOOM="${MAX_ZOOM:-17}"
OUTPUT_DIR="${OUTPUT_DIR:-"public/tiles"}"
TILE_SERVER="${TILE_SERVER:-"https://tile.openstreetmap.org"}"

IFS=',' read -r SOUTH WEST NORTH EAST <<< "$BBOX"

deg2tile() {
  local lat=$1 lon=$2 zoom=$3
  python3 -c "
import math
lat, lon, zoom = $lat, $lon, $zoom
lat_r = math.radians(lat)
n = 2 ** zoom
x = int((lon + 180) / 360 * n)
y = int((1 - math.log(math.tan(lat_r) + 1/math.cos(lat_r)) / math.pi) / 2 * n)
print(x, y)
"
}

for zoom in $(seq "$MIN_ZOOM" "$MAX_ZOOM"); do
  read -r x_min y_min <<< "$(deg2tile "$NORTH" "$WEST" "$zoom")"
  read -r x_max y_max <<< "$(deg2tile "$SOUTH" "$EAST" "$zoom")"

  for x in $(seq "$x_min" "$x_max"); do
    for y in $(seq "$y_min" "$y_max"); do
      dir="$OUTPUT_DIR/$zoom/$x"
      file="$dir/$y.png"
      if [[ ! -f "$file" ]]; then
        mkdir -p "$dir"
        wget -q -O "$file" "$TILE_SERVER/$zoom/$x/$y.png" || \
          curl -s -o "$file" "$TILE_SERVER/$zoom/$x/$y.png"
        sleep 0.1
      fi
    done
  done
done

echo "Tiles downloaded to $OUTPUT_DIR"
