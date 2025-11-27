
//  Fonction pour calculer la distance entre points
export const calculateDistance = (coordinates) => {
  if (coordinates.length < 2) return 0;
  let distance = 0;

  for (let i = 0; i < coordinates.length - 1; i++) {
    const p1 = coordinates[i];
    const p2 = coordinates[i + 1];

    if (!p1.x || !p1.y || !p2.x || !p2.y) continue;

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    distance += Math.sqrt(dx * dx + dy * dy);
  }

  console.log(`📏 Distance totale: ${distance.toFixed(2)} m`);
  return distance.toFixed(2); //  la distance en mètres 
};
// Fonction pour calculer le périmètre et la surface d'un polygone
export const calculatePolygonMetrics = (coordinates) => {
  if (!coordinates || coordinates.length < 3) return { perimeter: 0, area: 0 };

  let perimeter = 0;
  let area = 0;

  //  Calcul du périmètre (somme des distances entre points consécutifs)
  for (let i = 0; i < coordinates.length; i++) {
    const p1 = coordinates[i];
    const p2 = coordinates[(i + 1) % coordinates.length]; // Boucle sur le premier point

    if (
      typeof p1.x !== "number" ||
      typeof p1.y !== "number" ||
      typeof p2.x !== "number" ||
      typeof p2.y !== "number"
    )
      continue;

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    perimeter += Math.sqrt(dx * dx + dy * dy);
  }

  //  Calcul de l'aire (Formule de Shoelace)
  for (let i = 0; i < coordinates.length; i++) {
    const p1 = coordinates[i];
    const p2 = coordinates[(i + 1) % coordinates.length]; // Ferme le polygone

    if (
      typeof p1.x !== "number" ||
      typeof p1.y !== "number" ||
      typeof p2.x !== "number" ||
      typeof p2.y !== "number"
    )
      continue;

    area += p1.x * p2.y - p2.x * p1.y;
  }
  area = Math.abs(area / 2);

  console.log(
    `📐 Périmètre: ${perimeter.toFixed(2)} m, Aire: ${area.toFixed(2)} m²`
  );

  return {
    perimeter: parseFloat(perimeter.toFixed(2)),
    area: parseFloat(area.toFixed(2)),
  };
};
