import React from "react";
import "./ProjectionSelector.css";

const projections = [
  { name: "WGS84", code: "EPSG:4326" },
  { name: "Maroc Lambert Zone 1", code: "EPSG:26191" },
  { name: "Maroc Lambert Zone 2", code: "EPSG:26192" }, // par défaut
  { name: "Maroc Lambert Zone 3", code: "EPSG:26194" },
  { name: "Maroc Lambert Zone 4", code: "EPSG:26195" },
];

export default function ProjectionSelector({
  onChangeProjection,
  selectedProjection = "EPSG:26192", // ✅ valeur par défaut : Zone 2
}) {
  const handleProjectionChange = (event) => {
    onChangeProjection(event.target.value);
  };

  return (
    <div className="projection-selector">
      <select onChange={handleProjectionChange} value={selectedProjection}>
        {projections.map((proj) => (
          <option key={proj.code} value={proj.code}>
            {proj.name} ({proj.code})
          </option>
        ))}
      </select>
    </div>
  );
}
