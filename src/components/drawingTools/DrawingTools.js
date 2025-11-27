import React, { useState, useRef } from "react";
import { FeatureGroup, useMap } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import L from "leaflet";
import "./DrawingTools.css";
import { calculateDistance, calculatePolygonMetrics } from "../../utils/calculations";
import { convertCoordinates } from "../../config/convertCoordinates.js"
import SelectionTable from "../selectionTable/SelectionTable";
import { iconMap } from "../../config/icon-config";

export default function DrawingTools({ selectedProjection }) {
  const [coordinates, setCoordinates] = useState([]);
  const featureGroupRef = useRef(null);
  const [showTable, setShowTable] = useState(false);
  const map = useMap();

  const handleDrawCreate = (e) => {
    const layer = e.layer;
    let newCoordinates = [];
    let type = "";
    let metrics = {};

    if (!layer) {
      console.error("❌ Erreur : Aucun objet de dessin détecté !");
      return;
    }

    if (layer instanceof L.Polygon || layer instanceof L.Polyline) {
      type = layer instanceof L.Polygon ? "Polygone" : "Ligne";
      let latLngs = layer.getLatLngs();

      if (!latLngs || latLngs.length === 0) {
        console.error(`⚠️ Erreur : Aucune coordonnée trouvée pour le ${type} !`);
        return;
      }

      if (Array.isArray(latLngs[0])) {
        latLngs = latLngs[0];
      }

      newCoordinates = processCoordinates(latLngs);
      metrics =
        type === "Polygone"
          ? calculatePolygonMetrics(newCoordinates, selectedProjection)
          : { distance: calculateDistance(newCoordinates, selectedProjection) };

      // Zoom sur la forme
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (layer instanceof L.Marker) {
      type = "Point";
      const latLng = layer.getLatLng();
      if (!latLng) {
        console.error("Impossible de récupérer les coordonnées du point !");
        return;
      }

      newCoordinates = processCoordinates([latLng]);
      map.setView(latLng, 17); // Centrage sur le point
    }

    if (!Array.isArray(newCoordinates) || newCoordinates.length === 0) {
      console.error("Erreur : Aucune coordonnée valide trouvée !");
      return;
    }

    console.log(
      "🌍 Avant conversion - WGS84:",
      formatCoordsLog(newCoordinates, true)
    );
    console.log(
      "📌 Après conversion -",
      selectedProjection,
      formatCoordsLog(newCoordinates, false)
    );
    
    const newShape = {
      id: layer._leaflet_id,
      type,
      coords: newCoordinates,
      ...metrics,
    };

    setCoordinates((prev) => [...prev, newShape]);
    setShowTable(true);
    featureGroupRef.current?.addLayer(layer);
  };

  const processCoordinates = (latLngs) => {
    if (!Array.isArray(latLngs)) {
      console.error("Données de coordonnées invalides :", latLngs);
      return [];
    }
    return latLngs
      .map((latlng) => {
        if (
          !latlng ||
          typeof latlng.lat !== "number" ||
          typeof latlng.lng !== "number"
        ) {
          console.warn("⚠️ Coordonnée invalide détectée :", latlng);
          return null;
        }

        const converted = convertCoordinates(
          { lat: latlng.lat, lng: latlng.lng },
          selectedProjection
        );
        return converted.x !== null && converted.y !== null
          ? {
              originalLat: latlng.lat,
              originalLng: latlng.lng,
              x: converted.x,
              y: converted.y,
            }
          : null;
      })
      .filter(Boolean);
  };

  const formatCoordsLog = (coords, isOriginal) => {
    return coords.map((c) =>
      isOriginal ? `(${c.originalLat}, ${c.originalLng})` : `(${c.x}, ${c.y})`
    );
  };

  const handleDeletePoint = (shapeId, pointIndex) => {
    setCoordinates((prev) => {
      const updatedShapes = prev
        .map((shape) => {
          if (shape.id === shapeId) {
            const updatedCoords = shape.coords.filter(
              (_, index) => index !== pointIndex
            );
            return updatedCoords.length
              ? { ...shape, coords: updatedCoords }
              : null;
          }
          return shape;
        })
        .filter(Boolean);

      setShowTable(updatedShapes.length > 0);
      return updatedShapes;
    });

    featureGroupRef.current?.eachLayer((layer) => {
      if (layer._leaflet_id === shapeId) {
        featureGroupRef.current.removeLayer(layer);
      }
    });
  };

  const clearSelection = () => {
    setCoordinates([]);
    featureGroupRef.current?.clearLayers();
    setShowTable(false);
  };

  return (
    <div>
      <FeatureGroup ref={featureGroupRef}>
        <EditControl
          position="topleft"
          draw={{
            polygon: { shapeOptions: { color: "#f357a1" } },
            polyline: { shapeOptions: { color: "#f357a1" } },
            marker: {
              icon: iconMap,
            },
            circle: false,
            circlemarker: false,
          }}
          onCreated={handleDrawCreate}
        />
      </FeatureGroup>

      {showTable && coordinates.length > 0 && (
        <SelectionTable
          coordinates={coordinates}
          onClear={clearSelection}
          onDeletePoint={handleDeletePoint}
          selectedProjection={selectedProjection}
        />
      )}
    </div>
  );
}
