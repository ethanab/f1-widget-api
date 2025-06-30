const teamAssets = {
  "Red Bull": {
    logo: "https://media.formula1.com/content/dam/fom-website/teams/2024/red-bull-racing-logo.png",
    car: "https://media.formula1.com/content/dam/fom-website/manual/Misc/2024manual/Launch/RedBull.jpg",
    color: "#1E41FF"
  },
  "Mercedes": {
    logo: "https://media.formula1.com/content/dam/fom-website/teams/2024/mercedes-logo.png",
    car: "https://media.formula1.com/content/dam/fom-website/manual/Misc/2024manual/Launch/Mercedes.jpg",
    color: "#00D2BE"
  },
  "Ferrari": {
    logo: "https://media.formula1.com/content/dam/fom-website/teams/2024/ferrari-logo.png",
    car: "https://media.formula1.com/content/dam/fom-website/manual/Misc/2024manual/Launch/Ferrari.jpg",
    color: "#E80020"
  },
  "McLaren": {
    logo: "https://media.formula1.com/content/dam/fom-website/teams/2024/mclaren-logo.png",
    car: "https://media.formula1.com/content/dam/fom-website/manual/Misc/2024manual/Launch/McLaren.jpg",
    color: "#FF8700"
  },
  "Aston Martin": {
    logo: "https://media.formula1.com/content/dam/fom-website/teams/2024/aston-martin-logo.png",
    car: "https://media.formula1.com/content/dam/fom-website/manual/Misc/2024manual/Launch/AstonMartin.jpg",
    color: "#006F62"
  },
  "Alpine F1 Team": {
    logo: "https://media.formula1.com/content/dam/fom-website/teams/2024/alpine-logo.png",
    car: "https://media.formula1.com/content/dam/fom-website/manual/Misc/2024manual/Launch/Alpine.jpg",
    color: "#2293D1"
  },
  "Visa Cash App RB": {
    logo: "https://media.formula1.com/content/dam/fom-website/teams/2024/visa-cash-app-rb-logo.png",
    car: "https://media.formula1.com/content/dam/fom-website/manual/Misc/2024manual/Launch/VisaCashAppRB.jpg",
    color: "#6692FF"
  },
  "Williams": {
    logo: "https://media.formula1.com/content/dam/fom-website/teams/2024/williams-logo.png",
    car: "https://media.formula1.com/content/dam/fom-website/manual/Misc/2024manual/Launch/Williams.jpg",
    color: "#37BEDD"
  },
  "Stake F1 Team Kick Sauber": {
    logo: "https://media.formula1.com/content/dam/fom-website/teams/2024/stake-kick-sauber-logo.png",
    car: "https://media.formula1.com/content/dam/fom-website/manual/Misc/2024manual/Launch/KickSauber.jpg",
    color: "#52E252"
  },
  "Haas F1 Team": {
    logo: "https://media.formula1.com/content/dam/fom-website/teams/2024/haas-logo.png",
    car: "https://media.formula1.com/content/dam/fom-website/manual/Misc/2024manual/Launch/Haas.jpg",
    color: "#B6BABD"
  }
};


const driverPhotos = {
  "max_verstappen": "https://media.formula1.com/digital-assets/drivers/2025/MAX.jpg",
  "sergio_perez": "https://media.formula1.com/digital-assets/drivers/2025/PER.jpg",
  "lewis_hamilton": "https://media.formula1.com/digital-assets/drivers/2025/LEW.jpg",
  "george_russell": "https://media.formula1.com/digital-assets/drivers/2025/RUS.jpg",
  "charles_leclerc": "https://media.formula1.com/digital-assets/drivers/2025/LEC.jpg",
  "carlos_sainz": "https://media.formula1.com/digital-assets/drivers/2025/SAI.jpg",
  "lando_norris": "https://media.formula1.com/digital-assets/drivers/2025/NOR.jpg",
  "oscar_piastri": "https://media.formula1.com/digital-assets/drivers/2025/PIA.jpg",
  "fernando_alonso": "https://media.formula1.com/digital-assets/drivers/2025/ALO.jpg",
  "lance_stroll": "https://media.formula1.com/digital-assets/drivers/2025/STR.jpg",
  "esteban_ocon": "https://media.formula1.com/digital-assets/drivers/2025/OCO.jpg",
  "pierre_gasly": "https://media.formula1.com/digital-assets/drivers/2025/GAS.jpg",
  "yuki_tsunoda": "https://media.formula1.com/digital-assets/drivers/2025/TSU.jpg",
  "daniel_ricciardo": "https://media.formula1.com/digital-assets/drivers/2025/RIC.jpg",
  "alex_albon": "https://media.formula1.com/digital-assets/drivers/2025/ALB.jpg",
  "logan_sargeant": "https://media.formula1.com/digital-assets/drivers/2025/SAR.jpg",
  "zhou_guanyu": "https://media.formula1.com/digital-assets/drivers/2025/ZHO.jpg",
  "valtteri_bottas": "https://media.formula1.com/digital-assets/drivers/2025/BOT.jpg",
  "nico_hulkenberg": "https://media.formula1.com/digital-assets/drivers/2025/HUL.jpg",
  "kevin_magnussen": "https://media.formula1.com/digital-assets/drivers/2025/MAG.jpg"
};


const fallbackData = {
  constructorStandings: [
    { position: 1, team: "Red Bull", points: 860 },
    { position: 2, team: "Mercedes", points: 409 },
    { position: 3, team: "Ferrari", points: 406 },
    { position: 4, team: "McLaren", points: 302 },
    { position: 5, team: "Aston Martin", points: 280 }
  ],
  driverP1: {
    name: "Max Verstappen",
    driverId: "max_verstappen",
    team: "Red Bull",
    points: 575
  }
};

export default async function handler(req, res) {
  try {
    const jolpiHeaders = {
      "X-RapidAPI-Key": process.env.JOLPI_API_KEY,
      "X-RapidAPI-Host": "jolpi.p.rapidapi.com"
    };

    const [cRes, dRes] = await Promise.all([
      fetch("https://jolpi.p.rapidapi.com/api/v1/f1/standings/constructors", { headers: jolpiHeaders }),
      fetch("https://jolpi.p.rapidapi.com/api/v1/f1/standings/drivers", { headers: jolpiHeaders })
    ]);

    const cJson = await cRes.json();
    const dJson = await dRes.json();

    const constructors = cJson?.data?.slice(0, 10).map(item => {
      const nm = item.team.name;
      const a = teamAssets[nm] || {};
      return {
        position: item.position,
        team: nm,
        points: item.points,
        logo: a.logo,
        car: a.car,
        color: a.color
      };
    });

    const dr = dJson?.data?.[0];
    const driverName = dr.driver.fullName;
    const driverTeam = dr.team.name;
    const driverId = dr.driver.id;
    const driverPoints = dr.points;
    const driverPhoto = driverPhotos[driverId] || null;
    const gradient = ["#000000", teamAssets[driverTeam]?.color || "#FFFFFF"];

    res.setHeader("Cache-Control", "s-maxage=3600");
    return res.status(200).json({
      driverP1: {
        name: driverName,
        photo: driverPhoto,
        team: driverTeam,
        points: driverPoints
      },
      backgroundGradient: gradient,
      standings: constructors,
      lastUpdated: new Date().toISOString(),
      dataSource: "jolpi"
    });

  } catch (e) {
    const team = fallbackData.driverP1.team;
    const gradient = ["#000000", teamAssets[team]?.color || "#FFFFFF"];
    res.status(200).json({
      driverP1: {
        name: fallbackData.driverP1.name,
        photo: driverPhotos[fallbackData.driverP1.driverId] || null,
        team,
        points: fallbackData.driverP1.points
      },
      backgroundGradient: gradient,
      standings: fallbackData.constructorStandings.map(item => {
        const a = teamAssets[item.team] || {};
        return { ...item, logo: a.logo, car: a.car, color: a.color };
      }),
      lastUpdated: new Date().toISOString(),
      dataSource: "fallback",
      warning: "Données non actualisées – problème de connexion API"
    });
  }
}
