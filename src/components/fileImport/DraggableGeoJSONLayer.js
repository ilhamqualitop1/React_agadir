
import { useEffect, useRef } from "react";
import { GeoJSON, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-path-drag";

export default function DraggableGeoJSONLayer({ geojson, onUpdate }) {
  const map = useMap();
  const layerRef = useRef();

  useEffect(() => {
    if (!geojson || !geojson.features) return;

    // Nettoyage ancien layer
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
    }

    const newLayer = L.geoJSON(geojson, {
      onEachFeature: (feature, layer) => {
        const { type } = feature.geometry;

        // Activer le drag pour Point
        if (type === "Point") {
          const marker = L.marker(layer.getLatLng(), { draggable: true });
          marker.on("dragend", () => {
            const latlng = marker.getLatLng();
            const updatedFeature = {
              ...feature,
              geometry: {
                type: "Point",
                coordinates: [latlng.lng, latlng.lat],
              },
            };
            onUpdate(updatedFeature);
          });
          marker.addTo(map);
        }

        // Activer drag pour Polygones / Lignes
        else if (type === "Polygon" || type === "LineString") {
          layer.dragging && layer.dragging.enable();
          layer.on("dragend", () => {
            const latlngs = layer.getLatLngs();
            const coords = (type === "Polygon"
              ? latlngs[0]
              : latlngs
            ).map((latlng) => [latlng.lng, latlng.lat]);

            const updatedFeature = {
              ...feature,
              geometry: {
                type: type,
                coordinates: type === "Polygon" ? [coords] : coords,
              },
            };
            onUpdate(updatedFeature);
          });
        }
      },
    });

    layerRef.current = newLayer;
    newLayer.addTo(map);
  }, [geojson, map, onUpdate]);

  return null;
}
