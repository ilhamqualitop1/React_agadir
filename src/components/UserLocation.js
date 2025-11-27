import React, { useState } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { FaLocationArrow } from "react-icons/fa";

export default function UserLocation() {
  const map = useMap();
  const [userMarker, setUserMarker] = useState(null);

  const locateUser = () => {
    if (!map) return;

    map.locate({ setView: true, maxZoom: 16 });

    map.once("locationfound", (e) => {
      const { lat, lng } = e.latlng;

      if (userMarker) {
        map.removeLayer(userMarker);
      }

      const newMarker = L.marker([lat, lng], {
        icon: L.icon({
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
        }),
      })
        .addTo(map)
        .bindPopup("Vous êtes ici")
        .openPopup();

      setUserMarker(newMarker);
    });

    map.once("locationerror", () => {
      alert("Impossible de récupérer votre position.");
    });
  };

  return (
    <button
      onClick={locateUser}
      style={{
        position: "absolute",
        top: "400px",
        left: "10px",
        zIndex: 1000,
        background: "white",
        border: "none",
        borderRadius: "50%",
        padding: "10px",
        boxShadow: "0px 0px 5px rgba(0,0,0,0.3)",
        cursor: "pointer",
      }}
    >
      <FaLocationArrow size={15} color="black" />
    </button>
  );
}


