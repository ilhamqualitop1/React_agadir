import { useRef, useState } from "react";
import * as toGeoJSON from "@tmcw/togeojson";
import proj4 from "proj4";
import { DOMParser } from "xmldom";
import DxfParser from "dxf-parser";
import "../../config/proj-config.js";

export default function FileImport({ onFileLoad, selectedProjection }) {
  const fileInputRef = useRef();
  const [dragActive, setDragActive] = useState(false);
  const [pendingImport, setPendingImport] = useState(null);
  const [renameModal, setRenameModal] = useState({
    open: false,
    value: "",
    defaultName: "",
  });

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

        if (geojson?.features?.length) {
          const bounds = computeBounds(geojson.features);
          const defaultName = file.name.replace(/\.[^/.]+$/, "");
          setPendingImport({ geojson, bounds });
          setRenameModal({ open: true, value: defaultName, defaultName });
          console.log("✅ GeoJSON généré :", geojson);
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

  const closeRenameModal = () => {
    setRenameModal({ open: false, value: "", defaultName: "" });
    setPendingImport(null);
  };

  const submitRename = (e) => {
    e.preventDefault();
    if (!pendingImport?.geojson) return;
    const finalName =
      (renameModal.value && renameModal.value.trim()) || renameModal.defaultName || "Fichier";

    const geojsonWithName = {
      ...pendingImport.geojson,
      name: finalName,
      features: pendingImport.geojson.features.map((feature) => ({
        ...feature,
        properties: {
          ...feature.properties,
          filename: finalName,
        },
      })),
    };

    onFileLoad(geojsonWithName, pendingImport.bounds);
    closeRenameModal();
  };

  const baseDropZone =
    "w-56 rounded-xl border-2 border-dashed px-4 py-3 text-sm transition shadow-sm bg-white/70 backdrop-blur";
  const activeDropZone =
    "border-brand-primary bg-brand-primary/10 text-brand-primary shadow-md shadow-brand-primary/10";

  return (
    <div
      className="absolute left-4 bottom-6 z-[1000] flex flex-col items-start gap-3"
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
        className="hidden"
      />
      <button
        className="inline-flex items-center gap-2 rounded-xl bg-white/90 px-4 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200 backdrop-blur transition hover:-translate-y-0.5 hover:shadow-xl"
        onClick={() => fileInputRef.current.click()}
        type="button"
      >
        <span className="text-lg">📂</span> Importer DXF, KML
      </button>
      <div
        className={`${baseDropZone} ${dragActive ? activeDropZone : "text-slate-600"}`}
      >
        Glissez un fichier ici
      </div>

      {renameModal.open && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-floating">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                  Import
                </p>
                <h3 className="text-xl font-bold text-slate-900">
                  Renommer le fichier importé
                </h3>
              </div>
              <button
                type="button"
                onClick={closeRenameModal}
                className="text-lg text-slate-500 transition hover:text-slate-800"
              >
                ×
              </button>
            </div>
            <form onSubmit={submitRename} className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700">
                Nom du fichier
              </label>
              <input
                value={renameModal.value}
                onChange={(e) =>
                  setRenameModal((prev) => ({ ...prev, value: e.target.value }))
                }
                autoFocus
                placeholder="Saisissez un nom lisible"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/15"
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeRenameModal}
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-primary px-4 py-3 text-sm font-semibold text-white shadow-md shadow-brand-primary/20 transition hover:-translate-y-0.5 hover:bg-brand-primaryDark"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
