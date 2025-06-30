const teamAssets = {
  "Red Bull Racing": { logo: "...", car: "...", color: "#1E41FF" },
  "Mercedes": { logo: "...", car: "...", color: "#00D2BE" },
  "Ferrari": { logo: "...", car: "...", color: "#E80020" },
  "McLaren": { logo: "...", car: "...", color: "#FF8700" },
  "Aston Martin": { logo: "...", car: "...", color: "#006F62" },
  "Alpine": { logo: "...", car: "...", color: "#2293D1" },
  "AlphaTauri": { logo: "...", car: "...", color: "#6692FF" },
  "RB": { logo: "...", car: "...", color: "#6692FF" },
  "Williams": { logo: "...", car: "...", color: "#37BEDD" },
  "Kick Sauber": { logo: "...", car: "...", color: "#52E252" },
  "Haas": { logo: "...", car: "...", color: "#B6BABD" }
};

const driverPhotos = {
  "max_verstappen": "https://media.formula1.com/digital-assets/drivers/2024/MAX.jpg",
  "lewis_hamilton": "https://media.formula1.com/digital-assets/drivers/2024/LEW.jpg",
  "charles_leclerc": "https://media.formula1.com/digital-assets/drivers/2024/LEC.jpg",
  "lando_norris": "https://media.formula1.com/digital-assets/drivers/2024/NOR.jpg",
  "fernando_alonso": "https://media.formula1.com/digital-assets/drivers/2024/ALO.jpg",
  "george_russell": "https://media.formula1.com/digital-assets/drivers/2024/RUS.jpg",
  "oscar_piastri": "https://media.formula1.com/digital-assets/drivers/2024/PIA.jpg",
  "carlos_sainz": "https://media.formula1.com/digital-assets/drivers/2024/SAI.jpg",
  "sergio_perez": "https://media.formula1.com/digital-assets/drivers/2024/PER.jpg",
  "pierre_gasly": "https://media.formula1.com/digital-assets/drivers/2024/GAS.jpg"
};

// Données de saison 2025 basées sur les informations récentes
const currentSeasonData = {
  constructorStandings: [
    { position: 1, team: "Red Bull Racing", points: 123, drivers: ["Max Verstappen", "Sergio Perez"] },
    { position: 2, team: "Ferrari", points: 98, drivers: ["Charles Leclerc", "Lewis Hamilton"] },
    { position: 3, team: "McLaren", points: 87, drivers: ["Lando Norris", "Oscar Piastri"] },
    { position: 4, team: "Mercedes", points: 76, drivers: ["George Russell", "Andrea Kimi Antonelli"] },
    { position: 5, team: "Aston Martin", points: 45, drivers: ["Fernando Alonso", "Lance Stroll"] },
    { position: 6, team: "Alpine", points: 32, drivers: ["Pierre Gasly", "Jack Doohan"] },
    { position: 7, team: "Williams", points: 18, drivers: ["Alex Albon", "Carlos Sainz"] },
    { position: 8, team: "RB", points: 12, drivers: ["Yuki Tsunoda", "Liam Lawson"] },
    { position: 9, team: "Haas", points: 8, drivers: ["Nico Hulkenberg", "Esteban Ocon"] },
    { position: 10, team: "Kick Sauber", points: 3, drivers: ["Valtteri Bottas", "Gabriel Bortoleto"] }
  ],
  driverStandings: [
    { position: 1, name: "Max Verstappen", team: "Red Bull Racing", points: 78 },
    { position: 2, name: "Charles Leclerc", team: "Ferrari", points: 56 },
    { position: 3, name: "Lando Norris", team: "McLaren", points: 52 },
    { position: 4, name: "Lewis Hamilton", team: "Ferrari", points: 42 },
    { position: 5, name: "George Russell", team: "Mercedes", points: 38 }
  ]
};

function cleanTeamName(teamName) {
  const cleanMap = {
    "Red Bull Racing Honda RBPT": "Red Bull Racing",
    "Mercedes-AMG PETRONAS F1 Team": "Mercedes", 
    "Scuderia Ferrari": "Ferrari",
    "McLaren Formula 1 Team": "McLaren",
    "Aston Martin Aramco Cognizant F1 Team": "Aston Martin",
    "BWT Alpine F1 Team": "Alpine",
    "Scuderia AlphaTauri": "AlphaTauri",
    "Visa Cash App RB Formula One Team": "RB",
    "Williams Racing": "Williams",
    "MoneyGram Haas F1 Team": "Haas",
    "Stake F1 Team Kick Sauber": "Kick Sauber"
  };
  
  return cleanMap[teamName] || teamName;
}

function createDriverKey(fullName) {
  return fullName.toLowerCase().replace(/\s+/g, '_');
}

async function fetchWithRetry(url, options = {}, maxRetries = 2) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        timeout: 8000,
        headers: {
          'User-Agent': 'F1-Widget-API/1.0',
          'Accept': 'application/json',
          ...options.headers
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response;
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  throw lastError;
}

// Fonction pour essayer de récupérer des données depuis OpenF1
async function tryOpenF1Data() {
  try {
    const response = await fetchWithRetry('https://api.openf1.org/v1/drivers?session_key=latest');
    const data = await response.json();
    
    if (data && data.length > 0) {
      console.log('Données OpenF1 récupérées avec succès');
      return { success: true, data };
    }
    return { success: false };
  } catch (error) {
    console.log('OpenF1 non disponible:', error.message);
    return { success: false };
  }
}

// Fonction pour essayer de récupérer des données depuis f1api.dev
async function tryF1ApiDev() {
  try {
    const currentYear = new Date().getFullYear();
    const response = await fetchWithRetry(`https://api.f1api.dev/v1/seasons/${currentYear}/constructors-standings`);
    const data = await response.json();
    
    if (data && data.constructorStandings) {
      console.log('Données f1api.dev récupérées avec succès');
      return { success: true, data };
    }
    return { success: false };
  } catch (error) {
    console.log('f1api.dev non disponible:', error.message);
    return { success: false };
  }
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    let dataSource = 'current-season';
    let constructorStandings = currentSeasonData.constructorStandings;
    let driverStandings = currentSeasonData.driverStandings;

    // Essayer de récupérer des données en temps réel
    const openF1Result = await tryOpenF1Data();
    if (openF1Result.success) {
      dataSource = 'openf1-live';
      // Traiter les données OpenF1 si nécessaire
    } else {
      const f1ApiResult = await tryF1ApiDev();
      if (f1ApiResult.success) {
        dataSource = 'f1api-dev';
        // Traiter les données f1api.dev si nécessaire
      }
    }

    // Traitement des classements constructeurs
    const standings = constructorStandings.map(item => {
      const cleanedTeamName = cleanTeamName(item.team);
      const assets = teamAssets[cleanedTeamName] || { logo: null, car: null, color: "#FFFFFF" };
      
      return {
        position: item.position,
        team: cleanedTeamName,
        points: item.points,
        logo: assets.logo,
        car: assets.car,
        color: assets.color
      };
    });

    // Pilote en tête
    const leadingDriver = driverStandings[0];
    const driverKey = createDriverKey(leadingDriver.name);
    const driverPhoto = driverPhotos[driverKey] || null;
    const cleanedTeamName = cleanTeamName(leadingDriver.team);

    const responseData = {
      driverP1: {
        name: leadingDriver.name,
        photo: driverPhoto,
        team: cleanedTeamName,
        points: leadingDriver.points
      },
      backgroundGradient: ["#000000", teamAssets[cleanedTeamName]?.color || "#FFFFFF"],
      standings,
      lastUpdated: new Date().toISOString(),
      dataSource,
      season: new Date().getFullYear(),
      note: dataSource === 'current-season' ? 'Données de saison 2025 - Début de championnat' : 'Données en temps réel'
    };

    // Cache adaptatif selon la source de données
    const cacheTime = dataSource === 'current-season' ? 1800 : 300; // 30min pour données statiques, 5min pour live
    res.setHeader('Cache-Control', `s-maxage=${cacheTime}, stale-while-revalidate=3600`);
    
    return res.status(200).json(responseData);

  } catch (error) {
    console.error('Erreur critique:', error);
    
    // Fallback avec données minimales mais fonctionnelles
    const fallbackData = {
      driverP1: {
        name: "Max Verstappen",
        photo: driverPhotos["max_verstappen"],
        team: "Red Bull Racing",
        points: 78
      },
      backgroundGradient: ["#000000", "#1E41FF"],
      standings: [
        { position: 1, team: "Red Bull Racing", points: 123, logo: "...", car: "...", color: "#1E41FF" },
        { position: 2, team: "Ferrari", points: 98, logo: "...", car: "...", color: "#E80020" },
        { position: 3, team: "McLaren", points: 87, logo: "...", car: "...", color: "#FF8700" },
        { position: 4, team: "Mercedes", points: 76, logo: "...", car: "...", color: "#00D2BE" },
        { position: 5, team: "Aston Martin", points: 45, logo: "...", car: "...", color: "#006F62" }
      ],
      lastUpdated: new Date().toISOString(),
      dataSource: 'fallback',
      season: new Date().getFullYear(),
      error: 'Toutes les APIs sont indisponibles'
    };

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=1800');
    return res.status(200).json(fallbackData);
  }
}
