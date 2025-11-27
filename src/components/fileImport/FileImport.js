import { useRef, useState } from "react";
import * as toGeoJSON from "@tmcw/togeojson";
import proj4 from "proj4";
import { DOMParser } from "xmldom";
import DxfParser from "dxf-parser";
import "../../config/proj-config.js";

export default function FileImport({ onFileLoad, selectedProjection }) {
  const fileInputRef = useRef();
  const [dragActive, setDragActive] = useState(false);

  const convertToWGS84 = ([x, y]) => {
    if (!selectedProjection || !proj4.defs[selectedProjection]) {
      console.warn("❗ Projection non définie ou inconnue. Utilisation brute des coordonnées.");
      return [x, y];
    }
    return proj4(selectedProjection, "EPSG:4326", [x, y]);
  };

  const computeBounds = (features) => {
    const coords = features.flatMap((f) =>
      f.geometry.type === "Point"
        ? [f.geometry.coordinates]
        : f.geometry.coordinates.flat(Infinity)
    );
    const lons = coords.map((c) => c[0]);
    const lats = coords.map((c) => c[1]);
    return [[Math.min(...lats), Math.min(...lons)], [Math.max(...lats), Math.max(...lons)]];
  };

  const isRingClosed = (coords) => {
    if (!coords || coords.length < 3) return false;
    const [x1, y1] = coords[0];
    const [x2, y2] = coords[coords.length - 1];
    const tolerance = 1e-6;
    return Math.abs(x1 - x2) < tolerance && Math.abs(y1 - y2) < tolerance;
  };

  const handleFile = async (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const extension = file.name.split(".").pop().toLowerCase();
        const content = e.target.result;
        let geojson = null;

        if (["kml", "gpx"].includes(extension)) {
          const xml = new DOMParser().parseFromString(content, "text/xml");
          geojson = toGeoJSON[extension](xml);
        } else if (["geojson", "json"].includes(extension)) {
          geojson = JSON.parse(content);
        } else if (extension === "dxf") {
          const parser = new DxfParser();
          const dxf = parser.parseSync(content);

          geojson = {
            type: "FeatureCollection",
            features: dxf.entities
              .map((ent) => {
                let positions = ent?.vertices || (ent?.position ? [ent.position] : null);
                if (!positions) return null;

                const coords = positions.map(({ x, y }) => convertToWGS84([x, y]));

                if (ent.type === "LINE") {
                  return {
                    type: "Feature",
                    properties: { layer: ent.layer },
                    geometry: { type: "LineString", coordinates: coords },
                  };
                } else if (ent.type === "LWPOLYLINE" || ent.type === "POLYLINE") {
                  const isClosed = ent.closed || isRingClosed(coords);
                  if (isClosed && !isRingClosed(coords)) coords.push(coords[0]);
                  return {
                    type: "Feature",
                    properties: { layer: ent.layer },
                    geometry: isClosed
                      ? { type: "Polygon", coordinates: [coords] }
                      : { type: "LineString", coordinates: coords },
                  };
                } else {
                  return {
                    type: "Feature",
                    properties: { layer: ent.layer },
                    geometry: { type: "Point", coordinates: coords[0] },
                  };
                }
              })
              .filter(Boolean),
          };
        }

        if (geojson) {
          const bounds = computeBounds(geojson.features);
          const defaultName = file.name.replace(/\.[^/.]+$/, "");
          const customName = window.prompt("Renommer le fichier importé :", defaultName) || defaultName;

          geojson.name = customName;
          geojson.features = geojson.features.map((feature) => ({
            ...feature,
            properties: {
              ...feature.properties,
              filename: customName,
            },
          }));

          console.log("✅ GeoJSON généré :", geojson);
          onFileLoad(geojson, bounds);
        } else {
          console.error("❌ Format non pris en charge");
        }
      } catch (err) {
        console.error("❌ Erreur d'importation :", err);
      }
    };

    reader.readAsText(file);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      className={`file-import-control ${dragActive ? "drag-active" : ""}`}
      onDragEnter={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setDragActive(false);
      }}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept=".dxf,.kml,.gpx,.csv,.geojson,.json"
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: "none" }}
      />
      <button className="button-import" onClick={() => fileInputRef.current.click()}>
        📂 Importer DXF, KML
      </button>
      <div className="drop-zone">ou glissez un fichier ici</div>

      <style>{`
        .file-import-control {
          position: absolute;
          top: 550px;
          left: 10px;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }

        .button-import {
          background-color: rgb(231, 233, 236);
          color: rgb(80, 82, 85);
          font-weight: 600;
          padding: 10px 16px;
          border: none;
          border-radius: 8px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .button-import:hover {
          background-color: rgb(221, 226, 236);
        }

        .drop-zone {
          padding: 10px 16px;
          border: 2px dashed #999;
          border-radius: 8px;
          background-color: #f9f9f9;
          text-align: center;
          font-size: 14px;
          color: #555;
          width: 220px;
        }

        .file-import-control.drag-active .drop-zone {
          border-color: #3f51b5;
          background-color: #e3f2fd;
          color: #1a237e;
        }
      `}</style>
    </div>
  );
}
