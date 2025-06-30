const teamAssets = {
  "Red Bull": { logo: "...", car: "...", color: "#1E41FF" },
  "Mercedes": { logo: "...", car: "...", color: "#00D2BE" },
  "Ferrari": { logo: "...", car: "...", color: "#E80020" },
  "McLaren": { logo: "...", car: "...", color: "#FF8700" },
  "Aston Martin": { logo: "...", car: "...", color: "#006F62" },
  "Alpine F1 Team": { logo: "...", car: "...", color: "#2293D1" },
  "Visa Cash App RB": { logo: "...", car: "...", color: "#6692FF" },
  "Williams": { logo: "...", car: "...", color: "#37BEDD" },
  "Stake F1 Team Kick Sauber": { logo: "...", car: "...", color: "#52E252" },
  "Haas F1 Team": { logo: "...", car: "...", color: "#B6BABD" }
};

const driverPhotos = {
  "max_verstappen": "https://media.formula1.com/digital-assets/drivers/2024/MAX.jpg",
  "lewis_hamilton": "https://media.formula1.com/digital-assets/drivers/2024/LEW.jpg",
  "charles_leclerc": "https://media.formula1.com/digital-assets/drivers/2024/LEC.jpg",
  "lando_norris": "https://media.formula1.com/digital-assets/drivers/2024/NOR.jpg",
  "fernando_alonso": "https://media.formula1.com/digital-assets/drivers/2024/ALO.jpg",
  "george_russell": "https://media.formula1.com/digital-assets/drivers/2024/RUS.jpg"
};

// Données de fallback en cas d'erreur API
const fallbackData = {
  standings: [
    { position: 1, team: "Red Bull", points: 860, logo: "...", car: "...", color: "#1E41FF" },
    { position: 2, team: "Mercedes", points: 409, logo: "...", car: "...", color: "#00D2BE" },
    { position: 3, team: "Ferrari", points: 406, logo: "...", car: "...", color: "#E80020" },
    { position: 4, team: "McLaren", points: 302, logo: "...", car: "...", color: "#FF8700" },
    { position: 5, team: "Aston Martin", points: 280, logo: "...", car: "...", color: "#006F62" }
  ],
  driverP1: {
    name: "Max Verstappen",
    photo: "https://media.formula1.com/digital-assets/drivers/2024/MAX.jpg",
    team: "Red Bull",
    points: 575
  }
};

async function fetchWithRetry(url, options = {}, maxRetries = 3) {
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
      console.warn(`Tentative ${i + 1}/${maxRetries} échouée:`, error.message);
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }
  
  throw lastError;
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    let constructorData, driverData;

    try {
      // Tentative de récupération des données en temps réel
      const [constructorResponse, driverResponse] = await Promise.all([
        fetchWithRetry('https://ergast.com/api/f1/current/constructorStandings.json'),
        fetchWithRetry('https://ergast.com/api/f1/current/driverStandings.json')
      ]);

      constructorData = await constructorResponse.json();
      driverData = await driverResponse.json();

      // Vérifier la structure des données
      const constructorStandings = constructorData?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings;
      const driverStandings = driverData?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings;

      if (!constructorStandings || !driverStandings || driverStandings.length === 0) {
        throw new Error('Structure de données invalide');
      }

      // Traitement des données en temps réel
      const standings = constructorStandings.map(item => {
        const teamName = item.Constructor.name;
        const assets = teamAssets[teamName] || { logo: null, car: null, color: "#FFFFFF" };
        
        return {
          position: parseInt(item.position),
          team: teamName,
          points: parseInt(item.points),
          logo: assets.logo,
          car: assets.car,
          color: assets.color
        };
      });

      const leadingDriver = driverStandings[0];
      const driverName = `${leadingDriver.Driver.givenName} ${leadingDriver.Driver.familyName}`;
      const driverPhoto = driverPhotos[leadingDriver.Driver.driverId] || null;
      const driverTeam = leadingDriver.Constructors[0].name;

      const responseData = {
        driverP1: {
          name: driverName,
          photo: driverPhoto,
          team: driverTeam,
          points: parseInt(leadingDriver.points)
        },
        backgroundGradient: ["#000000", teamAssets[driverTeam]?.color || "#FFFFFF"],
        standings,
        lastUpdated: new Date().toISOString(),
        dataSource: 'live'
      };

      res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600');
      return res.status(200).json(responseData);

    } catch (apiError) {
      console.error('Erreur API Ergast, utilisation des données de fallback:', apiError.message);
      
      // Utilisation des données de fallback
      const responseData = {
        driverP1: fallbackData.driverP1,
        backgroundGradient: ["#000000", teamAssets[fallbackData.driverP1.team]?.color || "#FFFFFF"],
        standings: fallbackData.standings,
        lastUpdated: new Date().toISOString(),
        dataSource: 'fallback',
        warning: 'Données non actualisées - problème de connexion API'
      };

      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
      return res.status(200).json(responseData);
    }

  } catch (error) {
    console.error('Erreur critique:', error);
    res.status(500).json({ 
      error: "Erreur lors de la récupération des données F1",
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
