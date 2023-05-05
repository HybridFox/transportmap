# setup

## 1. Setup OSRM data
### download OSRM data from Geofabrik.
_We are using the belgium map here, feel free to switch out to any version._
```bash
curl http://download.geofabrik.de/europe/belgium-latest.osm.pbf --output ./osm/map-data/map.osm.pbf
```

### extract, partition and customize map data
```bash
docker run -t -v "${PWD}/osm:/data" ghcr.io/project-osrm/osrm-backend osrm-extract -p /data/profiles/train.lua /data/map-data/map.osm.pbf
docker run -t -v "${PWD}/osm:/data" ghcr.io/project-osrm/osrm-backend osrm-partition /data/map-data/map.osm.pbf
docker run -t -v "${PWD}/osm:/data" ghcr.io/project-osrm/osrm-backend osrm-customize /data/map-data/map.osm.pbf
```

## 2. Start application
```bash
docker compose up
```