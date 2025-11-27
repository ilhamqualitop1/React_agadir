import { useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";

const ZoomInitialControl = ({ initialCenter, initialZoom }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const zoomHomeButton = L.control({ position: "topleft" });
    zoomHomeButton.onAdd = function () {
      const div = L.DomUtil.create(
        "div",
        "leaflet-bar leaflet-control leaflet-control-custom"
      );
      div.innerHTML = "🏠";
      div.title = "Revenir au zoom initial";
      div.style.cursor = "pointer";
      div.style.textAlign = "center";
      div.style.fontSize = "20px";
      div.style.lineHeight = "30px";
      div.style.background = "white";
      div.style.width = "30px";
      div.style.height = "30px";
      div.style.border = "2px solid rgba(0,0,0,0.2)";
      div.style.borderRadius = "4px";

      div.onclick = function () {
        map.setView(initialCenter, initialZoom);
      };

      return div;
    };

    zoomHomeButton.addTo(map);

    return () => {
      map.removeControl(zoomHomeButton);
    };
  }, [map, initialCenter, initialZoom]);

  return null;
};

export default ZoomInitialControl;
