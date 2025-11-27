import { useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet-control-geocoder";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";

const SearchLocation = () => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // ✅ Icône verte personnalisée
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

    const geocoder = L.Control.geocoder({
      defaultMarkGeocode: false, // ❌ On empêche le marker par défaut
    })
      .on("markgeocode", function (e) {
        const bbox = e.geocode.bbox;
        const poly = L.polygon([
          bbox.getSouthEast(),
          bbox.getNorthEast(),
          bbox.getNorthWest(),
          bbox.getSouthWest(),
        ]);
        map.fitBounds(poly.getBounds());

        // ✅ Ajout du marker vert
        L.marker(e.geocode.center, { icon: greenIcon })
          .addTo(map)
          .bindPopup(e.geocode.name)
          .openPopup();
      })
      .addTo(map);

    // ✅ Placement du champ de recherche
    setTimeout(() => {
      const geocoderContainer = document.querySelector(".leaflet-control-geocoder");
      const zoomContainer = document.querySelector(".leaflet-top.leaflet-left");

      if (geocoderContainer && zoomContainer) {
        geocoderContainer.style.position = "absolute";
        geocoderContainer.style.top = "6px";
        geocoderContainer.style.left = "50px";
        geocoderContainer.style.zIndex = "1000";
        geocoderContainer.style.width = "150px";

        zoomContainer.appendChild(geocoderContainer);
      }
    }, 500);

    return () => {
      map.removeControl(geocoder);
    };
  }, [map]);

  return null;
};

export default SearchLocation;
