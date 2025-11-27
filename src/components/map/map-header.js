import { LayersControl, TileLayer, GeoJSON } from "react-leaflet";
import ProjectionSelector from "../projectionSelector/ProjectionSelector";
import { useAuthContext } from "../../auth/hooks/use-auth-context";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const { BaseLayer, Overlay } = LayersControl;

export default function MapHeader({
  onSetProjection,
  selectedProjection,
  onSetOpen,
  searchTrigger,
}) {
  const { logout, user } = useAuthContext(); // ✅ user contient le rôle
  const navigate = useNavigate();
  const [parcelles, setParcelles] = useState(null);

  const handleLogout = useCallback(() => {
    logout();
    navigate("/");
  }, [logout, navigate]);

  const handleAdminPanel = useCallback(() => {
    navigate("/admin-dashboard");
  }, [navigate]);

  // Charger les polygones depuis ton API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5050/api/parcelles");
        const data = await res.json();
        setParcelles(data);
      } catch (err) {
        console.error("❌ Erreur chargement parcelles :", err);
      }
    };
    fetchData();
  }, [searchTrigger]);

  return (
    <>
      {/* Layers */}
      <LayersControl position="topright">
        <BaseLayer checked name="Hybride">
          <TileLayer
            url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
            attribution='&copy; <a href="https://www.google.com/maps">Google</a>'
            maxZoom={22}
          />
        </BaseLayer>
        <BaseLayer name="Carte Standard">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            maxZoom={22}
          />
        </BaseLayer>
        <BaseLayer name="Satellite">
          <TileLayer
            url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
            attribution='&copy; <a href="https://www.google.com/maps">Google</a>'
            maxZoom={22}
          />
        </BaseLayer>

        {/* ✅ Affichage des polygones */}
        <Overlay name="Parcelles">
          {parcelles && (
            <GeoJSON
              data={parcelles}
              onEachFeature={(feature, layer) => {
                const { gid, parcelles } = feature.properties;
                layer.bindPopup(`
                  <b>GID :</b> ${gid}<br/>
                  <b>Parcelle :</b> ${parcelles}
                `);
              }}
              style={{ color: "blue", weight: 2, fillOpacity: 0.2 }}
            />
          )}
        </Overlay>
      </LayersControl>

      {/* Boutons au-dessus */}
      <div
        style={{
          position: "absolute",
          top: "15px",
          left: "40%",
          transform: "translateX(-50%)",
          zIndex: 1500,
          display: "flex",
          gap: 15,
          alignItems: "center",
        }}
      >
        <button
          className="advanced-search-button"
          style={{ whiteSpace: "nowrap" }}
          onClick={() => onSetOpen(true)}
        >
          Rechercher un titre foncier
        </button>

        <ProjectionSelector
          onChangeProjection={(value) => onSetProjection(value)}
          selectedProjection={selectedProjection}
        />

        {/* ✅ Bouton admin visible uniquement si user.role === 'admin' */}
        {user?.role === "admin" && (
          <button
            className="admin-panel-button"
            style={{
              backgroundColor: "#28a745",
              color: "white",
              padding: "8px 12px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
            onClick={handleAdminPanel}
          >
            ⚙️ Paramétrage
          </button>
        )}
      </div>

      {/* Déconnexion */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          bottom: "20px",
          zIndex: 1500,
        }}
      >
        <button
          className="logout-button"
          style={{
            whiteSpace: "nowrap",
            backgroundColor: "#3c7ea9",
            color: "white",
            borderRadius: "8px",
            padding: "8px 12px",
            border: "none",
            cursor: "pointer",
          }}
          onClick={handleLogout}
        >
          Se Déconnecter
        </button>
      </div>
    </>
  );
}
