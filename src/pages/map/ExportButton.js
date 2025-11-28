import React from "react";
import { useMap } from "react-leaflet";
import axios from "axios";
import { saveAs } from "file-saver";

export default function ExportButton() {
  const map = useMap();

  const handleExport = async (format) => {
    if (!map) {
      alert("🕐 La carte n’est pas encore prête.");
      return;
    }

    // ✅ Récupération de toutes les couches
    const layers = [];
    map.eachLayer((layer) => {
      if (layer.toGeoJSON) {
        try {
          const json = layer.toGeoJSON();
          if (json.type === "FeatureCollection") {
            layers.push(...json.features);
          } else if (json.type === "Feature") {
            layers.push(json);
          }
        } catch (err) {
          console.warn("Erreur toGeoJSON:", err);
        }
      }
    });

    if (layers.length === 0) {
      alert("❌ Aucune couche à exporter !");
      return;
    }

    const geojson = {
      type: "FeatureCollection",
      features: layers,
    };

    try {
      const response = await axios.post(
        `http://localhost:5050/api/export?format=${format}`,
        geojson,
        { responseType: "blob" }
      );

      const blob = new Blob([response.data]);
      saveAs(blob, `exported.${format}`);
    } catch (error) {
      console.error("Erreur lors de l’export :", error);
      alert("❌ Erreur lors de l’export : " + error.message);
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        bottom: "145px", // 🔽 placé juste au-dessus du bouton Import
        left: "10px",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        gap: "6px",
      }}
    >
      {/* <button
        onClick={() => handleExport("dxf")}
        style={{
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          padding: "6px 10px",
          cursor: "pointer",
          fontSize: "14px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
        }}
      >
        📤 Exporter DXF
      </button> */}

      <button
        onClick={() => handleExport("kml")}
        style={{
          backgroundColor: "rgb(231, 233, 236)",
          color: "rgb(80, 82, 85)",
          border: "none",
          borderRadius: "5px",
          padding: "6px 10px",
          cursor: "pointer",
          fontSize: "14px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
        }}
      >
        🌍 Exporter KML
      </button>
    </div>
  );
}
