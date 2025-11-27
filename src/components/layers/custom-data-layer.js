import { createRoot } from "react-dom/client";
import { useState, useEffect, useCallback, useRef } from "react";
import { GeoJSON, Marker, Popup, useMap } from "react-leaflet";
import dataService from "../../Services/dataService";
import { iconMap } from "../../config/icon-config";
import L from "leaflet";


const getCenterOfGeometry = (geometry) => {
  try {
    let coord = null;
    if (geometry.type === "MultiPolygon") {
      coord = geometry.coordinates?.[0]?.[0]?.[0];
    } else if (geometry.type === "Polygon") {
      coord = geometry.coordinates?.[0]?.[0];
    }

    if (coord) {
      const [lng, lat] = coord;
      return [lat, lng];
    }
  } catch (err) {
    console.warn("Geometry error:", err);
  }
  return null;
};


const convertGeometryToGeoJSON = (feature) => {
  return {
    type: "Feature",
    properties: feature.properties,
    geometry: feature.geometry, 
  };
};

const CustomDataLayer = ({ searchTitre = ""  }) => {
  const [features, setFeatures] = useState([]);
  const [points, setPoints] = useState([]);
  const map = useMap();
  const lastSearchTitreRef = useRef(null);

  const fetchVisibleFeatures = useCallback(async () => {
    try {
      const data = await dataService.getTotallPolygonesInBounds(); 
      const fetchedFeatures = data?.features || [];

      const geoFeatures = fetchedFeatures.map((feature) =>
        convertGeometryToGeoJSON(feature)
      );
      setFeatures(geoFeatures);

      const centerPoints = fetchedFeatures
        .map((f) => {
          const center = getCenterOfGeometry(f.geometry);
          return center
            ? { position: center, ...f.properties }
            : null;
        })
        .filter(Boolean);

      const filteredPoints = centerPoints.filter((pt) =>
        pt.nvtitre?.toLowerCase().includes(searchTitre.toLowerCase())
      );

      setPoints(filteredPoints);

      if (
        searchTitre &&
        filteredPoints.length > 0 &&
        searchTitre !== lastSearchTitreRef.current
      ) {
        const target = filteredPoints[0];
        map.flyTo(target.position, 17, { duration: 1.5 });
        lastSearchTitreRef.current = searchTitre;
      }

    } catch (error) {
      console.error("Erreur chargement des polygones :", error);
    }
  }, [map, searchTitre]);

  useEffect(() => {
    fetchVisibleFeatures();
    map.on("moveend", fetchVisibleFeatures);
    return () => map.off("moveend", fetchVisibleFeatures);
  }, [fetchVisibleFeatures]);
  


  const renderPopupContent = (props) => {
    if (!props) return "Sans titre";
  
    const containerStyle = {
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      fontSize: "14px",
      lineHeight: "1.6",
      color: "#333",
      display: "flex",
      flexDirection: "column",
      gap: "4px",
      padding: "4px 0",
    };
  
    const labelStyle = {
      color: "#1e3a8a",
      fontWeight: "600",
      marginRight: "4px",
    };
  
    return (
      <div style={containerStyle}>
        <div>
          <strong style={labelStyle}>Numéro de Titre :</strong> {props.nvtitre || "N/A"}
        </div>
        <div>
          <strong style={labelStyle}>Nature :</strong> {props.nature || "N/A"}
        </div>
        <div>
          <strong style={labelStyle}>Numéro :</strong> {props.num || "N/A"}
        </div>
        <div>
          <strong style={labelStyle}>Indice :</strong> {props.indice || "N/A"}
        </div>
        <div>
          <strong style={labelStyle}>Type :</strong> {props.type || "N/A"}
        </div>
        {props.complement && (
          <div>
            <strong style={labelStyle}>Complément :</strong> {props.complement}
          </div>
        )}
        <div>
          <strong style={labelStyle}>Nombre des bornes :</strong> {props.nb_bornes || "N/A"}
        </div>
        <div>
          <strong style={labelStyle}>Surface adoptée :</strong> {props.surf_adop || "N/A"}
        </div>
        <div>
          <strong style={labelStyle}>Consistance :</strong> {props.consistanc || "N/A"}
        </div>
      </div>
    );
  };
  
  
  

  return (
    <>
      {/* Polygones en bleu */}
      {/* {features.map((feature, index) => (
        <GeoJSON
          key={`poly-${index}`}
          data={feature}
          style={{
            color: "blue",
            weight: 2,
            fillColor: "blue",
            fillOpacity: 0.3,
          }}
          onEachFeature={(f, layer) => {
            const container = document.createElement("div");
            createRoot(container).render(renderPopupContent(f.properties));
            layer.bindPopup(container);
          }}
        />
      ))} */}

      {/* Marqueurs rouges
      {points.map((pt, idx) => (
        <Marker key={`marker-${idx}`} position={pt.position} icon={iconMap}>
          <Popup  >
           {renderPopupContent(pt)}
          </Popup>
        </Marker>
      ))} */}
    </>
  );
};


export default CustomDataLayer;
