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

export default async function handler(req, res) {
  try {
    // Vérifier la méthode HTTP
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    // Configuration des requêtes avec timeout et headers
    const fetchOptions = {
      method: 'GET',
      headers: {
        'User-Agent': 'F1-Widget-API/1.0',
        'Accept': 'application/json',
      },
      timeout: 10000 // 10 secondes
    };

    const [constructorResponse, driverResponse] = await Promise.allSettled([
      fetch('https://ergast.com/api/f1/current/constructorStandings.json', fetchOptions),
      fetch('https://ergast.com/api/f1/current/driverStandings.json', fetchOptions)
    ]);

    // Vérifier les résultats des requêtes
    if (constructorResponse.status === 'rejected' || driverResponse.status === 'rejected') {
      console.error('Erreur de fetch:', {
        constructor: constructorResponse.reason?.message,
        driver: driverResponse.reason?.message
      });
      throw new Error('Impossible de récupérer les données depuis l\'API Ergast');
    }

    const cRes = constructorResponse.value;
    const dRes = driverResponse.value;

    if (!cRes.ok || !dRes.ok) {
      throw new Error(`Erreur HTTP: Constructor ${cRes.status}, Driver ${dRes.status}`);
    }

    const constructorData = await cRes.json();
    const driverData = await dRes.json();

    // Vérifier la structure des données
    const constructorStandings = constructorData?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings;
    const driverStandings = driverData?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings;

    if (!constructorStandings || !driverStandings || driverStandings.length === 0) {
      throw new Error('Structure de données invalide');
    }

    // Traitement des classements constructeurs
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

    // Traitement du pilote en tête
    const leadingDriver = driverStandings[0];
    const driverName = `${leadingDriver.Driver.givenName} ${leadingDriver.Driver.familyName}`;
    const driverPhoto = driverPhotos[leadingDriver.Driver.driverId] || null;
    const driverTeam = leadingDriver.Constructors[0].name;
    const backgroundGradient = [
      "#000000", 
      teamAssets[driverTeam]?.color || "#FFFFFF"
    ];

    // Configuration du cache
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    
    // Réponse structurée
    res.status(200).json({
      driverP1: {
        name: driverName,
        photo: driverPhoto,
        team: driverTeam,
        points: parseInt(leadingDriver.points)
      },
      backgroundGradient,
      standings,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur API F1:', error);
    res.status(500).json({ 
      error: "Erreur lors de la récupération des données F1",
      message: error.message 
    });
  }
}
