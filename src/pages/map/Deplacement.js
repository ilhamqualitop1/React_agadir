import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-path-drag";

const Deplacement = ({ data, isDraggable, onGeometriesUpdated }) => {
  const map = useMap();
  const updatedFeaturesRef = useRef([]);

  useEffect(() => {
    if (!data || !map) return;

    const layerGroup = new L.FeatureGroup();

    data.features.forEach((feature, index) => {
      const { geometry, properties, id } = feature;
      let layer = null;

      // ✅ Cas Point
      if (geometry.type === "Point") {
        const latlng = L.latLng(geometry.coordinates[1], geometry.coordinates[0]);
        layer = L.marker(latlng, { draggable: isDraggable });

        if (isDraggable) {
          layer.on("dragend", (e) => {
            const { lat, lng } = e.target.getLatLng();
            const updated = {
              type: "Feature",
              id: id || properties?.id,
              geometry: {
                type: "Point",
                coordinates: [lng, lat],
              },
              properties: properties || {},
            };
            updatedFeaturesRef.current[index] = updated;
            const merged = data.features.map((f, i) => updatedFeaturesRef.current[i] || f);
            onGeometriesUpdated({ type: "FeatureCollection", features: merged });
          });
        }
      }

      // ✅ Cas Polygon ou LineString
      else if (geometry.type === "Polygon" || geometry.type === "LineString") {
        layer = L.geoJSON(feature);
        const shape = layer.getLayers()[0];

        if (isDraggable && shape) {
          if (!shape.dragging) {
            shape.dragging = new L.Handler.PathDrag(shape);
            shape.dragging.enable();
          }

          shape.on("dragend", () => {
            const updated = shape.toGeoJSON();
            updated.id = id || properties?.id;
            updated.properties = properties || {};
            updatedFeaturesRef.current[index] = updated;
            const merged = data.features.map((f, i) => updatedFeaturesRef.current[i] || f);
            onGeometriesUpdated({ type: "FeatureCollection", features: merged });
          });
        }
      }

      if (layer) layer.addTo(layerGroup);
    });

    layerGroup.addTo(map);

    return () => {
      map.removeLayer(layerGroup);
    };
  }, [data, isDraggable, map, onGeometriesUpdated]);

  return null;
};

export default Deplacement;
