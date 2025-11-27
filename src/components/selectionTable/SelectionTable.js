import React, { useEffect } from "react";
import "./SelectionTable.css";

export default function SelectionTable({ coordinates = [], onClear, onDeletePoint, selectedProjection, isRechercheTitre }) {
  // Le hook useEffect est toujours exécuté, mais son contenu est conditionné à isRechercheTitre
  useEffect(() => {
    // Si on est en mode recherche par titre foncier, on ne fait rien
    if (isRechercheTitre) {
      return; // Pas d'effet à exécuter si isRechercheTitre est vrai
    }

    if (!coordinates || !Array.isArray(coordinates) || coordinates.length === 0) {
      console.log("⚠️ Aucune donnée reçue dans SelectionTable.");
      return;
    }

    console.log("📌 Coordonnées reçues dans SelectionTable :", coordinates);

    coordinates.forEach((shape, shapeIndex) => {
      if (!shape || !Array.isArray(shape.coords)) {
        console.warn(`⚠️ Données incorrectes pour la forme ${shapeIndex + 1}:`, shape);
        return;
      }

      console.log(`🔹 Forme ${shapeIndex + 1} - Type : ${shape.type}`);
      shape.coords.forEach((point, pointIndex) => {
        console.log(
          `  📍 Point ${pointIndex + 1}: ` +
          `WGS84(${point.originalLat?.toFixed(6)}, ${point.originalLng?.toFixed(6)}) ` +
          `→ ${selectedProjection} (${point.x?.toFixed(2)}, ${point.y?.toFixed(2)})`
        );
      });
    });
  }, [coordinates, selectedProjection, isRechercheTitre]); // Inclure isRechercheTitre dans les dépendances

  // Si isRechercheTitre est vrai, on ne retourne pas la table
  if (isRechercheTitre) {
    return null;
  }

  if (!coordinates || coordinates.length === 0) {
    return null; // Masquer la table si aucune donnée
  }

  const firstElement = coordinates[0] || {};
  const { type, distance, perimeter, area } = firstElement;

  return (
    <div className="selection-table">
      <h3>Coordonnées et Mesures ({selectedProjection})</h3>

      <div className="info-section">
        <p><strong>Type :</strong> {type || "N/A"}</p>
        {type === "Ligne" && !isNaN(distance) && distance !== undefined && (
          <p><strong>Distance :</strong> {Number(distance).toFixed(2)} m</p>
        )}
        {type === "Polygone" && !isNaN(perimeter) && perimeter !== undefined && (
          <p><strong>Périmètre :</strong> {Number(perimeter).toFixed(2)} m</p>
        )}
        {type === "Polygone" && !isNaN(area) && area !== undefined && (
          <p><strong>Surface :</strong> {Number(area).toFixed(2)} m²</p>
        )}
      </div>

      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Latitude (WGS84)</th>
            <th>Longitude (WGS84)</th>
            <th>X (Projection)</th>
            <th>Y (Projection)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {coordinates.map((shape) =>
            (shape.coords || []).map((point, pointIndex) => (
              <tr key={`${shape.id}-${pointIndex}`}>
                <td>{shape.type}</td>
                <td>{point.originalLat?.toFixed(6) || "-"}</td>
                <td>{point.originalLng?.toFixed(6) || "-"}</td>
                <td>{point.x?.toFixed(2) || "-"}</td>
                <td>{point.y?.toFixed(2) || "-"}</td>
                <td>
                  {shape.type !== "Point" && (
                    <button onClick={() => onDeletePoint(shape.id, pointIndex)} className="delete-btn">
                      ❌
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <button onClick={onClear} className="clear-btn">Tout effacer</button>
    </div>
  );
}
