import { useState } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import proj4 from "proj4";
import "../../config/proj-config";

export default function SearchPoint({ selectedProjection }) {
  const [coordInput, setCoordInput] = useState("");
  const map = useMap();
  const [marker, setMarker] = useState(null);

  const isWGS84 = selectedProjection === "EPSG:4326";

  // ✅ Icône personnalisée verte
  const greenIcon = L.icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const parts = coordInput.trim().split(";").map((p) => parseFloat(p.trim()));
    if (parts.length !== 2 || parts.some(isNaN)) {
      const msg = isWGS84
        ? "❌ Veuillez entrer deux coordonnées valides au format : latitude;longitude"
        : "❌ Veuillez entrer deux coordonnées valides au format : X;Y";
      alert(msg);
      return;
    }

    let lat, lng;

    try {
      if (isWGS84) {
        [lat, lng] = parts;
      } else {
        const [x, y] = parts;
        const [lon, latitude] = proj4(selectedProjection, "EPSG:4326", [x, y]);
        lat = latitude;
        lng = lon;
      }

      if (!lat || !lng) throw new Error("Coordonnées invalides");

      map.setView([lat, lng], 18);

      if (marker) marker.remove();

      // ✅ Utilisation du marker vert
      const newMarker = L.marker([lat, lng], { icon: greenIcon }).addTo(map);
      newMarker
        .bindPopup(`📍 Point : ${lat.toFixed(6)}, ${lng.toFixed(6)}`)
        .openPopup();
      setMarker(newMarker);
    } catch (err) {
      alert("❌ Erreur de conversion ou coordonnées invalides.");
      console.error(err);
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        right: 300,
        zIndex: 1000,
        borderRadius: "12px",
        padding: "12px",
        maxWidth: "300px",
      }}
    >
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={coordInput}
          onChange={(e) => setCoordInput(e.target.value)}
          placeholder={isWGS84 ? "Chercher: Lat ; Long" : "Chercher : X ; Y "}
          style={{
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            fontSize: "14px",
          }}
        />
        <button
          type="submit"
          style={{
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            padding: "8px 12px",
          }}
        >
          🔎
        </button>
      </form>
    </div>
  );
}
