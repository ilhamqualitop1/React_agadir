import { useEffect, useState } from "react";
import { GeoJSON } from "react-leaflet";

export default function ParcellesLayer() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5050/api/parcelles");
        if (!res.ok) throw new Error("Erreur API : " + res.status);
        const geojson = await res.json();
        console.log("✅ Données reçues :", geojson);
        setData(geojson);
      } catch (err) {
        console.error("🚨 Erreur récupération parcelles :", err);
      }
    };

    fetchData();
  }, []);

  // Fonction pour attacher un popup à chaque polygone
  const onEachFeature = (feature, layer) => {
    if (feature.properties) {
      layer.bindPopup(`
        <b>Id:</b> ${feature.properties.gid}<br/>
        <b>Parcelle:</b> ${feature.properties.parcelles}
      `);
    }
  };

  return data ? (
    <GeoJSON
      data={data}
      style={{
        color: "blue",
        weight: 2,
        fillOpacity: 0.1,
      }}
      onEachFeature={onEachFeature} 
    />
  ) : null;
}
