import proj4 from "proj4";

// Définition des projections
proj4.defs("EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs");

// Lambert Zone 1 (Nord)
proj4.defs(
  "EPSG:26191",
  "+proj=lcc +lat_1=34.88 +lat_2=31.6 +lat_0=33.3 +lon_0=-5.4 " +
  "+x_0=500000 +y_0=300000 +ellps=clrk80ign " +
  "+towgs84=29,145,46,0,0,0,0 +units=m +no_defs"
);

// Lambert Zone 2 (Centre - Agadir, Marrakech)
proj4.defs(
  "EPSG:26192",
  "+proj=lcc +lat_1=31.4 +lat_2=28.1 +lat_0=29.7 +lon_0=-5.4 " +
  "+x_0=500000 +y_0=300000 +ellps=clrk80ign " +
  "+towgs84=30,140,50,0,0,0,0 +units=m +no_defs"
);

// Lambert Zone 3 (Sud)
proj4.defs(
  "EPSG:26194",
  "+proj=lcc +lat_1=27.6 +lat_2=24.5 +lat_0=26.1 +lon_0=-5.4 " +
  "+x_0=1200000 +y_0=400000 +ellps=clrk80ign " +
  "+towgs84=31,146,47,0,0,0,0 +units=m +no_defs"
);

// Lambert Zone 4 (Extrême Sud - Dakhla)
proj4.defs(
  "EPSG:26195",
  "+proj=lcc +lat_1=24.1 +lat_2=20.9 +lat_0=22.5 +lon_0=-5.4 " +
  "+x_0=1500000 +y_0=400000 +ellps=clrk80ign " +
  "+towgs84=31,146,47,0,0,0,0 +units=m +no_defs"
);

export function convertCoordinates(coord, projection) {
  try {
    if (!projection || !proj4.defs[projection]) {
      console.warn(`⚠️ Projection ${projection} non définie, utilisation de WGS84`);
      return { x: coord.lng, y: coord.lat };
    }

    const [x, y] = proj4("EPSG:4326", projection, [coord.lng, coord.lat]);
    return { x, y };
  } catch (err) {
    console.error("Erreur conversion coordonnées :", err);
    return { x: null, y: null };
  }
}
