import React, { useEffect, useState, useCallback } from 'react';
import MarkerClusterGroup from '@changey/react-leaflet-markercluster';
import { Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';

const icon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// 🎯 Nouveau composant de contenu enrichi pour la popup
const renderPopupContent = (props) => {
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

  if (!props) return "Sans titre";

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

const ClusterLayer = () => {
  const [features, setFeatures] = useState([]);
  const map = useMap();

  const fetchClusterPoints = useCallback(async () => {
    if (!map) return;

    const bounds = map.getBounds();
    const bbox = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ].join(',');

    try {
      const res = await axios.get(`http://localhost:5050/api/clusters/polygones?bbox=${bbox}`);

      if (res.data && Array.isArray(res.data.features)) {
        setFeatures(res.data.features);
      } else {
        console.warn('Données GeoJSON invalides:', res.data);
        setFeatures([]);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des clusters:', error);
    }
  }, [map]);

  useEffect(() => {
    if (!map) return;

    fetchClusterPoints();
    map.on('moveend', fetchClusterPoints);

    return () => {
      map.off('moveend', fetchClusterPoints);
    };
  }, [map, fetchClusterPoints]);

  return (
    <MarkerClusterGroup>
      {features.map((feature, i) => {
        if (
          feature?.geometry?.type === 'Point' &&
          Array.isArray(feature.geometry.coordinates)
        ) {
          const [lng, lat] = feature.geometry.coordinates;
          const props = feature.properties;

          return (
            <Marker key={props.id || i} position={[lat, lng]} icon={icon}>
              <Popup>{renderPopupContent(props)}</Popup>
            </Marker>
          );
        }
        return null;
      })}
    </MarkerClusterGroup>
  );
};

export default ClusterLayer;
