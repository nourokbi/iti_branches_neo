# Flask GeoServer Proxy Backend

This simple Flask service lists GeoServer WFS layers and proxies WFS GetFeature to return GeoJSON. It’s designed for a beginner-friendly local setup without Docker.

## Endpoints

- GET /api/health
- GET /api/wfs/collections
- GET /api/wfs/items?typeName=workspace:layer&bbox=minx,miny,maxx,maxy&srsName=EPSG:4326&limit=500&cql=...

## Run locally (no Docker)

1. Create a Python virtual environment and install deps

```bash
python -m venv .venv
source .venv/Scripts/activate
pip install -r backend/requirements.txt
```

2. Configure environment

```bash
cp backend/.env.example backend/.env
# Edit backend/.env if needed (defaults use GeoServer at http://localhost:8085/geoserver)
```

3. Start the API

```bash
python backend/app.py
```

4. Test endpoints

- Health: http://localhost:8000/api/health
- List layers: http://localhost:8000/api/wfs/collections
- Get features: http://localhost:8000/api/wfs/items?typeName=workspace:layer&limit=50

## Frontend integration (Leaflet)

Call the API for WFS GeoJSON when you switch modes:

```js
const url = new URL("http://localhost:8000/api/wfs/items");
url.searchParams.set("typeName", "your_ws:your_layer");
url.searchParams.set("srsName", "EPSG:4326");
// Optional: add bbox, limit, cql
const data = await fetch(url).then((r) => r.json());
L.geoJSON(data).addTo(map);
```

## Notes

- CORS allows http://localhost:5173 by default (configurable via ALLOWED_ORIGINS).
- Timeouts use `REQUEST_TIMEOUT_SECONDS` (15s default).
- Keep your GeoServer admin credentials safe; only use what’s required for WFS.
