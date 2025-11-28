import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from "react-leaflet";
import { INITIAL_CENTER, INITIALZOOM } from "../../utils/contant";
import MapHeader from "../../components/map/map-header";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SearchLocation from "../../components/search/SearchLocation";
import ZoomInitialControl from "../../components/ZoomInitialControl";
import UserLocation from "../../components/UserLocation";
import FileImport from "../../components/fileImport/FileImport";
import SelectionTable from "../../components/selectionTable/SelectionTable";
import DrawingTools from "../../components/drawingTools/DrawingTools";
import L from "leaflet";
import RechercheAvancee from "../../components/modal/RechercheAvancee";
import "../../config/proj-config";
import { iconMap } from "../../config/icon-config";
import SearchPoint from "../../components/search/SearchPoint";
// import ClusterLayer from "./ClusterLayer";
import Deplacement from "./Deplacement";
import ExportButton from "./ExportButton";
// import Parcelles from "./parcellesService.js";

const FitToImportedLayers = ({ layers }) => {
  const map = useMap();

  useEffect(() => {
    const visibleLayers = layers.filter(
      (layer) => layer.visible && layer.data?.features?.length > 0
    );
    if (!visibleLayers.length) return;

    const allBounds = visibleLayers.reduce((acc, layer) => {
      if (!layer.data) return acc;
      const geojsonLayer = L.geoJSON(layer.data);
      const bounds = geojsonLayer.getBounds();
      if (bounds.isValid()) acc.push(bounds);
      return acc;
    }, []);

    if (allBounds.length > 0) {
      const combinedBounds = allBounds.reduce((acc, b) => acc.extend(b), allBounds[0]);
      map.fitBounds(combinedBounds, { padding: [30, 30] });
    }
  }, [layers, map]);

  return null;
};

export default function MapPage() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role"); // récupérer le rôle stocké

  const [selectedProjection, setSelectedProjection] = useState("EPSG:26192");
  const [searchTitre, setSearchTitre] = useState("");
  const [searchTrigger, setSearchTrigger] = useState("");
  const [importedLayers, setImportedLayers] = useState([]);
  const [rechercheResult, setRechercheResult] = useState(null);
  const [openSearch, setOpenSearch] = useState(false);
  const [isDraggable, setIsDraggable] = useState(false);
  const mapRef = useRef(null);
  const [savedFiles, setSavedFiles] = useState([]);
  const [showSavedFiles, setShowSavedFiles] = useState(false);
  const [updatedData, setUpdatedData] = useState(null);
  const [originalLayers, setOriginalLayers] = useState([]);
  const [renameModal, setRenameModal] = useState({
    open: false,
    layerId: null,
    value: "",
  });

  const apiUrl = process.env.geo_portail_API_URL;

  const handleSearch = () => {
    setSearchTrigger(searchTitre);
    setSearchTitre("");
    setRechercheResult(null);
  };

  const handleRechercheAvancee = async (criteres) => {
    try {
      const params = new URLSearchParams(criteres).toString();
      const res = await fetch(`${apiUrl}/api/recherche-fonciere?${params}`);
      const data = await res.json();
      let resultData = data;

      if (data?.feature && !data.features) {
        resultData = { type: "FeatureCollection", features: [data.feature] };
      }

      if (resultData?.features?.length > 0) {
        const props = resultData.features[0].properties;
        if (props?.nvtitre) setSearchTrigger(props.nvtitre);
        setRechercheResult(resultData);
      } else {
        alert("❌ Aucun résultat trouvé");
        setRechercheResult(null);
      }
    } catch (error) {
      console.error("Erreur recherche avancée :", error);
    }
  };

  useEffect(() => {
    if (rechercheResult && mapRef.current) {
      const layer = L.geoJSON(rechercheResult);
      const bounds = layer.getBounds();
      if (bounds.isValid()) {
        mapRef.current.fitBounds(bounds, { padding: [30, 30] });
      }
    }
  }, [rechercheResult]);

  const handleFileLoad = (geojson) => {
    const layerId = Date.now().toString();
    const layerName =
      geojson.name ||
      geojson?.features?.[0]?.properties?.name ||
      `Couche ${importedLayers.length + 1}`;
    const newLayer = { id: layerId, name: layerName, data: geojson, visible: true };
    setImportedLayers((prev) => [...prev, newLayer]);
    setOriginalLayers((prev) => [...prev, newLayer]);
    setRechercheResult(null);
  };

  const toggleLayerVisibility = (id) => {
    setImportedLayers((prev) =>
      prev.map((layer) =>
        layer.id === id ? { ...layer, visible: !layer.visible } : layer
      )
    );
  };

  const deleteLayer = (id) => {
    setImportedLayers((prev) => prev.filter((layer) => layer.id !== id));
  };

  const openRenameModal = (layer) => {
    setRenameModal({
      open: true,
      layerId: layer.id,
      value: layer.name || "",
    });
  };

  const closeRenameModal = () =>
    setRenameModal({ open: false, layerId: null, value: "" });

  const submitRename = (e) => {
    e.preventDefault();
    const newName = renameModal.value.trim();
    if (!newName) return;

    setImportedLayers((prev) =>
      prev.map((layer) =>
        layer.id === renameModal.layerId ? { ...layer, name: newName } : layer
      )
    );
    closeRenameModal();
  };

  const fetchSavedFiles = async () => {
    try {
      const res = await fetch("http://localhost:5050/api/geojson/liste-fichiers");
      const data = await res.json();
      setSavedFiles(data);
      setShowSavedFiles(true);
    } catch (err) {
      console.error("Erreur récupération fichiers sauvegardés :", err);
    }
  };

  return (
    <>
      {role === "admin" && (
        <div className="absolute right-4 bottom-20 z-[1000]">
          <button
            onClick={() => navigate("/dashboard/users")}
            className="rounded-xl bg-brand-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-primary/20 transition hover:-translate-y-0.5 hover:bg-brand-primaryDark"
          >
            Gestion des utilisateurs
          </button>
        </div>
      )}

      {/* 🔹 Carte Leaflet */}
      <MapContainer
        center={INITIAL_CENTER}
        zoom={INITIALZOOM}
        style={{ height: "100vh", width: "100%", position: "relative", zIndex: 0 }}
        maxZoom={22}
        whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <MapHeader
          onSetProjection={setSelectedProjection}
          selectedProjection={selectedProjection}
          title={searchTitre}
          onSetTitle={setSearchTitre}
          onSearch={handleSearch}
          onSetOpen={setOpenSearch}
          searchTrigger={searchTrigger}
        />
        <DrawingTools selectedProjection={selectedProjection} />
        <SearchLocation />
        <ZoomInitialControl initialCenter={INITIAL_CENTER} initialZoom={INITIALZOOM} />
        <UserLocation />
        <FileImport onFileLoad={handleFileLoad} selectedProjection={selectedProjection} />
        <SearchPoint selectedProjection={selectedProjection} />
        {/*<ClusterLayer />*/}
        {/* <Parcelles /> */}
        <ExportButton />
        <FitToImportedLayers layers={importedLayers} />

        {/* couches importées */}
        {importedLayers
          .filter((layer) => layer.visible && layer.data?.features?.length > 0)
          .flatMap((layer, layerIdx) =>
            layer.data.features.flatMap((feature, featIdx) => {
              if (!feature || !feature.geometry) return [];
              const { geometry, properties } = feature;
              const keyId =
                feature.id || properties?.id || `${layer.id}-${featIdx}-${layerIdx}`;

              if (geometry.type === "Point") {
                const [lng, lat] = geometry.coordinates;
                return (
                  <Marker key={`pt-${keyId}`} position={[lat, lng]} icon={iconMap}>
                    <Popup>
                      <pre>{JSON.stringify(properties, null, 2)}</pre>
                    </Popup>
                  </Marker>
                );
              }

              if (geometry.type === "MultiPoint") {
                return geometry.coordinates.map((coord, i) => {
                  const [lng, lat] = coord;
                  return (
                    <Marker key={`mp-${keyId}-${i}`} position={[lat, lng]}>
                      <Popup>
                        <pre>{JSON.stringify(properties, null, 2)}</pre>
                      </Popup>
                    </Marker>
                  );
                });
              }

              return (
                <GeoJSON
                  key={`geo-${keyId}`}
                  data={feature}
                  style={{ color: "blue", weight: 2, opacity: 0.8, fillOpacity: 0.2 }}
                  onEachFeature={(feat, lyr) => {
                    lyr.bindPopup(
                      `<pre>${JSON.stringify(feat.properties, null, 2)}</pre>`
                    );
                  }}
                />
              );
            })
          )}

        {!rechercheResult && <SelectionTable selectedProjection={selectedProjection} />}

        {rechercheResult?.features?.length > 0 && (
          <GeoJSON
            data={rechercheResult}
            style={{ color: "green" }}
            onEachFeature={(feature, layer) => {
              layer.bindPopup(
                `<pre>${JSON.stringify(feature.properties, null, 2)}</pre>`
              );
            }}
          />
        )}

        {isDraggable &&
          importedLayers
            .filter((layer) => layer.visible && layer.data)
            .map((layer, idx) => (
              <Deplacement
                key={`deplacement-${layer.id}-${idx}`}
                data={layer.data}
                isDraggable={true}
                onGeometriesUpdated={(updatedGeojson) => {
                  setImportedLayers((prev) =>
                    prev.map((l) =>
                      l.id === layer.id ? { ...l, data: updatedGeojson } : l
                    )
                  );
                  setUpdatedData(updatedGeojson);
                }}
              />
            ))}
      </MapContainer>

      {/* panel couches importées */}
      {importedLayers.length > 0 && (
        <div className="absolute right-4 bottom-6 z-[1000] w-80 rounded-2xl bg-white p-4 shadow-floating ring-1 ring-slate-100 backdrop-blur">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                Couches
              </p>
              <strong className="text-slate-900">📂 Couches importées</strong>
            </div>
            <button
              onClick={() => setIsDraggable((prev) => !prev)}
              className={`rounded-full px-3 py-2 text-xs font-semibold text-white shadow-md transition ${isDraggable
                ? "bg-amber-500 shadow-amber-200"
                : "bg-emerald-600 shadow-emerald-200"
                }`}
            >
              {isDraggable ? "Déplacement ON" : "Déplacement OFF"}
            </button>
          </div>

          <div className="space-y-2">
            {importedLayers.map((layer, idx) => (
              <div
                key={`layerpanel-${layer.id}-${idx}`}
                className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
              >
                <input
                  type="checkbox"
                  checked={layer.visible}
                  onChange={() => toggleLayerVisibility(layer.id)}
                  className="h-4 w-4 accent-brand-primary"
                />
                <span className="flex-grow text-sm font-semibold text-slate-800">
                  {layer.name}
                </span>
                <button
                  onClick={() => openRenameModal(layer)}
                  className="rounded-lg bg-blue-500 px-2 py-1 text-xs text-white shadow-sm transition hover:bg-blue-600"
                  title="Renommer"
                >
                  ✏️
                </button>
                <button
                  onClick={() => deleteLayer(layer.id)}
                  className="rounded-lg bg-red-500 px-2 py-1 text-xs text-white shadow-sm transition hover:bg-red-600"
                  title="Supprimer"
                >
                  ❌
                </button>
              </div>
            ))}
          </div>

          {/* boutons enregistrer / annuler / charger */}
          <div className="mt-4 space-y-2">
            <button
              onClick={async () => {
                try {
                  if (!originalLayers.length) {
                    alert("❌ Aucun fichier à enregistrer.");
                    return;
                  }

                  for (const original of originalLayers) {
                    if (!original.data?.features?.length) continue;

                    const updatedFeatures =
                      updatedData?.features || original.data.features;

                    const finalGeojson = {
                      type: "FeatureCollection",
                      name: `${original.name}_déplacé`,
                      features: updatedFeatures.map((f) => ({
                        ...f,
                        properties: {
                          ...f.properties,
                          name: `${original.name}_déplacé`,
                        },
                      })),
                    };

                    const res = await fetch(
                      "http://localhost:5050/api/geojson/enregistrer-multiples",
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          fileName: finalGeojson.name,
                          features: finalGeojson.features,
                        }),
                      }
                    );

                    if (!res.ok) {
                      const text = await res.text();
                      console.error("Erreur serveur:", text);
                      alert("❌ Erreur serveur à l'enregistrement (voir console).");
                      return;
                    }

                    alert(
                      `✅ Le fichier "${finalGeojson.name}" a été enregistré (${finalGeojson.features.length} entités).`
                    );
                  }

                  setUpdatedData(null);
                } catch (err) {
                  console.error("❌ Erreur d'enregistrement :", err);
                  alert("❌ Erreur serveur");
                }
              }}
              className="w-full rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-200 transition hover:-translate-y-0.5 hover:bg-emerald-700"
            >
              💾 Enregistrer dans la base
            </button>

            <button
              onClick={() => {
                setImportedLayers(originalLayers);
                setUpdatedData(null);
                alert("✅ Déplacements annulés, données restaurées.");
              }}
              className="w-full rounded-xl bg-slate-600 px-3 py-2 text-sm font-semibold text-white shadow-md shadow-slate-200 transition hover:-translate-y-0.5 hover:bg-slate-700"
            >
              🔁 Annuler les déplacements
            </button>

            <button
              onClick={fetchSavedFiles}
              className="w-full rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700"
            >
              📥 Charger depuis la base
            </button>
          </div>
        </div>
      )}

      {/* liste fichiers sauvegardés */}
      {showSavedFiles && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-floating ring-1 ring-slate-100">
            <div className="mb-4 flex items-center justify-between">
              <strong className="text-lg text-slate-900">📁 Fichiers sauvegardés</strong>
              <button
                onClick={() => setShowSavedFiles(false)}
                className="text-lg text-slate-500 transition hover:text-slate-800"
                title="Fermer"
              >
                ❌
              </button>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="min-w-full text-sm text-slate-800">
                <thead className="bg-slate-50 text-left">
                  <tr>
                    <th className="px-4 py-2 font-semibold">Nom</th>
                    <th className="px-4 py-2 text-center font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {savedFiles.map((file, idx) => (
                    <tr
                      key={`savedfile-${file.file_name}-${idx}`}
                      className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}
                    >
                      <td className="px-4 py-2">{file.file_name}</td>
                      <td className="px-4 py-2 text-center">
                        <button
                          onClick={async () => {
                            const res = await fetch(
                              `http://localhost:5050/api/geojson/liste-fichiers/${file.file_name}`
                            );
                            const geojson = await res.json();
                            handleFileLoad(geojson);
                            setShowSavedFiles(false);
                          }}
                          className="rounded-lg bg-brand-primary px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-primaryDark"
                        >
                          Charger
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {renameModal.open && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-floating ring-1 ring-slate-100">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                  Couche
                </p>
                <h3 className="text-xl font-bold text-slate-900">Renommer la couche</h3>
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
                Nom de la couche
              </label>
              <input
                value={renameModal.value}
                onChange={(e) =>
                  setRenameModal((prev) => ({ ...prev, value: e.target.value }))
                }
                autoFocus
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

      <RechercheAvancee
        onSearch={handleRechercheAvancee}
        isOpen={openSearch}
        onClose={() => setOpenSearch(false)}
      />
    </>
  );
}
